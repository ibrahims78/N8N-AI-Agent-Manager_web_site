import { Router } from "express";
import { db, conversationsTable, messagesTable, systemSettingsTable, generationSessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { decryptApiKey } from "../services/encryption.service";
import { runSequentialEngine, detectWorkflowCreationIntent } from "../services/sequentialEngine.service";
import { logger } from "../lib/logger";
import type { Request, Response } from "express";

const router = Router();

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
    } else {
      sendEvent("start", { type: "chat" });

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

      const isArabicReq = /[\u0600-\u06FF]/.test(content);
      const systemPrompt = isArabicReq
        ? `أنت مساعد ذكي متخصص في n8n. تحدث بالعربية. ساعد في شرح n8n وتشخيص المشاكل وتعديل الـ workflows.`
        : `You are an AI assistant specialized in n8n workflow management. Help with understanding, diagnosing, and modifying workflows.`;

      const contextMessages = [...previousMessages]
        .reverse()
        .slice(-10)
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      let assistantContent = "";
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
          max_tokens: 1500,
          temperature: 0.7,
        });
        assistantContent = response.choices[0]?.message?.content ?? "";
      } catch (err) {
        assistantContent = isArabicReq
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

export { router as chatRouter };
