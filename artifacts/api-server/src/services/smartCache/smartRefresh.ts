/**
 * Generic smart-refresh orchestrator.
 *
 * Loops over an arbitrary set of keys for a given kind, asking the adapter
 * for the current "stored" snapshot, doing a conditional HTTP GET (ETag-aware),
 * comparing SHA, and writing iff the upstream actually changed.
 *
 * Modes:
 *   - smart:   default; conditional fetch + SHA compare + write only on change.
 *   - force:   bypass If-None-Match and ALWAYS rewrite even if SHA matches.
 *   - dry-run: predict status without writing anywhere; no AI ever called.
 *
 * Phase 4 — Manifest layer:
 *   - Reads `<rootDir>/_meta/<kind>.manifest.json` once at the start.
 *   - When DB has no etag/sha for a key, the manifest acts as the second-tier
 *     cache so the very first request after a DB wipe still sends
 *     `If-None-Match` and benefits from 304s.
 *   - After successful upserts, the in-memory manifest is updated and written
 *     atomically once at the end (one rename per refresh, regardless of count).
 *
 * The adapter handles all kind-specific details. This file contains zero
 * domain knowledge and is reused for guides, node-docs, catalog, templates.
 */
import { fetchAnyWithEtag } from "./etagFetcher";
import { pAll } from "./concurrency";
import {
  emptyManifest,
  manifestKey,
  readManifest,
  upsertManifestEntry,
  writeManifest,
  type Manifest,
  type ManifestEntry,
} from "./manifest";
import type { ResourceAdapter } from "./adapter";
import type {
  RefreshMode,
  SmartRefreshEntryResult,
  SmartRefreshOptions,
  SmartRefreshSummary,
  StoredMeta,
} from "./types";

export async function smartRefresh<TKey>(
  adapter: ResourceAdapter<TKey>,
  keys: readonly TKey[],
  opts: SmartRefreshOptions = {},
): Promise<SmartRefreshSummary> {
  const mode: RefreshMode = opts.mode ?? "smart";
  const concurrency = opts.concurrency ?? 6;
  const startedAt = Date.now();

  // Phase 4: load the on-disk manifest once. Acts as a fallback ETag/SHA store
  // when DB metadata is missing (e.g. fresh boot after wipe).
  let manifest: Manifest = emptyManifest(adapter.kind);
  try {
    manifest = await readManifest(adapter.rootDir, adapter.kind);
  } catch {
    manifest = emptyManifest(adapter.kind);
  }
  let manifestDirty = false;

  const summary: SmartRefreshSummary = {
    kind: adapter.kind,
    mode,
    total: keys.length,
    added: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    durationMs: 0,
    networkBytes: 0,
    details: [],
  };

  await pAll(
    keys,
    async (key) => {
      const { entry, manifestEntry } = await refreshOne(adapter, key, mode, manifest);
      summary[entry.status] += 1;
      if (entry.bytes) summary.networkBytes += entry.bytes;
      summary.details.push(entry);
      summary.durationMs = Date.now() - startedAt;

      // Phase 4: keep manifest in sync after every successful entry (added /
      // updated / unchanged-with-fresh-etag). dry-run never mutates manifest.
      if (mode !== "dry-run" && manifestEntry) {
        manifest = upsertManifestEntry(manifest, manifestEntry);
        manifestDirty = true;
      }

      if (opts.onProgress) opts.onProgress(entry, summary);
      return entry;
    },
    concurrency,
  );

  // Phase 4: one atomic write at the end. No write if nothing changed (cheap
  // smart-refresh of an unchanged set leaves the manifest's mtime alone).
  if (mode !== "dry-run" && manifestDirty) {
    try {
      await writeManifest(adapter.rootDir, manifest);
    } catch {
      // Manifest is a *cache*; failure to persist must never break the result.
    }
  }

  summary.durationMs = Date.now() - startedAt;
  return summary;
}

interface RefreshOneResult {
  entry: SmartRefreshEntryResult;
  /** Set when we have fresh metadata to add/update in the manifest. */
  manifestEntry: ManifestEntry | null;
}

