/**
 * Unit tests for SmartCacheService building blocks.
 *
 * Phase 2 of unified-content-cache-plan.md.
 *
 *  - M2-T2 etagFetcher: 200 / 304 / network error.
 *  - M2-T3 manifest:    atomic read/write/upsert, no orphan tmp files.
 *  - M2-T4 concurrency: pAll respects the cap and preserves order.
 *
 * Pure Node 20 ESM. No external deps. Run with:
 *     node tests/smart-cache/unit.test.mjs
 */
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import crypto from "node:crypto";

import { fetchWithEtag, fetchAnyWithEtag } from "../../artifacts/api-server/src/services/smartCache/etagFetcher.ts";
import { pAll } from "../../artifacts/api-server/src/services/smartCache/concurrency.ts";
import {
  readManifest,
  writeManifest,
  upsertManifestEntry,
  emptyManifest,
  manifestKey,
} from "../../artifacts/api-server/src/services/smartCache/manifest.ts";

const passes = [];
const fails = [];

async function test(name, fn) {
  process.stdout.write(`  ⏳ ${name}\n`);
  try {
    await fn();
    passes.push(name);
    process.stdout.write(`  ✓  ${name}\n`);
  } catch (err) {
    fails.push({ name, err });
    process.stdout.write(`  ✗  ${name}\n     ${err?.message ?? err}\n`);
  }
}

function startEtagServer() {
  // Tiny in-process HTTP server with ETag support.
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost`);
    if (url.pathname === "/file.md") {
      const body = "Hello world from upstream\n\n# Heading\nLine\n";
      const etag = `W/"${crypto.createHash("sha1").update(body).digest("hex")}"`;
      if (req.headers["if-none-match"] === etag) {
        res.statusCode = 304;
        res.setHeader("etag", etag);
        return res.end();
      }
      res.setHeader("etag", etag);
      res.setHeader("content-type", "text/plain");
      res.statusCode = 200;
      return res.end(body);
    }
    if (url.pathname === "/missing") {
      res.statusCode = 404;
      return res.end("nope");
    }
    if (url.pathname === "/empty") {
      res.statusCode = 200;
      return res.end("");
    }
    res.statusCode = 400;
    res.end();
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ port, close: () => new Promise((r) => server.close(() => r())) });
    });
  });
}

console.log("\n── M2-T2 · etagFetcher ─────────────────");
const srv = await startEtagServer();
const baseUrl = `http://127.0.0.1:${srv.port}`;
let storedEtag = null;

await test("first GET returns 200 + body + sha + etag", async () => {
  const r = await fetchWithEtag(`${baseUrl}/file.md`);
  assert.equal(r.status, 200);
  assert.equal(r.unchanged, false);
  assert.ok(r.body && r.body.length > 10);
  assert.match(r.sha, /^[0-9a-f]{40}$/);
  assert.ok(r.etag && r.etag.startsWith('W/"'));
  storedEtag = r.etag;
});

await test("second GET with If-None-Match returns 304", async () => {
  const r = await fetchWithEtag(`${baseUrl}/file.md`, { storedEtag });
  assert.equal(r.status, 304);
  assert.equal(r.unchanged, true);
  assert.equal(r.body, undefined);
  assert.equal(r.sha, undefined);
  assert.equal(r.etag, storedEtag);
});

await test("force mode (useEtag=false) ignores stored ETag", async () => {
  const r = await fetchWithEtag(`${baseUrl}/file.md`, { storedEtag, useEtag: false });
  assert.equal(r.status, 200);
  assert.equal(r.unchanged, false);
  assert.ok(r.body);
});

await test("404 returns failure with status code, never throws", async () => {
  const r = await fetchWithEtag(`${baseUrl}/missing`);
  assert.equal(r.status, 404);
  assert.equal(r.unchanged, false);
  assert.equal(r.body, undefined);
  assert.match(r.error, /HTTP 404/);
});

await test("empty body counted as failure (length<10)", async () => {
  const r = await fetchWithEtag(`${baseUrl}/empty`);
  assert.equal(r.unchanged, false);
  assert.equal(r.body, undefined);
  assert.match(r.error, /empty body/);
});

await test("network error returns status:0 + error, never throws", async () => {
  const r = await fetchWithEtag("http://127.0.0.1:1/never");
  assert.equal(r.status, 0);
  assert.ok(r.error);
});

await test("fetchAnyWithEtag picks first successful candidate", async () => {
  const r = await fetchAnyWithEtag([`${baseUrl}/missing`, `${baseUrl}/file.md`]);
  assert.equal(r.status, 200);
  assert.ok(r.body);
});

await srv.close();

console.log("\n── M2-T4 · pAll concurrency ───────────");
await test("respects concurrency cap and preserves input order", async () => {
  const items = Array.from({ length: 30 }, (_, i) => i);
  let inflight = 0;
  let maxInflight = 0;
  const out = await pAll(
    items,
    async (n) => {
      inflight++;
      if (inflight > maxInflight) maxInflight = inflight;
      // Tiny jitter to surface races.
      await new Promise((r) => setTimeout(r, 5 + (n % 3)));
      inflight--;
      return n * 2;
    },
    6,
  );
  assert.equal(out.length, items.length);
  for (let i = 0; i < items.length; i++) assert.equal(out[i], i * 2);
  assert.ok(maxInflight <= 6, `expected <=6 in-flight, saw ${maxInflight}`);
  assert.ok(maxInflight >= 4, `expected real parallelism (saw only ${maxInflight})`);
});

await test("concurrency 1 = serial", async () => {
  const order = [];
  await pAll([1, 2, 3], async (n) => {
    order.push(`start ${n}`);
    await new Promise((r) => setTimeout(r, 5));
    order.push(`end ${n}`);
  }, 1);
  assert.deepEqual(order, ["start 1", "end 1", "start 2", "end 2", "start 3", "end 3"]);
});

await test("empty input returns empty array immediately", async () => {
  const out = await pAll([], async () => 1, 6);
  assert.deepEqual(out, []);
});

console.log("\n── M2-T3 · manifest atomic I/O ────────");
const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "smart-cache-test-"));

