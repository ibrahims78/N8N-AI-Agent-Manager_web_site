/**
 * content_refresh_history writer + reader (Phase 7 of unified-content-cache-plan.md).
 *
 * Single best-effort entry point used by the unified `/content/:kind/refresh-all`
 * route after a refresh completes. NEVER blocks or fails the caller.
 */
import { db, contentRefreshHistoryTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export type RefreshKind = "guide" | "node-doc";
export type RefreshMode = "smart" | "force" | "dry-run";

export interface RecordRefreshRunInput {
  kind: RefreshKind;
  mode: RefreshMode;
  triggeredBy: number | null;
  total: number;
  added: number;
  updated: number;
  unchanged: number;
  failed: number;
  durationMs: number;
  aiCalls?: number;
  networkBytes?: number;
  errorSummary?: string | null;
}

/**
 * Persist one row describing a single refresh run. Logs and swallows any
 * insert error so the caller (the SSE stream) never crashes from a history
 * write failure.
 */
export async function recordRefreshRun(input: RecordRefreshRunInput): Promise<void> {
  try {
    await db.insert(contentRefreshHistoryTable).values({
      kind: input.kind,
      mode: input.mode,
      triggeredBy: input.triggeredBy,
      total: input.total,
      added: input.added,
      updated: input.updated,
      unchanged: input.unchanged,
      failed: input.failed,
      durationMs: input.durationMs,
      aiCalls: input.aiCalls ?? 0,
      networkBytes: input.networkBytes ?? 0,
      errorSummary: input.errorSummary ?? null,
    });
  } catch (err) {
    logger.warn(
      { err, kind: input.kind, mode: input.mode },
      "recordRefreshRun: history insert failed (non-fatal)",
    );
  }
}

export interface RefreshHistoryEntry {
  id: number;
  kind: RefreshKind;
  runAt: string;
  mode: RefreshMode;
  triggeredBy: number | null;
  total: number;
  added: number;
  updated: number;
  unchanged: number;
  failed: number;
  durationMs: number;
  aiCalls: number;
  networkBytes: number;
  errorSummary: string | null;
}

/**
 * Read the most recent N entries for a single kind, newest first.
 */
export async function listRefreshHistory(
  kind: RefreshKind,
  limit: number,
): Promise<RefreshHistoryEntry[]> {
  const rows = await db
    .select()
    .from(contentRefreshHistoryTable)
    .where(eq(contentRefreshHistoryTable.kind, kind))
    .orderBy(desc(contentRefreshHistoryTable.runAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as RefreshKind,
    runAt: r.runAt.toISOString(),
    mode: r.mode as RefreshMode,
    triggeredBy: r.triggeredBy ?? null,
    total: r.total,
    added: r.added,
    updated: r.updated,
    unchanged: r.unchanged,
    failed: r.failed,
    durationMs: r.durationMs,
    aiCalls: r.aiCalls,
    networkBytes: Number(r.networkBytes),
    errorSummary: r.errorSummary ?? null,
  }));
}

/**
 * Quick aggregate count for tests / diagnostics.
 */
export async function countRefreshHistory(kind?: RefreshKind): Promise<number> {
  const rows = await db
    .select({ id: contentRefreshHistoryTable.id })
    .from(contentRefreshHistoryTable)
    .where(kind ? and(eq(contentRefreshHistoryTable.kind, kind)) : undefined);
  return rows.length;
}
