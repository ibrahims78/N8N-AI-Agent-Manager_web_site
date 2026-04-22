/**
 * nodeDocsPipeline.service.ts
 *
 * The "professional" content pipeline used by `nodeDocs.service.ts` to enrich
 * raw markdown fetched from n8n-io/n8n-docs before it is cached and shown in
 * the UI. Responsibilities:
 *
 *  - Cache the n8n-docs git tree once per process (one Trees API call vs
 *    hundreds of contents-API calls). Persisted to disk so we survive
 *    restarts even when GitHub is rate-limited.
 *  - Resolve sibling .md files (operations.md, credentials.md,
 *    common-issues.md, ...) by walking the tree — no per-doc API calls.
 *  - Resolve `--8<-- "path/to/snippet.md"` MkDocs includes against the tree
 *    so we never silently drop content.
 *  - Parse YAML frontmatter and inject a human-readable header (title +
 *    description) at the top of the doc.
 *  - Replace MkDocs widget shortcodes (`[[ templatesWidget(...) ]]`,
 *    `[[ schemaUiWidget(...) ]]`, `{{ ... }}`) with friendly links/notes
 *    instead of erasing the content silently.
 *  - Discover every image reference (markdown + html + html-srcset),
 *    download it locally to `lib/n8n-nodes-catalog/docs/_assets/<node>/`
 *    and rewrite the markdown URL to the API-served path so the browser
 *    can render it offline.
 *  - Rewrite relative `*.md` links so they resolve against docs.n8n.io
 *    (otherwise react-markdown sends them to the wrong origin).
 *  - Persist a per-node manifest under
 *    `lib/n8n-nodes-catalog/docs/_meta/<node>.json` describing the source
 *    URL, fetched siblings, and saved assets — useful for diagnostics and
 *    incremental re-syncs.
 *
 * The pipeline is idempotent and safe to run repeatedly. Folder layout:
 *
 *   lib/n8n-nodes-catalog/docs/
 *     en/<node>.md
 *     ar/<node>.md
 *     _assets/<node>/<image-files>
 *     _meta/<node>.json
 *     _meta/_repo-tree.json   ← cached n8n-docs git tree
 */
import fs from "fs/promises";
import path from "path";
import { logger } from "../lib/logger";

const DOCS_REPO_RAW = "https://raw.githubusercontent.com/n8n-io/n8n-docs/main";
const DOCS_REPO_TREE_API =
  "https://api.github.com/repos/n8n-io/n8n-docs/git/trees/main?recursive=1";
const DOCS_SITE_BASE = "https://docs.n8n.io";

const LOCAL_DOCS_DIR = path.resolve(
  process.cwd(),
  "../../lib/n8n-nodes-catalog/docs"
);
const ASSETS_DIR = path.join(LOCAL_DOCS_DIR, "_assets");
const META_DIR = path.join(LOCAL_DOCS_DIR, "_meta");
const TREE_CACHE_FILE = path.join(META_DIR, "_repo-tree.json");

/** Public URL prefix the browser will use to fetch a saved asset. */
const ASSET_URL_PREFIX = "/api/catalog/docs/assets";

/* ───────────────────────── Filename utilities ───────────────────────── */

/** Convert a node type string (`@n8n/n8n-nodes-langchain.agent`) to a safe
 *  directory/filename component used across en/, ar/, _assets/, _meta/. */
