import { Router } from "express";
import { db, workflowVersionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import {
  getWorkflows,
  getWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  createWorkflow,
  updateWorkflow,
  importWorkflow,
  getWorkflowExecutions,
  getAllRecentExecutions,
} from "../services/n8n.service";
import { logger } from "../lib/logger";
import type { Request, Response } from "express";

const router = Router();

router.get("/", authenticate, requirePermission("view_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await getWorkflows();
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    let filtered = workflows;
    if (search) {
      filtered = filtered.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (status === "active") {
      filtered = filtered.filter(w => w.active);
    } else if (status === "inactive") {
      filtered = filtered.filter(w => !w.active);
    }

    // Fetch real execution data from n8n to compute per-workflow stats
    let executionsByWorkflow: Record<string, { total: number; success: number; lastAt: string | null }> = {};
    try {
      const recentExecs = await getAllRecentExecutions(200);
      for (const exec of recentExecs) {
        const wid = exec.workflowId;
        if (!executionsByWorkflow[wid]) {
          executionsByWorkflow[wid] = { total: 0, success: 0, lastAt: null };
        }
        executionsByWorkflow[wid].total++;
        if (exec.status === "success") executionsByWorkflow[wid].success++;
        if (!executionsByWorkflow[wid].lastAt && exec.startedAt) {
          executionsByWorkflow[wid].lastAt = exec.startedAt;
        }
      }
    } catch {
      // n8n may not be configured — stats will show 0/null gracefully
    }

    const enriched = filtered.map(w => {
      const stats = executionsByWorkflow[w.id];
      const total = stats?.total ?? 0;
      const successRate = total > 0 ? Math.round((stats!.success / total) * 100) : 0;
      return {
        ...w,
        successRate,
        executionCount: total,
        isRunning: false,
        lastExecution: stats?.lastAt ?? null,
      };
    });

    res.json({ success: true, data: { workflows: enriched, total: enriched.length } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "N8N_NOT_CONFIGURED") {
      res.json({ success: true, data: { workflows: [], total: 0 } });
    } else {
      res.status(500).json({ success: false, error: { code: "N8N_ERROR", message } });
    }
  }
});

router.post("/", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };
    const workflowName = (name ?? "").trim() || "مسار عمل جديد";
    const result = await createWorkflow({
      name: workflowName,
      nodes: [],
      connections: {},
      settings: { executionOrder: "v1" },
      active: false,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "N8N_NOT_CONFIGURED") {
      res.status(503).json({ success: false, error: { code: "N8N_NOT_CONFIGURED", message: "يرجى إعداد اتصال n8n في الإعدادات أولاً" } });
    } else {
      res.status(500).json({ success: false, error: { code: "N8N_ERROR", message } });
    }
  }
});

router.get("/:id", authenticate, requirePermission("view_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    const workflow = await getWorkflow(req.params.id);
    // Fetch real execution stats for this specific workflow
    let successRate = 0;
    let executionCount = 0;
    let lastExecution: string | null = null;
    try {
      const execs = await getWorkflowExecutions(req.params.id, 100);
      executionCount = execs.length;
      const successCount = execs.filter(e => e.status === "success").length;
      successRate = executionCount > 0 ? Math.round((successCount / executionCount) * 100) : 0;
      lastExecution = execs[0]?.startedAt ?? null;
    } catch {
      // n8n not configured — show zeroes
    }
    res.json({
      success: true,
      data: {
        ...workflow,
        successRate,
        executionCount,
        isRunning: false,
        lastExecution,
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Workflow not found" } });
  }
});

router.post("/:id/activate", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    await activateWorkflow(req.params.id);
    res.json({ success: true, message: "Workflow activated" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "N8N_ERROR", message: String(err) } });
  }
});

router.post("/:id/deactivate", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    await deactivateWorkflow(req.params.id);
    res.json({ success: true, message: "Workflow deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "N8N_ERROR", message: String(err) } });
  }
});

router.delete("/:id", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteWorkflow(req.params.id);
    res.json({ success: true, message: "Workflow deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "N8N_ERROR", message: String(err) } });
  }
});

router.get("/:id/executions", authenticate, requirePermission("view_workflows"), async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || "20", 10);
    const executions = await getWorkflowExecutions(req.params.id, limit);
    res.json({ success: true, data: { executions, total: executions.length } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "N8N_ERROR", message: String(err) } });
  }
});

