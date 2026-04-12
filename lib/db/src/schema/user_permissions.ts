import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const userPermissionsTable = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  permissionKey: text("permission_key").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserPermissionSchema = createInsertSchema(userPermissionsTable).omit({ id: true, updatedAt: true });
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type UserPermission = typeof userPermissionsTable.$inferSelect;

export const ALL_PERMISSIONS = [
  "view_workflows",
  "manage_workflows",
  "use_chat",
  "view_templates",
  "view_history",
  "manage_settings",
  "view_dashboard",
  "export_data",
  "import_workflows",
  "manage_notifications",
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];
