/**
 * nodeDocs.service.ts
 *
 * Fetches, caches, and translates the full Markdown documentation for n8n nodes.
 *
 * Storage strategy (dual-layer):
 *  1. Database (node_docs table) — primary cache, fast SQL queries.
 *  2. Local filesystem (lib/n8n-nodes-catalog/docs/{en|ar}/) — offline resilience,
 *     survives DB resets, and makes the docs readable as plain files.
 *
 * Languages:
 *  - English source: n8n-io/n8n-docs on GitHub (raw.githubusercontent.com).
 *  - Arabic translation: lazy (or bulk) via OpenAI gpt-4o-mini.
 *
 * The service derives the GitHub raw URL from the node's `primaryDocsUrl`
 * (e.g. https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
 *  → docs/integrations/builtin/app-nodes/n8n-nodes-base.slack.md)
 * and tries 2 layouts (`<slug>.md` and `<slug>/index.md`) before giving up.
 */
import fs from "fs/promises";
import path from "path";
import { db, nodeCatalogTable, nodeDocsTable, systemSettingsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { decryptApiKey } from "./encryption.service";

const DOCS_REPO_RAW = "https://raw.githubusercontent.com/n8n-io/n8n-docs/main";
const DOCS_API = "https://api.github.com/repos/n8n-io/n8n-docs/contents";

/**
 * Local docs directory — sibling to the n8n-nodes-catalog package.
 * process.cwd() = artifacts/api-server when running dev/prod.
 */
const LOCAL_DOCS_DIR = path.resolve(process.cwd(), "../../lib/n8n-nodes-catalog/docs");

export type DocLang = "en" | "ar";

export interface DocResult {
  nodeType: string;
  language: DocLang;
  markdown: string | null;
  sourceUrl: string | null;
  fetchedAt: string | null;
  fromCache: boolean;
  localFile?: string | null;
  error?: string;
  /** هل هذه نسخة محرَّرة يدوياً تعلو على المصدر؟ */
  manualOverride?: boolean;
}

export interface BulkFetchProgress {
  total: number;
  attempted: number;
  fetched: number;
  failed: number;
  current?: string;
}

export type ProgressCallback = (progress: BulkFetchProgress) => void;

/* ───────────────────────── Local file helpers ───────────────────────── */

/** Convert a node type string to a safe filename (no slashes / special chars). */
function nodeTypeToFilename(nodeType: string): string {
  return nodeType.replace(/\//g, "__").replace(/@/g, "_at_") + ".md";
}

/** Ensure the docs/{lang} directory exists. */
async function ensureDocsDir(lang: DocLang): Promise<string> {
  const dir = path.join(LOCAL_DOCS_DIR, lang);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Persist a markdown string to the local filesystem. */
async function saveDocToFile(
  nodeType: string,
  lang: DocLang,
  markdown: string
): Promise<string> {
  const dir = await ensureDocsDir(lang);
  const filePath = path.join(dir, nodeTypeToFilename(nodeType));
  await fs.writeFile(filePath, markdown, "utf-8");
  return filePath;
}

/** Load a markdown doc from the local filesystem. Returns null if not found. */
async function loadDocFromFile(
  nodeType: string,
  lang: DocLang
): Promise<string | null> {
  try {
    const filePath = path.join(LOCAL_DOCS_DIR, lang, nodeTypeToFilename(nodeType));
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** Count the number of markdown files saved locally per language. */
export async function getLocalFilesStats(): Promise<{ en: number; ar: number }> {
  async function countDir(lang: DocLang): Promise<number> {
    try {
      const dir = path.join(LOCAL_DOCS_DIR, lang);
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith(".md")).length;
    } catch {
      return 0;
    }
  }
  const [en, ar] = await Promise.all([countDir("en"), countDir("ar")]);
  return { en, ar };
}

/** Reverse of `nodeTypeToFilename` — returns null if the filename is malformed. */
function filenameToNodeType(file: string): string | null {
  if (!file.endsWith(".md")) return null;
  return file.slice(0, -3).replace(/_at_/g, "@").replace(/__/g, "/");
}

/**
 * Hydrate the database from local markdown files for a given language.
 * Useful after a DB reset / migration so previously-translated content on
 * disk is re-imported instead of being lost or re-translated unnecessarily.
 *
 * Only writes when the corresponding DB row has no markdown yet (or is missing
 * entirely) — never overwrites existing DB content.
 */
export async function hydrateDocsFromLocalFiles(
  lang: DocLang
): Promise<{ scanned: number; imported: number; skipped: number }> {
  const dir = path.join(LOCAL_DOCS_DIR, lang);
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return { scanned: 0, imported: 0, skipped: 0 };
  }
  if (files.length === 0) return { scanned: 0, imported: 0, skipped: 0 };

  // Pull existing DB rows once for an O(1) lookup.
  const existingRows = await db
    .select({
      nodeType: nodeDocsTable.nodeType,
      hasMd: sql<boolean>`(${nodeDocsTable.markdown} IS NOT NULL)`,
      sourceUrl: nodeDocsTable.sourceUrl,
    })
    .from(nodeDocsTable)
    .where(eq(nodeDocsTable.language, lang));
  const existing = new Map(existingRows.map((r) => [r.nodeType, r]));

  let imported = 0;
  let skipped = 0;
  for (const file of files) {
    const nodeType = filenameToNodeType(file);
    if (!nodeType) { skipped++; continue; }
    const cur = existing.get(nodeType);
    if (cur?.hasMd) { skipped++; continue; }
    try {
      const md = await fs.readFile(path.join(dir, file), "utf-8");
      if (!md || md.length < 10) { skipped++; continue; }
      // Look up sourceUrl from the EN row if we have one (best effort).
      const sourceUrl = cur?.sourceUrl ?? null;
      await upsertDoc({
        nodeType,
        language: lang,
        markdown: md,
        sourceUrl,
        error: null,
      });
      imported++;
    } catch (err) {
      logger.warn({ err, nodeType, lang }, "hydrateDocsFromLocalFiles: failed to import file");
      skipped++;
    }
  }
  return { scanned: files.length, imported, skipped };
}

/**
 * Verify an AI client is available without making an actual API call. Throws
 * with the same message used by `resolveAiClient` so callers can surface a
 * clear, actionable error before kicking off a long bulk job.
 */
export async function ensureAiClientAvailable(): Promise<void> {
  await resolveAiClient();
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

/** Fetch a single raw URL, returning text or null on failure. */
async function fetchRaw(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (r.ok) {
      const text = await r.text();
      return text && text.length > 10 ? text : null;
    }
  } catch (err) {
    logger.debug({ err, url }, "fetchRaw failed");
  }
  return null;
}

/**
 * Resolve MkDocs --8<-- snippet includes in-place.
 * Pattern: --8<-- "some/path.md"  or  --8<-- 'some/path.md'
 */
async function resolveSnippets(markdown: string): Promise<string> {
  const includeRe = /--8<--\s+["']([^"']+)["']/g;
  const matches = [...markdown.matchAll(includeRe)];
  if (matches.length === 0) return markdown;

  let result = markdown;
  await Promise.all(
    matches.map(async (m) => {
      const snippetPath = m[1]; // e.g. "_snippets/integrations/builtin/app-nodes/ai-tools.md"
      // n8n-docs configures MkDocs base_path so snippets resolve from repo root
      // (NOT from docs/). Try repo-root first, then docs/, then a few common
      // alternative roots, before giving up.
      const candidates = [
        `${DOCS_REPO_RAW}/${snippetPath}`,
        `${DOCS_REPO_RAW}/docs/${snippetPath}`,
        `${DOCS_REPO_RAW}/${snippetPath.replace(/^_snippets\//, "snippets/")}`,
      ];
      let snippetContent: string | null = null;
      for (const url of candidates) {
        snippetContent = await fetchRaw(url);
        if (snippetContent) break;
      }
      if (snippetContent) {
        // Recursively resolve nested snippet includes
        const resolved = await resolveSnippets(snippetContent.trim());
        result = result.replace(m[0], resolved);
      } else {
        // Remove the unresolvable directive silently
        result = result.replace(m[0], "");
      }
    })
  );
  return result;
}

/**
 * Strip YAML frontmatter from the top of a markdown document.
 * Frontmatter looks like:
 *   ---
 *   title: ...
 *   ---
 */
function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/**
 * Convert MkDocs admonition syntax to standard Markdown blockquotes.
 * Supports both block and inline forms:
 *   /// note | Title
 *   body...
 *   ///
 *   /// note | Title body... ///
 */
function convertAdmonitions(markdown: string): string {
  // Inline single-line form: /// type | Title body ///
  let out = markdown.replace(
    /\/\/\/\s*([a-zA-Z]+)\s*\|\s*([^\n]*?)\s*\/\/\//g,
    (_m, type: string, rest: string) => {
      const title = type.charAt(0).toUpperCase() + type.slice(1);
      return `> **${title}:** ${rest.trim()}`;
    }
  );
  // Block form across multiple lines
  out = out.replace(
    /\/\/\/\s*([a-zA-Z]+)(?:\s*\|\s*([^\n]*))?\n([\s\S]*?)\n\/\/\//g,
    (_m, type: string, title: string | undefined, body: string) => {
      const heading = (title?.trim() || type).trim();
      const headingTitle = heading.charAt(0).toUpperCase() + heading.slice(1);
      const quoted = body
        .trim()
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n");
      return `> **${headingTitle}**\n>\n${quoted}`;
    }
  );
  return out;
}

/**
 * Clean up MkDocs/Jinja2 shortcodes that don't render in plain Markdown:
 *  - [[ templatesWidget(...) ]]
 *  - {{ ... }}  (Jinja2 variables)
 *  - ::: (admonition blocks)
 */
function cleanMkDocsDirectives(markdown: string): string {
  return markdown
    // Remove [[ ...widget calls... ]]
    .replace(/\[\[.*?\]\]/gs, "")
    // Remove Jinja2 {{ variable }} expressions left over
    .replace(/\{\{[^}]*\}\}/g, "")
    // Collapse multiple blank lines into two
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * If the fetched URL is an index.md inside a directory, look for sibling .md files
 * in that directory on GitHub and append them as additional sections.
 */
async function fetchSiblingPages(indexUrl: string): Promise<string> {
  // indexUrl looks like: https://raw.githubusercontent.com/.../app-nodes/n8n-nodes-base.postgres/index.md
  if (!indexUrl.endsWith("/index.md")) return "";

  const dirRawBase = indexUrl.slice(0, -"index.md".length); // trailing slash included
  // Convert raw URL to API URL to list directory
  // raw: https://raw.githubusercontent.com/n8n-io/n8n-docs/main/docs/...
  // api: https://api.github.com/repos/n8n-io/n8n-docs/contents/docs/...
  const apiUrl = indexUrl
    .replace("https://raw.githubusercontent.com/", "https://api.github.com/repos/")
    .replace("/main/", "/contents/")
    .replace("/index.md", "");

  try {
    const r = await fetch(apiUrl, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return "";
    const files: Array<{ name: string; type: string }> = await r.json();
    const siblings = files.filter(
      (f) => f.type === "file" && f.name.endsWith(".md") && f.name !== "index.md"
    );
    if (siblings.length === 0) return "";

    const parts = await Promise.all(
      siblings.map(async (f) => {
        const content = await fetchRaw(`${dirRawBase}${f.name}`);
        if (!content) return "";
        // Strip front-matter from sibling pages
        const stripped = content.replace(/^---[\s\S]*?---\n?/, "").trim();
        return stripped ? `\n\n---\n\n${stripped}` : "";
      })
    );
    return parts.filter(Boolean).join("");
  } catch (err) {
    logger.debug({ err, apiUrl }, "fetchSiblingPages failed");
    return "";
  }
}

async function fetchMarkdownFromGithub(
  docsUrl: string
): Promise<{ markdown: string; sourceUrl: string } | null> {
  const repoPath = docsUrlToRepoPath(docsUrl);
  if (!repoPath) return null;

  for (const url of candidateRawUrls(repoPath)) {
    const raw = await fetchRaw(url);
    if (!raw) continue;

    // 1. Strip YAML frontmatter from the top of the doc
    let md = stripFrontmatter(raw);

    // 2. Resolve --8<-- snippet includes
    md = await resolveSnippets(md);

    // 3. Append sibling pages (common-issues.md, etc.) if this is an index.md
    const extra = await fetchSiblingPages(url);
    if (extra) md += extra.split(/^---[\s\S]*?---\n?/m).join("");

    // 4. Convert MkDocs admonitions (/// note ... ///) to blockquotes
    md = convertAdmonitions(md);

    // 5. Strip remaining MkDocs shortcodes that don't render in plain Markdown
    md = cleanMkDocsDirectives(md);

    if (md.length > 20) return { markdown: md, sourceUrl: url };
  }
  return null;
}

/**
 * Returns the English doc for a node. If not cached, fetches from GitHub
 * and persists it (DB + local file). Returns null markdown if not available.
 */
/** Convert a DB timestamp value (may be Date or string) to ISO string safely. */
function toISO(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

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
    if (cached?.manualOverrideMarkdown) {
      return {
        nodeType,
        language: "en",
        markdown: cached.manualOverrideMarkdown,
        sourceUrl: cached.sourceUrl,
        fetchedAt: toISO(cached.manualOverrideAt ?? cached.fetchedAt),
        fromCache: true,
        manualOverride: true,
      };
    }
    if (cached?.markdown) {
      // If cached content still has unresolved MkDocs artifacts, re-fetch silently:
      //  - Unresolved snippet includes (--8<--)
      //  - YAML frontmatter that wasn't stripped (--- ... --- at top)
      //  - MkDocs admonition blocks (/// note | ... ///) that weren't converted
      const hasUnresolved =
        /--8<--/.test(cached.markdown) ||
        /^---\r?\n[\s\S]*?\r?\n---/.test(cached.markdown) ||
        /\/\/\/\s*[a-zA-Z]+\s*\|/.test(cached.markdown);
      if (!hasUnresolved) {
        return {
          nodeType,
          language: "en",
          markdown: cached.markdown,
          sourceUrl: cached.sourceUrl,
          fetchedAt: toISO(cached.fetchedAt),
          fromCache: true,
        };
      }
      // Fall through to re-fetch with the improved fetcher
      logger.info({ nodeType }, "Re-fetching doc to resolve MkDocs snippets");
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
    await upsertDoc({ nodeType, language: "en", markdown: null, sourceUrl: null, error: "Doc not found in n8n-docs repo" });
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
    fetchedAt: toISO(saved.fetchedAt),
    fromCache: false,
  };
}

/* ───────────────────────── Translation (lazy or bulk, OpenAI) ───────────────────────── */

const TRANSLATE_GLOSSARY = `
أنت مترجم تقني متخصص في ترجمة توثيق منصة n8n لأتمتة سير العمل إلى اللغة العربية الفصحى المتخصصة. مستخدموك مطورون ومهندسون متمرسون.

قواعد صارمة يجب الالتزام بها حرفياً:

1. بنية Markdown:
   - احتفظ بالبنية الكاملة: العناوين، القوائم، الجداول، كتل الكود، الروابط، frontmatter.
   - لا تحذف أي محتوى موجود في المصدر.
   - الاتجاه دائماً من اليمين لليسار.

2. لا تترجم أبداً:
   - الكود داخل code blocks (triple backtick) أو inline code (backtick).
   - روابط URL ومسارات الملفات.
   - أسماء المعاملات (parameters) ومفاتيح JSON وأسماء متغيرات البيئة.
   - أسماء العقد (Node names) مثل: Postgres, Slack, GitHub — لكن أضف تعريباً بين قوسين في أول مرة.

3. مصطلحات موحّدة إلزامية (استخدمها دائماً):
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
   Schema → المخطط
   Table → الجدول
   Query → الاستعلام
   Connection → الاتصال
   Integration → التكامل
   Parameter → المعامل
   Output → المخرجات
   Input → المدخلات
   Error → الخطأ
   Template → القالب
   Instance → النسخة
   Deploy → النشر
   Environment → البيئة
   API Key → مفتاح API
   Timeout → مهلة الانتهاء
   Retry → إعادة المحاولة
   Batch → دفعة
   Transaction → معاملة (قاعدة البيانات)

4. أسلوب الترجمة:
   - عربية فصحى تقنية واضحة ودقيقة.
   - الجمل قصيرة ومباشرة.
   - استخدم المبني للمجهول حيث يكون أكثر طبيعية في التوثيق التقني.
   - احتفظ بنبرة الوثيقة الرسمية.
   - اقرأ الجملة كاملة قبل الترجمة للحفاظ على السياق.

أخرج فقط Markdown المُترجَم كاملاً بدون أي مقدمات أو تعليقات.
`.trim();

interface AiClient {
  apiKey: string;
  baseURL?: string;
  model: string;
}

/**
 * Resolve an AI client configuration.
 * Priority:
 *   1. Replit AI Integrations proxy (AI_INTEGRATIONS_OPENAI_API_KEY) — no user key needed
 *   2. System-settings OpenAI key (user-configured encrypted key)
 */
async function resolveAiClient(): Promise<AiClient> {
  // 1. Replit AI Integrations proxy
  const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (replitKey) {
    return {
      apiKey: replitKey,
      baseURL: replitBase,
      model: "gpt-5-nano",
    };
  }

  // 2. User-configured key from system settings
  const s = (await db.select().from(systemSettingsTable).limit(1))[0];
  if (s?.openaiKeyEncrypted && s?.openaiKeyIv) {
    try {
      const key = decryptApiKey(s.openaiKeyEncrypted, s.openaiKeyIv);
      if (key) return { apiKey: key, model: "gpt-4o-mini" };
    } catch {
      // ignore decrypt error, fall through
    }
  }

  throw new Error(
    "لا يوجد مفتاح AI متوفر. يرجى التحقق من إعدادات النظام أو تكوين Replit AI Integrations."
  );
}

export async function translateMarkdownToArabic(markdown: string): Promise<string> {
  const client = await resolveAiClient();
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({
    apiKey: client.apiKey,
    baseURL: client.baseURL,
    timeout: 120_000,
  });

  const chunks = chunkMarkdown(markdown, 3500);
  // gpt-5 family models only allow temperature=1 (default). Older models accept custom values.
  const supportsCustomTemperature = !/^gpt-5/i.test(client.model);

  const translateOne = async (chunk: string): Promise<string> => {
    const params: Record<string, unknown> = {
      model: client.model,
      messages: [
        { role: "system", content: TRANSLATE_GLOSSARY },
        { role: "user", content: chunk },
      ],
    };
    if (supportsCustomTemperature) params.temperature = 0.1;
    const resp = await openai.chat.completions.create(
      params as Parameters<typeof openai.chat.completions.create>[0]
    );
    return resp.choices[0]?.message?.content?.trim() ?? "";
  };

  // Translate chunks in parallel (bounded) so a long doc doesn't take N×latency.
  const concurrency = 4;
  const out: string[] = new Array(chunks.length);
  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((c) => translateOne(c)));
    results.forEach((r, j) => {
      out[i + j] = r;
    });
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
    if (cached?.manualOverrideMarkdown) {
      return {
        nodeType,
        language: "ar",
        markdown: cached.manualOverrideMarkdown,
        sourceUrl: cached.sourceUrl,
        fetchedAt: toISO(cached.manualOverrideAt ?? cached.fetchedAt),
        fromCache: true,
        manualOverride: true,
      };
    }
    if (cached?.markdown) {
      const hasUnresolved =
        /--8<--/.test(cached.markdown) ||
        /^---\r?\n[\s\S]*?\r?\n---/.test(cached.markdown) ||
        /\/\/\/\s*[a-zA-Z]+\s*\|/.test(cached.markdown);
      if (!hasUnresolved) {
        return {
          nodeType,
          language: "ar",
          markdown: cached.markdown,
          sourceUrl: cached.sourceUrl,
          fetchedAt: toISO(cached.fetchedAt),
          fromCache: true,
        };
      }
      logger.info({ nodeType }, "Re-translating Arabic doc to resolve stale artifacts");
    }
  }

  // Need EN first (force refresh if cached EN looks stale too)
  const en = await getEnglishDoc(nodeType, force);
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
    await upsertDoc({ nodeType, language: "ar", markdown: null, sourceUrl: en.sourceUrl, error: msg });
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
    fetchedAt: toISO(saved.fetchedAt),
    fromCache: false,
  };
}

/* ───────────────────────── Bulk: fetch English docs ───────────────────────── */

/**
 * Fetches English docs for ALL nodes in catalog that don't already have one.
 * Concurrency-limited to be polite to GitHub.
 * Reports real-time progress via the optional `onProgress` callback (called
 * approximately every 5 nodes to reduce overhead).
 */
export async function bulkFetchEnglishDocs(
  opts: { force?: boolean; concurrency?: number } = {},
  onProgress?: ProgressCallback
): Promise<BulkFetchProgress> {
  const concurrency = opts.concurrency ?? 6;

  const allNodes = await db
    .select({ nodeType: nodeCatalogTable.nodeType, primaryDocsUrl: nodeCatalogTable.primaryDocsUrl })
    .from(nodeCatalogTable);

  let target = allNodes.filter((n) => !!n.primaryDocsUrl);

  if (!opts.force) {
    const existing = await db
      .select({
        nodeType: nodeDocsTable.nodeType,
        hasMd: sql<boolean>`(${nodeDocsTable.markdown} IS NOT NULL)`,
      })
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

  onProgress?.({ ...progress });

  let idx = 0;
  async function worker() {
    while (idx < target.length) {
      const i = idx++;
      const node = target[i];
      progress.attempted++;
      progress.current = node.nodeType;
      try {
        const r = await getEnglishDoc(node.nodeType, opts.force);
        if (r.markdown) progress.fetched++;
        else progress.failed++;
      } catch (err) {
        progress.failed++;
        logger.warn({ err, nodeType: node.nodeType }, "bulk doc fetch error");
      }
      // Emit progress every 5 nodes or at end
      if (progress.attempted % 5 === 0 || progress.attempted === target.length) {
        onProgress?.({ ...progress });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  progress.current = undefined;
  onProgress?.({ ...progress });
  logger.info(progress, "Bulk English docs fetch complete");
  return progress;
}

/* ───────────────────────── Bulk: translate to Arabic ───────────────────────── */

/**
 * Translates English docs to Arabic for all nodes that have English docs
 * but no Arabic translation yet. Concurrency is low (2) to respect OpenAI limits.
 */
export async function bulkTranslateArabicDocs(
  opts: { force?: boolean; concurrency?: number } = {},
  onProgress?: ProgressCallback
): Promise<BulkFetchProgress> {
  const concurrency = opts.concurrency ?? 8;

  // Get nodes that have English docs
  const enDocs = await db
    .select({ nodeType: nodeDocsTable.nodeType })
    .from(nodeDocsTable)
    .where(and(eq(nodeDocsTable.language, "en"), sql`${nodeDocsTable.markdown} IS NOT NULL`));

  let target = enDocs.map((r) => r.nodeType);

  if (!opts.force) {
    const arDocs = await db
      .select({ nodeType: nodeDocsTable.nodeType })
      .from(nodeDocsTable)
      .where(and(eq(nodeDocsTable.language, "ar"), sql`${nodeDocsTable.markdown} IS NOT NULL`));
    const translated = new Set(arDocs.map((r) => r.nodeType));
    target = target.filter((t) => !translated.has(t));
  }

  const progress: BulkFetchProgress = {
    total: target.length,
    attempted: 0,
    fetched: 0,
    failed: 0,
  };

  onProgress?.({ ...progress });

  let idx = 0;
  async function worker() {
    while (idx < target.length) {
      const i = idx++;
      const nodeType = target[i];
      progress.attempted++;
      progress.current = nodeType;
      try {
        const r = await getArabicDoc(nodeType, opts.force);
        if (r.markdown) progress.fetched++;
        else progress.failed++;
      } catch (err) {
        progress.failed++;
        logger.warn({ err, nodeType }, "bulk Arabic translation error");
      }
      if (progress.attempted % 3 === 0 || progress.attempted === target.length) {
        onProgress?.({ ...progress });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  progress.current = undefined;
  onProgress?.({ ...progress });
  logger.info(progress, "Bulk Arabic translation complete");
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
  localFiles: { en: number; ar: number };
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
  const localFiles = await getLocalFilesStats();

  return {
    totalNodes,
    enFetched,
    enMissing: Math.max(0, totalNodes - enFetched),
    arTranslated,
    arPending: Math.max(0, enFetched - arTranslated),
    lastFetchedAt: toISO(enRows[0]?.lastAt),
    localFiles,
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

  // Also persist to local filesystem when we have content
  if (input.markdown) {
    try {
      await saveDocToFile(input.nodeType, input.language, input.markdown);
    } catch (err) {
      logger.warn({ err, nodeType: input.nodeType, lang: input.language }, "Failed to save doc to local file");
    }

    // Keep the BM25 sections index in sync so the global search can find this
    // newly-fetched/translated doc. Imported lazily to avoid a circular dep.
    try {
      const { reindexNodeSections } = await import("./docsAdvanced.service");
      await reindexNodeSections(input.nodeType, input.language, input.markdown);
    } catch (err) {
      logger.warn(
        { err, nodeType: input.nodeType, lang: input.language },
        "Failed to reindex sections for global search"
      );
    }
  }

  return inserted[0];
}

/* ───────────────────────── Search-within-docs (RAG-lite) ───────────────────────── */

/**
 * Simple keyword scoring over the cached docs for a given node — returns the
 * top-N most relevant ~80-line slices for an agent to consume.
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
