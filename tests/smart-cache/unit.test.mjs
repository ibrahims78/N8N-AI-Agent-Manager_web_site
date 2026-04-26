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
  const dir = path.join(tmpRoot, "guides", "_meta");
  const files = await fs.readdir(dir);
  const orphans = files.filter((f) => f.includes(".tmp."));
  assert.deepEqual(orphans, [], `unexpected orphan tmp files: ${orphans.join(", ")}`);
});

await test("corrupted manifest falls back to empty (does not throw)", async () => {
  const corruptDir = path.join(tmpRoot, "broken", "_meta");
  await fs.mkdir(corruptDir, { recursive: true });
  await fs.writeFile(path.join(corruptDir, "manifest.json"), "{ invalid json", "utf8");
  const m = await readManifest(tmpRoot, "broken");
  assert.equal(m.version, 1);
  assert.deepEqual(m.entries, {});
});

await fs.rm(tmpRoot, { recursive: true, force: true });

console.log("\n────────────────────────────────────────");
console.log(`  ${passes.length} passed · ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.error(`  ✗ ${f.name}: ${f.err?.message ?? f.err}`);
  process.exit(1);
}
console.log("All Phase-2 unit contracts hold. ✓");
