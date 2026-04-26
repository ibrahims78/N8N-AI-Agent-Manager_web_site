/**
 * NodeDocs adapter — wires the SmartCacheService to the n8n node-docs cache.
 *
 * Phase 3 of `docs/plans/unified-content-cache-plan.md`.
 *
 * Design:
 *   - SmartCacheService does ONE cheap conditional GET per node against the
 *     primary `.md` (or `index.md`) file with `If-None-Match`.
 *   - SHA stored = sha1(raw primary file bytes) — the canonical change marker.
 *   - On change, we delegate the FULL upstream pipeline (siblings, snippets,
 *     image rewrites, frontmatter header) to the existing
 *     `fetchMarkdownFromGithub`. SmartCacheService never sees those bytes.
 *   - Dry-run never triggers the pipeline (the orchestrator short-circuits
 *     before calling `upsert`).
 *   - `manualOverrideMarkdown` is treated as `is_dirty`: we never refresh.
 *   - Hydration uses `ON CONFLICT DO NOTHING`-style insert that only fills
 *     rows whose `markdown IS NULL` AND have no manual override.
 */
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { db, nodeCatalogTable, nodeDocsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import type {
  DocLang,
  ResourceAdapter,
  StoredMeta,
  UpsertPayload,
  ContentResource,
} from "./smartCache";
import { _internal } from "./nodeDocs.service";

const { docsUrlToRepoPath, candidateRawUrls, fetchMarkdownFromGithub } = _internal;

const DOCS_REPO_RAW = "https://raw.githubusercontent.com/n8n-io/n8n-docs/main";

/**
 * Resolve the docs root *relative to this file*, not `process.cwd()`. This
 * makes the adapter robust whether the server is launched from the api-server
 * dir (workflow) or the monorepo root (tests / scripts).
 *
 * This file lives at: `<root>/artifacts/api-server/src/services/nodeDocs.adapter.ts`
 * Docs root at:       `<root>/lib/n8n-nodes-catalog/docs`
 *      ⇒ go up 5 levels.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DOCS_ROOT = path.resolve(__dirname, "../../../../lib/n8n-nodes-catalog/docs");

export interface NodeDocsKey {
  nodeType: string;
  primaryDocsUrl: string;
}

function nodeTypeToFilename(nodeType: string): string {
  return nodeType.replace(/\//g, "__").replace(/@/g, "_at_") + ".md";
}

function filenameToNodeType(file: string): string | null {
  if (!file.endsWith(".md")) return null;
  return file.slice(0, -3).replace(/_at_/g, "@").replace(/__/g, "/");
}

function resolveSourceUrls(primaryDocsUrl: string): string[] {
  const repoPath = docsUrlToRepoPath(primaryDocsUrl);
  if (!repoPath) return [];
  return candidateRawUrls(repoPath);
}

/**
 * The English NodeDocs adapter. Arabic translation is a separate, AI-driven
 * concern that lives outside the SmartCacheService (per Plan §15.2).
 */
export class NodeDocsEnAdapter implements ResourceAdapter<NodeDocsKey> {
  kind = "node-docs";
  rootDir = LOCAL_DOCS_ROOT;

  describe(key: NodeDocsKey): ContentResource<NodeDocsKey> {
    const sourceUrls = resolveSourceUrls(key.primaryDocsUrl);
    return {
      kind: this.kind,
      slug: key.nodeType,
      language: "en",
      key,
      diskPath: path.join(this.rootDir, "en", nodeTypeToFilename(key.nodeType)),
      sourceUrls,
    };
  }

  async getStored(key: NodeDocsKey): Promise<StoredMeta> {
    const row = (
      await db
        .select({
          markdown: nodeDocsTable.markdown,
          sourceSha: nodeDocsTable.sourceSha,
          sourceEtag: nodeDocsTable.sourceEtag,
          manualOverride: nodeDocsTable.manualOverrideMarkdown,
          isDirty: nodeDocsTable.isDirty,
        })
        .from(nodeDocsTable)
        .where(
          and(eq(nodeDocsTable.nodeType, key.nodeType), eq(nodeDocsTable.language, "en")),
        )
        .limit(1)
    )[0];
    if (!row) {
      return { exists: false, sha: null, etag: null, hasContent: false, isDirty: false };
    }
    const dirty = row.isDirty || (row.manualOverride != null && row.manualOverride.length > 0);
    return {
      exists: true,
      sha: row.sourceSha ?? null,
      etag: row.sourceEtag ?? null,
      hasContent: row.markdown != null && row.markdown.length > 0,
      isDirty: dirty,
    };
  }

  /**
   * Called by SmartCacheService AFTER it has confirmed the upstream changed.
   *
   * We *do not* persist `payload.body` (which is the raw primary `.md` only) —
   * instead we run the full pipeline so siblings/snippets/images stay correct.
   * The SHA we persist is the smart-cache one (`payload.sha`), so the next
   * smart check is comparing apples to apples.
   */
  async upsert(key: NodeDocsKey, payload: UpsertPayload): Promise<void> {
    const fetched = await fetchMarkdownFromGithub(key.nodeType, key.primaryDocsUrl);
    if (!fetched) {
      // Pipeline failure even though primary file fetched — record it.
      await this._writeRow(key, {
        markdown: null,
        sourceUrl: payload.sourceUrl,
        sourceSha: payload.sha,
        sourceEtag: payload.etag ?? null,
        error: "Pipeline returned null after smart-refresh trigger",
      });
      throw new Error(`pipeline failed for ${key.nodeType}`);
    }

    await this._writeRow(key, {
      markdown: fetched.markdown,
      sourceUrl: fetched.sourceUrl,
      sourceSha: payload.sha,
      sourceEtag: payload.etag ?? null,
      error: null,
    });

    // Mirror to disk (best-effort).
    try {
      const dir = path.join(this.rootDir, "en");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        path.join(dir, nodeTypeToFilename(key.nodeType)),
        fetched.markdown,
        "utf-8",
      );
    } catch (err) {
      logger.warn(
        { err, nodeType: key.nodeType },
        "NodeDocsEnAdapter.upsert: failed to mirror to disk",
      );
    }

    // Reindex BM25 sections (best-effort, mirrors legacy behaviour).
    try {
      const { reindexNodeSections } = await import("./docsAdvanced.service");
      await reindexNodeSections(key.nodeType, "en", fetched.markdown);
    } catch (err) {
      logger.warn(
        { err, nodeType: key.nodeType },
        "NodeDocsEnAdapter.upsert: failed to reindex sections",
      );
    }
  }

  async recordError(key: NodeDocsKey, error: string): Promise<void> {
    await this._writeRow(key, {
      markdown: null,
      sourceUrl: null,
      sourceSha: null,
      sourceEtag: null,
      error,
    });
  }

  async listDiskKeys(_language?: DocLang): Promise<NodeDocsKey[]> {
    // For node docs the language is always 'en' on the source side.
    const dir = path.join(this.rootDir, "en");
    let files: string[];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
    } catch {
      return [];
    }
    if (files.length === 0) return [];

    // Look up primary docs URL from the catalog so the adapter can describe()
    // each key correctly. One query, in-memory map.
    const catalogRows = await db
      .select({
        nodeType: nodeCatalogTable.nodeType,
        primaryDocsUrl: nodeCatalogTable.primaryDocsUrl,
      })
      .from(nodeCatalogTable);
    const catalog = new Map(catalogRows.map((r) => [r.nodeType, r.primaryDocsUrl]));

    const keys: NodeDocsKey[] = [];
    for (const file of files) {
      const nodeType = filenameToNodeType(file);
      if (!nodeType) continue;
      keys.push({
        nodeType,
        primaryDocsUrl: catalog.get(nodeType) ?? "",
      });
    }
    return keys;
  }

  async readDiskContent(key: NodeDocsKey): Promise<string | null> {
    const filePath = path.join(this.rootDir, "en", nodeTypeToFilename(key.nodeType));
    try {
      const txt = await fs.readFile(filePath, "utf-8");
      return txt && txt.length > 10 ? txt : null;
    } catch {
      return null;
    }
  }

  /**
   * Hydration insert with `WHERE markdown IS NULL AND manual_override IS NULL`
   * built into the conflict resolution. NEVER overwrites live content or
   * manual overrides — Plan §15.3.
   */
  async hydrateInsert(key: NodeDocsKey, content: string): Promise<boolean> {
    const inserted = await db
      .insert(nodeDocsTable)
      .values({
        nodeType: key.nodeType,
        language: "en",
        markdown: content,
        sourceUrl: null,
        sourceSha: null,
        sourceEtag: null,
        error: null,
        fetchedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [nodeDocsTable.nodeType, nodeDocsTable.language],
        set: {
          markdown: sql`COALESCE(${nodeDocsTable.markdown}, EXCLUDED.markdown)`,
          fetchedAt: sql`CASE WHEN ${nodeDocsTable.markdown} IS NULL THEN NOW() ELSE ${nodeDocsTable.fetchedAt} END`,
        },
        where: and(
          sql`${nodeDocsTable.markdown} IS NULL`,
          sql`${nodeDocsTable.manualOverrideMarkdown} IS NULL`,
          sql`${nodeDocsTable.isDirty} = false`,
        ),
      })
      .returning({ id: nodeDocsTable.id, markdown: nodeDocsTable.markdown });

    // Returned only when our INSERT or UPDATE actually ran. If `markdown` came
    // back equal to our `content` we definitely imported.
    return inserted.length > 0 && inserted[0]!.markdown === content;
  }

  /** Internal helper: do the actual upsert UPDATE in a single SQL statement. */
  private async _writeRow(
    key: NodeDocsKey,
    fields: {
      markdown: string | null;
      sourceUrl: string | null;
      sourceSha: string | null;
      sourceEtag: string | null;
      error: string | null;
    },
  ): Promise<void> {
    const now = new Date();
    await db
      .insert(nodeDocsTable)
      .values({
        nodeType: key.nodeType,
        language: "en",
        markdown: fields.markdown,
        sourceUrl: fields.sourceUrl,
        sourceSha: fields.sourceSha,
        sourceEtag: fields.sourceEtag,
        error: fields.error,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: [nodeDocsTable.nodeType, nodeDocsTable.language],
        set: {
          markdown: fields.markdown,
          sourceUrl: fields.sourceUrl,
          sourceSha: fields.sourceSha,
          sourceEtag: fields.sourceEtag,
          error: fields.error,
          fetchedAt: now,
        },
      });
  }
}

/** Singleton — adapters are stateless. */
export const nodeDocsEnAdapter = new NodeDocsEnAdapter();

/** Re-export for callers that don't want to import the constants twice. */
export { LOCAL_DOCS_ROOT, DOCS_REPO_RAW };
