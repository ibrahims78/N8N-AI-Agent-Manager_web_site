/**
 * صفحة أدلة n8n العامة (Glossary, Hosting, Workflows, Expressions, …).
 *
 * تتصل بـ /api/catalog/docs-advanced/guides وتدعم:
 *   - عرض احترافي مع إحصاءات (إنجليزي/عربي/تحرير يدوي)
 *   - بحث نصّي شامل عبر محتوى كل الأدلة (server-side)
 *   - تصفية محلية فورية + تجميع حسب الفئة
 *   - عرض Markdown بتنسيق احترافي (RTL/LTR)
 *   - تحرير يدوي للترجمة العربية + حفظ/مسح override (للأدمن)
 *   - إعادة جلب فردية + جلب جماعي + ترجمة بـ SSE (للأدمن)
 *   - نسخ وتنزيل المحتوى
 */
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import {
  BookOpen, Loader2, RefreshCw, Search, ExternalLink, Folder,
  Languages, Pencil, Save, X, Copy, Download, CheckCircle2,
  AlertCircle, Clock, FileText, Eye, Trash2, Sparkles,
  PanelLeftClose, PanelLeftOpen, MoreHorizontal, ChevronRight,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useContentRefresh,
  ContentRefreshStrip,
} from "@/components/ContentRefreshPanel";

interface GuideListItem {
  slug: string;
  title: string;
  category: string;
  hasMarkdown: boolean;
  hasOverride: boolean;
  length: number;
  sourceUrl: string | null;
  error: string | null;
  fetchedAt: string;
  updatedAt: string;
}

interface GuideDoc {
  slug: string;
  title: string;
  category: string;
  markdown: string | null;
  effectiveMarkdown: string | null;
  manualOverrideMarkdown: string | null;
  manualOverrideAt: string | null;
  manualOverrideBy: number | null;
  manualOverrideNote: string | null;
  sourceUrl: string | null;
  sourceSha: string | null;
  error: string | null;
  fetchedAt: string;
  updatedAt: string;
}

interface GuidesStats {
  total: number;
  en: number;
  ar: number;
  overrides: number;
  lastUpdated: string | null;
}

interface SearchHit {
  slug: string;
  title: string;
  category: string;
  snippet: string;
  hits: number;
}

