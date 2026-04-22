import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, ExternalLink, BookOpen, KeyRound, Filter, Loader2,
  Zap, Package, ChevronLeft, ChevronRight, Tag,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

interface CategoryItem {
  name: string;
  count: number;
}

interface StatusItem {
  totalNodes: number;
  source: string;
  branch: string;
  fetchedAt: string | null;
  loadedFromStatic: boolean;
}

const PAGE_SIZE = 24;

export default function NodesCatalogPage() {
  const { language } = useAppStore();
  const { t } = useTranslation();
  const isRTL = language === "ar";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<"all" | "trigger" | "regular">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, triggerFilter]);

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
      const r = await apiRequest<{ success: boolean; data: { categories: CategoryItem[] } }>(
        `/catalog/categories`
      );
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

  const totalPages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-accent" size={24} />
            {isRTL ? "كتالوج عقد n8n" : "n8n Nodes Catalog"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? "مرجع شامل لجميع عقد n8n مع الفئات وروابط التوثيق والأمثلة"
              : "Complete reference for all n8n nodes with categories, docs, and examples"}
          </p>
        </div>
        {status && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
            <div>
              <strong className="text-foreground">{status.totalNodes}</strong>{" "}
              {isRTL ? "عقدة" : "nodes"} · {status.branch}
            </div>
            {status.fetchedAt && (
              <div className="opacity-70 mt-0.5">
                {isRTL ? "آخر تحديث: " : "Updated: "}
                {new Date(status.fetchedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
            />
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
                category === "all"
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {isRTL ? "الكل" : "All"}
            </button>
            {cats.map((c) => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`text-xs rounded-full px-3 py-1 transition-colors ${
                  category === c.name
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c.name} <span className="opacity-60">({c.count})</span>
              </button>
            ))}
          </div>
        )}
      </Card>

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
              <NodeCard key={node.id} node={node} isRTL={isRTL} />
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
              <span className="text-sm text-muted-foreground px-3">
                {page} / {totalPages}
              </span>
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
    </div>
  );
}

function NodeCard({ node, isRTL }: { node: CatalogItem; isRTL: boolean }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Card className="p-4 h-full flex flex-col gap-3 hover:border-accent/50 transition-colors">
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
                  <Zap size={10} />
                  Trigger
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
              <span
                key={c}
                className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-0.5 inline-flex items-center gap-1"
              >
                <Tag size={9} />
                {c}
              </span>
            ))}
          </div>
        )}

        {node.aliases.length > 0 && (
          <div className="text-[11px] text-muted-foreground line-clamp-2">
            <span className="opacity-60">{isRTL ? "أسماء بديلة: " : "Aliases: "}</span>
            {node.aliases.join(", ")}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
          {node.primaryDocsUrl && (
            <a
              href={node.primaryDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline flex items-center gap-1"
            >
              <BookOpen size={12} />
              {isRTL ? "توثيق" : "Docs"}
              <ExternalLink size={10} />
            </a>
          )}
          {node.credentialDocsUrl && (
            <a
              href={node.credentialDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline flex items-center gap-1"
            >
              <KeyRound size={12} />
              {isRTL ? "اعتماد" : "Auth"}
              <ExternalLink size={10} />
            </a>
          )}
          {node.examples.length > 0 && (
            <span className="text-[11px] text-muted-foreground ms-auto">
              {node.examples.length} {isRTL ? "مثال" : "examples"}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
