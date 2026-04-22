#!/usr/bin/env node
/**
 * Fetches the latest n8n node catalog from the n8n GitHub repository
 * and writes it to data/catalog.json.
 *
 * Usage: node scripts/fetch.mjs [owner/repo]
 * Default source: ibrahims78/n8n
 */
import https from "node:https";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const REPO = process.argv[2] || "ibrahims78/n8n";
const BRANCH = process.env.N8N_CATALOG_BRANCH || "master";

function getJson(host, p) {
  return new Promise((resolve, reject) => {
    https
      .get({ hostname: host, path: p, headers: { "User-Agent": "n8n-catalog-fetcher" } }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            reject(new Error(`Bad JSON from ${host}${p}: ${e.message}`));
          }
        });
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

function getRaw(p) {
  return new Promise((resolve, reject) => {
    https
      .get(
        { hostname: "raw.githubusercontent.com", path: p, headers: { "User-Agent": "n8n-catalog-fetcher" } },
        (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => resolve({ status: res.statusCode, body }));
          res.on("error", reject);
        }
      )
      .on("error", reject);
  });
}

async function main() {
  console.log(`📥 Fetching n8n node catalog from ${REPO}@${BRANCH}...`);

  const branch = await getJson("api.github.com", `/repos/${REPO}/branches/${BRANCH}`);
  if (branch.status !== 200) throw new Error(`Failed to fetch branch: ${branch.status}`);
  const treeSha = branch.data.commit.commit.tree.sha;

  const tree = await getJson("api.github.com", `/repos/${REPO}/git/trees/${treeSha}?recursive=1`);
  if (tree.status !== 200) throw new Error(`Failed to fetch tree: ${tree.status}`);

  const nodeFiles = tree.data.tree.filter(
    (f) =>
      f.path.startsWith("packages/nodes-base/nodes/") &&
      f.path.endsWith(".node.json") &&
      f.type === "blob"
  );
  console.log(`   Found ${nodeFiles.length} node JSON files`);

  const docs = [];
  const errors = [];
  const batchSize = 50;
  for (let i = 0; i < nodeFiles.length; i += batchSize) {
    const batch = nodeFiles.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (f) => {
        try {
          const res = await getRaw(`/${REPO}/${BRANCH}/${f.path}`);
          if (res.status !== 200) return { path: f.path, error: `status ${res.status}` };
          return { path: f.path, json: JSON.parse(res.body) };
        } catch (e) {
          return { path: f.path, error: e.message };
        }
      })
    );
    for (const r of results) (r.error ? errors : docs).push(r);
    process.stdout.write(`   Batch ${Math.floor(i / batchSize) + 1}: ${docs.length}/${nodeFiles.length}\n`);
  }

  const nodes = docs.map((d) => {
    const j = d.json;
    const m = d.path.match(/nodes\/([^/]+)\/([^/]+)\.node\.json$/);
    const folder = m?.[1] ?? "";
    const fileName = m?.[2] ?? "";
    return {
      nodeType: j.node || `n8n-nodes-base.${folder.toLowerCase()}`,
      displayName: folder,
      fileName,
      folder,
      isTrigger: fileName.toLowerCase().includes("trigger"),
      nodeVersion: j.nodeVersion || "1.0",
      codexVersion: j.codexVersion || "1.0",
      categories: Array.isArray(j.categories) ? j.categories : [],
      subcategories: j.subcategories || {},
      aliases: Array.isArray(j.alias) ? j.alias : [],
      credentialDocsUrl: j.resources?.credentialDocumentation?.[0]?.url || null,
      primaryDocsUrl: j.resources?.primaryDocumentation?.[0]?.url || null,
      examples: (j.resources?.generic || []).map((g) => ({
        label: g.label || "",
        url: g.url || "",
        icon: g.icon || "",
      })),
      iconUrl: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/packages/nodes-base/nodes/${folder}/${folder.toLowerCase()}.svg`,
      sourcePath: d.path,
    };
  });

  await fs.mkdir(DATA_DIR, { recursive: true });
  const outPath = path.join(DATA_DIR, "catalog.json");
  await fs.writeFile(
    outPath,
    JSON.stringify(
      {
        version: 1,
        fetchedAt: new Date().toISOString(),
        source: `https://github.com/${REPO}`,
        branch: BRANCH,
        count: nodes.length,
        nodes,
      },
      null,
      2
    )
  );

  console.log(`\n✅ Wrote ${outPath}`);
  console.log(`   Total nodes: ${nodes.length}`);
  console.log(`   Errors: ${errors.length}`);
  if (errors.length) console.log(`   Sample errors:`, errors.slice(0, 3));
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
