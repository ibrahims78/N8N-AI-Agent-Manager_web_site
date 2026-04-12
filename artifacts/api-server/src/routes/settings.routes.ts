import { Router } from "express";
import { db, systemSettingsTable, usersTable, conversationsTable, messagesTable, workflowVersionsTable, generationSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { encryptApiKey, decryptApiKey } from "../services/encryption.service";
import { testN8nConnection } from "../services/n8n.service";
import type { Request, Response } from "express";

const router = Router();

router.post("/n8n/test", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { url, apiKey } = req.body as { url: string; apiKey?: string };
  if (!url) {
    res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "URL is required" } });
    return;
  }

  let resolvedKey = apiKey;

  if (!resolvedKey || resolvedKey === "KEEP_EXISTING") {
    const settings = await db.select().from(systemSettingsTable).limit(1);
    const s = settings[0];
    if (s?.n8nApiKeyEncrypted && s?.n8nApiKeyIv) {
      try {
        resolvedKey = decryptApiKey(s.n8nApiKeyEncrypted, s.n8nApiKeyIv);
      } catch {
        res.status(400).json({ success: false, error: { code: "DECRYPT_ERROR", message: "Failed to retrieve saved API key" } });
        return;
      }
    } else {
      res.status(400).json({ success: false, error: { code: "MISSING_KEY", message: "API key required" } });
      return;
    }
  }

  const result = await testN8nConnection(url, resolvedKey);
  res.json({ success: true, data: result });
});

router.put("/n8n", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { url, apiKey } = req.body as { url: string; apiKey: string };
  const keepExisting = !apiKey || apiKey === "KEEP_EXISTING";

  const existing = await db.select().from(systemSettingsTable).limit(1);
  if (existing[0]) {
    const updateValues: Record<string, unknown> = { n8nUrl: url };
    if (!keepExisting) {
      const { encryptedKey, iv } = encryptApiKey(apiKey);
      updateValues.n8nApiKeyEncrypted = encryptedKey;
      updateValues.n8nApiKeyIv = iv;
    }
    await db.update(systemSettingsTable).set(updateValues).where(eq(systemSettingsTable.id, existing[0].id));
  } else {
    const { encryptedKey, iv } = keepExisting ? { encryptedKey: null, iv: null } : encryptApiKey(apiKey);
    await db.insert(systemSettingsTable).values({
      n8nUrl: url,
      n8nApiKeyEncrypted: encryptedKey,
      n8nApiKeyIv: iv,
    });
  }

  res.json({ success: true, message: "N8N settings saved" });
});

router.get("/n8n", authenticate, async (req: Request, res: Response): Promise<void> => {
  const settings = await db.select().from(systemSettingsTable).limit(1);
  const s = settings[0];

  res.json({
    success: true,
    data: {
      url: s?.n8nUrl ?? null,
      hasApiKey: !!(s?.n8nApiKeyEncrypted),
      onboardingComplete: s?.onboardingComplete === "true",
    },
  });
});

router.post("/openai/test", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { apiKey } = req.body as { apiKey?: string };
  let resolvedKey = apiKey;

  if (!resolvedKey) {
    const settings = await db.select().from(systemSettingsTable).limit(1);
    const s = settings[0];
    if (s?.openaiKeyEncrypted && s?.openaiKeyIv) {
      try {
        resolvedKey = decryptApiKey(s.openaiKeyEncrypted, s.openaiKeyIv);
      } catch {
        res.status(400).json({ success: false, error: { code: "DECRYPT_ERROR", message: "Failed to retrieve saved API key" } });
        return;
      }
    } else {
      res.status(400).json({ success: false, error: { code: "MISSING_KEY", message: "API key required" } });
      return;
    }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${resolvedKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 401) {
      res.json({ success: true, data: { valid: false, message: "مفتاح API غير صالح" } });
      return;
    }

    if (!response.ok) {
      res.json({ success: true, data: { valid: false, message: `خطأ: ${response.status}` } });
      return;
    }

    const data = await response.json() as { data: Array<{ id: string }> };
    const gpt4Available = data.data?.some((m) => m.id?.includes("gpt-4"));

    res.json({
      success: true,
      data: {
        valid: true,
        modelAvailable: gpt4Available,
        message: gpt4Available ? "المفتاح صالح وGPT-4 متاح" : "المفتاح صالح لكن GPT-4 غير متاح",
      },
    });
  } catch {
    res.json({ success: true, data: { valid: false, message: "تعذر الاتصال بـ OpenAI" } });
  }
});

router.put("/openai", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { apiKey } = req.body as { apiKey: string };
  const { encryptedKey, iv } = encryptApiKey(apiKey);

  const existing = await db.select().from(systemSettingsTable).limit(1);
  if (existing[0]) {
    await db.update(systemSettingsTable).set({
      openaiKeyEncrypted: encryptedKey,
      openaiKeyIv: iv,
      openaiKeyUpdatedAt: new Date(),
    }).where(eq(systemSettingsTable.id, existing[0].id));
  } else {
    await db.insert(systemSettingsTable).values({
      openaiKeyEncrypted: encryptedKey,
      openaiKeyIv: iv,
      openaiKeyUpdatedAt: new Date(),
    });
  }

  res.json({ success: true, message: "OpenAI key saved" });
});

