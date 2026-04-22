import { pgTable, text, serial, timestamp, boolean, jsonb, integer, index } from "drizzle-orm/pg-core";

export const nodeCatalogTable = pgTable(
  "node_catalog",
  {
    id: serial("id").primaryKey(),
    nodeType: text("node_type").notNull().unique(),
    displayName: text("display_name").notNull(),
    folder: text("folder").notNull(),
    fileName: text("file_name").notNull(),
    isTrigger: boolean("is_trigger").notNull().default(false),
    nodeVersion: text("node_version").notNull().default("1.0"),
    codexVersion: text("codex_version").notNull().default("1.0"),
    categories: jsonb("categories").notNull().default([]),
    subcategories: jsonb("subcategories").notNull().default({}),
    aliases: jsonb("aliases").notNull().default([]),
    credentialDocsUrl: text("credential_docs_url"),
    primaryDocsUrl: text("primary_docs_url"),
    examples: jsonb("examples").notNull().default([]),
    iconUrl: text("icon_url"),
    sourcePath: text("source_path"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("node_catalog_display_name_idx").on(t.displayName),
    index("node_catalog_folder_idx").on(t.folder),
  ]
);

export const nodeCatalogMetaTable = pgTable("node_catalog_meta", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  branch: text("branch").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  totalNodes: integer("total_nodes").notNull().default(0),
});

export type NodeCatalogEntry = typeof nodeCatalogTable.$inferSelect;
export type NodeCatalogMeta = typeof nodeCatalogMetaTable.$inferSelect;
