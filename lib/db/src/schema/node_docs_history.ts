import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";

/**
 * node_docs_history: نسخ تاريخية من توثيقات العقد.
 * تُحفظ نسخة قبل كل تعديل (refresh / translate / manual override)
 * لتمكين عرض التغييرات والاستعادة (rollback).
 */
export const nodeDocsHistoryTable = pgTable(
  "node_docs_history",
  {
    id: serial("id").primaryKey(),
    nodeType: text("node_type").notNull(),
    language: text("language").notNull(), // 'en' | 'ar'
    markdown: text("markdown"),
    sourceUrl: text("source_url"),
    changeType: text("change_type").notNull(), // 'fetch' | 'translate' | 'manual_edit' | 'auto_sync'
    changedBy: integer("changed_by"), // user id (nullable for auto)
    note: text("note"),
    snapshotAt: timestamp("snapshot_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("node_docs_history_node_lang_idx").on(t.nodeType, t.language),
    index("node_docs_history_snapshot_at_idx").on(t.snapshotAt),
  ]
);

export type NodeDocsHistory = typeof nodeDocsHistoryTable.$inferSelect;
