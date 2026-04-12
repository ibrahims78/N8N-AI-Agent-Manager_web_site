import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, Star, Eye, ArrowRight, Zap, X, Plus } from "lucide-react";
import { useGetTemplates, useUseTemplate, getGetTemplatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, API_BASE } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  nodesCount: number;
  usageCount: number;
  avgRating: number;
  ratingCount: number;
}

const CATEGORIES = ["all", "email", "reports", "api", "scheduling", "alerts"];

function StarRating({
  templateId,
  currentRating,
  ratingCount,
  isRTL,
  onRated,
}: {
  templateId: number;
  currentRating: number;
  ratingCount: number;
  isRTL: boolean;
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
      const token = localStorage.getItem("accessToken");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/templates/${templateId}/rate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating }),
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            disabled={submitting}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              size={14}
              className={`transition-colors ${
                star <= (hovered || currentRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
        <span className="text-xs text-muted-foreground ms-1">
          {(currentRating ?? 0).toFixed(1)}
          {ratingCount > 0 && <span className="text-[10px]"> ({ratingCount})</span>}
        </span>
      </div>
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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [localRatings, setLocalRatings] = useState<Record<number, { avgRating: number; ratingCount: number }>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", category: "api" });
  const [addingTemplate, setAddingTemplate] = useState(false);

  const { data: res, isLoading } = useGetTemplates({
    request: { headers: authHeader },
    query: { queryKey: getGetTemplatesQueryKey() },
  } as Parameters<typeof useGetTemplates>[0]);

  const { mutate: useTemplate } = useUseTemplate({
    mutation: {
      onSuccess: () => {
        window.location.hash = `#/chat`;
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useUseTemplate>[0]);

  const rawTemplates: Template[] = ((res as { data?: { templates?: unknown[] } } | undefined)?.data?.templates ?? []) as Template[];

  const templates = rawTemplates.map(t => ({
    ...t,
    avgRating: localRatings[t.id]?.avgRating ?? (t.avgRating ?? 0),
    ratingCount: localRatings[t.id]?.ratingCount ?? (t.ratingCount ?? 0),
  }));

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || t.category === category;
    return matchSearch && matchCat;
  });

  const mostUsed = templates.slice().sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);

  const handleRated = (id: number, avgRating: number, ratingCount: number) => {
    setLocalRatings(prev => ({ ...prev, [id]: { avgRating, ratingCount } }));
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.description.trim()) return;
    setAddingTemplate(true);
    try {
      const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
      const token = localStorage.getItem("accessToken");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newTemplate.name.trim(),
          description: newTemplate.description.trim(),
          category: newTemplate.category,
          nodesCount: 0,
          workflowJson: { name: newTemplate.name.trim(), nodes: [], connections: {} },
        }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) {
        toast({ title: isRTL ? "تم إضافة القالب بنجاح ✅" : "Template added successfully ✅" });
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

  const TemplateRating = ({ template }: { template: Template }) => (
    <StarRating
      templateId={template.id}
      currentRating={template.avgRating}
      ratingCount={template.ratingCount}
      isRTL={isRTL}
      onRated={(avg, count) => handleRated(template.id, avg, count)}
    />
  );

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("templates.search")}
            className="w-full ps-9 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <div className="flex gap-1 flex-wrap flex-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {t(`templates.${cat}` as keyof typeof t)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors shrink-0"
        >
          <Plus size={15} />
          {isRTL ? "قالب جديد" : "New Template"}
        </button>
      </div>

      {!search && category === "all" && mostUsed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">{t("templates.mostUsed")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mostUsed.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-accent/10 to-accent-secondary/5 rounded-xl p-5 border border-accent/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Zap size={20} className="text-accent" />
                  </div>
                  <TemplateRating template={template} />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{template.nodesCount} {t("workflows.nodes")}</span>
                  <button
                    onClick={() => useTemplate({ id: template.id.toString() } as Parameters<typeof useTemplate>[0])}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors"
                  >
                    {t("templates.use")} <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        {search || category !== "all" ? (
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {filtered.length} {isRTL ? "نتيجة" : "results"}
          </h2>
        ) : (
          <h2 className="text-sm font-semibold text-foreground mb-3">{isRTL ? "جميع القوالب" : "All Templates"}</h2>
        )}

        {isLoading ? (
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
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-5 border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Zap size={18} className="text-accent" />
                  </div>
                  <TemplateRating template={template} />
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
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors"
                  >
                    <Eye size={12} />
                    {t("templates.preview")}
                  </button>
                  <button
                    onClick={() => useTemplate({ id: template.id.toString() } as Parameters<typeof useTemplate>[0])}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors"
                  >
                    {t("templates.use")}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPreviewTemplate(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-lg w-full border border-border shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{previewTemplate.name}</h2>
                <button onClick={() => setPreviewTemplate(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{previewTemplate.description}</p>
              <div className="mb-4">
                <StarRating
                  templateId={previewTemplate.id}
                  currentRating={previewTemplate.avgRating}
                  ratingCount={previewTemplate.ratingCount}
                  isRTL={isRTL}
                  onRated={(avg, count) => {
                    handleRated(previewTemplate.id, avg, count);
                    setPreviewTemplate(prev => prev ? { ...prev, avgRating: avg, ratingCount: count } : null);
                  }}
                />
              </div>
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center mb-4">
                <p className="text-sm text-muted-foreground">{isRTL ? "معاينة المخطط" : "Node graph preview"}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPreviewTemplate(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  {t("app.cancel")}
                </button>
                <button
                  onClick={() => { useTemplate({ id: previewTemplate.id.toString() } as Parameters<typeof useTemplate>[0]); setPreviewTemplate(null); }}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
                >
                  {t("templates.use")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Template Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  {isRTL ? "إضافة قالب جديد" : "Add New Template"}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {isRTL ? "الاسم" : "Name"} *
                  </label>
                  <input
                    value={newTemplate.name}
                    onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder={isRTL ? "اسم القالب" : "Template name"}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {isRTL ? "الوصف" : "Description"} *
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={e => setNewTemplate(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    placeholder={isRTL ? "وصف القالب" : "Template description"}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {isRTL ? "التصنيف" : "Category"}
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={e => setNewTemplate(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {CATEGORIES.filter(c => c !== "all").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  {t("app.cancel")}
                </button>
                <button
                  onClick={handleAddTemplate}
                  disabled={addingTemplate || !newTemplate.name.trim() || !newTemplate.description.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
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