export function safeNodeKey(nodeType: string): string {
  return nodeType.replace(/\//g, "__").replace(/@/g, "_at_");
}

/** Sanitise an asset filename so it cannot escape its directory. */
function safeAssetName(rawPath: string): string {
  const base = path.posix.basename(rawPath.split("?")[0].split("#")[0]);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

/** Resolve & validate an absolute path lives inside `parent` — defends
 *  against any traversal in a manipulated nodeType / filename. */
export function safeJoin(parent: string, ...segments: string[]): string | null {
  const joined = path.resolve(parent, ...segments);
  const rel = path.relative(parent, joined);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return joined;
}

/* ───────────────────────── GitHub repo tree cache ───────────────────────── */

interface RepoTreeEntry {
  path: string;
  type: "blob" | "tree" | string;
}

let treeMemoryCache: { fetchedAt: number; paths: Set<string> } | null = null;
let treeFetchInFlight: Promise<Set<string>> | null = null;
const TREE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Read auth header for GitHub API (raises 60/h → 5000/h with a token). */
function githubApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "n8n-ai-agent-manager",
  };
  const token = process.env["GITHUB_TOKEN"];
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function loadTreeFromDisk(): Promise<Set<string> | null> {
  try {
    const raw = await fs.readFile(TREE_CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { paths: string[] };
    if (Array.isArray(parsed.paths) && parsed.paths.length > 0) {
      return new Set(parsed.paths);
    }
  } catch {
    /* not present — fine */
  }
  return null;
}

async function saveTreeToDisk(paths: Set<string>): Promise<void> {
  try {
    await fs.mkdir(META_DIR, { recursive: true });
    await fs.writeFile(
      TREE_CACHE_FILE,
      JSON.stringify(
        { fetchedAt: new Date().toISOString(), paths: Array.from(paths) },
        null,
        2
      ),
      "utf-8"
    );
  } catch (err) {
    logger.debug({ err }, "saveTreeToDisk failed (non-fatal)");
  }
}

/**
 * Returns a Set of every blob path in the n8n-docs repo (e.g.
 * `docs/integrations/builtin/app-nodes/n8n-nodes-base.slack/index.md`).
 *
 * Behaviour:
 *  - In-memory cache for the current process (TTL 6h).
 *  - On-disk cache survives restarts; used as fallback when GitHub fails.
 *  - Single in-flight request — concurrent callers share the same promise.
 */
export async function getRepoTree(): Promise<Set<string>> {
  if (
    treeMemoryCache &&
    Date.now() - treeMemoryCache.fetchedAt < TREE_TTL_MS
  ) {
    return treeMemoryCache.paths;
  }
  if (treeFetchInFlight) return treeFetchInFlight;

  treeFetchInFlight = (async () => {
    try {
      const r = await fetch(DOCS_REPO_TREE_API, {
        headers: githubApiHeaders(),
        signal: AbortSignal.timeout(20_000),
      });
      if (r.ok) {
        const body = (await r.json()) as { tree?: RepoTreeEntry[] };
        const paths = new Set(
          (body.tree ?? [])
            .filter((e) => e.type === "blob" && typeof e.path === "string")
            .map((e) => e.path)
        );
        if (paths.size > 0) {
          treeMemoryCache = { fetchedAt: Date.now(), paths };
          await saveTreeToDisk(paths);
          logger.info({ count: paths.size }, "Cached n8n-docs repo tree");
          return paths;
        }
      } else {
        logger.warn(
          { status: r.status, hasToken: !!process.env["GITHUB_TOKEN"] },
          "GitHub trees API failed — falling back to on-disk cache"
        );
      }
    } catch (err) {
      logger.warn({ err }, "GitHub trees API error — falling back to on-disk cache");
    }
    const disk = await loadTreeFromDisk();
    if (disk) {
      treeMemoryCache = { fetchedAt: Date.now(), paths: disk };
      return disk;
    }
    // Last resort: empty set so callers degrade gracefully (they will fall
    // back to the legacy COMMON_SIBLING_FILENAMES probing in nodeDocs.service).
    return new Set<string>();
  })().finally(() => {
    treeFetchInFlight = null;
  });

  return treeFetchInFlight;
}

/** Force a fresh refetch of the repo tree (admin action). */
export async function refreshRepoTree(): Promise<number> {
  treeMemoryCache = null;
  const paths = await getRepoTree();
  return paths.size;
}

/* ───────────────────────── Sibling discovery ───────────────────────── */

/**
 * Given an indexUrl like
 *   https://raw.githubusercontent.com/.../app-nodes/n8n-nodes-base.slack/index.md
 * return the list of sibling .md filenames in that directory using the
 * cached repo tree (authoritative — no probing needed).
 */
export async function discoverSiblings(indexUrl: string): Promise<string[]> {
  if (!indexUrl.endsWith("/index.md")) return [];
  const repoPath = indexUrl.replace(`${DOCS_REPO_RAW}/`, "");
  const dir = repoPath.slice(0, -"index.md".length); // trailing slash
  const tree = await getRepoTree();
  if (tree.size === 0) return [];
  const names: string[] = [];
  for (const p of tree) {
    if (
      p.startsWith(dir) &&
      p.endsWith(".md") &&
      !p.slice(dir.length).includes("/") &&
      p !== `${dir}index.md`
    ) {
      names.push(p.slice(dir.length));
    }
  }
  // Stable, predictable order — index.md content first (already prepended
  // by caller), then operations, credentials, parameters, the rest alphabetical.
  const priority = [
    "operations.md",
    "credentials.md",
    "node-parameters.md",
    "supported-operations.md",
    "data-structure.md",
    "templates-and-examples.md",
    "examples.md",
    "user-templates.md",
    "common-issues.md",
    "how-it-works.md",
  ];
  names.sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
  return names;
}

/* ───────────────────────── Snippet (--8<--) resolver ───────────────────────── */

/**
 * Resolve a `--8<-- "snippets/foo.md"` include path against the cached repo
 * tree. n8n-docs uses MkDocs `base_path = ['./', 'docs']`, so the snippet
 * may live at the repo root or under `docs/`.
 */
export async function resolveSnippetPath(snippetPath: string): Promise<string | null> {
  const tree = await getRepoTree();
  if (tree.size === 0) {
    // Fallback: just guess the most common locations. Caller will fetch
    // them and skip on 404.
    return snippetPath;
  }
  const candidates = [
    snippetPath,
    `docs/${snippetPath}`,
    snippetPath.replace(/^_snippets\//, "snippets/"),
    `docs/${snippetPath.replace(/^_snippets\//, "snippets/")}`,
  ];
  for (const c of candidates) {
    if (tree.has(c)) return c;
  }
  return null;
}

/* ───────────────────────── Frontmatter ───────────────────────── */

export interface Frontmatter {
  title?: string;
  description?: string;
  contentType?: string;
  raw?: Record<string, string>;
}

/**
 * Extract YAML frontmatter from the top of a markdown doc. Returns the
 * parsed metadata + the body with frontmatter removed.
 *
 * We intentionally do not pull a YAML library — n8n-docs frontmatter is
 * always simple `key: value` pairs (occasionally with quoted values). A
 * purpose-built parser keeps the dependency surface minimal.
 */
export function extractFrontmatter(markdown: string): {
  body: string;
  frontmatter: Frontmatter;
} {
  const m = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { body: markdown, frontmatter: {} };
  const body = markdown.slice(m[0].length);
  const fm: Frontmatter = { raw: {} };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    fm.raw![key] = val;
    if (key === "title") fm.title = val;
    else if (key === "description") fm.description = val;
    else if (key === "contentType") fm.contentType = val;
  }
  return { body, frontmatter: fm };
}

/** Build a generated "header" block from frontmatter so the title/desc
 *  still appear in the rendered doc. Callers decide whether to inject. */
export function frontmatterToHeader(fm: Frontmatter): string {
  if (!fm.title && !fm.description) return "";
  const parts: string[] = [];
  if (fm.title) parts.push(`# ${fm.title}`);
  if (fm.description) parts.push(`> ${fm.description}`);
  return parts.join("\n\n") + "\n\n";
}

/* ───────────────────────── MkDocs admonitions & widgets ───────────────────────── */

/** /// note | Title \n body \n ///   →   > **Title**\n> body */
export function convertAdmonitions(markdown: string): string {
  let out = markdown.replace(
    /\/\/\/\s*([a-zA-Z]+)\s*\|\s*([^\n]*?)\s*\/\/\//g,
    (_m, type: string, rest: string) => {
      const title = type.charAt(0).toUpperCase() + type.slice(1);
      return `> **${title}:** ${rest.trim()}`;
    }
  );
  out = out.replace(
    /\/\/\/\s*([a-zA-Z]+)(?:\s*\|\s*([^\n]*))?\n([\s\S]*?)\n\/\/\//g,
    (_m, type: string, title: string | undefined, body: string) => {
      const heading = (title?.trim() || type).trim();
      const headingTitle = heading.charAt(0).toUpperCase() + heading.slice(1);
      const quoted = body
        .trim()
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n");
      return `> **${headingTitle}**\n>\n${quoted}`;
    }
  );
  return out;
}

/**
 * Replace MkDocs widget shortcodes with a friendly link to the live docs
 * site instead of silently deleting them. The user still gets pointed at
 * the rich content (templates, schemas, ...) without the broken render.
 */
export function rewriteMkDocsWidgets(markdown: string, sourceDocsUrl: string | null): string {
  let out = markdown;

  // [[ templatesWidget(node, "Slack") ]]
  out = out.replace(
    /\[\[\s*templatesWidget\(\s*([^,)]+)\s*(?:,\s*["']([^"']+)["'])?\s*\)\s*\]\]/g,
    (_m, _arg: string, label: string | undefined) => {
      const name = label?.trim() || "this node";
      const link = sourceDocsUrl ?? "https://n8n.io/workflows/";
      return `\n> **🔗 Templates & examples:** browse ready-made workflows for ${name} at [${link}](${link})\n`;
    }
  );

  // [[ schemaUiWidget(...) ]] or any other named widget
  out = out.replace(
    /\[\[\s*([a-zA-Z]+)Widget\([^\]]*\)\s*\]\]/g,
    (_m, name: string) => `\n> _(${name} widget — view live at [docs.n8n.io](${sourceDocsUrl ?? DOCS_SITE_BASE}))_\n`
  );

  // Any other [[ ... ]] shortcode left behind
  out = out.replace(/\[\[[^\]]*\]\]/g, "");

  // Stray Jinja2 `{{ var }}` expressions
  out = out.replace(/\{\{[^}]*\}\}/g, "");

  // Collapse runs of blank lines
  out = out.replace(/\n{3,}/g, "\n\n");

  return out;
}

