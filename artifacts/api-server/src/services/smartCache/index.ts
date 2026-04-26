/**
 * SmartCacheService — Public surface.
 *
 * See `docs/plans/unified-content-cache-plan.md` for the design.
 *
 * Usage:
 *   const adapter = new MyKindAdapter(...);
 *   const summary = await smartRefresh(adapter, keys, { mode: 'smart' });
 *   const hydration = await hydrateFromDisk(adapter, 'en');
 */
export type {
  DocLang,
  RefreshMode,
  RefreshStatus,
  ContentResource,
  FetchedContent,
  StoredMeta,
  SmartRefreshEntryResult,
  SmartRefreshOptions,
  SmartRefreshSummary,
  HydrateSummary,
} from "./types";

export type { ResourceAdapter, UpsertPayload } from "./adapter";

export { fetchWithEtag, fetchAnyWithEtag } from "./etagFetcher";
export type { FetchWithEtagOptions } from "./etagFetcher";

export { pAll } from "./concurrency";

export {
  readManifest,
  writeManifest,
  upsertManifestEntry,
  emptyManifest,
  manifestKey,
  manifestPath,
} from "./manifest";
export type { Manifest, ManifestEntry } from "./manifest";

export { smartRefresh } from "./smartRefresh";
export { hydrateFromDisk } from "./hydrateFromDisk";