await test("readManifest on missing file returns empty manifest", async () => {
  const m = await readManifest(tmpRoot, "guides");
  assert.equal(m.kind, "guides");
  assert.equal(m.version, 1);
  assert.deepEqual(m.entries, {});
});

await test("upsert + write + read roundtrip preserves entries", async () => {
  let m = emptyManifest("guides");
  m = upsertManifestEntry(m, { slug: "alpha", language: "en", sha: "a".repeat(40) });
  m = upsertManifestEntry(m, { slug: "alpha", language: "ar", sha: "b".repeat(40) });
  m = upsertManifestEntry(m, { slug: "beta", language: "en", sha: "c".repeat(40) });
  await writeManifest(tmpRoot, m);

  const round = await readManifest(tmpRoot, "guides");
  assert.equal(Object.keys(round.entries).length, 3);
  assert.equal(round.entries[manifestKey("alpha", "en")].sha, "a".repeat(40));
  assert.equal(round.entries[manifestKey("alpha", "ar")].sha, "b".repeat(40));
  assert.equal(round.entries[manifestKey("beta", "en")].sha, "c".repeat(40));
});

await test("write is atomic: no orphan .tmp files left after success", async () => {
  // Phase 4 path layout: <rootDir>/_meta/<kind>.manifest.json
  const dir = path.join(tmpRoot, "_meta");
  const files = await fs.readdir(dir);
  const orphans = files.filter((f) => f.includes(".tmp."));
  assert.deepEqual(orphans, [], `unexpected orphan tmp files: ${orphans.join(", ")}`);
});

await test("corrupted manifest falls back to empty (does not throw)", async () => {
  // Phase 4 path layout: <rootDir>/_meta/<kind>.manifest.json
  const corruptDir = path.join(tmpRoot, "_meta");
  await fs.mkdir(corruptDir, { recursive: true });
  await fs.writeFile(path.join(corruptDir, "broken.manifest.json"), "{ invalid json", "utf8");
  const m = await readManifest(tmpRoot, "broken");
  assert.equal(m.version, 1);
  assert.deepEqual(m.entries, {});
});

/* ──────────────────── Phase 4 — Manifest + ETag layer ──────────────────── */

const { smartRefresh } = await import(
  "../../artifacts/api-server/src/services/smartCache/smartRefresh.ts"
);
const { hydrateFromDisk } = await import(
  "../../artifacts/api-server/src/services/smartCache/hydrateFromDisk.ts"
);

console.log("\n── M4 · Manifest + ETag integration ────");