export default function GuidesPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { toast } = useToast();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const appLang = useAppStore((s) => s.language);
  // Independent per-page language for guide *content* (defaults to the app
  // language but can be toggled without changing the whole UI direction).
  const [lang, setLang] = useState<"ar" | "en">(appLang);
  useEffect(() => { setLang(appLang); }, [appLang]);

  const [list, setList] = useState<GuideListItem[]>([]);
  const [stats, setStats] = useState<GuidesStats | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [doc, setDoc] = useState<GuideDoc | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Search & filter state
  const [filter, setFilter] = useState("");
  const [searchHits, setSearchHits] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual edit state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // UI state — collapsible sidebar gives a wide reading mode.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const t = (ar: string, en: string) => (isRTL ? ar : en);

  /* ────────────────── Loaders ────────────────── */

  async function loadList() {
    setLoadingList(true);
    try {
      const [l, s] = await Promise.all([
        apiRequest<{ success: boolean; data: { guides: GuideListItem[] } }>(
          `/catalog/docs-advanced/guides?lang=${lang}`
        ),
        apiRequest<{ success: boolean; data: GuidesStats }>(
          `/catalog/docs-advanced/guides/stats`
        ),
      ]);
      setList(l.data.guides);
      setStats(s.data);
    } catch (err) {
      toast({ title: t("خطأ", "Error"), description: String(err), variant: "destructive" });
    } finally { setLoadingList(false); }
  }

  // Reload when language changes so EN/AR stay in sync.
  useEffect(() => {
    loadList();
    if (selectedSlug) loadDoc(selectedSlug);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [lang]);

  async function loadDoc(slug: string, force = false) {
    setSelectedSlug(slug);
    setLoadingDoc(true);
    setDoc(null);
    setEditing(false);
    try {
      const params = new URLSearchParams({ lang });
      if (force) params.set("force", "true");
      const r = await apiRequest<{ success: boolean; data: GuideDoc }>(
        `/catalog/docs-advanced/guides/${slug}?${params.toString()}`
      );
      setDoc(r.data);
    } catch (err) {
      toast({ title: t("خطأ", "Error"), description: String(err), variant: "destructive" });
    } finally { setLoadingDoc(false); }
  }

  /* ────────────────── Search (debounced server-side) ────────────────── */

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = filter.trim();
    if (q.length < 2) {
      setSearchHits(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await apiRequest<{ success: boolean; data: { hits: SearchHit[] } }>(
          `/catalog/docs-advanced/guides/search?q=${encodeURIComponent(q)}&lang=${lang}`
        );
        setSearchHits(r.data.hits);
      } catch {
        setSearchHits([]);
      } finally { setSearching(false); }
    }, 250);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [filter, lang]);

  /* ────────────────── Bulk refresh (SSE) ──────────────────
   *
   * Phase 6B: the refresh logic is now the shared <ContentRefreshPanel>
   * (`useContentRefresh` hook + presentational subcomponents). It talks to
   * the unified `/api/content/:kind/refresh-all` endpoint, parses named-event
   * SSE, normalises the EN/AR bucket shape, and shows the multi-segment bar
   * + toast. We just wire `onComplete` to reload the visible list/doc.
   */
  const refreshCtrl = useContentRefresh({
    kind: "guide",
    supportsTranslation: true,
    onComplete: async () => {
      await loadList();
      if (selectedSlug) await loadDoc(selectedSlug);
    },
  });

  /* ────────────────── Manual edit save/clear ────────────────── */

  function startEdit() {
    if (!doc) return;
    setDraft(doc.effectiveMarkdown ?? "");
    setEditing(true);
  }

  async function saveOverride() {
    if (!doc) return;
    if (draft.trim().length < 5) {
      toast({ title: t("نص قصير", "Too short"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiRequest(
        `/catalog/docs-advanced/guides/${doc.slug}/manual?lang=${lang}`,
        { method: "PUT", body: JSON.stringify({ markdown: draft }) }
      );
      toast({ title: t("تم الحفظ", "Saved"), description: t("تم حفظ التعديل اليدوي.", "Manual edit saved.") });
      setEditing(false);
      await Promise.all([loadList(), loadDoc(doc.slug)]);
    } catch (err) {
      toast({ title: t("خطأ", "Error"), description: String(err), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function clearOverride() {
    if (!doc) return;
    if (!confirm(t("مسح التحرير اليدوي والعودة للنص الأصلي؟", "Clear manual edit and revert to upstream?"))) return;
    try {
      await apiRequest(
        `/catalog/docs-advanced/guides/${doc.slug}/manual?lang=${lang}`,
        { method: "DELETE" }
      );
      toast({ title: t("تم المسح", "Cleared") });
      await Promise.all([loadList(), loadDoc(doc.slug)]);
    } catch (err) {
      toast({ title: t("خطأ", "Error"), description: String(err), variant: "destructive" });
    }
  }

  function copyMarkdown() {
    if (!doc?.effectiveMarkdown) return;
    navigator.clipboard.writeText(doc.effectiveMarkdown);
    toast({ title: t("تم النسخ", "Copied") });
  }

  function downloadMarkdown() {
    if (!doc?.effectiveMarkdown) return;
    const blob = new Blob([doc.effectiveMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.slug}.${lang}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ────────────────── Derived ────────────────── */

  const grouped = useMemo(() => {
    const g: Record<string, GuideListItem[]> = {};
    list.forEach((it) => { (g[it.category] = g[it.category] || []).push(it); });
    return g;
  }, [list]);

  const categoryLabels: Record<string, string> = {
    glossary: t("المعجم", "Glossary"),
    workflows: t("سير العمل", "Workflows"),
    expressions: t("Expressions والكود", "Expressions & Code"),
    credentials: t("الاعتمادات", "Credentials"),
    hosting: t("الاستضافة", "Hosting"),
    api: t("API", "API"),
  };

  const categoryColors: Record<string, string> = {
    glossary: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    workflows: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    expressions: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    credentials: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    hosting: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    api: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  };

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(isRTL ? "ar-EG" : "en-US", {
        dateStyle: "medium", timeStyle: "short",
      });
    } catch { return iso; }
  };

  /* ────────────────── Render ────────────────── */

  return (
    <div className="h-full flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── COMPACT TOOLBAR ─────────────────────────────────────────────
          A single, slim row that surfaces *all* controls without eating
          vertical space. The data (the actual document) is the star —
          controls are condensed, dropdownned, or moved into the sidebar. */}
      <div className="border-b border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <div className="px-3 sm:px-4 h-12 flex items-center gap-2">
          {/* Sidebar toggle (visible on md+; on mobile the sidebar is always open) */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hidden md:inline-flex"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? t("إخفاء القائمة", "Hide sidebar") : t("إظهار القائمة", "Show sidebar")}
          >
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </Button>

          {/* Brand mark */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent/20 to-accent/5 text-accent flex items-center justify-center shrink-0">
              <BookOpen size={14} />
            </div>
            <h1 className="text-sm font-semibold leading-tight truncate">
              {t("أدلة n8n", "n8n Guides")}
            </h1>
          </div>

          {/* Inline stat chips — all key numbers at a glance, on one line. */}
          {stats && (
            <div className="hidden lg:flex items-center gap-1 ms-2 ps-2 border-s border-border/60">
              <StatChip
                icon={<FileText size={11} />}
                label={t("الإجمالي", "Total")}
                value={stats.total}
                tone="muted"
              />
              <StatChip
                icon={<CheckCircle2 size={11} />}
                label="EN"
                value={`${stats.en}`}
                sub={pct(stats.en, stats.total)}
                tone="blue"
              />
              <StatChip
                icon={<Languages size={11} />}
                label="AR"
                value={`${stats.ar}`}
                sub={pct(stats.ar, stats.total)}
                tone="emerald"
              />
              {stats.overrides > 0 && (
                <StatChip
                  icon={<Pencil size={11} />}
                  label={t("تحرير", "Edits")}
                  value={stats.overrides}
                  tone="amber"
                />
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Global search — compact, expands on focus */}
          <div className="relative w-44 sm:w-56 md:w-64 lg:w-72">
            <Search size={13} className={`absolute ${isRTL ? "right-2.5" : "left-2.5"} top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none`} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("بحث في الأدلة...", "Search guides...")}
              className={`w-full bg-background border border-border rounded-md ${isRTL ? "pr-8 pl-8" : "pl-8 pr-8"} h-8 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition`}
            />
            {filter && (
              <button
                onClick={() => setFilter("")}
                className={`absolute ${isRTL ? "left-1.5" : "right-1.5"} top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground`}
                aria-label="clear"
              >
                <X size={12} />
              </button>
            )}
            {searching && (
              <Loader2 size={12} className={`absolute ${isRTL ? "left-7" : "right-7"} top-1/2 -translate-y-1/2 animate-spin text-muted-foreground`} />
            )}
          </div>

          {/* Per-page language toggle (compact pill) */}
          <div
            className="inline-flex items-center rounded-md border border-border bg-background p-0.5 text-[11px] font-medium shrink-0"
            role="group"
            aria-label={t("لغة الأدلة", "Guides language")}
          >
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-2 py-1 rounded-[4px] transition-colors ${
                lang === "ar" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
              aria-pressed={lang === "ar"}
              title={t("عرض الأدلة بالعربية", "Show guides in Arabic")}
            >
              AR
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded-[4px] transition-colors ${
                lang === "en" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
              aria-pressed={lang === "en"}
              title={t("عرض الأدلة بالإنجليزية", "Show guides in English")}
            >
              EN
            </button>
          </div>

          {/* Admin: refresh actions tucked into a dropdown to keep toolbar slim */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  disabled={refreshCtrl.refreshing}
                  title={t("إجراءات المسؤول", "Admin actions")}
                >
                  {refreshCtrl.refreshing
                    ? <Loader2 size={13} className="animate-spin" />
                    : <RefreshCw size={13} />}
                  <span className="hidden sm:inline text-xs">{t("تحديث", "Refresh")}</span>
                  <MoreHorizontal size={12} className="opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="text-[11px]">
                  {t("إجراءات المحتوى", "Content actions")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => refreshCtrl.refresh({ translate: true, dryRun: true })}
                  disabled={refreshCtrl.refreshing}
                  className="text-xs gap-2"
                >
                  <Search size={13} className="text-sky-600 dark:text-sky-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t("تحقق من التحديثات", "Check for updates")}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {t("بدون كتابة على القاعدة أو استدعاء AI", "No DB writes or AI calls")}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => refreshCtrl.refresh({ translate: false })}
                  disabled={refreshCtrl.refreshing}
                  className="text-xs gap-2"
                >
                  <RefreshCw size={13} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t("جلب الكل (EN)", "Fetch all (EN)")}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {t("تحديث المصدر الإنجليزي فقط", "Update English source only")}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => refreshCtrl.refresh({ translate: true })}
                  disabled={refreshCtrl.refreshing}
                  className="text-xs gap-2"
                >
                  <Languages size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{t("جلب + ترجمة AR", "Fetch + Translate AR")}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {t("يستهلك مفاتيح OpenAI/Gemini", "Uses OpenAI/Gemini keys")}
                    </div>
                  </div>
                </DropdownMenuItem>
                {stats?.lastUpdated && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <Clock size={10} />
                      {t("آخر تحديث:", "Last updated:")} {fmtDate(stats.lastUpdated)}
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mini stats row — only on small screens where they don't fit in the toolbar */}
        {stats && (
          <div className="lg:hidden px-3 sm:px-4 pb-2 flex items-center gap-1.5 overflow-x-auto">
            <StatChip icon={<FileText size={11} />} label={t("الإجمالي","Total")} value={stats.total} tone="muted" />
            <StatChip icon={<CheckCircle2 size={11} />} label="EN" value={`${stats.en}`} sub={pct(stats.en, stats.total)} tone="blue" />
            <StatChip icon={<Languages size={11} />} label="AR" value={`${stats.ar}`} sub={pct(stats.ar, stats.total)} tone="emerald" />
            {stats.overrides > 0 && (
              <StatChip icon={<Pencil size={11} />} label={t("تحرير","Edits")} value={stats.overrides} tone="amber" />
            )}
          </div>
        )}

        {/* Phase 6B: shared multi-segment progress strip wired to the
            unified content API. Only renders while a refresh is active. */}
        <ContentRefreshStrip
          ctrl={refreshCtrl}
          labels={{
            fetching: t("جاري الجلب:", "Fetching:"),
            translating: t("جاري الترجمة:", "Translating:"),
            checkingFetch: t("فحص المصدر:", "Checking source:"),
            checkingTranslate: t("فحص الترجمة:", "Checking translation:"),
          }}
        />
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────
          Sidebar collapses on demand to give the document full width
          (reading mode). The grid template responds to `sidebarOpen`. */}
      <div
        className={`flex-1 grid grid-cols-1 ${
          sidebarOpen
            ? "md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr]"
            : "md:grid-cols-[0_1fr]"
        } overflow-hidden transition-[grid-template-columns] duration-200`}
      >
        {/* SIDEBAR */}
        <ScrollArea
          className={`${isRTL ? "border-s" : "border-e"} border-border bg-muted/20 ${
            sidebarOpen ? "" : "md:hidden"
          }`}
        >
          <div className="p-3 space-y-4">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : list.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={28} />}
                title={t("لا توجد أدلة بعد","No guides yet")}
                hint={isAdmin ? t("اضغط «جلب الكل (EN)» للبدء.","Click 'Fetch all (EN)' to start.") : t("لم يقم المسؤول بجلب الأدلة بعد.","An admin hasn't fetched the guides yet.")}
              />
            ) : searchHits !== null ? (
              <SearchResults
                hits={searchHits}
                isRTL={isRTL}
                t={t}
                categoryLabels={categoryLabels}
                categoryColors={categoryColors}
                selectedSlug={selectedSlug}
                onPick={(slug) => { loadDoc(slug); }}
              />
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Folder size={12} />
                      <span>{categoryLabels[cat] || cat}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${categoryColors[cat] || "border-border"}`}>{items.length}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {items.map((g) => (
                      <li key={g.slug}>
                        <button
                          onClick={() => loadDoc(g.slug)}
                          className={`w-full text-start px-2.5 py-2 rounded-md text-xs transition-colors flex items-center gap-2 group ${
                            selectedSlug === g.slug
                              ? "bg-accent/15 text-accent font-medium"
                              : "hover:bg-muted/70"
                          }`}
                        >
                          <span className="flex-1 truncate">{g.title}</span>
                          {g.hasOverride && (
                            <span title={t("يوجد تحرير يدوي","Has manual override")}>
                              <Pencil size={10} className="text-amber-500" />
                            </span>
                          )}
                          {!g.hasMarkdown ? (
                            <span title={t("غير متوفر","Not available")}>
                              <AlertCircle size={11} className="text-rose-500" />
                            </span>
                          ) : (
                            <span title={t("متوفر","Available")}>
                              <CheckCircle2 size={11} className="text-emerald-500/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* CONTENT */}
        <div className="flex flex-col overflow-hidden bg-background">
          {loadingDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" />
              <span className="text-xs">{t("جاري التحميل...","Loading...")}</span>
            </div>
          ) : !doc ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-sm font-medium">{t("اختر دليلاً للبدء","Pick a guide to start")}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {t(
                    "تصفّح الأدلة من الجانب أو ابحث في المحتوى عبر شريط البحث في الأعلى.",
                    "Browse guides on the side or search content using the bar above."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Doc header — slim, content-focused, with breadcrumb context.
                  Action bar is icon-only (with tooltips) to maximize the
                  reading area. */}
              <div className="border-b border-border bg-card/30 px-4 sm:px-6 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  {/* Breadcrumb: Category › Title (replaces the old badge row) */}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
                    <Folder size={10} />
                    <span className={`font-medium ${(categoryColors[doc.category] || "").includes("text-") ? categoryColors[doc.category].split(" ").find((c) => c.startsWith("text-")) ?? "" : ""}`}>
                      {categoryLabels[doc.category] || doc.category}
                    </span>
                    <ChevronRight size={10} className={isRTL ? "rotate-180" : ""} />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-[15px] leading-tight truncate">{doc.title}</h2>
                    {doc.manualOverrideMarkdown && (
                      <Badge variant="outline" className="text-[10px] h-5 gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400">
                        <Pencil size={9} /> {t("تحرير يدوي","Manual")}
                      </Badge>
                    )}
                    {doc.error && (
                      <Badge variant="outline" className="text-[10px] h-5 gap-1 border-rose-500/40 text-rose-700 dark:text-rose-400">
                        <AlertCircle size={9} /> {t("خطأ","Error")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={9} />
                      {fmtDate(doc.updatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText size={9} />
                      {(doc.effectiveMarkdown?.length ?? 0).toLocaleString()} {t("حرف","chars")}
                    </span>
                    {doc.sourceUrl && (
                      <a href={doc.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent transition">
                        <ExternalLink size={9} /> {t("المصدر","source")}
                      </a>
                    )}
                  </div>
                </div>

                {/* Action bar — icon-only, compact */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {!editing && doc.effectiveMarkdown && (
                    <>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title={t("نسخ","Copy")} onClick={copyMarkdown}>
                        <Copy size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title={t("تنزيل .md","Download .md")} onClick={downloadMarkdown}>
                        <Download size={14} />
                      </Button>
                    </>
                  )}
                  {isAdmin && !editing && (
                    <>
                      <div className="w-px h-5 bg-border mx-1" />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title={t("إعادة الجلب","Re-fetch")} onClick={() => loadDoc(doc.slug, true)}>
                        <RefreshCw size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title={t("تحرير يدوي","Edit manually")} onClick={startEdit}>
                        <Pencil size={14} />
                      </Button>
                      {doc.manualOverrideMarkdown && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700" title={t("مسح التحرير اليدوي","Clear manual edit")} onClick={clearOverride}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </>
                  )}
                  {editing && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                        <X size={14} className="me-1" /> {t("إلغاء","Cancel")}
                      </Button>
                      <Button size="sm" onClick={saveOverride} disabled={saving}>
                        {saving ? <Loader2 size={14} className="animate-spin me-1" /> : <Save size={14} className="me-1" />}
                        {t("حفظ","Save")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {doc.manualOverrideMarkdown && doc.manualOverrideAt && !editing && (
                <div className="bg-amber-500/5 border-b border-amber-500/20 px-4 sm:px-6 py-1.5 text-[10px] text-amber-700 dark:text-amber-400 inline-flex items-center gap-1.5">
                  <Eye size={10} />
                  {t("هذه نسخة محرَّرة يدوياً — تجاوز للترجمة الآلية. آخر تعديل:", "Manually edited version — overrides the auto translation. Last edit:")} {fmtDate(doc.manualOverrideAt)}
                </div>
              )}

              {/* Body */}
              {editing ? (
                <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
                  <div className="flex flex-col border-e border-border">
                    <div className="px-3 py-1.5 bg-muted/40 border-b border-border text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <Pencil size={11} /> {t("Markdown — تحرير","Markdown — edit")}
                    </div>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      className="flex-1 w-full p-4 bg-background font-mono text-xs leading-relaxed focus:outline-none resize-none"
                      spellCheck={false}
                    />
                  </div>
                  <ScrollArea className="bg-muted/10">
                    <div className="px-3 py-1.5 bg-muted/40 border-b border-border text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 sticky top-0 z-10">
                      <Eye size={11} /> {t("معاينة","Preview")}
                    </div>
                    <article className={`prose prose-sm dark:prose-invert max-w-none p-5 ${lang === "ar" ? "prose-rtl" : ""}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft || "*(empty)*"}</ReactMarkdown>
                    </article>
                  </ScrollArea>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <article
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    className={`prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto p-6 md:p-8
                                prose-headings:scroll-mt-16 prose-headings:font-semibold
                                prose-h1:text-2xl prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border
                                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-1 prose-h2:border-b prose-h2:border-border/60
                                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-muted/70 prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:text-xs
                                prose-blockquote:border-s-4 prose-blockquote:border-accent/40 prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:not-italic
                                prose-table:text-sm prose-th:bg-muted/40 prose-td:border-border prose-th:border-border
                                prose-img:rounded-lg prose-img:border prose-img:border-border
                                ${lang === "ar" ? "prose-rtl text-[15px] leading-[1.85]" : ""}`}
                  >
                    {doc.effectiveMarkdown ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.effectiveMarkdown}</ReactMarkdown>
                    ) : (
                      <div className="not-prose text-center py-12">
                        <AlertCircle className="mx-auto text-rose-500 mb-2" />
                        <p className="text-sm text-rose-600 dark:text-rose-400">
                          {doc.error || t("هذا الدليل غير متاح حالياً.", "This guide is not available.")}
                        </p>
                        {isAdmin && (
                          <Button size="sm" variant="outline" className="mt-3" onClick={() => loadDoc(doc.slug, true)}>
                            <RefreshCw size={14} className="me-1.5" />
                            {t("محاولة الجلب","Try fetching")}
                          </Button>
                        )}
                      </div>
                    )}
                  </article>
                </ScrollArea>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────── Helper components ────────────────── */

function pct(num: number, den: number): string {
  if (!den) return "0%";
  return `${Math.round((num / den) * 100)}%`;
}

/**
 * Compact inline stat pill used in the slim toolbar.
 * Replaces the old big-card grid: icon + label + value + optional %, all
 * on one line so 4–5 stats fit comfortably next to the title.
 */
function StatChip({
  icon, label, value, tone = "muted", sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "muted" | "blue" | "emerald" | "amber";
  sub?: string;
}) {
  const tones: Record<string, string> = {
    muted: "border-border/70 bg-muted/40 text-foreground",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 h-7 text-[11px] font-medium tabular-nums whitespace-nowrap ${tones[tone]}`}
      title={sub ? `${label} · ${value} (${sub})` : `${label} · ${value}`}
    >
      <span className="opacity-80">{icon}</span>
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
      {sub && <span className="opacity-60 text-[10px]">· {sub}</span>}
    </div>
  );
}

function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground">
      <div className="mb-3 opacity-60">{icon}</div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs mt-1">{hint}</p>
    </div>
  );
}

function SearchResults({
  hits, isRTL, t, categoryLabels, categoryColors, selectedSlug, onPick,
}: {
  hits: SearchHit[];
  isRTL: boolean;
  t: (ar: string, en: string) => string;
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
  selectedSlug: string | null;
  onPick: (slug: string) => void;
}) {
  if (hits.length === 0) {
    return (
      <EmptyState
        icon={<Search size={26} />}
        title={t("لا نتائج","No matches")}
        hint={t("جرّب كلمات أخرى أو تحقق من الإملاء.","Try different keywords or check spelling.")}
      />
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="px-1 text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
        <Search size={11} /> {t(`${hits.length} نتيجة`, `${hits.length} results`)}
      </div>
      {hits.map((h) => (
        <button
          key={h.slug}
          onClick={() => onPick(h.slug)}
          className={`w-full text-start px-3 py-2.5 rounded-md text-xs transition-colors border ${
            selectedSlug === h.slug
              ? "bg-accent/15 border-accent/40 text-accent"
              : "border-transparent hover:bg-muted/70 hover:border-border"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-semibold flex-1 truncate">{h.title}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${categoryColors[h.category] || "border-border"}`}>
              {categoryLabels[h.category] || h.category}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">{h.hits}×</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{h.snippet}</p>
        </button>
      ))}
    </div>
  );
}
