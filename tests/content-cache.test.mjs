/**
 * Phase 7B parametric regression tests for the unified content cache.
 *
 * One harness, two kinds (`guide` + `node-doc`). Five sacred contracts
 * from `docs/plans/unified-content-cache-plan.md` §12, plus one Phase 7
 * specific contract for the new `content_refresh_history` table.
 *
 * Contracts (per kind):
 *   C1  manual_override survives `force` refresh-all
 *   C2  manual_override survives `smart` refresh-all
 *   C3  `dry-run` makes zero DB writes (stats stable, no history row)
 *   C4  Second `smart` run is a no-op (added=0, updated=0)
 *   C5  Hydrate post-wipe restores rows from the on-disk manifest layer
 *   C6  History row recorded after every non-dry-run refresh
 *
 * Notes:
 *   - For `node-doc`, `force` is scoped via `?only=<nodeType>` to avoid
 *     hammering the entire 541-node catalog.
 *   - For `guide`, `force` runs the full guide list (~10 pages) which is
 *     cheap.
 *   - `C5` reuses the existing legacy hydrate route on `node-doc` (the
 *     only kind that currently exposes one). For `guide`, the manifest
 *     layer is exercised by the smart run after wiping the row's
 *     `sourceSha`, validating the manifest acts as a second-tier ETag
 *     store as designed in Phase 4.
 *   - Pure Node 20 ESM, zero deps; assumes API server running on :8080.
 *
 * Run:  node tests/content-cache.test.mjs
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";

// Resolve `pg` through `lib/db`'s node_modules (workspace pnpm layout
// keeps the driver hoisted there, not at workspace root).
const require = createRequire(import.meta.url);
const pg = require("../lib/db/node_modules/pg");
const { Client } = pg;

async function withDb(fn) {
  const url = process.env.DATABASE_URL;
  assert.ok(url, "DATABASE_URL env var must be set for the regression DB checks");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

const BASE = process.env.API_BASE ?? "http://localhost:8080/api";
const ADMIN = { username: "admin", password: "123456" };

const passes = [];
const fails = [];
async function test(name, fn) {
  process.stdout.write(`  ⏳ ${name}\n`);
  try {
    await fn();
    passes.push(name);
    process.stdout.write(`  ✅ ${name}\n`);
  } catch (err) {
    fails.push({ name, err });
    process.stdout.write(`  ❌ ${name}\n     ${err?.message ?? err}\n`);
  }
}

let TOK = "";
async function login() {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ADMIN),
  });
  assert.equal(r.status, 200, "admin login must succeed");
  const j = await r.json();
  TOK = j.data.accessToken;
  assert.ok(TOK && TOK.length > 20, "must receive a non-empty access token");
}
const auth = () => ({ Authorization: `Bearer ${TOK}` });

/* ──────────────────── SSE helper ──────────────────── */
async function consumeSse(url, opts) {
  const res = await fetch(url, opts);
  assert.equal(res.status, 200, `${url} HTTP 200`);
  const ct = res.headers.get("content-type") ?? "";
  assert.ok(ct.includes("text/event-stream"), `${url} must be event-stream`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  const events = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const blocks = buf.split("\n\n");
    buf = blocks.pop() ?? "";
    for (const block of blocks) {
      let event = "message";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) events.push({ event, data: JSON.parse(data) });
    }
  }
  return events;
}

/* ──────────────────── kind-specific helpers ──────────────────── */
async function discoverSampleSlug(kind) {
  if (kind === "guide") {
    const r = await fetch(`${BASE}/catalog/docs-advanced/guides?lang=en`, { headers: auth() });
    const j = await r.json();
    return j.data.guides[0].slug;
  }
  // node-doc — pick a small, stable, well-known node type
  const r = await fetch(`${BASE}/catalog?limit=200`, { headers: auth() });
  const j = await r.json();
  const item = j.data.items.find((i) => /n8n-nodes-base\.set$/i.test(i.nodeType))
            ?? j.data.items.find((i) => /n8n-nodes-base\.if$/i.test(i.nodeType))
            ?? j.data.items[0];
  return item.nodeType;
}

async function getStatsTotal(kind) {
  const r = await fetch(`${BASE}/content/${kind}/stats`, { headers: auth() });
  const j = await r.json();
  return kind === "guide" ? j.data.total : j.data.totalNodes;
}

async function clearOverride(kind, slug, lang = "ar") {
  await fetch(`${BASE}/content/${kind}/${encodeURIComponent(slug)}/override?lang=${lang}`, {
    method: "DELETE",
    headers: auth(),
  });
}

