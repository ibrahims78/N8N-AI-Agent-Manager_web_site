import { Router } from "express";
import { db, templatesTable, conversationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requirePermission, requireAdmin } from "../middleware/auth.middleware";
import type { Request, Response } from "express";

const router = Router();

router.get("/", authenticate, requirePermission("view_templates"), async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const templates = await db.select().from(templatesTable);

    let filtered = templates;
    if (category && category !== "all") {
      filtered = filtered.filter(t => t.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: { templates: filtered, total: filtered.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.get("/:id", authenticate, requirePermission("view_templates"), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid template ID" } });
      return;
    }
    const templates = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
    if (!templates[0]) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
      return;
    }
    res.json({ success: true, data: templates[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const { name, description, category, nodesCount, workflowJson } = req.body as {
      name: string;
      description: string;
      category: string;
      nodesCount?: number;
      workflowJson: Record<string, unknown>;
    };

    if (!name || !description || !category || !workflowJson) {
      res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "name, description, category, and workflowJson are required" } });
      return;
    }

    const [template] = await db.insert(templatesTable).values({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      nodesCount: nodesCount ?? 0,
      workflowJson,
      usageCount: 0,
      avgRating: 0,
      ratingCount: 0,
      createdBy: req.user.userId,
      isSystem: false,
    }).returning();

    res.status(201).json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/:id/rate", authenticate, requirePermission("view_templates"), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid template ID" } });
      return;
    }

    const { rating } = req.body as { rating: number };
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: { code: "INVALID_RATING", message: "Rating must be a number between 1 and 5" } });
      return;
    }

    const templates = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
    const template = templates[0];
    if (!template) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
      return;
    }

    const newCount = template.ratingCount + 1;
    const newAvg = ((template.avgRating * template.ratingCount) + rating) / newCount;

    const [updated] = await db.update(templatesTable)
      .set({ avgRating: Math.round(newAvg * 10) / 10, ratingCount: newCount })
      .where(eq(templatesTable.id, id))
      .returning();

    res.json({ success: true, data: { avgRating: updated?.avgRating, ratingCount: updated?.ratingCount } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/:id/use", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid template ID" } });
      return;
    }

    const templates = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
    const template = templates[0];
    if (!template) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
      return;
    }

    await db.update(templatesTable)
      .set({ usageCount: template.usageCount + 1 })
      .where(eq(templatesTable.id, id));

    const [conv] = await db.insert(conversationsTable).values({
      userId: req.user.userId,
      title: `قالب: ${template.name}`,
      type: "create",
      status: "active",
      messageCount: 0,
    }).returning();

    res.json({ success: true, data: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid template ID" } });
      return;
    }

    const templates = await db.select({ id: templatesTable.id, isSystem: templatesTable.isSystem })
      .from(templatesTable)
      .where(eq(templatesTable.id, id))
      .limit(1);

    if (!templates[0]) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
      return;
    }

    await db.delete(templatesTable).where(eq(templatesTable.id, id));
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

export { router as templatesRouter };
