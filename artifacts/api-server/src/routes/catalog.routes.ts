import { Router } from "express";
import type { Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  listCatalog,
  getCategories,
  getCatalogStatus,
  lookupNode,
  seedNodeCatalog,
} from "../services/nodeCatalog.service";

const router: Router = Router();

router.get("/status", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const status = await getCatalogStatus();
  res.json({ success: true, data: status });
});

router.get("/categories", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const cats = await getCategories();
  res.json({ success: true, data: { categories: cats } });
});

router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  const search = (req.query.search as string) || undefined;
  const category = (req.query.category as string) || undefined;
  const triggerStr = (req.query.trigger as string) || undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  const isTrigger =
    triggerStr === "true" ? true : triggerStr === "false" ? false : undefined;

  const result = await listCatalog({ search, category, isTrigger, limit, offset });
  res.json({ success: true, data: result });
});

router.get("/lookup/:nodeType", authenticate, async (req: Request, res: Response): Promise<void> => {
  const node = await lookupNode(req.params.nodeType);
  if (!node) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `No catalog entry for "${req.params.nodeType}"` },
    });
    return;
  }
  res.json({ success: true, data: node });
});

router.post("/refresh", authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await seedNodeCatalog();
    const status = await getCatalogStatus();
    res.json({ success: true, data: { ...result, status } });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "REFRESH_FAILED", message: err instanceof Error ? err.message : String(err) },
    });
  }
});

export const catalogRouter = router;