router.post("/gemini/test", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { apiKey } = req.body as { apiKey?: string };
  let resolvedKey = apiKey;

  if (!resolvedKey) {
    const settings = await db.select().from(systemSettingsTable).limit(1);
    const s = settings[0];
    if (s?.geminiKeyEncrypted && s?.geminiKeyIv) {
      try {
        resolvedKey = decryptApiKey(s.geminiKeyEncrypted, s.geminiKeyIv);
      } catch {
        res.status(400).json({ success: false, error: { code: "DECRYPT_ERROR", message: "Failed to retrieve saved API key" } });
        return;
      }
    } else {
      res.status(400).json({ success: false, error: { code: "MISSING_KEY", message: "API key required" } });
      return;
    }
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${resolvedKey}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      res.json({ success: true, data: { valid: false, message: "مفتاح Gemini غير صالح" } });
      return;
    }

    if (!response.ok) {
      res.json({ success: true, data: { valid: false, message: `خطأ: ${response.status}` } });
      return;
    }

    const data = await response.json() as { models: Array<{ name: string }> };
    const geminiAvailable = data.models?.some((m) => m.name?.includes("gemini"));

    res.json({
      success: true,
      data: {
        valid: true,
        modelAvailable: geminiAvailable,
        dailyQuota: "1,500 طلب/يوم (مجاني)",
        message: "مفتاح Gemini صالح وجاهز",
      },
    });
  } catch {
    res.json({ success: true, data: { valid: false, message: "تعذر الاتصال بـ Gemini" } });
  }
});

router.put("/gemini", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { apiKey } = req.body as { apiKey: string };
  const { encryptedKey, iv } = encryptApiKey(apiKey);

  const existing = await db.select().from(systemSettingsTable).limit(1);
  if (existing[0]) {
    await db.update(systemSettingsTable).set({
      geminiKeyEncrypted: encryptedKey,
      geminiKeyIv: iv,
      geminiKeyUpdatedAt: new Date(),
    }).where(eq(systemSettingsTable.id, existing[0].id));
  } else {
    await db.insert(systemSettingsTable).values({
      geminiKeyEncrypted: encryptedKey,
      geminiKeyIv: iv,
      geminiKeyUpdatedAt: new Date(),
    });
  }

  res.json({ success: true, message: "Gemini key saved" });
});

router.get("/system-status", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const settings = await db.select().from(systemSettingsTable).limit(1);
  const s = settings[0];

  const services = [
    { name: "n8n", status: s?.n8nUrl && s?.n8nApiKeyEncrypted ? "ok" : "unconfigured", message: s?.n8nUrl ? "متصل" : "غير مضبوط" },
    { name: "openai", status: s?.openaiKeyEncrypted ? "ok" : "unconfigured", message: s?.openaiKeyEncrypted ? "مضبوط" : "غير مضبوط" },
    { name: "gemini", status: s?.geminiKeyEncrypted ? "ok" : "unconfigured", message: s?.geminiKeyEncrypted ? "مضبوط" : "غير مضبوط" },
    { name: "database", status: "ok", message: "متصل" },
  ];

  res.json({
    success: true,
    data: {
      services,
      allReady: services.every(sv => sv.status === "ok"),
    },
  });
});

router.post("/onboarding-complete", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const existing = await db.select().from(systemSettingsTable).limit(1);
  if (existing[0]) {
    await db.update(systemSettingsTable).set({ onboardingComplete: "true" }).where(eq(systemSettingsTable.id, existing[0].id));
  } else {
    await db.insert(systemSettingsTable).values({ onboardingComplete: "true" });
  }

  await db.update(usersTable).set({ onboardingComplete: true }).where(eq(usersTable.id, req.user.userId));

  res.json({ success: true, message: "Onboarding complete" });
});

// ─── Danger Zone ─────────────────────────────────────────────────────────────

router.delete("/danger/conversations", authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(messagesTable);
    await db.delete(generationSessionsTable);
    await db.delete(conversationsTable);
    res.json({ success: true, message: "All conversations deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "DELETE_ERROR", message: String(err) } });
  }
});

router.delete("/danger/versions", authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(workflowVersionsTable);
    res.json({ success: true, message: "All workflow versions deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "DELETE_ERROR", message: String(err) } });
  }
});

router.post("/danger/factory-reset", authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(messagesTable);
    await db.delete(generationSessionsTable);
    await db.delete(conversationsTable);
    await db.delete(workflowVersionsTable);
    await db.update(systemSettingsTable).set({
      n8nUrl: null,
      n8nApiKeyEncrypted: null,
      n8nApiKeyIv: null,
      openaiKeyEncrypted: null,
      openaiKeyIv: null,
      geminiKeyEncrypted: null,
      geminiKeyIv: null,
      onboardingComplete: "false",
    });
    res.json({ success: true, message: "Factory reset complete" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "RESET_ERROR", message: String(err) } });
  }
});

export { router as settingsRouter };
