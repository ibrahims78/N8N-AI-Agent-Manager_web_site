/**
 * nodes-catalog.tsx — صفحة كتالوج عقد n8n الاحترافية.
 *
 * تتضمّن:
 *  - ترويسة مع شريط إحصاءات مرئي لكل المستخدمين (لا فقط الأدمن).
 *  - شريطَي بحث متمايزَين بوضوح:
 *      • بحث ذكي شامل في محتوى التوثيقات (BM25 على الخادم).
 *      • فلتر سريع للكتالوج بالاسم/الفئة/الاسم البديل.
 *  - شبكة بطاقات عقد متجاوبة مع شارات صحّة (EN/AR/Auth/Examples).
 *  - حوار تفاصيل بـ 3 تبويبات: معلومات، أمثلة، توثيق (EN/AR + تحرير + إصدارات).
 *  - لوحة تحكم الأدمن: تحديث الكتالوج، جلب التوثيقات، الترجمة، المزامنة الدورية، التصدير.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search, ExternalLink, BookOpen, KeyRound, Filter, Loader2,
  Zap, Package, ChevronLeft, ChevronRight, Tag, RefreshCw, Globe,
  Languages, FileText, CheckCircle2, AlertCircle, Database,
  HardDrive, FolderOpen, ChevronDown, ChevronUp, X, SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiRequest, API_BASE, getAuthHeader } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  OperationsPanel, HistoryPanel, ManualEditor, WorkflowJsonViewer,
} from "@/components/docs/AdvancedDocsTools";
import { GlobalDocsSearch } from "@/components/docs/GlobalDocsSearch";
import { SyncSettingsCard } from "@/components/docs/SyncSettingsCard";

interface CatalogItem {
  id: number;
  nodeType: string;
  displayName: string;
  folder: string;
  isTrigger: boolean;
  nodeVersion: string;
  categories: string[];
  aliases: string[];
  primaryDocsUrl: string | null;
  credentialDocsUrl: string | null;
  examples: { label: string; url: string; icon: string }[];
  iconUrl: string | null;
}

interface ListResp {
  items: CatalogItem[];
  total: number;
  limit: number;
  offset: number;
}

interface CategoryItem { name: string; count: number }

interface StatusItem {
  totalNodes: number; source: string; branch: string;
  fetchedAt: string | null; loadedFromStatic: boolean;
}

interface DocsStats {
  totalNodes: number;
  enFetched: number;
  enMissing: number;
  arTranslated: number;
  arPending: number;
  lastFetchedAt: string | null;
  localFiles: { en: number; ar: number };
}

interface DocCoverageEntry { nodeType: string; en: boolean; ar: boolean }

interface BulkProgress {
  total: number;
  attempted: number;
  fetched: number;
  failed: number;
  current?: string;
}

const PAGE_SIZE = 24;

/* ─────────────────────────────────────────────────── */
/* SSE streaming hook                                  */
/* ─────────────────────────────────────────────────── */
interface SSEError { message: string; code?: string }

