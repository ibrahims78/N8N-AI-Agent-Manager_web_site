/**
 * GlobalDocsSearch.tsx
 * شريط بحث شامل يستعلم نظام BM25 على كل توثيقات العقد ويعرض نتائج مرتَّبة.
 */
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ChevronRight, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Hit {
  nodeType: string;
  language: "en" | "ar";
  sectionTitle: string;
  sectionPath: string;
  snippet: string;
  score: number;
}

export function GlobalDocsSearch({
  isRTL, lang, onPick,
}: {
  isRTL: boolean;
  lang: "en" | "ar";
  onPick: (nodeType: string) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // "any" → search both EN and AR (auto-fallback). Users can scope to one
  // language by clicking the chips below the input.
  const [scope, setScope] = useState<"any" | "en" | "ar">("any");
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setHits(null);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await apiRequest<{ success: boolean; data: { hits: Hit[] } }>(
          `/catalog/docs-advanced/search?q=${encodeURIComponent(q)}&lang=${scope}&limit=30`
        );
        setHits(r.data.hits);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [q, scope]);

  // Use lang prop only as the initial preferred direction for the dropdown.
  void lang;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search size={14} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted-foreground`} />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={isRTL ? "ابحث في كل التوثيقات الإنجليزية والعربية..." : "Search across all docs (EN + AR)..."}
          className={`w-full bg-background border border-border rounded-lg ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} py-2 text-sm focus:border-accent outline-none`}
          dir={isRTL ? "rtl" : "ltr"}
        />
        {q && (
          <button
            onClick={() => { setQ(""); setHits(null); }}
            className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
          ><X size={14} /></button>
        )}
      </div>

      {/* Scope chips — let users narrow the corpus to a single language */}
      <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
        <span className="text-muted-foreground">{isRTL ? "النطاق:" : "Scope:"}</span>
        {(["any", "en", "ar"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`px-2 py-0.5 rounded-full border transition-colors ${
              scope === s
                ? "bg-accent text-accent-foreground border-accent"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "any" ? (isRTL ? "الكل" : "All") : s.toUpperCase()}
          </button>
        ))}
      </div>

      {open && (q.trim().length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-xl max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> {isRTL ? "بحث..." : "Searching..."}
            </div>
          ) : !hits || hits.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              {isRTL ? "لا توجد نتائج. جرَّب كلمات أخرى." : "No results — try different keywords."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {hits.map((h, i) => (
                <li key={i}>
                  <button
                    onClick={() => { onPick(h.nodeType); setOpen(false); }}
                    className="w-full text-start p-3 hover:bg-muted/40 transition-colors"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="secondary" className="text-[10px]">{h.score.toFixed(1)}</Badge>
                      <span className="font-medium text-xs truncate">{h.nodeType}</span>
                      <ChevronRight size={10} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{h.sectionTitle}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{h.snippet}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
