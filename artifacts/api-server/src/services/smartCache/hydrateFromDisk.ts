/**
 * Generic disk-to-DB hydration.
 *
 * Reads every file the adapter knows about for the given language, and inserts
 * those that DB doesn't already have content for. Insert path uses
 * `ON CONFLICT DO NOTHING` (delegated to the adapter) so a row that's already
 * filled — including by a manual_override — is never overwritten.
 *
 * Hydration NEVER touches the network and NEVER calls AI. (Plan §15.3.)
 *
 * Phase 4 — Manifest layer:
 *   - Reads `<rootDir>/_meta/<kind>.manifest.json` once.
 *   - For every disk key, passes the matching manifest entry's `sha`/`etag`/
 *     `sourceUrl` into `adapter.hydrateInsert(key, content, meta)` so the DB
 *     wakes up fully primed for a 304-only next smart-refresh.
 */
import {
  emptyManifest,
  manifestKey,
  readManifest,
  type Manifest,
} from "./manifest";
import type { ResourceAdapter } from "./adapter";
import type { DocLang, HydrateSummary } from "./types";

export async function hydrateFromDisk<TKey>(
  adapter: ResourceAdapter<TKey>,
  language?: DocLang,
): Promise<HydrateSummary> {
  const summary: HydrateSummary = {
    kind: adapter.kind,
    language,
    scanned: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
  };

  // Phase 4: read manifest once; if missing/corrupt, fall back to empty.
  let manifest: Manifest = emptyManifest(adapter.kind);
  try {
    manifest = await readManifest(adapter.rootDir, adapter.kind);
  } catch {
    manifest = emptyManifest(adapter.kind);
  }

  let keys: TKey[];
  try {
    keys = await adapter.listDiskKeys(language);
  } catch {
    return summary;
  }
  summary.scanned = keys.length;

  for (const key of keys) {
    try {
      const content = await adapter.readDiskContent(key);
      if (!content || content.length < 10) {
        summary.skipped += 1;
        continue;
      }
      const desc = adapter.describe(key);
      const mEntry = manifest.entries[manifestKey(desc.slug, desc.language)];
      const meta = mEntry
        ? { sha: mEntry.sha, etag: mEntry.etag, sourceUrl: mEntry.sourceUrl }
        : undefined;
      const inserted = await adapter.hydrateInsert(key, content, meta);
      if (inserted) summary.imported += 1;
      else summary.skipped += 1;
    } catch {
      summary.failed += 1;
    }
  }

  return summary;
}
