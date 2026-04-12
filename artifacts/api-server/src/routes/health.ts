import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

async function healthCheck(_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void }; json: (data: unknown) => void }) {
  let dbStatus = "disconnected";
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const allOk = dbStatus === "connected";
  const statusCode = allOk ? 200 : 503;
  const body = {
    success: allOk,
    data: {
      status: allOk ? "ok" : "degraded",
      db: dbStatus,
      redis: "not_configured",
      timestamp: new Date().toISOString(),
    },
  };
  res.status(statusCode).json(body);
}

router.get("/healthz", healthCheck as never);
router.get("/health", healthCheck as never);
router.get("/v1/health", healthCheck as never);

export default router;
