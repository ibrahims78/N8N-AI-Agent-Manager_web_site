/**
 * docsAdvanced.service.ts
 * يحتوي كل ميزات تطوير نظام التوثيقات الاحترافية في مكان واحد:
 *  1. البحث الشامل (Global full-text + ranked search across all node docs)
 *  2. RAG محسَّن (BM25 sectional ranking)
 *  3. توثيقات n8n العامة (Glossary, Hosting, Workflows, Expressions ...)
 *  4. مزامنة دورية تلقائية مع كشف التغييرات عبر sourceSha
 *  5. تحرير محلي للترجمات (manual override)
 *  6. الإصدارات (history snapshot + rollback)
 *  7. استخراج Operations (Sub-nodes) لكل عقدة
 *  8. تصدير PDF / Markdown مجمَّع
 */
import crypto from "crypto";
import { db } from "@workspace/db";
import {
  nodeCatalogTable,
  nodeDocsTable,
  nodeDocsHistoryTable,
  nodeDocSectionsTable,
  guidesDocsTable,
  docsSyncSettingsTable,
} from "@workspace/db";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";
import {
  parseSections,
  tokenize,
  buildTermVector,
  bm25Score,
  extractOperations,
  type Operation,
} from "./docsHelpers";
import {
  getEnglishDoc,
  getArabicDoc,
  bulkFetchEnglishDocs,
  bulkTranslateArabicDocs,
  translateMarkdownToArabic,
  type DocLang,
} from "./nodeDocs.service";
import path from "path";
import { promises as fs } from "fs";

const DOCS_REPO_RAW = "https://raw.githubusercontent.com/n8n-io/n8n-docs/main";

/** المجلد المحلّي لحفظ نُسخ الأدلة (مثل توثيقات العقد). */
const LOCAL_GUIDES_DIR = path.resolve(process.cwd(), "../../lib/n8n-nodes-catalog/guides");

