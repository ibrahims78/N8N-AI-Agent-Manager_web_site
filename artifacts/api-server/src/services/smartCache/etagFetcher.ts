/**
 * fetchWithEtag — Single HTTP GET with conditional `If-None-Match`.
 *
 * Behaviour:
 *   - 304  ⇒ `{ unchanged: true, status: 304, etag: storedEtag }` (no body read)
 *   - 200  ⇒ `{ unchanged: false, body, sha, etag, status: 200 }`
 *   - any  ⇒ on transport / non-2xx (other than 304), returns `{ unchanged:false,
 *           status, error }` so the caller can decide whether to fall back.
 *
 * Contracts:
 *   - The returned `sha` is sha1 of the *raw* response bytes (Phase plan §15.1).
 *   - Never throws — network errors are returned as `{ status: 0, error }`.
 */
import crypto from "node:crypto";
import type { FetchedContent } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchWithEtagOptions {
  storedEtag?: string | null;
  timeoutMs?: number;
  /** Set false to skip If-None-Match (e.g. force refresh). Default true. */
  useEtag?: boolean;
}

export async function fetchWithEtag(
  url: string,
  opts: FetchWithEtagOptions = {},
): Promise<FetchedContent> {
  const { storedEtag, timeoutMs = DEFAULT_TIMEOUT_MS, useEtag = true } = opts;
  const headers: Record<string, string> = { Accept: "text/plain, */*;q=0.8" };
  if (useEtag && storedEtag) headers["If-None-Match"] = storedEtag;

  let resp: Response;
  try {
    resp = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    return {
      unchanged: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (resp.status === 304) {
    // Server says: "your cached copy is fine". No body to read.
    return {
      unchanged: true,
      status: 304,
      etag: storedEtag ?? undefined,
      sourceUrl: url,
    };
  }
  if (!resp.ok) {
    return { unchanged: false, status: resp.status, error: `HTTP ${resp.status}`, sourceUrl: url };
  }

  const body = await resp.text();
  if (!body || body.length < 10) {
    return { unchanged: false, status: resp.status, error: "empty body", sourceUrl: url };
  }
  const sha = crypto.createHash("sha1").update(body).digest("hex");
  const etag = resp.headers.get("etag") ?? undefined;
  return {
    unchanged: false,
    body,
    sha,
    etag,
    status: resp.status,
    sourceUrl: url,
  };
}

/**
 * Try a list of candidate URLs in order; return the first 200/304 success.
 * If all candidates fail, return the most informative error.
 */
export async function fetchAnyWithEtag(
  urls: readonly string[],
  opts: FetchWithEtagOptions = {},
): Promise<FetchedContent> {
  let lastErr: FetchedContent | null = null;
  for (const url of urls) {
    const r = await fetchWithEtag(url, opts);
    if (r.status === 200 || r.status === 304) return r;
    lastErr = r;
  }
  return lastErr ?? { unchanged: false, status: 0, error: "no candidates" };
}