/** Build an in-memory adapter backed by a Map. No DB, no real disk content. */
function makeMockAdapter({ kind, rootDir, sourceUrl, primarySha, primaryEtag, db, disk }) {
  return {
    kind,
    rootDir,
    describe(key) {
      return {
        kind,
        slug: key,
        language: "en",
        key,
        diskPath: path.join(rootDir, "en", `${key}.md`),
        sourceUrls: [sourceUrl],
      };
    },
    async getStored(key) {
      const r = db.get(key);
      return {
        exists: !!r,
        sha: r?.sha ?? null,
        etag: r?.etag ?? null,
        hasContent: !!r?.body,
        isDirty: !!r?.dirty,
      };
    },
    async upsert(key, payload) {
      db.set(key, { body: payload.body, sha: payload.sha, etag: payload.etag });
      disk.set(key, payload.body);
    },
    async recordError() {},
    async listDiskKeys() {
      return Array.from(disk.keys());
    },
    async readDiskContent(key) {
      return disk.get(key) ?? null;
    },
    async hydrateInsert(key, content, meta) {
      if (db.has(key) && db.get(key)?.body) return false;
      db.set(key, {
        body: content,
        sha: meta?.sha ?? null,
        etag: meta?.etag ?? null,
      });
      return true;
    },
  };
}

/** Build an upstream HTTP server that mimics Github raw with ETag. */
function startUpstream({ body }) {
  const sha = crypto.createHash("sha1").update(body).digest("hex");
  const etag = `W/"${sha.slice(0, 12)}"`;
  let hits = { total: 0, conditional: 0, full: 0 };
  const server = http.createServer((req, res) => {
    hits.total += 1;
    if (req.headers["if-none-match"] === etag) {
      hits.conditional += 1;
      res.statusCode = 304;
      res.setHeader("ETag", etag);
      return res.end();
    }
    hits.full += 1;
    res.statusCode = 200;
    res.setHeader("ETag", etag);
    res.setHeader("Content-Type", "text/plain");
    res.end(body);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        port,
        url: `http://127.0.0.1:${port}/file.md`,
        sha,
        etag,
        hits,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

const phase4Root = await fs.mkdtemp(path.join(os.tmpdir(), "smartcache-p4-"));

await test("M4-T1 · smartRefresh writes manifest after first fetch", async () => {
  const upstream = await startUpstream({ body: "# Hello\nbody bytes\n" });
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind",
      rootDir: path.join(phase4Root, "kindA"),
      sourceUrl: upstream.url,
      db,
      disk,
    });
    const summary = await smartRefresh(adapter, ["alpha", "beta"], { mode: "smart" });
    assert.equal(summary.added, 2);
    assert.equal(summary.unchanged, 0);
    // Manifest file should now exist with both entries.
    const m = await readManifest(adapter.rootDir, "test-kind");
    assert.equal(Object.keys(m.entries).length, 2);
    assert.equal(m.entries[manifestKey("alpha", "en")].sha, upstream.sha);
    assert.equal(m.entries[manifestKey("alpha", "en")].etag, upstream.etag);
    assert.equal(m.entries[manifestKey("beta", "en")].sourceUrl, upstream.url);
  } finally {
    await upstream.close();
  }
});

await test("M4-T2 · second smartRefresh sends If-None-Match → 304 unchanged", async () => {
  const upstream = await startUpstream({ body: "# Hello\nbody bytes\n" });
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind2",
      rootDir: path.join(phase4Root, "kindB"),
      sourceUrl: upstream.url,
      db,
      disk,
    });
    // First refresh — populates DB and manifest.
    await smartRefresh(adapter, ["x"], { mode: "smart" });
    const beforeHits = { ...upstream.hits };
    // Second refresh — should send If-None-Match → 304.
    const s2 = await smartRefresh(adapter, ["x"], { mode: "smart" });
    assert.equal(s2.unchanged, 1, "second pass must be unchanged");
    assert.equal(s2.added, 0);
    assert.equal(s2.updated, 0);
    assert.equal(s2.networkBytes, 0, "304 must carry zero body bytes");
    assert.equal(
      upstream.hits.conditional,
      beforeHits.conditional + 1,
      "exactly one conditional GET on the second pass",
    );
  } finally {
    await upstream.close();
  }
});

await test("M4-T3 · DB-wipe survival: manifest etag re-used → instant 304", async () => {
  const upstream = await startUpstream({ body: "# Hello\nbody bytes\n" });
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind3",
      rootDir: path.join(phase4Root, "kindC"),
      sourceUrl: upstream.url,
      db,
      disk,
    });
    await smartRefresh(adapter, ["only"], { mode: "smart" });
    // Simulate DB wipe — disk and manifest survive.
    db.clear();
    const beforeHits = { ...upstream.hits };
    const s2 = await smartRefresh(adapter, ["only"], { mode: "smart" });
    // DB has no `body` so `hasContent` is false. With manifest etag the
    // upstream still returns 304. Smart refresh should treat as unchanged
    // (304 => unchanged path) BUT then since stored.hasContent is false,
    // an upstream response with no body cannot rebuild content. The
    // contract says: 304 ⇒ unchanged regardless. So we expect unchanged
    // and zero network bytes.
    assert.equal(s2.unchanged, 1, "manifest etag must yield 304 even with empty DB");
    assert.equal(s2.networkBytes, 0);
    assert.equal(upstream.hits.conditional, beforeHits.conditional + 1);
  } finally {
    await upstream.close();
  }
});

