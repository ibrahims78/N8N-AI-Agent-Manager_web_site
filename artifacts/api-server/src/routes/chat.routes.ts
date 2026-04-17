import { Router } from "express";
import { db, conversationsTable, messagesTable, systemSettingsTable, generationSessionsTable, workflowVersionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { decryptApiKey } from "../services/encryption.service";
import { runSequentialEngine, type ConversationTurn } from "../services/sequentialEngine.service";
// FIX 5.1: Tool Calling Architecture — agenticEngine replaces sequential engine for PATH A
import { runAgenticEngine } from "../services/agenticEngine.service";
import { runWorkflowAnalyzer } from "../services/workflowAnalyzer.service";
import { runWorkflowModifier } from "../services/workflowModifier.service";
import { updateWorkflow, getWorkflowExecutionsWithErrors } from "../services/n8n.service";
import { getCachedWorkflows, getCachedWorkflow, invalidateWorkflowCache } from "../services/n8nCache.service";
import { detectIntent, findWorkflowNameHint, smartTruncateMessage } from "../services/intentDetector.service";
import {
  buildPhase1ASystemPrompt,
  buildPhase1AUserPrompt,
  buildPhase1BSystemPrompt,
  buildPhase1BUserPrompt,
  detectLanguage as detectLang,
} from "../services/promptBuilder.service";
import { validateWorkflowJson, sanitizeWorkflowJson, extractJson } from "../services/jsonValidator.service";
// FIX 4.5: Input sanitization against prompt injection
import { sanitizeUserInput } from "../services/inputSanitizer.service";
// FIX 5.3: Self-Healing Loop — auto-import to n8n with LLM-based error correction
import { runSelfHealingLoop } from "../services/selfHealingLoop.service";
// Phase 5: n8n Workflow Testing Integration — live test execution after import
import { runWorkflowTestLoop } from "../services/workflowTestRunner.service";
// FIX Phase 4: Persistent Memory — cross-session user context
import {
  buildMemoryContext,
  recordWorkflowCreated,
  updateLanguagePreference,
  syncN8nCredentials,
  extractNodeTypesFromWorkflow,
  extractWorkflowDescription,
} from "../services/agentMemory.service";
import { logger } from "../lib/logger";
import type { Request, Response } from "express";

const router = Router();

const ALLOWED_SETTINGS_KEYS = new Set([
  "executionOrder", "saveManualExecutions", "callerPolicy", "callerIds",
  "errorWorkflow", "timezone", "saveDataErrorExecution", "saveDataSuccessExecution",
  "executionTimeout", "saveExecutionProgress",
]);
function sanitizeSettings(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(([k]) => ALLOWED_SETTINGS_KEYS.has(k))
  );
}

// ─── [ج1] Session Memory: extract workflow names created in this conversation ──
// BUG 2 FIX: target root-level workflow "name" from JSON code blocks only,
//             not every "name" field (which includes node names like "Gmail Trigger")
function buildSessionSummary(messages: Array<{ role: string; content: string }>): string {
  const createdWorkflows: string[] = [];
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    // Look for ```json ... ``` code blocks that contain workflow JSON
    const codeBlockRegex = /```json\n([\s\S]*?)\n```/g;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(m.content)) !== null) {
      try {
        const parsed = JSON.parse(match[1]!) as { name?: string; nodes?: unknown[] };
        // Only accept if it has both a "name" string AND a "nodes" array — confirms it's a workflow
        if (
          typeof parsed.name === "string" &&
          parsed.name.length > 2 &&
          Array.isArray(parsed.nodes) &&
          !createdWorkflows.includes(parsed.name)
        ) {
          createdWorkflows.push(parsed.name);
        }
      } catch {
        // Not valid JSON — skip
      }
    }
  }
  if (createdWorkflows.length === 0) return "";
  return `\n\n[ملاحظة: في هذه المحادثة تم إنشاء/تعديل الـ workflows التالية: ${createdWorkflows.slice(0, 5).join("، ")}]`;
}

async function getApiKeys() {
  const settings = await db.select().from(systemSettingsTable).limit(1);
  const s = settings[0];
  if (!s) return { openaiKey: null, geminiKey: null };

  const openaiKey = s.openaiKeyEncrypted && s.openaiKeyIv
    ? decryptApiKey(s.openaiKeyEncrypted, s.openaiKeyIv)
    : process.env.OPENAI_API_KEY ?? null;

  const geminiKey = s.geminiKeyEncrypted && s.geminiKeyIv
    ? decryptApiKey(s.geminiKeyEncrypted, s.geminiKeyIv)
    : null;

  return { openaiKey, geminiKey };
}

// ─── Conversations CRUD ───────────────────────────────────────────────────────

router.get("/conversations", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || "20", 10)));
  const offset = (page - 1) * limit;

  const isAdmin = req.user.role === "admin";

  const allConversations = isAdmin
    ? await db.select().from(conversationsTable).orderBy(desc(conversationsTable.updatedAt))
    : await db.select().from(conversationsTable)
        .where(eq(conversationsTable.userId, req.user.userId))
        .orderBy(desc(conversationsTable.updatedAt));

  const total = allConversations.length;
  const conversations = allConversations.slice(offset, offset + limit);

  res.json({ success: true, data: { conversations, total, page, totalPages: Math.ceil(total / limit) } });
});

router.post("/conversations", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const { title, type, initialMessage } = req.body as { title?: string; type: string; initialMessage?: string };

  const [conv] = await db.insert(conversationsTable).values({
    userId: req.user.userId,
    title: title ?? "محادثة جديدة",
    type: type ?? "query",
    status: "active",
    messageCount: 0,
  }).returning();

  if (initialMessage && conv) {
    await db.insert(messagesTable).values({ conversationId: conv.id, role: "user", content: initialMessage });
    await db.update(conversationsTable).set({ messageCount: 1 }).where(eq(conversationsTable.id, conv.id));
  }

  res.json({ success: true, data: conv });
});

router.get("/conversations/:id", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const convs = await db.select().from(conversationsTable).where(eq(conversationsTable.id, convId)).limit(1);
  const conv = convs[0];
  if (!conv) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } }); return; }

  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, convId)).orderBy(messagesTable.createdAt);
  res.json({ success: true, data: { conversation: conv, messages } });
});

router.put("/conversations/:id", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { title } = req.body as { title?: string };
  if (!title?.trim()) { res.status(400).json({ success: false, error: { code: "MISSING_TITLE", message: "Title is required" } }); return; }

  const [updated] = await db.update(conversationsTable)
    .set({ title: title.trim(), updatedAt: new Date() })
    .where(eq(conversationsTable.id, convId))
    .returning();

  if (!updated) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } }); return; }
  res.json({ success: true, data: updated });
});

router.delete("/conversations/:id", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  await db.delete(conversationsTable).where(eq(conversationsTable.id, convId));
  res.json({ success: true, message: "Conversation deleted" });
});

