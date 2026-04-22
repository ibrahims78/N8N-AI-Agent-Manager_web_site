/**
 * nodeDocs.service.ts
 *
 * Fetches, caches, and translates the full Markdown documentation for n8n nodes.
 * - English source: n8n-io/n8n-docs on GitHub (raw.githubusercontent.com).
 * - Arabic translation: lazy, via OpenAI, persisted in node_docs(language='ar').
 *
 * The service derives the GitHub raw URL from the node's `primaryDocsUrl`
 * (e.g. https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
 *  → docs/integrations/builtin/app-nodes/n8n-nodes-base.slack.md)
 * and tries 2 layouts (`<slug>.md` and `<slug>/index.md`) before giving up.
 */
import { db, nodeCatalogTable, nodeDocsTable, systemSettingsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { decryptApiKey } from "./encryption.service";

const DOCS_REPO_RAW = "https://raw.githubusercontent.com/n8n-io/n8n-docs/main";
const DOCS_API = "https://api.github.com/repos/n8n-io/n8n-docs/contents";

export type DocLang = "en" | "ar";

export interface DocResult {
  nodeType: string;
  language: DocLang;
  markdown: string | null;
  sourceUrl: string | null;
  fetchedAt: string | null;
  fromCache: boolean;
  error?: string;
}

/* ───────────────────────── URL derivation ───────────────────────── */

/**
 * Convert a docs.n8n.io URL into the path inside the n8n-docs GitHub repo
 * (without leading slash, and without trailing slash).
 */
function docsUrlToRepoPath(docsUrl: string): string | null {
  try {
    const u = new URL(docsUrl);
    if (!u.hostname.includes("docs.n8n.io")) return null;
    // /integrations/builtin/app-nodes/n8n-nodes-base.slack/  →  integrations/builtin/app-nodes/n8n-nodes-base.slack
    let p = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!p) return null;
    return `docs/${p}`;
  } catch {
    return null;
  }
}

/** Generate candidate raw-content URLs to try, in order. */
function candidateRawUrls(repoPath: string): string[] {
  return [
    `${DOCS_REPO_RAW}/${repoPath}.md`,
    `${DOCS_REPO_RAW}/${repoPath}/index.md`,
  ];
}

/* ───────────────────────── Fetch English ───────────────────────── */

async function fetchMarkdownFromGithub(
  docsUrl: string
): Promise<{ markdown: string; sourceUrl: string } | null> {
  const repoPath = docsUrlToRepoPath(docsUrl);
  if (!repoPath) return null;
  for (const url of candidateRawUrls(repoPath)) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (r.ok) {
        const md = await r.text();
        if (md && md.length > 20) return { markdown: md, sourceUrl: url };
      }
    } catch (err) {
      logger.debug({ err, url }, "doc fetch attempt failed");
    }
  }
  return null;
}

/**
 * Returns the English doc for a node. If not cached, fetches from GitHub
 * and persists it. Returns null markdown if no doc is available upstream.
 */
export async function getEnglishDoc(nodeType: string, force = false): Promise<DocResult> {
  const node = (
    await db.select().from(nodeCatalogTable).where(eq(nodeCatalogTable.nodeType, nodeType)).limit(1)
  )[0];
  if (!node) {
    return {
      nodeType,
      language: "en",
      markdown: null,
      sourceUrl: null,
      fetchedAt: null,
      fromCache: false,
      error: "Node not found in catalog",
    };
  }

  if (!force) {
    const cached = (
      await db
        .select()
        .from(nodeDocsTable)
        .where(and(eq(nodeDocsTable.nodeType, nodeType), eq(nodeDocsTable.language, "en")))
        .limit(1)
    )[0];
    if (cached?.markdown) {
      return {
        nodeType,
        language: "en",
        markdown: cached.markdown,
        sourceUrl: cached.sourceUrl,
        fetchedAt: cached.fetchedAt.toISOString(),
        fromCache: true,
      };
    }
  }

  if (!node.primaryDocsUrl) {
    return {
      nodeType,
      language: "en",
      markdown: null,
      sourceUrl: null,
      fetchedAt: null,
      fromCache: false,
      error: "Node has no primaryDocsUrl",
    };
  }

  const fetched = await fetchMarkdownFromGithub(node.primaryDocsUrl);
  if (!fetched) {
    await upsertDoc({
      nodeType,
      language: "en",
      markdown: null,
      sourceUrl: null,
      error: "Doc not found in n8n-docs repo",
    });
    return {
      nodeType,
      language: "en",
      markdown: null,
      sourceUrl: null,
      fetchedAt: null,
      fromCache: false,
      error: "Doc not found in n8n-docs repo",
    };
  }

  const saved = await upsertDoc({
    nodeType,
    language: "en",
    markdown: fetched.markdown,
    sourceUrl: fetched.sourceUrl,
    error: null,
  });
  return {
    nodeType,
    language: "en",
    markdown: fetched.markdown,
    sourceUrl: fetched.sourceUrl,
    fetchedAt: saved.fetchedAt.toISOString(),
    fromCache: false,
  };
}

