import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus = "disconnected";
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const allOk = dbStatus === "connected";
  res.status(allOk ? 200 : 503).json({
    success: allOk,
    data: {
      status: allOk ? "ok" : "degraded",
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
