import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export interface MemoryWorkflow {
  n8nId: string;
  name: string;
  description: string;
  nodeTypes: string[];
  qualityScore: number;
  createdAt: string;
  tags: string[];
}

export interface UserPatterns {
  preferredLang: "ar" | "en";
  frequentNodeTypes: string[];
  totalWorkflowsCreated: number;
  lastActiveAt: string;
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
}

export const agentMemoryTable = pgTable("agent_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdWorkflows: jsonb("created_workflows").$type<MemoryWorkflow[]>().notNull().default([]),
  userPatterns: jsonb("user_patterns").$type<UserPatterns>().notNull().default({
    preferredLang: "ar",
    frequentNodeTypes: [],
    totalWorkflowsCreated: 0,
    lastActiveAt: new Date().toISOString(),
  }),
  n8nCredentials: jsonb("n8n_credentials").$type<N8nCredential[]>().notNull().default([]),
  lastN8nCredentialSync: timestamp("last_n8n_credential_sync", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAgentMemorySchema = createInsertSchema(agentMemoryTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
export type AgentMemory = typeof agentMemoryTable.$inferSelect;
