/**
 * /api/catalog/docs/* — Markdown documentation cache for nodes (English + Arabic).
 */
import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  getEnglishDoc,
  getArabicDoc,
  bulkFetchEnglishDocs,
  getDocsStats,
  getDocsCoverage,
  searchWithinNodeDoc,
} from "../services/nodeDocs.service";

const router: Router = Router();

router.get("/stats", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const stats = await getDocsStats();
  res.json({ success: true, data: stats });
});

router.get("/coverage", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const cov = await getDocsCoverage();
  res.json({ success: true, data: { coverage: cov } });
});

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
        error: {
          code: "BULK_FETCH_FAILED",
          message: err instanceof Error ? err.message : String(err),
        },
      });
    }
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

export const catalogDocsRouter = router;
