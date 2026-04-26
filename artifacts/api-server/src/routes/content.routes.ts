/**
 * Unified content API — Phase 6A of unified-content-cache-plan.md.
 *
 * Routes:
 *   GET    /api/content/:kind/stats
 *   POST   /api/content/:kind/refresh-all?smart=true&dryRun=true&force=true&translate=true&concurrency=N
 *   GET    /api/content/:kind/:slug/diff?lang=en|ar
 *   PUT    /api/content/:kind/:slug/override?lang=en|ar
 *   DELETE /api/content/:kind/:slug/override?lang=en|ar
 *   GET    /api/content/:kind/history?limit=N
 *
 * `:kind` ∈ { 'guide', 'node-doc' }.
 *
 * Backward-compat contract (§15.5): legacy paths under `/api/catalog/docs/*`
 * and `/api/catalog/docs-advanced/*` keep working. This router is a thin
 * dispatcher over the same service functions those legacy routes call —
 * there is no behavioural divergence.
 *
 * `history` returns `[]` until Phase 7 wires the `content_refresh_history`
 * table; the endpoint shape is published now so the UI can be built once.
 */
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

import {
  getDocsStats,
  getEnglishDoc,
  getArabicDoc,
} from "../services/nodeDocs.service";
import { smartRefreshAllNodeDocs } from "../services/nodeDocs.smartRefresh";
import type { RefreshMode, SmartRefreshEntryResult } from "../services/smartCache";

import {
  getGuidesStats,
  fetchAllGuides,
  getGuide,
  setGuideManualOverride,
  clearGuideManualOverride,
  setManualOverride,
  clearManualOverride,
} from "../services/docsAdvanced.service";
import {
  recordRefreshRun,
  listRefreshHistory,
} from "../services/contentRefreshHistory.service";

const router: Router = Router();

type ContentKind = "guide" | "node-doc";
type DocLang = "en" | "ar";

function pickLang(q: unknown): DocLang {
  return q === "ar" ? "ar" : "en";
}

function pickKind(req: Request, res: Response): ContentKind | null {
  const k = req.params.kind;
  if (k === "guide" || k === "node-doc") return k;
  res.status(400).json({
    success: false,
    error: {
      code: "INVALID_KIND",
      message: `unknown content kind '${k}'. Expected one of: guide, node-doc.`,
    },
  });
  return null;
}

function getUserId(req: Request): number {
  return (req as Request & { user?: { id: number } }).user?.id ?? 0;
}

function parseConcurrency(q: unknown, fallback = 6, max = 12): number {
  const n = parseInt(String(q ?? fallback), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, n));
}

/* ─────────────────────── /:kind/stats ─────────────────────── */
router.get(
  "/:kind/stats",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    if (kind === "guide") {
      const stats = await getGuidesStats();
      res.json({ success: true, data: { kind, ...stats } });
      return;
    }
    const stats = await getDocsStats();
    res.json({ success: true, data: { kind, ...stats } });
  },
);

/* ─────────────────────── /:kind/history ───────────────────────
 * Phase 7: reads from `content_refresh_history`, newest first, up to N rows.
 */
router.get(
  "/:kind/history",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    const limit = Math.min(Math.max(Number(req.query.limit ?? 30), 1), 200);
    const entries = await listRefreshHistory(kind, limit);
    res.json({ success: true, data: { kind, limit, entries } });
  },
);

