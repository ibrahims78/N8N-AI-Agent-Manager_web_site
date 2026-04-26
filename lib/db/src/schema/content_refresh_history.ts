import {
  pgTable,
  text,
  serial,
  integer,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * content_refresh_history — Phase 7 of unified-content-cache-plan.md.
 *
 * One row per `smartRefresh` / `fetchAllGuides` invocation. Every kind
 * (`guide`, `node-doc`, future `catalog`/`template`) writes through the same
 * helper. The page Admin → Diagnostics groups by `kind` and shows the last
 * 30 runs with deltas, AI usage, and bytes.
 *
 * The writer is **best-effort**: a failed insert MUST NOT block or fail the
 * refresh itself. Logging-only on insert error.
 */
export const contentRefreshHistoryTable = pgTable(
  "content_refresh_history",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),                          // 'guide' | 'node-doc' | …
    runAt: timestamp("run_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    mode: text("mode").notNull(),                          // 'smart' | 'force' | 'dry-run'
    triggeredBy: integer("triggered_by"),                  // users.id (nullable for cron)
    total: integer("total").notNull(),
    added: integer("added").notNull().default(0),
    updated: integer("updated").notNull().default(0),
    unchanged: integer("unchanged").notNull().default(0),
    failed: integer("failed").notNull().default(0),
    durationMs: integer("duration_ms").notNull(),
    aiCalls: integer("ai_calls").notNull().default(0),
    networkBytes: bigint("network_bytes", { mode: "number" }).notNull().default(0),
    errorSummary: text("error_summary"),
  },
  (t) => [index("content_refresh_history_kind_run_at_idx").on(t.kind, t.runAt)],
);
