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
 * The adapter handles all kind-specific details. This file contains zero
 * domain knowledge and is reused for guides, node-docs, catalog, templates.
 */
import { fetchAnyWithEtag } from "./etagFetcher";
import { pAll } from "./concurrency";
import type { ResourceAdapter } from "./adapter";
import type {
  RefreshMode,
  SmartRefreshEntryResult,
  SmartRefreshOptions,
  SmartRefreshSummary,
} from "./types";

export async function smartRefresh<TKey>(
  adapter: ResourceAdapter<TKey>,
  keys: readonly TKey[],
  opts: SmartRefreshOptions = {},
): Promise<SmartRefreshSummary> {
  const mode: RefreshMode = opts.mode ?? "smart";
  const concurrency = opts.concurrency ?? 6;
  const startedAt = Date.now();

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
      const entry = await refreshOne(adapter, key, mode);
      // Update aggregates
      summary[entry.status] += 1;
      if (entry.bytes) summary.networkBytes += entry.bytes;
      summary.details.push(entry);
      summary.durationMs = Date.now() - startedAt;
      if (opts.onProgress) opts.onProgress(entry, summary);
      return entry;
    },
    concurrency,
  );

  summary.durationMs = Date.now() - startedAt;
  return summary;
}

async function refreshOne<TKey>(
  adapter: ResourceAdapter<TKey>,
  key: TKey,
  mode: RefreshMode,
): Promise<SmartRefreshEntryResult> {
  const desc = adapter.describe(key);
  const base: SmartRefreshEntryResult = {
    slug: desc.slug,
    language: desc.language,
    status: "failed",
  };

  let stored: Awaited<ReturnType<typeof adapter.getStored>>;
  try {
    stored = await adapter.getStored(key);
  } catch (err) {
    return { ...base, error: errMsg(err) };
  }

  // Manual override always wins. We never refresh dirty rows.
  if (stored.isDirty) {
    return { ...base, status: "unchanged" };
  }

  // ETag-aware conditional fetch.
  const useEtag = mode !== "force";
  const fetched = await fetchAnyWithEtag(desc.sourceUrls, {
    storedEtag: useEtag ? stored.etag : null,
    useEtag,
  });

  if (fetched.status === 304) {
    // 304 ⇒ nothing changed. No write needed.
    return { ...base, status: "unchanged", newSha: stored.sha, newEtag: stored.etag };
  }
  if (!fetched.body || !fetched.sha) {
    // Upstream failed entirely. Preserve existing data.
    if (stored.hasContent) {
      return { ...base, status: "unchanged", newSha: stored.sha, newEtag: stored.etag };
    }
    if (mode !== "dry-run") {
      try {
        await adapter.recordError(key, fetched.error ?? `HTTP ${fetched.status}`);
      } catch {
        /* ignore — we already returning failed */
      }
    }
    return { ...base, status: "failed", error: fetched.error ?? `HTTP ${fetched.status}` };
  }

  const upstreamSha = fetched.sha;
  const upstreamEtag = fetched.etag;
  const upstreamUrl = fetched.sourceUrl ?? desc.sourceUrls[0]!;
  const bodyBytes = fetched.body.length;

  // SHA is the source of truth. ETag is a hint.
  const isSameSha = stored.sha != null && stored.sha === upstreamSha;

  // smart mode: SHA match ⇒ unchanged regardless of ETag absence.
  // force  mode: always rewrite.
  if (mode === "smart" && isSameSha && stored.hasContent) {
    // Refresh ETag in DB only if it changed (cheap UPDATE), but treat as unchanged.
    return {
      ...base,
      status: "unchanged",
      newSha: upstreamSha,
      newEtag: upstreamEtag ?? stored.etag,
      bytes: bodyBytes,
    };
  }

  const isNew = !stored.exists || !stored.hasContent;
  const status = isNew ? "added" : "updated";

  if (mode === "dry-run") {
    return { ...base, status, newSha: upstreamSha, newEtag: upstreamEtag, bytes: bodyBytes };
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
    return { ...base, status: "failed", error: errMsg(err), bytes: bodyBytes };
  }

  return { ...base, status, newSha: upstreamSha, newEtag: upstreamEtag, bytes: bodyBytes };
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
