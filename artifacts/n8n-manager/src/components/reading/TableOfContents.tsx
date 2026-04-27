import { useMemo, useState, type RefObject } from "react";
import { List, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { extractToc, type TocEntry } from "@/lib/markdown-toc";
import { useScrollSpy } from "@/hooks/useScrollSpy";

interface TableOfContentsProps {
  source: string;
  /** Ref to the scroll container holding the rendered article. */
  containerRef: RefObject<HTMLElement | null>;
  /** Reset trigger (e.g. doc id) to re-run scroll spy when content swaps. */
  resetKey?: unknown;
  isRTL: boolean;
}

function findHeading(
  containerRef: RefObject<HTMLElement | null>,
  id: string,
): HTMLElement | null {
  const root = containerRef.current;
  if (!root) return null;
  const scroller =
    root.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]") ?? root;
  return scroller.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
}

/**
 * Floating "Sections" button (top-end of the article container) that opens
 * a popover listing all `#`/`##`/`###` headings. Clicking an entry smoothly
 * scrolls the article to that heading and updates the URL hash. The active
 * entry is highlighted via `useScrollSpy`.
 */
export function TableOfContents({
  source,
  containerRef,
  resetKey,
  isRTL,
}: TableOfContentsProps) {
  const entries = useMemo<TocEntry[]>(() => extractToc(source), [source]);
  const ids = useMemo(() => entries.map((e) => e.id), [entries]);
  const activeId = useScrollSpy(containerRef, ids, resetKey);
  const [open, setOpen] = useState(false);

  if (entries.length < 2) return null;

  const handleJump = (id: string) => {
    const el = findHeading(containerRef, id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={isRTL ? "فهرس المحتويات" : "Table of contents"}
          className="absolute top-3 inset-inline-end-3 z-20 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/90 backdrop-blur px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm transition-default"
        >
          <List size={14} />
          <span className="hidden sm:inline">
            {isRTL ? "الفهرس" : "Sections"}
          </span>
          <span className="text-[10px] font-mono">({entries.length})</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={isRTL ? "start" : "end"}
        side="bottom"
        className="w-72 p-0"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">
            {isRTL ? "فهرس المحتويات" : "Contents"}
          </span>
          <button
            type="button"
            aria-label={isRTL ? "إغلاق" : "Close"}
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
        <ScrollArea className="max-h-[60vh]">
          <ul className="py-1">
            {entries.map((e) => {
              const isActive = e.id === activeId;
              const indent =
                e.level === 1
                  ? "ps-3"
                  : e.level === 2
                  ? "ps-5"
                  : "ps-8";
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => handleJump(e.id)}
                    className={`block w-full text-start ${indent} pe-3 py-1.5 text-xs leading-relaxed border-s-2 transition-default ${
                      isActive
                        ? "border-accent text-foreground bg-accent/10 font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {e.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
