import { useState, type ReactNode } from "react";
import { Check, Link2 } from "lucide-react";
import { slugify } from "@/lib/markdown-toc";

interface AnchorHeadingProps {
  level: 1 | 2 | 3;
  children: ReactNode;
  isRTL: boolean;
}

/** Best-effort plain-text rendering of a ReactMarkdown heading's children. */
function flattenText(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (typeof node === "object" && "props" in (node as object)) {
    return flattenText(
      (node as { props?: { children?: ReactNode } }).props?.children,
    );
  }
  return "";
}

/**
 * Heading that stamps a stable slug-based `id` and exposes a small
 * "copy link" button that appears on hover. Clicking the icon copies the
 * full page URL with the heading's hash to the clipboard.
 */
export function AnchorHeading({ level, children, isRTL }: AnchorHeadingProps) {
  const text = flattenText(children).trim();
  const id = slugify(text) || undefined;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!id) return;
    try {
      const url = new URL(window.location.href);
      url.hash = id;
      await navigator.clipboard.writeText(url.toString());
      // Update the URL bar without scrolling so the user sees the new hash.
      window.history.replaceState(null, "", `#${id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const inner = (
    <>
      {children}
      {id && (
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label={isRTL ? "نسخ رابط هذا العنوان" : "Copy link to this heading"}
          title={
            copied
              ? isRTL
                ? "تمّ النسخ"
                : "Copied!"
              : isRTL
                ? "نسخ الرابط"
                : "Copy link"
          }
          className="ms-2 inline-flex items-center align-middle opacity-0 group-hover/heading:opacity-100 focus:opacity-100 transition-default text-muted-foreground hover:text-accent"
        >
          {copied ? (
            <Check size={14} className="text-emerald-500" />
          ) : (
            <Link2 size={14} />
          )}
        </button>
      )}
    </>
  );

  const cls = "group/heading scroll-mt-20 relative";
  if (level === 1) return <h1 id={id} className={cls}>{inner}</h1>;
  if (level === 2) return <h2 id={id} className={cls}>{inner}</h2>;
  return <h3 id={id} className={cls}>{inner}</h3>;
}
