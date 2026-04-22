/**
 * nodeCatalog.service.ts
 *
 * Service for managing the n8n node catalog. The catalog contains metadata
 * (categories, aliases, documentation links, examples) for all 430+ n8n nodes,
 * sourced from the official n8n GitHub repository (.node.json codex files).
 *
 * The static JSON ships with the package; the database mirrors it for fast
 * SQL lookups and so the AI agent can query enriched metadata at runtime.
 */
import { db, nodeCatalogTable, nodeCatalogMetaTable } from "@workspace/db";
import { catalog as staticCatalog, type CatalogNode } from "@workspace/n8n-nodes-catalog";
import { sql, eq, ilike, or, asc } from "drizzle-orm";
import { logger } from "../lib/logger";

export type { CatalogNode };

export interface CatalogStatus {
  totalNodes: number;
  source: string;
  branch: string;
  fetchedAt: string | null;
  loadedFromStatic: boolean;
}

/**
 * Seeds the database from the bundled static catalog.json.
 * Idempotent: safe to call on every startup. Uses ON CONFLICT DO UPDATE.
 */
export async function seedNodeCatalog(): Promise<{ inserted: number; total: number }> {
  const nodes = staticCatalog.nodes;
  if (!nodes || nodes.length === 0) {
    logger.warn("Node catalog: static catalog is empty, skipping seed");
    return { inserted: 0, total: 0 };
  }

  // Check if catalog is already up to date by comparing meta
  const existingMeta = await db.select().from(nodeCatalogMetaTable).limit(1);
  const meta = existingMeta[0];
  if (meta && meta.fetchedAt && new Date(meta.fetchedAt).toISOString() === staticCatalog.fetchedAt) {
    return { inserted: 0, total: meta.totalNodes };
  }

  // Bulk upsert with chunks to avoid hitting parameter limits
  const chunkSize = 100;
  let inserted = 0;
  for (let i = 0; i < nodes.length; i += chunkSize) {
    const chunk = nodes.slice(i, i + chunkSize);
    await db
      .insert(nodeCatalogTable)
      .values(
        chunk.map((n) => ({
          nodeType: n.nodeType,
          displayName: n.displayName,
          folder: n.folder,
          fileName: n.fileName,
          isTrigger: n.isTrigger,
          nodeVersion: n.nodeVersion,
          codexVersion: n.codexVersion,
          categories: n.categories,
          subcategories: n.subcategories,
          aliases: n.aliases,
          credentialDocsUrl: n.credentialDocsUrl,
          primaryDocsUrl: n.primaryDocsUrl,
          examples: n.examples,
          iconUrl: n.iconUrl,
          sourcePath: n.sourcePath,
          updatedAt: new Date(),
        }))
      )
      .onConflictDoUpdate({
        target: nodeCatalogTable.nodeType,
        set: {
          displayName: sql`excluded.display_name`,
          folder: sql`excluded.folder`,
          fileName: sql`excluded.file_name`,
          isTrigger: sql`excluded.is_trigger`,
          nodeVersion: sql`excluded.node_version`,
          codexVersion: sql`excluded.codex_version`,
          categories: sql`excluded.categories`,
          subcategories: sql`excluded.subcategories`,
          aliases: sql`excluded.aliases`,
          credentialDocsUrl: sql`excluded.credential_docs_url`,
          primaryDocsUrl: sql`excluded.primary_docs_url`,
          examples: sql`excluded.examples`,
          iconUrl: sql`excluded.icon_url`,
          sourcePath: sql`excluded.source_path`,
          updatedAt: sql`now()`,
        },
      });
    inserted += chunk.length;
  }

  // Update meta
  if (meta) {
    await db
      .update(nodeCatalogMetaTable)
      .set({
        source: staticCatalog.source,
        branch: staticCatalog.branch,
        fetchedAt: new Date(staticCatalog.fetchedAt),
        totalNodes: nodes.length,
      })
      .where(eq(nodeCatalogMetaTable.id, meta.id));
  } else {
    await db.insert(nodeCatalogMetaTable).values({
      source: staticCatalog.source,
      branch: staticCatalog.branch,
      fetchedAt: new Date(staticCatalog.fetchedAt),
      totalNodes: nodes.length,
    });
  }

  logger.info({ inserted, total: nodes.length }, "Node catalog seeded");
  return { inserted, total: nodes.length };
}

