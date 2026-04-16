import { Router } from "express";
import { db, conversationsTable, messagesTable, systemSettingsTable, generationSessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { decryptApiKey } from "../services/encryption.service";
import { runSequentialEngine, detectWorkflowCreationIntent, detectWorkflowModifyIntent } from "../services/sequentialEngine.service";
import { runWorkflowAnalyzer } from "../services/workflowAnalyzer.service";
import { runWorkflowModifier, extractWorkflowNameFromMessage } from "../services/workflowModifier.service";
import { getWorkflow, getWorkflows, updateWorkflow, getWorkflowExecutionsWithErrors } from "../services/n8n.service";
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

  res.json({
    success: true,
    data: {
      conversations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
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
    await db.insert(messagesTable).values({
      conversationId: conv.id,
      role: "user",
      content: initialMessage,
    });
    await db.update(conversationsTable).set({ messageCount: 1 }).where(eq(conversationsTable.id, conv.id));
  }

  res.json({ success: true, data: conv });
});

router.get("/conversations/:id", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const convs = await db.select().from(conversationsTable).where(eq(conversationsTable.id, convId)).limit(1);
  const conv = convs[0];

  if (!conv) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(messagesTable.createdAt);

  res.json({ success: true, data: { conversation: conv, messages } });
});

router.put("/conversations/:id", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { title } = req.body as { title?: string };
  if (!title || !title.trim()) {
    res.status(400).json({ success: false, error: { code: "MISSING_TITLE", message: "Title is required" } });
    return;
  }

  const [updated] = await db.update(conversationsTable)
    .set({ title: title.trim(), updatedAt: new Date() })
    .where(eq(conversationsTable.id, convId))
    .returning();

  if (!updated) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
    return;
  }

  res.json({ success: true, data: updated });
});

router.delete("/conversations/:id", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  await db.delete(conversationsTable).where(eq(conversationsTable.id, convId));
  res.json({ success: true, message: "Conversation deleted" });
});

