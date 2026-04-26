import { db, usersTable, userPermissionsTable, templatesTable, ALL_PERMISSIONS } from "@workspace/db";
import { loadSystemTemplates } from "@workspace/n8n-nodes-catalog/templates";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./lib/logger";
import { seedNodeCatalog } from "./services/nodeCatalog.service";

// Re-exported for the one-shot extraction script (`scripts/extract-templates.mjs`)
// to compare against the structured source-of-truth in `seed.templates.ts`.
// At normal runtime we read from disk via `loadSystemTemplates()` instead.
export { SYSTEM_TEMPLATES_SOURCE as SYSTEM_TEMPLATES } from "./seed.templates";

export async function seedDatabase() {
  logger.info("Starting database seed...");

  // ─── Admin User ──────────────────────────────────────────────────────────────
  // Check if ANY admin role user exists (not tied to a specific username)
  const existingAdmin = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"))
    .limit(1);

  if (!existingAdmin[0]) {
    const passwordHash = await bcrypt.hash("123456", 10);
    const [admin] = await db.insert(usersTable).values({
      username: "admin",
      passwordHash,
      role: "admin",
      isActive: true,
      forcePasswordChange: false,
    }).returning();

    if (admin) {
      await db.insert(userPermissionsTable).values(
        ALL_PERMISSIONS.map(key => ({
          userId: admin.id,
          permissionKey: key,
          isEnabled: true,
        }))
      );
      logger.info({ userId: admin.id }, "Admin user created: admin / 123456");
    }
  } else {
    logger.info("Admin user already exists — skipping");
  }

  // ─── System Templates (Phase 5B: loaded from disk) ───────────────────────────
  const templates = loadSystemTemplates();
  let inserted = 0;
  for (const template of templates) {
    const existing = await db.select({ id: templatesTable.id })
      .from(templatesTable)
      .where(eq(templatesTable.name, template.name))
      .limit(1);

    if (!existing[0]) {
      await db.insert(templatesTable).values({
        name: template.name,
        nameEn: template.nameEn,
        description: template.description,
        descriptionEn: template.descriptionEn,
        category: template.category,
        nodesCount: template.nodesCount,
        workflowJson: template.workflowJson,
        usageCount: 0,
        avgRating: template.avgRating,
        isSystem: true,
      });
      inserted++;
      logger.info({ name: template.name, slug: template.slug }, "Template seeded");
    }
  }
  logger.info({ total: templates.length, inserted }, "System templates synced");

  // ─── n8n Node Catalog ────────────────────────────────────────────────────────
  try {
    const catalogResult = await seedNodeCatalog();
    if (catalogResult.inserted > 0) {
      logger.info(catalogResult, "Node catalog seeded");
    } else {
      logger.info({ total: catalogResult.total }, "Node catalog already up to date");
    }
  } catch (err) {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, "Node catalog seeding failed");
  }

  logger.info("Seed completed successfully.");
}
