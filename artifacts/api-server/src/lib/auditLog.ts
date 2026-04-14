import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger";
import type { Request } from "express";

export async function logAudit(
  userId: number,
  action: string,
  entityType: string,
  entityId: number | string | null,
  details: Record<string, unknown>,
  req: Request
): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      userId,
      action,
      entityType,
      entityId: entityId !== null ? String(entityId) : null,
      detailsJson: details,
      ipAddress: req.ip ?? req.socket?.remoteAddress ?? null,
    });
  } catch (err) {
    logger.warn({ err }, "Failed to write audit log");
  }
}
