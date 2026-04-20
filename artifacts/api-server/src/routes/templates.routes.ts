import { Router } from "express";
import { db, templatesTable, conversationsTable, systemSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requirePermission, requireAdmin } from "../middleware/auth.middleware";
import { importWorkflow } from "../services/n8n.service";
import { decryptApiKey } from "../services/encryption.service";
import OpenAI from "openai";
import type { Request, Response } from "express";

const router = Router();

const N8N_API = "https://api.n8n.io/api";

async function getOpenAIKey(): Promise<string | null> {
  const settings = await db.select().from(systemSettingsTable).limit(1);
  const s = settings[0];
  if (!s || !s.openaiKeyEncrypted || !s.openaiKeyIv) return null;
  return decryptApiKey(s.openaiKeyEncrypted, s.openaiKeyIv);
}

router.get("/n8n-library", authenticate, requirePermission("view_templates"), async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const rows = parseInt(req.query.rows as string) || 20;
    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as string) || "views";

    let url = `${N8N_API}/templates/search?rows=${rows}&page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category && category !== "all") url += `&categories[]=${encodeURIComponent(category)}`;
    if (sortBy && sortBy !== "default") url += `&sortBy=${encodeURIComponent(sortBy)}`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "n8n-manager/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      res.status(502).json({ success: false, error: { code: "UPSTREAM_ERROR", message: `n8n API returned ${response.status}` } });
      return;
    }

    const data = await response.json() as {
      workflows?: Array<{
        id: number;
        name: string;
        description?: string;
        categories?: Array<{ name: string }>;
        nodes?: Array<{ name: string }>;
        totalViews?: number;
        user?: { username: string };
        image?: Array<{ id: number; url: string }>;
        createdAt?: string;
      }>;
      totalWorkflows?: number;
    };

    const templates = (data.workflows ?? []).map(w => ({
      id: w.id,
      name: w.name,
      description: w.description ?? "",
      category: w.categories?.[0]?.name ?? "general",
      nodesCount: w.nodes?.length ?? 0,
      views: w.totalViews ?? 0,
      author: w.user?.username ?? "n8n",
      imageUrl: w.image?.[0]?.url ?? null,
      createdAt: w.createdAt ?? null,
    }));

    res.json({ success: true, data: { templates, total: data.totalWorkflows ?? templates.length, page, rows } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/n8n-library/import/:id", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }); return; }

    const n8nId = parseInt(req.params.id, 10);
    if (isNaN(n8nId)) { res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid ID" } }); return; }

    const { name, description, category, nodesCount } = req.body as {
      name?: string;
      description?: string;
      category?: string;
      nodesCount?: number;
    };

    if (!name) {
      res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "Template name is required" } });
      return;
    }

    let workflowJson: Record<string, unknown> = { name, nodes: [], connections: {}, source: "n8n-library", n8nId };
    try {
      // Correct endpoint: /templates/workflows/{id} returns nested workflow.workflow
      const n8nRes = await fetch(`${N8N_API}/templates/workflows/${n8nId}`, {
        headers: { "Accept": "application/json", "User-Agent": "n8n-manager/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (n8nRes.ok) {
        const n8nData = await n8nRes.json() as {
          workflow?: {
            name?: string;
            workflow?: { nodes?: unknown[]; connections?: unknown; meta?: unknown; pinData?: unknown };
          };
        };
        const innerWf = n8nData.workflow?.workflow;
        if (innerWf && Array.isArray(innerWf.nodes) && innerWf.nodes.length > 0) {
          workflowJson = {
            name,
            nodes: innerWf.nodes,
            connections: innerWf.connections ?? {},
            ...(innerWf.meta ? { meta: innerWf.meta } : {}),
            source: "n8n-library",
            n8nId,
          };
        }
      }
    } catch {
      // fall back to empty workflow if fetch fails
    }

    const [template] = await db.insert(templatesTable).values({
      name,
      description: description ?? "",
      category: category ?? "general",
      nodesCount: nodesCount ?? (Array.isArray(workflowJson.nodes) ? (workflowJson.nodes as unknown[]).length : 0),
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

router.post("/:id/prepare-library", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
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

    const workflowJson = template.workflowJson as Record<string, unknown>;
    const nodes = Array.isArray(workflowJson?.nodes) ? workflowJson.nodes as Record<string, unknown>[] : [];
    const nodeTypes = nodes.map(n => (n.type as string) ?? "").filter(Boolean);

    const openaiKey = await getOpenAIKey();
    if (!openaiKey) {
      res.status(503).json({ success: false, error: { code: "AI_NOT_CONFIGURED", message: "مفتاح OpenAI غير مُهيَّأ" } });
      return;
    }

    const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

    const N8N_CATEGORIES = ["Marketing", "Sales", "Engineering", "IT Ops", "HR", "Finance", "Design", "Other"];
    const N8N_SUBMISSION_URL = "https://n8n.io/workflows/submit";

    const systemPrompt = `You are an expert at writing n8n workflow template submissions for the official n8n community library at n8n.io.