/* ───────────────────────── Translation (lazy, OpenAI) ───────────────────────── */

const TRANSLATE_GLOSSARY = `
You are translating n8n workflow-automation docs to Arabic for technical users.

STRICT RULES:
- Output VALID Markdown that mirrors the source structure (headings, lists, tables, code fences, links, frontmatter).
- DO NOT translate code inside fenced code blocks (\`\`\`...\`\`\`) or inline code (\`...\`).
- DO NOT translate URLs, file paths, identifiers, parameter names, JSON keys, environment variable names.
- DO NOT translate node names, operation names, or n8n UI labels that the user must click in the English UI — keep them in English, but you MAY add a parenthetical Arabic gloss the FIRST time, e.g. "Webhook (ويب هوك)".
- Preserve all MkDocs-style admonitions ("!!! note", "??? tip") — translate body text only, not the admonition keywords.
- Preserve frontmatter YAML keys (title, description, contentType) but you MAY translate their string values.
- Use these standard translations:
  Workflow → سير العمل
  Trigger → المُحفِّز
  Node → العقدة
  Credential → بيانات الاعتماد
  Webhook → ويب هوك
  Authentication → المصادقة
  Operation → العملية
  Resource → المورد
  Execution → التنفيذ
  Item → العنصر
  Expression → التعبير
  Required → مطلوب
  Optional → اختياري

Output ONLY the translated Markdown, with no preamble or wrapping fences.
`.trim();

async function getOpenaiKey(): Promise<string | null> {
  const s = (await db.select().from(systemSettingsTable).limit(1))[0];
  if (!s?.openaiKeyEncrypted || !s?.openaiKeyIv) return null;
  try {
    return decryptApiKey(s.openaiKeyEncrypted, s.openaiKeyIv);
  } catch {
    return null;
  }
}

async function translateMarkdownToArabic(markdown: string): Promise<string> {
  const key = await getOpenaiKey();
  if (!key) throw new Error("OpenAI API key not configured in system settings");

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: key, timeout: 90_000 });

  // For very long docs, do simple chunking by Markdown headings to keep
  // each request well within model limits while preserving structure.
  const chunks = chunkMarkdown(markdown, 6000);
  const out: string[] = [];
  for (const chunk of chunks) {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 4096,
      messages: [
        { role: "system", content: TRANSLATE_GLOSSARY },
        { role: "user", content: chunk },
      ],
    });
    const txt = resp.choices[0]?.message?.content?.trim() ?? "";
    out.push(txt);
  }
  return out.join("\n\n");
}

function chunkMarkdown(md: string, maxChars: number): string[] {
  if (md.length <= maxChars) return [md];
  const lines = md.split("\n");
  const chunks: string[] = [];
  let cur: string[] = [];
  let curLen = 0;
  for (const line of lines) {
    const isHeading = /^#{1,6}\s/.test(line);
    if (isHeading && curLen > maxChars * 0.6 && cur.length > 0) {
      chunks.push(cur.join("\n"));
      cur = [];
      curLen = 0;
    }
    cur.push(line);
    curLen += line.length + 1;
    if (curLen >= maxChars) {
      chunks.push(cur.join("\n"));
      cur = [];
      curLen = 0;
    }
  }
  if (cur.length > 0) chunks.push(cur.join("\n"));
  return chunks;
}