/* ─────────────────────── /:kind/refresh-all ─────────────────────── */
router.post(
  "/:kind/refresh-all",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    const force = req.query.force === "true";
    const smart = req.query.smart === "true";
    const dryRun = req.query.dryRun === "true";
    const translate = req.query.translate === "true";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const send = (event: string, data: object) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      const flush = (res as Response & { flush?: () => void }).flush;
      if (typeof flush === "function") flush.call(res);
    };

    // Phase 7: persist a single history row per run, mapping the kind-specific
    // summary shape into the unified columns. Best-effort — `recordRefreshRun`
    // never throws.
    const startedAt = Date.now();
    const userId = getUserId(req) || null;
    const mode: RefreshMode = force ? "force" : dryRun ? "dry-run" : "smart";
    let errorSummary: string | null = null;
    try {
      send("start", { kind, smart, dryRun, force, translate });
      if (kind === "guide") {
        const summary = await fetchAllGuides(
          force,
          (p) => send("progress", { kind, ...p }),
          { translate, smart, dryRun },
        );
        send("done", { kind, ...summary });
        // Spec §12: dry-run is a "predict only" mode and MUST NOT pollute
        // the diagnostics history. Persist only for smart/force runs.
        if (!dryRun) {
          await recordRefreshRun({
            kind,
            mode,
            triggeredBy: userId,
            total: summary.total,
            // For guides, history records the EN buckets (the canonical
            // English source-of-truth refresh). AR buckets are visible in
            // the SSE done event but conceptually a translation by-product.
            added: summary.enAdded,
            updated: summary.enUpdated,
            unchanged: summary.enUnchanged,
            failed: summary.failed,
            durationMs: Date.now() - startedAt,
            aiCalls: 0,
            networkBytes: 0,
          });
        }
      } else {
        const concurrency = parseConcurrency(req.query.concurrency);
        const ndMode: RefreshMode = force ? "force" : dryRun ? "dry-run" : smart ? "smart" : "smart";
        // Optional `?only=type1,type2` filter (used by Phase 7 regression
        // tests so we can run a `force` pass over a single node without
        // hammering the upstream catalog of 541 entries).
        const onlyParam = typeof req.query.only === "string" ? req.query.only : "";
        const only = onlyParam
          ? onlyParam.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;
        const summary = await smartRefreshAllNodeDocs({
          mode: ndMode,
          concurrency,
          only,
          onProgress: (entry: SmartRefreshEntryResult, sum) => {
            send("progress", {
              kind,
              slug: entry.slug,
              status: entry.status,
              total: sum.total,
              done: sum.added + sum.updated + sum.unchanged + sum.failed,
              added: sum.added,
              updated: sum.updated,
              unchanged: sum.unchanged,
              failed: sum.failed,
            });
          },
        });
        send("done", { kind, ...summary });
        if (!dryRun) {
          await recordRefreshRun({
            kind,
            mode: ndMode,
            triggeredBy: userId,
            total: summary.total,
            added: summary.added,
            updated: summary.updated,
            unchanged: summary.unchanged,
            failed: summary.failed,
            durationMs: summary.durationMs,
            aiCalls: 0,
            networkBytes: summary.networkBytes ?? 0,
          });
        }
      }
    } catch (err) {
      errorSummary = err instanceof Error ? err.message : String(err);
      send("error", { kind, message: errorSummary });
      // Still try to record the failed run so the operator can see it —
      // unless we were in dry-run mode (which must never write history).
      if (!dryRun) {
        await recordRefreshRun({
          kind,
          mode,
          triggeredBy: userId,
          total: 0,
          added: 0,
          updated: 0,
          unchanged: 0,
          failed: 0,
          durationMs: Date.now() - startedAt,
          errorSummary,
        });
      }
    } finally {
      res.end();
    }
  },
);

/* ─────────────────────── /:kind/:slug ───────────────────────
 * Convenience single-doc GET: returns the *effective* row plus override
 * metadata so callers can render the doc without having to choose between
 * the legacy `/catalog/...` paths. `?lang=ar|en`. 404 if the slug is
 * unknown for this kind.
 */
