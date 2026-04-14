import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getWorkflows, getAllRecentExecutions, getWorkflowExecutions } from "../services/n8n.service";
import { db, systemSettingsTable } from "@workspace/db";
import type { Request, Response } from "express";

const router = Router();

router.get("/stats", authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await getWorkflows();
    const active = workflows.filter(w => w.active).length;
    const total = workflows.length;

    const executions = await getAllRecentExecutions(100);
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const todayExecs = executions.filter(e => new Date(e.startedAt) >= todayStart);
    const yesterdayExecs = executions.filter(e => {
      const d = new Date(e.startedAt);
      return d >= yesterdayStart && d < todayStart;
    });

    const successful = executions.filter(e => e.status === "success").length;
    const successRate = executions.length > 0 ? (successful / executions.length) * 100 : 0;
    const todaySuccessful = todayExecs.filter(e => e.status === "success").length;
    const todaySuccessRate = todayExecs.length > 0 ? (todaySuccessful / todayExecs.length) * 100 : 0;
    const yestSuccessful = yesterdayExecs.filter(e => e.status === "success").length;
    const yestSuccessRate = yesterdayExecs.length > 0 ? (yestSuccessful / yesterdayExecs.length) * 100 : 0;

    const todayChange = yesterdayExecs.length > 0
      ? Math.round(((todayExecs.length - yesterdayExecs.length) / yesterdayExecs.length) * 100)
      : 0;
    const successChange = Math.round(todaySuccessRate - yestSuccessRate);

    const completedExecs = executions.filter(e => e.stoppedAt);
    const avgMs = completedExecs.length > 0
      ? completedExecs.reduce((acc, e) => {
          return acc + (new Date(e.stoppedAt!).getTime() - new Date(e.startedAt).getTime());
        }, 0) / completedExecs.length
      : 0;

    const settings = await db.select().from(systemSettingsTable).limit(1);
    const s = settings[0];

    res.json({
      success: true,
      data: {
        totalWorkflows: total,
        activeWorkflows: active,
        todayExecutions: todayExecs.length,
        successRate: Math.round(successRate),
        avgExecutionTime: Math.round(avgMs),
        n8nConnected: !!s?.n8nUrl,
        openaiConfigured: !!s?.openaiKeyEncrypted,
        geminiConfigured: !!s?.geminiKeyEncrypted,
        todayExecutionsChange: todayChange,
        successRateChange: successChange,
      },
    });
  } catch {
    res.json({
      success: true,
      data: {
        totalWorkflows: 0, activeWorkflows: 0, todayExecutions: 0,
        successRate: 0, avgExecutionTime: 0, n8nConnected: false,
        openaiConfigured: false, geminiConfigured: false,
        todayExecutionsChange: 0, successRateChange: 0,
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

router.get("/live-feed", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || "20", 10);
    const executions = await getAllRecentExecutions(limit);
    res.json({ success: true, data: { executions, total: executions.length, refreshedAt: new Date().toISOString() } });
  } catch {
    res.json({ success: true, data: { executions: [], total: 0, refreshedAt: new Date().toISOString() } });
  }
});

router.get("/chart-data", authenticate, async (req: Request, res: Response): Promise<void> => {
  const period = req.query.period as string || "7d";
  let days = 7;
  if (period === "30d") days = 30;
  if (period === "3m") days = 90;

  try {
    const executions = await getAllRecentExecutions(500);
    const buckets: Record<string, { successful: number; failed: number; durations: number[] }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]!;
      buckets[key] = { successful: 0, failed: 0, durations: [] };
    }

    for (const exec of executions) {
      const key = new Date(exec.startedAt).toISOString().split("T")[0]!;
      if (buckets[key]) {
        if (exec.status === "success") buckets[key].successful++;
        else if (exec.status === "error") buckets[key].failed++;
        if (exec.stoppedAt) {
          buckets[key].durations.push(new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime());
        }
      }
    }

    const points = Object.entries(buckets).map(([date, b]) => ({
      date,
      successful: b.successful,
      failed: b.failed,
      avgDuration: b.durations.length > 0 ? Math.round(b.durations.reduce((a, v) => a + v, 0) / b.durations.length) : 0,
    }));

    res.json({ success: true, data: { points } });
  } catch {
    const points = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      points.push({ date: d.toISOString().split("T")[0], successful: 0, failed: 0, avgDuration: 0 });
    }
    res.json({ success: true, data: { points } });
  }
});

