import { pgTable, text, serial, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * node_docs: caches the full Markdown documentation for each n8n node,
 * along with its Arabic translation (filled lazily on first request).
 *
 * One row per (node_type, language) tuple. Languages: 'en' (source) | 'ar'.
 *
 * - markdown:   raw Markdown (English from n8n-io/n8n-docs, or Arabic translation)
 * - sourceUrl:  the URL the doc was fetched from (English rows only)
 * - sourceSha:  GitHub blob SHA, used for cheap "has it changed?" diff
 * - error:      if the last fetch/translate failed, the error message (so we don't loop)
 */
export const nodeDocsTable = pgTable(
  "node_docs",
  {
    id: serial("id").primaryKey(),
    nodeType: text("node_type").notNull(),
    language: text("language").notNull(), // 'en' | 'ar'
    markdown: text("markdown"),
    sourceUrl: text("source_url"),
    sourceSha: text("source_sha"),
    error: text("error"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("node_docs_type_lang_uq").on(t.nodeType, t.language),
    index("node_docs_node_type_idx").on(t.nodeType),
  ]
);

export type NodeDocs = typeof nodeDocsTable.$inferSelect;
