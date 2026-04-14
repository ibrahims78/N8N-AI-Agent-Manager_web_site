import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, LayoutGrid, List, Plus, Trash2, Play, Pause, ChevronRight, BookmarkPlus, X, ExternalLink, MessageSquarePlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useGetWorkflows, useActivateWorkflow, useDeactivateWorkflow, useDeleteWorkflow, useBulkActionWorkflows, getGetWorkflowsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, API_BASE, apiRequest } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/hooks/use-toast";

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  successRate: number;
  executionCount: number;
  lastExecution: string;
  isRunning?: boolean;
}

type ViewMode = "card" | "list";

const TEMPLATE_CATEGORIES = ["email", "reports", "api", "scheduling", "alerts"];

export default function WorkflowsPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveAsTemplateWf, setSaveAsTemplateWf] = useState<Workflow | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", description: "", category: "api" });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [creatingWorkflow, setCreatingWorkflow] = useState(false);
  const [createdWorkflowId, setCreatedWorkflowId] = useState<string | null>(null);
  const [n8nUrl, setN8nUrl] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const authHeader = getAuthHeader();
  const { data: res, isLoading } = useGetWorkflows(
    undefined,
    { query: { refetchInterval: 30000 } },
  );

  const { mutate: activate } = useActivateWorkflow({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() }) },
    request: { headers: authHeader },
  } as Parameters<typeof useActivateWorkflow>[0]);

  const { mutate: deactivate } = useDeactivateWorkflow({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() }) },
    request: { headers: authHeader },
  } as Parameters<typeof useDeactivateWorkflow>[0]);

  const { mutate: deleteWf } = useDeleteWorkflow({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() }) },
    request: { headers: authHeader },
  } as Parameters<typeof useDeleteWorkflow>[0]);

  const { mutate: bulkAction } = useBulkActionWorkflows({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() }); setSelected(new Set()); } },
    request: { headers: authHeader },
  } as Parameters<typeof useBulkActionWorkflows>[0]);

  const workflows: Workflow[] = ((res as { data?: { workflows?: unknown[] } } | undefined)?.data?.workflows ?? []) as Workflow[];
  const filtered = workflows.filter(w => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? w.active : !w.active);
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openSaveAsTemplate = (wf: Workflow) => {
    setSaveAsTemplateWf(wf);
    setTemplateForm({ name: wf.name, description: "", category: "api" });
  };

  const openCreateModal = useCallback(async () => {
    setNewWorkflowName("");
    setCreatedWorkflowId(null);
    setShowCreateModal(true);
    try {
      const settings = await apiRequest<{ success: boolean; data?: { url?: string } }>("/settings/n8n");
      if (settings.success && settings.data?.url) setN8nUrl(settings.data.url);
    } catch {}
  }, []);

  const handleCreateWorkflow = async () => {
    setCreatingWorkflow(true);
    try {
      const result = await apiRequest<{ success: boolean; data?: { id: string }; error?: { message: string } }>("/workflows", {
        method: "POST",
        body: JSON.stringify({ name: newWorkflowName.trim() || (isRTL ? "مسار عمل جديد" : "New Workflow") }),
      });
      if (result.success && result.data?.id) {
        setCreatedWorkflowId(result.data.id);
        queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() });
      } else {
        toast({ title: result.error?.message ?? (isRTL ? "فشل إنشاء المسار" : "Failed to create workflow"), variant: "destructive" });
      }
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    } finally {
      setCreatingWorkflow(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!saveAsTemplateWf || !templateForm.name.trim() || !templateForm.description.trim()) return;
    setSavingTemplate(true);
    try {
      const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
      const token = localStorage.getItem("accessToken");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: templateForm.name.trim(),
          description: templateForm.description.trim(),
          category: templateForm.category,
          nodesCount: 0,
          workflowJson: { workflowId: saveAsTemplateWf.id, name: saveAsTemplateWf.name },
        }),
      });
      const data = await res.json() as { success: boolean; error?: { message: string } };
      if (data.success) {
        toast({ title: isRTL ? "تم حفظ الـ workflow كقالب ✅" : "Workflow saved as template ✅" });
        setSaveAsTemplateWf(null);
      } else {
        toast({ title: data.error?.message ?? "Failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    } finally {
      setSavingTemplate(false);
    }
  };

  const SuccessRateBar = ({ rate }: { rate: number }) => (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${rate}%` }}
        className={`h-full rounded-full ${rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-yellow-500" : "bg-destructive"}`}
      />
    </div>
  );

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("workflows.search")}
              className="w-full ps-9 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["all", "active", "inactive"] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f === "all" ? (isRTL ? "الكل" : "All") : f === "active" ? t("workflows.active") : t("workflows.inactive")}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("card")} className={`p-2 rounded-md transition-colors ${viewMode === "card" ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"}`}>
            <List size={16} />
          </button>
          <button
            onClick={() => void openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} />
            {t("workflows.new")}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20"
          >
            <span className="text-sm text-accent font-medium">{selected.size} {isRTL ? "محدد" : "selected"}</span>
            <div className="flex gap-2 ms-auto">
              <button onClick={() => bulkAction({ ids: [...selected], action: "activate" } as Parameters<typeof bulkAction>[0])} className="px-3 py-1 rounded-md bg-emerald-500 text-white text-xs hover:bg-emerald-600 transition-colors">
                {t("workflows.bulkActivate")}
              </button>
              <button onClick={() => bulkAction({ ids: [...selected], action: "deactivate" } as Parameters<typeof bulkAction>[0])} className="px-3 py-1 rounded-md bg-yellow-500 text-white text-xs hover:bg-yellow-600 transition-colors">
                {t("workflows.bulkDeactivate")}
              </button>
              <button onClick={() => bulkAction({ ids: [...selected], action: "delete" } as Parameters<typeof bulkAction>[0])} className="px-3 py-1 rounded-md bg-destructive text-white text-xs hover:bg-destructive/80 transition-colors">
                {t("workflows.bulkDelete")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === "card" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-40 mb-3" />
              <div className="h-3 bg-muted rounded w-24 mb-4" />
              <div className="h-1.5 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{t("workflows.noWorkflows")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("workflows.configureN8n")}</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => toggleSelect(wf.id)}
              className={`bg-card rounded-xl p-5 border cursor-pointer transition-colors ${selected.has(wf.id) ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent/50"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {wf.isRunning && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
                  <h3 className="font-medium text-foreground text-sm truncate">{wf.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ms-2 ${wf.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                  {wf.active ? t("workflows.active") : t("workflows.inactive")}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t("workflows.successRate")}</span>
                  <span className="text-xs font-medium text-foreground">{wf.successRate?.toFixed(0) ?? 0}%</span>
                </div>
                <SuccessRateBar rate={wf.successRate ?? 0} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t("workflows.lastExecution")}: {wf.lastExecution ? new Date(wf.lastExecution).toLocaleDateString() : "-"}
                </span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => wf.active ? deactivate({ id: wf.id } as Parameters<typeof deactivate>[0]) : activate({ id: wf.id } as Parameters<typeof activate>[0])}
                    className={`p-1.5 rounded-md text-xs transition-colors ${wf.active ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950"}`}
                    title={wf.active ? (isRTL ? "إيقاف" : "Deactivate") : (isRTL ? "تفعيل" : "Activate")}
                  >
                    {wf.active ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => openSaveAsTemplate(wf)}
                    className="p-1.5 rounded-md text-accent hover:bg-accent/10 transition-colors"
                    title={isRTL ? "حفظ كقالب" : "Save as template"}
                  >
                    <BookmarkPlus size={14} />
                  </button>
                  <button
                    onClick={() => deleteWf({ id: wf.id } as Parameters<typeof deleteWf>[0])}
                    className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                    title={isRTL ? "حذف" : "Delete"}
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link href={`/workflows/${wf.id}`}>
                    <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground w-8">
                  <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(w => w.id)) : new Set())} />
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isRTL ? "الاسم" : "Name"}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isRTL ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("workflows.successRate")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("workflows.lastExecution")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isRTL ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(wf => (
                <tr key={wf.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(wf.id)} onChange={() => toggleSelect(wf.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {wf.isRunning && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      <span className="font-medium text-foreground">{wf.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${wf.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {wf.active ? t("workflows.active") : t("workflows.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${wf.successRate >= 90 ? "bg-emerald-500" : wf.successRate >= 70 ? "bg-yellow-500" : "bg-destructive"}`}
                          style={{ width: `${wf.successRate ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{wf.successRate?.toFixed(0) ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {wf.lastExecution ? new Date(wf.lastExecution).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => wf.active ? deactivate({ id: wf.id } as Parameters<typeof deactivate>[0]) : activate({ id: wf.id } as Parameters<typeof activate>[0])}
                        className={`p-1.5 rounded-md ${wf.active ? "text-yellow-500 hover:bg-yellow-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                      >
                        {wf.active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => openSaveAsTemplate(wf)}
                        className="p-1.5 rounded-md text-accent hover:bg-accent/10 transition-colors"
                        title={isRTL ? "حفظ كقالب" : "Save as template"}
                      >
                        <BookmarkPlus size={14} />
                      </button>
                      <button onClick={() => deleteWf({ id: wf.id } as Parameters<typeof deleteWf>[0])} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </button>
                      <Link href={`/workflows/${wf.id}`}>
                        <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                          <ChevronRight size={14} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save as Template Modal */}
      <AnimatePresence>
        {saveAsTemplateWf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSaveAsTemplateWf(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  {isRTL ? "حفظ كقالب" : "Save as Template"}
                </h2>
                <button onClick={() => setSaveAsTemplateWf(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {isRTL ? `حفظ "${saveAsTemplateWf.name}" كقالب قابل لإعادة الاستخدام` : `Saving "${saveAsTemplateWf.name}" as a reusable template`}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {isRTL ? "اسم القالب" : "Template Name"} *
                  </label>
                  <input
                    value={templateForm.name}
                    onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {isRTL ? "وصف القالب" : "Description"} *
                  </label>
                  <textarea
                    value={templateForm.description}
                    onChange={e => setTemplateForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    placeholder={isRTL ? "ماذا يفعل هذا القالب؟" : "What does this template do?"}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    {isRTL ? "التصنيف" : "Category"}
                  </label>
                  <select
                    value={templateForm.category}
                    onChange={e => setTemplateForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {TEMPLATE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setSaveAsTemplateWf(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  {t("app.cancel")}
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={savingTemplate || !templateForm.name.trim() || !templateForm.description.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <BookmarkPlus size={15} />
                  {savingTemplate ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ كقالب" : "Save as Template")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Workflow Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {isRTL ? "إنشاء مسار عمل جديد" : "Create New Workflow"}
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {!createdWorkflowId ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {isRTL ? "اسم المسار" : "Workflow Name"}
                      </label>
                      <input
                        value={newWorkflowName}
                        onChange={e => setNewWorkflowName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") void handleCreateWorkflow(); }}
                        placeholder={isRTL ? "مسار عمل جديد" : "New Workflow"}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        autoFocus
                      />
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">
                        {isRTL ? "⚙️ متطلبات إعداد n8n:" : "⚙️ n8n Setup Requirements:"}
                      </p>
                      <p>{isRTL ? "• رابط n8n (مثال: https://n8n.example.com)" : "• n8n URL (e.g. https://n8n.example.com)"}</p>
                      <p>{isRTL ? "• مفتاح API من: الإعدادات ← API ← إنشاء مفتاح" : "• API Key from: Settings → API → Create Key"}</p>
                      {n8nUrl && (
                        <a
                          href={n8nUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent hover:underline pt-1"
                        >
                          <ExternalLink size={11} />
                          {isRTL ? "فتح لوحة n8n" : "Open n8n Dashboard"}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                    >
                      {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      onClick={() => void handleCreateWorkflow()}
                      disabled={creatingWorkflow}
                      className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
                    >
                      {creatingWorkflow ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          {isRTL ? "جاري الإنشاء..." : "Creating..."}
                        </span>
                      ) : isRTL ? "إنشاء" : "Create"}
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => { setShowCreateModal(false); navigate("/chat"); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent/30 text-accent text-sm hover:bg-accent/5 transition-colors"
                    >
                      <MessageSquarePlus size={15} />
                      {isRTL ? "إنشاء بالذكاء الاصطناعي" : "Create with AI"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-foreground font-medium">
                    {isRTL ? "تم إنشاء المسار بنجاح!" : "Workflow created successfully!"}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowCreateModal(false); navigate(`/workflows/${createdWorkflowId}`); }}
                      className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
                    >
                      {isRTL ? "عرض التفاصيل" : "View Details"}
                    </button>
                    {n8nUrl && (
                      <a
                        href={`${n8nUrl}/workflow/${createdWorkflowId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                      >
                        <ExternalLink size={14} />
                        {isRTL ? "فتح في n8n" : "Open in n8n"}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
