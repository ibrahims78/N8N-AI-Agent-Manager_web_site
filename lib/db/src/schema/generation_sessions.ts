import { pgTable, text, serial, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conversationsTable } from "./conversations";

export const generationSessionsTable = pgTable("generation_sessions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversationsTable.id, { onDelete: "set null" }),
  userRequest: text("user_request").notNull(),
  phase1Result: jsonb("phase_1_result"),
  phase2Feedback: text("phase_2_feedback"),
  phase3Result: jsonb("phase_3_result"),
  phase4Approved: boolean("phase_4_approved"),
  roundsCount: integer("rounds_count").notNull().default(0),
  totalTimeMs: integer("total_time_ms"),
  finalWorkflowJson: jsonb("final_workflow_json"),
  qualityScore: real("quality_score"),
  qualityReport: text("quality_report"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGenerationSessionSchema = createInsertSchema(generationSessionsTable).omit({ id: true, createdAt: true });
export type InsertGenerationSession = z.infer<typeof insertGenerationSessionSchema>;
export type GenerationSession = typeof generationSessionsTable.$inferSelect;