// ─── SSE: Real-time phase progress for workflow generation ─────────────────
router.post("/conversations/:id/generate", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { content } = req.body as { content: string };

  if (!content) {
    res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Content required" } });
    return;
  }

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
    const isArabic = /[\u0600-\u06FF]/.test(content);
    const lang = isArabic ? "ar" : "en";

    await db.insert(messagesTable).values({
      conversationId: convId,
      role: "user",
      content,
    });

    const { openaiKey, geminiKey } = await getApiKeys();

    if (!openaiKey) {
      sendEvent("error", {
        message: lang === "ar"
          ? "مفتاح OpenAI غير مضبوط. يرجى الذهاب للإعدادات."
          : "OpenAI key not configured. Please go to Settings.",
      });
      res.end();
      return;
    }

    const previousMessages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, convId))
      .orderBy(desc(messagesTable.createdAt))
      .limit(20);

    const messageCount = previousMessages.length;

    const isCreateIntent = detectWorkflowCreationIntent(content);

    if (isCreateIntent && openaiKey && geminiKey) {
      sendEvent("start", { type: "sequential", rounds: 3 });

      const engineResult = await runSequentialEngine(content, {
        openaiKey,
        geminiKey,
        maxRefinementRounds: 2,
        qualityThreshold: 80,
        onPhaseUpdate: (phase) => {
          sendEvent("phase", phase);
        },
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
            qualityReport: JSON.stringify({
              grade: engineResult.qualityGrade,
              phases: engineResult.phases,
            }),
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
    } else if (isCreateIntent && openaiKey && !geminiKey) {
      sendEvent("start", { type: "gpt-only" });
      sendEvent("phase", { phase: 1, label: "GPT-4o: Creating workflow", labelAr: "GPT-4o: إنشاء الـ workflow", status: "running" });

      const noGeminiNote = lang === "ar"
        ? "\n\n⚠️ *ملاحظة: مفتاح Gemini غير مضبوط. استُخدم GPT-4o فقط.*"
        : "\n\n⚠️ *Note: Gemini key not configured. GPT-4o only mode.*";

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

    // ── Modify Intent: edit/fix/update an existing workflow ──────────────────
    } else if (!isCreateIntent && detectWorkflowModifyIntent(content) && openaiKey) {
      sendEvent("start", { type: "modify" });
      sendEvent("phase", { phase: 1, label: "GPT-4o: Generating modification", labelAr: "GPT-4o: توليد التعديل", status: "pending" });
      sendEvent("phase", { phase: 2, label: "Gemini 2.5 Pro: Validating changes", labelAr: "Gemini 2.5 Pro: التحقق من التعديلات", status: "pending" });
      sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "pending" });

      try {
        // Step 1: Find which workflow the user is referring to
        let targetWorkflowId: string | null = null;
        let targetWorkflowName: string | null = null;
        let currentWorkflowJson: Record<string, unknown> | null = null;

        try {
          const allWorkflows = await getWorkflows();
          if (allWorkflows.length > 0) {
            const match = await extractWorkflowNameFromMessage(
              content,
              allWorkflows.map((w) => ({ id: w.id, name: w.name })),
              openaiKey
            );
            if (match) {
              targetWorkflowId = match.workflowId;
              targetWorkflowName = match.workflowName;
              currentWorkflowJson = await getWorkflow(targetWorkflowId) as unknown as Record<string, unknown>;
            }
          }
        } catch {
          logger.warn("Could not fetch workflows from n8n — modify will work without n8n context");
        }

        // If no n8n workflow found, ask user to clarify
        if (!currentWorkflowJson) {
          const clarifyMsg = lang === "ar"
            ? `⚠️ **لم أتمكن من تحديد الـ workflow المقصود.**\n\nيرجى:\n1. التأكد من أن n8n مضبوط ومتصل في **الإعدادات**\n2. أو ذكر اسم الـ workflow بوضوح في رسالتك\n3. أو استخدام زر "تحليل وإصلاح" من صفحة الـ Workflows`
            : `⚠️ **Could not identify which workflow to modify.**\n\nPlease:\n1. Make sure n8n is configured and connected in **Settings**\n2. Or mention the workflow name clearly in your message\n3. Or use the "Analyze & Fix" button from the Workflows page`;

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

        // Step 2: Run the modifier
        const modifierResult = await runWorkflowModifier(
          currentWorkflowJson,
          content,
          lang,
          {
            openaiKey,
            geminiKey: geminiKey ?? undefined,
            onPhaseUpdate: (phase) => {
              sendEvent("phase", { ...phase, phase: phase.phase });
            },
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

        // Step 3: Apply to n8n
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
          appliedToN8n = true;
          sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "done", durationMs: 0 });
        } catch (applyErr) {
          applyError = String(applyErr);
          sendEvent("phase", { phase: 3, label: "Applying to n8n", labelAr: "تطبيق التعديل على n8n", status: "failed", durationMs: 0 });
          logger.warn({ applyErr }, "Could not apply modification to n8n");
        }

        // Build assistant response
        let assistantContent = "";
        if (lang === "ar") {
          if (appliedToN8n) {
            assistantContent = `✅ **تم تعديل الـ workflow "${targetWorkflowName}" وتطبيقه على n8n بنجاح!**\n\n`;
            assistantContent += `📝 **التغييرات التي تمت:**\n${modifierResult.changesSummaryAr}\n\n`;
            assistantContent += `الـ workflow محدّث مباشرة في n8n. يمكنك مراجعته الآن.`;
          } else {
            assistantContent = `⚠️ **تم توليد التعديل لكن لم يتم تطبيقه على n8n تلقائياً.**\n\n`;
            assistantContent += `📝 **التغييرات المطلوبة:**\n${modifierResult.changesSummaryAr}\n\n`;
            if (applyError) assistantContent += `**سبب الفشل:** ${applyError}\n\n`;
            assistantContent += `يمكنك استيراد الـ JSON أدناه يدوياً:\n\n`;
            assistantContent += `\`\`\`json\n${JSON.stringify(modifierResult.modifiedWorkflowJson, null, 2)}\n\`\`\``;
          }
        } else {
          if (appliedToN8n) {
            assistantContent = `✅ **Workflow "${targetWorkflowName}" successfully modified and applied to n8n!**\n\n`;
            assistantContent += `📝 **Changes made:**\n${modifierResult.changesSummary}\n\n`;
            assistantContent += `The workflow is now updated directly in n8n. You can review it now.`;
          } else {
            assistantContent = `⚠️ **Modification generated but could not be applied to n8n automatically.**\n\n`;
            assistantContent += `📝 **Requested changes:**\n${modifierResult.changesSummary}\n\n`;
            if (applyError) assistantContent += `**Reason:** ${applyError}\n\n`;
            assistantContent += `You can import the JSON below manually:\n\n`;
            assistantContent += `\`\`\`json\n${JSON.stringify(modifierResult.modifiedWorkflowJson, null, 2)}\n\`\`\``;
          }
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

    } else {
      sendEvent("start", { type: "chat" });

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

      const isArabicReq = /[\u0600-\u06FF]/.test(content);

      // ── Fetch n8n workflows to give GPT real context ─────────────────────
      let workflowContext = "";
      let detailedWorkflow: Record<string, unknown> | null = null;
      try {
        const workflows = await getWorkflows();
        if (workflows.length > 0) {
          // Build a summary list of all workflows
          const workflowList = workflows.map(w =>
            `- ID: ${w.id} | Name: "${w.name}" | Status: ${w.active ? "Active ✅" : "Inactive ⏸️"} | Nodes: ${w.nodes?.length ?? 0}`
          ).join("\n");

          workflowContext = `\n\n## Connected n8n Workflows (${workflows.length} total):\n${workflowList}\n`;

          // If user mentions a workflow by name, fetch its full details
          const contentLower = content.toLowerCase();
          const mentionedWorkflow = workflows.find(w =>
            contentLower.includes(w.name.toLowerCase()) ||
            contentLower.includes(w.id.toLowerCase())
          );

          if (mentionedWorkflow) {
            try {
              const fullWf = await getWorkflow(mentionedWorkflow.id) as unknown as Record<string, unknown>;
              const nodes = (fullWf.nodes as Array<{type?: string; name?: string; parameters?: Record<string, unknown>}> | undefined) ?? [];
              // Build a concise node summary — no raw JSON to avoid token bloat
              const nodesSummary = nodes.map((n, i) => {
                const paramKeys = n.parameters ? Object.keys(n.parameters).slice(0, 4).join(", ") : "";
                return `  ${i + 1}. [${n.type ?? "unknown"}] "${n.name ?? "unnamed"}"${paramKeys ? ` — params: ${paramKeys}` : ""}`;
              }).join("\n");
              detailedWorkflow = fullWf;
              workflowContext += `\n## Detailed Workflow: "${mentionedWorkflow.name}" (ID: ${mentionedWorkflow.id})\n`;
              workflowContext += `Status: ${mentionedWorkflow.active ? "Active ✅" : "Inactive ⏸️"}\n`;
              workflowContext += `Total Nodes: ${nodes.length}\n`;
              workflowContext += `Node List:\n${nodesSummary}\n`;
              // Include connections summary
              const connections = fullWf.connections as Record<string, unknown> | undefined;
              if (connections) {
                workflowContext += `\nConnections: ${Object.keys(connections).length} nodes have outgoing connections.\n`;
              }
            } catch { /* ignore if can't fetch full details */ }
          }
        }
      } catch { /* ignore if n8n not reachable */ }

      const systemPrompt = isArabicReq
        ? `أنت مساعد ذكي متخصص في n8n مربوط مباشرةً بنظام n8n الخاص بالمستخدم. تحدث بالعربية دائماً.
مهمتك: الإجابة عن أسئلة المستخدم بشكل دقيق ومفصّل بناءً على الـ workflows الفعلية المربوطة.
إذا سأل عن workflow معين، اشرح نودات عمله وتسلسله الفعلي.
إذا وجدت خطأ أو مشكلة، اقترح حلاً ملموساً.
${workflowContext}`
        : `You are an AI assistant directly connected to the user's n8n instance. Always answer based on the ACTUAL connected workflows below.
If asked about a specific workflow, explain its real nodes, flow, and behavior.
If you spot issues or improvements, suggest concrete changes.
${workflowContext}`;

      const contextMessages = [...previousMessages]
        .reverse()
        .slice(-10)
        .map(m => {
          // Truncate very long messages (e.g. analysis reports) to avoid polluting context
          const maxLen = 800;
          const msgContent = m.content.length > maxLen
            ? m.content.slice(0, maxLen) + "\n...[truncated for brevity]"
            : m.content;
          return { role: m.role as "user" | "assistant", content: msgContent };
        });

      let assistantContent = "";
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
          max_tokens: 2000,
          temperature: 0.7,
        });
        assistantContent = response.choices[0]?.message?.content ?? "";
      } catch (err) {
        assistantContent = isArabicReq
          ? `عذراً، تعذر الاتصال بـ GPT: ${String(err)}`
          : `Sorry, could not connect to GPT: ${String(err)}`;
      }
      void detailedWorkflow; // used in system prompt above

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

