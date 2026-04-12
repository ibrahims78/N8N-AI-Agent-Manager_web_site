import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search, Star, Eye, ArrowRight, Zap, X, Plus,
  Download, Globe, BookMarked, ChevronLeft, ChevronRight,
  Loader2, User, BarChart2,
} from "lucide-react";
import { useGetTemplates, useUseTemplate, getGetTemplatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, API_BASE } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/hooks/use-toast";

interface LocalTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  nodesCount: number;
  usageCount: number;
  avgRating: number;
  ratingCount: number;
}

interface N8nTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  nodesCount: number;
  views: number;
  author: string;
  imageUrl: string | null;
  createdAt: string | null;
}

const LOCAL_CATEGORIES = ["all", "email", "reports", "api", "scheduling", "alerts", "database"];
const N8N_CATEGORIES = ["all", "Marketing", "Sales", "Engineering", "IT Ops", "HR", "Finance", "Design", "Other"];

function StarRating({
  templateId, currentRating, ratingCount, isRTL, onRated,
}: {
  templateId: number; currentRating: number; ratingCount: number; isRTL: boolean;
  onRated: (newRating: number, newCount: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const authHeader = getAuthHeader();

  const handleRate = async (rating: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
      const res = await fetch(`${API_BASE}/templates/${templateId}/rate`, {
        method: "POST", headers, body: JSON.stringify({ rating }),
      });
      const data = await res.json() as { success: boolean; data?: { avgRating: number; ratingCount: number } };
      if (data.success && data.data) {
        onRated(data.data.avgRating, data.data.ratingCount);
        toast({ title: isRTL ? "شكراً على تقييمك! ⭐" : "Thanks for your rating! ⭐" });
      }
    } catch {
      toast({ title: isRTL ? "فشل التقييم" : "Rating failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} disabled={submitting} onClick={() => handleRate(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50">
          <Star size={13} className={`transition-colors ${star <= (hovered || currentRating) ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground/40"}`} />
        </button>
      ))}
      <span className="text-xs text-muted-foreground ms-1">
        {(currentRating ?? 0).toFixed(1)}
        {ratingCount > 0 && <span className="text-[10px]"> ({ratingCount})</span>}
      </span>
    </div>
  );
}

export default function TemplatesPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();
  const { toast } = useToast();

  const [tab, setTab] = useState<"local" | "n8n">("local");

  const [localSearch, setLocalSearch] = useState("");
  const [localCategory, setLocalCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<LocalTemplate | null>(null);
  const [localRatings, setLocalRatings] = useState<Record<number, { avgRating: number; ratingCount: number }>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", category: "api" });
  const [addingTemplate, setAddingTemplate] = useState(false);

  const [n8nSearch, setN8nSearch] = useState("");
  const [n8nCategory, setN8nCategory] = useState("all");
  const [n8nPage, setN8nPage] = useState(1);
  const [n8nTemplates, setN8nTemplates] = useState<N8nTemplate[]>([]);
  const [n8nTotal, setN8nTotal] = useState(0);
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nError, setN8nError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());
  const [n8nPreview, setN8nPreview] = useState<N8nTemplate | null>(null);

  const N8N_ROWS = 18;
  const n8nTotalPages = Math.ceil(n8nTotal / N8N_ROWS);

  const { data: res, isLoading: localLoading } = useGetTemplates({
    request: { headers: authHeader },
    query: { queryKey: getGetTemplatesQueryKey() },
  } as Parameters<typeof useGetTemplates>[0]);

  const { mutate: useTemplate } = useUseTemplate({
    mutation: { onSuccess: () => { window.location.hash = "#/chat"; } },
    request: { headers: authHeader },
  } as Parameters<typeof useUseTemplate>[0]);

  const rawTemplates = ((res as { data?: { templates?: unknown[] } } | undefined)?.data?.templates ?? []) as LocalTemplate[];
  const templates = rawTemplates.map(t => ({
    ...t,
    avgRating: localRatings[t.id]?.avgRating ?? (t.avgRating ?? 0),
    ratingCount: localRatings[t.id]?.ratingCount ?? (t.ratingCount ?? 0),
  }));
  const filtered = templates.filter(t => {
    const matchSearch = !localSearch || t.name.toLowerCase().includes(localSearch.toLowerCase()) || t.description.toLowerCase().includes(localSearch.toLowerCase());
    const matchCat = localCategory === "all" || t.category === localCategory;
    return matchSearch && matchCat;
  });
  const mostUsed = templates.slice().sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);

  const fetchN8n = useCallback(async () => {
    setN8nLoading(true);
    setN8nError(null);
    try {
      const params = new URLSearchParams({
        rows: String(N8N_ROWS),
        page: String(n8nPage),
      });
      if (n8nSearch) params.set("search", n8nSearch);
      if (n8nCategory !== "all") params.set("category", n8nCategory);
      const headers: Record<string, string> = { ...authHeader };
      const res = await fetch(`${API_BASE}/templates/n8n-library?${params}`, { headers });
      const data = await res.json() as { success: boolean; data?: { templates: N8nTemplate[]; total: number } };
      if (data.success && data.data) {
        setN8nTemplates(data.data.templates);
        setN8nTotal(data.data.total);
      } else {
        setN8nError(isRTL ? "تعذر جلب القوالب" : "Failed to load templates");
      }
    } catch {
      setN8nError(isRTL ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setN8nLoading(false);
    }
  }, [n8nSearch, n8nCategory, n8nPage, isRTL]);

  useEffect(() => {
    if (tab === "n8n") fetchN8n();
  }, [tab, fetchN8n]);

  const handleN8nSearch = (val: string) => { setN8nSearch(val); setN8nPage(1); };
  const handleN8nCategory = (cat: string) => { setN8nCategory(cat); setN8nPage(1); };

  const handleImport = async (template: N8nTemplate) => {
    setImportingId(template.id);
    try {
      const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
      const res = await fetch(`${API_BASE}/templates/n8n-library/import/${template.id}`, { method: "POST", headers });
      const data = await res.json() as { success: boolean };
      if (data.success) {
        setImportedIds(prev => new Set(prev).add(template.id));
        queryClient.invalidateQueries({ queryKey: getGetTemplatesQueryKey() });
        toast({ title: isRTL ? `تم استيراد "${template.name}" بنجاح ✅` : `"${template.name}" imported successfully ✅` });
      } else {
        toast({ title: isRTL ? "فشل الاستيراد" : "Import failed", variant: "destructive" });
      }
    } catch {
      toast({ title: isRTL ? "فشل الاستيراد" : "Import failed", variant: "destructive" });
    } finally {
      setImportingId(null);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.description.trim()) return;
    setAddingTemplate(true);
    try {
      const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
      const res = await fetch(`${API_BASE}/templates`, {
        method: "POST", headers,
        body: JSON.stringify({ name: newTemplate.name.trim(), description: newTemplate.description.trim(), category: newTemplate.category, nodesCount: 0, workflowJson: { name: newTemplate.name.trim(), nodes: [], connections: {} } }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) {
        toast({ title: isRTL ? "تم إضافة القالب ✅" : "Template added ✅" });
        queryClient.invalidateQueries({ queryKey: getGetTemplatesQueryKey() });
        setShowAddModal(false);
        setNewTemplate({ name: "", description: "", category: "api" });
      }
    } catch {
      toast({ title: isRTL ? "فشل إضافة القالب" : "Failed to add template", variant: "destructive" });
    } finally {
      setAddingTemplate(false);
    }
  };

  return (
    <div className="space-y-5" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2 border-b border-border pb-0">
        <button
          onClick={() => setTab("local")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "local" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <BookMarked size={15} />
          {isRTL ? "قوالبي" : "My Templates"}
          <span className="px-1.5 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{templates.length}</span>
        </button>
        <button
          onClick={() => setTab("n8n")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "n8n" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Globe size={15} />
          {isRTL ? "مكتبة n8n" : "n8n Library"}
          {n8nTotal > 0 && <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs">{n8nTotal.toLocaleString()}</span>}
        </button>
      </div>

      {tab === "local" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                placeholder={t("templates.search")}
                className="w-full ps-9 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div className="flex gap-1 flex-wrap flex-1">
              {LOCAL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setLocalCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${localCategory === cat ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {t(`templates.${cat}` as keyof typeof t)}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors shrink-0">
              <Plus size={15} />
              {isRTL ? "قالب جديد" : "New Template"}
            </button>
          </div>

          {!localSearch && localCategory === "all" && mostUsed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">{t("templates.mostUsed")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mostUsed.map((template, i) => (
                  <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-accent/10 to-accent-secondary/5 rounded-xl p-5 border border-accent/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Zap size={20} className="text-accent" />
                      </div>
                      <StarRating templateId={template.id} currentRating={template.avgRating} ratingCount={template.ratingCount} isRTL={isRTL} onRated={(avg, count) => setLocalRatings(p => ({ ...p, [template.id]: { avgRating: avg, ratingCount: count } }))} />
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{template.nodesCount} {t("workflows.nodes")}</span>
                      <button onClick={() => useTemplate({ id: template.id.toString() } as Parameters<typeof useTemplate>[0])}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors">
                        {t("templates.use")} <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              {localSearch || localCategory !== "all" ? `${filtered.length} ${isRTL ? "نتيجة" : "results"}` : isRTL ? "جميع القوالب" : "All Templates"}
            </h2>
            {localLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-muted mb-3" />
                    <div className="h-4 bg-muted rounded w-32 mb-2" />
                    <div className="h-3 bg-muted rounded w-48 mb-4" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : !filtered.length ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">{t("templates.noTemplates")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((template, i) => (
                  <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-xl p-5 border border-border hover:border-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Zap size={18} className="text-accent" />
                      </div>
                      <StarRating templateId={template.id} currentRating={template.avgRating} ratingCount={template.ratingCount} isRTL={isRTL} onRated={(avg, count) => setLocalRatings(p => ({ ...p, [template.id]: { avgRating: avg, ratingCount: count } }))} />
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span>{template.nodesCount} {t("workflows.nodes")}</span>
                      <span>|</span>
                      <span>{template.usageCount} {isRTL ? "استخدام" : "uses"}</span>
                      <span className="ms-auto px-2 py-0.5 rounded-full bg-muted capitalize">{template.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPreviewTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
                        <Eye size={12} /> {t("templates.preview")}
                      </button>
                      <button onClick={() => useTemplate({ id: template.id.toString() } as Parameters<typeof useTemplate>[0])}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors">
                        {t("templates.use")} <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "n8n" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={n8nSearch} onChange={e => handleN8nSearch(e.target.value)}
                placeholder={isRTL ? "ابحث في مكتبة n8n..." : "Search n8n library..."}
                className="w-full ps-9 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div className="flex gap-1 flex-wrap flex-1">
              {N8N_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleN8nCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${n8nCategory === cat ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {cat === "all" ? (isRTL ? "الكل" : "All") : cat}
                </button>
              ))}
            </div>
            <button onClick={fetchN8n} disabled={n8nLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors shrink-0 disabled:opacity-50">
              {n8nLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {isRTL ? "بحث" : "Search"}
            </button>
          </div>

          {n8nError ? (
            <div className="text-center py-16">
              <Globe size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">{n8nError}</p>
              <button onClick={fetchN8n} className="mt-3 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors">
                {isRTL ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : n8nLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(N8N_ROWS)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
                  <div className="h-28 bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : n8nTemplates.length === 0 ? (
            <div className="text-center py-16">
              <Globe size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">{isRTL ? "لا توجد نتائج" : "No results found"}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {n8nTemplates.map((template, i) => {
                  const imported = importedIds.has(template.id);
                  const importing = importingId === template.id;
                  return (
                    <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      className="bg-card rounded-xl border border-border hover:border-accent/50 transition-colors overflow-hidden flex flex-col">
                      {template.imageUrl ? (
                        <img src={template.imageUrl} alt={template.name} className="w-full h-28 object-cover bg-muted" />
                      ) : (
                        <div className="w-full h-28 bg-gradient-to-br from-accent/10 to-muted flex items-center justify-center">
                          <Zap size={32} className="text-accent/40" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2 flex-1">{template.name}</h3>
                          {imported && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">
                              {isRTL ? "مستورد" : "Imported"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{template.description || (isRTL ? "لا يوجد وصف" : "No description")}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 flex-wrap">
                          <span className="flex items-center gap-1"><Zap size={11} />{template.nodesCount} {isRTL ? "عقدة" : "nodes"}</span>
                          <span className="flex items-center gap-1"><BarChart2 size={11} />{template.views.toLocaleString()} {isRTL ? "مشاهدة" : "views"}</span>
                          <span className="flex items-center gap-1"><User size={11} />{template.author}</span>
                          <span className="ms-auto px-2 py-0.5 rounded-full bg-muted capitalize text-[10px]">{template.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setN8nPreview(template)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
                            <Eye size={12} /> {isRTL ? "معاينة" : "Preview"}
                          </button>
                          <button onClick={() => handleImport(template)} disabled={imported || importing}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-60">
                            {importing ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                            {imported ? (isRTL ? "تم الاستيراد" : "Imported") : (isRTL ? "استيراد" : "Import")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {n8nTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => setN8nPage(p => Math.max(1, p - 1))} disabled={n8nPage === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40">
                    {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? `${n8nPage} من ${n8nTotalPages}` : `${n8nPage} of ${n8nTotalPages}`}
                  </span>
                  <button onClick={() => setN8nPage(p => Math.min(n8nTotalPages, p + 1))} disabled={n8nPage === n8nTotalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40">
                    {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPreviewTemplate(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-6 max-w-lg w-full border border-border shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{previewTemplate.name}</h2>
                <button onClick={() => setPreviewTemplate(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{previewTemplate.description}</p>
              <div className="mb-4">
                <StarRating templateId={previewTemplate.id} currentRating={previewTemplate.avgRating} ratingCount={previewTemplate.ratingCount} isRTL={isRTL}
                  onRated={(avg, count) => { setLocalRatings(p => ({ ...p, [previewTemplate.id]: { avgRating: avg, ratingCount: count } })); setPreviewTemplate(prev => prev ? { ...prev, avgRating: avg, ratingCount: count } : null); }} />
              </div>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center mb-4">
                <p className="text-sm text-muted-foreground">{isRTL ? "معاينة المخطط" : "Node graph preview"}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPreviewTemplate(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
                <button onClick={() => { useTemplate({ id: previewTemplate.id.toString() } as Parameters<typeof useTemplate>[0]); setPreviewTemplate(null); }}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors">{t("templates.use")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {n8nPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setN8nPreview(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-6 max-w-lg w-full border border-border shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground leading-tight">{n8nPreview.name}</h2>
                <button onClick={() => setN8nPreview(null)} className="p-1 rounded-lg hover:bg-muted transition-colors ms-2 shrink-0">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              {n8nPreview.imageUrl && (
                <img src={n8nPreview.imageUrl} alt={n8nPreview.name} className="w-full h-40 object-cover rounded-xl mb-4 bg-muted" />
              )}
              <p className="text-sm text-muted-foreground mb-4">{n8nPreview.description || (isRTL ? "لا يوجد وصف" : "No description available")}</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "العقد" : "Nodes"}</p>
                  <p className="font-semibold text-foreground text-sm">{n8nPreview.nodesCount}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "المشاهدات" : "Views"}</p>
                  <p className="font-semibold text-foreground text-sm">{n8nPreview.views.toLocaleString()}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الفئة" : "Category"}</p>
                  <p className="font-semibold text-foreground text-sm capitalize text-xs">{n8nPreview.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
                <User size={13} />
                <span>{isRTL ? "بواسطة" : "By"} {n8nPreview.author}</span>
                <a href={`https://n8n.io/workflows/${n8nPreview.id}`} target="_blank" rel="noopener noreferrer"
                  className="ms-auto flex items-center gap-1 text-accent hover:underline">
                  <Globe size={12} /> {isRTL ? "عرض على n8n.io" : "View on n8n.io"}
                </a>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setN8nPreview(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
                <button
                  onClick={() => { handleImport(n8nPreview); setN8nPreview(null); }}
                  disabled={importedIds.has(n8nPreview.id) || importingId === n8nPreview.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-60">
                  <Download size={14} />
                  {importedIds.has(n8nPreview.id) ? (isRTL ? "تم الاستيراد" : "Imported") : (isRTL ? "استيراد القالب" : "Import Template")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">{isRTL ? "إضافة قالب جديد" : "Add New Template"}</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{isRTL ? "الاسم" : "Name"} *</label>
                  <input value={newTemplate.name} onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder={isRTL ? "اسم القالب" : "Template name"} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{isRTL ? "الوصف" : "Description"} *</label>
                  <textarea value={newTemplate.description} onChange={e => setNewTemplate(p => ({ ...p, description: e.target.value }))} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    placeholder={isRTL ? "وصف القالب" : "Template description"} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{isRTL ? "التصنيف" : "Category"}</label>
                  <select value={newTemplate.category} onChange={e => setNewTemplate(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                    {LOCAL_CATEGORIES.filter(c => c !== "all").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
                <button onClick={handleAddTemplate} disabled={addingTemplate || !newTemplate.name.trim() || !newTemplate.description.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {addingTemplate ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ القالب" : "Save Template")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
