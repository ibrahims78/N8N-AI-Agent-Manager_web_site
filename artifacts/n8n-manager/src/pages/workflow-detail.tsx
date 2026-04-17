import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "wouter";
import {
  ArrowRight, Play, Pause, CheckCircle2, XCircle, Clock,
  GitBranch, RotateCcw, ExternalLink, ChevronLeft, MessageSquare,
  AlertTriangle, Code2, Plus, Minus, Edit3,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { getAuthHeader, apiRequest, API_BASE } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes?: Array<{ id: string; name: string; type: string; position?: [number, number] }>;
  connections?: Record<string, unknown>;
  successRate?: number;
  executionCount?: number;
  lastExecution?: string;
}

interface Execution {
  id: string;
  status: "success" | "error" | "running" | "waiting";
  startedAt: string;
  stoppedAt?: string;
  mode?: string;
}

interface Version {
  id: number;
  versionNumber: number;
  changeDescription: string;
  createdAt: string;
  workflowJson: unknown;
}

// PROPOSAL 4: Proper node-level diff between a saved version and the current workflow
function NodeDiff({
  versionNodes,
  currentNodes,
  isRTL,
}: {
  versionNodes: Array<{ id: string; name: string; type: string }>;
  currentNodes: Array<{ id: string; name: string; type: string }> | undefined;
  isRTL: boolean;
}) {
  const current = currentNodes ?? [];

  const versionIds = new Set(versionNodes.map(n => n.id));
  const currentIds = new Set(current.map(n => n.id));

  const added = current.filter(n => !versionIds.has(n.id));
  const removed = versionNodes.filter(n => !currentIds.has(n.id));
  const changed = versionNodes.filter(n => {
    if (!currentIds.has(n.id)) return false;
    const curr = current.find(c => c.id === n.id)!;
    return curr.name !== n.name || curr.type !== n.type;
  });
  const unchanged = versionNodes.filter(n => {
    if (!currentIds.has(n.id)) return false;
    const curr = current.find(c => c.id === n.id)!;
    return curr.name === n.name && curr.type === n.type;
  });

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    return (
      <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
        <CheckCircle2 size={13} />
        {isRTL ? "لا توجد تغييرات في الـ Nodes بين هذا الإصدار والحالي" : "No node-level differences between this version and current"}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {isRTL ? "الفرق عن الوضع الحالي" : "Diff vs current workflow"}
      </p>

      {removed.length > 0 && (
        <div className="space-y-1">
          {removed.map(n => (
            <div key={n.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <Minus size={11} className="text-red-500 shrink-0" />
              <span className="text-xs text-red-700 dark:text-red-400 font-medium truncate">{n.name}</span>
              <span className="text-[9px] text-red-400/70 ms-auto shrink-0">{n.type.split(".").pop()}</span>
            </div>
          ))}
        </div>
      )}

      {added.length > 0 && (
        <div className="space-y-1">
          {added.map(n => (
            <div key={n.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <Plus size={11} className="text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate">{n.name}</span>
              <span className="text-[9px] text-emerald-400/70 ms-auto shrink-0">{n.type.split(".").pop()}</span>
            </div>
          ))}
        </div>
      )}

      {changed.length > 0 && (
        <div className="space-y-1">
          {changed.map(n => {
            const curr = current.find(c => c.id === n.id)!;
            return (
              <div key={n.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <Edit3 size={11} className="text-yellow-600 shrink-0" />
                <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium truncate">
                  {n.name} → {curr.name !== n.name ? curr.name : n.name}
                </span>
                <span className="text-[9px] text-yellow-400/70 ms-auto shrink-0">{isRTL ? "تغيير" : "modified"}</span>
              </div>
            );
          })}
        </div>
      )}

      {unchanged.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {isRTL ? `+ ${unchanged.length} node${unchanged.length !== 1 ? "s" : ""} بدون تغيير` : `+ ${unchanged.length} node${unchanged.length !== 1 ? "s" : ""} unchanged`}
        </p>
      )}
    </div>
  );
}

function NodePreview({ nodes }: { nodes: Workflow["nodes"] }) {
  if (!nodes?.length) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
        <Code2 size={16} className="me-2" /> لا توجد بيانات للمعاينة البصرية
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-xl overflow-auto max-h-48">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground shadow-sm whitespace-nowrap">
            <span className="text-muted-foreground me-1 text-[10px]">{node.type.split(".").pop()}</span>
            {node.name}
          </div>
          {i < nodes.length - 1 && <ArrowRight size={12} className="text-muted-foreground shrink-0" />}
        </div>
      ))}
    </div>
  );
}

