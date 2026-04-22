/**
 * docsHelpers.ts — مرافق مشتركة لمعالجة Markdown:
 *  - parseSections: تقسيم المستند إلى أقسام بناءً على عناوين Markdown.
 *  - tokenize / buildTermVector: لتحضير TF-IDF / BM25.
 *  - cosineSimilarity / bm25Score: تشابه دلالي بدون تبعيات خارجية.
 *  - extractOperations: استخراج العمليات (Sub-nodes) من قسم "Operations".
 */

const STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "are", "you", "your",
  "use", "can", "not", "but", "all", "any", "see", "here", "have", "has",
  "في", "من", "على", "إلى", "عن", "هذا", "هذه", "ذلك", "تلك", "كل", "أو",
  "و", "أن", "إن", "لا", "ما", "هو", "هي", "كما", "بعد", "قبل",
]);

export interface ParsedSection {
  index: number;
  level: number; // 1..6
  title: string;
  path: string; // "H1 > H2 > H3"
  body: string;
  startLine: number;
}

export function parseSections(markdown: string): ParsedSection[] {
  const lines = markdown.split("\n");
  const stack: { level: number; title: string }[] = [];
  const sections: ParsedSection[] = [];
  let curBody: string[] = [];
  let curStart = 0;
  let curTitle = "(intro)";
  let curLevel = 0;
  let inFence = false;
  let idx = 0;

  function flush(endLine: number) {
    if (curBody.length === 0 && curTitle === "(intro)") return;
    const path = stack.map((s) => s.title).join(" > ") || curTitle;
    sections.push({
      index: idx++,
      level: curLevel || 1,
      title: curTitle,
      path,
      body: curBody.join("\n").trim(),
      startLine: curStart,
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line.trim())) inFence = !inFence;
    const m = !inFence && /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush(i);
      curBody = [];
      curStart = i;
      curLevel = m[1].length;
      curTitle = m[2].replace(/[#*`]/g, "").trim();
      while (stack.length > 0 && stack[stack.length - 1].level >= curLevel) stack.pop();
      stack.push({ level: curLevel, title: curTitle });
      continue;
    }
    curBody.push(line);
  }
  flush(lines.length);
  return sections;
}

export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

export function buildTermVector(tokens: string[]): Record<string, number> {
  const v: Record<string, number> = {};
  for (const t of tokens) v[t] = (v[t] || 0) + 1;
  return v;
}

export function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
): number {
  let dot = 0, na = 0, nb = 0;
  for (const k of Object.keys(a)) {
    na += a[k] * a[k];
    if (b[k]) dot += a[k] * b[k];
  }
  for (const k of Object.keys(b)) nb += b[k] * b[k];
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** BM25 score — okapi BM25 (k1=1.2, b=0.75). */
export function bm25Score(
  termVector: Record<string, number>,
  docLen: number,
  avgDocLen: number,
  queryTerms: string[],
  termIdf: Record<string, number>
): number {
  const k1 = 1.2;
  const b = 0.75;
  let score = 0;
  for (const t of queryTerms) {
    const tf = termVector[t] || 0;
    if (tf === 0) continue;
    const idf = termIdf[t] || 0;
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLen / Math.max(avgDocLen, 1)));
    score += idf * (numerator / denominator);
  }
  return score;
}

/** استخراج كل العمليات (Operations) من قسم Operations كقائمة منظَّمة. */
export interface Operation {
  name: string;
  description: string;
  resource?: string;
  parameters: { name: string; required: boolean; description: string }[];
}

export function extractOperations(markdown: string): Operation[] {
  const sections = parseSections(markdown);
  const operations: Operation[] = [];

  // Find any section whose title looks like Operations / Actions / العمليات
  const opsSections = sections.filter((s) =>
    /^(operations?|actions?|العمليات|الإجراءات)\b/i.test(s.title)
  );

  for (const ops of opsSections) {
    // Strategy A — sub-sections (H3+H4) inside Operations body
    const sub = sections.filter(
      (s) =>
        s.startLine > ops.startLine &&
        s.level > ops.level &&
        s.path.includes(ops.title)
    );
    if (sub.length > 0) {
      let resource: string | undefined;
      for (const s of sub) {
        if (s.level === ops.level + 1) {
          resource = s.title;
        } else if (s.level === ops.level + 2) {
          operations.push({
            name: s.title,
            description: s.body.split("\n").find((l) => l.trim()) || "",
            resource,
            parameters: extractParametersFromBody(s.body),
          });
        }
      }
      if (operations.length > 0) continue;
    }

    // Strategy B — bullet list ( * **Resource**  /  * **Operation**: desc )
    const lines = ops.body.split("\n");
    let curResource: string | undefined;
    for (const line of lines) {
      const top = /^[\s]*[*-]\s+\*\*([^*]+)\*\*\s*[:\-—]?\s*(.*)$/.exec(line);
      if (!top) continue;
      const indent = (line.match(/^\s*/)?.[0] || "").length;
      const isNested = indent >= 2;
      const name = top[1].trim();
      const desc = top[2].trim().replace(/\.\s*$/, "");
      if (!isNested) {
        curResource = name;
      } else {
        operations.push({
          name,
          description: desc,
          resource: curResource,
          parameters: [],
        });
      }
    }
  }
  return operations;
}

function extractParametersFromBody(body: string): { name: string; required: boolean; description: string }[] {
  const params: { name: string; required: boolean; description: string }[] = [];
  const lines = body.split("\n");
  for (const line of lines) {
    const m = /^\s*[-*]\s+\*?\*?([A-Za-z][\w\s]+?)\*?\*?\s*[:：-]\s*(.+)$/.exec(line);
    if (m) {
      const name = m[1].trim();
      const desc = m[2].trim();
      const required = /required|mandatory|إلزامي|مطلوب/i.test(desc);
      if (name.length > 1 && name.length < 60) {
        params.push({ name, required, description: desc.replace(/\.\s*$/, "") });
      }
    }
  }
  return params.slice(0, 30);
}
