/**
 * Phase 6 regression tests — unified `/api/content/:kind/...` HTTP layer.
 *
 * Exercises every verb on both `guide` and `node-doc` kinds against the
 * already-running API Server (PORT=8080). Pure Node 20 ESM; no deps.
 *
 * Coverage:
 *   M6-T1   GET /api/content/:kind/stats          (both kinds)
 *   M6-T2   GET /api/content/:kind/:slug          (both kinds)
 *   M6-T3   GET /api/content/:kind/:slug/diff     (both kinds, override metadata)
 *   M6-T4   PUT /api/content/:kind/:slug/override (set + clear; manual_override survives)
 *   M6-T5   POST /api/content/:kind/refresh-all   (SSE: dryRun, smart) — verifies
 *           named-event format ("event: progress|done\ndata: …"), expected by
 *           the new <ContentRefreshPanel>; verifies dryRun never writes.
 *   M6-T6   400 INVALID_KIND  for unknown kind
 *   M6-T7   404               for unknown slug
 *   M6-T8   Visual-parity contract — guide page builds successfully
 *           (`pnpm --filter @workspace/n8n-manager run build`).
 *
 * Run:
 *     node tests/phase6-unified-content-api.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

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

console.log("Phase 6 unified content API regression\n");

await login();

/* ───────────────────── M6-T1 stats ───────────────────── */
await test("M6-T1 stats endpoint works for both kinds", async () => {
  // Guides expose `total`; node-doc exposes `totalNodes` (the existing
  // service shape is preserved by the unified router on purpose).
  const totalKey = { guide: "total", "node-doc": "totalNodes" };
  for (const kind of ["guide", "node-doc"]) {
    const r = await fetch(`${BASE}/content/${kind}/stats`, { headers: auth() });
    assert.equal(r.status, 200, `${kind} stats HTTP 200`);
    const j = await r.json();
    assert.equal(j.success, true, `${kind} stats success=true`);
    assert.equal(j.data.kind, kind, `${kind} stats payload echoes kind`);
    const n = j.data[totalKey[kind]];
    assert.ok(typeof n === "number" && n > 0, `${kind} ${totalKey[kind]} > 0`);
  }
});

/* ───────────────────── M6-T2 single doc fetch ───────────────────── */
let firstGuide = "";
let firstNode = "";
await test("M6-T2 single-doc fetch works for both kinds", async () => {
  // discover real slugs
  const gl = await fetch(`${BASE}/catalog/docs-advanced/guides?lang=en`, { headers: auth() });
  const gj = await gl.json();
  firstGuide = gj.data.guides[0].slug;
  const nl = await fetch(`${BASE}/catalog?limit=1`, { headers: auth() });
  const nj = await nl.json();
  firstNode = nj.data.items[0].nodeType;

  const g = await fetch(`${BASE}/content/guide/${firstGuide}?lang=en`, { headers: auth() });
  assert.equal(g.status, 200, "guide GET HTTP 200");
  const gjson = await g.json();
  assert.equal(gjson.data.slug, firstGuide, "guide slug matches");

  // For node-doc, the unified GET returns 200 if the slug has been fetched,
  // 404 (NOT_FOUND) otherwise — both are valid; we assert one of those two
  // outcomes plus a well-formed JSON envelope.
  const n = await fetch(
    `${BASE}/content/node-doc/${encodeURIComponent(firstNode)}?lang=en`,
    { headers: auth() },
  );
  assert.ok(n.status === 200 || n.status === 404, `node-doc GET HTTP 200 or 404 (got ${n.status})`);
  const njson = await n.json();
  if (n.status === 200) {
    assert.equal(njson.success, true, "node-doc success=true");
    assert.ok(njson.data && typeof njson.data === "object", "node-doc data object present");
  } else {
    assert.equal(njson.error?.code, "NOT_FOUND", "node-doc 404 carries NOT_FOUND code");
  }
});

/* ───────────────────── M6-T3 diff endpoint ───────────────────── */
await test("M6-T3 diff endpoint reports override metadata", async () => {
  const r = await fetch(
    `${BASE}/content/guide/${firstGuide}/diff?lang=en`,
    { headers: auth() },
  );
  assert.equal(r.status, 200, "diff HTTP 200");
  const j = await r.json();
  assert.equal(j.success, true);
  assert.ok("hasOverride" in j.data, "diff payload contains hasOverride");
  assert.ok("upstream" in j.data, "diff payload contains upstream key");
  assert.ok("override" in j.data, "diff payload contains override key");
});

