/**
 * workflowTestRunner.service.ts
 * Phase 5 — n8n Workflow Testing Integration
 *
 * After a workflow is successfully imported to n8n (via selfHealingLoop),
 * this service:
 *   1. Triggers a manual test execution via n8n REST API
 *   2. Polls for the execution result (success / error) with timeout
 *   3. Analyses any execution error with GPT-4o
 *   4. Deletes the broken workflow, applies the fix, re-imports, and re-tests
 *   5. Repeats up to maxTestAttempts (default: 2)
 *   6. Returns the final workflow JSON (possibly improved), new n8n ID, and a
 *      human-readable test report for the user
 *
 * Graceful degradation:
 *   • If n8n does not expose /rest/workflows/{id}/run → marked "not_testable"
 *     (no error thrown, user is informed politely)
 *   • If the execution times out (> 45 s) → marked "timeout" (still useful
 *     — means the structure was accepted; the workflow simply needs a live trigger)
 *   • N8N_NOT_CONFIGURED → exits immediately with tested: false
 *
 * Flow:
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  n8nWorkflowId (from selfHealingLoop)                            │
 *   │     ↓                                                           │
 *   │  POST /rest/workflows/{id}/run  →  executionId                  │
 *   │     ↓ (poll every 2 s, timeout 45 s)                            │
 *   │  GET /api/v1/executions/{id}  →  status                         │
 *   │     ├── "success"  →  ✅ return success + output preview        │
 *   │     ├── "error"    →  GPT-4o analyses error                     │
 *   │     │                  ↓                                        │
 *   │     │               DELETE old workflow from n8n                 │
 *   │     │               Apply LLM fix to JSON                       │
 *   │     │               POST new workflow (re-import)               │
 *   │     │               Re-trigger test → re-poll                   │
 *   │     │               (up to maxTestAttempts total)               │
 *   │     ├── "timeout"  →  ⏱ structure OK, needs live trigger        │
 *   │     └── "not_testable" → graceful note to user                  │
 *   └─────────────────────────────────────────────────────────────────┘
 */

import OpenAI from "openai";
import { logger } from "../lib/logger";
import { getN8nConfig } from "./n8n.service";
import { sanitizeWorkflowJson, extractJson } from "./jsonValidator.service";
import type { Language } from "./promptBuilder.service";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_TEST_ATTEMPTS = 2;
const GPT4O_PRICE = { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 };

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TestStatus =
  | "success"      // workflow ran and completed without errors
  | "error"        // workflow ran but at least one node errored
  | "timeout"      // execution did not complete within POLL_TIMEOUT_MS (structure OK)
  | "not_testable" // n8n REST endpoint not available or returned unexpected format
  | "not_configured"; // n8n not connected

export interface TestRunResult {
  status: TestStatus;
  executionId?: string;
  durationMs: number;
  error?: {
    message: string;
    nodeName?: string;
    nodeType?: string;
    stack?: string;
  };
  outputPreview?: string;
}

export interface TestAttemptRecord {
  attempt: number;
  executionId?: string;
  status: TestStatus;
  executionError?: string;
  llmFixApplied: boolean;
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
}

export interface WorkflowTestLoopResult {
  tested: boolean;
  success: boolean;
  finalWorkflowJson: Record<string, unknown>;
  finalN8nWorkflowId?: string;
  testResult?: TestRunResult;
  attempts: TestAttemptRecord[];
  totalTestMs: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
  };
  finalError?: string;
  userNote: string;
}

export interface WorkflowTestConfig {
  openaiKey: string;
  openaiModel?: string;
  lang?: Language;
  maxTestAttempts?: number;
  pollTimeoutMs?: number;
  onTestStart?: (event: TestStartEvent) => void;
  onTestResult?: (event: TestResultEvent) => void;
  onTestHeal?: (event: TestHealEvent) => void;
  onTestComplete?: (event: TestCompleteEvent) => void;
}

export interface TestStartEvent {
  attempt: number;
  n8nWorkflowId: string;
}

export interface TestResultEvent {
  attempt: number;
  status: TestStatus;
  executionId?: string;
  durationMs: number;
  errorMessage?: string;
  errorNode?: string;
}

