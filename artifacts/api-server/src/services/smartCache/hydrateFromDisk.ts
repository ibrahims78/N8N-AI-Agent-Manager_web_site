/**
 * Generic disk-to-DB hydration.
 *
 * Reads every file the adapter knows about for the given language, and inserts
 * those that DB doesn't already have content for. Insert path uses
 * `ON CONFLICT DO NOTHING` (delegated to the adapter) so a row that's already
 * filled — including by a manual_override — is never overwritten.
 *
 * Hydration NEVER touches the network and NEVER calls AI. (Plan §15.3.)
 */
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
      const inserted = await adapter.hydrateInsert(key, content);
      if (inserted) summary.imported += 1;
      else summary.skipped += 1;
    } catch {
      summary.failed += 1;
    }
  }

  return summary;
}
