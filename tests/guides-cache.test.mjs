#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Integration tests for the guides smart-cache pipeline.
 *
 * Runs end-to-end against the live API server (default :8080) — no DB tampering,
 * no fixtures, no mock layer. Each test uses only the public REST/SSE surface
 * so it stays in sync with what real clients see.
 *
 * Run with the API workflow live:
 *   node tests/guides-cache.test.mjs
 *
 * Optional env overrides:
 *   API_BASE         default http://localhost:8080
 *   ADMIN_USERNAME   default admin
 *   ADMIN_PASSWORD   default 123456
 *   TEST_SLUG        default glossary   (any guide that exists in CORE_GUIDE_PAGES)
 *
 * Exit code 0 = all green; non-zero = at least one assertion failed.
 *
 * Tests covered:
 *   T-A  manualOverrideMarkdown survives a non-smart (force) re-fetch.
 *   T-B  manualOverrideMarkdown (AR) survives a smart refresh + translate.
 *   T-C  dryRun never mutates the DB and reports its mode honestly.
 *   T-D  Two consecutive smart refreshes: the second is a no-op (all unchanged).
 */

import assert from "node:assert/strict";

const API_BASE       = process.env.API_BASE       || "http://localhost:8080";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const TEST_SLUG      = process.env.TEST_SLUG      || "glossary";

let token = "";
const failures = [];
const passes   = [];

function step(name) { console.log(`\n── ${name} ─────────────────────────────────────`); }
function ok(msg)    { passes.push(msg);   console.log(`  ✓ ${msg}`); }
function fail(name, err) {
  failures.push({ name, err });
  console.log(`  ✗ ${name}: ${err?.message ?? err}`);
}