export async function getArabicDoc(nodeType: string, force = false): Promise<DocResult> {
  if (!force) {
    const cached = (
      await db
        .select()
        .from(nodeDocsTable)
        .where(and(eq(nodeDocsTable.nodeType, nodeType), eq(nodeDocsTable.language, "ar")))
        .limit(1)
    )[0];
    if (cached?.markdown) {
      return {
        nodeType,
        language: "ar",
        markdown: cached.markdown,
        sourceUrl: cached.sourceUrl,
        fetchedAt: cached.fetchedAt.toISOString(),
        fromCache: true,
      };
    }
  }

  // Need EN first
  const en = await getEnglishDoc(nodeType);
  if (!en.markdown) {
    return {
      nodeType,
      language: "ar",
      markdown: null,
      sourceUrl: null,
      fetchedAt: null,
      fromCache: false,
      error: en.error || "English doc unavailable",
    };
  }

  let translated: string;
  try {
    translated = await translateMarkdownToArabic(en.markdown);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await upsertDoc({
      nodeType,
      language: "ar",
      markdown: null,
      sourceUrl: en.sourceUrl,
      error: msg,
    });
    return {
      nodeType,
      language: "ar",
      markdown: null,
      sourceUrl: en.sourceUrl,
      fetchedAt: null,
      fromCache: false,
      error: msg,
    };
  }

  const saved = await upsertDoc({
    nodeType,
    language: "ar",
    markdown: translated,
    sourceUrl: en.sourceUrl,
    error: null,
  });
  return {
    nodeType,
    language: "ar",
    markdown: translated,
    sourceUrl: en.sourceUrl,
    fetchedAt: saved.fetchedAt.toISOString(),
    fromCache: false,
  };
}

/* ───────────────────────── Bulk operations ───────────────────────── */

export interface BulkFetchProgress {
  total: number;
  attempted: number;
  fetched: number;
  failed: number;
}

/**
 * Fetches English docs for ALL nodes in catalog that don't already have one.
 * Concurrency-limited to be polite to GitHub. Skips rows with stored errors
 * unless `force` is true.
 */