function useSSEOperation() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<BulkProgress | null>(null);
  const [done, setDone] = useState<BulkProgress | null>(null);
  const [error, setError] = useState<SSEError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (
    url: string,
    onDone?: (result: { done: BulkProgress | null; error: SSEError | null }) => void
  ) => {
    if (running) return;
    setRunning(true);
    setProgress(null);
    setDone(null);
    setError(null);

    let finalDone: BulkProgress | null = null;
    let finalError: SSEError | null = null;

    abortRef.current = new AbortController();
    try {
      const resp = await fetch(`${API_BASE}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        credentials: "include",
        signal: abortRef.current.signal,
      });

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const lines = event.split("\n");
          let eventType = "message";
          let dataStr = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            else if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
          }
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr) as BulkProgress & { message?: string; code?: string };
            if (eventType === "done") {
              finalDone = data;
              setDone(data);
              setProgress(data);
            } else if (eventType === "error") {
              finalError = { message: data.message || "Unknown error", code: data.code };
              setError(finalError);
            } else {
              setProgress(data);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        finalError = { message: (err as Error).message || String(err) };
        setError(finalError);
        console.error("SSE error:", err);
      }
    } finally {
      setRunning(false);
      onDone?.({ done: finalDone, error: finalError });
    }
  }, [running]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  return { running, progress, done, error, start, stop };
}

/* ─────────────────────────────────────────────────── */
/* Progress Bar                                        */
/* ─────────────────────────────────────────────────── */
function ProgressBar({ value, max, color = "bg-accent" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Admin Panel                                         */
/* ─────────────────────────────────────────────────── */
function CatalogAdminPanel({
  isRTL,
  docsStats,
  status,
  onRefreshed,
}: {
  isRTL: boolean;
  docsStats: DocsStats | undefined;
  status: StatusItem | undefined;
  onRefreshed: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const fetchOp = useSSEOperation();
  const translateOp = useSSEOperation();

  async function authedFetch(path: string, init?: RequestInit) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(init?.headers as Record<string, string> | undefined),
    };
    return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
  }

  async function refreshCatalog() {
    setRefreshingCatalog(true);
    try {
      const r = await authedFetch(`/catalog/refresh`, { method: "POST" });
      const j = await r.json();
      if (j.success) {
        toast({
          title: isRTL ? "تم تحديث الكتالوج ✅" : "Catalog refreshed ✅",
          description: isRTL ? `إجمالي العقد: ${j.data.status.totalNodes}` : `Total nodes: ${j.data.status.totalNodes}`,
        });
        onRefreshed();
      } else {
        toast({ title: isRTL ? "فشل التحديث" : "Refresh failed", description: j.error?.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: isRTL ? "خطأ" : "Error", description: String(err), variant: "destructive" });
    } finally {
      setRefreshingCatalog(false);
    }
  }

  function handleFetchDone(result: { done: BulkProgress | null; error: SSEError | null }) {
    if (result.error) {
      toast({
        title: isRTL ? "فشل جلب التوثيقات" : "Documentation fetch failed",
        description: result.error.message,
        variant: "destructive",
      });
      onRefreshed();
      return;
    }
    const d = result.done;
    const fetched = d?.fetched ?? 0;
    const total = d?.total ?? 0;
    const failed = d?.failed ?? 0;
    toast({
      title: isRTL ? "اكتمل جلب التوثيقات ✅" : "Documentation fetch complete ✅",
      description: isRTL
        ? `جُلب ${fetched} من ${total} عقدة${failed ? ` (فشل ${failed})` : ""}`
        : `Fetched ${fetched} of ${total} nodes${failed ? ` (${failed} failed)` : ""}`,
      variant: failed > 0 && fetched === 0 ? "destructive" : undefined,
    });
    onRefreshed();
  }

  function handleTranslateDone(result: { done: BulkProgress | null; error: SSEError | null }) {
    // Distinguish three states:
    //   1. Pre-flight error (no AI key) — actionable, send the user to Settings
    //   2. All attempts failed — likely AI/quota issue mid-run
    //   3. Real success (full or partial)
    if (result.error) {
      const isNoKey = result.error.code === "no_ai_key";
      toast({
        title: isNoKey
          ? (isRTL ? "لم تبدأ الترجمة — مفتاح AI مفقود" : "Translation didn't start — AI key missing")
          : (isRTL ? "فشلت الترجمة" : "Translation failed"),
        description: isNoKey
          ? (isRTL
              ? "أضف مفتاح OpenAI من صفحة الإعدادات → تكامل الذكاء الاصطناعي ثم أعد المحاولة."
              : "Add an OpenAI key from Settings → AI Integrations and try again.")
          : result.error.message,
        variant: "destructive",
      });
      onRefreshed();
      return;
    }
    const d = result.done;
    const translated = d?.fetched ?? 0;
    const total = d?.total ?? 0;
    const failed = d?.failed ?? 0;
    if (total === 0) {
      toast({
        title: isRTL ? "لا يوجد ما يُترجم" : "Nothing to translate",
        description: isRTL
          ? "كل التوثيقات الإنجليزية المتوفرة مترجمة بالفعل."
          : "All available English docs are already translated.",
      });
      onRefreshed();
      return;
    }
    if (translated === 0) {
      toast({
        title: isRTL ? "لم تنجح الترجمة" : "Translation didn't succeed",
        description: isRTL
          ? `فشلت ${failed} محاولة من ${total}. تحقق من مفتاح AI وحصة الاستخدام.`
          : `${failed} of ${total} attempts failed. Check your AI key and quota.`,
        variant: "destructive",
      });
      onRefreshed();
      return;
    }
    toast({
      title: isRTL ? "اكتملت الترجمة ✅" : "Translation complete ✅",
      description: isRTL
        ? `تُرجم ${translated} من ${total}${failed ? ` (فشل ${failed})` : ""}`
        : `Translated ${translated} of ${total}${failed ? ` (${failed} failed)` : ""}`,
    });
    onRefreshed();
  }

  return (
    <Card className="border-accent/30 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Database size={16} className="text-accent" />
          {isRTL ? "لوحة تحكم التوثيق (مدير)" : "Documentation Control Panel (Admin)"}
          {(fetchOp.running || translateOp.running || refreshingCatalog) && (
            <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent/10 rounded-full px-2 py-0.5">
              <Loader2 size={9} className="animate-spin" />
              {isRTL ? "جاري التنفيذ..." : "Running..."}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              {/* Stats Grid */}
              {docsStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    icon={<Package size={16} className="text-accent" />}
                    label={isRTL ? "إجمالي العقد" : "Total Nodes"}
                    value={docsStats.totalNodes}
                    isRTL={isRTL}
                  />
                  <StatCard
                    icon={<BookOpen size={16} className="text-emerald-500" />}
                    label={isRTL ? "توثيقات EN" : "EN Docs"}
                    value={docsStats.enFetched}
                    total={docsStats.totalNodes}
                    color="bg-emerald-500"
                    isRTL={isRTL}
                  />
                  <StatCard
                    icon={<Languages size={16} className="text-blue-500" />}
                    label={isRTL ? "مترجم AR" : "AR Translated"}
                    value={docsStats.arTranslated}
                    total={docsStats.enFetched}
                    color="bg-blue-500"
                    isRTL={isRTL}
                  />
                  <StatCard
                    icon={<HardDrive size={16} className="text-purple-500" />}
                    label={isRTL ? "ملفات محلية" : "Local Files"}
                    value={docsStats.localFiles.en + docsStats.localFiles.ar}
                    subtitle={`EN: ${docsStats.localFiles.en} · AR: ${docsStats.localFiles.ar}`}
                    isRTL={isRTL}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* 1: Refresh Catalog */}
                <ActionCard
                  icon={<RefreshCw size={14} />}
                  title={isRTL ? "تحديث قائمة العقد" : "Update Node List"}
                  description={isRTL
                    ? "يجلب أحدث قائمة عقد من مستودع n8n الرسمي"
                    : "Fetches the latest node list from the official n8n repo"}
                  buttonLabel={isRTL ? "تحديث الآن" : "Update Now"}
                  running={refreshingCatalog}
                  disabled={fetchOp.running || translateOp.running}
                  onAction={refreshCatalog}
                  isRTL={isRTL}
                />

                {/* 2: Fetch English Docs */}
                <ActionCard
                  icon={<FileText size={14} />}
                  title={isRTL ? "جلب التوثيقات الإنجليزية" : "Fetch English Docs"}
                  description={isRTL
                    ? "يجلب التوثيق من GitHub ويحفظه في DB والملفات المحلية"
                    : "Fetches docs from GitHub and saves to DB + local files"}
                  buttonLabel={fetchOp.running ? (isRTL ? "جاري الجلب..." : "Fetching...") : (isRTL ? "جلب التوثيقات" : "Fetch Docs")}
                  running={fetchOp.running}
                  disabled={refreshingCatalog || translateOp.running}
                  onAction={() => fetchOp.start("/catalog/docs/fetch-all-stream?force=true", handleFetchDone)}
                  onStop={fetchOp.stop}
                  progress={fetchOp.progress}
                  progressColor="bg-emerald-500"
                  isRTL={isRTL}
                />

                {/* 3: Translate to Arabic */}
                <ActionCard
                  icon={<Languages size={14} />}
                  title={isRTL ? "ترجمة التوثيقات للعربية" : "Translate to Arabic"}
                  description={isRTL
                    ? "يترجم جميع التوثيقات للعربية ويحفظها محلياً"
                    : "Translates all docs to Arabic and saves locally"}
                  buttonLabel={translateOp.running ? (isRTL ? "جاري الترجمة..." : "Translating...") : (isRTL ? "ترجمة الكل" : "Translate All")}
                  running={translateOp.running}
                  disabled={refreshingCatalog || fetchOp.running}
                  onAction={() => translateOp.start("/catalog/docs/translate-all-stream?force=true", handleTranslateDone)}
                  onStop={translateOp.stop}
                  progress={translateOp.progress}
                  progressColor="bg-blue-500"
                  isRTL={isRTL}
                />
              </div>

              {/* Local files notice */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
                <FolderOpen size={13} className="shrink-0 mt-0.5 text-accent" />
                <span>
                  {isRTL
                    ? "يتم حفظ التوثيقات محلياً في مجلد lib/n8n-nodes-catalog/docs/ بصيغة Markdown لكل لغة على حدة، مما يتيح الوصول دون اتصال بالإنترنت."
                    : "Documentation is saved locally under lib/n8n-nodes-catalog/docs/ as Markdown files per language, enabling offline access."}
                </span>
              </div>

              {/* Sync settings + export tools */}
              <SyncSettingsCard isRTL={isRTL} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/** Compact stat tile used in the page hero (visible to all users). */
function HeroStat({
  icon, label, value, footer, color, progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  footer?: string;
  color?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/70 backdrop-blur-sm p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}{label}
      </div>
      <div className="text-2xl font-bold text-foreground leading-tight">
        {value.toLocaleString()}
      </div>
      {progress != null && (
        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div className={`h-full rounded-full ${color ?? "bg-accent"}`} style={{ width: `${progress}%` }} />
        </div>
      )}
      {footer && (
        <div className="text-[10px] text-muted-foreground font-mono">{footer}</div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, total, subtitle, color = "bg-accent", isRTL,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  subtitle?: string;
  color?: string;
  isRTL: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}{label}
      </div>
      <div className="text-xl font-bold text-foreground">{value.toLocaleString()}</div>
      {total != null && (
        <ProgressBar value={value} max={total} color={color} />
      )}
      {subtitle && (
        <div className="text-[10px] text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}

function ActionCard({
  icon, title, description, buttonLabel, running, disabled,
  onAction, onStop, progress, progressColor = "bg-accent", isRTL,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  running: boolean;
  disabled?: boolean;
  onAction: () => void;
  onStop?: () => void;
  progress?: BulkProgress | null;
  progressColor?: string;
  isRTL: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2.5 flex flex-col">
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground">{title}</div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">{description}</div>
        </div>
      </div>

      {running && progress && (
        <div className="space-y-1">
          <ProgressBar value={progress.attempted} max={progress.total} color={progressColor} />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
            <span>{progress.attempted} / {progress.total}</span>
            <span className="text-emerald-500">{progress.fetched} ✓</span>
            {progress.failed > 0 && <span className="text-red-500">{progress.failed} ✗</span>}
          </div>
          {progress.current && (
            <div className="text-[10px] text-muted-foreground truncate font-mono" title={progress.current} dir="ltr">
              ↳ {progress.current}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <Button
          size="sm"
          variant={running ? "secondary" : "outline"}
          className="flex-1 gap-1.5 text-xs h-7"
          disabled={disabled && !running}
          onClick={onAction}
        >
          {running ? <Loader2 size={12} className="animate-spin" /> : icon}
          {buttonLabel}
        </Button>
        {running && onStop && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground hover:text-foreground" onClick={onStop}>
            <X size={12} />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Main Page                                           */
/* ─────────────────────────────────────────────────── */
export default function NodesCatalogPage() {
  const { language } = useAppStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  useTranslation();
  const isRTL = language === "ar";
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<"all" | "trigger" | "regular">("all");
  const [page, setPage] = useState(1);
  const [openNodeType, setOpenNodeType] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CatalogItem | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, category, triggerFilter]);

  const params = useMemo(() => {
    const u = new URLSearchParams();
    if (debouncedSearch) u.set("search", debouncedSearch);
    if (category !== "all") u.set("category", category);
    if (triggerFilter !== "all") u.set("trigger", String(triggerFilter === "trigger"));
    u.set("limit", String(PAGE_SIZE));
    u.set("offset", String((page - 1) * PAGE_SIZE));
    return u.toString();
  }, [debouncedSearch, category, triggerFilter, page]);

  const { data: list, isLoading } = useQuery<ListResp>({
    queryKey: ["catalog", params],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: ListResp }>(`/catalog?${params}`);
      return r.data;
    },
  });

  const { data: cats } = useQuery<CategoryItem[]>({
    queryKey: ["catalog-categories"],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: { categories: CategoryItem[] } }>(`/catalog/categories`);
      return r.data.categories;
    },
  });

  const { data: status } = useQuery<StatusItem>({
    queryKey: ["catalog-status"],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: StatusItem }>(`/catalog/status`);
      return r.data;
    },
  });

  const { data: docsStats } = useQuery<DocsStats>({
    queryKey: ["docs-stats"],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: DocsStats }>(`/catalog/docs/stats`);
      return r.data;
    },
  });

  const { data: coverage } = useQuery<DocCoverageEntry[]>({
    queryKey: ["docs-coverage"],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: { coverage: DocCoverageEntry[] } }>(`/catalog/docs/coverage`);
      return r.data.coverage;
    },
  });

  const coverageMap = useMemo(() => {
    const m = new Map<string, DocCoverageEntry>();
    (coverage ?? []).forEach((c) => m.set(c.nodeType, c));
    return m;
  }, [coverage]);

  const totalPages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["catalog"] });
    qc.invalidateQueries({ queryKey: ["catalog-status"] });
    qc.invalidateQueries({ queryKey: ["catalog-categories"] });
    qc.invalidateQueries({ queryKey: ["docs-stats"] });
    qc.invalidateQueries({ queryKey: ["docs-coverage"] });
  }

  // Coverage % helpers (used in the header strip).
  const enPct = docsStats && docsStats.totalNodes > 0
    ? Math.round((docsStats.enFetched / docsStats.totalNodes) * 100) : 0;
  const arPct = docsStats && docsStats.enFetched > 0
    ? Math.round((docsStats.arTranslated / docsStats.enFetched) * 100) : 0;

  return (
    <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      {/* ─── Hero header ─── */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-accent/10 via-background to-background p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/15 text-accent">
                <Package size={22} />
              </span>
              {isRTL ? "كتالوج عقد n8n" : "n8n Nodes Catalog"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {isRTL
                ? "مرجع احترافي شامل لجميع عقد n8n مع توثيق كامل بالعربية والإنجليزية، عمليات فرعية، إصدارات، تحرير يدوي، ومزامنة دورية مع المستودع الرسمي."
                : "Professional reference for every n8n node with full docs in Arabic & English, sub-operations, version history, manual editing, and periodic sync with the official repo."}
            </p>
          </div>
          {status?.fetchedAt && (
            <div className="text-[11px] text-muted-foreground bg-background/60 rounded-md px-3 py-1.5 border border-border">
              <CheckCircle2 size={11} className="inline -mt-0.5 me-1 text-emerald-500" />
              {isRTL ? "آخر مزامنة: " : "Last sync: "}
              <strong className="text-foreground">
                {new Date(status.fetchedAt).toLocaleString(isRTL ? "ar" : "en")}
              </strong>
            </div>
          )}
        </div>

        {/* ─── Header stats strip (visible to everyone) ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5">
          <HeroStat
            icon={<Package size={14} className="text-accent" />}
            label={isRTL ? "إجمالي العقد" : "Total Nodes"}
            value={status?.totalNodes ?? docsStats?.totalNodes ?? 0}
          />
          <HeroStat
            icon={<FileText size={14} className="text-emerald-500" />}
            label={isRTL ? "تغطية التوثيق EN" : "EN coverage"}
            value={docsStats?.enFetched ?? 0}
            footer={`${enPct}%`}
            color="bg-emerald-500"
            progress={enPct}
          />
          <HeroStat
            icon={<Languages size={14} className="text-blue-500" />}
            label={isRTL ? "ترجمة AR" : "AR translation"}
            value={docsStats?.arTranslated ?? 0}
            footer={`${arPct}%`}
            color="bg-blue-500"
            progress={arPct}
          />
          <HeroStat
            icon={<HardDrive size={14} className="text-purple-500" />}
            label={isRTL ? "ملفات محلية" : "Local files"}
            value={(docsStats?.localFiles?.en ?? 0) + (docsStats?.localFiles?.ar ?? 0)}
            footer={`EN ${docsStats?.localFiles?.en ?? 0} · AR ${docsStats?.localFiles?.ar ?? 0}`}
          />
        </div>
      </div>

      {/* ─── Admin Panel ─── */}
      {isAdmin && (
        <CatalogAdminPanel
          isRTL={isRTL}
          docsStats={docsStats}
          status={status}
          onRefreshed={invalidateAll}
        />
      )}

      {/* ─── Global content search (BM25) ─── */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Sparkles size={14} className="text-accent" />
          {isRTL ? "بحث ذكي في محتوى التوثيقات" : "Smart docs content search"}
          <span className="text-[10px] font-normal text-muted-foreground bg-muted rounded px-1.5 py-0.5 ms-1">
            BM25
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {isRTL
            ? "ابحث داخل نصّ كل التوثيقات (إنجليزية أو عربية) مع ترتيب احترافي للنتائج وعرض مقاطع. اختَر نتيجة لينتقل الفلتر تلقائياً."
            : "Search inside the body of every cached doc (EN or AR) with ranked results and snippets. Pick a result to drop it into the filter below."}
        </p>
        <GlobalDocsSearch
          isRTL={isRTL}
          lang={isRTL ? "ar" : "en"}
          onPick={(nt) => setSearch(nt)}
        />
      </Card>

      {/* ─── Filter / browse ─── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <SlidersHorizontal size={14} className="text-muted-foreground" />
          {isRTL ? "تصفية الكتالوج" : "Browse & filter"}
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث بالاسم أو الفئة أو الاسم البديل..." : "Filter by name, category, or alias..."}
              className={isRTL ? "pr-9" : "pl-9"}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-muted-foreground hover:text-foreground`}
                title={isRTL ? "مسح" : "Clear"}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value as "all" | "trigger" | "regular")}
            className="bg-background border border-input rounded-md px-3 py-2 text-sm h-9"
          >
            <option value="all">{isRTL ? "كل الأنواع" : "All types"}</option>
            <option value="trigger">{isRTL ? "محفزات فقط" : "Triggers only"}</option>
            <option value="regular">{isRTL ? "بدون محفزات" : "Regular nodes"}</option>
          </select>
        </div>

        {cats && cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-border">
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <button
              onClick={() => setCategory("all")}
              className={`text-xs rounded-full px-3 py-1 transition-colors ${
                category === "all" ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {isRTL ? "الكل" : "All"}
            </button>
            {cats.map((c) => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`text-xs rounded-full px-3 py-1 transition-colors ${
                  category === c.name ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c.name} <span className="opacity-60">({c.count})</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* ─── Results meta + grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 h-[148px] animate-pulse space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-4 bg-muted rounded w-12" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : list && list.items.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {isRTL
                ? <>عرض <strong className="text-foreground">{list.items.length}</strong> من إجمالي <strong className="text-foreground">{list.total.toLocaleString()}</strong> عقدة</>
                : <>Showing <strong className="text-foreground">{list.items.length}</strong> of <strong className="text-foreground">{list.total.toLocaleString()}</strong> nodes</>}
              {(debouncedSearch || category !== "all" || triggerFilter !== "all") && (
                <button
                  className="ms-3 text-accent hover:underline"
                  onClick={() => { setSearch(""); setCategory("all"); setTriggerFilter("all"); }}
                >
                  {isRTL ? "مسح المرشحات" : "Reset filters"}
                </button>
              )}
            </span>
            {totalPages > 1 && (
              <span>{isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.items.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isRTL={isRTL}
                cov={coverageMap.get(node.nodeType)}
                onOpen={() => { setSelectedNode(node); setOpenNodeType(node.nodeType); }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-40"
                title={isRTL ? "السابق" : "Previous"}
              >
                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <span className="text-sm text-muted-foreground px-3 tabular-nums">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-40"
                title={isRTL ? "التالي" : "Next"}
              >
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <Search size={36} className="mx-auto mb-3 text-muted-foreground/50" />
          <div className="text-sm font-medium text-foreground">
            {isRTL ? "لا توجد نتائج تطابق البحث" : "No results match your filters"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isRTL ? "جرّب تعديل المرشحات أو مسحها." : "Try adjusting or clearing your filters."}
          </div>
          <Button
            variant="outline" size="sm" className="mt-4"
            onClick={() => { setSearch(""); setCategory("all"); setTriggerFilter("all"); }}
          >
            {isRTL ? "مسح المرشحات" : "Reset filters"}
          </Button>
        </Card>
      )}

      {/* Detail dialog */}
      <NodeDetailDialog
        nodeType={openNodeType}
        initialNode={selectedNode}
        onClose={() => { setOpenNodeType(null); setSelectedNode(null); }}
        isRTL={isRTL}
        isAdmin={isAdmin}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Node Card                                           */
/* ─────────────────────────────────────────────────── */
function NodeCard({
  node, isRTL, cov, onOpen,
}: {
  node: CatalogItem;
  isRTL: boolean;
  cov: DocCoverageEntry | undefined;
  onOpen: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Card
        className="p-4 h-full flex flex-col gap-3 hover:border-accent/60 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        aria-label={isRTL ? `فتح ${node.displayName}` : `Open ${node.displayName}`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {node.iconUrl && !imgError ? (
              <img
                src={node.iconUrl}
                alt={node.displayName}
                className="w-7 h-7 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Package size={20} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground truncate" title={node.displayName}>
                {node.displayName}
              </h3>
              {node.isTrigger && (
                <Badge variant="secondary" className="text-[10px] gap-1 py-0 px-1.5">
                  <Zap size={10} />Trigger
                </Badge>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono truncate" title={node.nodeType}>
              {node.nodeType}
            </div>
          </div>
        </div>

        {node.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {node.categories.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-0.5 inline-flex items-center gap-1">
                <Tag size={9} />{c}
              </span>
            ))}
          </div>
        )}

        {/* Health badges */}
        <div className="flex flex-wrap gap-1.5">
          {cov?.en && (
            <span className="text-[10px] inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded px-1.5 py-0.5"
              title={isRTL ? "التوثيق الكامل متوفر" : "Full docs cached"}>
              <BookOpen size={9} />{isRTL ? "موثّقة" : "Docs"}
            </span>
          )}
          {cov?.ar && (
            <span className="text-[10px] inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded px-1.5 py-0.5"
              title={isRTL ? "ترجمة عربية متوفرة" : "Arabic translation cached"}>
              <Languages size={9} />{isRTL ? "مترجمة" : "AR"}
            </span>
          )}
          {node.examples.length > 0 && (
            <span className="text-[10px] inline-flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded px-1.5 py-0.5"
              title={isRTL ? `${node.examples.length} مثال` : `${node.examples.length} examples`}>
              🎬 {node.examples.length}
            </span>
          )}
          {node.credentialDocsUrl && (
            <span className="text-[10px] inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded px-1.5 py-0.5"
              title={isRTL ? "تتطلب اعتماد" : "Requires credentials"}>
              <KeyRound size={9} />{isRTL ? "اعتماد" : "Auth"}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Detail dialog with tabs                             */
/* ─────────────────────────────────────────────────── */
interface DocResp {
  nodeType: string;
  language: "en" | "ar";
  markdown: string | null;
  sourceUrl: string | null;
  fetchedAt: string | null;
  fromCache: boolean;
  error?: string;
}

function NodeDetailDialog({
  nodeType, initialNode, onClose, isRTL, isAdmin,
}: {
  nodeType: string | null;
  initialNode: CatalogItem | null;
  onClose: () => void;
  isRTL: boolean;
  isAdmin: boolean;
}) {
  const open = !!nodeType;

  // Use initialNode passed from the card immediately — no extra API call needed.
  // The query runs in the background only when we don't have pre-loaded data.
  const { data: node } = useQuery<CatalogItem>({
    queryKey: ["catalog-node", nodeType],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: CatalogItem }>(`/catalog/lookup/${encodeURIComponent(nodeType!)}`);
      return r.data;
    },
    enabled: open && !initialNode,
    initialData: initialNode ?? undefined,
    staleTime: 2 * 60_000,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 pe-8">
            {node?.iconUrl ? (
              <img src={node.iconUrl} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <Package size={20} className="text-muted-foreground" />
            )}
            <span>{node?.displayName ?? nodeType}</span>
            {node?.isTrigger && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Zap size={10} />Trigger
              </Badge>
            )}
          </DialogTitle>
          <div className="text-[11px] font-mono text-muted-foreground select-all">
            {node?.nodeType}
          </div>
        </DialogHeader>

        {!node ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-accent" size={28} />
          </div>
        ) : (
          <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-3 self-start">
              <TabsTrigger value="info">{isRTL ? "معلومات" : "Info"}</TabsTrigger>
              <TabsTrigger value="examples">
                {isRTL ? "أمثلة" : "Examples"}
                {node.examples.length > 0 && (
                  <span className="ms-1.5 text-[10px] opacity-70">({node.examples.length})</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="docs">{isRTL ? "التوثيق" : "Docs"}</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
              {node.categories.length > 0 && (
                <Section title={isRTL ? "الفئات" : "Categories"}>
                  <div className="flex flex-wrap gap-1.5">
                    {node.categories.map((c) => (
                      <span key={c} className="text-xs bg-accent/10 text-accent rounded-full px-2.5 py-1 inline-flex items-center gap-1">
                        <Tag size={10} />{c}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
              {node.aliases.length > 0 && (
                <Section title={isRTL ? "أسماء بديلة (للبحث)" : "Aliases (for search)"}>
                  <div className="flex flex-wrap gap-1.5">
                    {node.aliases.map((a) => (
                      <span key={a} className="text-xs bg-muted text-muted-foreground rounded px-2 py-0.5">{a}</span>
                    ))}
                  </div>
                </Section>
              )}
              <Section title={isRTL ? "روابط رسمية" : "Official links"}>
                <div className="flex flex-wrap gap-2">
                  {node.primaryDocsUrl && (
                    <a href={node.primaryDocsUrl} target="_blank" rel="noreferrer"
                       className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20">
                      <BookOpen size={12} />{isRTL ? "صفحة التوثيق" : "Documentation page"}
                      <ExternalLink size={10} />
                    </a>
                  )}
                  {node.credentialDocsUrl && (
                    <a href={node.credentialDocsUrl} target="_blank" rel="noreferrer"
                       className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                      <KeyRound size={12} />{isRTL ? "إعداد بيانات الاعتماد" : "Credentials setup"}
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </Section>
              <Section title={isRTL ? "تفاصيل تقنية" : "Technical details"}>
                <dl className="text-xs grid grid-cols-2 gap-y-1 gap-x-4">
                  <dt className="text-muted-foreground">{isRTL ? "المجلد" : "Folder"}</dt>
                  <dd className="font-mono">{node.folder}</dd>
                  <dt className="text-muted-foreground">{isRTL ? "الإصدار" : "Version"}</dt>
                  <dd className="font-mono">{node.nodeVersion}</dd>
                </dl>
              </Section>
            </TabsContent>

            <TabsContent value="examples" className="flex-1 overflow-y-auto p-4 mt-0">
              {node.examples.length === 0 ? (
                <EmptyState
                  icon={<Globe size={32} />}
                  title={isRTL ? "لا توجد أمثلة لهذه العقدة" : "No examples for this node"}
                  hint={isRTL ? "غالبًا الكتالوج الرسمي لا يوفّر أمثلة لهذه العقدة." : "The official catalog has no examples for this node."}
                />
              ) : (
                <ul className="space-y-2">
                  {node.examples.map((ex, idx) => (
                    <li key={idx}>
                      <a href={ex.url} target="_blank" rel="noreferrer"
                         className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors">
                        <span className="text-xl shrink-0" aria-hidden>{ex.icon || "📘"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{ex.label}</div>
                          <div className="text-[11px] text-muted-foreground truncate" dir="ltr">{ex.url}</div>
                        </div>
                        <ExternalLink size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="docs" className="flex-1 overflow-hidden mt-0 flex flex-col">
              <DocsViewer nodeType={node.nodeType} isRTL={isRTL} isAdmin={isAdmin} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <div className="opacity-50 mb-3">{icon}</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {hint && <div className="text-xs mt-1 max-w-xs">{hint}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Docs viewer helpers                                  */
/* ─────────────────────────────────────────────────── */

/**
 * Convert the GitHub raw URL we use as `source_url`
 *   https://raw.githubusercontent.com/n8n-io/n8n-docs/main/docs/integrations/builtin/app-nodes/n8n-nodes-base.databricks.md
 * into the human-readable docs site URL the user expects to see when
 * clicking "Source":
 *   https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.databricks/
 *
 * Falls back to the original URL if the pattern doesn't match.
 */
function rawDocsUrlToHumanUrl(raw: string): string {
  if (!raw) return raw;
  const m = raw.match(
    /^https:\/\/raw\.githubusercontent\.com\/n8n-io\/n8n-docs\/[^/]+\/docs\/(.+)$/i
  );
  if (!m) return raw;
  let p = m[1]
    .replace(/\/index\.md$/i, "/")
    .replace(/\.md$/i, "/");
  if (!p.endsWith("/")) p += "/";
  return `https://docs.n8n.io/${p}`;
}

/**
 * Defensive in-viewer rewriter for `<a href>` props produced by ReactMarkdown.
 * Some stored docs (especially older AR translations) still contain root-
 * relative paths like `/integrations/builtin/credentials/foo.md` — those
 * would resolve against our app origin and 404. Convert them to absolute
 * docs.n8n.io URLs so the user lands on the real n8n documentation page.
 *
 *   /foo/bar.md           → https://docs.n8n.io/foo/bar/
 *   /foo/bar/index.md#a   → https://docs.n8n.io/foo/bar/#a
 *   /foo/bar              → https://docs.n8n.io/foo/bar/
 *   /api/catalog/...      → unchanged (our own asset endpoints)
 *   #anchor               → unchanged (in-page anchor)
 *   https://...           → unchanged (already absolute)
 */
function normalizeDocLink(href: string | undefined): string | undefined {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|data:)/i.test(href)) return href;
  if (href.startsWith("#")) return href;
  if (href.startsWith("/api/")) return href;
  if (!href.startsWith("/")) return href; // truly relative — leave alone
  // Split off anchor / query
  const hashIdx = href.search(/[#?]/);
  let path = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const tail = hashIdx >= 0 ? href.slice(hashIdx) : "";
  path = path.replace(/\/index\.md$/i, "/").replace(/\.md$/i, "/");
  if (!path.endsWith("/")) path += "/";
  return `https://docs.n8n.io${path}${tail}`;
}

/* ─────────────────────────────────────────────────── */
/* Docs viewer (EN/AR with lazy translate)             */
/* ─────────────────────────────────────────────────── */
function DocsViewer({ nodeType, isRTL, isAdmin }: { nodeType: string; isRTL: boolean; isAdmin: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [lang, setLang] = useState<"en" | "ar">(isRTL ? "ar" : "en");
  const [refreshing, setRefreshing] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);

  const queryKey = ["doc", nodeType, lang];
  const { data, isLoading, error } = useQuery<DocResp>({
    queryKey,
    queryFn: async () => {
      const r = await fetch(
        `${API_BASE}/catalog/docs/${encodeURIComponent(nodeType)}?lang=${lang}`,
        {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          credentials: "include",
        }
      );
      const j = await r.json();
      if (!r.ok) {
        if (j?.data) return j.data as DocResp;
        throw new Error(j?.error?.message || "Failed");
      }
      const dr = j.data as DocResp & { manualOverride?: boolean };
      setHasOverride(!!dr.manualOverride);
      return dr;
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  async function refreshDoc() {
    setRefreshing(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeader() };
      const r = await fetch(
        `${API_BASE}/catalog/docs/${encodeURIComponent(nodeType)}/refresh?lang=${lang}`,
        { method: "POST", headers, credentials: "include" }
      );
      const j = await r.json();
      if (j.success) {
        toast({ title: isRTL ? "تم التحديث ✅" : "Refreshed ✅" });
        await qc.invalidateQueries({ queryKey });
      } else {
        toast({
          title: isRTL ? "فشل التحديث" : "Refresh failed",
          description: j.data?.error || j.error?.message,
          variant: "destructive",
        });
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 transition-colors ${lang === "en" ? "bg-accent text-white" : "bg-background hover:bg-muted"}`}
          >EN</button>
          <button
            onClick={() => setLang("ar")}
            className={`px-3 py-1 transition-colors ${lang === "ar" ? "bg-accent text-white" : "bg-background hover:bg-muted"}`}
          >ع</button>
        </div>
        {data?.fromCache && (
          <span className="text-[10px] inline-flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 size={10} className="text-emerald-500" />
            {isRTL ? "من الذاكرة المحلية" : "Cached"}
          </span>
        )}
        {data?.sourceUrl && (
          <a
            href={rawDocsUrlToHumanUrl(data.sourceUrl)}
            target="_blank" rel="noreferrer"
            className="text-[10px] text-muted-foreground hover:text-accent inline-flex items-center gap-1 ms-auto"
            title={rawDocsUrlToHumanUrl(data.sourceUrl)}
          >
            <ExternalLink size={10} />{isRTL ? "المصدر" : "source"}
          </a>
        )}
        {/* Advanced tools — visible to all (some only act in admin mode) */}
        <OperationsPanel nodeType={nodeType} lang={lang} isRTL={isRTL} />
        <HistoryPanel
          nodeType={nodeType} lang={lang} isRTL={isRTL} isAdmin={isAdmin}
          onRestored={() => qc.invalidateQueries({ queryKey })}
        />
        {data?.markdown && (
          <WorkflowJsonViewer markdown={data.markdown} isRTL={isRTL} />
        )}
        {isAdmin && data?.markdown && (
          <ManualEditor
            nodeType={nodeType} lang={lang} isRTL={isRTL}
            currentMarkdown={data.markdown}
            hasOverride={hasOverride}
            onSaved={() => qc.invalidateQueries({ queryKey })}
          />
        )}
        {isAdmin && (
          <Button variant="ghost" size="sm" onClick={refreshDoc} disabled={refreshing} className="h-7 px-2">
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-accent" size={28} />
              {lang === "ar" && (
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "جاري الترجمة لأول مرة... قد يستغرق 5-15 ثانية" : "Translating for the first time…"}
                </p>
              )}
            </div>
          ) : error || !data?.markdown ? (
            <EmptyState
              icon={<AlertCircle size={32} />}
              title={isRTL ? "التوثيق غير متوفر" : "Documentation not available"}
              hint={
                data?.error ||
                (lang === "ar"
                  ? (isRTL ? "ربما لم يتم جلب النسخة الإنجليزية بعد، أو لم يتم تكوين مفتاح OpenAI." : "English doc may not be fetched yet, or no OpenAI key configured.")
                  : (isRTL ? "لم يتم جلب التوثيق من المستودع. اضغط زر التحديث لمحاولة الجلب." : "Doc not fetched yet — click refresh to try."))
              }
            />
          ) : (
            <>
              {/* Banner: Arabic translation unavailable, showing English fallback */}
              {lang === "ar" && data.error && data.markdown && (
                <div
                  className="mb-4 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
                  dir="rtl"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                  <div className="leading-relaxed">
                    <strong>الترجمة العربية غير متوفرة لهذه العقدة.</strong>{" "}
                    يُعرض المحتوى الإنجليزي الكامل أدناه. لتمكين الترجمة، أضف مفتاح Gemini أو OpenAI من{" "}
                    <span className="font-semibold">الإعدادات → تكامل الذكاء الاصطناعي</span>.
                  </div>
                </div>
              )}
            <article
              className={`prose prose-sm dark:prose-invert max-w-none
                prose-headings:scroll-mt-16 prose-headings:font-semibold
                prose-h1:text-xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2
                prose-h2:text-lg prose-h2:mt-6
                prose-a:text-accent hover:prose-a:underline
                prose-code:before:content-none prose-code:after:content-none
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-blockquote:border-accent prose-blockquote:bg-accent/5
                prose-img:rounded prose-img:border prose-img:border-border
                prose-table:text-xs prose-th:bg-muted/50
                ${lang === "ar" ? "leading-[1.85] text-[15px]" : ""}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, ...props }) => (
                    <a
                      {...props}
                      href={normalizeDocLink(href)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                  img: ({ ...props }) => <img {...props} loading="lazy" />,
                }}
              >
                {data.markdown}
              </ReactMarkdown>
            </article>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