You must generate complete submission content in JSON format. All text content (title, description, prerequisites, usageInstructions, tags) MUST be in English.

Given a workflow's name, description, and node types, generate:
1. title: A catchy, clear English title (max 70 chars). Good examples: "Auto-Send Weekly Reports via Gmail", "Sync Notion Database to Google Sheets Daily"
2. description: 2-3 English paragraphs explaining: what the workflow does, the problem it solves, and what the user gets. Be specific and compelling. (~200 words)
3. categories: Array of 1-2 best matching categories from ONLY: ${N8N_CATEGORIES.join(", ")}
4. prerequisites: Array of strings listing tools/credentials needed (e.g., "Gmail OAuth2 credentials", "Slack API token"). Be specific to the node types.
5. tags: Array of 5-8 lowercase tags relevant to the workflow (e.g., "automation", "email", "reporting")
6. usageInstructions: Short step-by-step setup instructions in English (3-5 numbered steps as an array of strings)
7. submissionUrl: Always "${N8N_SUBMISSION_URL}"

Return ONLY valid JSON with no markdown or explanation.`;

    const userPrompt = `Generate n8n library submission content for:
Name: ${template.name}
Description: ${template.description}
Category: ${template.category}
Node types used: ${nodeTypes.join(", ") || "unknown"}
Number of nodes: ${nodes.length}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: {
      title?: string;
      description?: string;
      categories?: string[];
      prerequisites?: string[];
      tags?: string[];
      usageInstructions?: string[];
      submissionUrl?: string;
    };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      res.status(500).json({ success: false, error: { code: "AI_PARSE_ERROR", message: "فشل تحليل رد الذكاء الاصطناعي" } });
      return;
    }

    res.json({
      success: true,
      data: {
        title: parsed.title ?? template.name,
        description: parsed.description ?? template.description,
        categories: parsed.categories ?? [template.category],
        prerequisites: parsed.prerequisites ?? [],
        tags: parsed.tags ?? [],
        usageInstructions: parsed.usageInstructions ?? [],
        submissionUrl: N8N_SUBMISSION_URL,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/:id/prepare-export", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
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

    const workflowJson = template.workflowJson as Record<string, unknown>;
    if (!workflowJson || !Array.isArray(workflowJson.nodes) || (workflowJson.nodes as unknown[]).length === 0) {
      res.status(422).json({ success: false, error: { code: "EMPTY_WORKFLOW", message: "القالب لا يحتوي على عقد" } });
      return;
    }

    const openaiKey = await getOpenAIKey();
    if (!openaiKey) {
      res.status(503).json({ success: false, error: { code: "AI_NOT_CONFIGURED", message: "مفتاح OpenAI غير مُهيَّأ" } });
      return;
    }

    const openai = new OpenAI({ apiKey: openaiKey, timeout: 60000 });

    const systemPrompt = `You are an expert n8n workflow engineer. Your job is to professionally prepare a workflow JSON for export to n8n.

Given a workflow JSON, you MUST:
1. Give each node a clear, descriptive English name (e.g. "Send Email Notification" instead of "EmailSend1")
2. Suggest a professional workflow name
3. Ensure nodes have clean, evenly-spaced positions (start at [250, 300], increment x by 220)
4. Detect any nodes that require credentials and list them as warnings
5. Add sensible settings: executionOrder "v1", timezone "UTC"
6. Return ONLY valid JSON in the exact schema below

Return this JSON schema (no markdown, no explanation):
{
  "workflowName": "string - professional workflow name",
  "workflowJson": { ...full cleaned workflow json... },
  "warnings": ["string", ...],
  "changes": ["string description of what was changed", ...]
}`;

    const userPrompt = `Prepare this workflow for professional export:\n${JSON.stringify(workflowJson, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: {
      workflowName?: string;
      workflowJson?: Record<string, unknown>;
      warnings?: string[];
      changes?: string[];
    };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      res.status(500).json({ success: false, error: { code: "AI_PARSE_ERROR", message: "فشل تحليل رد الذكاء الاصطناعي" } });
      return;
    }

    res.json({
      success: true,
      data: {
        workflowName: parsed.workflowName ?? template.name,
        workflowJson: parsed.workflowJson ?? workflowJson,
        warnings: parsed.warnings ?? [],
        changes: parsed.changes ?? [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

router.post("/:id/deploy", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
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

    const body = req.body as {
      workflowJson?: Record<string, unknown>;
      name?: string;
      timezone?: string;
      executionOrder?: string;
    };

    let workflowJson = (body.workflowJson ?? template.workflowJson) as Record<string, unknown>;

    if (body.name) workflowJson = { ...workflowJson, name: body.name };
    if (body.timezone || body.executionOrder) {
      const currentSettings = (workflowJson.settings as Record<string, unknown>) ?? {};
      workflowJson = {
        ...workflowJson,
        settings: {
          ...currentSettings,
          ...(body.timezone ? { timezone: body.timezone } : {}),
          ...(body.executionOrder ? { executionOrder: body.executionOrder } : {}),
        },
      };
    }

    if (!workflowJson || !Array.isArray(workflowJson.nodes) || (workflowJson.nodes as unknown[]).length === 0) {
      res.status(422).json({ success: false, error: { code: "EMPTY_WORKFLOW", message: "القالب لا يحتوي على عقد - لا يمكن إرساله إلى n8n" } });
      return;
    }

    const n8nWorkflow = await importWorkflow(workflowJson);

    await db.update(templatesTable)
      .set({ usageCount: template.usageCount + 1 })
      .where(eq(templatesTable.id, id));

    res.json({ success: true, data: { workflowId: n8nWorkflow.id, workflowName: n8nWorkflow.name } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "N8N_NOT_CONFIGURED") {
      res.status(503).json({ success: false, error: { code: "N8N_NOT_CONFIGURED", message: "n8n غير مُهيَّأ - تحقق من الإعدادات" } });
      return;
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message } });
  }
});

router.delete("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Invalid template ID" } });
      return;
    }

    const templates = await db
      .select({ id: templatesTable.id, isSystem: templatesTable.isSystem, createdBy: templatesTable.createdBy })
      .from(templatesTable)
      .where(eq(templatesTable.id, id))
      .limit(1);

    if (!templates[0]) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
      return;
    }

    const template = templates[0];
    const isAdmin = req.user?.role === "admin";
    const isOwner = template.createdBy === req.user?.userId;

    if (!isAdmin) {
      if (template.isSystem) {
        res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Only admins can delete system templates" } });
        return;
      }
      if (!isOwner) {
        res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You can only delete your own templates" } });
        return;
      }
    }

    await db.delete(templatesTable).where(eq(templatesTable.id, id));
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: String(err) } });
  }
});

export { router as templatesRouter };