// ─── SSE: Real-time workflow generation & chat ────────────────────────────────
router.post("/conversations/:id/generate", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const rawContent = (req.body as { content?: string }).content;
  if (!rawContent) { res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Content required" } }); return; }

  // FIX 4.5: Sanitize input before any LLM interaction
  const sanitized = sanitizeUserInput(rawContent);
  if (sanitized.injectionDetected) {
    logger.warn(
      { convId, warnings: sanitized.warnings, userId: req.user?.userId },
      "Prompt injection attempt blocked in generate endpoint"
    );
  }
  const content = sanitized.safe;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
      (res as unknown as { flush: () => void }).flush();
    }
  };

  const isArabic = /[\u0600-\u06FF]/.test(content);
  const lang = isArabic ? "ar" : "en";

  // ── Immediate acknowledgment — shows typing indicator to user instantly ──
  sendEvent("thinking", {
    message: lang === "ar" ? "استلمت طلبك، جاري التحليل..." : "Got your request, analyzing...",
  });

  try {
    // BUG 3 FIX: INSERT must complete before SELECT to guarantee the user's message
    // appears in previousMessages (race condition when both ran in Promise.all).
    await db.insert(messagesTable).values({ conversationId: convId, role: "user", content });

    const userId = req.user.userId;

    // FIX 4.2: Parallelize all independent pre-generation fetches in one Promise.all:
    // FIX Phase 4: added buildMemoryContext + syncN8nCredentials (persistent memory)
    const [{ openaiKey, geminiKey }, previousMessages, availableWorkflows, memoryContext] =
      await Promise.all([
        getApiKeys(),
        db.select().from(messagesTable)
          .where(eq(messagesTable.conversationId, convId))
          .orderBy(desc(messagesTable.createdAt))
          .limit(20),
        getCachedWorkflows().catch(() => {
          logger.warn("Could not fetch n8n workflows — continuing without");
          return [] as Array<{ id: string; name: string; active: boolean }>;
        }),
        // FIX Phase 4: load persistent user memory (non-blocking — fails silently)
        (async () => {
          try {
            // Fire-and-forget credential sync (respects 1h TTL internally)
            syncN8nCredentials(userId).catch(() => {});
            return await buildMemoryContext(userId, lang);
          } catch {
            return "";
          }
        })(),
      ]);

    // FIX Phase 4: update preferred language in background (non-blocking)
    updateLanguagePreference(userId, lang).catch(() => {});

    if (!openaiKey) {
      sendEvent("error", {
        message: lang === "ar"
          ? "⚠️ مفتاح OpenAI غير مضبوط.\n\n**للإصلاح:** اذهب إلى ⚙️ الإعدادات → OpenAI وأضف مفتاحك."
          : "⚠️ OpenAI key is not configured.\n\n**To fix:** Go to ⚙️ Settings → OpenAI and add your key.",
      });
      res.end();
      return;
    }

    const messageCount = previousMessages.length;

    // ── LLM-based intent detection ─────────────────────────────────────────
    const intentResult = await detectIntent(content, availableWorkflows.map(w => w.name), openaiKey);
    const { intent, workflowNameHint } = intentResult;
    logger.info({ intent, confidence: intentResult.confidence, hint: workflowNameHint }, "Intent detected");

    // ══════════════════════════════════════════════════════════════════════
    // PATH A: CREATE — FIX 5.1 Agentic Engine (GPT-4o Tool Calling + Gemini)
    //
    // The agenticEngine replaces the static Phase 1A→1B pipeline.
    // GPT-4o now dynamically:
    //   1. Calls get_node_schema for each node it needs
    //   2. Calls list_available_workflows to avoid duplication
    //   3. Calls validate_workflow_json before finalising
    //   4. Self-corrects if validation finds errors
    // Gemini 2.5 Pro reviews the result and triggers refinement if needed.
    // ══════════════════════════════════════════════════════════════════════
    if (intent === "create" && geminiKey) {
      sendEvent("start", { type: "agentic", engine: "tool-calling" });

      // Build n8n context string (list of existing workflow names)
      const n8nContextStr = availableWorkflows.length > 0
        ? availableWorkflows.slice(0, 20).map(w =>
            `- "${w.name}" (${w.active ? "active" : "inactive"})`
          ).join("\n")
        : undefined;

      // Build conversation history (chronological, max 6 turns)
      const conversationHistory: ConversationTurn[] = previousMessages
        .slice()
        .reverse()
        .filter((m) => m.content !== content)
        .slice(-12)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      // FIX 5.1: Run the agentic engine
      // FIX Phase 4: pass persistent memory context
      const agentResult = await runAgenticEngine(content, {
        openaiKey,
        geminiKey,
        maxIterations: 10,
        qualityThreshold: 75,
        n8nContext: n8nContextStr,
        memoryContext: memoryContext || undefined,
        conversationHistory,

        // SSE: each tool call the agent makes
        onToolCall: (ev) =>
          sendEvent("agent_tool_call", {
            iteration: ev.iteration,
            tool: ev.toolName,
            args: ev.args,
          }),

        // SSE: tool execution result
        onToolResult: (ev) =>
          sendEvent("agent_tool_result", {
            iteration: ev.iteration,
            tool: ev.toolName,
            durationMs: ev.durationMs,
            success: ev.success,
          }),

        // SSE: iteration complete summary
        onIterationDone: (ev) =>
          sendEvent("agent_iteration", {
            iteration: ev.iteration,
            toolCalls: ev.toolCallsInIteration,
            totalTools: ev.totalToolCallsSoFar,
            durationMs: ev.durationMs,
          }),

        // SSE: Gemini review phase
        onGeminiPhase: (phase, score) =>
          sendEvent("agent_review", { phase, score }),
      });

      // ── FIX 5.3: Self-Healing Loop ──────────────────────────────────────────
      // After the agentic engine generates the workflow JSON, automatically
      // try to import it to n8n. If n8n rejects it, GPT-4o analyzes the error
      // and fixes the JSON, then retries (up to 3 times total).
      let selfHealingResult: Awaited<ReturnType<typeof runSelfHealingLoop>> | null = null;
      if (agentResult.success && agentResult.workflowJson) {
        try {
          selfHealingResult = await runSelfHealingLoop(agentResult.workflowJson, {
            openaiKey,
            lang: agentResult.lang,
            maxAttempts: 3,

            // SSE: before each LLM fix attempt
            onHealAttempt: (ev) =>
              sendEvent("self_heal_attempt", {
                attempt: ev.attempt,
                maxAttempts: ev.maxAttempts,
                importError: ev.importError,
              }),

            // SSE: import succeeded (possibly after healing)
            onHealSuccess: (ev) =>
              sendEvent("self_heal_success", {
                attempt: ev.attempt,
                n8nWorkflowId: ev.n8nWorkflowId,
                durationMs: ev.durationMs,
                wasHealed: ev.wasHealed,
              }),

            // SSE: all attempts exhausted
            onHealFail: (ev) =>
              sendEvent("self_heal_fail", {
                totalAttempts: ev.totalAttempts,
                lastError: ev.lastError,
                finalError: ev.finalError,
              }),
          });

          // If healing produced a better workflow, use it as the final version
          if (selfHealingResult.success && selfHealingResult.healedWorkflow) {
            agentResult.workflowJson = selfHealingResult.healedWorkflow;
          }

          logger.info(
            {
              healSuccess: selfHealingResult.success,
              n8nWorkflowId: selfHealingResult.n8nWorkflowId,
              healAttempts: selfHealingResult.attempts.length,
              healingMs: selfHealingResult.totalHealingMs,
            },
            "FIX 5.3: Self-healing loop completed"
          );
        } catch (healErr) {
          logger.warn({ healErr }, "FIX 5.3: Self-healing loop threw unexpectedly — continuing without it");
        }
      }

      // ── Phase 5: n8n Workflow Testing Integration ────────────────────────
      // Only runs when self-healing succeeded (i.e., we have a live n8n workflow ID).
      // Triggers a real test execution, polls the result, and auto-fixes on failure.
      let testLoopResult: Awaited<ReturnType<typeof runWorkflowTestLoop>> | null = null;
      if (selfHealingResult?.success && selfHealingResult.n8nWorkflowId && agentResult.workflowJson) {
        try {
          sendEvent("workflow_test_start", {
            n8nWorkflowId: selfHealingResult.n8nWorkflowId,
            workflowName: (agentResult.workflowJson.name as string | undefined) ?? "Workflow",
          });

          testLoopResult = await runWorkflowTestLoop(
            selfHealingResult.n8nWorkflowId,
            agentResult.workflowJson,
            {
              openaiKey,
              lang: agentResult.lang,
              maxTestAttempts: 2,

              onTestStart: (ev) => sendEvent("workflow_test_trigger", {
                attempt: ev.attempt,
                n8nWorkflowId: ev.n8nWorkflowId,
              }),

              onTestResult: (ev) => sendEvent("workflow_test_result", {
                attempt: ev.attempt,
                status: ev.status,
                executionId: ev.executionId,
                durationMs: ev.durationMs,
                errorMessage: ev.errorMessage,
                errorNode: ev.errorNode,
              }),

              onTestHeal: (ev) => sendEvent("workflow_test_heal", {
                attempt: ev.attempt,
                executionError: ev.executionError,
              }),

              onTestComplete: (ev) => sendEvent("workflow_test_complete", {
                success: ev.success,
                totalAttempts: ev.totalAttempts,
                finalStatus: ev.finalStatus,
              }),
            }
          );

          // If the test loop improved the workflow or changed the n8n ID, sync back
          if (testLoopResult.finalWorkflowJson) {
            agentResult.workflowJson = testLoopResult.finalWorkflowJson;
          }

          logger.info(
            {
              tested: testLoopResult.tested,
              testSuccess: testLoopResult.success,
              finalN8nId: testLoopResult.finalN8nWorkflowId,
              testAttempts: testLoopResult.attempts.length,
              testMs: testLoopResult.totalTestMs,
            },
            "Phase 5: Workflow test loop completed"
          );
        } catch (testErr) {
          logger.warn({ testErr }, "Phase 5: Test loop threw unexpectedly — continuing without test result");
        }
      }

      let assistantContent = agentResult.userMessage;

      // Append self-healing status to the assistant message
      if (selfHealingResult) {
        if (selfHealingResult.success) {
          const wasHealed = selfHealingResult.attempts.length > 1 || selfHealingResult.attempts.some(a => a.llmFixApplied);
          const healNote =
            agentResult.lang === "ar"
              ? wasHealed
                ? `\n\n🔧 **تم الإصلاح والاستيراد التلقائي** — تم اكتشاف خطأ في الـ workflow وإصلاحه تلقائياً بـ GPT-4o وإدراجه في n8n (ID: \`${selfHealingResult.n8nWorkflowId}\`).`
                : `\n\n✅ **تم الاستيراد التلقائي** — تم إدراج الـ workflow مباشرة في n8n (ID: \`${selfHealingResult.n8nWorkflowId}\`).`
              : wasHealed
                ? `\n\n🔧 **Auto-imported after self-healing** — An error was detected, automatically fixed by GPT-4o, and imported to n8n (ID: \`${selfHealingResult.n8nWorkflowId}\`).`
                : `\n\n✅ **Auto-imported to n8n** — Workflow imported successfully (ID: \`${selfHealingResult.n8nWorkflowId}\`).`;
          assistantContent += healNote;
        } else if (selfHealingResult.finalError && !selfHealingResult.finalError.includes("N8N_NOT_CONFIGURED")) {
          const failNote =
            agentResult.lang === "ar"
              ? `\n\n⚠️ **فشل الاستيراد التلقائي** — ${selfHealingResult.finalError}`
              : `\n\n⚠️ **Auto-import failed** — ${selfHealingResult.finalError}`;
          assistantContent += failNote;
        }
      }

      // Append Phase 5 test result note
      if (testLoopResult?.tested) {
        assistantContent += testLoopResult.userNote;
      }

      if (agentResult.workflowJson) {
        assistantContent += `\n\n\`\`\`json\n${JSON.stringify(agentResult.workflowJson, null, 2)}\n\`\`\``;

        // FIX Phase 4: Record this workflow in persistent memory
        const workflowName =
          (agentResult.workflowJson.name as string | undefined) ??
          "Unnamed Workflow";
        const n8nId = testLoopResult?.finalN8nWorkflowId ?? selfHealingResult?.n8nWorkflowId ?? `local-${Date.now()}`;
        recordWorkflowCreated(userId, {
          n8nId,
          name: workflowName,
          description: extractWorkflowDescription(agentResult.workflowJson, content),
          nodeTypes: extractNodeTypesFromWorkflow(agentResult.workflowJson),
          qualityScore: Math.round(agentResult.qualityScore),
          tags: ["agentic", agentResult.lang],
        }).catch(() => {});

        try {
          await db.insert(generationSessionsTable).values({
            conversationId: convId,
            userRequest: content,
            phase1Result: agentResult.workflowJson,
            phase2Feedback: agentResult.geminiReview ?? "",
            phase3Result: agentResult.workflowJson,
            phase4Approved: agentResult.qualityScore >= 75,
            roundsCount: agentResult.iterations,
            totalTimeMs: agentResult.totalTimeMs,
            finalWorkflowJson: agentResult.workflowJson,
            qualityScore: agentResult.qualityScore,
            qualityReport: JSON.stringify({
              grade: agentResult.qualityGrade,
              engine: "agentic-tool-calling",
              toolCalls: agentResult.toolCallLog.length,
              selfHealing: selfHealingResult
                ? {
                    success: selfHealingResult.success,
                    attempts: selfHealingResult.attempts.length,
                    n8nWorkflowId: selfHealingResult.n8nWorkflowId,
                  }
                : null,
              workflowTest: testLoopResult
                ? {
                    tested: testLoopResult.tested,
                    success: testLoopResult.success,
                    finalStatus: testLoopResult.testResult?.status,
                    attempts: testLoopResult.attempts.length,
                    finalN8nWorkflowId: testLoopResult.finalN8nWorkflowId,
                  }
                : null,
            }),
          });
        } catch (err) {
          logger.error({ err }, "Failed to save agentic generation session");
        }
      }

      const [assistantMsg] = await db.insert(messagesTable).values({
        conversationId: convId,
        role: "assistant",
        content: assistantContent,
        modelUsed: "agentic-gpt4o-tool-calling+gemini",
      }).returning();

      await db.update(conversationsTable)
        .set({ messageCount: messageCount + 1, updatedAt: new Date(), type: "create" })
        .where(eq(conversationsTable.id, convId));

      sendEvent("complete", {
        message: assistantMsg,
        workflowJson: agentResult.workflowJson,
        qualityScore: agentResult.qualityScore,
        qualityGrade: agentResult.qualityGrade,
        iterations: agentResult.iterations,
        toolCallLog: agentResult.toolCallLog,
        totalTimeMs: agentResult.totalTimeMs,
        isWorkflowCreation: true,
        engine: "agentic",
        // FIX 4.4: token usage summary
        tokenUsage: agentResult.tokenUsage,
        // FIX 5.3: self-healing result summary
        selfHealing: selfHealingResult
          ? {
              success: selfHealingResult.success,
              n8nWorkflowId: selfHealingResult.n8nWorkflowId,
              attempts: selfHealingResult.attempts.length,
              totalHealingMs: selfHealingResult.totalHealingMs,
              healTokenUsage: selfHealingResult.tokenUsage,
            }
          : null,
        // Phase 5: workflow test result summary
        workflowTest: testLoopResult
          ? {
              tested: testLoopResult.tested,
              success: testLoopResult.success,
              finalStatus: testLoopResult.testResult?.status,
              finalN8nWorkflowId: testLoopResult.finalN8nWorkflowId,
              attempts: testLoopResult.attempts.length,
              totalTestMs: testLoopResult.totalTestMs,
              testTokenUsage: testLoopResult.tokenUsage,
            }
          : null,
      });

    // ══════════════════════════════════════════════════════════════════════
    // PATH A2: CREATE — GPT-4o only (no Gemini key)
    // FIX 3.5: Now uses the same Phase 1A (node analysis) + Phase 1B (schema-
    //          injected generation) pipeline instead of a bare single prompt.
    //          This brings PATH A2 to near-parity with PATH A quality-wise.
    // ══════════════════════════════════════════════════════════════════════
    } else if (intent === "create" && !geminiKey) {
      const a2Lang = detectLang(content);
      sendEvent("start", { type: "gpt-only" });
      sendEvent("phase", {
        phase: 1,
        label: "GPT-4o: Analyzing nodes",
        labelAr: "GPT-4o: تحليل الـ nodes المطلوبة",
        status: "running",
      });

      try {
        const OpenAILib = (await import("openai")).default;
        const openai = new OpenAILib({ apiKey: openaiKey, timeout: 90000 });
        const a2Start = Date.now();

        // Step 1A — identify required nodes
        let nodeAnalysis = "";
        try {
          const a2NodeResp = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: buildPhase1ASystemPrompt() },
              { role: "user", content: buildPhase1AUserPrompt(content) },
            ],
            max_tokens: 500,
            temperature: 0.1,
            response_format: { type: "json_object" },
          });
          nodeAnalysis = a2NodeResp.choices[0]?.message?.content ?? "";
        } catch (nodeErr) {
          logger.warn({ nodeErr }, "PATH A2: Phase 1A failed — falling back to direct generation");
        }

        sendEvent("phase", {
          phase: 1,
          label: "GPT-4o: Building workflow with schemas",
          labelAr: "GPT-4o: بناء الـ workflow بـ schemas دقيقة",
          status: "running",
          durationMs: Date.now() - a2Start,
        });

        // Step 1B — build full workflow with injected schemas + n8n context
        const a2ContextStr = availableWorkflows.length > 0
          ? availableWorkflows.slice(0, 15).map(w => `- "${w.name}" (${w.active ? "active" : "inactive"})`).join("\n")
          : undefined;

        // FIX 3.4 (also in PATH A2): include conversation history
        const a2History: Array<{ role: "user" | "assistant"; content: string }> = previousMessages
          .slice()
          .reverse()
          .filter((m) => m.content !== content)
          .slice(-12)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 1200) }));

        let workflowJsonStr = "{}";
        // FIX 4.4: track tokens for PATH A2
        let a2Tokens = { promptTokens: 0, completionTokens: 0 };
        if (nodeAnalysis) {
          // FIX 4.1: stream Phase 1B in PATH A2 as well
          const a2Stream = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: buildPhase1BSystemPrompt(content, a2Lang) },
              ...a2History,
              { role: "user", content: buildPhase1BUserPrompt(content, nodeAnalysis, a2Lang, a2ContextStr) },
            ],
            max_tokens: 3500,
            temperature: 0.2,
            response_format: { type: "json_object" },
            stream: true,
            stream_options: { include_usage: true },
          });
          let a2Accumulated = "";
          for await (const chunk of a2Stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              a2Accumulated += delta;
              sendEvent("phase1b_stream", { chunk: delta });
            }
            if (chunk.usage) {
              a2Tokens.promptTokens = chunk.usage.prompt_tokens ?? 0;
              a2Tokens.completionTokens = chunk.usage.completion_tokens ?? 0;
            }
          }
          workflowJsonStr = a2Accumulated || "{}";
        } else {
          // Fallback: direct generation (better prompt than before)
          const a2FallbackResp = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: a2Lang === "ar"
                  ? "أنت خبير متخصص في بناء n8n workflows. أنشئ workflow JSON كامل وصالح للاستيراد في n8n.\nيجب أن يحتوي على: name, nodes (array مع id, name, type, typeVersion, position, parameters), connections (object), settings ({executionOrder: 'v1'}).\nلا تضف أي نص خارج JSON."
                  : "You are a specialist in building n8n workflows. Create a complete, valid workflow JSON ready for import in n8n.\nMust include: name, nodes (array with id, name, type, typeVersion, position, parameters), connections (object), settings ({executionOrder: 'v1'}).\nReturn JSON only.",
              },
              ...a2History,
              { role: "user", content },
            ],
            max_tokens: 3500,
            temperature: 0.25,
            response_format: { type: "json_object" },
          });
          workflowJsonStr = a2FallbackResp.choices[0]?.message?.content ?? "{}";
          a2Tokens.promptTokens = a2FallbackResp.usage?.prompt_tokens ?? 0;
          a2Tokens.completionTokens = a2FallbackResp.usage?.completion_tokens ?? 0;
        }
        const a2EstimatedCost = (
          (a2Tokens.promptTokens / 1_000_000) * 2.5 +
          (a2Tokens.completionTokens / 1_000_000) * 10
        ).toFixed(6);

        // Validate and sanitize
        let parsed: Record<string, unknown> | null = null;
        const a2Validation = validateWorkflowJson(workflowJsonStr);
        if (a2Validation.valid && a2Validation.parsedJson) {
          parsed = sanitizeWorkflowJson(a2Validation.parsedJson) as Record<string, unknown>;
          workflowJsonStr = JSON.stringify(parsed, null, 2);
        } else {
          try {
            parsed = JSON.parse(extractJson(workflowJsonStr)) as Record<string, unknown>;
          } catch { parsed = null; }
        }

        sendEvent("phase", { phase: 1, status: "done", durationMs: Date.now() - a2Start });

        // ── FIX 5.3: Self-Healing Loop for PATH A2 ────────────────────────
        let a2HealResult: Awaited<ReturnType<typeof runSelfHealingLoop>> | null = null;
        if (parsed) {
          try {
            a2HealResult = await runSelfHealingLoop(parsed, {
              openaiKey,
              lang: a2Lang,
              maxAttempts: 3,
              onHealAttempt: (ev) =>
                sendEvent("self_heal_attempt", {
                  attempt: ev.attempt,
                  maxAttempts: ev.maxAttempts,
                  importError: ev.importError,
                }),
              onHealSuccess: (ev) =>
                sendEvent("self_heal_success", {
                  attempt: ev.attempt,
                  n8nWorkflowId: ev.n8nWorkflowId,
                  durationMs: ev.durationMs,
                  wasHealed: ev.wasHealed,
                }),
              onHealFail: (ev) =>
                sendEvent("self_heal_fail", {
                  totalAttempts: ev.totalAttempts,
                  lastError: ev.lastError,
                  finalError: ev.finalError,
                }),
            });
            if (a2HealResult.success && a2HealResult.healedWorkflow) {
              parsed = a2HealResult.healedWorkflow;
              workflowJsonStr = JSON.stringify(parsed, null, 2);
            }
          } catch (healErr) {
            logger.warn({ healErr }, "PATH A2: self-healing loop threw — continuing without it");
          }
        }

        // ── Phase 5: n8n Workflow Testing Integration (PATH A2) ─────────────
        let a2TestResult: Awaited<ReturnType<typeof runWorkflowTestLoop>> | null = null;
        if (a2HealResult?.success && a2HealResult.n8nWorkflowId && parsed) {
          try {
            sendEvent("workflow_test_start", {
              n8nWorkflowId: a2HealResult.n8nWorkflowId,
              workflowName: (parsed.name as string | undefined) ?? "Workflow",
            });

            a2TestResult = await runWorkflowTestLoop(
              a2HealResult.n8nWorkflowId,
              parsed,
              {
                openaiKey,
                lang: a2Lang,
                maxTestAttempts: 2,
                onTestStart: (ev) => sendEvent("workflow_test_trigger", {
                  attempt: ev.attempt,
                  n8nWorkflowId: ev.n8nWorkflowId,
                }),
                onTestResult: (ev) => sendEvent("workflow_test_result", {
                  attempt: ev.attempt,
                  status: ev.status,
                  executionId: ev.executionId,
                  durationMs: ev.durationMs,
                  errorMessage: ev.errorMessage,
                  errorNode: ev.errorNode,
                }),
                onTestHeal: (ev) => sendEvent("workflow_test_heal", {
                  attempt: ev.attempt,
                  executionError: ev.executionError,
                }),
                onTestComplete: (ev) => sendEvent("workflow_test_complete", {
                  success: ev.success,
                  totalAttempts: ev.totalAttempts,
                  finalStatus: ev.finalStatus,
                }),
              }
            );

            if (a2TestResult.finalWorkflowJson) {
              parsed = a2TestResult.finalWorkflowJson;
              workflowJsonStr = JSON.stringify(parsed, null, 2);
            }

            logger.info(
              { tested: a2TestResult.tested, testSuccess: a2TestResult.success },
              "Phase 5 (PATH A2): Workflow test loop completed"
            );
          } catch (testErr) {
            logger.warn({ testErr }, "Phase 5 (PATH A2): Test loop threw — continuing without test result");
          }
        }

        const noGeminiNote = a2Lang === "ar"
          ? "\n\n⚠️ *ملاحظة: مفتاح Gemini غير مضبوط — تم استخدام GPT-4o مع Node Schemas للحصول على أفضل جودة ممكنة.*"
          : "\n\n⚠️ *Note: Gemini key not configured — GPT-4o used with Node Schemas for best possible quality.*";

        let a2AssistantContent = (a2Lang === "ar"
          ? "✅ تم إنشاء الـ workflow (GPT-4o + Node Schemas):\n\n"
          : "✅ Workflow created (GPT-4o + Node Schemas):\n\n") +
          `\`\`\`json\n${workflowJsonStr}\n\`\`\`` + noGeminiNote;

        if (a2HealResult) {
          if (a2HealResult.success) {
            const wasHealed = a2HealResult.attempts.some(a => a.llmFixApplied);
            a2AssistantContent += a2Lang === "ar"
              ? wasHealed
                ? `\n\n🔧 **تم الإصلاح والاستيراد التلقائي** — تم إدراج الـ workflow في n8n بعد الإصلاح (ID: \`${a2HealResult.n8nWorkflowId}\`).`
                : `\n\n✅ **تم الاستيراد التلقائي** — تم إدراج الـ workflow في n8n (ID: \`${a2HealResult.n8nWorkflowId}\`).`
              : wasHealed
                ? `\n\n🔧 **Auto-imported after self-healing** — Workflow fixed and imported to n8n (ID: \`${a2HealResult.n8nWorkflowId}\`).`
                : `\n\n✅ **Auto-imported to n8n** — Workflow imported successfully (ID: \`${a2HealResult.n8nWorkflowId}\`).`;
          } else if (a2HealResult.finalError && !a2HealResult.finalError.includes("N8N_NOT_CONFIGURED")) {
            a2AssistantContent += a2Lang === "ar"
              ? `\n\n⚠️ **فشل الاستيراد التلقائي** — ${a2HealResult.finalError}`
              : `\n\n⚠️ **Auto-import failed** — ${a2HealResult.finalError}`;
          }
        }

        // Append Phase 5 test result note
        if (a2TestResult?.tested) {
          a2AssistantContent += a2TestResult.userNote;
        }

        // FIX Phase 4: Record workflow in persistent memory (PATH A2)
        if (parsed) {
          const a2WorkflowName = (parsed.name as string | undefined) ?? "Unnamed Workflow";
          const a2N8nId = a2TestResult?.finalN8nWorkflowId ?? a2HealResult?.n8nWorkflowId ?? `local-${Date.now()}`;
          recordWorkflowCreated(userId, {
            n8nId: a2N8nId,
            name: a2WorkflowName,
            description: extractWorkflowDescription(parsed, content),
            nodeTypes: extractNodeTypesFromWorkflow(parsed),
            qualityScore: 72,
            tags: ["gpt-only", a2Lang],
          }).catch(() => {});
        }

        const [assistantMsg] = await db.insert(messagesTable).values({
          conversationId: convId,
          role: "assistant",
          content: a2AssistantContent,
          modelUsed: "gpt-4o",
        }).returning();

        await db.update(conversationsTable)
          .set({ messageCount: messageCount + 1, updatedAt: new Date(), type: "create" })
          .where(eq(conversationsTable.id, convId));

        sendEvent("complete", {
          message: assistantMsg,
          workflowJson: parsed,
          qualityScore: 72,
          qualityGrade: "C+",
          isWorkflowCreation: true,
          // FIX 4.4: token usage for PATH A2
          tokenUsage: {
            totalOpenaiTokens: a2Tokens.promptTokens + a2Tokens.completionTokens,
            estimatedCostUsd: parseFloat(a2EstimatedCost),
          },
          // FIX 5.3: self-healing summary
          selfHealing: a2HealResult
            ? {
                success: a2HealResult.success,
                n8nWorkflowId: a2HealResult.n8nWorkflowId,
                attempts: a2HealResult.attempts.length,
                totalHealingMs: a2HealResult.totalHealingMs,
              }
            : null,
          // Phase 5: workflow test result summary
          workflowTest: a2TestResult
            ? {
                tested: a2TestResult.tested,
                success: a2TestResult.success,
                finalStatus: a2TestResult.testResult?.status,
                finalN8nWorkflowId: a2TestResult.finalN8nWorkflowId,
                attempts: a2TestResult.attempts.length,
                totalTestMs: a2TestResult.totalTestMs,
                testTokenUsage: a2TestResult.tokenUsage,
              }
            : null,
        });
      } catch (err) {
        sendEvent("error", { message: String(err) });
      }

    // ══════════════════════════════════════════════════════════════════════
    // PATH B: MODIFY WORKFLOW
    // ══════════════════════════════════════════════════════════════════════
    } else if (intent === "modify") {
      sendEvent("start", { type: "modify" });
      sendEvent("phase", { phase: 1, label: "GPT-4o: Generating modification", labelAr: "GPT-4o: توليد التعديل", status: "pending" });
      sendEvent("phase", { phase: 2, label: "Gemini 2.5 Pro: Validating changes", labelAr: "Gemini 2.5 Pro: التحقق من التعديلات", status: "pending" });
      sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "pending" });

      try {
        let targetWorkflowId: string | null = null;
        let targetWorkflowName: string | null = null;
        let currentWorkflowJson: Record<string, unknown> | null = null;

        try {
          if (availableWorkflows.length > 0) {
            const nameHint = workflowNameHint ?? findWorkflowNameHint(content, availableWorkflows.map(w => w.name));
            const matched = nameHint
              ? availableWorkflows.find(w => w.name === nameHint || w.name.toLowerCase().includes(nameHint.toLowerCase()))
              : null;

            if (matched) {
              targetWorkflowId = matched.id;
              targetWorkflowName = matched.name;
              currentWorkflowJson = await getCachedWorkflow(targetWorkflowId, 10_000);
            }
          }
        } catch {
          logger.warn("Could not fetch target workflow — modify will ask user for clarification");
        }

        if (!currentWorkflowJson) {
          const clarifyMsg = lang === "ar"
            ? `⚠️ **لم أتمكن من تحديد الـ workflow المقصود.**\n\nيرجى:\n1. ذكر اسم الـ workflow بوضوح في رسالتك\n2. أو التأكد من أن n8n مضبوط ومتصل في **الإعدادات**\n3. أو استخدام زر "تحليل وإصلاح" من صفحة الـ Workflows\n\n**الـ Workflows المتاحة:**\n${availableWorkflows.slice(0, 10).map(w => `- ${w.name}`).join("\n") || "لا توجد workflows مضافة بعد"}`
            : `⚠️ **Could not identify which workflow to modify.**\n\nPlease:\n1. Mention the workflow name clearly in your message\n2. Make sure n8n is configured in **Settings**\n3. Or use the "Analyze & Fix" button from the Workflows page\n\n**Available workflows:**\n${availableWorkflows.slice(0, 10).map(w => `- ${w.name}`).join("\n") || "No workflows found"}`;

          const [clarifyResp] = await db.insert(messagesTable).values({
            conversationId: convId,
            role: "assistant",
            content: clarifyMsg,
            modelUsed: "system",
          }).returning();

          await db.update(conversationsTable)
            .set({ messageCount: messageCount + 1, updatedAt: new Date() })
            .where(eq(conversationsTable.id, convId));

          sendEvent("complete", { message: clarifyResp, isWorkflowModification: false });
          return;
        }

        const modifierResult = await runWorkflowModifier(
          currentWorkflowJson,
          content,
          lang,
          {
            openaiKey,
            geminiKey: geminiKey ?? undefined,
            onPhaseUpdate: (phase) => sendEvent("phase", { ...phase, phase: phase.phase }),
          }
        );

        if (!modifierResult.success || !modifierResult.modifiedWorkflowJson) {
          sendEvent("error", {
            message: lang === "ar"
              ? `❌ فشل توليد التعديل: ${modifierResult.error ?? "خطأ غير معروف"}`
              : `❌ Failed to generate modification: ${modifierResult.error ?? "Unknown error"}`,
          });
          return;
        }

        let appliedToN8n = false;
        let applyError: string | null = null;

        sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "running" });

        try {
          // PROPOSAL 3: Auto-save version BEFORE applying modification
          // FIX 3.3: Use MAX(versionNumber)+1 instead of COUNT+1 to avoid race
          //          condition when two concurrent modifications run simultaneously.
          try {
            const maxVerResult = await db
              .select({
                maxVer: sql<number>`COALESCE(MAX(${workflowVersionsTable.versionNumber}), 0)`,
              })
              .from(workflowVersionsTable)
              .where(eq(workflowVersionsTable.workflowN8nId, targetWorkflowId!));
            const nextVersionNumber = (maxVerResult[0]?.maxVer ?? 0) + 1;
            await db.insert(workflowVersionsTable).values({
              workflowN8nId: targetWorkflowId!,
              versionNumber: nextVersionNumber,
              workflowJson: currentWorkflowJson,
              changeDescription: `نسخة احتياطية قبل التعديل بواسطة المحادثة #${convId}`,
              createdBy: req.user!.userId,
            });
            logger.info({ workflowId: targetWorkflowId, version: nextVersionNumber }, "Auto-saved version before chat modification");
          } catch (versionErr) {
            logger.warn({ err: versionErr }, "Could not auto-save version before modification — non-fatal, proceeding");
          }

          const updatePayload = {
            name: (modifierResult.modifiedWorkflowJson.name as string) ?? (currentWorkflowJson.name as string),
            nodes: modifierResult.modifiedWorkflowJson.nodes,
            connections: modifierResult.modifiedWorkflowJson.connections,
            settings: sanitizeSettings(modifierResult.modifiedWorkflowJson.settings ?? currentWorkflowJson.settings),
          };
          await updateWorkflow(targetWorkflowId!, updatePayload as Record<string, unknown>);
          invalidateWorkflowCache(targetWorkflowId!);
          appliedToN8n = true;
          sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "done", durationMs: 0 });
        } catch (applyErr) {
          applyError = String(applyErr);
          sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "failed", durationMs: 0 });
        }

        let assistantContent = "";
        if (lang === "ar") {
          assistantContent = appliedToN8n
            ? `✅ **تم تعديل الـ workflow "${targetWorkflowName}" وتطبيقه على n8n بنجاح!**\n\n📝 **التغييرات:**\n${modifierResult.changesSummaryAr}\n\nالـ workflow محدّث مباشرة في n8n. يمكنك مراجعته الآن.`
            : `⚠️ **تم توليد التعديل لكن لم يتم تطبيقه على n8n تلقائياً.**\n\n📝 **التغييرات:**\n${modifierResult.changesSummaryAr}${applyError ? `\n\n**سبب الفشل:** ${applyError}` : ""}\n\nيمكنك استيراد الـ JSON أدناه يدوياً:\n\n\`\`\`json\n${JSON.stringify(modifierResult.modifiedWorkflowJson, null, 2)}\n\`\`\``;
        } else {
          assistantContent = appliedToN8n
            ? `✅ **Workflow "${targetWorkflowName}" successfully modified and applied to n8n!**\n\n📝 **Changes:**\n${modifierResult.changesSummary}\n\nThe workflow is now updated directly in n8n. You can review it now.`
            : `⚠️ **Modification generated but could not be applied to n8n automatically.**\n\n📝 **Changes:**\n${modifierResult.changesSummary}${applyError ? `\n\n**Reason:** ${applyError}` : ""}\n\nYou can import the JSON below manually:\n\n\`\`\`json\n${JSON.stringify(modifierResult.modifiedWorkflowJson, null, 2)}\n\`\`\``;
        }

        const [assistantMsg] = await db.insert(messagesTable).values({
          conversationId: convId,
          role: "assistant",
          content: assistantContent,
          modelUsed: geminiKey ? "modifier-gpt4o+gemini" : "modifier-gpt4o",
        }).returning();

        await db.update(conversationsTable)
          .set({ messageCount: messageCount + 1, updatedAt: new Date(), type: "query" })
          .where(eq(conversationsTable.id, convId));

        sendEvent("complete", {
          message: assistantMsg,
          workflowJson: modifierResult.modifiedWorkflowJson,
          appliedToN8n,
          workflowId: targetWorkflowId,
          workflowName: targetWorkflowName,
          isWorkflowModification: true,
          phases: modifierResult.phases,
          totalTimeMs: modifierResult.totalTimeMs,
        });
      } catch (err) {
        logger.error({ err }, "Modify workflow SSE error");
        sendEvent("error", { message: String(err) });
      }

    // ══════════════════════════════════════════════════════════════════════
    // PATH C: QUERY / CHAT — with streaming + n8n context
    // ══════════════════════════════════════════════════════════════════════
    } else {
      sendEvent("start", { type: "chat" });

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

      // ── Build n8n workflow context (cached, non-blocking) ─────────────
      let workflowContext = "";
      try {
        if (availableWorkflows.length > 0) {
          const workflowList = availableWorkflows.map(w =>
            `- ID: ${w.id} | Name: "${w.name}" | Status: ${w.active ? "Active ✅" : "Inactive ⏸️"} | Nodes: ${w.nodes?.length ?? "?"}`
          ).join("\n");
          workflowContext = `\n\n## Connected n8n Workflows (${availableWorkflows.length} total):\n${workflowList}\n`;

          const nameHint = workflowNameHint ?? findWorkflowNameHint(content, availableWorkflows.map(w => w.name));
          const mentionedWorkflow = nameHint
            ? availableWorkflows.find(w => w.name === nameHint || w.name.toLowerCase().includes(nameHint.toLowerCase()))
            : null;

          if (mentionedWorkflow) {
            try {
              const fullWf = await getCachedWorkflow(mentionedWorkflow.id);
              const nodes = (fullWf.nodes as Array<{ type?: string; name?: string; parameters?: Record<string, unknown> }> | undefined) ?? [];
              const nodesSummary = nodes.map((n, i) => {
                const paramKeys = n.parameters ? Object.keys(n.parameters).slice(0, 4).join(", ") : "";
                return `  ${i + 1}. [${n.type ?? "unknown"}] "${n.name ?? "unnamed"}"${paramKeys ? ` — params: ${paramKeys}` : ""}`;
              }).join("\n");
              workflowContext += `\n## Detailed Workflow: "${mentionedWorkflow.name}" (ID: ${mentionedWorkflow.id})\n`;
              workflowContext += `Status: ${mentionedWorkflow.active ? "Active ✅" : "Inactive ⏸️"}\n`;
              workflowContext += `Total Nodes: ${nodes.length}\nNode List:\n${nodesSummary}\n`;
              const connections = fullWf.connections as Record<string, unknown> | undefined;
              if (connections) {
                workflowContext += `Connections: ${Object.keys(connections).length} nodes have outgoing connections.\n`;
              }
            } catch { /* ignore */ }
          }
        }
      } catch {
        logger.warn("Could not build n8n context for chat — continuing without");
      }

      // [ج1] Build session memory summary from previous messages
      const sessionSummary = buildSessionSummary(previousMessages.map(m => ({ role: m.role, content: m.content })));

      const systemPrompt = isArabic
        ? `أنت مساعد ذكي متخصص في n8n مربوط مباشرةً بنظام n8n الخاص بالمستخدم. تحدث بالعربية دائماً.
مهمتك: الإجابة عن أسئلة المستخدم بشكل دقيق ومفصّل بناءً على الـ workflows الفعلية المربوطة.
إذا سأل عن workflow معين، اشرح نودات عمله وتسلسله الفعلي.
إذا وجدت خطأ أو مشكلة، اقترح حلاً ملموساً.${workflowContext}${sessionSummary}`
        : `You are an AI assistant directly connected to the user's n8n instance. Always answer based on the ACTUAL connected workflows below.
If asked about a specific workflow, explain its real nodes, flow, and behavior.
If you spot issues or improvements, suggest concrete changes.${workflowContext}${sessionSummary}`;

      // ── Build conversation context with smart truncation ──────────────
      const contextMessages = [...previousMessages]
        .reverse()
        .slice(-10)
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: smartTruncateMessage(m.content, 1200),
        }));

      // ── Streaming response ────────────────────────────────────────────
      let assistantContent = "";
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
          max_tokens: 2000,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            assistantContent += delta;
            sendEvent("stream_chunk", { delta });
          }
        }
      } catch (err) {
        assistantContent = isArabic
          ? `عذراً، تعذر الاتصال بـ GPT: ${String(err)}`
          : `Sorry, could not connect to GPT: ${String(err)}`;
      }

      const [assistantMsg] = await db.insert(messagesTable).values({
        conversationId: convId,
        role: "assistant",
        content: assistantContent,
        modelUsed: "gpt-4o",
      }).returning();

      await db.update(conversationsTable)
        .set({ messageCount: messageCount + 1, updatedAt: new Date() })
        .where(eq(conversationsTable.id, convId));

      sendEvent("complete", { message: assistantMsg, isWorkflowCreation: false });
    }
  } catch (err) {
    logger.error({ err }, "SSE generate error");
    sendEvent("error", { message: String(err) });
  } finally {
    res.end();
  }
});

