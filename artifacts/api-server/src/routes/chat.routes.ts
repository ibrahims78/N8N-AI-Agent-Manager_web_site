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

  const page = parseInt(req.query.page as string || "1", 10);
  const limit = parseInt(req.query.limit as string || "20", 10);
  const offset = (page - 1) * limit;

  const isAdmin = req.user.role === "admin";
  const query = db
    .select()
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.updatedAt))
    .limit(limit)
    .offset(offset);

  const conversations = isAdmin
    ? await query
    : await query.where(eq(conversationsTable.userId, req.user.userId));

  res.json({ success: true, data: { conversations, total: conversations.length } });
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
  await db.delete(conversationsTable).where(eq(conversationsTable.id, convId));
  res.json({ success: true, message: "Conversation deleted" });
});

router.post("/conversations/:id/messages", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const convId = parseInt(req.params.id, 10);
  const { content } = req.body as { content: string; mode?: string };

  if (!content) {
    res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Message content required" } });
    return;
  }

  const isArabic = /[\u0600-\u06FF]/.test(content);
  const lang = isArabic ? "ar" : "en";

  // Save the user message
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
  let tokensUsed: number | undefined;
  let generationSessionId: number | undefined;

  // ── Determine if this is a workflow creation request ──────────────────────
  const isCreateIntent = detectWorkflowCreationIntent(content);

  if (isCreateIntent && openaiKey && geminiKey) {
    // ── PATH A: Sequential 4-Phase Engine ──────────────────────────────────
    logger.info({ convId, content: content.slice(0, 50) }, "Routing to sequential engine");

    const engineResult = await runSequentialEngine(content, {
      openaiKey,
      geminiKey,
      maxRefinementRounds: 2,
      qualityThreshold: 80,
    });

    assistantContent = engineResult.userMessage;
    modelUsed = "sequential-gpt4o+gemini";
    tokensUsed = undefined;

    // Save generation session to DB
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

      // Append workflow JSON to assistant message if available
      if (engineResult.workflowJson) {
        assistantContent += `\n\n\`\`\`json\n${JSON.stringify(engineResult.workflowJson, null, 2)}\n\`\`\``;
      }
    }
  } else if (isCreateIntent && openaiKey && !geminiKey) {
    // ── PATH B: GPT-4o only (no Gemini key configured) ────────────────────
    logger.info({ convId }, "Gemini key not configured — using GPT-4o only mode");

    const noGeminiNote = lang === "ar"
      ? "\n\n⚠️ *ملاحظة: مفتاح Gemini API غير مُضبوط. استُخدم GPT-4o فقط بدون مراجعة Gemini. للحصول على أفضل جودة، أضف مفتاح Gemini في الإعدادات.*"
      : "\n\n⚠️ *Note: Gemini API key is not configured. GPT-4o only mode was used without Gemini review. For best quality, add Gemini key in Settings.*";

    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: openaiKey, timeout: 90000 });

      const systemPrompt = lang === "ar"
        ? `أنت خبير متقدم في بناء n8n workflows. أنشئ workflow JSON صالح وكامل بناءً على طلب المستخدم. أرجع JSON فقط، بدون أي نص إضافي.`
        : `You are an advanced n8n workflow expert. Create a valid, complete workflow JSON based on the user's request. Return JSON only, without any additional text.`;

      const p1Response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
        max_tokens: 3000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const workflowJson = p1Response.choices[0]?.message?.content ?? "{}";
      tokensUsed = p1Response.usage?.total_tokens;

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
    // ── PATH C: Regular Chat (Q&A, help, etc.) ────────────────────────────
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

    const systemPrompt = lang === "ar"
      ? `أنت مساعد ذكي متخصص في إدارة n8n workflows. تتحدث باللغة العربية. ساعد المستخدم في:
- شرح كيفية عمل n8n ومكوناته
- تشخيص مشاكل الـ workflows
- تعديل workflows موجودة
- الإجابة على أسئلة عامة حول n8n
إذا أراد المستخدم إنشاء workflow جديد، اطلب منه توصيف تفصيلي للمهمة.`
      : `You are an AI assistant specialized in n8n workflow management. Help users with:
- Understanding how n8n works and its components
- Diagnosing workflow issues
- Modifying existing workflows
- Answering general n8n questions
If a user wants to create a new workflow, ask for a detailed description of the task.`;

    const contextMessages = [...previousMessages]
      .reverse()
      .slice(-10)
      .map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...contextMessages,
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      assistantContent = response.choices[0]?.message?.content ?? "";
      tokensUsed = response.usage?.total_tokens;
      modelUsed = "gpt-4o";
    } catch (err) {
      assistantContent = lang === "ar"
        ? `عذراً، تعذر الاتصال بـ GPT: ${String(err)}`
        : `Sorry, could not connect to GPT: ${String(err)}`;
    }
  } else {
    // ── PATH D: No API Keys ───────────────────────────────────────────────
    assistantContent = lang === "ar"
      ? "⚠️ لم يتم ضبط مفتاح OpenAI بعد. يرجى الذهاب إلى **الإعدادات** وإضافة مفتاح API لبدء استخدام الذكاء الاصطناعي."
      : "⚠️ OpenAI API key is not configured. Please go to **Settings** and add your API key to start using AI features.";
  }

  // Save assistant response
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