export default function WorkflowDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const authHeader = getAuthHeader();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"executions" | "versions">("executions");
  const [executionFilter, setExecutionFilter] = useState<"all" | "success" | "error">("all");
  const [diffVersion, setDiffVersion] = useState<Version | null>(null);

  const { data: wfRes, isLoading: wfLoading } = useQuery({
    queryKey: ["workflow", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/workflows/${id}`, { headers: authHeader });
      return res.json() as Promise<{ success: boolean; data?: Workflow }>;
    },
    enabled: !!id,
  });

  const { data: execRes, isLoading: execLoading } = useQuery({
    queryKey: ["workflow-executions", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/workflows/${id}/executions?limit=30`, { headers: authHeader });
      return res.json() as Promise<{ success: boolean; data?: { executions: Execution[] } }>;
    },
    enabled: !!id,
    refetchInterval: 30000,
  });

  const { data: versionsRes } = useQuery({
    queryKey: ["workflow-versions", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/workflows/${id}/versions`, { headers: authHeader });
      return res.json() as Promise<{ success: boolean; data?: { versions: Version[] } }>;
    },
    enabled: !!id,
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      return apiRequest(`/workflows/${id}/restore/${versionId}`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-versions", id] });
      toast({ title: isRTL ? "تم استعادة الإصدار بنجاح" : "Version restored successfully" });
    },
    onError: () => {
      toast({ title: isRTL ? "فشل استعادة الإصدار" : "Failed to restore version", variant: "destructive" });
    },
  });

  const workflow = wfRes?.data;
  const executions = execRes?.data?.executions ?? [];
  const versions = versionsRes?.data?.versions ?? [];

  const filteredExecutions = executions.filter(e => {
    if (executionFilter === "success") return e.status === "success";
    if (executionFilter === "error") return e.status === "error";
    return true;
  });

  const totalExec = executions.length;
  const successExec = executions.filter(e => e.status === "success").length;
  const successPct = totalExec > 0 ? Math.round((successExec / totalExec) * 100) : 0;

  const formatDuration = (start: string, stop?: string) => {
    if (!stop) return "-";
    const ms = new Date(stop).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (wfLoading) {
    return (
      <div className="space-y-4 animate-pulse" dir={isRTL ? "rtl" : "ltr"}>
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-16" dir={isRTL ? "rtl" : "ltr"}>
        <XCircle size={40} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">{isRTL ? "لم يتم العثور على الـ Workflow" : "Workflow not found"}</p>
        <Link href="/workflows">
          <button className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm">
            {isRTL ? "العودة للقائمة" : "Back to List"}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/workflows">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} />
            {isRTL ? "مسارات العمل" : "Workflows"}
          </button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-lg font-bold text-foreground truncate">{workflow.name}</h1>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          workflow.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
        }`}>
          {workflow.active ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">{isRTL ? "إجمالي التنفيذات" : "Total Executions"}</p>
          <p className="text-2xl font-bold text-foreground">{totalExec}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">{isRTL ? "معدل النجاح" : "Success Rate"}</p>
          <p className={`text-2xl font-bold ${successPct >= 90 ? "text-emerald-500" : successPct >= 70 ? "text-yellow-500" : "text-destructive"}`}>
            {successPct}%
          </p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${successPct >= 90 ? "bg-emerald-500" : successPct >= 70 ? "bg-yellow-500" : "bg-destructive"}`}
              style={{ width: `${successPct}%` }}
            />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الإصدارات المحفوظة" : "Saved Versions"}</p>
          <p className="text-2xl font-bold text-foreground">{versions.length}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Code2 size={16} />
          {isRTL ? "المعاينة البصرية" : "Visual Preview"}
        </h2>
        <NodePreview nodes={workflow.nodes} />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {(["executions", "versions"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "text-accent border-b-2 border-accent bg-accent/5" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "executions"
                ? (isRTL ? `سجل التنفيذات (${executions.length})` : `Executions (${executions.length})`)
                : (isRTL ? `الإصدارات (${versions.length})` : `Versions (${versions.length})`)
              }
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "executions" && (
            <motion.div key="executions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-1 p-3 border-b border-border">
                {(["all", "success", "error"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setExecutionFilter(f)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      executionFilter === f ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f === "all" ? (isRTL ? "الكل" : "All") : f === "success" ? (isRTL ? "ناجح" : "Success") : (isRTL ? "فاشل" : "Failed")}
                  </button>
                ))}
              </div>

              {execLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
                </div>
              ) : !filteredExecutions.length ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  {isRTL ? "لا توجد تنفيذات" : "No executions found"}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredExecutions.map(exec => (
                    <div key={exec.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="shrink-0">
                        {exec.status === "success"
                          ? <CheckCircle2 size={16} className="text-emerald-500" />
                          : exec.status === "error"
                          ? <XCircle size={16} className="text-destructive" />
                          : <Clock size={16} className="text-yellow-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {new Date(exec.startedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "المدة:" : "Duration:"} {formatDuration(exec.startedAt, exec.stoppedAt)}
                        </p>
                      </div>
                      {exec.status === "error" && (
                        <Link href={`/chat?diagnosisExecId=${exec.id}&workflowId=${id}`}>
                          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs hover:bg-destructive/20 transition-colors">
                            <MessageSquare size={12} />
                            {isRTL ? "تشخيص" : "Diagnose"}
                          </button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "versions" && (
            <motion.div key="versions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!versions.length ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  {isRTL ? "لا توجد إصدارات محفوظة" : "No saved versions"}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {versions.map(ver => (
                    <div key={ver.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                            v{ver.versionNumber}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {ver.changeDescription || (isRTL ? "بدون وصف" : "No description")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(ver.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setDiffVersion(diffVersion?.id === ver.id ? null : ver)}
                            className="px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {isRTL ? "معاينة" : "Preview"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(isRTL ? `هل تريد استعادة الإصدار ${ver.versionNumber}؟` : `Restore version ${ver.versionNumber}?`)) {
                                restoreMutation.mutate(ver.id);
                              }
                            }}
                            disabled={restoreMutation.isPending}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs hover:bg-accent/20 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw size={12} />
                            {isRTL ? "استعادة" : "Restore"}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {diffVersion?.id === ver.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {/* PROPOSAL 4: Node-level diff instead of raw JSON dump */}
                            <NodeDiff
                              versionNodes={
                                (ver.workflowJson as { nodes?: Array<{ id: string; name: string; type: string }> } | null)?.nodes ?? []
                              }
                              currentNodes={workflow?.nodes}
                              isRTL={isRTL}
                            />
                            <details className="mt-2">
                              <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                                {isRTL ? "عرض JSON الكامل" : "Show full JSON"}
                              </summary>
                              <pre className="mt-2 p-3 bg-muted rounded-lg text-[10px] font-mono overflow-auto max-h-40 text-foreground whitespace-pre-wrap">
                                {JSON.stringify(ver.workflowJson, null, 2)}
                              </pre>
                            </details>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
