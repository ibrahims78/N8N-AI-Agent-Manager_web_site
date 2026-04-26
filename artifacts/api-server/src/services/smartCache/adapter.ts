/**
 * ResourceAdapter — the contract every "kind" of fetched content implements
 * to plug into the unified SmartCacheService.
 *
 * One adapter per kind (guides, node-docs, catalog entries, templates, ...).
 *
 * The adapter knows about its specific DB table, disk layout, and source URL
 * shape. The generic SmartCacheService below knows nothing about any specific
 * kind — it only orchestrates fetch → diff → write through the adapter.
 *
 * Design constraints (from §15 of the unified plan):
 *   - SHA stored = sha1(raw upstream bytes) — adapter MUST round-trip the
 *     fetched `sha` unchanged into `upsert(...)`.
 *   - `manual_override` is read by the adapter (`getStored().isDirty`) and
 *     respected by SmartCacheService; the adapter MUST never overwrite it.
 *   - All write paths MUST be no-ops in dry-run mode (the orchestrator
 *     guarantees this by short-circuiting before calling `upsert`).
 */
import type { ContentResource, DocLang, StoredMeta } from "./types";

export interface UpsertPayload {
  body: string;
  sha: string;
  etag?: string;
  sourceUrl: string;
}

export interface ResourceAdapter<TKey> {
  /** Short stable label, used in routes and manifest. */
  kind: string;

  /** Filesystem root where this kind's mirror lives (manifest sits in `<root>/<kind>/_meta/`). */
  rootDir: string;

  /** Map a key to its public face (slug, language, urls, disk path). */
  describe(key: TKey): ContentResource<TKey>;

  /** Optional content cleaner; runs after fetch, before write. */
  parseContent?: (raw: string) => string;

  /** Read what we have stored for this key (sha, etag, hasContent, dirty flag). */
  getStored(key: TKey): Promise<StoredMeta>;

  /** Persist new content (DB + disk). MUST honour the contracts above. */
  upsert(key: TKey, payload: UpsertPayload): Promise<void>;

  /** Persist that this key failed (so we don't loop on broken sources). */
  recordError(key: TKey, error: string): Promise<void>;

  /** List keys present on disk for the optional language filter. */
  listDiskKeys(language?: DocLang): Promise<TKey[]>;

  /** Read the on-disk content for one key, or null if missing/empty. */
  readDiskContent(key: TKey): Promise<string | null>;

  /**
   * Insert from disk into DB IFF the row does not already have content
   * (and is not protected by manual_override). Returns true if inserted.
   * Adapter implementation MUST use ON CONFLICT DO NOTHING (or equivalent)
   * so a race never overwrites live data.
   *
   * `meta` (Phase 4): when the manifest is available, the orchestrator passes
   * `{ sha, etag, sourceUrl }` so the adapter can populate `source_sha` /
   * `source_etag` / `source_url` on insert. After a DB wipe this lets the very
   * next smart-refresh send `If-None-Match` and get back 304s.
   */
  hydrateInsert(
    key: TKey,
    content: string,
    meta?: { sha?: string; etag?: string; sourceUrl?: string },
  ): Promise<boolean>;
}