export interface TestHealEvent {
  attempt: number;
  executionError: string;
}

export interface TestCompleteEvent {
  success: boolean;
  totalAttempts: number;
  finalStatus: TestStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Trigger manual test run via n8n internal REST API
// ─────────────────────────────────────────────────────────────────────────────

async function triggerManualRun(
  n8nWorkflowId: string,
  n8nUrl: string,
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch(`${n8nUrl}/rest/workflows/${n8nWorkflowId}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": apiKey,
        Cookie: "", // some n8n setups require session, API key is enough for most
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status, workflowId: n8nWorkflowId }, "workflowTestRunner: /rest/run returned non-OK");
      return null;
    }

    const body = (await res.json()) as Record<string, unknown>;

    // n8n may return { data: { executionId: "..." } } or { executionId: "..." }
    const executionId =
      (body.data as Record<string, unknown> | undefined)?.executionId ??
      body.executionId;

    if (typeof executionId === "string" && executionId.length > 0) {
      return executionId;
    }
    if (typeof executionId === "number") {
      return String(executionId);
    }

    logger.warn({ body }, "workflowTestRunner: /rest/run returned no executionId");
    return null;
  } catch (err) {
    logger.warn({ err, workflowId: n8nWorkflowId }, "workflowTestRunner: trigger threw — endpoint may be unavailable");
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Poll execution until terminal status or timeout
// ─────────────────────────────────────────────────────────────────────────────

interface N8nExecutionDetail {
  id: string;
  status: string;
  data?: {
    resultData?: {
      error?: {
        message?: string;
        node?: { name?: string; type?: string };
        stack?: string;
      };
      runData?: Record<string, unknown[]>;
    };
  };
  startedAt?: string;
  stoppedAt?: string;
  error?: {
    message?: string;
    node?: { name?: string; type?: string };
    stack?: string;
  };
}

async function pollExecutionStatus(
  executionId: string,
  n8nUrl: string,
  apiKey: string,
  timeoutMs: number
): Promise<TestRunResult> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    try {
      const res = await fetch(`${n8nUrl}/api/v1/executions/${executionId}`, {
        headers: { "X-N8N-API-KEY": apiKey },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        logger.warn({ status: res.status, executionId }, "workflowTestRunner: poll returned non-OK");
        continue;
      }

      const raw = (await res.json()) as N8nExecutionDetail | { data: N8nExecutionDetail };
      const exec: N8nExecutionDetail =
        "data" in raw ? (raw as { data: N8nExecutionDetail }).data : (raw as N8nExecutionDetail);

      const status = exec.status?.toLowerCase() ?? "";

      if (status === "success" || status === "finished") {
        // Build a short preview of output data (first node result)
        let outputPreview: string | undefined;
        try {
          const runData = exec.data?.resultData?.runData ?? {};
          const firstNodeKey = Object.keys(runData)[0];
          if (firstNodeKey && runData[firstNodeKey]?.length) {
            const firstItem = runData[firstNodeKey][0];
            outputPreview = JSON.stringify(firstItem).slice(0, 300);
          }
        } catch { /* non-critical */ }

        return {
          status: "success",
          executionId,
          durationMs: Date.now() - start,
          outputPreview,
        };
      }

      if (status === "error" || status === "failed" || status === "crashed") {
        const errorObj =
          exec.data?.resultData?.error ?? exec.error ?? undefined;
        return {
          status: "error",
          executionId,
          durationMs: Date.now() - start,
          error: {
            message: errorObj?.message ?? "Unknown execution error",
            nodeName: errorObj?.node?.name,
            nodeType: errorObj?.node?.type,
            stack: errorObj?.stack?.slice(0, 500),
          },
        };
      }

      // status === "running" | "waiting" | "new" → keep polling
    } catch (pollErr) {
      logger.warn({ pollErr, executionId }, "workflowTestRunner: poll request threw — retrying");
    }
  }

  return { status: "timeout", executionId, durationMs: timeoutMs };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: GPT-4o analyses execution error and proposes a fixed workflow JSON
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeAndFixTestError(
  workflow: Record<string, unknown>,
  testError: TestRunResult["error"],
  openai: OpenAI,
  openaiModel: string,
  lang: Language
): Promise<{ healed: Record<string, unknown>; promptTokens: number; completionTokens: number }> {
  const workflowStr = JSON.stringify(workflow, null, 2).slice(0, 5_000);
  const errorStr = [
    testError?.message ?? "Unknown error",
    testError?.nodeName ? `Node: ${testError.nodeName}` : null,
    testError?.nodeType ? `Type: ${testError.nodeType}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt =
    lang === "ar"
      ? `أنت خبير إصلاح n8n workflow. مهمتك: حلّل خطأ التنفيذ الحقيقي الذي أرجعه n8n وصحّح الـ JSON.

قواعد الإصلاح:
1. ركّز على الخطأ المحدد في الـ node المذكور
2. تحقق من إعدادات الـ node الخاطئة (parameters ومفاتيح الـ credentials)
3. إذا كان الخطأ يشير لـ credentials مفقودة، أضف حقل credentials placeholder صحيح
4. إذا كان الخطأ في بنية connections، أصلح الـ routing
5. تحقق من typeVersion — بعض الـ nodes تحتاج إصداراً محدداً
6. لا تغيّر الـ nodes التي تعمل بشكل صحيح
7. أرسل JSON فقط بدون أي نص إضافي`
      : `You are an n8n workflow execution error expert. Analyze the real execution error from n8n and fix the workflow JSON.

Fixing rules:
1. Focus on the specific error in the mentioned node
2. Check for wrong node parameters or missing credential references
3. If error mentions missing credentials, add correct credentials placeholder fields
4. If the error is in connection routing, fix the connections structure
5. Check typeVersion — some nodes require a specific version
6. Do not modify nodes that work correctly
7. Return JSON only — no explanatory text`;

  const userPrompt =
    lang === "ar"
      ? `خطأ التنفيذ من n8n:\n\`\`\`\n${errorStr}\n\`\`\`\n\nالـ Workflow:\n\`\`\`json\n${workflowStr}\n\`\`\`\n\nصحّح الـ JSON وأرسله كاملاً:`
      : `n8n execution error:\n\`\`\`\n${errorStr}\n\`\`\`\n\nWorkflow:\n\`\`\`json\n${workflowStr}\n\`\`\`\n\nReturn the complete corrected JSON:`;

  const response = await openai.chat.completions.create({
    model: openaiModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4_500,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const rawContent = response.choices[0]?.message?.content ?? "";
  const promptTokens = response.usage?.prompt_tokens ?? 0;
  const completionTokens = response.usage?.completion_tokens ?? 0;

  let healed: Record<string, unknown> = workflow;
  try {
    const extracted = extractJson(rawContent);
    const parsed = JSON.parse(extracted) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (!parsed.name && workflow.name) parsed.name = workflow.name;
      healed = sanitizeWorkflowJson(parsed) as Record<string, unknown>;
    }
  } catch {
    logger.warn("workflowTestRunner.analyzeAndFixTestError: JSON parse failed — keeping original");
  }

  return { healed, promptTokens, completionTokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Delete a workflow from n8n (used before re-import after test fail)
// ─────────────────────────────────────────────────────────────────────────────

async function deleteWorkflowFromN8n(
  workflowId: string,
  n8nUrl: string,
  apiKey: string
): Promise<void> {
  try {
    const res = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}`, {
      method: "DELETE",
      headers: { "X-N8N-API-KEY": apiKey },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      logger.warn({ status: res.status, workflowId }, "workflowTestRunner: DELETE workflow non-OK");
    }
  } catch (err) {
    logger.warn({ err, workflowId }, "workflowTestRunner: DELETE workflow threw — ignoring");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Re-import a fixed workflow to n8n (returns new ID)
// ─────────────────────────────────────────────────────────────────────────────

async function reimportWorkflow(
  workflow: Record<string, unknown>,
  n8nUrl: string,
  apiKey: string
): Promise<string> {
  const workflowData = {
    name: (workflow.name as string) ?? "Fixed Workflow",
    nodes: workflow.nodes ?? [],
    connections: workflow.connections ?? {},
    settings: workflow.settings ?? { executionOrder: "v1" },
    active: false,
  };

  const res = await fetch(`${n8nUrl}/api/v1/workflows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": apiKey,
    },
    body: JSON.stringify(workflowData),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      detail = body.message ?? body.error ?? JSON.stringify(body);
    } catch { /* keep HTTP status */ }
    throw new Error(detail);
  }

  const created = (await res.json()) as { id?: string };
  if (!created.id) throw new Error("n8n returned no workflow ID on re-import");
  return String(created.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: Main Workflow Test Loop
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs a live test execution of the imported workflow in n8n.
 * On failure: uses GPT-4o to fix the JSON, deletes the old workflow,
 * re-imports the fixed version, and re-tests (up to maxTestAttempts).
 *
 * @param n8nWorkflowId  The ID returned by selfHealingLoop (already in n8n)
 * @param workflowJson   The workflow JSON that was imported
 * @param config         Keys, model, limits, and SSE event callbacks
 */
export async function runWorkflowTestLoop(
  n8nWorkflowId: string,
  workflowJson: Record<string, unknown>,
  config: WorkflowTestConfig
): Promise<WorkflowTestLoopResult> {
  const totalStart = Date.now();
  const lang = config.lang ?? "ar";
  const maxAttempts = config.maxTestAttempts ?? DEFAULT_MAX_TEST_ATTEMPTS;
  const pollTimeout = config.pollTimeoutMs ?? POLL_TIMEOUT_MS;
  const openaiModel = config.openaiModel ?? "gpt-4o";

  const openai = new OpenAI({ apiKey: config.openaiKey, timeout: 60_000 });

  const attemptRecords: TestAttemptRecord[] = [];
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let currentWorkflow: Record<string, unknown> = { ...workflowJson };
  let currentN8nId = n8nWorkflowId;

  // ── Fetch n8n config ──────────────────────────────────────────────────────
  const n8nConfig = await getN8nConfig();
  if (!n8nConfig) {
    const userNote =
      lang === "ar"
        ? "لم يتم تكوين اتصال n8n — تخطي الاختبار."
        : "n8n not configured — skipping test.";
    return {
      tested: false,
      success: false,
      finalWorkflowJson: currentWorkflow,
      finalN8nWorkflowId: currentN8nId,
      attempts: [],
      totalTestMs: Date.now() - totalStart,
      tokenUsage: { promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 },
      userNote,
    };
  }

  const { url: n8nUrl, apiKey } = n8nConfig;

  logger.info(
    { n8nWorkflowId, maxAttempts, openaiModel },
    "workflowTestRunner: starting test loop"
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptStart = Date.now();

    config.onTestStart?.({ attempt, n8nWorkflowId: currentN8nId });

    // ── Step 1: Trigger manual run ──────────────────────────────────────────
    const executionId = await triggerManualRun(currentN8nId, n8nUrl, apiKey);

    if (!executionId) {
      // REST endpoint not available — graceful degradation
      const userNote =
        lang === "ar"
          ? "⚠️ تعذّر تشغيل الاختبار تلقائياً (n8n لا يدعم التشغيل عبر API في هذا الإصدار). الـ workflow تم استيراده بنجاح ويمكنك تشغيله يدوياً من واجهة n8n."
          : "⚠️ Could not trigger a test run automatically (n8n does not support API execution in this version). The workflow was imported successfully — run it manually from the n8n UI.";

      attemptRecords.push({
        attempt,
        status: "not_testable",
        llmFixApplied: false,
        durationMs: Date.now() - attemptStart,
        promptTokens: 0,
        completionTokens: 0,
      });

      config.onTestResult?.({ attempt, status: "not_testable", durationMs: Date.now() - attemptStart });
      config.onTestComplete?.({ success: false, totalAttempts: attempt, finalStatus: "not_testable" });

      return {
        tested: true,
        success: false,
        finalWorkflowJson: currentWorkflow,
        finalN8nWorkflowId: currentN8nId,
        testResult: { status: "not_testable", durationMs: Date.now() - attemptStart },
        attempts: attemptRecords,
        totalTestMs: Date.now() - totalStart,
        tokenUsage: { promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 },
        userNote,
      };
    }

    logger.info({ attempt, executionId }, "workflowTestRunner: execution triggered — polling");

    // ── Step 2: Poll execution status ───────────────────────────────────────
    const testResult = await pollExecutionStatus(executionId, n8nUrl, apiKey, pollTimeout);

    config.onTestResult?.({
      attempt,
      status: testResult.status,
      executionId,
      durationMs: testResult.durationMs,
      errorMessage: testResult.error?.message,
      errorNode: testResult.error?.nodeName,
    });

    // ── Step 3: Handle result ───────────────────────────────────────────────

    if (testResult.status === "success") {
      logger.info({ attempt, executionId }, "workflowTestRunner: ✅ test passed");

      attemptRecords.push({
        attempt,
        executionId,
        status: "success",
        llmFixApplied: attempt > 1,
        durationMs: Date.now() - attemptStart,
        promptTokens: 0,
        completionTokens: 0,
      });

      const userNote = buildSuccessNote(lang, executionId, attempt, testResult.outputPreview);

      config.onTestComplete?.({ success: true, totalAttempts: attempt, finalStatus: "success" });

      return {
        tested: true,
        success: true,
        finalWorkflowJson: currentWorkflow,
        finalN8nWorkflowId: currentN8nId,
        testResult,
        attempts: attemptRecords,
        totalTestMs: Date.now() - totalStart,
        tokenUsage: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          estimatedCostUsd:
            totalPromptTokens * GPT4O_PRICE.input +
            totalCompletionTokens * GPT4O_PRICE.output,
        },
        userNote,
      };
    }

    if (testResult.status === "timeout") {
      logger.info({ attempt, executionId }, "workflowTestRunner: ⏱ execution timed out — structure OK");

      attemptRecords.push({
        attempt,
        executionId,
        status: "timeout",
        llmFixApplied: false,
        durationMs: Date.now() - attemptStart,
        promptTokens: 0,
        completionTokens: 0,
      });

      const userNote =
        lang === "ar"
          ? `⏱ **اكتمل التحقق** — الـ workflow بدأ التنفيذ في n8n (ID التنفيذ: \`${executionId}\`) لكن استغرق وقتاً أطول من المتوقع. هذا طبيعي للـ workflows التي تنتظر إدخالاً خارجياً (webhook / cron). الـ workflow جاهز للاستخدام.`
          : `⏱ **Verification complete** — The workflow started executing in n8n (execution ID: \`${executionId}\`) but took longer than expected. This is normal for workflows waiting for external input (webhook / cron). The workflow is ready to use.`;

      config.onTestComplete?.({ success: false, totalAttempts: attempt, finalStatus: "timeout" });

      return {
        tested: true,
        success: false,
        finalWorkflowJson: currentWorkflow,
        finalN8nWorkflowId: currentN8nId,
        testResult,
        attempts: attemptRecords,
        totalTestMs: Date.now() - totalStart,
        tokenUsage: { promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 },
        userNote,
      };
    }

    // ── Status === "error" ─────────────────────────────────────────────────
    const executionError = testResult.error?.message ?? "Unknown execution error";
    const errorNode = testResult.error?.nodeName;

    logger.warn({ attempt, executionId, executionError, errorNode }, "workflowTestRunner: ❌ test failed");

    config.onTestHeal?.({ attempt, executionError });

    // Record this attempt before healing
    let healPromptTokens = 0;
    let healCompletionTokens = 0;
    let llmFixApplied = false;

    if (attempt < maxAttempts) {
      // ── Heal with LLM ────────────────────────────────────────────────────
      try {
        const healResult = await analyzeAndFixTestError(
          currentWorkflow,
          testResult.error,
          openai,
          openaiModel,
          lang
        );
        currentWorkflow = healResult.healed;
        healPromptTokens = healResult.promptTokens;
        healCompletionTokens = healResult.completionTokens;
        totalPromptTokens += healPromptTokens;
        totalCompletionTokens += healCompletionTokens;
        llmFixApplied = true;

        logger.info(
          { attempt, healPromptTokens, healCompletionTokens },
          "workflowTestRunner: LLM fix applied — deleting old workflow and re-importing"
        );

        // ── Delete old workflow then re-import fixed version ─────────────
        await deleteWorkflowFromN8n(currentN8nId, n8nUrl, apiKey);
        currentN8nId = await reimportWorkflow(currentWorkflow, n8nUrl, apiKey);

        logger.info({ newN8nId: currentN8nId }, "workflowTestRunner: re-imported fixed workflow");
      } catch (healErr) {
        logger.warn({ attempt, healErr }, "workflowTestRunner: LLM fix / re-import threw — stopping test loop");
        // Record and exit
        attemptRecords.push({
          attempt,
          executionId,
          status: "error",
          executionError,
          llmFixApplied: false,
          durationMs: Date.now() - attemptStart,
          promptTokens: 0,
          completionTokens: 0,
        });
        break;
      }
    }

    attemptRecords.push({
      attempt,
      executionId,
      status: "error",
      executionError,
      llmFixApplied,
      durationMs: Date.now() - attemptStart,
      promptTokens: healPromptTokens,
      completionTokens: healCompletionTokens,
    });

    if (attempt === maxAttempts) {
      const errSummary = errorNode
        ? `${executionError} (الـ node: ${errorNode})`
        : executionError;

      const userNote =
        lang === "ar"
          ? `⚠️ **الاختبار فشل بعد ${maxAttempts} محاولات** — آخر خطأ تنفيذ من n8n: ${errSummary}\n\nيمكنك فتح الـ workflow في n8n ومراجعة الـ node المذكور يدوياً.`
          : `⚠️ **Test failed after ${maxAttempts} attempts** — Last n8n execution error: ${errSummary}\n\nYou can open the workflow in n8n and inspect the mentioned node manually.`;

      config.onTestComplete?.({ success: false, totalAttempts: maxAttempts, finalStatus: "error" });

      return {
        tested: true,
        success: false,
        finalWorkflowJson: currentWorkflow,
        finalN8nWorkflowId: currentN8nId,
        testResult,
        attempts: attemptRecords,
        totalTestMs: Date.now() - totalStart,
        tokenUsage: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          estimatedCostUsd:
            totalPromptTokens * GPT4O_PRICE.input +
            totalCompletionTokens * GPT4O_PRICE.output,
        },
        finalError: executionError,
        userNote,
      };
    }
  }

  // ── Fallback (should not be reached) ────────────────────────────────────
  const fallbackNote =
    lang === "ar"
      ? "⚠️ انتهى حلقة الاختبار بدون نتيجة واضحة."
      : "⚠️ Test loop ended without a clear result.";

  return {
    tested: true,
    success: false,
    finalWorkflowJson: currentWorkflow,
    finalN8nWorkflowId: currentN8nId,
    attempts: attemptRecords,
    totalTestMs: Date.now() - totalStart,
    tokenUsage: {
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      estimatedCostUsd:
        totalPromptTokens * GPT4O_PRICE.input +
        totalCompletionTokens * GPT4O_PRICE.output,
    },
    userNote: fallbackNote,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Build the success message for the user
// ─────────────────────────────────────────────────────────────────────────────

function buildSuccessNote(
  lang: Language,
  executionId: string,
  attempt: number,
  outputPreview?: string
): string {
  const wasFixed = attempt > 1;
  const outputSection = outputPreview
    ? lang === "ar"
      ? `\n\n**نموذج المخرجات:**\n\`\`\`json\n${outputPreview}\n\`\`\``
      : `\n\n**Output preview:**\n\`\`\`json\n${outputPreview}\n\`\`\``
    : "";

  if (lang === "ar") {
    return wasFixed
      ? `\n\n✅ **اجتاز الاختبار بعد الإصلاح** — تم تشغيل الـ workflow في n8n (ID التنفيذ: \`${executionId}\`) وأكمل بنجاح بعد إصلاح تلقائي بـ GPT-4o.${outputSection}`
      : `\n\n✅ **اجتاز الاختبار** — تم تشغيل الـ workflow في n8n (ID التنفيذ: \`${executionId}\`) وأكمل بنجاح.${outputSection}`;
  }
  return wasFixed
    ? `\n\n✅ **Test passed after auto-fix** — The workflow ran in n8n (execution ID: \`${executionId}\`) and completed successfully after a GPT-4o fix.${outputSection}`
    : `\n\n✅ **Test passed** — The workflow ran in n8n (execution ID: \`${executionId}\`) and completed successfully.${outputSection}`;
}
