import { pgTable, text, serial, timestamp, integer, real, index } from "drizzle-orm/pg-core";

/**
 * node_doc_sections: تقسيم كل توثيق إلى أقسام (operations / parameters / examples / ...)
 * لتمكين البحث الدلالي على مستوى الأقسام بدلاً من الوثائق الكاملة.
 *
 * - sectionTitle: عنوان القسم (من H1..H6 في Markdown).
 * - sectionPath: مسار شجري للعنوان (مثل: "Operations > Send Message").
 * - body: محتوى القسم (نص).
 * - tokenCount: عدد الكلمات (لقياسات BM25).
 * - termVector: قاموس term→count مُسلسل JSON (لتسريع التشابه TF-IDF بدون pgvector).
 */
export const nodeDocSectionsTable = pgTable(
  "node_doc_sections",
  {
    id: serial("id").primaryKey(),
    nodeType: text("node_type").notNull(),
    language: text("language").notNull(),
    sectionIdx: integer("section_idx").notNull(),
    sectionTitle: text("section_title").notNull(),
    sectionPath: text("section_path").notNull(),
    body: text("body").notNull(),
    tokenCount: integer("token_count").notNull(),
    termVectorJson: text("term_vector_json").notNull(), // JSON: { term: count }
    embedding: text("embedding"), // اختياري: JSON Array<number> عند تفعيل embeddings خارجية
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("node_doc_sections_node_lang_idx").on(t.nodeType, t.language),
    index("node_doc_sections_title_idx").on(t.sectionTitle),
  ]
);

export type NodeDocSection = typeof nodeDocSectionsTable.$inferSelect;
