/**
 * SmartCacheService — Generic types for unified content caching.
 *
 * See `docs/plans/unified-content-cache-plan.md` (Phase 2) for the full design.
 *
 * Contracts (must never be broken):
 *  1. `source_sha = sha1(raw_bytes_from_source)` — before any parser/cleaner.
 *  2. `manual_override` is never touched by any automatic refresh path.
 *  3. Hydrate uses no network and no AI ever.
 *  4. Dry-run never writes to DB, disk, or calls AI.
 *  5. Backwards-compatible flags continue to work.
 */

export type DocLang = "en" | "ar";

export type RefreshStatus = "added" | "updated" | "unchanged" | "failed";

export type RefreshMode = "smart" | "force" | "dry-run";

/** A single piece of content the cache knows how to (re)fetch and store. */
export interface ContentResource<TKey = unknown> {
  /** A short stable label for telemetry, manifests and routes. */
  kind: string;
  /** A stable identifier for one entry inside this kind (e.g. node type). */
  slug: string;
  /** Optional language for translated kinds. */
  language?: DocLang;
  /** Logical key passed back to the resource's mutators. */
  key: TKey;
  /** Absolute path on disk where the content mirror lives. */
  diskPath: string;
  /** Source URL list — first one to respond wins. */
  sourceUrls: string[];
}

/** Result of a single HTTP fetch with ETag/SHA metadata. */
export interface FetchedContent {
  unchanged: boolean;
  body?: string;
  /** SHA-1 of raw bytes (before any cleaning/parsing). */
  sha?: string;
  /** ETag header from the source (verbatim). */
  etag?: string;
  /** The URL that actually served the response (one of `sourceUrls`). */
  sourceUrl?: string;
  /** HTTP status (200 / 304 / 404 / ...). */
  status: number;
  error?: string;
}

/** What the cache knows about a row already stored. */
export interface StoredMeta {
  exists: boolean;
  sha: string | null;
  etag: string | null;
  hasContent: boolean;
  isDirty: boolean;
}

/** Per-entry result of `smartRefresh`. */
export interface SmartRefreshEntryResult {
  slug: string;
  language?: DocLang;
  status: RefreshStatus;
  newSha?: string | null;
  newEtag?: string | null;
  bytes?: number;
  error?: string;
}

/** Aggregated result of refreshing many entries. */
export interface SmartRefreshSummary {
  kind: string;
  mode: RefreshMode;
  total: number;
  added: number;
  updated: number;
  unchanged: number;
  failed: number;
  durationMs: number;
  networkBytes: number;
  details: SmartRefreshEntryResult[];
}

export interface SmartRefreshOptions {
  mode?: RefreshMode;
  /** Bound on parallel network requests. Default 6. */
  concurrency?: number;
  /** Fired after each entry resolves; used for SSE progress. */
  onProgress?: (entry: SmartRefreshEntryResult, summary: SmartRefreshSummary) => void;
}

/** Result of `hydrateFromDisk` for one (kind,language) pair. */
export interface HydrateSummary {
  kind: string;
  language?: DocLang;
  scanned: number;
  imported: number;
  skipped: number;
  failed: number;
}