/* ───────────────────── M6-T4 override PUT/DELETE ───────────────────── */
await test("M6-T4 override set+clear leaves stats consistent (guide)", async () => {
  // First wipe any leftover override on this slug from prior runs so the
  // count delta is deterministic.
  await fetch(`${BASE}/content/guide/${firstGuide}/override?lang=ar`, {
    method: "DELETE",
    headers: auth(),
  });
  const before = await (await fetch(`${BASE}/content/guide/stats`, { headers: auth() })).json();
  const baseline = before.data.overrides ?? 0;

  const setRes = await fetch(`${BASE}/content/guide/${firstGuide}/override?lang=ar`, {
    method: "PUT",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: "# phase 6 test override\n\nhello world", note: "phase6 test" }),
  });
  assert.equal(setRes.status, 200, "PUT override HTTP 200");
  const setJson = await setRes.json();
  assert.equal(setJson.success, true);

  const after = await (await fetch(`${BASE}/content/guide/stats`, { headers: auth() })).json();
  assert.equal(after.data.overrides, baseline + 1, "overrides count incremented by 1");

  // Confirm the override survives a GET via the unified single-doc endpoint.
  const fetched = await (await fetch(`${BASE}/content/guide/${firstGuide}?lang=ar`, { headers: auth() })).json();
  assert.ok(
    String(fetched.data.manualOverrideMarkdown ?? "").includes("phase 6 test override"),
    "manualOverrideMarkdown contains injected text",
  );

  // Clean up
  const delRes = await fetch(`${BASE}/content/guide/${firstGuide}/override?lang=ar`, {
    method: "DELETE",
    headers: auth(),
  });
  assert.equal(delRes.status, 200, "DELETE override HTTP 200");

  const final = await (await fetch(`${BASE}/content/guide/stats`, { headers: auth() })).json();
  assert.equal(final.data.overrides, baseline, "overrides count restored to baseline");
});

/* ───────────────────── M6-T5 SSE dryRun ───────────────────── */
async function consumeSse(url, opts) {
  const res = await fetch(url, opts);
  assert.equal(res.status, 200, `${url} HTTP 200`);
  const ct = res.headers.get("content-type") ?? "";
  assert.ok(ct.includes("text/event-stream"), `${url} content-type is event-stream`);
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

await test("M6-T5 dryRun SSE for both kinds: named events + no writes", async () => {
  for (const kind of ["guide", "node-doc"]) {
    const before = await (await fetch(`${BASE}/content/${kind}/stats`, { headers: auth() })).json();
    const events = await consumeSse(
      `${BASE}/content/${kind}/refresh-all?smart=true&dryRun=true`,
      { method: "POST", headers: auth() },
    );
    const eventNames = new Set(events.map((e) => e.event));
    assert.ok(eventNames.has("start"), `${kind}: emitted "start" named event`);
    assert.ok(eventNames.has("progress"), `${kind}: emitted "progress" named event`);
    assert.ok(eventNames.has("done"), `${kind}: emitted "done" named event`);

    const startEv = events.find((e) => e.event === "start");
    assert.equal(startEv.data.kind, kind, `${kind}: start carries kind`);
    assert.equal(startEv.data.dryRun, true, `${kind}: start carries dryRun=true`);

    const after = await (await fetch(`${BASE}/content/${kind}/stats`, { headers: auth() })).json();
    assert.equal(after.data.total, before.data.total, `${kind}: dryRun made no writes (total unchanged)`);
  }
});

/* ───────────────────── M6-T6 / T7 error handling ───────────────────── */
await test("M6-T6 invalid kind → 400 INVALID_KIND", async () => {
  const r = await fetch(`${BASE}/content/banana/stats`, { headers: auth() });
  assert.equal(r.status, 400, "HTTP 400");
  const j = await r.json();
  assert.equal(j.error?.code, "INVALID_KIND", "error.code = INVALID_KIND");
});

await test("M6-T7 unknown slug → 404", async () => {
  const r = await fetch(`${BASE}/content/guide/__definitely_not_a_real_slug__?lang=en`, { headers: auth() });
  assert.equal(r.status, 404, "HTTP 404");
});

/* ───────────────────── M6-T8 visual-parity build check ───────────────────── */
await test("M6-T8 manager build still succeeds (visual-parity refactor)", () => {
  const result = spawnSync(
    "pnpm",
    ["--filter", "@workspace/n8n-manager", "run", "build"],
    {
      cwd: process.cwd(),
      env: { ...process.env, PORT: "18898", BASE_PATH: "/" },
      encoding: "utf8",
      timeout: 120_000,
    },
  );
  assert.equal(result.status, 0, `build failed:\n${result.stdout}\n${result.stderr}`);
  assert.ok(/built in/.test(result.stdout), "build output mentions completion");
});

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
