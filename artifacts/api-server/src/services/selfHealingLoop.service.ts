/**
 * selfHealingLoop.service.ts
 * FIX 5.3 — Self-Healing Loop
 *
 * After a workflow JSON is generated, this service:
 *   1. Tries to import it to n8n (POST /api/v1/workflows)
 *   2. On failure: analyzes the n8n error with GPT-4o and fixes the JSON
 *   3. Retries up to maxAttempts (default: 3)
 *   4. Returns the healed workflow + n8n ID on success,
 *      or a clear error message with all attempt details on failure
 *
 * Flow:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │  Generated workflow JSON                                          │
 *   │     ↓                                                            │
 *   │  POST /api/v1/workflows  ──→  ✅ Success → return n8nId          │
 *   │     ↓ (on failure)                                               │
 *   │  GPT-4o analyzes error + fixes JSON                              │
 *   │     ↓                                                            │
 *   │  Retry (up to 3 times total)                                     │
 *   │     ↓ (all failed)                                               │
 *   │  Return clear error with per-attempt details                     │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Special cases:
 *   • N8N_NOT_CONFIGURED → exits immediately (no LLM waste)
 *   • LLM heal itself fails → keeps previous workflow JSON and continues
 *   • All attempts exhausted → success: false + finalError
 */

import OpenAI from "openai";
import { logger } from "../lib/logger";
import { getN8nConfig, sanitizeWorkflowSettings } from "./n8n.service";
import { sanitizeWorkflowJson, extractJson } from "./jsonValidator.service";
import type { Language } from "./promptBuilder.service";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MAX_ATTEMPTS = 3;
const GPT4O_PRICE = { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 };

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HealAttemptRecord {
  attempt: number;
  importError: string;
  llmFixApplied: boolean;
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
}

export interface SelfHealingResult {
  success: boolean;
  healedWorkflow: Record<string, unknown>;
  n8nWorkflowId?: string;
  attempts: HealAttemptRecord[];
  totalHealingMs: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
  };
  finalError?: string;
}

export interface SelfHealingConfig {
  openaiKey: string;
  openaiModel?: string;
  lang?: Language;
  maxAttempts?: number;
  onHealAttempt?: (event: HealAttemptEvent) => void;
  onHealSuccess?: (event: HealSuccessEvent) => void;
  onHealFail?: (event: HealFailEvent) => void;
}

export interface HealAttemptEvent {
  attempt: number;
  maxAttempts: number;
  importError: string;
}

export interface HealSuccessEvent {
  attempt: number;
  n8nWorkflowId: string;
  durationMs: number;
  wasHealed: boolean;
}

