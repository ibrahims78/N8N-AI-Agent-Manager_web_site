/**
 * Smart bulk-refresh for Node Docs (Phase 3 of unified-content-cache-plan.md).
 *
 * Replaces the legacy `bulkFetchEnglishDocs` for the smart path:
 *   - Cheap conditional GET per node (1 raw .md, ETag-aware).
 *   - Skip immediately when SHA matches existing row.
 *   - Trigger the heavy pipeline (siblings + images + sections) ONLY for
 *     nodes that actually changed upstream.
 *   - Honour `manual_override` — never refreshes those rows.
 *
 * Modes (mirrors guides smart cache):
 *   - smart    : default; SHA-diff + If-None-Match.
 *   - force    : ignore ETag and SHA; always run the pipeline.
 *   - dry-run  : predict status; no DB/disk/AI writes.
 *
 * The legacy `bulkFetchEnglishDocs` route is preserved for backward compat;
 * this is a new entry point that the new `/smart-refresh` route uses.
 */
import { db, nodeCatalogTable } from "@workspace/db";
import { isNotNull } from "drizzle-orm";
import { logger } from "../lib/logger";
import {
  smartRefresh,
  hydrateFromDisk,
  type SmartRefreshOptions,
  type SmartRefreshSummary,
  type HydrateSummary,
} from "./smartCache";
import { nodeDocsEnAdapter, type NodeDocsKey } from "./nodeDocs.adapter";

export interface SmartRefreshNodeDocsOptions extends SmartRefreshOptions {
  /** When set, only this list of nodeTypes is processed. */
  only?: string[];
}

/**
 * Refresh English node docs across the whole catalog using the SmartCache
 * orchestrator. Returns the standard summary the orchestrator produces.
 */
export async function smartRefreshAllNodeDocs(
  opts: SmartRefreshNodeDocsOptions = {},
): Promise<SmartRefreshSummary> {
  const rows = await db
    .select({
      nodeType: nodeCatalogTable.nodeType,
      primaryDocsUrl: nodeCatalogTable.primaryDocsUrl,
    })
    .from(nodeCatalogTable)
    .where(isNotNull(nodeCatalogTable.primaryDocsUrl));

  let keys: NodeDocsKey[] = rows
    .filter((r): r is { nodeType: string; primaryDocsUrl: string } => !!r.primaryDocsUrl)
    .map((r) => ({ nodeType: r.nodeType, primaryDocsUrl: r.primaryDocsUrl }));

  if (opts.only && opts.only.length > 0) {
    const wanted = new Set(opts.only);
    keys = keys.filter((k) => wanted.has(k.nodeType));
  }

  logger.info(
    {
      mode: opts.mode ?? "smart",
      total: keys.length,
      concurrency: opts.concurrency ?? 6,
    },
    "smartRefreshAllNodeDocs: starting",
  );

  const summary = await smartRefresh(nodeDocsEnAdapter, keys, opts);

  logger.info(
    {
      mode: summary.mode,
      total: summary.total,
      added: summary.added,
      updated: summary.updated,
      unchanged: summary.unchanged,
      failed: summary.failed,
      durationMs: summary.durationMs,
      networkBytes: summary.networkBytes,
    },
    "smartRefreshAllNodeDocs: done",
  );

  return summary;
}

/**
 * Hydrate node-docs DB rows from local files (no network, no AI).
 * Useful after a DB reset / new machine: pulls every `.md` from
 * `lib/n8n-nodes-catalog/docs/en/` into rows that have no markdown yet.
 */
export async function hydrateNodeDocsFromDisk(): Promise<HydrateSummary> {
  const summary = await hydrateFromDisk(nodeDocsEnAdapter, "en");
  logger.info(
    {
      kind: summary.kind,
      scanned: summary.scanned,
      imported: summary.imported,
      skipped: summary.skipped,
      failed: summary.failed,
    },
    "hydrateNodeDocsFromDisk: done",
  );
  return summary;
}