/* ───────────────────────── Image discovery & download ───────────────────────── */

interface ImageRef {
  /** Original literal URL exactly as it appears in the markdown. */
  raw: string;
  /** Absolute https://... URL we will fetch. */
  absoluteUrl: string;
}

/** Resolve a possibly-relative URL against the source markdown URL.
 *
 * n8n-docs writes asset paths in three forms:
 *   - `https://…`              — absolute, used as-is
 *   - `../../_images/foo.png`  — relative, resolved against source URL
 *   - `/_images/foo.png`       — absolute *inside the docs site*, which
 *                                  maps to `docs/_images/foo.png` in the
 *                                  GitHub repo (NOT the host root).
 */
function resolveAgainstSource(
  rawUrl: string,
  sourceMdUrl: string
): string | null {
  try {
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    if (rawUrl.startsWith("//")) return `https:${rawUrl}`;
    if (rawUrl.startsWith("data:")) return null;
    if (rawUrl.startsWith("mailto:")) return null;

    // Docs-site-absolute path → repo `docs/<path>` when source is n8n-docs raw.
    if (
      rawUrl.startsWith("/") &&
      sourceMdUrl.startsWith(`${DOCS_REPO_RAW}/docs/`)
    ) {
      return `${DOCS_REPO_RAW}/docs${rawUrl}`;
    }

    // Relative path — resolve against the source .md URL.
    const u = new URL(rawUrl, sourceMdUrl);
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Walk the markdown and return every image reference.
 * Patterns covered:
 *   ![alt](url)         — markdown image
 *   ![alt](url "title") — markdown image with title
 *   <img src="url" />   — html image
 */
export function findImages(markdown: string, sourceMdUrl: string): ImageRef[] {
  const refs: ImageRef[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    if (!raw || seen.has(raw)) return;
    const abs = resolveAgainstSource(raw, sourceMdUrl);
    if (!abs) return;
    seen.add(raw);
    refs.push({ raw, absoluteUrl: abs });
  };

  // Markdown: ![alt](url) and ![alt](url "title")
  const mdRe = /!\[[^\]]*?\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const m of markdown.matchAll(mdRe)) push(m[1]);

  // HTML: <img src="..."> / <img src='...'>
  const htmlRe = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  for (const m of markdown.matchAll(htmlRe)) push(m[1] ?? m[2] ?? "");

  return refs;
}

/** Save one image to disk under _assets/<safeNode>/. Returns saved filename
 *  on success or null on failure. */
async function downloadImage(
  absUrl: string,
  destDir: string
): Promise<string | null> {
  try {
    const r = await fetch(absUrl, { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) {
      logger.debug({ absUrl, status: r.status }, "downloadImage non-ok");
      return null;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.byteLength === 0) return null;

    let name = safeAssetName(absUrl);
    // Ensure we keep a sensible extension when the URL had none.
    if (!/\.[a-zA-Z0-9]{2,5}$/.test(name)) {
      const ct = r.headers.get("content-type") || "";
      const ext = ct.includes("png")
        ? ".png"
        : ct.includes("jpeg") || ct.includes("jpg")
        ? ".jpg"
        : ct.includes("gif")
        ? ".gif"
        : ct.includes("svg")
        ? ".svg"
        : ct.includes("webp")
        ? ".webp"
        : "";
      if (ext) name += ext;
    }

    const target = safeJoin(destDir, name);
    if (!target) return null;
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buf);
    return path.basename(target);
  } catch (err) {
    logger.debug({ err, absUrl }, "downloadImage failed");
    return null;
  }
}

/**
 * Download every image referenced by the markdown into
 * `lib/n8n-nodes-catalog/docs/_assets/<safeNode>/` and return a map from
 * the original `raw` URL → the public API path the browser should request.
 */
export async function downloadImagesForNode(
  nodeType: string,
  refs: ImageRef[]
): Promise<{ map: Map<string, string>; saved: string[] }> {
  if (refs.length === 0) return { map: new Map(), saved: [] };
  const safe = safeNodeKey(nodeType);
  const destDirMaybe = safeJoin(ASSETS_DIR, safe);
  if (!destDirMaybe) return { map: new Map(), saved: [] };
  const destDir: string = destDirMaybe;

  await fs.mkdir(destDir, { recursive: true });
  const map = new Map<string, string>();
  const saved: string[] = [];

  // Bounded concurrency to be polite to GitHub.
  const concurrency = 4;
  let i = 0;
  async function worker() {
    while (i < refs.length) {
      const idx = i++;
      const ref = refs[idx];
      const filename = await downloadImage(ref.absoluteUrl, destDir);
      if (filename) {
        const publicUrl = `${ASSET_URL_PREFIX}/${encodeURIComponent(safe)}/${encodeURIComponent(filename)}`;
        map.set(ref.raw, publicUrl);
        saved.push(filename);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return { map, saved };
}

/** Replace each `raw` URL in the markdown with the value from `map`. */
export function rewriteImageUrls(markdown: string, map: Map<string, string>): string {
  if (map.size === 0) return markdown;
  let out = markdown;
  for (const [raw, replaced] of map) {
    // Replace the literal occurrence (escaped for regex). Affects both md
    // and html forms because the literal URL string appears in both.
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "g"), replaced);
  }
  return out;
}

/* ───────────────────────── Markdown link rewriting ───────────────────────── */

/**
 * Convert relative `*.md` links inside the markdown to absolute
 * docs.n8n.io URLs so they remain navigable from the embedded viewer.
 * Already-absolute http(s) links are left untouched.
 */
export function rewriteRelativeMdLinks(
  markdown: string,
  sourceMdUrl: string
): string {
  return markdown.replace(
    /(\]\()(\s*)([^)\s]+?\.md)(\s*[)#])/g,
    (_full, prefix: string, ws: string, target: string, suffix: string) => {
      try {
        if (/^https?:\/\//i.test(target)) return _full;
        const u = new URL(target, sourceMdUrl);
        if (!u.hostname.includes("githubusercontent")) return _full;
        // Convert the raw GitHub path back into a docs.n8n.io URL.
        // /n8n-io/n8n-docs/main/docs/integrations/.../node.md
        // → https://docs.n8n.io/integrations/.../node/
        const pathParts = u.pathname.split("/").filter(Boolean);
        // Strip [n8n-io, n8n-docs, main, docs]
        const after = pathParts.slice(4);
        if (after.length === 0) return _full;
        let last = after[after.length - 1];
        if (last === "index.md") {
          after.pop();
        } else if (last.endsWith(".md")) {
          after[after.length - 1] = last.slice(0, -3);
        }
        const docsUrl = `${DOCS_SITE_BASE}/${after.join("/")}/`;
        return `${prefix}${ws}${docsUrl}${suffix}`;
      } catch {
        return _full;
      }
    }
  );
}

/* ───────────────────────── Manifest / meta storage ───────────────────────── */

export interface NodeDocMeta {
  nodeType: string;
  sourceUrl: string;
  fetchedAt: string;
  frontmatter: Frontmatter;
  siblings: string[];
  assets: string[];
}

export async function saveNodeMeta(meta: NodeDocMeta): Promise<void> {
  try {
    await fs.mkdir(META_DIR, { recursive: true });
    const file = safeJoin(META_DIR, `${safeNodeKey(meta.nodeType)}.json`);
    if (!file) return;
    await fs.writeFile(file, JSON.stringify(meta, null, 2), "utf-8");
  } catch (err) {
    logger.debug({ err, nodeType: meta.nodeType }, "saveNodeMeta failed");
  }
}

export async function readNodeMeta(nodeType: string): Promise<NodeDocMeta | null> {
  try {
    const file = safeJoin(META_DIR, `${safeNodeKey(nodeType)}.json`);
    if (!file) return null;
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as NodeDocMeta;
  } catch {
    return null;
  }
}

/* ───────────────────────── Asset serving (used by routes) ───────────────────────── */

/** Resolve an asset request to an absolute path on disk, or null if the
 *  request escapes the assets root or the file does not exist. */
export async function resolveAssetPath(
  safeNode: string,
  filename: string
): Promise<string | null> {
  const decodedNode = decodeURIComponent(safeNode);
  const decodedFile = decodeURIComponent(filename);
  // Defence in depth — never let `..` through.
  if (decodedNode.includes("..") || decodedFile.includes("..")) return null;
  const dir = safeJoin(ASSETS_DIR, decodedNode);
  if (!dir) return null;
  const file = safeJoin(dir, decodedFile);
  if (!file) return null;
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) return null;
  } catch {
    return null;
  }
  return file;
}

/** Asset stats for the admin UI. */
export async function getAssetsStats(): Promise<{
  nodes: number;
  files: number;
  totalBytes: number;
}> {
  let nodes = 0;
  let files = 0;
  let totalBytes = 0;
  try {
    const dirs = await fs.readdir(ASSETS_DIR);
    for (const d of dirs) {
      const sub = safeJoin(ASSETS_DIR, d);
      if (!sub) continue;
      try {
        const stat = await fs.stat(sub);
        if (!stat.isDirectory()) continue;
        nodes++;
        const entries = await fs.readdir(sub);
        for (const e of entries) {
          const f = safeJoin(sub, e);
          if (!f) continue;
          try {
            const st = await fs.stat(f);
            if (st.isFile()) {
              files++;
              totalBytes += st.size;
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
  return { nodes, files, totalBytes };
}

export const _paths = {
  LOCAL_DOCS_DIR,
  ASSETS_DIR,
  META_DIR,
  ASSET_URL_PREFIX,
  DOCS_REPO_RAW,
  DOCS_SITE_BASE,
};
