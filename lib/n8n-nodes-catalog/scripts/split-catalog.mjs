#!/usr/bin/env node
/**
 * split-catalog.mjs
 *
 * One-shot migration: reads the legacy aggregated `data/catalog.json`
 * and writes one JSON file per node into `catalog/<safeFile>.json`,
 * plus an atomic `catalog/_meta/manifest.json` listing every entry
 * with sha1, byte size and source nodeType.
 *
 * Re-runnable & idempotent:
 *  - existing files are overwritten only when their sha changes
 *  - obsolete files (no longer in the catalog) are removed
 *  - manifest is rewritten atomically (temp + rename)
 *
 * Filename convention (safe across all filesystems):
 *  - "n8n-nodes-base.actionNetwork"        -> "n8n-nodes-base.actionNetwork.json"
 *  - "@n8n/n8n-nodes-langchain.agent"      -> "_at_n8n__n8n-nodes-langchain.agent.json"
 *  (matches the convention already used in `docs/_meta/`).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SRC = join(ROOT, "data", "catalog.json");
const DEST_DIR = join(ROOT, "catalog");
const META_DIR = join(DEST_DIR, "_meta");
const MANIFEST = join(META_DIR, "manifest.json");

export function safeFile(nodeType) {
  return nodeType.replace(/^@/, "_at_").replace(/\//g, "__");
}

function sha1(buf) {
  return createHash("sha1").update(buf).digest("hex");
}

function atomicWrite(path, contents) {
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}`;
  writeFileSync(tmp, contents);
  renameSync(tmp, path);
}

function main() {
  if (!existsSync(SRC)) {
    console.error(`source not found: ${SRC}`);
    process.exit(1);
  }
  const raw = readFileSync(SRC);
  const catalog = JSON.parse(raw.toString("utf8"));
  const nodes = catalog.nodes ?? [];
  if (nodes.length === 0) {
    console.error("catalog has 0 nodes; aborting to avoid data loss");
    process.exit(1);
  }

  mkdirSync(DEST_DIR, { recursive: true });
  mkdirSync(META_DIR, { recursive: true });

  const wantedFiles = new Set();
  const entries = {};
  let written = 0;
  let unchanged = 0;
  let obsolete = 0;

  for (const node of nodes) {
    const fileName = `${safeFile(node.nodeType)}.json`;
    wantedFiles.add(fileName);
    const target = join(DEST_DIR, fileName);
    const json = JSON.stringify(node, null, 2) + "\n";
    const buf = Buffer.from(json, "utf8");
    const sha = sha1(buf);

    if (existsSync(target)) {
      const cur = readFileSync(target);
      if (sha1(cur) === sha) {
        unchanged++;
        entries[node.nodeType] = { file: fileName, sha, bytes: buf.length };
        continue;
      }
    }
    atomicWrite(target, buf);
    written++;
    entries[node.nodeType] = { file: fileName, sha, bytes: buf.length };
  }

  // remove obsolete files (safe: we only enter `catalog/` and `_meta` is excluded)
  for (const f of readdirSync(DEST_DIR)) {
    if (f === "_meta") continue;
    if (!wantedFiles.has(f)) {
      unlinkSync(join(DEST_DIR, f));
      obsolete++;
    }
  }

  const manifest = {
    kind: "catalog",
    version: 1,
    source: catalog.source,
    branch: catalog.branch,
    fetchedAt: catalog.fetchedAt,
    count: nodes.length,
    updatedAt: new Date().toISOString(),
    entries,
  };
  atomicWrite(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  console.log(JSON.stringify({ total: nodes.length, written, unchanged, obsolete, manifest: MANIFEST }, null, 2));
}

main();