export async function getCatalogStatus(): Promise<CatalogStatus> {
  const meta = (await db.select().from(nodeCatalogMetaTable).limit(1))[0];
  const countRow = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(nodeCatalogTable);
  return {
    totalNodes: countRow[0]?.c ?? 0,
    source: meta?.source ?? staticCatalog.source,
    branch: meta?.branch ?? staticCatalog.branch,
    fetchedAt: meta?.fetchedAt?.toISOString() ?? null,
    loadedFromStatic: !meta,
  };
}

export interface ListCatalogOptions {
  search?: string;
  category?: string;
  isTrigger?: boolean;
  limit?: number;
  offset?: number;
}

export async function listCatalog(opts: ListCatalogOptions = {}) {
  const { search, category, isTrigger, limit = 50, offset = 0 } = opts;

  const conditions = [];
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(nodeCatalogTable.displayName, q),
        ilike(nodeCatalogTable.nodeType, q),
        ilike(nodeCatalogTable.folder, q),
        sql`${nodeCatalogTable.aliases}::text ilike ${q}`
      )
    );
  }
  if (category && category !== "all") {
    conditions.push(sql`${nodeCatalogTable.categories} @> ${JSON.stringify([category])}::jsonb`);
  }
  if (typeof isTrigger === "boolean") {
    conditions.push(eq(nodeCatalogTable.isTrigger, isTrigger));
  }

  const whereClause = conditions.length
    ? sql.join(conditions, sql` AND `)
    : undefined;

  const [items, total] = await Promise.all([
    db
      .select()
      .from(nodeCatalogTable)
      .where(whereClause)
      .orderBy(asc(nodeCatalogTable.displayName))
      .limit(limit)
      .offset(offset),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(nodeCatalogTable)
      .where(whereClause),
  ]);

  return {
    items,
    total: total[0]?.c ?? 0,
    limit,
    offset,
  };
}

export async function getCategories(): Promise<{ name: string; count: number }[]> {
  const rows = await db.execute<{ category: string; count: number }>(sql`
    SELECT jsonb_array_elements_text(categories) AS category, count(*)::int AS count
    FROM node_catalog
    GROUP BY category
    ORDER BY count DESC
  `);
  return rows.rows.map((r) => ({ name: r.category, count: Number(r.count) }));
}

export async function lookupNode(nodeType: string): Promise<CatalogNode | null> {
  const lower = nodeType.toLowerCase().trim();
  if (!lower) return null;

  // Exact match by node_type
  const byType = await db
    .select()
    .from(nodeCatalogTable)
    .where(eq(nodeCatalogTable.nodeType, lower))
    .limit(1);
  if (byType[0]) return rowToNode(byType[0]);

  // Try by folder name
  const byFolder = await db
    .select()
    .from(nodeCatalogTable)
    .where(ilike(nodeCatalogTable.folder, lower))
    .limit(1);
  if (byFolder[0]) return rowToNode(byFolder[0]);

  // Try by alias
  const byAlias = await db
    .select()
    .from(nodeCatalogTable)
    .where(sql`${nodeCatalogTable.aliases}::text ilike ${`%${lower}%`}`)
    .limit(1);
  if (byAlias[0]) return rowToNode(byAlias[0]);

  return null;
}

export async function searchCatalogDb(query: string, limit = 10): Promise<CatalogNode[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const pattern = `%${q}%`;
  const rows = await db
    .select()
    .from(nodeCatalogTable)
    .where(
      or(
        ilike(nodeCatalogTable.nodeType, pattern),
        ilike(nodeCatalogTable.displayName, pattern),
        ilike(nodeCatalogTable.folder, pattern),
        sql`${nodeCatalogTable.aliases}::text ilike ${pattern}`,
        sql`${nodeCatalogTable.categories}::text ilike ${pattern}`
      )
    )
    .orderBy(asc(nodeCatalogTable.displayName))
    .limit(limit);
  return rows.map(rowToNode);
}

function rowToNode(r: typeof nodeCatalogTable.$inferSelect): CatalogNode {
  return {
    nodeType: r.nodeType,
    displayName: r.displayName,
    fileName: r.fileName,
    folder: r.folder,
    isTrigger: r.isTrigger,
    nodeVersion: r.nodeVersion,
    codexVersion: r.codexVersion,
    categories: (r.categories as string[]) ?? [],
    subcategories: (r.subcategories as Record<string, string[]>) ?? {},
    aliases: (r.aliases as string[]) ?? [],
    credentialDocsUrl: r.credentialDocsUrl,
    primaryDocsUrl: r.primaryDocsUrl,
    examples: (r.examples as { label: string; url: string; icon: string }[]) ?? [],
    iconUrl: r.iconUrl ?? "",
    sourcePath: r.sourcePath ?? "",
  };
}