router.post("/conversations/:id/messages", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { content } = req.body as { content: string; mode?: string };

  if (!content) {
    res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Message content required" } });
    return;
  }

  const isArabic = /[\u0600-\u06FF]/.test(content);
  const lang = isArabic ? "ar" : "en";

  await db.insert(messagesTable).values({
    conversationId: convId,
    role: "user",
    content,
  });

  const { openaiKey, geminiKey } = await getApiKeys();

  const previousMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(20);

  const messageCount = previousMessages.length;

  let assistantContent = "";
  let modelUsed = "gpt-4o";
  let tokensUsed: number | null = null;
  let generationSessionId: number | undefined;

  const isCreateIntent = detectWorkflowCreationIntent(content);

  if (isCreateIntent && openaiKey && geminiKey) {
    logger.info({ convId, content: content.slice(0, 50) }, "Routing to sequential engine");

    const engineResult = await runSequentialEngine(content, {
      openaiKey,
      geminiKey,
      maxRefinementRounds: 2,
      qualityThreshold: 80,
    });

    assistantContent = engineResult.userMessage;
    modelUsed = "sequential-gpt4o+gemini";

    if (engineResult.success) {
      try {
        const [session] = await db.insert(generationSessionsTable).values({
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
          qualityReport: JSON.stringify({
            grade: engineResult.qualityGrade,
            phases: engineResult.phases,
          }),
        }).returning();
        generationSessionId = session?.id;
      } catch (err) {
        logger.error({ err }, "Failed to save generation session");
      }

      if (engineResult.workflowJson) {
        assistantContent += `\n\n\`\`\`json\n${JSON.stringify(engineResult.workflowJson, null, 2)}\n\`\`\``;
      }
    }
  } else if (isCreateIntent && openaiKey && !geminiKey) {
    logger.info({ convId }, "Gemini key not configured — using GPT-4o only mode");

    const noGeminiNote = lang === "ar"
      ? "\n\n⚠️ *ملاحظة: مفتاح Gemini API غير مُضبوط. استُخدم GPT-4o فقط.*"
      : "\n\n⚠️ *Note: Gemini API key is not configured. GPT-4o only mode.*";

    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiKey, timeout: 90000 });

      const systemPrompt = lang === "ar"
        ? "أنت خبير متقدم في بناء n8n workflows. أنشئ workflow JSON صالح وكامل. أرجع JSON فقط."
        : "You are an advanced n8n workflow expert. Create a valid, complete workflow JSON. Return JSON only.";

      const p1Response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content }],
        max_tokens: 3000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const workflowJson = p1Response.choices[0]?.message?.content ?? "{}";
      tokensUsed = p1Response.usage?.total_tokens ?? null;

      assistantContent = (lang === "ar"
        ? "✅ تم إنشاء الـ workflow (وضع GPT-4o فقط):\n\n"
        : "✅ Workflow created (GPT-4o only mode):\n\n") +
        `\`\`\`json\n${workflowJson}\n\`\`\`` + noGeminiNote;
    } catch (err) {
      assistantContent = lang === "ar"
        ? `❌ فشل إنشاء الـ workflow: ${String(err)}`
        : `❌ Workflow creation failed: ${String(err)}`;
    }

  } else if (!isCreateIntent && detectWorkflowModifyIntent(content) && openaiKey) {
    // ── Modify Intent (non-SSE) ──────────────────────────────────────────────
    logger.info({ convId, content: content.slice(0, 50) }, "Routing to workflow modifier");
    modelUsed = "modifier-gpt4o+gemini";

    try {
      let currentWorkflowJson: Record<string, unknown> | null = null;
      let targetWorkflowName: string | null = null;
      let targetWorkflowId: string | null = null;

      try {
        const allWorkflows = await getWorkflows();
        if (allWorkflows.length > 0) {
          const match = await extractWorkflowNameFromMessage(
            content,
            allWorkflows.map((w) => ({ id: w.id, name: w.name })),
            openaiKey
          );
          if (match) {
            targetWorkflowId = match.workflowId;
            targetWorkflowName = match.workflowName;
            currentWorkflowJson = await getWorkflow(targetWorkflowId) as unknown as Record<string, unknown>;
          }
        }
      } catch {
        logger.warn("Could not fetch workflows from n8n for modify intent");
      }

      if (!currentWorkflowJson) {
        assistantContent = lang === "ar"
          ? `⚠️ **لم أتمكن من تحديد الـ workflow المقصود.**\n\nيرجى:\n1. التأكد من أن n8n مضبوط ومتصل في **الإعدادات**\n2. أو ذكر اسم الـ workflow بوضوح في رسالتك\n3. أو استخدام زر "تحليل وإصلاح" من صفحة الـ Workflows`
          : `⚠️ **Could not identify which workflow to modify.**\n\nPlease:\n1. Make sure n8n is configured and connected in **Settings**\n2. Or mention the workflow name clearly in your message\n3. Or use the "Analyze & Fix" button from the Workflows page`;
      } else {
        const modifierResult = await runWorkflowModifier(
          currentWorkflowJson,
          content,
          lang,
          { openaiKey, geminiKey: geminiKey ?? undefined }
        );

        if (modifierResult.success && modifierResult.modifiedWorkflowJson) {
          let appliedToN8n = false;
          try {
            const updatePayload = {
              name: (modifierResult.modifiedWorkflowJson.name as string) ?? (currentWorkflowJson.name as string),
              nodes: modifierResult.modifiedWorkflowJson.nodes,
              connections: modifierResult.modifiedWorkflowJson.connections,
              settings: sanitizeSettings(modifierResult.modifiedWorkflowJson.settings ?? currentWorkflowJson.settings),
            };
            await updateWorkflow(targetWorkflowId!, updatePayload as Record<string, unknown>);
            appliedToN8n = true;
          } catch (applyErr) {
            logger.warn({ applyErr }, "Could not apply modification to n8n (non-SSE)");
          }

          if (lang === "ar") {
            assistantContent = appliedToN8n
              ? `✅ **تم تعديل الـ workflow "${targetWorkflowName}" وتطبيقه على n8n بنجاح!**\n\n📝 **التغييرات:** ${modifierResult.changesSummaryAr}`
              : `⚠️ **تم توليد التعديل لكن لم يُطبَّق تلقائياً على n8n.**\n\n📝 **التغييرات:** ${modifierResult.changesSummaryAr}\n\n\`\`\`json\n${JSON.stringify(modifierResult.modifiedWorkflowJson, null, 2)}\n\`\`\``;
          } else {
            assistantContent = appliedToN8n
              ? `✅ **Workflow "${targetWorkflowName}" modified and applied to n8n successfully!**\n\n📝 **Changes:** ${modifierResult.changesSummary}`
              : `⚠️ **Modification generated but not automatically applied to n8n.**\n\n📝 **Changes:** ${modifierResult.changesSummary}\n\n\`\`\`json\n${JSON.stringify(modifierResult.modifiedWorkflowJson, null, 2)}\n\`\`\``;
          }
        } else {
          assistantContent = lang === "ar"
            ? `❌ فشل توليد التعديل: ${modifierResult.error ?? "خطأ غير معروف"}`
            : `❌ Failed to generate modification: ${modifierResult.error ?? "Unknown error"}`;
        }
      }
    } catch (err) {
      logger.error({ err }, "Modify workflow non-SSE error");
      assistantContent = lang === "ar"
        ? `❌ خطأ أثناء تعديل الـ workflow: ${String(err)}`
        : `❌ Error while modifying workflow: ${String(err)}`;
    }

  } else if (openaiKey) {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

    const systemPrompt = lang === "ar"
      ? `أنت مساعد ذكي متخصص في إدارة n8n workflows. تتحدث باللغة العربية.`
      : `You are an AI assistant specialized in n8n workflow management.`;

    const contextMessages = [...previousMessages]
      .reverse()
      .slice(-10)
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        max_tokens: 1500,
        temperature: 0.7,
      });

      assistantContent = response.choices[0]?.message?.content ?? "";
      tokensUsed = response.usage?.total_tokens ?? null;
      modelUsed = "gpt-4o";
    } catch (err) {
      assistantContent = lang === "ar"
        ? `عذراً، تعذر الاتصال بـ GPT: ${String(err)}`
        : `Sorry, could not connect to GPT: ${String(err)}`;
    }
  } else {
    assistantContent = lang === "ar"
      ? "⚠️ لم يتم ضبط مفتاح OpenAI بعد. يرجى الذهاب إلى **الإعدادات**."
      : "⚠️ OpenAI API key is not configured. Please go to **Settings**.";
  }

  const [assistantMsg] = await db.insert(messagesTable).values({
    conversationId: convId,
    role: "assistant",
    content: assistantContent,
    modelUsed,
    tokensUsed,
  }).returning();

  await db.update(conversationsTable)
    .set({ messageCount: messageCount + 1, updatedAt: new Date() })
    .where(eq(conversationsTable.id, convId));

  res.json({
    success: true,
    data: {
      ...assistantMsg,
      generationSessionId,
      isWorkflowCreation: isCreateIntent,
    },
  });
});

