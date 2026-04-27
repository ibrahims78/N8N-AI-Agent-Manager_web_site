/**
 * Extract a flat table-of-contents from a Markdown source. Only ATX-style
 * headings (`# heading`) at levels 1–3 are considered. Headings inside fenced
 * code blocks are skipped.
 *
 * Slugs are stable and match what `slugify(text)` produces, so the same
 * function can be used both client-side (for the TOC component) and inside
 * the heading component (to set the heading's `id`).
 */
export interface TocEntry {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

const HEADING_RE = /^(#{1,3})\s+(.+?)\s*#*\s*$/;
const FENCE_RE = /^(```|~~~)/;

/**
 * Slugify heading text to a URL-safe id. Preserves Arabic characters since
 * Arabic letters are valid in HTML ids (HTML5 allows any non-whitespace).
 */
export function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      // Strip Markdown emphasis markers and inline code backticks.
      .replace(/[`*_~]/g, "")
      // Strip Markdown link syntax: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Replace any whitespace run with a single hyphen.
      .replace(/\s+/g, "-")
      // Drop characters that are problematic in URL fragments but keep
      // unicode letters/digits (incl. Arabic) and "-".
      .replace(/[^\p{L}\p{N}\-]/gu, "")
      // Collapse repeated hyphens.
      .replace(/-+/g, "-")
      // Trim leading/trailing hyphens.
      .replace(/^-|-$/g, "")
  );
}

/**
 * De-duplicates collisions by appending "-2", "-3", … for repeated slugs.
 * The same de-dup logic is applied in `extractToc` so heading ids in the
 * rendered article line up with TOC links.
 */
function dedupe(entries: TocEntry[]): TocEntry[] {
  const seen = new Map<string, number>();
  return entries.map((e) => {
    const count = seen.get(e.id) ?? 0;
    seen.set(e.id, count + 1);
    return count === 0 ? e : { ...e, id: `${e.id}-${count + 1}` };
  });
}

export function extractToc(source: string): TocEntry[] {
  if (!source) return [];
  const lines = source.split(/\r?\n/);
  const out: TocEntry[] = [];
  let inFence = false;

  for (const line of lines) {
    if (FENCE_RE.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = HEADING_RE.exec(line);
    if (!m) continue;
    const level = m[1].length as 1 | 2 | 3;
    const text = m[2].trim();
    if (!text) continue;
    const id = slugify(text);
    if (!id) continue;
    out.push({ id, text, level });
  }
  return dedupe(out);
}
