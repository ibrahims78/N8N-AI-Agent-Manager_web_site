import { Router } from "express";
import { db, conversationsTable, messagesTable, systemSettingsTable, generationSessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { decryptApiKey } from "../services/encryption.service";
import { runSequentialEngine } from "../services/sequentialEngine.service";
import { runWorkflowAnalyzer } from "../services/workflowAnalyzer.service";
import { runWorkflowModifier } from "../services/workflowModifier.service";
import { updateWorkflow, getWorkflowExecutionsWithErrors } from "../services/n8n.service";
import { getCachedWorkflows, getCachedWorkflow, invalidateWorkflowCache } from "../services/n8nCache.service";
import { detectIntent, findWorkflowNameHint, smartTruncateMessage } from "../services/intentDetector.service";
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
function buildSessionSummary(messages: Array<{ role: string; content: string }>): string {
  const createdWorkflows: string[] = [];
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    const nameMatches = m.content.match(/"name"\s*:\s*"([^"]{3,80})"/g);
    if (nameMatches) {
      for (const match of nameMatches) {
        const extracted = match.replace(/"name"\s*:\s*"/, "").replace(/"$/, "").trim();
        if (extracted && !createdWorkflows.includes(extracted)) {
          createdWorkflows.push(extracted);
        }
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

  const { content } = req.body as { content: string };
  if (!content) { res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Content required" } }); return; }

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
    // ── Save user message & get API keys in parallel ──────────────────────
    const [, { openaiKey, geminiKey }, previousMessages] = await Promise.all([
      db.insert(messagesTable).values({ conversationId: convId, role: "user", content }),
      getApiKeys(),
      db.select().from(messagesTable)
        .where(eq(messagesTable.conversationId, convId))
        .orderBy(desc(messagesTable.createdAt))
        .limit(20),
    ]);

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

    // ── Fetch n8n workflows (cached) for intent detection ─────────────────
    let availableWorkflows: Array<{ id: string; name: string; active: boolean }> = [];
    try {
      availableWorkflows = await getCachedWorkflows();
    } catch {
      logger.warn("Could not fetch n8n workflows for intent detection — continuing without");
    }

    // ── LLM-based intent detection ────────────────────────────────────────
    const intentResult = await detectIntent(content, availableWorkflows.map(w => w.name), openaiKey);
    const { intent, workflowNameHint } = intentResult;
    logger.info({ intent, confidence: intentResult.confidence, hint: workflowNameHint }, "Intent detected");

    // ══════════════════════════════════════════════════════════════════════
    // PATH A: CREATE WORKFLOW
    // ══════════════════════════════════════════════════════════════════════
    if (intent === "create" && geminiKey) {
      sendEvent("start", { type: "sequential", rounds: 3 });

      // [أ1] Build n8n context string from already-fetched workflows list
      const n8nContextStr = availableWorkflows.length > 0
        ? availableWorkflows.slice(0, 20).map(w =>
            `- "${w.name}" (${w.active ? "active" : "inactive"})`
          ).join("\n")
        : undefined;

      const engineResult = await runSequentialEngine(content, {
        openaiKey,
        geminiKey,
        maxRefinementRounds: 2,
        qualityThreshold: 80,
        // [ب] Send live phase updates with label + durationMs to frontend via SSE
        onPhaseUpdate: (phase) => sendEvent("phase", phase),
        // [أ1] Inject existing workflows context into Phase 1B
        n8nContext: n8nContextStr,
        // [أ2] Threshold for smart gate (skip Phase 3+4 if simple + high quality)
        simpleWorkflowNodeThreshold: 3,
      });

      let assistantContent = engineResult.userMessage;
      if (engineResult.success && engineResult.workflowJson) {
        assistantContent += `\n\n\`\`\`json\n${JSON.stringify(engineResult.workflowJson, null, 2)}\n\`\`\``;
        try {
          await db.insert(generationSessionsTable).values({
            conversationId: convId,
            userRequest: content,
            phase1Result: engineResult.phase1Result as Record<string, unknown>,
            phase2Feedback: engineResult.phase2Feedback ?? "",
            phase3Result: engineResult.phase3Result as Record<string, unknown>,
            phase4Approved: engineResult.phase4Approved,
            roundsCount: engineResult.roundsCount,
            totalTimeMs: engineResult.totalTimeMs,
            finalWorkflowJson: engineResult.workflowJson as Record<string, unknown>,
            qualityScore: engineResult.qualityScore,
            qualityReport: JSON.stringify({ grade: engineResult.qualityGrade, phases: engineResult.phases }),
          });
        } catch (err) {
          logger.error({ err }, "Failed to save generation session");
        }
      }

      const [assistantMsg] = await db.insert(messagesTable).values({
        conversationId: convId,
        role: "assistant",
        content: assistantContent,
        modelUsed: "sequential-gpt4o+gemini",
      }).returning();

      await db.update(conversationsTable)
        .set({ messageCount: messageCount + 1, updatedAt: new Date(), type: "create" })
        .where(eq(conversationsTable.id, convId));

      sendEvent("complete", {
        message: assistantMsg,
        workflowJson: engineResult.workflowJson,
        qualityScore: engineResult.qualityScore,
        qualityGrade: engineResult.qualityGrade,
        roundsCount: engineResult.roundsCount,
        totalTimeMs: engineResult.totalTimeMs,
        phases: engineResult.phases,
        isWorkflowCreation: true,
      });

    // ══════════════════════════════════════════════════════════════════════
    // PATH A2: CREATE — GPT-4o only (no Gemini key)
    // ══════════════════════════════════════════════════════════════════════
    } else if (intent === "create" && !geminiKey) {
      sendEvent("start", { type: "gpt-only" });
      sendEvent("phase", { phase: 1, label: "GPT-4o: Creating workflow", labelAr: "GPT-4o: إنشاء الـ workflow", status: "running" });

      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: openaiKey, timeout: 90000 });

        const systemPrompt = lang === "ar"
          ? "أنت خبير في بناء n8n workflows. أنشئ workflow JSON صالح وكامل. أرجع JSON فقط."
          : "You are an n8n workflow expert. Create a valid, complete workflow JSON. Return JSON only.";

        const p1Response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content }],
          max_tokens: 3000,
          temperature: 0.3,
          response_format: { type: "json_object" },
        });

        const workflowJson = p1Response.choices[0]?.message?.content ?? "{}";
        let parsed: Record<string, unknown> | null = null;
        try { parsed = JSON.parse(workflowJson) as Record<string, unknown>; } catch { parsed = null; }

        sendEvent("phase", { phase: 1, status: "done", durationMs: 0 });

        const noGeminiNote = lang === "ar"
          ? "\n\n⚠️ *ملاحظة: مفتاح Gemini غير مضبوط. استُخدم GPT-4o فقط.*"
          : "\n\n⚠️ *Note: Gemini key not configured. GPT-4o only mode.*";

        const assistantContent = (lang === "ar"
          ? "✅ تم إنشاء الـ workflow (GPT-4o فقط):\n\n"
          : "✅ Workflow created (GPT-4o only):\n\n") +
          `\`\`\`json\n${workflowJson}\n\`\`\`` + noGeminiNote;

        const [assistantMsg] = await db.insert(messagesTable).values({
          conversationId: convId,
          role: "assistant",
          content: assistantContent,
          modelUsed: "gpt-4o",
        }).returning();

        await db.update(conversationsTable)
          .set({ messageCount: messageCount + 1, updatedAt: new Date(), type: "create" })
          .where(eq(conversationsTable.id, convId));

        sendEvent("complete", {
          message: assistantMsg,
          workflowJson: parsed,
          qualityScore: 70,
          qualityGrade: "C",
          isWorkflowCreation: true,
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