// ─── Non-SSE messages endpoint (kept for compatibility) ───────────────────────
router.post("/conversations/:id/messages", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { content } = req.body as { content: string; mode?: string };
  if (!content) { res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Message content required" } }); return; }

  const isArabic = /[\u0600-\u06FF]/.test(content);
  const lang = isArabic ? "ar" : "en";

  await db.insert(messagesTable).values({ conversationId: convId, role: "user", content });

  const { openaiKey, geminiKey } = await getApiKeys();

  const previousMessages = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(20);

  const messageCount = previousMessages.length;

  let assistantContent = "";
  let modelUsed = "gpt-4o";
  let tokensUsed: number | null = null;
  let generationSessionId: number | undefined;

  let availableWorkflows: Array<{ id: string; name: string; active: boolean }> = [];
  try { availableWorkflows = await getCachedWorkflows(); } catch { /* ignore */ }

  const intentResult = openaiKey
    ? await detectIntent(content, availableWorkflows.map(w => w.name), openaiKey)
    : { intent: "query" as const, confidence: "low" as const, workflowNameHint: null, reasoning: "no key" };

  const { intent } = intentResult;

  if (intent === "create" && openaiKey && geminiKey) {
    const engineResult = await runSequentialEngine(content, { openaiKey, geminiKey, maxRefinementRounds: 2, qualityThreshold: 80 });
    assistantContent = engineResult.userMessage;
    modelUsed = "sequential-gpt4o+gemini";
    if (engineResult.success) {
      try {
        const [session] = await db.insert(generationSessionsTable).values({
          conversationId: convId, userRequest: content,
          phase1Result: engineResult.phase1Result as Record<string, unknown>,
          phase2Feedback: engineResult.phase2Feedback ?? "",
          phase3Result: engineResult.phase3Result as Record<string, unknown>,
          phase4Approved: engineResult.phase4Approved,
          roundsCount: engineResult.roundsCount, totalTimeMs: engineResult.totalTimeMs,
          finalWorkflowJson: engineResult.workflowJson as Record<string, unknown>,
          qualityScore: engineResult.qualityScore,
          qualityReport: JSON.stringify({ grade: engineResult.qualityGrade, phases: engineResult.phases }),
        }).returning();
        generationSessionId = session?.id;
      } catch (err) { logger.error({ err }, "Failed to save generation session"); }
      if (engineResult.workflowJson) assistantContent += `\n\n\`\`\`json\n${JSON.stringify(engineResult.workflowJson, null, 2)}\n\`\`\``;
    }
  } else if (openaiKey) {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });
    const systemPrompt = lang === "ar" ? `أنت مساعد ذكي متخصص في إدارة n8n workflows.` : `You are an AI assistant specialized in n8n workflow management.`;
    const contextMessages = [...previousMessages].reverse().slice(-10).map(m => ({
      role: m.role as "user" | "assistant",
      content: smartTruncateMessage(m.content, 1200),
    }));
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        max_tokens: 1500, temperature: 0.7,
      });
      assistantContent = response.choices[0]?.message?.content ?? "";
      tokensUsed = response.usage?.total_tokens ?? null;
    } catch (err) {
      assistantContent = lang === "ar" ? `عذراً، تعذر الاتصال بـ GPT: ${String(err)}` : `Sorry, could not connect to GPT: ${String(err)}`;
    }
  } else {
    assistantContent = lang === "ar"
      ? "⚠️ لم يتم ضبط مفتاح OpenAI بعد. يرجى الذهاب إلى **الإعدادات**."
      : "⚠️ OpenAI API key is not configured. Please go to **Settings**.";
  }

  const [assistantMsg] = await db.insert(messagesTable).values({
    conversationId: convId, role: "assistant", content: assistantContent, modelUsed, tokensUsed,
  }).returning();

  await db.update(conversationsTable)
    .set({ messageCount: messageCount + 1, updatedAt: new Date() })
    .where(eq(conversationsTable.id, convId));

  res.json({ success: true, data: { ...assistantMsg, generationSessionId, isWorkflowCreation: intent === "create" } });
});

