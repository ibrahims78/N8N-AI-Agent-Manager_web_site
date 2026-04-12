import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, Star, Eye, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "wouter";
import { useGetTemplates, useUseTemplate, getGetTemplatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  nodesCount: number;
  usageCount: number;
  avgRating: number;
}

const CATEGORIES = ["all", "email", "reports", "api", "scheduling", "alerts"];

export default function TemplatesPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: res, isLoading } = useGetTemplates({
    request: { headers: authHeader },
    query: { queryKey: getGetTemplatesQueryKey() },
  } as Parameters<typeof useGetTemplates>[0]);

  const { mutate: useTemplate } = useUseTemplate({
    mutation: {
      onSuccess: (data) => {
        const conv = (data as { data?: { id?: number } })?.data;
        if (conv?.id) {
          window.location.hash = `#/chat`;
        }
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useUseTemplate>[0]);

  const templates: Template[] = ((res as { data?: { templates?: unknown[] } } | undefined)?.data?.templates ?? []) as Template[];
  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || t.category === category;
    return matchSearch && matchCat;
  });

  const mostUsed = templates.slice().sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);

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
        <div className="flex gap-1 flex-wrap">
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
                  <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    <Star size={12} fill="currentColor" />
                    <span>{template.avgRating.toFixed(1)}</span>
                  </div>
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
                  <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    <Star size={12} fill="currentColor" />
                    <span>{template.avgRating.toFixed(1)}</span>
                  </div>
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

      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPreviewTemplate(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 max-w-lg w-full border border-border shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">{previewTemplate.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{previewTemplate.description}</p>
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
    </div>
  );
}
