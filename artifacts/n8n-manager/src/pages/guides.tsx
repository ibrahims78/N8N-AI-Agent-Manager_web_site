/**
 * صفحة الأدلة العامة (Glossary, Hosting, Workflows, Expressions, …)
 * مرتبطة بـ /api/catalog/docs-advanced/guides
 */
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import {
  BookOpen, Loader2, RefreshCw, Search, ExternalLink, Folder,
} from "lucide-react";
import { apiRequest, API_BASE, getAuthHeader } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAppStore } from "@/stores/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface GuideListItem {
  slug: string;
  title: string;
  category: string;
  hasMarkdown: boolean;
  sourceUrl: string | null;
  fetchedAt: string;
}

interface GuideDoc {
  slug: string;
  title: string;
  category: string;
  markdown: string | null;
  sourceUrl: string | null;
  error: string | null;
  fetchedAt: string;
}

export default function GuidesPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { toast } = useToast();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const lang = useAppStore((s) => s.language);

  const [list, setList] = useState<GuideListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [doc, setDoc] = useState<GuideDoc | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [filter, setFilter] = useState("");
  const [refreshAll, setRefreshAll] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    current: string;
    phase?: "fetch" | "translate";
  } | null>(null);

  async function loadList() {
    setLoadingList(true);
    try {
      const r = await apiRequest<{ success: boolean; data: { guides: GuideListItem[] } }>(
        `/catalog/docs-advanced/guides?lang=${lang}`
      );
      setList(r.data.guides);
    } finally { setLoadingList(false); }
  }
  // Reload list whenever the active language changes so EN/AR stay in sync.
  useEffect(() => { loadList(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [lang]);

  async function loadDoc(slug: string, force = false) {
    setSelectedSlug(slug);
    setLoadingDoc(true);
    setDoc(null);
    try {
      const params = new URLSearchParams();
      params.set("lang", lang);
      if (force) params.set("force", "true");
      const r = await apiRequest<{ success: boolean; data: GuideDoc }>(
        `/catalog/docs-advanced/guides/${slug}?${params.toString()}`
      );
      setDoc(r.data);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally { setLoadingDoc(false); }
  }

  /**
   * Fetch (and optionally translate to Arabic) every guide. Streams progress
   * events from the server with a `phase` field so we can show the user
   * whether we're currently fetching English or translating to Arabic.
   */
  async function refreshAllGuides(translate: boolean) {
    if (!isAdmin) return;
    setRefreshAll(true);
    setProgress({ done: 0, total: 0, current: "", phase: translate ? "fetch" : "fetch" });
    try {
      const auth = getAuthHeader().Authorization;
      const params = new URLSearchParams({ force: "true" });
      if (translate) params.set("translate", "true");
      const res = await fetch(
        `${API_BASE}/catalog/docs-advanced/guides/refresh-all?${params.toString()}`,
        {
          method: "POST",
          headers: auth ? { Authorization: auth } : {},
          credentials: "include",
        }
      );
      const reader = res.body?.getReader();
      if (!reader) throw new Error("no stream");
      const dec = new TextDecoder();
      let buf = "";
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
          if (evt.type === "progress") {
            setProgress({
              done: evt.done,
              total: evt.total,
              current: evt.current,
              phase: evt.phase,
            });
          } else if (evt.type === "done") {
            const enLine = `${evt.fetched}/${evt.total}` + (evt.failed ? ` (${evt.failed} failed)` : "");
            const arLine = translate
              ? ` — ${isRTL ? "ترجمة" : "AR"}: ${evt.translated ?? 0}/${evt.total}`
              : "";
            toast({
              title: isRTL ? "اكتمل تحديث الأدلة" : "Guides refreshed",
              description: enLine + arLine,
            });
          }
        }
      }
      await loadList();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setRefreshAll(false);
      setProgress(null);
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, GuideListItem[]> = {};
    list
      .filter((it) => !filter || (it.title + " " + it.slug).toLowerCase().includes(filter.toLowerCase()))
      .forEach((it) => { (g[it.category] = g[it.category] || []).push(it); });
    return g;
  }, [list, filter]);

  const categoryLabels: Record<string, string> = {
    glossary: isRTL ? "المعجم" : "Glossary",
    workflows: isRTL ? "Workflows" : "Workflows",
    expressions: isRTL ? "Expressions والكود" : "Expressions & Code",
    credentials: isRTL ? "الاعتمادات" : "Credentials",
    hosting: isRTL ? "الاستضافة" : "Hosting",
    api: isRTL ? "API" : "API",
  };

  return (
    <div className="h-full flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="text-accent" />
          <h1 className="text-lg font-semibold">{isRTL ? "أدلة n8n العامة" : "n8n General Guides"}</h1>
          <Badge variant="outline">{list.length}</Badge>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search size={14} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-muted-foreground`} />
          <input
            value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder={isRTL ? "تصفية..." : "Filter..."}
            className={`w-full bg-background border border-border rounded-lg ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"} py-1.5 text-sm`}
          />
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refreshAllGuides(false)} disabled={refreshAll}>
              {refreshAll ? <Loader2 size={14} className="animate-spin me-1" /> : <RefreshCw size={14} className="me-1" />}
              {isRTL ? "جلب الكل (إنجليزي)" : "Fetch all (EN)"}
            </Button>
            <Button size="sm" onClick={() => refreshAllGuides(true)} disabled={refreshAll}>
              {refreshAll ? <Loader2 size={14} className="animate-spin me-1" /> : <RefreshCw size={14} className="me-1" />}
              {isRTL ? "جلب + ترجمة للعربية" : "Fetch + Translate AR"}
            </Button>
          </div>
        )}
      </div>

      {progress && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-xs">
          {progress.phase === "translate"
            ? (isRTL ? "ترجمة للعربية:" : "Translating to Arabic:")
            : (isRTL ? "جلب من المصدر:" : "Fetching from source:")}{" "}
          {progress.current} ({progress.done}/{progress.total})
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        <ScrollArea className="md:border-e border-border bg-muted/20">
          <div className="p-3 space-y-3">
            {loadingList ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : list.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4">
                {isRTL ? "لم يتم جلب أي دليل بعد. اضغط «جلب الكل»." : "No guides cached yet. Click 'Fetch all'."}
              </div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-muted-foreground">
                    <Folder size={12} />{categoryLabels[cat] || cat}
                  </div>
                  <ul className="space-y-0.5">
                    {items.map((g) => (
                      <li key={g.slug}>
                        <button
                          onClick={() => loadDoc(g.slug)}
                          className={`w-full text-start px-2 py-1.5 rounded text-xs hover:bg-muted/60 transition-colors ${
                            selectedSlug === g.slug ? "bg-accent/10 text-accent font-medium" : ""
                          }`}
                        >
                          {g.title}
                          {!g.hasMarkdown && <span className="ms-1 text-red-500">✗</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="md:col-span-2 flex flex-col overflow-hidden">
          {loadingDoc ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
          ) : !doc ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              {isRTL ? "اختر دليلاً من القائمة" : "Pick a guide from the list"}
            </div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-2 flex items-center gap-2 bg-muted/30">
                <h2 className="font-semibold text-sm flex-1">{doc.title}</h2>
                {doc.sourceUrl && (
                  <a href={doc.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1">
                    <ExternalLink size={10} /> {isRTL ? "المصدر" : "source"}
                  </a>
                )}
                {isAdmin && (
                  <Button size="sm" variant="ghost" onClick={() => loadDoc(doc.slug, true)} className="h-7 px-2">
                    <RefreshCw size={12} />
                  </Button>
                )}
              </div>
              <ScrollArea className="flex-1">
                <article className="prose prose-sm dark:prose-invert max-w-none p-6">
                  {doc.markdown ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.markdown}</ReactMarkdown>
                  ) : (
                    <p className="text-red-500">{doc.error || (isRTL ? "غير متاح" : "Not available")}</p>
                  )}
                </article>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
