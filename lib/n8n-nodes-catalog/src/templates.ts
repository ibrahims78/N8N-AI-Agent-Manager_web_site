/**
 * @workspace/n8n-nodes-catalog/templates
 *
 * Loads system templates from `<pkg-root>/templates/<slug>.json`.
 * Mirrors the same package-root resolution strategy as the catalog loader
 * (works both for `tsx` and bundled-via-esbuild consumers).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface SystemTemplate {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  nodesCount: number;
  avgRating: number;
  workflowJson: Record<string, unknown>;
}

export interface TemplatesManifestEntry {
  file: string;
  sha: string;
  bytes: number;
  name: string;
  nameEn: string;
  category: string;
}

export interface TemplatesManifest {
  kind: "templates";
  version: number;
  count: number;
  updatedAt: string;
  entries: Record<string, TemplatesManifestEntry>;
}

function resolvePackageRoot(): string {
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
  const req = createRequire(import.meta.url);
  const pkgJson = req.resolve("@workspace/n8n-nodes-catalog/package.json");
  return dirname(pkgJson);
}

const PKG_ROOT = resolvePackageRoot();
const TEMPLATES_DIR = join(PKG_ROOT, "templates");
const TEMPLATES_META = join(TEMPLATES_DIR, "_meta", "manifest.json");

export function loadSystemTemplates(): SystemTemplate[] {
  if (!existsSync(TEMPLATES_META)) {
    throw new Error(
      `n8n-nodes-catalog: templates manifest missing at ${TEMPLATES_META}. ` +
        `Run 'npx tsx scripts/extract-templates.mjs' from the workspace root to generate it.`,
    );
  }
  const manifest = JSON.parse(readFileSync(TEMPLATES_META, "utf8")) as TemplatesManifest;
  const entries = Object.values(manifest.entries);
  const out: SystemTemplate[] = [];
  for (const e of entries) {
    const path = join(TEMPLATES_DIR, e.file);
    const t = JSON.parse(readFileSync(path, "utf8")) as SystemTemplate;
    out.push(t);
  }
  if (out.length !== manifest.count) {
    throw new Error(
      `n8n-nodes-catalog: templates count mismatch (manifest=${manifest.count}, files=${out.length})`,
    );
  }
  // Stable order by slug
  out.sort((a, b) => a.slug.localeCompare(b.slug));
  return out;
}

export function getTemplatesManifest(): TemplatesManifest {
  return JSON.parse(readFileSync(TEMPLATES_META, "utf8")) as TemplatesManifest;
}
