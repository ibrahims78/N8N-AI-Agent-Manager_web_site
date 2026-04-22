import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search, ExternalLink, BookOpen, KeyRound, Filter, Loader2,
  Zap, Package, ChevronLeft, ChevronRight, Tag, RefreshCw, Globe,
  Languages, FileText, CheckCircle2, AlertCircle,
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
  totalNodes: number; enFetched: number; enMissing: number;
  arTranslated: number; arPending: number; lastFetchedAt: string | null;
}
interface DocCoverageEntry { nodeType: string; en: boolean; ar: boolean }

const PAGE_SIZE = 24;

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
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const [refreshingDocs, setRefreshingDocs] = useState(false);
  const [openNodeType, setOpenNodeType] = useState<string | null>(null);

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
        await qc.invalidateQueries({ queryKey: ["catalog"] });
        await qc.invalidateQueries({ queryKey: ["catalog-status"] });
        await qc.invalidateQueries({ queryKey: ["catalog-categories"] });
      } else {
        toast({ title: isRTL ? "فشل التحديث" : "Refresh failed", description: j.error?.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: isRTL ? "خطأ" : "Error", description: String(err), variant: "destructive" });
    } finally {
      setRefreshingCatalog(false);
    }
  }

  async function refreshAllDocs(force = false) {
    setRefreshingDocs(true);
    toast({
      title: isRTL ? "جاري جلب التوثيقات..." : "Fetching documentation...",
      description: isRTL ? "قد يستغرق ذلك دقيقة أو دقيقتين" : "This may take a minute or two",
    });
    try {
      const r = await authedFetch(`/catalog/docs/refresh-all?force=${force}`, { method: "POST" });
      const j = await r.json();
      if (j.success) {
        toast({
          title: isRTL ? "تم جلب التوثيقات ✅" : "Documentation fetched ✅",
          description: isRTL
            ? `تمت محاولة ${j.data.attempted}، نجح ${j.data.fetched}، فشل ${j.data.failed}`
            : `Attempted ${j.data.attempted}, fetched ${j.data.fetched}, failed ${j.data.failed}`,
        });
        await qc.invalidateQueries({ queryKey: ["docs-stats"] });
        await qc.invalidateQueries({ queryKey: ["docs-coverage"] });
      } else {
        toast({ title: isRTL ? "فشل جلب التوثيقات" : "Docs fetch failed", description: j.error?.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: isRTL ? "خطأ" : "Error", description: String(err), variant: "destructive" });
    } finally {
      setRefreshingDocs(false);
    }
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-accent" size={24} />
            {isRTL ? "كتالوج عقد n8n" : "n8n Nodes Catalog"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? "مرجع شامل لجميع عقد n8n مع التوثيق الكامل بالعربية والإنجليزية"
              : "Complete reference for all n8n nodes with full docs in Arabic & English"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
              <div className="flex items-center gap-3">
                <span><strong className="text-foreground">{status.totalNodes}</strong> {isRTL ? "عقدة" : "nodes"}</span>
                {docsStats && (
                  <>
                    <span className="opacity-50">·</span>
                    <span title={isRTL ? "وثائق إنجليزية مخزنة" : "Cached English docs"}>
                      <FileText size={11} className="inline -mt-0.5 me-1" />
                      {docsStats.enFetched}
                    </span>
                    <span title={isRTL ? "ترجمات عربية مخزنة" : "Cached Arabic translations"}>
                      <Languages size={11} className="inline -mt-0.5 me-1" />
                      {docsStats.arTranslated}
                    </span>
                  </>
                )}
              </div>
              {status.fetchedAt && (
                <div className="opacity-70 mt-0.5">
                  {isRTL ? "آخر تحديث: " : "Updated: "}
                  {new Date(status.fetchedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCatalog}
                disabled={refreshingCatalog}
                className="gap-2"
                title={isRTL ? "إعادة جلب قائمة العقد من المستودع" : "Re-fetch node list from repo"}
              >
                {refreshingCatalog ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                {isRTL ? "تحديث الكتالوج" : "Refresh catalog"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshAllDocs(false)}
                disabled={refreshingDocs}
                className="gap-2"
                title={isRTL ? "تنزيل التوثيق الكامل لكل العقد المفقودة" : "Download full docs for all missing nodes"}
              >
                {refreshingDocs ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
                {isRTL ? "جلب كل التوثيقات" : "Fetch all docs"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث بالاسم أو الفئة أو الاسم البديل..." : "Search by name, category, or alias..."}
              className={isRTL ? "pr-9" : "pl-9"}
            />
          </div>
          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value as "all" | "trigger" | "regular")}
            className="bg-background border border-input rounded-md px-3 py-2 text-sm h-9"
          >
            <option value="all">{isRTL ? "الكل" : "All types"}</option>
            <option value="trigger">{isRTL ? "محفزات فقط" : "Triggers only"}</option>
            <option value="regular">{isRTL ? "بدون محفزات" : "Regular nodes"}</option>
          </select>
        </div>

        {cats && cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-border">
            <Filter size={14} className="text-muted-foreground" />
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

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : list && list.items.length > 0 ? (
        <>
          <div className="text-xs text-muted-foreground">
            {isRTL ? `${list.total} نتيجة` : `${list.total} results`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.items.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isRTL={isRTL}
                cov={coverageMap.get(node.nodeType)}
                onOpen={() => setOpenNodeType(node.nodeType)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-40"
              >
                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <span className="text-sm text-muted-foreground px-3">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-40"
              >
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          {isRTL ? "لا توجد نتائج" : "No results found"}
        </div>
      )}

      {/* Detail dialog */}
      <NodeDetailDialog
        nodeType={openNodeType}
        onClose={() => setOpenNodeType(null)}
        isRTL={isRTL}
        isAdmin={isAdmin}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Card                                                */
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
        className="p-4 h-full flex flex-col gap-3 hover:border-accent/50 transition-colors cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
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
  nodeType, onClose, isRTL, isAdmin,
}: { nodeType: string | null; onClose: () => void; isRTL: boolean; isAdmin: boolean }) {
  const open = !!nodeType;

  const { data: node } = useQuery<CatalogItem>({
    queryKey: ["catalog-node", nodeType],
    queryFn: async () => {
      const r = await apiRequest<{ success: boolean; data: CatalogItem }>(`/catalog/lookup/${encodeURIComponent(nodeType!)}`);
      return r.data;
    },
    enabled: open,
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
/* Docs viewer (EN/AR with lazy translate)             */
/* ─────────────────────────────────────────────────── */
function DocsViewer({ nodeType, isRTL, isAdmin }: { nodeType: string; isRTL: boolean; isAdmin: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [lang, setLang] = useState<"en" | "ar">(isRTL ? "ar" : "en");
  const [refreshing, setRefreshing] = useState(false);

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
      return j.data as DocResp;
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
            href={data.sourceUrl.replace("raw.githubusercontent.com", "github.com").replace("/main/", "/blob/main/")}
            target="_blank" rel="noreferrer"
            className="text-[10px] text-muted-foreground hover:text-accent inline-flex items-center gap-1 ms-auto"
          >
            <ExternalLink size={10} />{isRTL ? "المصدر" : "source"}
          </a>
        )}
        {isAdmin && (
          <Button variant="ghost" size="sm" onClick={refreshDoc} disabled={refreshing} className="h-7 px-2">
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
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
            <article
              className={`prose prose-sm dark:prose-invert max-w-none ${lang === "ar" ? "prose-headings:font-arabic" : ""}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
                  img: ({ ...props }) => <img {...props} loading="lazy" />,
                }}
              >
                {data.markdown}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