await test("M4-T4 · hydrateFromDisk reads manifest and passes meta", async () => {
  const upstream = await startUpstream({ body: "# disk content\nfoo bar\n" });
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind4",
      rootDir: path.join(phase4Root, "kindD"),
      sourceUrl: upstream.url,
      db,
      disk,
    });
    // Populate disk + manifest via a real refresh.
    await smartRefresh(adapter, ["doc1", "doc2"], { mode: "smart" });
    // Wipe DB but keep disk+manifest.
    db.clear();
    const summary = await hydrateFromDisk(adapter, "en");
    assert.equal(summary.scanned, 2);
    assert.equal(summary.imported, 2);
    // DB rows should now have sha+etag from the manifest.
    const r = db.get("doc1");
    assert.equal(r.sha, upstream.sha);
    assert.equal(r.etag, upstream.etag);
  } finally {
    await upstream.close();
  }
});

await test("M4-T5 · ETag missing from upstream falls back to SHA compare", async () => {
  // Upstream that NEVER sends ETag header.
  const body = "# stable content\nno etag here\n";
  const sha = crypto.createHash("sha1").update(body).digest("hex");
  let hits = 0;
  const server = http.createServer((_req, res) => {
    hits += 1;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    // No ETag header, no Last-Modified.
    res.end(body);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/no-etag.md`;
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind5",
      rootDir: path.join(phase4Root, "kindE"),
      sourceUrl: url,
      db,
      disk,
    });
    const s1 = await smartRefresh(adapter, ["k"], { mode: "smart" });
    assert.equal(s1.added, 1);
    const s2 = await smartRefresh(adapter, ["k"], { mode: "smart" });
    // No ETag → no conditional. Server returns 200 with same body.
    // SmartCache compares SHA → same → unchanged.
    assert.equal(s2.unchanged, 1, "must fall back to SHA compare when ETag absent");
    assert.equal(s2.updated, 0);
    assert.equal(hits, 2, "both requests are full GETs (no conditional path)");
  } finally {
    await new Promise((r) => server.close(r));
  }
});

await test("M4-T6 · dry-run never writes manifest", async () => {
  const upstream = await startUpstream({ body: "# dry-run only\n\n" });
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind6",
      rootDir: path.join(phase4Root, "kindF"),
      sourceUrl: upstream.url,
      db,
      disk,
    });
    const s = await smartRefresh(adapter, ["dry"], { mode: "dry-run" });
    assert.equal(s.added, 1);
    // Manifest file must NOT exist.
    const mp = path.join(adapter.rootDir, "_meta", "test-kind6.manifest.json");
    let exists = true;
    try {
      await fs.access(mp);
    } catch {
      exists = false;
    }
    assert.equal(exists, false, "dry-run created a manifest, contract violated");
  } finally {
    await upstream.close();
  }
});

await test("M4-T7 · force mode bypasses If-None-Match", async () => {
  const upstream = await startUpstream({ body: "# force me\n\n" });
  try {
    const db = new Map();
    const disk = new Map();
    const adapter = makeMockAdapter({
      kind: "test-kind7",
      rootDir: path.join(phase4Root, "kindG"),
      sourceUrl: upstream.url,
      db,
      disk,
    });
    await smartRefresh(adapter, ["fk"], { mode: "smart" });
    const before = { ...upstream.hits };
    const s = await smartRefresh(adapter, ["fk"], { mode: "force" });
    // Force mode = no If-None-Match, server returns 200 always.
    assert.equal(upstream.hits.full, before.full + 1, "force must do a full GET");
    assert.equal(upstream.hits.conditional, before.conditional, "no conditional in force");
    assert.equal(s.updated, 1, "force always writes => 'updated'");
  } finally {
    await upstream.close();
  }
});

await fs.rm(phase4Root, { recursive: true, force: true });
await fs.rm(tmpRoot, { recursive: true, force: true });

console.log("\n────────────────────────────────────────");
console.log(`  ${passes.length} passed · ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.error(`  ✗ ${f.name}: ${f.err?.message ?? f.err}`);
  process.exit(1);
}
console.log("All Phase-2 + Phase-4 unit contracts hold. ✓");