// ─── SSE: Workflow Analysis ───────────────────────────────────────────────────
router.post("/conversations/:id/analyze-workflow", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { workflowId, userContext } = req.body as { workflowId: string; userContext?: string };
  if (!workflowId) { res.status(400).json({ success: false, error: { code: "MISSING_WORKFLOW_ID", message: "workflowId is required" } }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
      (res as unknown as { flush: () => void }).flush();
    }
  };

  try {
    const { openaiKey, geminiKey } = await getApiKeys();
    if (!openaiKey) {
      sendEvent("error", { message: "⚠️ مفتاح OpenAI غير مضبوط. يرجى الذهاب للإعدادات." });
      res.end();
      return;
    }

    sendEvent("start", { type: "analyze" });
    sendEvent("phase", { phase: 1, label: "GPT-4o: Analyzing workflow", labelAr: "GPT-4o: تحليل المشاكل", status: "pending" });
    sendEvent("phase", { phase: 2, label: "Gemini: Validating analysis", labelAr: "Gemini: التحقق من التحليل", status: "pending" });
    sendEvent("phase", { phase: 3, label: "GPT-4o: Generating fix", labelAr: "GPT-4o: إنشاء الإصلاح", status: "pending" });

    let workflowJson: Record<string, unknown>;
    try {
      workflowJson = await getCachedWorkflow(workflowId, 10_000);
    } catch {
      sendEvent("error", { message: "لم يتم العثور على الـ workflow في n8n. تحقق من الاتصال." });
      res.end();
      return;
    }

    let errorDetails: Array<{ id: string; status: string; error?: { message?: string; node?: { name?: string } }; startedAt?: string }> = [];
    try {
      const execData = await getWorkflowExecutionsWithErrors(workflowId, 15);
      errorDetails = execData.errorDetails;
    } catch {
      logger.warn({ workflowId }, "Could not fetch execution errors — continuing without them");
    }

    const contextMsg = userContext
      ? `تحليل مسار العمل: ${workflowJson.name as string}\n\nملاحظة المستخدم: ${userContext}`
      : `تحليل مسار العمل: ${workflowJson.name as string}`;

    await db.insert(messagesTable).values({ conversationId: convId, role: "user", content: contextMsg });
    const prevCount = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, convId));

    const analyzerResult = await runWorkflowAnalyzer(
      workflowJson,
      errorDetails,
      userContext ?? "",
      {
        openaiKey,
        geminiKey: geminiKey ?? undefined,
        onPhaseUpdate: (phase) => sendEvent("phase", phase),
      },
    );

    const workflowName = (workflowJson.name as string) ?? "Workflow";
    const critCount = analyzerResult.problems.filter(p => p.severity === "critical").length;
    const highCount = analyzerResult.problems.filter(p => p.severity === "high").length;

    let assistantContent = "";
    if (analyzerResult.problems.length === 0) {
      assistantContent = `✅ **تحليل مسار العمل: "${workflowName}"**\n\nلم يتم اكتشاف أي مشاكل! يبدو أن مسار العمل مصمم بشكل صحيح.\n\n${analyzerResult.summaryAr}`;
    } else {
      assistantContent = `🔍 **تحليل مسار العمل: "${workflowName}"**\n\n${analyzerResult.summaryAr}\n\n**المشاكل المكتشفة (${analyzerResult.problems.length}):**\n`;
      if (critCount > 0) assistantContent += `🔴 حرجة: ${critCount} | `;
      if (highCount > 0) assistantContent += `🟠 عالية: ${highCount} | `;
      const medCount = analyzerResult.problems.filter(p => p.severity === "medium").length;
      if (medCount > 0) assistantContent += `🟡 متوسطة: ${medCount} | `;
      const lowCount = analyzerResult.problems.filter(p => p.severity === "low").length;
      if (lowCount > 0) assistantContent += `🟢 منخفضة: ${lowCount}`;
      assistantContent = assistantContent.replace(/ \| $/, "");
      assistantContent += "\n\n";

      for (const prob of analyzerResult.problems) {
        const icon = prob.severity === "critical" ? "🔴" : prob.severity === "high" ? "🟠" : prob.severity === "medium" ? "🟡" : "🟢";
        assistantContent += `${icon} **${prob.titleAr}**`;
        if (prob.affectedNode) assistantContent += ` *(Node: ${prob.affectedNode})*`;
        assistantContent += `\n${prob.descriptionAr}\n✅ *${prob.solutionAr}*\n\n`;
      }

      if (analyzerResult.fixedWorkflowJson) {
        assistantContent += `---\n✨ **تم إنشاء نسخة مُصلَحة من الـ Workflow جاهزة للتطبيق مباشرة في n8n.**`;
      }
    }

    const [assistantMsg] = await db.insert(messagesTable).values({
      conversationId: convId,
      role: "assistant",
      content: assistantContent,
      modelUsed: geminiKey ? "sequential-gpt4o+gemini" : "gpt-4o",
    }).returning();

    await db.update(conversationsTable)
      .set({ messageCount: prevCount.length + 1, updatedAt: new Date(), type: "analyze" })
      .where(eq(conversationsTable.id, convId));

    sendEvent("complete", {
      message: assistantMsg,
      problems: analyzerResult.problems,
      fixedWorkflowJson: analyzerResult.fixedWorkflowJson,
      workflowId,
      workflowName,
      totalTimeMs: analyzerResult.totalTimeMs,
      phases: analyzerResult.phases,
      isAnalysis: true,
    });
  } catch (err) {
    logger.error({ err }, "SSE analyze-workflow error");
    sendEvent("error", { message: String(err) });
  } finally {
    res.end();
  }
});

export { router as chatRouter };