export interface HealFailEvent {
  totalAttempts: number;
  lastError: string;
  finalError: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Try importing to n8n
// ─────────────────────────────────────────────────────────────────────────────

async function tryImportToN8n(workflow: Record<string, unknown>): Promise<string> {
  const config = await getN8nConfig();
  if (!config) throw new Error("N8N_NOT_CONFIGURED");

  const workflowData = {
    name: (workflow.name as string) ?? "Imported Workflow",
    nodes: workflow.nodes ?? [],
    connections: workflow.connections ?? {},
    settings: sanitizeWorkflowSettings(workflow.settings),
    // NOTE: do NOT send `active` field — n8n API v1 treats it as read-only on POST
  };

  const res = await fetch(`${config.url}/api/v1/workflows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": config.apiKey,
    },
    body: JSON.stringify(workflowData),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string; error?: string; hint?: string };
      const raw = body.message ?? body.error ?? JSON.stringify(body);
      detail = body.hint ? `${raw} (hint: ${body.hint})` : raw;
    } catch { /* keep HTTP status */ }
    throw new Error(detail);
  }

  const created = (await res.json()) as { id?: string };
  if (!created.id) throw new Error("n8n returned no workflow ID");
  return String(created.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: GPT-4o analyzes n8n error and produces fixed workflow JSON
// ─────────────────────────────────────────────────────────────────────────────

async function healWithLLM(
  workflow: Record<string, unknown>,
  importError: string,
  openai: OpenAI,
  openaiModel: string,
  lang: Language
): Promise<{ healed: Record<string, unknown>; promptTokens: number; completionTokens: number }> {
  const workflowStr = JSON.stringify(workflow, null, 2).slice(0, 6000);

  const systemPrompt =
    lang === "ar"
      ? `أنت خبير إصلاح n8n workflow JSON. مهمتك: حلّل رسالة الخطأ من n8n بدقة وصحّح الـ workflow JSON.

قواعد الإصلاح:
1. حلّل رسالة الخطأ بعناية — افهم السبب الجذري قبل الإصلاح
2. أصلح فقط ما يسبب الخطأ المحدد — لا تغيّر ما هو صحيح
3. تأكد من أن كل node ID هو UUID فريد وصالح
4. تأكد أن connections تشير لأسماء nodes صحيحة وموجودة
5. تأكد من وجود typeVersion رقمي لكل node (عادةً 1 أو 2)
6. تأكد من وجود حقول name وnodes وconnections في الـ workflow
7. أرسل JSON فقط بدون أي نص إضافي`
      : `You are an expert n8n workflow JSON fixer. Your task: carefully analyze the n8n error and fix the workflow JSON.

Fixing rules:
1. Analyze the error carefully — understand the root cause before fixing
2. Fix ONLY what causes this specific error — don't touch what works
3. Ensure every node ID is a valid unique UUID
4. Ensure connections reference node names that actually exist in the nodes array
5. Ensure every node has a numeric typeVersion (usually 1 or 2)
6. Ensure the workflow has "name", "nodes", and "connections" fields
7. Respond with JSON only — no explanatory text`;

  const userPrompt =
    lang === "ar"
      ? `رسالة الخطأ من n8n:\n\`\`\`\n${importError}\n\`\`\`\n\nالـ Workflow الحالي:\n\`\`\`json\n${workflowStr}\n\`\`\`\n\nصحّح الـ JSON وأرسله كاملاً:`
      : `n8n error:\n\`\`\`\n${importError}\n\`\`\`\n\nCurrent workflow:\n\`\`\`json\n${workflowStr}\n\`\`\`\n\nReturn the complete corrected JSON:`;

  const response = await openai.chat.completions.create({
    model: openaiModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4500,
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
    logger.warn("selfHealingLoop.healWithLLM: JSON parse failed — keeping original");
  }

  return { healed, promptTokens, completionTokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public: Main Self-Healing Loop
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempts to import a workflow to n8n, using GPT-4o to fix errors and retry.
 *
 * @param workflow  The generated workflow JSON to import
 * @param config    Keys, model choice, max retries, and SSE event callbacks
 * @returns         SelfHealingResult — success status, healed workflow, token usage
 */
export async function runSelfHealingLoop(
  workflow: Record<string, unknown>,
  config: SelfHealingConfig
): Promise<SelfHealingResult> {
  const startTime = Date.now();
  const lang = config.lang ?? "ar";
  const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const openaiModel = config.openaiModel ?? "gpt-4o";

  const openai = new OpenAI({ apiKey: config.openaiKey, timeout: 60_000 });

  const attemptRecords: HealAttemptRecord[] = [];
  let currentWorkflow: Record<string, unknown> = { ...workflow };
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  logger.info(
    { maxAttempts, workflowName: workflow.name, openaiModel },
    "selfHealingLoop: starting"
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptStart = Date.now();

    // ── Try to import ────────────────────────────────────────────────────────
    try {
      const n8nId = await tryImportToN8n(currentWorkflow);
      const durationMs = Date.now() - attemptStart;

      logger.info({ attempt, n8nId, durationMs, wasHealed: attempt > 1 }, "selfHealingLoop: ✅ import succeeded");

      attemptRecords.push({
        attempt,
        importError: "",
        llmFixApplied: false,
        durationMs,
        promptTokens: 0,
        completionTokens: 0,
      });

      config.onHealSuccess?.({
        attempt,
        n8nWorkflowId: n8nId,
        durationMs: Date.now() - startTime,
        wasHealed: attempt > 1,
      });

      return {
        success: true,
        healedWorkflow: currentWorkflow,
        n8nWorkflowId: n8nId,
        attempts: attemptRecords,
        totalHealingMs: Date.now() - startTime,
        tokenUsage: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          estimatedCostUsd:
            totalPromptTokens * GPT4O_PRICE.input +
            totalCompletionTokens * GPT4O_PRICE.output,
        },
      };
    } catch (importErr) {
      const importError = importErr instanceof Error ? importErr.message : String(importErr);
      logger.warn({ attempt, importError }, "selfHealingLoop: import failed");

      // ── Special case: n8n not configured ────────────────────────────────
      if (importError === "N8N_NOT_CONFIGURED") {
        attemptRecords.push({
          attempt,
          importError,
          llmFixApplied: false,
          durationMs: Date.now() - attemptStart,
          promptTokens: 0,
          completionTokens: 0,
        });

        const finalError =
          lang === "ar"
            ? "لم يتم تكوين اتصال n8n. يرجى الذهاب للإعدادات وضبط رابط n8n ومفتاح API."
            : "n8n connection is not configured. Please go to Settings and set up the n8n URL and API key.";

        config.onHealFail?.({ totalAttempts: attempt, lastError: importError, finalError });

        return {
          success: false,
          healedWorkflow: currentWorkflow,
          attempts: attemptRecords,
          totalHealingMs: Date.now() - startTime,
          tokenUsage: { promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 },
          finalError,
        };
      }

      // ── Emit heal-attempt event ──────────────────────────────────────────
      config.onHealAttempt?.({ attempt, maxAttempts, importError });

      // ── Apply LLM fix if more retries remain ─────────────────────────────
      let llmFixApplied = false;
      let healPromptTokens = 0;
      let healCompletionTokens = 0;

      if (attempt < maxAttempts) {
        try {
          const healResult = await healWithLLM(
            currentWorkflow,
            importError,
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
          logger.info({ attempt, healPromptTokens, healCompletionTokens }, "selfHealingLoop: LLM fix applied — retrying");
        } catch (healErr) {
          logger.warn({ attempt, healErr }, "selfHealingLoop: LLM fix threw — keeping original for retry");
        }
      }

      attemptRecords.push({
        attempt,
        importError,
        llmFixApplied,
        durationMs: Date.now() - attemptStart,
        promptTokens: healPromptTokens,
        completionTokens: healCompletionTokens,
      });

      // ── Last attempt exhausted ───────────────────────────────────────────
      if (attempt === maxAttempts) {
        const finalError =
          lang === "ar"
            ? `فشل الاستيراد التلقائي بعد ${maxAttempts} محاولات. آخر خطأ من n8n: ${importError}\n\nيمكنك نسخ الـ workflow JSON وإدراجه يدوياً في n8n.`
            : `Auto-import failed after ${maxAttempts} attempts. Last n8n error: ${importError}\n\nYou can copy the workflow JSON and import it manually in n8n.`;

        config.onHealFail?.({ totalAttempts: maxAttempts, lastError: importError, finalError });

        logger.warn({ maxAttempts, importError }, "selfHealingLoop: ❌ all attempts exhausted");

        return {
          success: false,
          healedWorkflow: currentWorkflow,
          attempts: attemptRecords,
          totalHealingMs: Date.now() - startTime,
          tokenUsage: {
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            estimatedCostUsd:
              totalPromptTokens * GPT4O_PRICE.input +
              totalCompletionTokens * GPT4O_PRICE.output,
          },
          finalError,
        };
      }
    }
  }

  // Unreachable — TypeScript safety
  return {
    success: false,
    healedWorkflow: currentWorkflow,
    attempts: attemptRecords,
    totalHealingMs: Date.now() - startTime,
    tokenUsage: { promptTokens: totalPromptTokens, completionTokens: totalCompletionTokens, estimatedCostUsd: 0 },
    finalError: lang === "ar" ? "فشل الاستيراد" : "Import failed",
  };
}
