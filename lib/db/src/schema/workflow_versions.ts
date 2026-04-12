import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workflowVersionsTable = pgTable("workflow_versions", {
  id: serial("id").primaryKey(),
  workflowN8nId: text("workflow_n8n_id").notNull(),
  versionNumber: integer("version_number").notNull().default(1),
  workflowJson: jsonb("workflow_json").notNull(),
  changeDescription: text("change_description").notNull().default(""),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkflowVersionSchema = createInsertSchema(workflowVersionsTable).omit({ id: true, createdAt: true });
export type InsertWorkflowVersion = z.infer<typeof insertWorkflowVersionSchema>;
export type WorkflowVersion = typeof workflowVersionsTable.$inferSelect;