async function saveGuideToFile(slug: string, lang: DocLang, markdown: string): Promise<void> {
  const dir = path.join(LOCAL_GUIDES_DIR, lang);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${slug}.md`), markdown, "utf-8");
}

async function loadGuideFromFile(slug: string, lang: DocLang): Promise<string | null> {
  try {
    return await fs.readFile(path.join(LOCAL_GUIDES_DIR, lang, `${slug}.md`), "utf-8");
  } catch {
    return null;
  }
}

export async function getLocalGuideFilesStats(): Promise<{ en: number; ar: number }> {
  async function countDir(lang: DocLang): Promise<number> {
    try {
      const dir = path.join(LOCAL_GUIDES_DIR, lang);
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith(".md")).length;
    } catch {
      return 0;
    }
  }
  const [en, ar] = await Promise.all([countDir("en"), countDir("ar")]);
  return { en, ar };
}

/* ═══════════════════════════════════════════════════════════════════
   1+9. البحث الشامل عبر كل التوثيقات (Global Search)
   ═══════════════════════════════════════════════════════════════════ */

export interface GlobalSearchHit {
  nodeType: string;
  language: DocLang;
  sectionTitle: string;
  sectionPath: string;
  snippet: string;
  score: number;
}

/**
 * بحث شامل في كل أقسام التوثيقات المخزَّنة، مع ترتيب BM25.
 * يستخدم جدول node_doc_sections (مُعاد بناؤه عند كل refresh).
 */
export async function globalDocsSearch(
  query: string,
  language: DocLang | "any" = "en",
  limit = 20
): Promise<GlobalSearchHit[]> {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // First try the requested language. If that has no rows (e.g. AR not yet
  // translated), automatically fall back to ALL languages so the user always
  // gets relevant hits — Arabic UI users can still search the English corpus.
  let sections = language === "any"
    ? await db.select().from(nodeDocSectionsTable)
    : await db.select().from(nodeDocSectionsTable).where(eq(nodeDocSectionsTable.language, language));

  if (sections.length === 0 && language !== "any") {
    sections = await db.select().from(nodeDocSectionsTable);
  }
  if (sections.length === 0) return [];

  // Compute IDF
  const df: Record<string, number> = {};
  for (const s of sections) {
    const tv = JSON.parse(s.termVectorJson) as Record<string, number>;
    for (const t of Object.keys(tv)) df[t] = (df[t] || 0) + 1;
  }
  const N = sections.length;
  const idf: Record<string, number> = {};
  for (const t of queryTokens) {
    const dft = df[t] || 0;
    idf[t] = Math.log(1 + (N - dft + 0.5) / (dft + 0.5));
  }
  const avgDocLen =
    sections.reduce((acc, s) => acc + s.tokenCount, 0) / Math.max(sections.length, 1);

  const hits: GlobalSearchHit[] = sections
    .map((s) => {
      const tv = JSON.parse(s.termVectorJson) as Record<string, number>;
      const score = bm25Score(tv, s.tokenCount, avgDocLen, queryTokens, idf);
      return {
        nodeType: s.nodeType,
        language: s.language as DocLang,
        sectionTitle: s.sectionTitle,
        sectionPath: s.sectionPath,
        snippet: makeSnippet(s.body, queryTokens),
        score,
      };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return hits;
}

function makeSnippet(body: string, queryTokens: string[]): string {
  const lower = body.toLowerCase();
  let bestIdx = -1;
  for (const t of queryTokens) {
    const i = lower.indexOf(t);
    if (i >= 0) {
      bestIdx = bestIdx < 0 ? i : Math.min(bestIdx, i);
    }
  }
  if (bestIdx < 0) bestIdx = 0;
  const start = Math.max(0, bestIdx - 80);
  const end = Math.min(body.length, bestIdx + 280);
  let snippet = body.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < body.length) snippet += "…";
  return snippet;
}

/* ═══════════════════════════════════════════════════════════════════
   2. إعادة بناء فهرس الأقسام (sectional index) لعقدة
   ═══════════════════════════════════════════════════════════════════ */

export async function reindexNodeSections(
  nodeType: string,
  language: DocLang,
  markdown: string
): Promise<number> {
  const sections = parseSections(markdown);
  // امسح الفهرس القديم لهذه العقدة + اللغة
  await db
    .delete(nodeDocSectionsTable)
    .where(
      and(
        eq(nodeDocSectionsTable.nodeType, nodeType),
        eq(nodeDocSectionsTable.language, language)
      )
    );
  if (sections.length === 0) return 0;
  const rows = sections.map((s) => {
    const fullText = `${s.title}\n${s.body}`;
    const tokens = tokenize(fullText);
    const tv = buildTermVector(tokens);
    return {
      nodeType,
      language,
      sectionIdx: s.index,
      sectionTitle: s.title.slice(0, 200),
      sectionPath: s.path.slice(0, 500),
      body: s.body,
      tokenCount: tokens.length,
      termVectorJson: JSON.stringify(tv),
    };
  });
  // Bulk insert in chunks
  for (let i = 0; i < rows.length; i += 50) {
    await db.insert(nodeDocSectionsTable).values(rows.slice(i, i + 50));
  }
  return rows.length;
}

/** إعادة بناء كل الفهارس من توثيقات DB الحالية (one-shot). */
export async function reindexAllSections(language?: DocLang): Promise<number> {
  const where = language ? eq(nodeDocsTable.language, language) : undefined;
  const docs = await db
    .select({
      nodeType: nodeDocsTable.nodeType,
      language: nodeDocsTable.language,
      markdown: nodeDocsTable.markdown,
      manualOverrideMarkdown: nodeDocsTable.manualOverrideMarkdown,
    })
    .from(nodeDocsTable)
    .where(where as never);
  let total = 0;
  for (const d of docs) {
    const md = d.manualOverrideMarkdown || d.markdown;
    if (!md) continue;
    total += await reindexNodeSections(d.nodeType, d.language as DocLang, md);
  }
  logger.info({ total, count: docs.length }, "Reindex all sections complete");
  return total;
}

/* ═══════════════════════════════════════════════════════════════════
   3. توثيقات n8n العامة (Glossary, Hosting, Workflows, …)
   ═══════════════════════════════════════════════════════════════════ */

export interface GuidePage {
  slug: string;
  category: string;
  title: string;
  /** المسار النسبي داخل مستودع n8n-docs (بدون docs/ ولا .md). */
  path: string;
}

/** لائحة الصفحات العامة الأساسية التي نريد جلبها. */
export const CORE_GUIDE_PAGES: GuidePage[] = [
  { slug: "glossary", category: "glossary", title: "Glossary", path: "glossary" },
  { slug: "workflows-components", category: "workflows", title: "Workflow components", path: "workflows/components" },
  { slug: "workflows-create", category: "workflows", title: "Create a workflow", path: "workflows/create" },
  { slug: "workflows-executions", category: "workflows", title: "Workflow executions", path: "workflows/executions" },
  { slug: "workflows-error-handling", category: "workflows", title: "Error handling", path: "flow-logic/error-handling" },
  { slug: "expressions-overview", category: "expressions", title: "Expressions overview", path: "code/expressions" },
  { slug: "expressions-builtin", category: "expressions", title: "Built-in methods and variables", path: "code/builtin/overview" },
  { slug: "expressions-data-transformation", category: "expressions", title: "Data transformation functions", path: "code/builtin/data-transformation-functions" },
  { slug: "code-javascript", category: "expressions", title: "JavaScript Code node", path: "code/code-node" },
  { slug: "credentials-overview", category: "credentials", title: "Credentials overview", path: "credentials" },
  { slug: "hosting-installation", category: "hosting", title: "Installation overview", path: "hosting/installation/server-setups" },
  { slug: "hosting-configuration", category: "hosting", title: "Configuration", path: "hosting/configuration/configuration-methods" },
  { slug: "hosting-environment-variables", category: "hosting", title: "Environment variables", path: "hosting/configuration/environment-variables" },
  { slug: "hosting-scaling", category: "hosting", title: "Scaling n8n", path: "hosting/scaling/overview" },
  { slug: "hosting-security", category: "hosting", title: "Security", path: "hosting/securing/overview" },
  { slug: "api-overview", category: "api", title: "n8n public API", path: "api" },
  { slug: "api-authentication", category: "api", title: "API authentication", path: "api/authentication" },
];

async function fetchRawWithSha(url: string): Promise<{ markdown: string; sha: string } | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    const text = await r.text();
    if (!text || text.length < 10) return null;
    const sha = crypto.createHash("sha1").update(text).digest("hex");
    return { markdown: text, sha };
  } catch {
    return null;
  }
}

/** نسخة مبسَّطة لـ MkDocs cleanup (مكرَّرة لتفادي الدورة بين الخدمات). */
function cleanGuideMarkdown(md: string): string {
  return md
    .replace(/\[\[.*?\]\]/gs, "")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchGuide(slug: string, force = false): Promise<GuidesDoc | null> {
  const meta = CORE_GUIDE_PAGES.find((g) => g.slug === slug);
  if (!meta) return null;

  if (!force) {
    const cached = (
      await db
        .select()
        .from(guidesDocsTable)
        .where(and(eq(guidesDocsTable.slug, slug), eq(guidesDocsTable.language, "en")))
        .limit(1)
    )[0];
    if (cached?.markdown) return cached;
  }

  const candidates = [
    `${DOCS_REPO_RAW}/docs/${meta.path}.md`,
    `${DOCS_REPO_RAW}/docs/${meta.path}/index.md`,
  ];
  let result: { markdown: string; sha: string; sourceUrl: string } | null = null;
  for (const u of candidates) {
    const r = await fetchRawWithSha(u);
    if (r) {
      result = { markdown: cleanGuideMarkdown(r.markdown), sha: r.sha, sourceUrl: u };
      break;
    }
  }

  const inserted = await db
    .insert(guidesDocsTable)
    .values({
      slug,
      language: "en",
      title: meta.title,
      category: meta.category,
      markdown: result?.markdown ?? null,
      sourceUrl: result?.sourceUrl ?? null,
      sourceSha: result?.sha ?? null,
      error: result ? null : "Guide not found",
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [guidesDocsTable.slug, guidesDocsTable.language],
      set: {
        title: meta.title,
        category: meta.category,
        markdown: result?.markdown ?? null,
        sourceUrl: result?.sourceUrl ?? null,
        sourceSha: result?.sha ?? null,
        error: result ? null : "Guide not found",
        fetchedAt: new Date(),
      },
    })
    .returning();

  // Persist EN to local file mirror so guides survive DB resets and can be
  // diff'd / shipped with the repo (mirrors the per-node docs convention).
  if (result?.markdown) {
    try {
      await saveGuideToFile(slug, "en", result.markdown);
    } catch (err) {
      logger.warn({ err, slug }, "Failed to save EN guide to local file");
    }
  }

  return inserted[0];
}

/**
 * Get the Arabic translation of a guide. Translates on-demand from EN if
 * missing. Persists to DB + local file. Mirrors getArabicDoc() for nodes.
 */
export async function fetchArabicGuide(slug: string, force = false): Promise<GuidesDoc | null> {
  const meta = CORE_GUIDE_PAGES.find((g) => g.slug === slug);
  if (!meta) return null;

  if (!force) {
    const cached = (
      await db
        .select()
        .from(guidesDocsTable)
        .where(and(eq(guidesDocsTable.slug, slug), eq(guidesDocsTable.language, "ar")))
        .limit(1)
    )[0];
    if (cached?.markdown) return cached;
  }

  // Need the EN source first (fetch if not present).
  const en = await fetchGuide(slug, false);
  if (!en?.markdown) {
    return null;
  }

  let translated: string | null = null;
  let errorMsg: string | null = null;
  try {
    translated = await translateMarkdownToArabic(en.markdown);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    logger.warn({ err, slug }, "Arabic guide translation failed");
  }

  const inserted = await db
    .insert(guidesDocsTable)
    .values({
      slug,
      language: "ar",
      title: meta.title,
      category: meta.category,
      markdown: translated,
      sourceUrl: en.sourceUrl,
      sourceSha: en.sourceSha,
      error: errorMsg,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [guidesDocsTable.slug, guidesDocsTable.language],
      set: {
        title: meta.title,
        category: meta.category,
        markdown: translated,
        sourceUrl: en.sourceUrl,
        sourceSha: en.sourceSha,
        error: errorMsg,
        fetchedAt: new Date(),
      },
    })
    .returning();

  if (translated) {
    try {
      await saveGuideToFile(slug, "ar", translated);
    } catch (err) {
      logger.warn({ err, slug }, "Failed to save AR guide to local file");
    }
  }
  return inserted[0];
}

/**
 * Bulk-fetch guides. When `translate=true`, also produces Arabic translations
 * for every successfully-fetched guide (translation runs in parallel, bounded).
 */
export async function fetchAllGuides(
  force = false,
  onProgress?: (p: { total: number; done: number; current: string; phase?: "fetch" | "translate" }) => void,
  opts: { translate?: boolean; concurrency?: number } = {}
): Promise<{ total: number; fetched: number; failed: number; translated: number; translateFailed: number }> {
  const total = CORE_GUIDE_PAGES.length;
  let fetched = 0;
  let failed = 0;
  let translated = 0;
  let translateFailed = 0;

  // Phase 1: fetch all English guides (sequential — GitHub raw is fast and we
  // want deterministic progress events).
  for (let i = 0; i < CORE_GUIDE_PAGES.length; i++) {
    const g = CORE_GUIDE_PAGES[i];
    onProgress?.({ total, done: i, current: g.slug, phase: "fetch" });
    try {
      const r = await fetchGuide(g.slug, force);
      if (r?.markdown) fetched++;
      else failed++;
    } catch (err) {
      failed++;
      logger.warn({ err, slug: g.slug }, "fetch guide failed");
    }
  }
  onProgress?.({ total, done: total, current: "", phase: "fetch" });

  // Phase 2 (optional): translate each fetched guide to Arabic, in parallel.
  if (opts.translate) {
    const concurrency = opts.concurrency ?? 4;
    const targets = CORE_GUIDE_PAGES.map((g) => g.slug);
    let idx = 0;
    let done = 0;
    onProgress?.({ total, done: 0, current: "", phase: "translate" });

    let lastErrorMsg = "";
    const worker = async () => {
      while (idx < targets.length) {
        const i = idx++;
        const slug = targets[i];
        try {
          const r = await fetchArabicGuide(slug, force);
          if (r?.markdown) translated++;
          else translateFailed++;
        } catch (err) {
          translateFailed++;
          lastErrorMsg = err instanceof Error ? err.message : String(err);
          logger.warn({ err, slug }, "translate guide failed");
        }
        done++;
        onProgress?.({ total, done, current: slug, phase: "translate" });
      }
    };
    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    onProgress?.({ total, done: total, current: "", phase: "translate" });
    // Surface a friendly flag the UI can show as a single big banner instead
    // of N identical toasts.
    const aiKeyMissing = /لا يوجد مفتاح AI|no ai key|api key/i.test(lastErrorMsg);
    return { total, fetched, failed, translated, translateFailed, aiKeyMissing, lastErrorMsg };
  }

  return { total, fetched, failed, translated, translateFailed, aiKeyMissing: false, lastErrorMsg: "" };
}

export async function listGuides(language: DocLang = "en") {
  const rows = await db
    .select({
      slug: guidesDocsTable.slug,
      title: guidesDocsTable.title,
      category: guidesDocsTable.category,
      hasMarkdown: sql<boolean>`(${guidesDocsTable.markdown} IS NOT NULL OR ${guidesDocsTable.manualOverrideMarkdown} IS NOT NULL)`,
      hasOverride: sql<boolean>`(${guidesDocsTable.manualOverrideMarkdown} IS NOT NULL)`,
      length: sql<number>`coalesce(length(${guidesDocsTable.manualOverrideMarkdown}), length(${guidesDocsTable.markdown}), 0)`,
      sourceUrl: guidesDocsTable.sourceUrl,
      error: guidesDocsTable.error,
      fetchedAt: guidesDocsTable.fetchedAt,
      updatedAt: guidesDocsTable.updatedAt,
    })
    .from(guidesDocsTable)
    .where(eq(guidesDocsTable.language, language));
  // Stable order: by category, then by title for predictable UI.
  return rows.sort((a, b) =>
    a.category === b.category
      ? a.title.localeCompare(b.title)
      : a.category.localeCompare(b.category)
  );
}

/** Lightweight stats for the header (counts EN/AR coverage + overrides). */
export async function getGuidesStats(): Promise<{
  total: number;
  en: number;
  ar: number;
  overrides: number;
  lastUpdated: Date | null;
}> {
  const total = CORE_GUIDE_PAGES.length;
  const rows = await db
    .select({
      language: guidesDocsTable.language,
      hasMarkdown: sql<boolean>`(${guidesDocsTable.markdown} IS NOT NULL OR ${guidesDocsTable.manualOverrideMarkdown} IS NOT NULL)`,
      hasOverride: sql<boolean>`(${guidesDocsTable.manualOverrideMarkdown} IS NOT NULL)`,
      updatedAt: guidesDocsTable.updatedAt,
    })
    .from(guidesDocsTable);
  let en = 0, ar = 0, overrides = 0;
  let lastUpdated: Date | null = null;
  for (const r of rows) {
    if (r.hasMarkdown) {
      if (r.language === "en") en++;
      else if (r.language === "ar") ar++;
    }
    if (r.hasOverride) overrides++;
    if (r.updatedAt && (!lastUpdated || r.updatedAt > lastUpdated)) lastUpdated = r.updatedAt;
  }
  return { total, en, ar, overrides, lastUpdated };
}

export async function getGuide(slug: string, language: DocLang = "en") {
  const row = (
    await db
      .select()
      .from(guidesDocsTable)
      .where(and(eq(guidesDocsTable.slug, slug), eq(guidesDocsTable.language, language)))
      .limit(1)
  )[0];
  if (!row) return undefined;
  // Effective markdown = manual override (if any) wins over the raw fetch/translation.
  const effectiveMarkdown = row.manualOverrideMarkdown ?? row.markdown;
  return { ...row, effectiveMarkdown, markdown: effectiveMarkdown };
}

/**
 * Save a manual edit for a guide. Mostly used for the AR translation so admins
 * can polish wording. Stored separately from the auto-fetched markdown so a
 * future re-fetch never overwrites human edits.
 */
export async function setGuideManualOverride(
  slug: string,
  language: DocLang,
  markdown: string,
  userId: number,
  note?: string
): Promise<{ success: boolean }> {
  const meta = CORE_GUIDE_PAGES.find((g) => g.slug === slug);
  if (!meta) return { success: false };
  const cur = (
    await db
      .select()
      .from(guidesDocsTable)
      .where(and(eq(guidesDocsTable.slug, slug), eq(guidesDocsTable.language, language)))
      .limit(1)
  )[0];
  if (!cur) {
    await db.insert(guidesDocsTable).values({
      slug,
      language,
      title: meta.title,
      category: meta.category,
      markdown: null,
      manualOverrideMarkdown: markdown,
      manualOverrideAt: new Date(),
      manualOverrideBy: userId,
      manualOverrideNote: note ?? null,
    });
  } else {
    await db
      .update(guidesDocsTable)
      .set({
        manualOverrideMarkdown: markdown,
        manualOverrideAt: new Date(),
        manualOverrideBy: userId,
        manualOverrideNote: note ?? null,
        error: null,
      })
      .where(eq(guidesDocsTable.id, cur.id));
  }
  // Mirror to local file so manual edits also persist on disk.
  try {
    await saveGuideToFile(slug, language, markdown);
  } catch (err) {
    logger.warn({ err, slug, language }, "Failed to save guide override to file");
  }
  return { success: true };
}

export async function clearGuideManualOverride(
  slug: string,
  language: DocLang
): Promise<{ success: boolean }> {
  const cur = (
    await db
      .select()
      .from(guidesDocsTable)
      .where(and(eq(guidesDocsTable.slug, slug), eq(guidesDocsTable.language, language)))
      .limit(1)
  )[0];
  if (!cur) return { success: false };
  await db
    .update(guidesDocsTable)
    .set({
      manualOverrideMarkdown: null,
      manualOverrideAt: null,
      manualOverrideBy: null,
      manualOverrideNote: null,
    })
    .where(eq(guidesDocsTable.id, cur.id));
  // Re-mirror the upstream markdown to file (keeps disk consistent with DB).
  if (cur.markdown) {
    try {
      await saveGuideToFile(slug, language, cur.markdown);
    } catch {}
  }
  return { success: true };
}

/**
 * Full-text search across guide bodies (case-insensitive substring with rank
 * by hit count). Returns snippets ready for UI display.
 */
export interface GuideSearchHit {
  slug: string;
  title: string;
  category: string;
  snippet: string;
  hits: number;
}

export async function searchGuides(
  query: string,
  language: DocLang = "en",
  limit = 25
): Promise<GuideSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await db
    .select({
      slug: guidesDocsTable.slug,
      title: guidesDocsTable.title,
      category: guidesDocsTable.category,
      markdown: guidesDocsTable.markdown,
      override: guidesDocsTable.manualOverrideMarkdown,
    })
    .from(guidesDocsTable)
    .where(eq(guidesDocsTable.language, language));

  const needle = q.toLowerCase();
  const out: GuideSearchHit[] = [];
  for (const r of rows) {
    const body = (r.override ?? r.markdown ?? "").toString();
    if (!body) continue;
    const hay = body.toLowerCase();
    let count = 0;
    let idx = 0;
    while ((idx = hay.indexOf(needle, idx)) !== -1) {
      count++;
      idx += needle.length;
      if (count > 50) break;
    }
    const titleMatch = r.title.toLowerCase().includes(needle);
    if (count === 0 && !titleMatch) continue;
    // Snippet around first hit.
    const firstIdx = hay.indexOf(needle);
    let snippet = "";
    if (firstIdx >= 0) {
      const start = Math.max(0, firstIdx - 80);
      const end = Math.min(body.length, firstIdx + 200);
      snippet = (start > 0 ? "…" : "") + body.slice(start, end).replace(/\s+/g, " ").trim() + (end < body.length ? "…" : "");
    } else {
      snippet = body.slice(0, 200).replace(/\s+/g, " ").trim() + (body.length > 200 ? "…" : "");
    }
    out.push({
      slug: r.slug,
      title: r.title,
      category: r.category,
      snippet,
      hits: titleMatch ? count + 5 : count, // boost title matches
    });
  }
  return out.sort((a, b) => b.hits - a.hits).slice(0, limit);
}

type GuidesDoc = typeof guidesDocsTable.$inferSelect;

/* ═══════════════════════════════════════════════════════════════════
   4. مزامنة دورية تلقائية (Periodic Auto-Sync)
   ═══════════════════════════════════════════════════════════════════ */

let syncIntervalHandle: NodeJS.Timeout | null = null;

export async function getSyncSettings() {
  let row = (await db.select().from(docsSyncSettingsTable).limit(1))[0];
  if (!row) {
    [row] = await db.insert(docsSyncSettingsTable).values({}).returning();
  }
  return row;
}

export async function updateSyncSettings(input: {
  enabled?: boolean;
  intervalHours?: number;
  autoTranslate?: boolean;
}) {
  const cur = await getSyncSettings();
  const next = {
    enabled: input.enabled ?? cur.enabled,
    intervalHours: Math.min(Math.max(input.intervalHours ?? cur.intervalHours, 1), 24 * 30),
    autoTranslate: input.autoTranslate ?? cur.autoTranslate,
    nextRunAt: input.enabled === false ? null : computeNextRun(input.intervalHours ?? cur.intervalHours),
  };
  await db.update(docsSyncSettingsTable).set(next).where(eq(docsSyncSettingsTable.id, cur.id));
  setupSyncScheduler();
  return getSyncSettings();
}

function computeNextRun(intervalHours: number): Date {
  return new Date(Date.now() + intervalHours * 3600 * 1000);
}

/** يفحص التغييرات على GitHub باستخدام sourceSha المخزَّن، ويعيد جلب ما تغيَّر فقط. */
export async function runAutoSync(): Promise<{
  total: number;
  changed: number;
  fetched: number;
  failed: number;
  translated: number;
}> {
  const settings = await getSyncSettings();
  await db
    .update(docsSyncSettingsTable)
    .set({ lastRunAt: new Date() })
    .where(eq(docsSyncSettingsTable.id, settings.id));

  // 1. اجلب كل الـ EN docs الحالية مع shas المخزنة
  const existing = await db
    .select({
      nodeType: nodeDocsTable.nodeType,
      sourceUrl: nodeDocsTable.sourceUrl,
      sourceSha: nodeDocsTable.sourceSha,
    })
    .from(nodeDocsTable)
    .where(eq(nodeDocsTable.language, "en"));

  const result = { total: existing.length, changed: 0, fetched: 0, failed: 0, translated: 0 };
  const changedNodeTypes: string[] = [];

  // 2. ادفع HEAD للـ raw URLs بشكل خفيف (HEAD على raw يعطي ETag)
  for (const e of existing) {
    if (!e.sourceUrl) continue;
    try {
      const r = await fetch(e.sourceUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(8000),
      });
      const etag = r.headers.get("etag")?.replace(/"/g, "");
      if (!etag) continue;
      if (etag !== e.sourceSha) {
        changedNodeTypes.push(e.nodeType);
      }
    } catch {
      // ignore
    }
  }

  result.changed = changedNodeTypes.length;

  // 3. أعد جلب المتغيِّر فقط
  for (const nt of changedNodeTypes) {
    try {
      const r = await getEnglishDoc(nt, true);
      if (r.markdown) {
        result.fetched++;
        if (settings.autoTranslate) {
          try {
            const t = await getArabicDoc(nt, true);
            if (t.markdown) result.translated++;
          } catch {}
        }
      } else {
        result.failed++;
      }
    } catch {
      result.failed++;
    }
  }

  await db
    .update(docsSyncSettingsTable)
    .set({
      lastRunStatus: result.failed === 0 ? "success" : result.fetched > 0 ? "partial" : "failed",
      lastRunSummary: JSON.stringify(result),
      nextRunAt: settings.enabled ? computeNextRun(settings.intervalHours) : null,
    })
    .where(eq(docsSyncSettingsTable.id, settings.id));

  logger.info(result, "Auto-sync completed");
  return result;
}

export function setupSyncScheduler() {
  if (syncIntervalHandle) {
    clearInterval(syncIntervalHandle);
    syncIntervalHandle = null;
  }
  // فحص كل 10 دقائق إن كان هناك مزامنة مستحقة
  syncIntervalHandle = setInterval(async () => {
    try {
      const s = await getSyncSettings();
      if (!s.enabled) return;
      const now = Date.now();
      if (s.nextRunAt && new Date(s.nextRunAt).getTime() <= now) {
        logger.info("Auto-sync due — running");
        await runAutoSync();
      }
    } catch (err) {
      logger.warn({ err }, "Sync scheduler tick failed");
    }
  }, 10 * 60 * 1000);
  // تشغيل أول خلال 30 ثانية بعد الإقلاع
  setTimeout(async () => {
    try {
      const s = await getSyncSettings();
      if (s.enabled && s.nextRunAt && new Date(s.nextRunAt).getTime() <= Date.now()) {
        await runAutoSync();
      }
    } catch {}
  }, 30_000);
}

/* ═══════════════════════════════════════════════════════════════════
   5. تحرير محلي للترجمات (Manual Override)
   ═══════════════════════════════════════════════════════════════════ */

export async function setManualOverride(
  nodeType: string,
  language: DocLang,
  markdown: string,
  userId: number,
  note?: string
) {
  // خزِّن نسخة من الحالي قبل الكتابة
  const cur = (
    await db
      .select()
      .from(nodeDocsTable)
      .where(and(eq(nodeDocsTable.nodeType, nodeType), eq(nodeDocsTable.language, language)))
      .limit(1)
  )[0];
  if (cur) {
    await db.insert(nodeDocsHistoryTable).values({
      nodeType,
      language,
      markdown: cur.manualOverrideMarkdown || cur.markdown,
      sourceUrl: cur.sourceUrl,
      changeType: "manual_edit",
      changedBy: userId,
      note: note ?? null,
    });
  }
  // اكتب الـ override
  if (!cur) {
    await db.insert(nodeDocsTable).values({
      nodeType,
      language,
      markdown: null,
      manualOverrideMarkdown: markdown,
      manualOverrideAt: new Date(),
      manualOverrideBy: userId,
    });
  } else {
    await db
      .update(nodeDocsTable)
      .set({
        manualOverrideMarkdown: markdown,
        manualOverrideAt: new Date(),
        manualOverrideBy: userId,
      })
      .where(eq(nodeDocsTable.id, cur.id));
  }
  // أعد فهرسة الأقسام
  await reindexNodeSections(nodeType, language, markdown);
  return { success: true };
}

export async function clearManualOverride(
  nodeType: string,
  language: DocLang,
  userId: number
) {
  const cur = (
    await db
      .select()
      .from(nodeDocsTable)
      .where(and(eq(nodeDocsTable.nodeType, nodeType), eq(nodeDocsTable.language, language)))
      .limit(1)
  )[0];
  if (!cur) return { success: false };
  if (cur.manualOverrideMarkdown) {
    await db.insert(nodeDocsHistoryTable).values({
      nodeType,
      language,
      markdown: cur.manualOverrideMarkdown,
      sourceUrl: cur.sourceUrl,
      changeType: "manual_edit",
      changedBy: userId,
      note: "cleared override",
    });
  }
  await db
    .update(nodeDocsTable)
    .set({ manualOverrideMarkdown: null, manualOverrideAt: null, manualOverrideBy: null })
    .where(eq(nodeDocsTable.id, cur.id));
  if (cur.markdown) await reindexNodeSections(nodeType, language, cur.markdown);
  return { success: true };
}

/* ═══════════════════════════════════════════════════════════════════
   6. الإصدارات (History + Rollback)
   ═══════════════════════════════════════════════════════════════════ */

export async function snapshotDoc(
  nodeType: string,
  language: DocLang,
  changeType: "fetch" | "translate" | "auto_sync" | "manual_edit",
  changedBy: number | null = null,
  note: string | null = null
) {
  const cur = (
    await db
      .select()
      .from(nodeDocsTable)
      .where(and(eq(nodeDocsTable.nodeType, nodeType), eq(nodeDocsTable.language, language)))
      .limit(1)
  )[0];
  if (!cur) return;
  const md = cur.manualOverrideMarkdown || cur.markdown;
  if (!md) return;
  await db.insert(nodeDocsHistoryTable).values({
    nodeType,
    language,
    markdown: md,
    sourceUrl: cur.sourceUrl,
    changeType,
    changedBy,
    note,
  });
}

export async function listDocHistory(nodeType: string, language: DocLang) {
  return db
    .select({
      id: nodeDocsHistoryTable.id,
      changeType: nodeDocsHistoryTable.changeType,
      changedBy: nodeDocsHistoryTable.changedBy,
      note: nodeDocsHistoryTable.note,
      snapshotAt: nodeDocsHistoryTable.snapshotAt,
      length: sql<number>`length(${nodeDocsHistoryTable.markdown})`,
    })
    .from(nodeDocsHistoryTable)
    .where(
      and(
        eq(nodeDocsHistoryTable.nodeType, nodeType),
        eq(nodeDocsHistoryTable.language, language)
      )
    )
    .orderBy(desc(nodeDocsHistoryTable.snapshotAt))
    .limit(100);
}

export async function getHistoryEntry(historyId: number) {
  return (
    await db.select().from(nodeDocsHistoryTable).where(eq(nodeDocsHistoryTable.id, historyId)).limit(1)
  )[0];
}

export async function rollbackToHistory(historyId: number, userId: number) {
  const entry = await getHistoryEntry(historyId);
  if (!entry || !entry.markdown) return { success: false, error: "History entry not found" };
  await setManualOverride(
    entry.nodeType,
    entry.language as DocLang,
    entry.markdown,
    userId,
    `rollback to ${entry.snapshotAt.toISOString()}`
  );
  return { success: true };
}

/* ═══════════════════════════════════════════════════════════════════
   7. استخراج Sub-nodes / Operations
   ═══════════════════════════════════════════════════════════════════ */

export async function getNodeOperations(
  nodeType: string,
  language: DocLang = "en"
): Promise<{ operations: Operation[]; count: number }> {
  const doc =
    language === "ar" ? await getArabicDoc(nodeType) : await getEnglishDoc(nodeType);
  if (!doc.markdown) return { operations: [], count: 0 };
  const ops = extractOperations(doc.markdown);
  return { operations: ops, count: ops.length };
}

/* ═══════════════════════════════════════════════════════════════════
   8. تصدير: Markdown مجمَّع + PDF
   ═══════════════════════════════════════════════════════════════════ */

/** يولِّد ملف Markdown كبير يجمع كل توثيقات لغة معيَّنة. مناسب للتنزيل. */
export async function exportAllDocsMarkdown(language: DocLang = "ar"): Promise<string> {
  const docs = await db
    .select({
      nodeType: nodeDocsTable.nodeType,
      markdown: nodeDocsTable.markdown,
      manualOverrideMarkdown: nodeDocsTable.manualOverrideMarkdown,
      sourceUrl: nodeDocsTable.sourceUrl,
    })
    .from(nodeDocsTable)
    .where(eq(nodeDocsTable.language, language));

  const titleArr = language === "ar" ? "كتاب n8n العربي — المرجع الكامل للعقد" : "n8n Reference — All Nodes";
  const generatedArr = language === "ar" ? "تم التوليد في" : "Generated at";
  const tocTitle = language === "ar" ? "## الفهرس" : "## Table of Contents";

  const parts: string[] = [];
  parts.push(`# ${titleArr}\n\n_${generatedArr} ${new Date().toISOString()}_\n`);
  parts.push("\n" + tocTitle + "\n");
  for (const d of docs) {
    parts.push(`- [${d.nodeType}](#${d.nodeType.replace(/[^a-z0-9]/gi, "-")})`);
  }
  parts.push("\n---\n");
  for (const d of docs) {
    const md = d.manualOverrideMarkdown || d.markdown;
    if (!md) continue;
    parts.push(`\n## <a id="${d.nodeType.replace(/[^a-z0-9]/gi, "-")}"></a>${d.nodeType}\n`);
    if (d.sourceUrl) parts.push(`> Source: ${d.sourceUrl}\n`);
    parts.push(md + "\n\n---\n");
  }
  return parts.join("\n");
}

