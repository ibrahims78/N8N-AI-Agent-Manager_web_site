/**
 * CatalogAdminPanel.tsx — Shared admin panel for n8n catalog & docs.
 *
 * Originally lived inside `pages/nodes-catalog.tsx`. Extracted into a shared
 * component so it can be rendered from the Settings page (its natural home,
 * alongside n8n / OpenAI / Gemini credentials) while keeping the Catalog page
 * itself focused on browsing.
 *
 * Includes:
 *  - 4 stat tiles: total nodes, EN coverage, AR coverage, local files
 *  - 3 SSE-streamed actions: refresh node list, fetch EN docs, translate AR
 *  - SyncSettingsCard (periodic sync schedule + export tools)
 *
 * Self-contained: owns its data fetching for `docs-stats` and `catalog-status`
 * via React Query, and exposes an `onRefreshed` callback so the host page can
 * invalidate its own derived queries (catalog list, coverage, categories…).
 */
import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Database, RefreshCw, FileText, Languages, Loader2,
  ChevronDown, ChevronUp, Package, BookOpen, HardDrive,
  FolderOpen, X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_BASE, getAuthHeader, apiRequest } from "@/lib/api";
import { SyncSettingsCard } from "@/components/docs/SyncSettingsCard";

/* ─────────────────────────────────────────────────── */
/* Types                                               */
/* ─────────────────────────────────────────────────── */
export interface DocsStats {
  totalNodes: number;
  enFetched: number;
  enMissing: number;
  arTranslated: number;
  arPending: number;
  lastFetchedAt: string | null;
  localFiles: { en: number; ar: number };
}

export interface StatusItem {
  totalNodes: number;
  source: string;
  branch: string;
  fetchedAt: string | null;
  loadedFromStatic: boolean;
}

interface BulkProgress {
  total: number;
  attempted: number;
  fetched: number;
  failed: number;
  current?: string;
}

interface SSEError { message: string; code?: string }

/* ─────────────────────────────────────────────────── */
/* SSE streaming hook                                  */
/* ─────────────────────────────────────────────────── */
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
/* Sub-components                                      */
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

function StatCard({
  icon, label, value, total, subtitle, color = "bg-accent",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  subtitle?: string;
  color?: string;
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
  onAction, onStop, progress, progressColor = "bg-accent",
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
/* Public component                                    */
/* ─────────────────────────────────────────────────── */
export interface CatalogAdminPanelProps {
  isRTL: boolean;
  /**
   * Whether the collapsible body is open by default.
   * Defaults to `false` on the catalog page (compact) and is set to `true`
   * by the settings page (where this panel is the primary admin surface).
   */
  defaultOpen?: boolean;
  /**
   * Called after any admin action (refresh / fetch / translate) finishes,
   * so the host page can invalidate dependent queries (catalog list,
   * coverage, categories…). Optional — the panel itself always invalidates
   * `docs-stats` and `catalog-status`.
   */
  onRefreshed?: () => void;
}

export function CatalogAdminPanel({
  isRTL,
  defaultOpen = false,
  onRefreshed,
}: CatalogAdminPanelProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(defaultOpen);
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const fetchOp = useSSEOperation();
  const translateOp = useSSEOperation();

  // Self-contained data fetching — same query keys the catalog page uses,
  // so React Query dedupes on both pages and a refresh on either reflects
  // immediately on the other.
  const { data: docsStats } = useQuery<DocsStats>({
    queryKey: ["docs-stats"],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: DocsStats }>(`/catalog/docs/stats`);
      return r.data;
    },
  });

  const { data: status } = useQuery<StatusItem>({
    queryKey: ["catalog-status"],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: StatusItem }>(`/catalog/status`);
      return r.data;
    },
  });
  void status; // currently unused inside the body but kept warm for header strip parity

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["catalog"] });
    qc.invalidateQueries({ queryKey: ["catalog-status"] });
    qc.invalidateQueries({ queryKey: ["catalog-categories"] });
    qc.invalidateQueries({ queryKey: ["docs-stats"] });
    qc.invalidateQueries({ queryKey: ["docs-coverage"] });
    onRefreshed?.();
  }

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
        invalidateAll();
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
      invalidateAll();
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
    invalidateAll();
  }

  function handleTranslateDone(result: { done: BulkProgress | null; error: SSEError | null }) {
    // Distinguish three states:
    //   1. Pre-flight error (no AI key) — actionable, point user to the AI
    //      key inputs above on this same page.
    //   2. All attempts failed — likely AI/quota issue mid-run.
    //   3. Real success (full or partial).
    if (result.error) {
      const isNoKey = result.error.code === "no_ai_key";
      toast({
        title: isNoKey
          ? (isRTL ? "لم تبدأ الترجمة — مفتاح AI مفقود" : "Translation didn't start — AI key missing")
          : (isRTL ? "فشلت الترجمة" : "Translation failed"),
        description: isNoKey
          ? (isRTL
              ? "أضف مفتاح OpenAI أو Gemini من القسم أعلاه ثم أعد المحاولة."
              : "Add an OpenAI or Gemini key from the section above and try again.")
          : result.error.message,
        variant: "destructive",
      });
      invalidateAll();
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
      invalidateAll();
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
      invalidateAll();
      return;
    }
    toast({
      title: isRTL ? "اكتملت الترجمة ✅" : "Translation complete ✅",
      description: isRTL
        ? `تُرجم ${translated} من ${total}${failed ? ` (فشل ${failed})` : ""}`
        : `Translated ${translated} of ${total}${failed ? ` (${failed} failed)` : ""}`,
    });
    invalidateAll();
  }

  return (
    <Card id="docs-admin" className="border-accent/30 overflow-hidden scroll-mt-4">
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
                  />
                  <StatCard
                    icon={<BookOpen size={16} className="text-emerald-500" />}
                    label={isRTL ? "توثيقات EN" : "EN Docs"}
                    value={docsStats.enFetched}
                    total={docsStats.totalNodes}
                    color="bg-emerald-500"
                  />
                  <StatCard
                    icon={<Languages size={16} className="text-blue-500" />}
                    label={isRTL ? "مترجم AR" : "AR Translated"}
                    value={docsStats.arTranslated}
                    total={docsStats.enFetched}
                    color="bg-blue-500"
                  />
                  <StatCard
                    icon={<HardDrive size={16} className="text-purple-500" />}
                    label={isRTL ? "ملفات محلية" : "Local Files"}
                    value={docsStats.localFiles.en + docsStats.localFiles.ar}
                    subtitle={`EN: ${docsStats.localFiles.en} · AR: ${docsStats.localFiles.ar}`}
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