// ─── SSE: Workflow Analysis ───────────────────────────────────────────────────
router.post("/conversations/:id/analyze-workflow", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  if (isNaN(convId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid conversation ID" } }); return; }

  const { workflowId, userContext } = req.body as { workflowId: string; userContext?: string };

  if (!workflowId) {
    res.status(400).json({ success: false, error: { code: "MISSING_WORKFLOW_ID", message: "workflowId is required" } });
    return;
  }

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
      sendEvent("error", { message: "مفتاح OpenAI غير مضبوط. يرجى الذهاب للإعدادات." });
      res.end();
      return;
    }

    sendEvent("start", { type: "analyze" });
    sendEvent("phase", { phase: 1, label: "GPT-4o: Analyzing workflow", labelAr: "GPT-4o: تحليل المشاكل", status: "pending" });
    sendEvent("phase", { phase: 2, label: "Gemini: Validating analysis", labelAr: "Gemini: التحقق من التحليل", status: "pending" });
    sendEvent("phase", { phase: 3, label: "GPT-4o: Generating fix", labelAr: "GPT-4o: إنشاء الإصلاح", status: "pending" });

    let workflowJson: Record<string, unknown>;
    try {
      workflowJson = await getWorkflow(workflowId) as unknown as Record<string, unknown>;
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

    const contextMsg = userContext ? `تحليل مسار العمل: ${workflowJson.name as string}\n\nملاحظة المستخدم: ${userContext}` : `تحليل مسار العمل: ${workflowJson.name as string}`;

    await db.insert(messagesTable).values({
      conversationId: convId,
      role: "user",
      content: contextMsg,
    });

    const prevCount = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, convId));

    const analyzerResult = await runWorkflowAnalyzer(
      workflowJson,
      errorDetails,
      userContext ?? "",
      {
        openaiKey,
        geminiKey: geminiKey ?? undefined,
        onPhaseUpdate: (phase) => {
          sendEvent("phase", phase);
        },
      },
    );

    const workflowName = workflowJson.name as string ?? "Workflow";
    const critCount = analyzerResult.problems.filter(p => p.severity === "critical").length;
    const highCount = analyzerResult.problems.filter(p => p.severity === "high").length;

    let assistantContent = "";
    if (analyzerResult.problems.length === 0) {
      assistantContent = `✅ **تحليل مسار العمل: "${workflowName}"**\n\nلم يتم اكتشاف أي مشاكل! يبدو أن مسار العمل مصمم بشكل صحيح.\n\n${analyzerResult.summaryAr}`;
    } else {
      assistantContent = `🔍 **تحليل مسار العمل: "${workflowName}"**\n\n${analyzerResult.summaryAr}\n\n`;
      assistantContent += `**المشاكل المكتشفة (${analyzerResult.problems.length}):**\n`;
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