/**
 * يولِّد ملف HTML قابل للطباعة كـ PDF (المتصفح → Print → Save as PDF).
 * هذا أكثر موثوقية من حلول chromium-headless ويدعم العربية بشكل ممتاز.
 */
export async function exportAllDocsHtml(language: DocLang = "ar"): Promise<string> {
  const md = await exportAllDocsMarkdown(language);
  const { default: MarkdownIt } = await import("markdown-it");
  const mdIt = new MarkdownIt({ html: false, linkify: true, breaks: false });

  // Rewrite n8n's relative doc links (e.g. "/integrations/builtin/.../index.md"
  // or "/glossary.md#anchor") into absolute https://docs.n8n.io/... URLs so
  // they actually open when the book is downloaded as a standalone HTML/PDF.
  // Strip the trailing ".md" / "/index.md" because the n8n docs site serves
  // extensionless URLs.
  const defaultLinkOpen =
    mdIt.renderer.rules.link_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };
  mdIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const hrefIdx = tokens[idx].attrIndex("href");
    if (hrefIdx >= 0) {
      const href = tokens[idx].attrs![hrefIdx][1];
      if (href.startsWith("/")) {
        const cleaned = href
          .replace(/\/index\.md(?=$|[#?])/, "/")
          .replace(/\.md(?=$|[#?])/, "");
        tokens[idx].attrs![hrefIdx][1] = `https://docs.n8n.io${cleaned}`;
        tokens[idx].attrSet("target", "_blank");
        tokens[idx].attrSet("rel", "noopener");
      } else if (/^https?:\/\//i.test(href)) {
        tokens[idx].attrSet("target", "_blank");
        tokens[idx].attrSet("rel", "noopener");
      }
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  const htmlBody = mdIt.render(md);
  const isAr = language === "ar";
  const titleStr = isAr ? "كتاب n8n العربي" : "n8n Reference Book";
  const printHint = isAr
    ? "للحصول على PDF: اضغط Ctrl/Cmd + P ثم اختر «حفظ كملف PDF»."
    : "For PDF: press Ctrl/Cmd + P and choose 'Save as PDF'.";
  return `<!doctype html>
<html dir="${isAr ? "rtl" : "ltr"}" lang="${language}">
<head>
<meta charset="utf-8" />
<title>${titleStr}</title>
<style>
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: ${isAr ? '"Noto Naskh Arabic","Cairo","Tajawal",Arial,sans-serif' : '"Inter","Segoe UI",Arial,sans-serif'}; font-size: 12pt; line-height: 1.7; color: #111; max-width: 900px; margin: 24px auto; padding: 0 16px; }
.print-hint { background: #fff7e6; border: 1px solid #ffd591; padding: 10px 14px; border-radius: 6px; margin-bottom: 24px; }
@media print { .print-hint { display: none; } }
h1, h2, h3 { color: #1f2937; page-break-after: avoid; }
h1 { font-size: 22pt; border-bottom: 2px solid #ccc; padding-bottom: 6px; }
h2 { font-size: 16pt; margin-top: 24pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; page-break-before: always; }
h2:first-of-type { page-break-before: avoid; }
h3 { font-size: 13pt; margin-top: 16pt; }
code, pre { font-family: "JetBrains Mono","Courier New",monospace; font-size: 10pt; direction: ltr; text-align: left; }
pre { background: #f6f8fa; padding: 10px; border-radius: 6px; overflow-x: auto; page-break-inside: avoid; }
code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; page-break-inside: avoid; }
th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: ${isAr ? "right" : "left"}; }
th { background: #f5f7f9; }
blockquote { border-${isAr ? "right" : "left"}: 4px solid #ddd; padding: 0 12px; color: #555; margin: 8px 0; }
a { color: #2563eb; }
ul, ol { padding-${isAr ? "right" : "left"}: 24px; }
</style>
</head>
<body>
<div class="print-hint">${printHint}</div>
${htmlBody}
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════════
   إعداد بدء التشغيل: تأكد أن جدول الأقسام محدَّث للوثائق الموجودة
   (خفيف: يُنفَّذ مرة عند الإقلاع إن لم يكن الفهرس موجوداً).
   ═══════════════════════════════════════════════════════════════════ */

export async function ensureSectionsIndexBootstrap(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(nodeDocSectionsTable);
  if (count > 0) {
    logger.info({ existingSections: count }, "Sections index already populated");
    return;
  }
  logger.info("Bootstrapping doc sections index for the first time…");
  const total = await reindexAllSections();
  logger.info({ total }, "Sections index bootstrap complete");
}

/* ═══════════════════════════════════════════════════════════════════
   إعادة تصدير bulk fetch wrappers مع snapshot الإصدارات
   ═══════════════════════════════════════════════════════════════════ */

export async function bulkFetchEnglishWithSnapshot(
  opts: { force?: boolean; concurrency?: number } = {},
  onProgress?: Parameters<typeof bulkFetchEnglishDocs>[1]
) {
  // أخذ snapshot للموجود قبل refresh (للتغييرات الكبيرة فقط)
  const existing = await db
    .select({ nodeType: nodeDocsTable.nodeType, markdown: nodeDocsTable.markdown })
    .from(nodeDocsTable)
    .where(and(eq(nodeDocsTable.language, "en"), sql`${nodeDocsTable.markdown} IS NOT NULL`));
  if (existing.length > 0 && opts.force) {
    const rows = existing.map((e) => ({
      nodeType: e.nodeType,
      language: "en" as const,
      markdown: e.markdown!,
      sourceUrl: null,
      changeType: "fetch" as const,
      changedBy: null,
      note: "pre-refresh snapshot",
    }));
    for (let i = 0; i < rows.length; i += 100) {
      await db.insert(nodeDocsHistoryTable).values(rows.slice(i, i + 100));
    }
  }
  const result = await bulkFetchEnglishDocs(opts, onProgress);
  // أعد فهرسة الأقسام للمحدَّث
  await reindexAllSections("en");
  return result;
}

export async function bulkTranslateArabicWithSnapshot(
  opts: { force?: boolean; concurrency?: number } = {},
  onProgress?: Parameters<typeof bulkTranslateArabicDocs>[1]
) {
  const existing = await db
    .select({ nodeType: nodeDocsTable.nodeType, markdown: nodeDocsTable.markdown })
    .from(nodeDocsTable)
    .where(and(eq(nodeDocsTable.language, "ar"), sql`${nodeDocsTable.markdown} IS NOT NULL`));
  if (existing.length > 0 && opts.force) {
    const rows = existing.map((e) => ({
      nodeType: e.nodeType,
      language: "ar" as const,
      markdown: e.markdown!,
      sourceUrl: null,
      changeType: "translate" as const,
      changedBy: null,
      note: "pre-translate snapshot",
    }));
    for (let i = 0; i < rows.length; i += 100) {
      await db.insert(nodeDocsHistoryTable).values(rows.slice(i, i + 100));
    }
  }
  const result = await bulkTranslateArabicDocs(opts, onProgress);
  await reindexAllSections("ar");
  return result;
}
