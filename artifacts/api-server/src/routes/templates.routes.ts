import { Router } from "express";
import { db, templatesTable, conversationsTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import type { Request, Response } from "express";

const router = Router();

router.get("/", authenticate, requirePermission("view_templates"), async (req: Request, res: Response): Promise<void> => {
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;

  let query = db.select().from(templatesTable);
  const templates = await query;

  let filtered = templates;
  if (category && category !== "all") {
    filtered = filtered.filter(t => t.category === category);
  }
  if (search) {
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({ success: true, data: { templates: filtered, total: filtered.length } });
});

router.get("/:id", authenticate, requirePermission("view_templates"), async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const templates = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
  if (!templates[0]) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    return;
  }
  res.json({ success: true, data: templates[0] });
});

router.post("/:id/use", authenticate, requirePermission("use_chat"), async (req: Request, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

  const id = parseInt(req.params.id, 10);
  const templates = await db.select().from(templatesTable).where(eq(templatesTable.id, id)).limit(1);
  const template = templates[0];
  if (!template) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    return;
  }

  await db.update(templatesTable).set({ usageCount: template.usageCount + 1 }).where(eq(templatesTable.id, id));

  const [conv] = await db.insert(conversationsTable).values({
    userId: req.user.userId,
    title: `قالب: ${template.name}`,
    type: "create",
    status: "active",
    messageCount: 0,
  }).returning();

  res.json({ success: true, data: conv });
});

export { router as templatesRouter };