export async function bulkFetchEnglishDocs(
  opts: { force?: boolean; concurrency?: number } = {}
): Promise<BulkFetchProgress> {
  const concurrency = opts.concurrency ?? 6;

  const allNodes = await db
    .select({ nodeType: nodeCatalogTable.nodeType, primaryDocsUrl: nodeCatalogTable.primaryDocsUrl })
    .from(nodeCatalogTable);

  let target = allNodes.filter((n) => !!n.primaryDocsUrl);

  if (!opts.force) {
    const existing = await db
      .select({ nodeType: nodeDocsTable.nodeType, error: nodeDocsTable.error, hasMd: sql<boolean>`(${nodeDocsTable.markdown} IS NOT NULL)` })
      .from(nodeDocsTable)
      .where(eq(nodeDocsTable.language, "en"));
    const haveMd = new Set(existing.filter((e) => e.hasMd).map((e) => e.nodeType));
    target = target.filter((n) => !haveMd.has(n.nodeType));
  }

  const progress: BulkFetchProgress = {
    total: target.length,
    attempted: 0,
    fetched: 0,
    failed: 0,
  };

  // Simple concurrency-limited pool
  let idx = 0;
  async function worker() {
    while (idx < target.length) {
      const i = idx++;
      const node = target[i];
      progress.attempted++;
      try {
        const r = await getEnglishDoc(node.nodeType, opts.force);
        if (r.markdown) progress.fetched++;
        else progress.failed++;
      } catch (err) {
        progress.failed++;
        logger.warn({ err, nodeType: node.nodeType }, "bulk doc fetch error");
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  logger.info(progress, "Bulk English docs fetch complete");
  return progress;
}

/* ───────────────────────── Stats ───────────────────────── */

export interface DocsStats {
  totalNodes: number;
  enFetched: number;
  enMissing: number;
  arTranslated: number;
  arPending: number;
  lastFetchedAt: string | null;
}

export async function getDocsStats(): Promise<DocsStats> {
  const [{ totalNodes }] = await db
    .select({ totalNodes: sql<number>`count(*)::int` })
    .from(nodeCatalogTable);

  const enRows = await db
    .select({
      withMd: sql<number>`count(*) FILTER (WHERE ${nodeDocsTable.markdown} IS NOT NULL)::int`,
      total: sql<number>`count(*)::int`,
      lastAt: sql<Date | null>`max(${nodeDocsTable.fetchedAt})`,
    })
    .from(nodeDocsTable)
    .where(eq(nodeDocsTable.language, "en"));

  const arRows = await db
    .select({
      withMd: sql<number>`count(*) FILTER (WHERE ${nodeDocsTable.markdown} IS NOT NULL)::int`,
    })
    .from(nodeDocsTable)
    .where(eq(nodeDocsTable.language, "ar"));

  const enFetched = enRows[0]?.withMd ?? 0;
  const arTranslated = arRows[0]?.withMd ?? 0;
  return {
    totalNodes,
    enFetched,
    enMissing: Math.max(0, totalNodes - enFetched),
    arTranslated,
    arPending: Math.max(0, enFetched - arTranslated),
    lastFetchedAt: enRows[0]?.lastAt ? enRows[0].lastAt.toISOString() : null,
  };
}

/** Returns which nodes have docs/translations — used by frontend health badges. */
export async function getDocsCoverage(): Promise<
  { nodeType: string; en: boolean; ar: boolean }[]
> {
  const rows = await db
    .select({
      nodeType: nodeDocsTable.nodeType,
      language: nodeDocsTable.language,
      hasMd: sql<boolean>`(${nodeDocsTable.markdown} IS NOT NULL)`,
    })
    .from(nodeDocsTable);

  const map = new Map<string, { en: boolean; ar: boolean }>();
  for (const r of rows) {
    const cur = map.get(r.nodeType) ?? { en: false, ar: false };
    if (r.language === "en") cur.en = !!r.hasMd;
    if (r.language === "ar") cur.ar = !!r.hasMd;
    map.set(r.nodeType, cur);
  }
  return Array.from(map.entries()).map(([nodeType, v]) => ({ nodeType, ...v }));
}

/* ───────────────────────── Helpers ───────────────────────── */

async function upsertDoc(input: {
  nodeType: string;
  language: DocLang;
  markdown: string | null;
  sourceUrl: string | null;
  error: string | null;
}) {
  const inserted = await db
    .insert(nodeDocsTable)
    .values({
      nodeType: input.nodeType,
      language: input.language,
      markdown: input.markdown,
      sourceUrl: input.sourceUrl,
      error: input.error,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [nodeDocsTable.nodeType, nodeDocsTable.language],
      set: {
        markdown: input.markdown,
        sourceUrl: input.sourceUrl,
        error: input.error,
        fetchedAt: new Date(),
      },
    })
    .returning();
  return inserted[0];
}

/* ───────────────────────── Search-within-docs (RAG-lite) ───────────────────────── */

/**
 * Simple keyword scoring over the cached docs for a given node — returns the
 * top-N most relevant ~80-line slices for an agent to consume.
 * Cheap and effective when full embeddings are not yet wired up.
 */
export async function searchWithinNodeDoc(
  nodeType: string,
  query: string,
  language: DocLang = "en",
  maxSnippets = 3
): Promise<{ snippets: string[]; sourceUrl: string | null }> {
  const doc =
    language === "ar" ? await getArabicDoc(nodeType) : await getEnglishDoc(nodeType);
  if (!doc.markdown) return { snippets: [], sourceUrl: doc.sourceUrl };

  const lines = doc.markdown.split("\n");
  // Slice around headings into sections, score each by keyword hits.
  const sections: { title: string; body: string; start: number }[] = [];
  let curTitle = "(intro)";
  let curBody: string[] = [];
  let curStart = 0;
  lines.forEach((l, i) => {
    if (/^#{1,6}\s/.test(l)) {
      if (curBody.length > 0) {
        sections.push({ title: curTitle, body: curBody.join("\n"), start: curStart });
      }
      curTitle = l.replace(/^#+\s*/, "");
      curBody = [];
      curStart = i;
    } else {
      curBody.push(l);
    }
  });
  if (curBody.length > 0) {
    sections.push({ title: curTitle, body: curBody.join("\n"), start: curStart });
  }

  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) {
    return {
      snippets: sections.slice(0, maxSnippets).map((s) => `## ${s.title}\n${s.body}`),
      sourceUrl: doc.sourceUrl,
    };
  }
  const scored = sections.map((s) => {
    const hay = (s.title + "\n" + s.body).toLowerCase();
    const score = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    return { ...s, score };
  });
  scored.sort((a, b) => b.score - a.score || a.start - b.start);
  const top = scored.filter((s) => s.score > 0).slice(0, maxSnippets);
  if (top.length === 0) {
    return {
      snippets: sections.slice(0, maxSnippets).map((s) => `## ${s.title}\n${s.body.slice(0, 600)}`),
      sourceUrl: doc.sourceUrl,
    };
  }
  return {
    snippets: top.map((s) => `## ${s.title}\n${s.body.slice(0, 1500)}`),
    sourceUrl: doc.sourceUrl,
  };
}

/** Discover the GitHub raw URL for a docs.n8n.io URL — exported for testing. */
export const _internal = { docsUrlToRepoPath, candidateRawUrls, fetchMarkdownFromGithub };