router.get("/ai-insight", authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const executions = await getAllRecentExecutions(50);
    const successful = executions.filter(e => e.status === "success").length;
    const failed = executions.filter(e => e.status === "error").length;
    const rate = executions.length > 0 ? Math.round((successful / executions.length) * 100) : 0;

    let insight: string;
    if (executions.length === 0) {
      insight = "لا توجد بيانات تنفيذ بعد. قم بتوصيل n8n وتشغيل بعض الـ workflows لرؤية التحليل.";
    } else if (rate >= 90) {
      insight = `أداء الـ workflows ممتاز اليوم. معدل النجاح ${rate}% وهو أعلى من المتوسط المطلوب. الأداء العام مستقر.`;
    } else if (rate >= 70) {
      insight = `معدل النجاح ${rate}% — أداء متوسط. هناك ${failed} تنفيذ فاشل يستحق المراجعة.`;
    } else {
      insight = `تحذير: معدل النجاح ${rate}% أقل من المقبول. ${failed} تنفيذ فاشل — يُنصح بمراجعة الـ workflows الفاشلة فوراً.`;
    }

    res.json({
      success: true,
      data: { insight, generatedAt: new Date().toISOString(), stats: { total: executions.length, successful, failed, rate } },
    });
  } catch {
    res.json({
      success: true,
      data: { insight: "تعذّر تحليل البيانات. تحقق من اتصال n8n.", generatedAt: new Date().toISOString() },
    });
  }
});

router.get("/top-workflows", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await getWorkflows();
    const execBuckets: Record<string, { total: number; success: number; name: string }> = {};

    for (const wf of workflows) {
      try {
        const execs = await getWorkflowExecutions(wf.id, 50);
        execBuckets[wf.id] = {
          name: wf.name,
          total: execs.length,
          success: execs.filter(e => e.status === "success").length,
        };
      } catch {
        execBuckets[wf.id] = { name: wf.name, total: 0, success: 0 };
      }
    }

    const top = Object.entries(execBuckets)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        executionCount: data.total,
        successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      }));

    res.json({ success: true, data: { workflows: top } });
  } catch {
    res.json({ success: true, data: { workflows: [] } });
  }
});

router.get("/heatmap", authenticate, async (req: Request, res: Response): Promise<void> => {
  const year = parseInt(req.query.year as string || String(new Date().getFullYear()), 10);
  try {
    const executions = await getAllRecentExecutions(1000);
    const map: Record<string, { count: number; success: number }> = {};

    for (const exec of executions) {
      const d = new Date(exec.startedAt);
      if (d.getFullYear() !== year) continue;
      const key = d.toISOString().split("T")[0]!;
      if (!map[key]) map[key] = { count: 0, success: 0 };
      map[key].count++;
      if (exec.status === "success") map[key].success++;
    }

    const heatmap = Object.entries(map).map(([date, v]) => ({
      date,
      count: v.count,
      successRate: v.count > 0 ? Math.round((v.success / v.count) * 100) : 0,
    }));

    res.json({ success: true, data: { heatmap, year } });
  } catch {
    res.json({ success: true, data: { heatmap: [], year } });
  }
});

router.get("/alerts", authenticate, async (_req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await getWorkflows();
    const alerts: Array<{ id: string; severity: "high" | "medium" | "info"; workflowId?: string; workflowName?: string; message: string; messageEn: string; createdAt: string }> = [];

    for (const wf of workflows.slice(0, 10)) {
      try {
        const execs = await getWorkflowExecutions(wf.id, 5);
        const recentFails = execs.filter(e => e.status === "error");
        if (recentFails.length >= 3) {
          alerts.push({
            id: `alert-${wf.id}-consecutive`,
            severity: "high",
            workflowId: wf.id,
            workflowName: wf.name,
            message: `فشل "${wf.name}" ${recentFails.length} مرات متتالية`,
            messageEn: `"${wf.name}" failed ${recentFails.length} consecutive times`,
            createdAt: new Date().toISOString(),
          });
        } else if (recentFails.length === 2) {
          alerts.push({
            id: `alert-${wf.id}-warn`,
            severity: "medium",
            workflowId: wf.id,
            workflowName: wf.name,
            message: `"${wf.name}" فشل مرتين مؤخراً`,
            messageEn: `"${wf.name}" failed twice recently`,
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        // skip
      }
    }

    const inactiveWorkflows = workflows.filter(w => !w.active);
    if (inactiveWorkflows.length > 0) {
      alerts.push({
        id: "alert-inactive",
        severity: "info",
        message: `${inactiveWorkflows.length} workflow موقوف`,
        messageEn: `${inactiveWorkflows.length} workflow(s) are inactive`,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: { alerts } });
  } catch {
    res.json({ success: true, data: { alerts: [] } });
  }
});

export { router as dashboardRouter };
