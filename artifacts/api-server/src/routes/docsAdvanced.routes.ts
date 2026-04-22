/**
 * /api/catalog/docs-advanced/* — كل ميزات نظام التوثيقات الاحترافية:
 *   - GET  /search                — بحث شامل عبر كل العقد (BM25)
 *   - POST /reindex               — إعادة بناء فهرس الأقسام (admin)
 *   - GET  /:nodeType/operations  — استخراج Sub-nodes / Operations
 *   - GET  /:nodeType/history     — قائمة الإصدارات السابقة
 *   - GET  /history/:id           — جلب نسخة تاريخية
 *   - POST /history/:id/rollback  — استعادة نسخة (admin)
 *   - PUT  /:nodeType/manual      — حفظ تحرير يدوي (admin)
 *   - DELETE /:nodeType/manual    — مسح التحرير اليدوي (admin)
 *   - GET  /guides                — قائمة كل الـ guides
 *   - GET  /guides/:slug          — جلب guide واحد
 *   - POST /guides/refresh-all    — إعادة جلب كل الـ guides (admin, SSE)
 *   - GET  /sync                  — إعدادات المزامنة الدورية
 *   - PUT  /sync                  — تحديث الإعدادات (admin)
 *   - POST /sync/run              — تشغيل مزامنة الآن (admin)
 *   - GET  /export.html           — تصدير كل التوثيقات كـ HTML (للطباعة → PDF)
 *   - GET  /export.md             — تصدير كل التوثيقات كـ Markdown مجمَّع
 */
import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  globalDocsSearch,
  reindexAllSections,
  getNodeOperations,
  listDocHistory,
  getHistoryEntry,
  rollbackToHistory,
  setManualOverride,
  clearManualOverride,
  fetchAllGuides,
  listGuides,
  getGuide,
  fetchGuide,
  fetchArabicGuide,
  getSyncSettings,
  updateSyncSettings,
  runAutoSync,
  exportAllDocsMarkdown,
  exportAllDocsHtml,
} from "../services/docsAdvanced.service";

const router: Router = Router();
type DocLang = "en" | "ar";

function pickLang(q: unknown): DocLang {
  return q === "ar" ? "ar" : "en";
}

/* ─────────────── Search ─────────────── */
router.get("/search", authenticate, async (req: Request, res: Response): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  const lang = pickLang(req.query.lang);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  if (!q) {
    res.json({ success: true, data: { hits: [], query: "" } });
    return;
  }
  const hits = await globalDocsSearch(q, lang, limit);
  res.json({ success: true, data: { query: q, language: lang, hits } });
});

router.post("/reindex", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const lang = req.query.lang ? pickLang(req.query.lang) : undefined;
  const total = await reindexAllSections(lang);
  res.json({ success: true, data: { totalSections: total, language: lang ?? "all" } });
});

/* ─────────────── Operations / Sub-nodes ─────────────── */
router.get("/:nodeType/operations", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = pickLang(req.query.lang);
  const result = await getNodeOperations(req.params.nodeType, lang);
  res.json({ success: true, data: { nodeType: req.params.nodeType, language: lang, ...result } });
});

/* ─────────────── History / Versioning ─────────────── */
router.get("/:nodeType/history", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = pickLang(req.query.lang);
  const entries = await listDocHistory(req.params.nodeType, lang);
  res.json({ success: true, data: { entries } });
});

router.get("/history/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const entry = await getHistoryEntry(id);
  if (!entry) {
    res.status(404).json({ success: false, error: "Not found" });
    return;
  }
  res.json({ success: true, data: entry });
});

router.post(
  "/history/:id/rollback",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const userId = (req as Request & { user?: { id: number } }).user?.id ?? 0;
    const result = await rollbackToHistory(id, userId);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json({ success: true, data: result });
  }
);

/* ─────────────── Manual Override ─────────────── */
router.put(
  "/:nodeType/manual",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const lang = pickLang(req.query.lang);
    const { markdown, note } = req.body as { markdown?: string; note?: string };
    if (!markdown || markdown.length < 5) {
      res.status(400).json({ success: false, error: "markdown is required" });
      return;
    }
    const userId = (req as Request & { user?: { id: number } }).user?.id ?? 0;
    await setManualOverride(req.params.nodeType, lang, markdown, userId, note);
    res.json({ success: true });
  }
);

router.delete(
  "/:nodeType/manual",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const lang = pickLang(req.query.lang);
    const userId = (req as Request & { user?: { id: number } }).user?.id ?? 0;
    const r = await clearManualOverride(req.params.nodeType, lang, userId);
    res.json({ success: r.success });
  }
);

/* ─────────────── Guides (general n8n docs) ─────────────── */
router.get("/guides", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = pickLang(req.query.lang);
  const list = await listGuides(lang);
  res.json({ success: true, data: { guides: list } });
});

router.get("/guides/:slug", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = pickLang(req.query.lang);
  const force = req.query.force === "true";
  let g = await getGuide(req.params.slug, lang);
  if (!g || force || !g.markdown) {
    const fetched =
      lang === "ar"
        ? await fetchArabicGuide(req.params.slug, force)
        : await fetchGuide(req.params.slug, force);
    if (!fetched) {
      res.status(404).json({ success: false, error: "Guide not registered" });
      return;
    }
    g = fetched;
  }
  res.json({ success: true, data: g });
});

router.post(
  "/guides/refresh-all",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const force = req.query.force === "true";
    // ?translate=true also produces Arabic translations after the EN fetch.
    const translate = req.query.translate === "true";
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    try {
      const summary = await fetchAllGuides(
        force,
        (p) => {
          res.write(`data: ${JSON.stringify({ type: "progress", ...p })}\n\n`);
        },
        { translate }
      );
      res.write(`data: ${JSON.stringify({ type: "done", ...summary })}\n\n`);
    } catch (err) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: err instanceof Error ? err.message : String(err),
        })}\n\n`
      );
    } finally {
      res.end();
    }
  }
);

/* ─────────────── Auto-Sync ─────────────── */
router.get("/sync", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const s = await getSyncSettings();
  res.json({ success: true, data: s });
});

router.put(
  "/sync",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { enabled, intervalHours, autoTranslate } = req.body as {
      enabled?: boolean;
      intervalHours?: number;
      autoTranslate?: boolean;
    };
    const s = await updateSyncSettings({ enabled, intervalHours, autoTranslate });
    res.json({ success: true, data: s });
  }
);

router.post(
  "/sync/run",
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response): Promise<void> => {
    const r = await runAutoSync();
    res.json({ success: true, data: r });
  }
);

/* ─────────────── Export ─────────────── */
router.get("/export.html", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = pickLang(req.query.lang);
  const html = await exportAllDocsHtml(lang);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="n8n-docs-${lang}-${new Date().toISOString().slice(0, 10)}.html"`
  );
  res.send(html);
});

router.get("/export.md", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = pickLang(req.query.lang);
  const md = await exportAllDocsMarkdown(lang);
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="n8n-docs-${lang}-${new Date().toISOString().slice(0, 10)}.md"`
  );
  res.send(md);
});

export const docsAdvancedRouter = router;
