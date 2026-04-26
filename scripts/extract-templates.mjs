#!/usr/bin/env node
/**
 * extract-templates.mjs
 *
 * One-shot Phase-5B migration:
 *   1. Imports the legacy in-code SYSTEM_TEMPLATES (from artifacts/api-server/src/seed.ts).
 *   2. Imports the structured SYSTEM_TEMPLATES_SOURCE (from artifacts/api-server/src/seed.templates.ts).
 *   3. Verifies the two are byte-equivalent JSON (drift-detection — fails the
 *      script with a diff if they disagree).
 *   4. Writes one file per template into `lib/n8n-nodes-catalog/templates/<slug>.json`
 *      plus a manifest at `lib/n8n-nodes-catalog/templates/_meta/manifest.json`.
 *   5. Re-runnable: idempotent (sha-checked overwrite, obsolete sweep, atomic rename).
 *
 * Run via:  npx --yes tsx scripts/extract-templates.mjs
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  unlinkSync,
  renameSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const DEST_DIR = join(ROOT, "lib", "n8n-nodes-catalog", "templates");
const META_DIR = join(DEST_DIR, "_meta");
const MANIFEST = join(META_DIR, "manifest.json");

function sha1(buf) {
  return createHash("sha1").update(buf).digest("hex");
}

function atomicWrite(path, contents) {
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}`;
  writeFileSync(tmp, contents);
  renameSync(tmp, path);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  const { SYSTEM_TEMPLATES } = await import(
    join(ROOT, "artifacts/api-server/src/seed.ts")
  );
  const { SYSTEM_TEMPLATES_SOURCE } = await import(
    join(ROOT, "artifacts/api-server/src/seed.templates.ts")
  );

  if (SYSTEM_TEMPLATES.length !== SYSTEM_TEMPLATES_SOURCE.length) {
    console.error(
      `template count mismatch: legacy=${SYSTEM_TEMPLATES.length}, source=${SYSTEM_TEMPLATES_SOURCE.length}`,
    );
    process.exit(2);
  }

  // legacy items have no .slug (we added it), so match by name (Arabic)
  const legacyByName = new Map(SYSTEM_TEMPLATES.map((t) => [t.name, t]));
  const drifts = [];
  for (const src of SYSTEM_TEMPLATES_SOURCE) {
    const legacy = legacyByName.get(src.name);
    if (!legacy) {
      drifts.push({ slug: src.slug, reason: `legacy template '${src.name}' not found` });
      continue;
    }
    // Compare every field except the synthetic `slug`
    const { slug: _slug, ...srcRest } = src;
    if (!deepEqual(legacy, srcRest)) {
      // Find which top-level field differs first for a useful message
      for (const k of Object.keys(srcRest)) {
        if (!deepEqual(legacy[k], srcRest[k])) {
          drifts.push({
            slug: src.slug,
            reason: `field '${k}' differs`,
            legacy: JSON.stringify(legacy[k]).slice(0, 200),
            source: JSON.stringify(srcRest[k]).slice(0, 200),
          });
          break;
        }
      }
    }
  }

  if (drifts.length > 0) {
    console.error("DRIFT DETECTED — refusing to write. Fix seed.templates.ts first:");
    for (const d of drifts) console.error("  -", d);
    process.exit(3);
  }

  mkdirSync(DEST_DIR, { recursive: true });
  mkdirSync(META_DIR, { recursive: true });

  const wantedFiles = new Set();
  const entries = {};
  let written = 0;
  let unchanged = 0;
  let obsolete = 0;

  for (const t of SYSTEM_TEMPLATES_SOURCE) {
    const fileName = `${t.slug}.json`;
    wantedFiles.add(fileName);
    const target = join(DEST_DIR, fileName);
    const json = JSON.stringify(t, null, 2) + "\n";
    const buf = Buffer.from(json, "utf8");
    const sha = sha1(buf);

    if (existsSync(target)) {
      const cur = readFileSync(target);
      if (sha1(cur) === sha) {
        unchanged++;
        entries[t.slug] = { file: fileName, sha, bytes: buf.length, name: t.name, nameEn: t.nameEn, category: t.category };
        continue;
      }
    }
    atomicWrite(target, buf);
    written++;
    entries[t.slug] = { file: fileName, sha, bytes: buf.length, name: t.name, nameEn: t.nameEn, category: t.category };
  }

  for (const f of readdirSync(DEST_DIR)) {
    if (f === "_meta") continue;
    if (!wantedFiles.has(f)) {
      unlinkSync(join(DEST_DIR, f));
      obsolete++;
    }
  }

  const manifest = {
    kind: "templates",
    version: 1,
    count: SYSTEM_TEMPLATES_SOURCE.length,
    updatedAt: new Date().toISOString(),
    entries,
  };
  atomicWrite(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  console.log(JSON.stringify({
    total: SYSTEM_TEMPLATES_SOURCE.length,
    written,
    unchanged,
    obsolete,
    driftFree: true,
    manifest: MANIFEST,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
