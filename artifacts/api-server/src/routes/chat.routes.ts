import { Router } from "express";
import { db, conversationsTable, messagesTable, systemSettingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { decryptApiKey } from "../services/encryption.service";
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
  const { content, mode } = req.body as { content: string; mode?: string };

  if (!content) {
    res.status(400).json({ success: false, error: { code: "MISSING_CONTENT", message: "Message content required" } });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId: convId,
    role: "user",
    content,
  });

  const { openaiKey } = await getApiKeys();

  let assistantContent = "";
  let modelUsed = "gpt-4.1";

  const isArabic = /[\u0600-\u06FF]/.test(content);
  const lang = isArabic ? "ar" : "en";

  const previousMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(20);

  const contextMessages = previousMessages.reverse().map(m => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  if (openaiKey) {
    try {
      const systemPrompt = lang === "ar"
        ? `أنت مساعد ذكي متخصص في إدارة n8n workflows. تتحدث باللغة العربية. مهمتك مساعدة المستخدم في إنشاء وتعديل وتشخيص n8n workflows. إذا طُلب منك إنشاء workflow، اشرح ما ستفعله وأعطِ مثالاً على بنية JSON.`
        : `You are an AI assistant specialized in n8n workflow management. You speak English. Your task is to help users create, edit, and diagnose n8n workflows.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages.slice(-10),
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }>; usage?: { total_tokens?: number } };
        assistantContent = data.choices[0]?.message?.content ?? "";
        modelUsed = "gpt-4.1";
      } else {
        assistantContent = lang === "ar"
          ? "عذراً، حدث خطأ في الاتصال بـ GPT. يرجى التحقق من مفتاح API."
          : "Sorry, there was an error connecting to GPT. Please check your API key.";
      }
    } catch {
      assistantContent = lang === "ar"
        ? "عذراً، تعذر الاتصال بنموذج الذكاء الاصطناعي. يرجى المحاولة لاحقاً."
        : "Sorry, could not connect to the AI model. Please try again later.";
    }
  } else {
    assistantContent = lang === "ar"
      ? "لم يتم ضبط مفتاح OpenAI بعد. يرجى الذهاب إلى الإعدادات وإضافة مفتاح API."
      : "OpenAI API key is not configured. Please go to Settings and add your API key.";
  }

  const [assistantMsg] = await db.insert(messagesTable).values({
    conversationId: convId,
    role: "assistant",
    content: assistantContent,
    modelUsed,
  }).returning();

  await db.update(conversationsTable)
    .set({ messageCount: previousMessages.length + 2, updatedAt: new Date() })
    .where(eq(conversationsTable.id, convId));

  res.json({ success: true, data: assistantMsg });
});

export { router as chatRouter };