router.get("/:id/versions", authenticate, requirePermission("view_workflows"), async (req: Request, res: Response): Promise<void> => {
  const versions = await db
    .select()
    .from(workflowVersionsTable)
    .where(eq(workflowVersionsTable.workflowN8nId, req.params.id));

  res.json({ success: true, data: { versions } });
});

router.post("/:id/restore/:versionId", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  const { id, versionId } = req.params;
  try {
    const versions = await db
      .select()
      .from(workflowVersionsTable)
      .where(and(eq(workflowVersionsTable.workflowN8nId, id), eq(workflowVersionsTable.id, parseInt(versionId, 10))));

    const version = versions[0];
    if (!version) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Version not found" } });
      return;
    }

    await updateWorkflow(id, version.workflowJson as Record<string, unknown>);

    const nextVersion = await db
      .select()
      .from(workflowVersionsTable)
      .where(eq(workflowVersionsTable.workflowN8nId, id));

    await db.insert(workflowVersionsTable).values({
      workflowN8nId: id,
      versionNumber: nextVersion.length + 1,
      workflowJson: version.workflowJson,
      changeDescription: `استعادة الإصدار ${version.versionNumber}`,
      createdBy: req.user!.userId,
    });

    res.json({ success: true, message: `تم استعادة الإصدار ${version.versionNumber} بنجاح` });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "RESTORE_ERROR", message: String(err) } });
  }
});

router.post("/bulk-action", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  const { ids, action } = req.body as { ids: string[]; action: string };
  if (!ids || !action) {
    res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "ids and action required" } });
    return;
  }

  const errors: string[] = [];
  for (const id of ids) {
    try {
      if (action === "activate") await activateWorkflow(id);
      else if (action === "deactivate") await deactivateWorkflow(id);
      else if (action === "delete") await deleteWorkflow(id);
    } catch {
      errors.push(id);
    }
  }

  res.json({ success: true, message: `Bulk ${action} completed. ${errors.length > 0 ? `${errors.length} failed.` : ""}` });
});

router.post("/import", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  const { workflowJson } = req.body as { workflowJson: Record<string, unknown> };

  if (!workflowJson) {
    res.status(400).json({ success: false, error: { code: "MISSING_JSON", message: "workflowJson required" } });
    return;
  }

  try {
    const result = await importWorkflow(workflowJson);

    // Auto-save version 1 for the newly created workflow
    if (result.id) {
      try {
        await db.insert(workflowVersionsTable).values({
          workflowN8nId: result.id,
          versionNumber: 1,
          workflowJson: workflowJson,
          changeDescription: "الإنشاء الأولي بواسطة وكيل الذكاء الاصطناعي",
          createdBy: req.user!.userId,
        });
      } catch {
        // Non-fatal — still return success
      }
    }

    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err, workflowName: workflowJson?.name }, "workflow import failed");
    const statusCode = message.includes("N8N_NOT_CONFIGURED") ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: message.includes("N8N_NOT_CONFIGURED") ? "N8N_NOT_CONFIGURED" : "IMPORT_ERROR",
        message,
      },
    });
  }
});

router.post("/:id/apply-fix", authenticate, requirePermission("manage_workflows"), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { workflowJson } = req.body as { workflowJson: Record<string, unknown> };

  if (!workflowJson || !workflowJson.nodes) {
    res.status(400).json({ success: false, error: { code: "INVALID_WORKFLOW", message: "workflowJson with nodes is required" } });
    return;
  }

  try {
    const current = await getWorkflow(id);
    const updatePayload = {
      name: (workflowJson.name as string) ?? current.name,
      nodes: workflowJson.nodes ?? current.nodes,
      connections: workflowJson.connections ?? current.connections,
      settings: workflowJson.settings ?? current.settings ?? {},
    };

    const updated = await updateWorkflow(id, updatePayload);

    try {
      const versions = await db.select().from(workflowVersionsTable)
        .where(eq(workflowVersionsTable.workflowN8nId, id))
        .orderBy(workflowVersionsTable.versionNumber);
      const latestVersion = versions[versions.length - 1]?.versionNumber ?? 0;
      await db.insert(workflowVersionsTable).values({
        workflowN8nId: id,
        versionNumber: latestVersion + 1,
        workflowJson: workflowJson,
        changeDescription: "إصلاح تلقائي بواسطة وكيل الذكاء الاصطناعي",
        createdBy: req.user!.userId,
      });
    } catch {
      logger.warn({ id }, "Could not save fix version — non-fatal");
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err, id }, "apply-fix failed");
    res.status(500).json({ success: false, error: { code: "FIX_ERROR", message } });
  }
});

export { router as workflowsRouter };
