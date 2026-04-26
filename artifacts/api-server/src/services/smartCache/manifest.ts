/**
 * Per-kind on-disk manifest: a flat JSON describing every cached entry.
 *
 * Layout: `<rootDir>/_meta/<kind>.manifest.json`
 *   e.g. `lib/n8n-nodes-catalog/docs/_meta/node-docs.manifest.json`
 *
 * Purpose:
 *   - Survival of DB resets: if DB is wiped, we can rebuild knowledge of
 *     "what's on disk" from the manifest alone, no network needed.
 *   - Cheap second-level cache: ETag/SHA stored beside the file mirror so
 *     `If-None-Match` works on the very first request after a DB wipe.
 *
 * All writes are **atomic** (temp file + rename) so a crash mid-write never
 * leaves a corrupted manifest. The temp filename always lives next to the
 * target so `rename(2)` stays inside one filesystem.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { DocLang } from "./types";

export interface ManifestEntry {
  slug: string;
  language?: DocLang;
  sourceUrl?: string;
  sha?: string;
  etag?: string;
  fetchedAt?: string; // ISO
  bytes?: number;
}

export interface Manifest {
  kind: string;
  version: 1;
  updatedAt: string; // ISO
  entries: Record<string, ManifestEntry>; // key = `${slug}:${lang ?? '_'}`
}

export function manifestKey(slug: string, language?: DocLang): string {
  return `${slug}:${language ?? "_"}`;
}

export function manifestPath(rootDir: string, kind: string): string {
  return path.join(rootDir, "_meta", `${kind}.manifest.json`);
}

export async function readManifest(rootDir: string, kind: string): Promise<Manifest> {
  const p = manifestPath(rootDir, kind);
  try {
    const txt = await fs.readFile(p, "utf8");
    const parsed = JSON.parse(txt) as Manifest;
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      return emptyManifest(kind);
    }
    return parsed;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return emptyManifest(kind);
    // Corrupted manifest: prefer empty over crashing the server.
    return emptyManifest(kind);
  }
}

export async function writeManifest(
  rootDir: string,
  manifest: Manifest,
): Promise<void> {
  const p = manifestPath(rootDir, manifest.kind);
  await fs.mkdir(path.dirname(p), { recursive: true });
  const tmp = `${p}.tmp.${process.pid}.${Date.now()}`;
  const payload = JSON.stringify(
    { ...manifest, updatedAt: new Date().toISOString() },
    null,
    2,
  );
  try {
    await fs.writeFile(tmp, payload, "utf8");
    await fs.rename(tmp, p);
  } catch (err) {
    // Best-effort cleanup of the tmp file; swallow errors here.
    try {
      await fs.unlink(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export function emptyManifest(kind: string): Manifest {
  return { kind, version: 1, updatedAt: new Date(0).toISOString(), entries: {} };
}

export function upsertManifestEntry(
  manifest: Manifest,
  entry: ManifestEntry,
): Manifest {
  const k = manifestKey(entry.slug, entry.language);
  return {
    ...manifest,
    entries: { ...manifest.entries, [k]: entry },
  };
}
