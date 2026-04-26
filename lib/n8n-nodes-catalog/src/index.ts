/**
 * n8n-nodes-catalog — public surface
 *
 * Source of truth (post-Phase-5):
 *   `<root>/catalog/<safeFile>.json`            (one node per file)
 *   `<root>/catalog/_meta/manifest.json`        (sha + bytes per node)
 *
 * Backward compatibility:
 *   If the per-file directory is missing (legacy clones, fresh checkouts
 *   before split-catalog runs), we fall back to `<root>/data/catalog.json`.
 *
 * Resolution happens once at module init, synchronously, so all consumers
 * keep their existing `import { catalog } from "@workspace/n8n-nodes-catalog"`
 * with zero changes.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface CatalogExample {
  label: string;
  url: string;
  icon: string;
}

export interface CatalogNode {
  nodeType: string;
  displayName: string;
  fileName: string;
  folder: string;
  isTrigger: boolean;
  nodeVersion: string;
  codexVersion: string;
  categories: string[];
  subcategories: Record<string, string[]>;
  aliases: string[];
  credentialDocsUrl: string | null;
  primaryDocsUrl: string | null;
  examples: CatalogExample[];
  iconUrl: string;
  sourcePath: string;
}

export interface CatalogFile {
  version: number;
  fetchedAt: string;
  source: string;
  branch: string;
  count: number;
  nodes: CatalogNode[];
}

export interface CatalogManifestEntry {
  file: string;
  sha: string;
  bytes: number;
}

export interface CatalogManifest {
  kind: "catalog";
  version: number;
  source: string;
  branch: string;
  fetchedAt: string;
  count: number;
  updatedAt: string;
  entries: Record<string, CatalogManifestEntry>;
}

/**
 * Resolve the package root reliably whether we are:
 *   - running unbundled via tsx (this file's url is the source path)
 *   - running bundled via esbuild (this file is inlined into a dist/*.mjs)
 *
 * Strategy: prefer `require.resolve('@workspace/n8n-nodes-catalog/package.json')`
 * which works in both cases because pnpm symlinks the workspace package into
 * each consumer's node_modules. Fall back to the source-relative path for the
 * standalone-tsx case (e.g. running scripts directly inside the lib).
 */
function resolvePackageRoot(): string {
  // Source-relative attempt first (works when this very file is the running module).
  const here = fileURLToPath(import.meta.url);
  const sourceRoot = resolve(dirname(here), "..");
  if (existsSync(join(sourceRoot, "package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(sourceRoot, "package.json"), "utf8"));
      if (pkg?.name === "@workspace/n8n-nodes-catalog") return sourceRoot;
    } catch {
      // fall through
    }
  }
  // Bundled fallback: ask Node to resolve the package via its workspace symlink.
  try {
    const req = createRequire(import.meta.url);
    const pkgJson = req.resolve("@workspace/n8n-nodes-catalog/package.json");
    return dirname(pkgJson);
  } catch (err) {
    throw new Error(
      `n8n-nodes-catalog: cannot locate package root (sourceRoot=${sourceRoot}): ${(err as Error).message}`,
    );
  }
}

const PKG_ROOT = resolvePackageRoot();
const SPLIT_DIR = join(PKG_ROOT, "catalog");
const SPLIT_META = join(SPLIT_DIR, "_meta", "manifest.json");
const LEGACY_FILE = join(PKG_ROOT, "data", "catalog.json");

function loadFromSplitDir(): CatalogFile {
  const manifest = JSON.parse(readFileSync(SPLIT_META, "utf8")) as CatalogManifest;
  const nodes: CatalogNode[] = [];
  const files = readdirSync(SPLIT_DIR).filter((f) => f.endsWith(".json")).sort();
  for (const f of files) {
    const node = JSON.parse(readFileSync(join(SPLIT_DIR, f), "utf8")) as CatalogNode;
    nodes.push(node);
  }
  if (nodes.length !== manifest.count) {
    throw new Error(
      `n8n-nodes-catalog: split-dir count mismatch (manifest=${manifest.count}, found=${nodes.length})`,
    );
  }
  return {
    version: manifest.version,
    fetchedAt: manifest.fetchedAt,
    source: manifest.source,
    branch: manifest.branch,
    count: manifest.count,
    nodes,
  };
}

function loadFromLegacyFile(): CatalogFile {
  return JSON.parse(readFileSync(LEGACY_FILE, "utf8")) as CatalogFile;
}

function loadCatalog(): { data: CatalogFile; sourceMode: "split" | "legacy" } {
  if (existsSync(SPLIT_META)) {
    return { data: loadFromSplitDir(), sourceMode: "split" };
  }
  if (existsSync(LEGACY_FILE)) {
    return { data: loadFromLegacyFile(), sourceMode: "legacy" };
  }
  throw new Error(
    `n8n-nodes-catalog: no catalog found. Expected ${SPLIT_META} or ${LEGACY_FILE}.`,
  );
}

const loaded = loadCatalog();
export const catalog: CatalogFile = loaded.data;
export const catalogSourceMode: "split" | "legacy" = loaded.sourceMode;

export function getCatalogNodes(): CatalogNode[] {
  return catalog.nodes;
}

export function findCatalogNode(nodeType: string): CatalogNode | undefined {
  const lower = nodeType.toLowerCase();
  return catalog.nodes.find(
    (n) => n.nodeType.toLowerCase() === lower || n.folder.toLowerCase() === lower,
  );
}

export function searchCatalog(query: string): CatalogNode[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return catalog.nodes.filter((n) => {
    if (n.nodeType.toLowerCase().includes(q)) return true;
    if (n.displayName.toLowerCase().includes(q)) return true;
    if (n.folder.toLowerCase().includes(q)) return true;
    if (n.aliases.some((a) => a.toLowerCase().includes(q))) return true;
    if (n.categories.some((c) => c.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function getCategories(): string[] {
  const set = new Set<string>();
  catalog.nodes.forEach((n) => n.categories.forEach((c) => set.add(c)));
  return [...set].sort();
}