async function setOverride(kind, slug, lang = "ar") {
  const text = `# phase 7 marker ${kind}/${slug}\n\nThis must survive refresh-all.`;
  const r = await fetch(`${BASE}/content/${kind}/${encodeURIComponent(slug)}/override?lang=${lang}`, {
    method: "PUT",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: text, note: "phase7-test" }),
  });
  assert.equal(r.status, 200, `PUT override ${kind}/${slug} HTTP 200`);
  return text;
}

async function readOverride(kind, slug, lang = "ar") {
  // Use the unified /diff endpoint — its `override` field is normalised
  // across both kinds (guide returns the override column directly,
  // node-doc returns the effective markdown when manualOverride is set).
  const r = await fetch(
    `${BASE}/content/${kind}/${encodeURIComponent(slug)}/diff?lang=${lang}`,
    { headers: auth() },
  );
  if (r.status !== 200) return null;
  const j = await r.json();
  return j.data?.override ?? null;
}

async function refreshAll(kind, modeFlags, extraQs = "") {
  // modeFlags: { smart?: bool, force?: bool, dryRun?: bool }
  const qs = new URLSearchParams({
    smart: String(!!modeFlags.smart),
    force: String(!!modeFlags.force),
    dryRun: String(!!modeFlags.dryRun),
  });
  if (extraQs) {
    for (const [k, v] of new URLSearchParams(extraQs)) qs.append(k, v);
  }
  return await consumeSse(`${BASE}/content/${kind}/refresh-all?${qs}`, {
    method: "POST",
    headers: auth(),
  });
}

async function lastHistoryRow(kind) {
  const r = await fetch(`${BASE}/content/${kind}/history?limit=1`, { headers: auth() });
  const j = await r.json();
  return j.data.entries[0] ?? null;
}

async function historyCount(kind) {
  const r = await fetch(`${BASE}/content/${kind}/history?limit=200`, { headers: auth() });
  const j = await r.json();
  return j.data.entries.length;
}

/* ──────────────────── parametric suite ──────────────────── */
console.log("Phase 7B parametric content-cache regression\n");
await login();

