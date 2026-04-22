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
  console.log(`   Found ${nodeFiles.length} nodes-base JSON files`);

  const lcFiles = tree.data.tree.filter(
    (f) =>
      f.path.startsWith("packages/@n8n/nodes-langchain/nodes/") &&
      f.path.endsWith(".node.ts") &&
      f.type === "blob" &&
      !/\/[vV]\d+\//.test(f.path)
  );
  console.log(`   Found ${lcFiles.length} langchain .node.ts files`);

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
    process.stdout.write(`   nodes-base batch ${Math.floor(i / batchSize) + 1}: ${docs.length}/${nodeFiles.length}\n`);
  }

  const lcDocs = [];
  for (let i = 0; i < lcFiles.length; i += batchSize) {
    const batch = lcFiles.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (f) => {
        try {
          const res = await getRaw(`/${REPO}/${BRANCH}/${f.path}`);
          if (res.status !== 200) return { path: f.path, error: `status ${res.status}` };
          return { path: f.path, src: res.body };
        } catch (e) {
          return { path: f.path, error: e.message };
        }
      })
    );
    for (const r of results) (r.error ? errors : lcDocs).push(r);
    process.stdout.write(`   langchain batch ${Math.floor(i / batchSize) + 1}: ${lcDocs.length}/${lcFiles.length}\n`);
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
      packageName: "n8n-nodes-base",
    };
  });

  for (const d of lcDocs) {
    const parsed = parseLangchainNode(d.src);
    if (!parsed.name) continue;
    const m = d.path.match(/nodes\/(.+)\/([^/]+)\.node\.ts$/);
    const folder = (m?.[1] ?? "").split("/").pop() ?? "";
    const fileName = m?.[2] ?? "";
    nodes.push({
      nodeType: `@n8n/n8n-nodes-langchain.${parsed.name}`,
      displayName: parsed.displayName || folder,
      fileName,
      folder,
      isTrigger:
        fileName.toLowerCase().includes("trigger") ||
        (parsed.group || []).includes("trigger"),
      nodeVersion: "1.0",
      codexVersion: "1.0",
      categories: parsed.categories.length ? parsed.categories : ["AI"],
      subcategories: parsed.subcategories,
      aliases: parsed.aliases,
      credentialDocsUrl: parsed.credentialDocsUrl,
      primaryDocsUrl: parsed.primaryDocsUrl,
      examples: [],
      iconUrl: null,
      sourcePath: d.path,
      packageName: "@n8n/n8n-nodes-langchain",
      description: parsed.description,
    });
  }

  const seen = new Set();
  const deduped = [];
  for (const n of nodes) {
    if (!n.nodeType || seen.has(n.nodeType)) continue;
    seen.add(n.nodeType);
    deduped.push(n);
  }

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
        count: deduped.length,
        nodes: deduped,
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

function parseStringArray(inner) {
  const out = [];
  const re = /['"`]([^'"`]+)['"`]/g;
  let m;
  while ((m = re.exec(inner))) out.push(m[1]);
  return out;
}

function findBalancedBlock(src, startIdx) {
  let depth = 0;
  let inStr = null;
  for (let i = startIdx; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") inStr = c;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  return null;
}

function extractFirst(src, key) {
  const re = new RegExp(`\\b${key}:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, "s");
  const m = src.match(re);
  return m ? m[2] : null;
}

function findNodeDescriptionBlock(src) {
  const patterns = [
    /(?:description|baseDescription)\s*:\s*(?:INodeTypeDescription|INodeTypeBaseDescription)\s*=\s*\{/g,
    /createVectorStoreNode\s*(?:<[^>]*>)?\s*\(\s*\{\s*meta\s*:\s*\{/g,
    /\bmeta\s*:\s*\{/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) {
      const braceIdx = src.lastIndexOf("{", m.index + m[0].length);
      const block = findBalancedBlock(src, braceIdx);
      if (
        block &&
        /\bdisplayName\s*:\s*['"`]/.test(block) &&
        /\bname\s*:\s*['"`]/.test(block)
      ) {
        return block;
      }
    }
  }
  return null;
}

function parseLangchainNode(src) {
  const block = findNodeDescriptionBlock(src) || src;
  const displayName = extractFirst(block, "displayName") || "";
  const name = extractFirst(block, "name") || "";
  const description = extractFirst(block, "description") || "";
  const groupMatch = block.match(/\bgroup:\s*\[([^\]]*)\]/);
  const group = groupMatch ? parseStringArray(groupMatch[1]) : [];

  let aliases = [];
  let categories = [];
  let subcategories = {};
  const codexIdx = block.indexOf("codex:");
  if (codexIdx >= 0) {
    const braceIdx = block.indexOf("{", codexIdx);
    if (braceIdx > 0) {
      const innerBlock = findBalancedBlock(block, braceIdx);
      if (innerBlock) {
        const aliasMatch = innerBlock.match(/\balias:\s*\[([^\]]*)\]/s);
        if (aliasMatch) aliases = parseStringArray(aliasMatch[1]);
        const catMatch = innerBlock.match(/\bcategories:\s*\[([^\]]*)\]/s);
        if (catMatch) categories = parseStringArray(catMatch[1]);
        const subIdx = innerBlock.indexOf("subcategories:");
        if (subIdx >= 0) {
          const subBraceIdx = innerBlock.indexOf("{", subIdx);
          if (subBraceIdx > 0) {
            const subBlock = findBalancedBlock(innerBlock, subBraceIdx);
            if (subBlock) {
              const re = /([A-Za-z0-9_]+)\s*:\s*\[([^\]]*)\]/g;
              let mm;
              while ((mm = re.exec(subBlock))) {
                subcategories[mm[1]] = parseStringArray(mm[2]);
              }
            }
          }
        }
      }
    }
  }

  const docMatch = src.match(/primaryDocumentation:\s*\[\s*\{\s*url:\s*['"`]([^'"`]+)['"`]/);
  const credDocMatch = src.match(/credentialDocumentation:\s*\[\s*\{\s*url:\s*['"`]([^'"`]+)['"`]/);

  return {
    displayName,
    name,
    description,
    group,
    aliases,
    categories,
    subcategories,
    primaryDocsUrl: docMatch?.[1] ?? null,
    credentialDocsUrl: credDocMatch?.[1] ?? null,
  };
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
