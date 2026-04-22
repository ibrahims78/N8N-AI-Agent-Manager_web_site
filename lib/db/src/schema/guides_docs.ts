import { pgTable, text, serial, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * guides_docs: توثيقات n8n العامة (غير المرتبطة بعقدة بعينها):
 * Glossary, Hosting, Workflows guide, Expressions reference, etc.
 *
 * المعرّف هو slug فريد (مثل: "glossary", "hosting/installation", "workflows/components").
 */
export const guidesDocsTable = pgTable(
  "guides_docs",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    language: text("language").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(), // glossary | hosting | workflows | api | expressions | other
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
    uniqueIndex("guides_docs_slug_lang_uq").on(t.slug, t.language),
    index("guides_docs_category_idx").on(t.category),
  ]
);

export type GuidesDoc = typeof guidesDocsTable.$inferSelect;
