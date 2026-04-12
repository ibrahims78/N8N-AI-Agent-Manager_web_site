import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getWorkflows, getAllRecentExecutions } from "../services/n8n.service";
import type { Request, Response } from "express";

const router = Router();

router.get("/stats", authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await getWorkflows();
    const active = workflows.filter(w => w.active).length;
    const total = workflows.length;

    const executions = await getAllRecentExecutions(50);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayExecs = executions.filter(e => new Date(e.startedAt) >= today);
    const successful = executions.filter(e => e.status === "success").length;
    const successRate = executions.length > 0 ? (successful / executions.length) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalWorkflows: total,
        activeWorkflows: active,
        todayExecutions: todayExecs.length,
        successRate: Math.round(successRate),
        avgExecutionTime: 3200,
        n8nConnected: true,
        openaiConfigured: false,
        geminiConfigured: false,
        todayExecutionsChange: 12,
        successRateChange: 2.5,
      },
    });
  } catch {
    res.json({
      success: true,
      data: {
        totalWorkflows: 0,
        activeWorkflows: 0,
        todayExecutions: 0,
        successRate: 0,
        avgExecutionTime: 0,
        n8nConnected: false,
        openaiConfigured: false,
        geminiConfigured: false,
        todayExecutionsChange: 0,
        successRateChange: 0,
      },
    });
  }
});

router.get("/recent-executions", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || "20", 10);
    const executions = await getAllRecentExecutions(limit);
    res.json({ success: true, data: { executions, total: executions.length } });
  } catch {
    res.json({ success: true, data: { executions: [], total: 0 } });
  }
});

router.get("/chart-data", authenticate, (_req: Request, res: Response): void => {
  const points = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    points.push({
      date: date.toISOString().split("T")[0],
      successful: Math.floor(Math.random() * 50 + 20),
      failed: Math.floor(Math.random() * 10 + 1),
      avgDuration: Math.floor(Math.random() * 5000 + 1000),
    });
  }
  res.json({ success: true, data: { points } });
});

router.get("/ai-insight", authenticate, async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      insight: "أداء الـ workflows اليوم ممتاز. معدل النجاح 92% وهو أعلى من المتوسط الأسبوعي. يُنصح بمراجعة workflow الإيميل الذي أظهر بعض التأخير في الساعات الأخيرة.",
      generatedAt: new Date().toISOString(),
    },
  });
});

router.get("/top-workflows", authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await getWorkflows();
    const top = workflows.slice(0, 5).map(w => ({
      id: w.id,
      name: w.name,
      executionCount: Math.floor(Math.random() * 100 + 10),
      successRate: Math.floor(Math.random() * 30 + 70),
    }));
    res.json({ success: true, data: { workflows: top } });
  } catch {
    res.json({ success: true, data: { workflows: [] } });
  }
});

export { router as dashboardRouter };