async function refreshOne<TKey>(
  adapter: ResourceAdapter<TKey>,
  key: TKey,
  mode: RefreshMode,
  manifest: Manifest,
): Promise<RefreshOneResult> {
  const desc = adapter.describe(key);
  const base: SmartRefreshEntryResult = {
    slug: desc.slug,
    language: desc.language,
    status: "failed",
  };

  let stored: StoredMeta;
  try {
    stored = await adapter.getStored(key);
  } catch (err) {
    return { entry: { ...base, error: errMsg(err) }, manifestEntry: null };
  }

  // Manual override always wins. We never refresh dirty rows.
  if (stored.isDirty) {
    return { entry: { ...base, status: "unchanged" }, manifestEntry: null };
  }

  // Phase 4: pull manifest entry as a fallback for ETag/SHA when DB has none.
  const mEntry = manifest.entries[manifestKey(desc.slug, desc.language)];
  const effectiveEtag = stored.etag ?? mEntry?.etag ?? null;
  const effectiveSha = stored.sha ?? mEntry?.sha ?? null;

  // ETag-aware conditional fetch.
  const useEtag = mode !== "force";
  const fetched = await fetchAnyWithEtag(desc.sourceUrls, {
    storedEtag: useEtag ? effectiveEtag : null,
    useEtag,
  });

  if (fetched.status === 304) {
    // 304 ⇒ nothing changed. No write needed.
    const newSha = effectiveSha;
    const newEtag = effectiveEtag;
    return {
      entry: { ...base, status: "unchanged", newSha, newEtag },
      // Don't churn the manifest if nothing on it would actually change.
      manifestEntry: null,
    };
  }
  if (!fetched.body || !fetched.sha) {
    // Upstream failed entirely. Preserve existing data.
    if (stored.hasContent) {
      return {
        entry: { ...base, status: "unchanged", newSha: stored.sha, newEtag: stored.etag },
        manifestEntry: null,
      };
    }
    if (mode !== "dry-run") {
      try {
        await adapter.recordError(key, fetched.error ?? `HTTP ${fetched.status}`);
      } catch {
        /* ignore — we already returning failed */
      }
    }
    return {
      entry: { ...base, status: "failed", error: fetched.error ?? `HTTP ${fetched.status}` },
      manifestEntry: null,
    };
  }

  const upstreamSha = fetched.sha;
  const upstreamEtag = fetched.etag;
  const upstreamUrl = fetched.sourceUrl ?? desc.sourceUrls[0]!;
  const bodyBytes = fetched.body.length;

  // SHA is the source of truth. ETag is a hint.
  const isSameSha = effectiveSha != null && effectiveSha === upstreamSha;

  // smart mode: SHA match ⇒ unchanged regardless of ETag absence.
  // force  mode: always rewrite.
  if (mode === "smart" && isSameSha && stored.hasContent) {
    // Refresh manifest entry only if etag actually changed (some servers
    // rotate ETags even when content is identical).
    const etagChanged = (mEntry?.etag ?? null) !== (upstreamEtag ?? null);
    return {
      entry: {
        ...base,
        status: "unchanged",
        newSha: upstreamSha,
        newEtag: upstreamEtag ?? effectiveEtag,
        bytes: bodyBytes,
      },
      manifestEntry: etagChanged
        ? buildManifestEntry(desc.slug, desc.language, upstreamUrl, upstreamSha, upstreamEtag, bodyBytes)
        : null,
    };
  }

  const isNew = !stored.exists || !stored.hasContent;
  const status = isNew ? "added" : "updated";

  if (mode === "dry-run") {
    return {
      entry: { ...base, status, newSha: upstreamSha, newEtag: upstreamEtag, bytes: bodyBytes },
      manifestEntry: null,
    };
  }

  // Optionally clean / parse before writing.
  const finalBody = adapter.parseContent ? adapter.parseContent(fetched.body) : fetched.body;

  try {
    await adapter.upsert(key, {
      body: finalBody,
      sha: upstreamSha,
      etag: upstreamEtag,
      sourceUrl: upstreamUrl,
    });
  } catch (err) {
    return {
      entry: { ...base, status: "failed", error: errMsg(err), bytes: bodyBytes },
      manifestEntry: null,
    };
  }

  return {
    entry: { ...base, status, newSha: upstreamSha, newEtag: upstreamEtag, bytes: bodyBytes },
    manifestEntry: buildManifestEntry(
      desc.slug,
      desc.language,
      upstreamUrl,
      upstreamSha,
      upstreamEtag,
      bodyBytes,
    ),
  };
}

function buildManifestEntry(
  slug: string,
  language: SmartRefreshEntryResult["language"],
  sourceUrl: string,
  sha: string,
  etag: string | undefined,
  bytes: number,
): ManifestEntry {
  return {
    slug,
    language,
    sourceUrl,
    sha,
    etag,
    fetchedAt: new Date().toISOString(),
    bytes,
  };
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