async function api(path, init = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    throw new Error(`${init.method || "GET"} ${path} → ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body;
}

/**
 * Drive the SSE refresh endpoint to completion and return the final `done`
 * event payload. Throws on `error` events or transport failures.
 */
async function runRefresh(query) {
  const url = `${API_BASE}/api/catalog/docs-advanced/guides/refresh-all?${query}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`refresh-all → ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let last = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop() || "";
    for (const ev of events) {
      const m = /^data:\s*(.+)$/m.exec(ev);
      if (!m) continue;
      const evt = JSON.parse(m[1]);
      if (evt.type === "error") throw new Error(`server emitted error: ${evt.error}`);
      if (evt.type === "done")  last = evt;
    }
  }
  if (!last) throw new Error("refresh-all completed without a `done` event");
  return last;
}

async function login() {
  step("Login");
  const r = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  token = r?.data?.accessToken || r?.data?.token || r?.token;
  assert.ok(token, "expected JWT token in /auth/login response");
  ok(`logged in as ${ADMIN_USERNAME}`);
}

async function setOverride(lang, markdown) {
  return api(`/api/catalog/docs-advanced/guides/${TEST_SLUG}/manual?lang=${lang}`, {
    method: "PUT",
    body: JSON.stringify({ markdown }),
  });
}

async function clearOverride(lang) {
  // DELETE may 404 if no override exists; that's fine for cleanup.
  try {
    await api(`/api/catalog/docs-advanced/guides/${TEST_SLUG}/manual?lang=${lang}`, { method: "DELETE" });
  } catch { /* ignore */ }
}

async function readGuide(lang) {
  return api(`/api/catalog/docs-advanced/guides/${TEST_SLUG}?lang=${lang}`);
}

async function statsCount() {
  const r = await api("/api/catalog/docs-advanced/guides/stats");
  return r?.data ?? r; // {total, en, ar, overrides, lastUpdated}
}

/* ─────────────────────────────────────────────────────────────────── */

async function testA_overrideSurvivesForceRefresh() {
  step("T-A · manualOverrideMarkdown (EN) survives force refresh");
  const sentinel = `__TEST_A_${Date.now()}__\n\nThis text must survive a force refresh.`;
  try {
    await setOverride("en", sentinel);
    const before = await readGuide("en");
    assert.equal(before?.data?.manualOverrideMarkdown, sentinel, "override should be set");

    const summary = await runRefresh("force=true&translate=false");
    assert.ok(summary.fetched > 0, "expected at least one EN fetch");

    const after = await readGuide("en");
    assert.equal(
      after?.data?.manualOverrideMarkdown, sentinel,
      "manualOverrideMarkdown was overwritten by a force refresh — REGRESSION",
    );
    // And the upstream markdown column itself MUST have been (re)written.
    assert.ok(
      after?.data?.markdown && after.data.markdown.length > 50,
      "expected upstream `markdown` column to remain non-empty after force refresh",
    );
    ok("EN manual override preserved across force refresh");
  } catch (err) {
    fail("T-A", err);
  } finally {
    await clearOverride("en");
  }
}

async function testB_overrideSurvivesSmartTranslate() {
  step("T-B · manualOverrideMarkdown (AR) survives smart refresh + translate");
  const sentinel = `__TEST_B_${Date.now()}__\n\nهذا نص يدوي يجب ألّا يُمسح.`;
  try {
    await setOverride("ar", sentinel);
    const before = await readGuide("ar");
    assert.equal(before?.data?.manualOverrideMarkdown, sentinel, "AR override should be set");

    const summary = await runRefresh("smart=true&translate=true");
    assert.equal(summary.smart, true, "expected smart=true in summary");

    const after = await readGuide("ar");
    assert.equal(
      after?.data?.manualOverrideMarkdown, sentinel,
      "AR manualOverrideMarkdown was overwritten by smart refresh — REGRESSION",
    );
    ok("AR manual override preserved across smart refresh + translate");
  } catch (err) {
    fail("T-B", err);
  } finally {
    await clearOverride("ar");
  }
}

async function testC_dryRunMutatesNothing() {
  step("T-C · dryRun never writes to DB");
  try {
    const statsBefore = await statsCount();
    const sumDry = await runRefresh("smart=true&translate=true&dryRun=true");

    assert.equal(sumDry.smart,  true,  "dry-run should still report smart=true");
    assert.equal(sumDry.dryRun, true,  "dry-run should report dryRun=true");
    // Bucket totals must add up to `total` for both EN and AR (when translate=true).
    const enSum = (sumDry.enAdded ?? 0) + (sumDry.enUpdated ?? 0) + (sumDry.enUnchanged ?? 0) + (sumDry.failed ?? 0);
    assert.equal(enSum, sumDry.total, `EN buckets sum (${enSum}) must equal total (${sumDry.total})`);
    const arSum = (sumDry.arAdded ?? 0) + (sumDry.arUpdated ?? 0) + (sumDry.arUnchanged ?? 0) + (sumDry.translateFailed ?? 0);
    assert.equal(arSum, sumDry.total, `AR buckets sum (${arSum}) must equal total (${sumDry.total})`);

    const statsAfter = await statsCount();
    assert.equal(statsBefore.en,        statsAfter.en,        "EN row count changed during dry-run");
    assert.equal(statsBefore.ar,        statsAfter.ar,        "AR row count changed during dry-run");
    assert.equal(statsBefore.overrides, statsAfter.overrides, "override count changed during dry-run");

    ok(`dry-run reported ${sumDry.enAdded ?? 0}+${sumDry.enUpdated ?? 0}/${sumDry.total} EN, ${sumDry.arAdded ?? 0}+${sumDry.arUpdated ?? 0}/${sumDry.total} AR — DB untouched`);
  } catch (err) {
    fail("T-C", err);
  }
}

async function testD_secondSmartRefreshIsNoOp() {
  step("T-D · two smart refreshes back-to-back; second writes nothing");
  try {
    // Prime: ensure everything is on disk + DB.
    await runRefresh("smart=true&translate=false");

    // Now: a second smart EN-only run should report ALL items as unchanged.
    const sum = await runRefresh("smart=true&translate=false");
    assert.equal(sum.smart, true, "expected smart=true");
    const changed = (sum.enAdded ?? 0) + (sum.enUpdated ?? 0);
    assert.equal(
      changed, 0,
      `expected 0 EN changes on the second run, got ${changed} (added=${sum.enAdded}, updated=${sum.enUpdated})`,
    );
    assert.ok(
      (sum.enUnchanged ?? 0) > 0,
      `expected enUnchanged > 0 on the second run (got ${sum.enUnchanged})`,
    );
    ok(`second run: 0 written, ${sum.enUnchanged} unchanged ⇒ smart cache is honoured`);
  } catch (err) {
    fail("T-D", err);
  }
}

/* ─────────────────────────────────────────────────────────────────── */

(async () => {
  const t0 = Date.now();
  try {
    await login();
    await testA_overrideSurvivesForceRefresh();
    await testB_overrideSurvivesSmartTranslate();
    await testC_dryRunMutatesNothing();
    await testD_secondSmartRefreshIsNoOp();
  } catch (err) {
    fail("bootstrap", err);
  }
  const ms = Date.now() - t0;
  console.log(`\n──────────────────────────────────────────────────────`);
  console.log(`  ${passes.length} passed · ${failures.length} failed · ${(ms / 1000).toFixed(1)}s`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  ✗ ${f.name}: ${f.err?.message ?? f.err}`);
    process.exit(1);
  }
  console.log("\nAll guide-cache contracts hold. ✓");
})();
