import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const systemSettingsTable = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  n8nUrl: text("n8n_url"),
  n8nApiKeyEncrypted: text("n8n_api_key_encrypted"),
  n8nApiKeyIv: text("n8n_api_key_iv"),
  openaiKeyEncrypted: text("openai_key_encrypted"),
  openaiKeyIv: text("openai_key_iv"),
  openaiKeyUpdatedAt: timestamp("openai_key_updated_at", { withTimezone: true }),
  geminiKeyEncrypted: text("gemini_key_encrypted"),
  geminiKeyIv: text("gemini_key_iv"),
  geminiKeyUpdatedAt: timestamp("gemini_key_updated_at", { withTimezone: true }),
  onboardingComplete: text("onboarding_complete").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettingsTable.$inferSelect;