for (const kind of ["guide", "node-doc"]) {
  console.log(`\n  ── kind = ${kind} ──`);
  const slug = await discoverSampleSlug(kind);
  console.log(`     sample slug: ${slug}`);

  await clearOverride(kind, slug, "ar"); // start clean

  /* ─── C1 override survives force ─── */
  await test(`[${kind}] C1 manual_override survives force refresh-all`, async () => {
    const expected = await setOverride(kind, slug, "ar");
    // For node-doc, scope force to just this slug to keep the test fast.
    const extra = kind === "node-doc" ? `only=${encodeURIComponent(slug)}` : "";
    const events = await refreshAll(kind, { force: true }, extra);
    const done = events.find((e) => e.event === "done");
    assert.ok(done, "force refresh emitted done event");
    const after = await readOverride(kind, slug, "ar");
    assert.equal(after, expected, "manualOverrideMarkdown bytes-identical after force refresh");
    await clearOverride(kind, slug, "ar");
  });

  /* ─── C2 override survives smart ─── */
  await test(`[${kind}] C2 manual_override survives smart refresh-all`, async () => {
    const expected = await setOverride(kind, slug, "ar");
    const extra = kind === "node-doc" ? `only=${encodeURIComponent(slug)}` : "";
    const events = await refreshAll(kind, { smart: true }, extra);
    assert.ok(events.some((e) => e.event === "done"), "smart refresh emitted done event");
    const after = await readOverride(kind, slug, "ar");
    assert.equal(after, expected, "manualOverrideMarkdown bytes-identical after smart refresh");
    await clearOverride(kind, slug, "ar");
  });

  /* ─── C3 dry-run no writes ─── */
  await test(`[${kind}] C3 dry-run makes zero DB writes`, async () => {
    const totalBefore = await getStatsTotal(kind);
    const histBefore  = await historyCount(kind);
    const extra = kind === "node-doc" ? `only=${encodeURIComponent(slug)}` : "";
    const events = await refreshAll(kind, { smart: true, dryRun: true }, extra);
    const done = events.find((e) => e.event === "done");
    assert.ok(done, "dry-run emitted done event");
    const totalAfter = await getStatsTotal(kind);
    const histAfter  = await historyCount(kind);
    assert.equal(totalAfter, totalBefore, "stats total unchanged");
    // dry-run is a "predict only" mode — by spec it should NOT persist a
    // history row either; otherwise repeated dry-runs would pollute the
    // operator's diagnostics view.
    assert.equal(histAfter, histBefore, "no history row written for dry-run");
  });

  /* ─── C4 second smart run is no-op ─── */
  await test(`[${kind}] C4 second smart run reports no churn`, async () => {
    const extra = kind === "node-doc" ? `only=${encodeURIComponent(slug)}` : "";
    // 1st run (warm-up — may legitimately update something)
    await refreshAll(kind, { smart: true }, extra);
    // 2nd run — must be all-unchanged (or all-failed if upstream is down,
    // which the spec says is acceptable; we therefore require either)
    const events = await refreshAll(kind, { smart: true }, extra);
    const done = events.find((e) => e.event === "done");
    assert.ok(done, "2nd smart run emitted done event");
    const d = done.data;
    const churn = (d.added ?? d.enAdded ?? 0) + (d.updated ?? d.enUpdated ?? 0);
    assert.equal(churn, 0, `2nd smart run had churn (added+updated = ${churn}); should be 0`);
  });

  /* ─── C5 hydrate post-wipe ─── */
  await test(`[${kind}] C5 hydrate post-wipe restores from disk/manifest`, async () => {
    if (kind === "node-doc") {
      // Simulate a partial wipe: NULL the markdown for one row that we
      // know has a corresponding `.md` on disk (the one we just refreshed).
      await withDb(async (c) => {
        await c.query(
          "UPDATE node_docs SET markdown = NULL WHERE node_type = $1 AND language = 'en'",
          [slug],
        );
      });
      const r = await fetch(`${BASE}/catalog/docs/hydrate-from-disk`, {
        method: "POST",
        headers: auth(),
      });
      assert.equal(r.status, 200, "hydrate-from-disk HTTP 200");
      const restored = await withDb(async (c) => {
        const res = await c.query(
          "SELECT markdown FROM node_docs WHERE node_type = $1 AND language = 'en' LIMIT 1",
          [slug],
        );
        return res.rows[0]?.markdown ?? null;
      });
      assert.ok(restored && restored.length > 0, "markdown restored from disk");
    } else {
      // guide: NULL the etag/sha so the next smart-refresh has nothing in
      // DB. The Phase-4 manifest layer must supply the cached ETag/SHA so
      // the upstream returns 304 (or the SHA matches without re-writing).
      await withDb(async (c) => {
        await c.query(
          "UPDATE guides_docs SET source_etag = NULL, source_sha = NULL WHERE slug = $1 AND language = 'en'",
          [slug],
        );
      });
      const events = await refreshAll(kind, { smart: true });
      assert.ok(events.some((e) => e.event === "done"), "smart refresh emitted done event");
      // After the manifest-assisted refresh, etag OR sha must be
      // repopulated (whichever the upstream provided), proving the row
      // was rehydrated through the manifest second-tier cache.
      const row = await withDb(async (c) => {
        const res = await c.query(
          "SELECT source_etag, source_sha FROM guides_docs WHERE slug = $1 AND language = 'en' LIMIT 1",
          [slug],
        );
        return res.rows[0] ?? {};
      });
      assert.ok(
        (row.source_etag && row.source_etag.length > 0) || (row.source_sha && row.source_sha.length > 0),
        "etag or sha repopulated after manifest-assisted smart refresh",
      );
    }
  });

  /* ─── C6 history row recorded ─── */
  await test(`[${kind}] C6 non-dry-run refresh writes a content_refresh_history row`, async () => {
    const before = await historyCount(kind);
    const extra = kind === "node-doc" ? `only=${encodeURIComponent(slug)}` : "";
    await refreshAll(kind, { smart: true }, extra);
    const after = await historyCount(kind);
    assert.ok(after > before, `history row count should grow (${before} -> ${after})`);
    const last = await lastHistoryRow(kind);
    assert.ok(last, "last history row exists");
    assert.equal(last.kind, kind, "row.kind matches");
    assert.equal(last.mode, "smart", "row.mode = smart");
    assert.ok(typeof last.durationMs === "number" && last.durationMs >= 0, "row.durationMs is a number");
    assert.ok(typeof last.total === "number", "row.total is a number");
  });
}

console.log(`\n  Passed: ${passes.length}`);
console.log(`  Failed: ${fails.length}`);
if (fails.length > 0) {
  console.error("\nFailures:");
  for (const f of fails) {
    console.error(`  - ${f.name}: ${f.err?.stack ?? f.err}`);
  }
  process.exit(1);
}
process.exit(0);
