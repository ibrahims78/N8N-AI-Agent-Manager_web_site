import { createRequire } from "node:module";
import { dirname, resolve, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Robustly resolve the on-disk root of the `@workspace/n8n-nodes-catalog`
 * package — works in dev (`tsx`, source files) and in production
 * (`esbuild`-bundled `dist/index.mjs`).
 *
 * Why this exists:
 *   - Source files live at `<root>/artifacts/api-server/src/services/...`
 *     so `import.meta.url` based "go up N levels" works in dev.
 *   - After bundling, the running module is `<root>/artifacts/api-server/dist/
 *     index.mjs`, so the same "go up N levels" lands at the wrong directory
 *     (outside the repo). All disk-hydration silently reads zero files.
 *
 * Strategy: ask Node's resolver to find the workspace package via the pnpm
 * symlink in `node_modules`. Falls back to a source-relative walk for the
 * unbundled case where nothing is yet symlinked.
 */
function resolveCatalogRoot(): string {
  try {
    const req = createRequire(import.meta.url);
    const pkgJson = req.resolve("@workspace/n8n-nodes-catalog/package.json");
    return dirname(pkgJson);
  } catch {
    // Fall through to source-relative walk
  }

  // Walk upwards from this file until we find lib/n8n-nodes-catalog/package.json.
  let cur = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    const candidate = join(cur, "lib", "n8n-nodes-catalog", "package.json");
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, "utf8"));
        if (pkg?.name === "@workspace/n8n-nodes-catalog") {
          return dirname(candidate);
        }
      } catch {
        // ignore and keep walking
      }
    }
    const parent = resolve(cur, "..");
    if (parent === cur) break;
    cur = parent;
  }

  throw new Error(
    "catalogPaths: cannot locate @workspace/n8n-nodes-catalog package root",
  );
}

export const CATALOG_PKG_ROOT = resolveCatalogRoot();
export const CATALOG_DOCS_ROOT = join(CATALOG_PKG_ROOT, "docs");
export const CATALOG_GUIDES_ROOT = join(CATALOG_PKG_ROOT, "guides");