router.get(
  "/:kind/:slug",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    // Skip subroutes that share the same prefix.
    const slug = req.params.slug;
    if (slug === "stats" || slug === "history" || slug === "refresh-all") {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "no such resource" } });
      return;
    }
    const lang = pickLang(req.query.lang);
    if (kind === "guide") {
      const g = await getGuide(slug, lang);
      if (!g) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "guide not found" } });
        return;
      }
      res.json({ success: true, data: { kind, ...g } });
      return;
    }
    const result =
      lang === "ar" ? await getArabicDoc(slug, false) : await getEnglishDoc(slug, false);
    if (!result || !result.markdown) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "node-doc not fetched yet" } });
      return;
    }
    res.json({ success: true, data: { kind, slug, lang, ...result } });
  },
);

/* ─────────────────────── /:kind/:slug/diff ─────────────────────── */
router.get(
  "/:kind/:slug/diff",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    const lang = pickLang(req.query.lang);
    const slug = req.params.slug;

    if (kind === "guide") {
      const g = await getGuide(slug, lang);
      if (!g) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "guide not found" } });
        return;
      }
      // `getGuide` already merges override-over-upstream into `markdown`, but
      // exposes both raw columns on the row. We surface them separately so
      // the UI can show a real diff.
      const override = g.manualOverrideMarkdown ?? null;
      // The `markdown` column on the row before merge is preserved on the
      // returned object via `...row`; if not present, fall back to effective.
      const rawUpstream = (g as { markdown?: string | null }).markdown ?? null;
      res.json({
        success: true,
        data: {
          kind,
          slug,
          lang,
          hasOverride: Boolean(override),
          override,
          upstream: rawUpstream,
          effective: g.effectiveMarkdown ?? null,
          overrideAt: g.manualOverrideAt ?? null,
          overrideBy: g.manualOverrideBy ?? null,
          overrideNote: g.manualOverrideNote ?? null,
        },
      });
      return;
    }
    // node-doc — DocResult exposes `manualOverride: boolean` and the
    // currently-effective `markdown`; raw upstream is not separately
    // surfaced today, so we report null for `upstream` (Phase 7 may extend
    // this to query the raw column directly).
    const result =
      lang === "ar"
        ? await getArabicDoc(slug, false)
        : await getEnglishDoc(slug, false);
    res.json({
      success: true,
      data: {
        kind,
        slug,
        lang,
        hasOverride: Boolean(result.manualOverride),
        override: result.manualOverride ? result.markdown : null,
        upstream: null,
        effective: result.markdown ?? null,
        sourceUrl: result.sourceUrl ?? null,
        fetchedAt: result.fetchedAt ?? null,
      },
    });
  },
);

/* ─────────────────────── /:kind/:slug/override (PUT/DELETE) ─────────────────────── */
router.put(
  "/:kind/:slug/override",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    const lang = pickLang(req.query.lang);
    const slug = req.params.slug;
    const { markdown, note } = req.body as { markdown?: string; note?: string };
    if (!markdown || markdown.length < 5) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "markdown is required" } });
      return;
    }
    const userId = getUserId(req);
    if (kind === "guide") {
      const r = await setGuideManualOverride(slug, lang, markdown, userId, note);
      if (!r.success) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "guide not registered" } });
        return;
      }
      res.json({ success: true, data: { kind, slug, lang } });
      return;
    }
    await setManualOverride(slug, lang, markdown, userId, note);
    res.json({ success: true, data: { kind, slug, lang } });
  },
);

router.delete(
  "/:kind/:slug/override",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const kind = pickKind(req, res);
    if (!kind) return;
    const lang = pickLang(req.query.lang);
    const slug = req.params.slug;
    const userId = getUserId(req);
    if (kind === "guide") {
      const r = await clearGuideManualOverride(slug, lang);
      res.json({ success: r.success, data: { kind, slug, lang } });
      return;
    }
    const r = await clearManualOverride(slug, lang, userId);
    res.json({ success: r.success, data: { kind, slug, lang } });
  },
);

/* ─────────────────────── error tail ─────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: {
      code: "CONTENT_ROUTER_ERROR",
      message: err instanceof Error ? err.message : String(err),
    },
  });
});

export const contentRouter = router;
