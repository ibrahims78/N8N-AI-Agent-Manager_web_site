import { pgTable, text, serial, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const templatesTable = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  category: text("category").notNull(),
  nodesCount: integer("nodes_count").notNull().default(0),
  workflowJson: jsonb("workflow_json").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  avgRating: real("avg_rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdBy: integer("created_by"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** Standardised SmartCache columns (Phase 1 of unified-content-cache-plan). */
  sourceUrl: text("source_url"),
  sourceSha: text("source_sha"),
  sourceEtag: text("source_etag"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }),
  manualOverride: jsonb("manual_override"),
  manualOverrideAt: timestamp("manual_override_at", { withTimezone: true }),
  manualOverrideBy: integer("manual_override_by"),
  manualOverrideNote: text("manual_override_note"),
  isDirty: boolean("is_dirty").notNull().default(false),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true, createdAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;
