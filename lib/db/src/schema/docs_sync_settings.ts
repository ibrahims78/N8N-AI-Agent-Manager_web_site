import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

/**
 * docs_sync_settings: إعدادات المزامنة الدورية لتوثيقات n8n.
 * صف واحد فقط (singleton).
 */
export const docsSyncSettingsTable = pgTable("docs_sync_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  intervalHours: integer("interval_hours").notNull().default(24),
  autoTranslate: boolean("auto_translate").notNull().default(false),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  lastRunStatus: text("last_run_status"), // 'success' | 'failed' | 'partial'
  lastRunSummary: text("last_run_summary"), // JSON
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
});

export type DocsSyncSettings = typeof docsSyncSettingsTable.$inferSelect;
