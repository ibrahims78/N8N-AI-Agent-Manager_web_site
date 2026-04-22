/**
 * /api/catalog/docs/* — Markdown documentation cache for nodes (English + Arabic).
 *
 * Regular endpoints:
 *   GET  /stats              — docs stats (totals + local file counts)
 *   GET  /coverage           — per-node coverage map
 *   GET  /:nodeType          — fetch/return single doc (lazy if not cached)
 *   POST /:nodeType/refresh  — force re-fetch/translate a single doc (admin)
 *   GET  /:nodeType/search   — keyword search within a doc
 *
 * Streaming (SSE) endpoints — admin only, stream progress events:
 *   POST /fetch-all-stream      — bulk fetch English docs with live progress
 *   POST /translate-all-stream  — bulk translate to Arabic with live progress
 */
import { Router } from "express";
import type { Request, Response } from "express";
import fs from "fs";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  getEnglishDoc,
  getArabicDoc,
  bulkFetchEnglishDocs,
  bulkTranslateArabicDocs,
  ensureAiClientAvailable,
  getDocsStats,
  getDocsCoverage,
  searchWithinNodeDoc,
  type BulkFetchProgress,
} from "../services/nodeDocs.service";
import {
  resolveAssetPath,
  refreshRepoTree,
  getAssetsStats,
} from "../services/nodeDocsPipeline.service";

const router: Router = Router();

/* ──────────────── Static asset serving (images for docs) ────────────────
 * Serves images that the pipeline downloaded from n8n-docs to
 * `lib/n8n-nodes-catalog/docs/_assets/<safeNode>/<file>`.
 *
 * Public on purpose — these are upstream public images from n8n-docs and
 * <img> requests inside markdown can't carry custom auth headers.
 */
router.get(
  "/assets/:safeNode/:filename",
  async (req: Request, res: Response): Promise<void> => {
    const file = await resolveAssetPath(req.params.safeNode, req.params.filename);
    if (!file) {
      res.status(404).end();
      return;
    }
    const ext = file.toLowerCase().split(".").pop() || "";
    const mime: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      ico: "image/x-icon",
    };
    res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    fs.createReadStream(file).pipe(res);
  }
);

router.get(
  "/assets-stats",
  authenticate,
  async (_req: Request, res: Response): Promise<void> => {
    const stats = await getAssetsStats();
    res.json({ success: true, data: stats });
  }
);

router.post(
  "/refresh-tree",
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response): Promise<void> => {
    const count = await refreshRepoTree();
    res.json({ success: true, data: { paths: count } });
  }
);

/* ──────────────── Stats & Coverage ──────────────── */

router.get("/stats", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const stats = await getDocsStats();
  res.json({ success: true, data: stats });
});

router.get("/coverage", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const cov = await getDocsCoverage();
  res.json({ success: true, data: { coverage: cov } });
});

/* ──────────────── Single-node endpoints ──────────────── */

router.get("/:nodeType", authenticate, async (req: Request, res: Response): Promise<void> => {
  const lang = (req.query.lang as string) === "ar" ? "ar" : "en";
  const force = req.query.force === "true";
  const result =
    lang === "ar"
      ? await getArabicDoc(req.params.nodeType, force)
      : await getEnglishDoc(req.params.nodeType, force);
  if (!result.markdown) {
    res.status(404).json({
      success: false,
      error: { code: "DOC_NOT_AVAILABLE", message: result.error || "Doc not available" },
      data: result,
    });
    return;
  }
  res.json({ success: true, data: result });
});

router.post(
  "/:nodeType/refresh",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const lang = (req.query.lang as string) === "ar" ? "ar" : "en";
    const result =
      lang === "ar"
        ? await getArabicDoc(req.params.nodeType, true)
        : await getEnglishDoc(req.params.nodeType, true);
    res.json({ success: !!result.markdown, data: result });
  }
);

router.get(
  "/:nodeType/search",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const q = (req.query.q as string) || "";
    const lang = (req.query.lang as string) === "ar" ? "ar" : "en";
    const result = await searchWithinNodeDoc(req.params.nodeType, q, lang, 3);
    res.json({ success: true, data: result });
  }
);

/* ──────────────── Bulk (non-streaming, legacy) ──────────────── */

router.post(
  "/refresh-all",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const force = req.query.force === "true";
    const concurrency = Math.min(
      Math.max(parseInt(req.query.concurrency as string) || 6, 1),
      12
    );
    try {
      const progress = await bulkFetchEnglishDocs({ force, concurrency });
      res.json({ success: true, data: progress });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { code: "BULK_FETCH_FAILED", message: err instanceof Error ? err.message : String(err) },
      });
    }
  }
);

/* ──────────────── SSE Streaming: Bulk fetch English ──────────────── */

/**
 * POST /catalog/docs/fetch-all-stream
 * Streams Server-Sent Events with real-time progress while bulk-fetching
 * English documentation from GitHub for all nodes.
 *
 * Event types:
 *   progress  — { total, attempted, fetched, failed, current? }
 *   done      — same shape, signals completion
 *   error     — { message }
 */
router.post(
  "/fetch-all-stream",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const force = req.query.force === "true";
    const concurrency = Math.min(
      Math.max(parseInt(req.query.concurrency as string) || 6, 1),
      12
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const send = (event: string, data: object) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      // Attempt flush for proxied environments
      if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
        (res as unknown as { flush: () => void }).flush();
      }
    };

    try {
      const result = await bulkFetchEnglishDocs(
        { force, concurrency },
        (p: BulkFetchProgress) => send("progress", p)
      );
      send("done", result);
    } catch (err) {
      send("error", { message: err instanceof Error ? err.message : String(err) });
    }

    res.end();
  }
);

/* ──────────────── SSE Streaming: Bulk translate Arabic ──────────────── */

/**
 * POST /catalog/docs/translate-all-stream
 * Streams Server-Sent Events with real-time progress while bulk-translating
 * all English docs to Arabic via OpenAI.
 *
 * Event types:
 *   progress  — { total, attempted, fetched, failed, current? }
 *   done      — same shape, signals completion
 *   error     — { message }
 */
router.post(
  "/translate-all-stream",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const force = req.query.force === "true";
    const concurrency = Math.min(
      Math.max(parseInt(req.query.concurrency as string) || 2, 1),
      4
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const send = (event: string, data: object) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
        (res as unknown as { flush: () => void }).flush();
      }
    };

    try {
      // Pre-flight: fail fast with a clear message if no AI key is configured
      // — otherwise the loop would attempt 500+ nodes that all fail silently.
      try {
        await ensureAiClientAvailable();
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : String(err),
          code: "no_ai_key",
        });
        res.end();
        return;
      }
      const result = await bulkTranslateArabicDocs(
        { force, concurrency },
        (p: BulkFetchProgress) => send("progress", p)
      );
      send("done", result);
    } catch (err) {
      send("error", { message: err instanceof Error ? err.message : String(err) });
    }

    res.end();
  }
);

export const catalogDocsRouter = router;
