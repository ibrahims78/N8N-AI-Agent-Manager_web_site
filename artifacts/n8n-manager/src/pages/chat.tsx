import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Send, Plus, Trash2, MessageSquare, CheckCircle2, XCircle,
  Loader2, ChevronRight, Copy, ExternalLink, Award, Zap,
  PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2,
  Paperclip, X, ThumbsUp, ThumbsDown, RotateCcw, Edit3,
  Search, Pin, Bot, FileText, FileJson, Image as ImageIcon,
  PanelRightOpen, PanelRightClose, Clock, Hash, Layers, Check,
  ScanSearch, Wrench, AlertTriangle, AlertCircle, ShieldCheck, ChevronDown,
  CornerDownLeft,
} from "lucide-react";
import { useGetConversations, useCreateConversation, useGetConversation, useDeleteConversation, getGetConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, apiRequest, API_BASE } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: number;
  title: string;
  type: string;
  messageCount: number;
  updatedAt: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  createdAt: string;
}

interface PhaseProgress {
  phase: 1 | 2 | 3 | 4;
  label: string;
  labelAr: string;
  status: "pending" | "running" | "done" | "failed";
  durationMs?: number;
}

interface GenerationResult {
  workflowJson: Record<string, unknown> | null;
  qualityScore: number;
  qualityGrade: string;
  roundsCount: number;
  totalTimeMs: number;
  phases: PhaseProgress[];
}

type AttachmentType = "image" | "json" | "text" | "yaml";

interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  size: number;
  content?: string;
  dataUrl?: string;
}

interface WorkflowProblem {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: "critical" | "high" | "medium" | "low";
  solution: string;
  solutionAr: string;
  affectedNode?: string | null;
}

interface AnalysisResult {
  problems: WorkflowProblem[];
  fixedWorkflowJson: Record<string, unknown> | null;
  workflowId: string;
  workflowName: string;
  totalTimeMs: number;
  phases: PhaseProgress[];
}

interface N8nWorkflowBasic {
  id: string;
  name: string;
  active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string, isRTL: boolean): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return isRTL ? "الآن" : "just now";
  if (diff < 3600) return isRTL ? `منذ ${Math.floor(diff / 60)} دقيقة` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return isRTL ? `منذ ${Math.floor(diff / 3600)} ساعة` : `${Math.floor(diff / 3600)}h ago`;
  return isRTL ? `منذ ${Math.floor(diff / 86400)} يوم` : `${Math.floor(diff / 86400)}d ago`;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhaseProgressBar({ phases, isRTL }: { phases: PhaseProgress[]; isRTL: boolean }) {
  return (
    <div className="bg-card border border-border rounded-2xl rounded-ts-sm px-4 py-4 max-w-[85%] shadow-sm">
      <p className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        {isRTL ? "جاري معالجة الـ Workflow..." : "Processing Workflow..."}
      </p>
      <div className="relative">
        <div className={`absolute ${isRTL ? "end-3.5" : "start-3.5"} top-3.5 bottom-3.5 w-px bg-gradient-to-b from-accent/40 via-border to-border`} />
        <div className="space-y-3">
          {phases.map((phase, idx) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 relative ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {(() => {
                const isSkipped = phase.status === "done" && phase.durationMs === 0 &&
                  (phase.label.includes("Skipped") || phase.labelAr.includes("تم التخطي"));
                return (
                  <>
                    <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isSkipped
                        ? "bg-sky-400 shadow-md shadow-sky-400/30"
                        : phase.status === "done"
                        ? "bg-emerald-500 shadow-md shadow-emerald-500/30"
                        : phase.status === "running"
                        ? "bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md shadow-accent/30"
                        : phase.status === "failed"
                        ? "bg-destructive shadow-md shadow-destructive/30"
                        : "bg-muted border border-border"
                    }`}>
                      {phase.status === "pending" && <span className="text-[9px] font-bold text-muted-foreground">{phase.phase}</span>}
                      {phase.status === "running" && <Loader2 size={12} className="animate-spin text-white" />}
                      {phase.status === "done" && !isSkipped && <Check size={12} className="text-white" />}
                      {isSkipped && <Zap size={12} className="text-white" />}
                      {phase.status === "failed" && <XCircle size={12} className="text-white" />}
                    </div>
                    <div className={`flex-1 flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className={`text-xs font-medium transition-colors ${
                        isSkipped ? "text-sky-500 dark:text-sky-400"
                        : phase.status === "done" ? "text-foreground"
                        : phase.status === "running" ? "text-accent"
                        : phase.status === "failed" ? "text-destructive"
                        : "text-muted-foreground"
                      }`}>
                        {isRTL ? phase.labelAr : phase.label}
                      </span>
                      <span className="text-[10px] tabular-nums shrink-0">
                        {phase.status === "done" && !isSkipped && phase.durationMs !== undefined && phase.durationMs > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{(phase.durationMs / 1000).toFixed(1)}s</span>
                        )}
                        {isSkipped && (
                          <span className="text-sky-500 dark:text-sky-400 font-medium">⚡ {isRTL ? "متخطى" : "skipped"}</span>
                        )}
                        {phase.status === "running" && (
                          <span className="text-accent animate-pulse">{isRTL ? "جارٍ..." : "running..."}</span>
                        )}
                      </span>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QualityReport({ result, isRTL, onSendToN8n }: {
  result: GenerationResult;
  isRTL: boolean;
  onSendToN8n: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const gradeColor = result.qualityGrade === "A" || result.qualityGrade === "A+"
    ? "text-emerald-500"
    : result.qualityGrade === "B" ? "text-blue-500"
    : result.qualityGrade === "C" ? "text-yellow-500"
    : "text-orange-500";
  const scoreColor = result.qualityScore >= 85 ? "bg-emerald-500" : result.qualityScore >= 70 ? "bg-yellow-500" : "bg-orange-500";

  const handleCopy = async () => {
    if (result.workflowJson) {
      await navigator.clipboard.writeText(JSON.stringify(result.workflowJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl rounded-ts-sm px-4 py-3 max-w-[90%] space-y-3"
    >
      <div className="flex items-center gap-3">
        <Award size={18} className={gradeColor} />
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">
            {isRTL ? "تقرير جودة الـ Workflow" : "Workflow Quality Report"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isRTL
              ? `${result.roundsCount} جولة · ${(result.totalTimeMs / 1000).toFixed(1)} ثانية`
              : `${result.roundsCount} round(s) · ${(result.totalTimeMs / 1000).toFixed(1)}s`}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-black ${gradeColor}`}>{result.qualityGrade}</p>
          <p className="text-[10px] text-muted-foreground">{result.qualityScore}%</p>
        </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${result.qualityScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${scoreColor}`}
        />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {result.phases.map(p => (
          <div key={p.phase} className={`text-center py-1.5 rounded-lg text-[10px] font-medium ${
            p.status === "done" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : p.status === "failed" ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
          }`}>
            {isRTL ? `م${p.phase}` : `P${p.phase}`}
            {p.status === "done" && (
              <div className="text-[8px] opacity-70">{p.durationMs ? `${(p.durationMs / 1000).toFixed(0)}s` : "✓"}</div>
            )}
          </div>
        ))}
      </div>
      {result.workflowJson && (
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? (isRTL ? "تم النسخ!" : "Copied!") : (isRTL ? "نسخ JSON" : "Copy JSON")}
          </button>
          <button
            onClick={onSendToN8n}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors"
          >
            <Zap size={12} />
            {isRTL ? "إرسال لـ n8n" : "Send to n8n"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// Phase 5: Improved Typing Indicator
function TypingIndicator({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
        <Bot size={16} className="text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-ts-sm px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{isRTL ? "الوكيل يفكر..." : "Agent is thinking..."}</span>
      </div>
    </div>
  );
}

// Phase 5: Model Badge
function ModelBadge({ model }: { model: string }) {
  const isGPT = model.includes("gpt") || model.includes("GPT") || model.includes("sequential");
  const isGemini = model.includes("gemini") || model.includes("Gemini");
  const color = isGPT && isGemini ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    : isGPT ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : isGemini ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    : "bg-muted text-muted-foreground";

  const label = model.includes("sequential") ? "GPT+Gemini"
    : model.includes("gpt-4o") ? "GPT-4o"
    : model.includes("gemini") ? "Gemini"
    : model;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>
      <CheckCircle2 size={8} />
      {label}
    </span>
  );
}

// Phase 5: Day Separator
function DaySeparator({ date, isRTL }: { date: string; isRTL: boolean }) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (isSameDay(date, today.toISOString())) label = isRTL ? "اليوم" : "Today";
  else if (isSameDay(date, yesterday.toISOString())) label = isRTL ? "أمس" : "Yesterday";
  else label = d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// Phase 3: Attachment Preview Badge
function AttachmentBadge({ att, onRemove }: { att: Attachment; onRemove: () => void }) {
  const iconColor = att.type === "json" ? "text-blue-500" : att.type === "yaml" ? "text-purple-500" : att.type === "image" ? "text-emerald-500" : "text-muted-foreground";
  const bgColor = att.type === "json" ? "bg-blue-100 dark:bg-blue-900/30" : att.type === "yaml" ? "bg-purple-100 dark:bg-purple-900/30" : att.type === "image" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted";

  if (att.type === "image" && att.dataUrl) {
    return (
      <div className="relative group inline-block">
        <img
          src={att.dataUrl}
          alt={att.name}
          className="w-12 h-12 object-cover rounded-lg border border-border"
        />
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -end-1.5 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
        <div className="absolute bottom-0 inset-x-0 text-[8px] bg-black/50 text-white rounded-b-lg text-center truncate px-0.5">
          {att.name}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border ${bgColor}`}>
      <span className={iconColor}>
        {att.type === "json" ? <FileJson size={14} /> : att.type === "image" ? <ImageIcon size={14} /> : <FileText size={14} />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate max-w-[80px]">{att.name}</p>
        <p className="text-[9px] text-muted-foreground">{formatSize(att.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors ms-1"
      >
        <X size={10} />
      </button>
    </div>
  );
}

// Phase 1+5: Full MessageContent with Markdown
function MessageContent({ content, isRTL, isLatest = false }: { content: string; isRTL: boolean; isLatest?: boolean }) {
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  const textPart = jsonMatch ? content.replace(/```json\n[\s\S]*?\n```/, "").trim() : content;
  const [showJson, setShowJson] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(textPart || content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };
  const handleCopyJson = async () => {
    if (jsonMatch) {
      await navigator.clipboard.writeText(jsonMatch[1] ?? "");
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      {textPart && (
        <div className="text-sm">
          <MarkdownRenderer content={textPart} />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        <button
          onClick={handleCopyText}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copiedText ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
          {copiedText ? (isRTL ? "تم النسخ!" : "Copied!") : (isRTL ? "نسخ" : "Copy")}
        </button>

        {jsonMatch && (
          <>
            <span className="text-muted-foreground/30 select-none">·</span>
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <ChevronRight size={11} className={`transition-transform ${showJson ? "rotate-90" : ""}`} />
              {isRTL ? "عرض / إخفاء JSON" : "Show / Hide JSON"}
            </button>
            <span className="text-muted-foreground/30 select-none">·</span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedJson ? <CheckCircle2 size={11} className="text-emerald-500" /> : <Copy size={11} />}
              {copiedJson ? (isRTL ? "تم النسخ!" : "Copied!") : (isRTL ? "نسخ JSON" : "Copy JSON")}
            </button>
          </>
        )}
      </div>

      {jsonMatch && (
        <AnimatePresence>
          {showJson && (
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <code className="block p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-48 text-foreground whitespace-pre">
                {jsonMatch[1]}
              </code>
            </motion.pre>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── AnalysisReport ───────────────────────────────────────────────────────────

function SeverityBadge({ severity, isRTL }: { severity: WorkflowProblem["severity"]; isRTL: boolean }) {
  const config = {
    critical: { color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-700", icon: <AlertCircle className="h-3 w-3" />, label: isRTL ? "حرجة" : "Critical" },
    high: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-700", icon: <AlertTriangle className="h-3 w-3" />, label: isRTL ? "عالية" : "High" },
    medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700", icon: <AlertTriangle className="h-3 w-3" />, label: isRTL ? "متوسطة" : "Medium" },
    low: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700", icon: <ShieldCheck className="h-3 w-3" />, label: isRTL ? "منخفضة" : "Low" },
  }[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.icon}{config.label}
    </span>
  );
}

function AnalysisReport({
  result, isRTL, authHeader, toast,
}: {
  result: AnalysisResult;
  isRTL: boolean;
  authHeader: Record<string, string>;
  toast: (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const critCount = result.problems.filter(p => p.severity === "critical").length;
  const highCount = result.problems.filter(p => p.severity === "high").length;
  const medCount = result.problems.filter(p => p.severity === "medium").length;
  const lowCount = result.problems.filter(p => p.severity === "low").length;

  const handleApplyFix = async () => {
    if (!result.fixedWorkflowJson) return;
    setApplying(true);
    try {
      const res = await fetch(`${API_BASE}/workflows/${result.workflowId}/apply-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ workflowJson: result.fixedWorkflowJson }),
      });
      const data = await res.json() as { success: boolean; error?: { message?: string } };
      if (data.success) {
        setApplied(true);
        toast({ title: isRTL ? "✅ تم تطبيق الإصلاح" : "✅ Fix Applied", description: isRTL ? `تم تحديث "${result.workflowName}" في n8n بنجاح` : `"${result.workflowName}" updated in n8n successfully` });
      } else {
        toast({ title: isRTL ? "❌ فشل التطبيق" : "❌ Apply Failed", description: data.error?.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: isRTL ? "خطأ" : "Error", description: String(err), variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  const handleCopyJson = () => {
    if (result.fixedWorkflowJson) {
      navigator.clipboard.writeText(JSON.stringify(result.fixedWorkflowJson, null, 2)).catch(() => { /* ignore */ });
      toast({ title: isRTL ? "✅ تم النسخ" : "✅ Copied", description: isRTL ? "تم نسخ JSON المُصلَح" : "Fixed workflow JSON copied" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-border bg-card overflow-hidden shadow-md"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <ScanSearch className="h-4 w-4" />
          <span className="font-semibold text-sm">{isRTL ? "نتيجة تحليل الـ Workflow" : "Workflow Analysis Report"}</span>
          <span className="text-xs text-violet-200">{result.workflowName}</span>
        </div>
        <div className="text-xs text-violet-200">{(result.totalTimeMs / 1000).toFixed(1)}s</div>
      </div>

      {/* Stats bar */}
      {result.problems.length > 0 && (
        <div className="flex gap-1 p-3 bg-muted/30 border-b border-border flex-wrap">
          {critCount > 0 && <span className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-200 dark:border-red-700"><AlertCircle className="h-3 w-3" />{critCount} {isRTL ? "حرجة" : "Critical"}</span>}
          {highCount > 0 && <span className="flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-700"><AlertTriangle className="h-3 w-3" />{highCount} {isRTL ? "عالية" : "High"}</span>}
          {medCount > 0 && <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-700"><AlertTriangle className="h-3 w-3" />{medCount} {isRTL ? "متوسطة" : "Medium"}</span>}
          {lowCount > 0 && <span className="flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-700"><ShieldCheck className="h-3 w-3" />{lowCount} {isRTL ? "منخفضة" : "Low"}</span>}
        </div>
      )}

      {result.problems.length === 0 && (
        <div className="p-4 flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{isRTL ? "لم يتم اكتشاف أي مشاكل! الـ Workflow مصمم بشكل صحيح." : "No problems detected! The workflow looks healthy."}</span>
        </div>
      )}

      {/* Problems list */}
      {result.problems.length > 0 && (
        <div className="divide-y divide-border">
          {result.problems.map((prob, idx) => (
            <div key={idx} className="p-3">
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <SeverityBadge severity={prob.severity} isRTL={isRTL} />
                  <span className="text-sm font-medium truncate">{isRTL ? prob.titleAr : prob.title}</span>
                  {prob.affectedNode && (
                    <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                      {prob.affectedNode}
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded[idx] ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {expanded[idx] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-muted-foreground leading-relaxed">{isRTL ? prob.descriptionAr : prob.description}</p>
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 flex gap-2">
                        <Wrench className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-green-800 dark:text-green-300 leading-relaxed">{isRTL ? prob.solutionAr : prob.solution}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Fix actions */}
      {result.fixedWorkflowJson && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-t border-border flex flex-wrap gap-2 items-center">
          <span className="text-xs text-green-700 dark:text-green-400 font-medium flex-1">
            {isRTL ? "✨ نسخة مُصلَحة جاهزة للتطبيق" : "✨ Fixed version ready to apply"}
          </span>
          <button
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
          >
            <Copy className="h-3 w-3" />
            {isRTL ? "نسخ JSON" : "Copy JSON"}
          </button>
          <button
            onClick={() => setShowJson(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
          >
            <FileJson className="h-3 w-3" />
            {showJson ? (isRTL ? "إخفاء" : "Hide") : (isRTL ? "عرض JSON" : "View JSON")}
          </button>
          {!applied ? (
            <button
              onClick={handleApplyFix}
              disabled={applying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60"
            >
              {applying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wrench className="h-3 w-3" />}
              {isRTL ? "تطبيق الإصلاح في n8n" : "Apply Fix to n8n"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-3 w-3" />{isRTL ? "تم التطبيق!" : "Applied!"}
            </span>
          )}
        </div>
      )}
      {showJson && result.fixedWorkflowJson && (
        <div className="border-t border-border bg-muted/30 p-3">
          <pre className="text-xs overflow-auto max-h-64 leading-relaxed font-mono">
            <code>{JSON.stringify(result.fixedWorkflowJson, null, 2)}</code>
          </pre>
        </div>
      )}
    </motion.div>
  );
}

// ─── WorkflowPicker modal ─────────────────────────────────────────────────────

function WorkflowPickerModal({
  open, onClose, workflows, loading, onSelect, isRTL,
}: {
  open: boolean;
  onClose: () => void;
  workflows: N8nWorkflowBasic[];
  loading: boolean;
  onSelect: (id: string, name: string) => void;
  isRTL: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = workflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md"
        onClick={e => e.stopPropagation()}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-violet-500" />
            <h2 className="font-semibold text-base">{isRTL ? "اختر مسار العمل للتحليل" : "Select Workflow to Analyze"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            {isRTL
              ? "بعد الاختيار، ستُفتح محادثة وتُسأل عن المشكلة قبل بدء التحليل."
              : "After selecting, a conversation will open and ask you to describe the issue before analysis begins."}
          </p>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث عن مسار عمل..." : "Search workflow..."}
              className="w-full ps-9 pe-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {loading && (
              <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />{isRTL ? "جار التحميل..." : "Loading..."}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">{isRTL ? "لا توجد مسارات عمل" : "No workflows found"}</div>
            )}
            {!loading && filtered.map(wf => (
              <button
                key={wf.id}
                onClick={() => onSelect(wf.id, wf.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-start"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${wf.active ? "bg-green-500" : "bg-muted-foreground"}`} />
                <span className="text-sm flex-1 truncate font-medium">{wf.name}</span>
                <span className="text-xs text-muted-foreground">{wf.active ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { t } = useTranslation();
  const { language, chatMode, setChatMode, sendOnEnter, setSendOnEnter } = useAppStore();
  const { user } = useAuthStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeRef = useRef<number>(288);
  const { toast } = useToast();

  // ── Core state ──
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const pendingAutoSend = useRef<string | null>(null);
  const skipAnalysisRef = useRef(false);
  const pendingAnalyzeRef = useRef<{ workflowId: string; workflowName: string } | null>(null);
  const [phases, setPhases] = useState<PhaseProgress[]>([]);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<Message | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const streamCompletedRef = useRef(false);

  // PROPOSAL 5: AbortController ref — cancels the in-progress SSE stream
  const abortControllerRef = useRef<AbortController | null>(null);

  // PROPOSAL 6: Auto-Import toggle — persisted in localStorage
  const [autoImport, setAutoImport] = useState<boolean>(() => {
    try { return localStorage.getItem("chat_auto_import") === "true"; } catch { return false; }
  });

  // Persist generation result per conversation in sessionStorage
  const saveGenerationResult = useCallback((convId: number | null, result: GenerationResult | null) => {
    if (!convId) return;
    const key = `gen_result_${convId}`;
    if (result) {
      try { sessionStorage.setItem(key, JSON.stringify(result)); } catch { /* ignore */ }
    } else {
      sessionStorage.removeItem(key);
    }
  }, []);

  const loadGenerationResult = useCallback((convId: number | null): GenerationResult | null => {
    if (!convId) return null;
    try {
      const raw = sessionStorage.getItem(`gen_result_${convId}`);
      return raw ? (JSON.parse(raw) as GenerationResult) : null;
    } catch { return null; }
  }, []);

  // ── Phase 2: Layout state ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("chat_sidebar_width");
    return saved ? parseInt(saved, 10) : 288;
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(288);

  // ── Phase 3: Attachments ──
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Phase 5: Message interactions ──
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const lastUserMsgRef = useRef<string>("");

  // ── Phase 6: Message tools ──
  const [ratings, setRatings] = useState<Record<number, "up" | "down">>(() => {
    try { return JSON.parse(localStorage.getItem("msg_ratings") ?? "{}") as Record<number, "up" | "down">; } catch { return {}; }
  });
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // ── Phase 7: Sidebar management ──
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedConvIds, setPinnedConvIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("pinned_convs") ?? "[]") as number[]; } catch { return []; }
  });
  const [renamingConvId, setRenamingConvId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Phase 8: Context panel ──
  const [contextPanelOpen, setContextPanelOpen] = useState(false);

  // ── Workflow Analysis ──
  const [analyzePickerOpen, setAnalyzePickerOpen] = useState(false);
  const [n8nWorkflows, setN8nWorkflows] = useState<N8nWorkflowBasic[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  // Replaces analyzeContext: holds the workflow waiting for user to describe the problem
  const [pendingAnalysisWorkflow, setPendingAnalysisWorkflow] = useState<{ id: string; name: string } | null>(null);

  // ── Data fetching ──
  const { data: convRes } = useGetConversations(
    undefined,
    { query: { refetchInterval: 10000 } },
  );

  const { data: convDetail, refetch: refetchConv } = useGetConversation(
    selectedConvId?.toString() ?? "0",
    {
      request: { headers: authHeader },
      query: { enabled: !!selectedConvId, queryKey: selectedConvId ? getGetConversationQueryKey(selectedConvId.toString()) : [] },
    } as Parameters<typeof useGetConversation>[1],
  );

  const { mutate: createConv } = useCreateConversation({
    mutation: {
      onSuccess: (data: unknown) => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        const conv = (data as { data?: { id?: number } })?.data;
        if (conv?.id) setSelectedConvId(conv.id);
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useCreateConversation>[0]);

  const { mutate: deleteConv } = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setSelectedConvId(null);
        setGenerationResult(null);
        setPhases([]);
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useDeleteConversation>[0]);

  const conversations: Conversation[] = ((convRes as { data?: { conversations?: unknown[] } } | undefined)?.data?.conversations ?? []) as Conversation[];
  const detail = convDetail as { data?: { conversation?: Conversation; messages?: Message[] } } | undefined;
  const serverMessages: Message[] = detail?.data?.messages ?? [];
  // Don't show the optimistic message if the real one already arrived from the server
  const serverAlreadyHasOptimistic = optimisticUserMsg !== null &&
    serverMessages.some(m => m.role === "user" && m.content === optimisticUserMsg.content);
  const messages: Message[] = (optimisticUserMsg && !serverAlreadyHasOptimistic)
    ? [...serverMessages, optimisticUserMsg]
    : serverMessages;

  // ── Derived state ──
  const filteredConvs = conversations.filter(c =>
    !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConvs = filteredConvs.filter(c => pinnedConvIds.includes(c.id));
  const unpinnedConvs = filteredConvs.filter(c => !pinnedConvIds.includes(c.id));

  const groupedConvs = unpinnedConvs.reduce((acc, conv) => {
    const now = new Date();
    const updatedAt = new Date(conv.updatedAt);
    const diff = (now.getTime() - updatedAt.getTime()) / 86400000;
    const group = diff < 1 ? t("chat.today") : diff < 2 ? t("chat.yesterday") : t("chat.thisWeek");
    if (!acc[group]) acc[group] = [];
    acc[group]!.push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  const charCount = input.length;
  const selectedConv = conversations.find(c => c.id === selectedConvId);

  // ── Effects ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, generationResult, streamingContent]);

  useEffect(() => {
    const replay = sessionStorage.getItem("chatReplay");
    if (replay) {
      sessionStorage.removeItem("chatReplay");
      setInput(replay);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("templateUse");
    if (stored) {
      sessionStorage.removeItem("templateUse");
      try {
        const { convId, message } = JSON.parse(stored) as { convId: number; message: string };
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        pendingAutoSend.current = message;
        setSelectedConvId(convId);
      } catch { /* ignore */ }
    }
  }, [queryClient]);

  // Restore generation result when switching conversations
  useEffect(() => {
    const saved = loadGenerationResult(selectedConvId);
    setGenerationResult(saved);
    if (!saved) setPhases([]);
    setOptimisticUserMsg(null);
  }, [selectedConvId, loadGenerationResult]);

  // Phase 4: Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        createConv({ title: t("chat.newConversation"), type: "query" } as Parameters<typeof createConv>[0]);
      }
      if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, createConv, t]);

  // Phase 2: Resize handle mouse events
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      const delta = isRTL ? dragStartX.current - ev.clientX : ev.clientX - dragStartX.current;
      const newWidth = Math.max(180, Math.min(480, dragStartWidth.current + delta));
      setSidebarWidth(newWidth);
      resizeRef.current = newWidth;
    };

    const onUp = () => {
      setIsDragging(false);
      localStorage.setItem("chat_sidebar_width", String(resizeRef.current));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth, isRTL]);

  // Phase 3: File handling
  const processFile = useCallback((file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED = ["image/", "application/json", "text/plain", "text/yaml", "application/x-yaml", "application/yaml"];
    if (file.size > MAX_SIZE) {
      toast({ title: isRTL ? "الملف أكبر من 5MB" : "File exceeds 5MB limit", variant: "destructive" });
      return;
    }
    if (!ALLOWED.some(t => file.type.startsWith(t) || file.name.endsWith(".yaml") || file.name.endsWith(".yml"))) {
      toast({ title: isRTL ? "نوع الملف غير مدعوم" : "Unsupported file type", variant: "destructive" });
      return;
    }

    const id = Math.random().toString(36).slice(2);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setAttachments(prev => [...prev, { id, type: "image", name: file.name, size: file.size, dataUrl: reader.result as string }]);
      };
    } else {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const type: AttachmentType = file.name.endsWith(".json") ? "json" : (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) ? "yaml" : "text";
        setAttachments(prev => [...prev, { id, type, name: file.name, size: file.size, content: reader.result as string }]);
      };
    }
  }, [isRTL, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(processFile);
    e.target.value = "";
  };

  // ── Workflow Analysis helpers (must be before handleSend) ──
  const openAnalyzePicker = useCallback(async () => {
    setAnalyzePickerOpen(true);
    if (n8nWorkflows.length === 0) {
      setLoadingWorkflows(true);
      try {
        const data = await apiRequest<{ success: boolean; data?: { workflows?: N8nWorkflowBasic[] } }>("/workflows");
        setN8nWorkflows(data.data?.workflows ?? []);
      } catch {
        toast({ title: isRTL ? "تعذر تحميل قائمة الـ Workflows" : "Could not load workflows", variant: "destructive" });
      } finally {
        setLoadingWorkflows(false);
      }
    }
  }, [n8nWorkflows.length, isRTL, toast]);

  // ── Send Handler ──
  const detectAnalysisIntent = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    const arabicPatterns = ["حلل", "تحليل", "افحص", "فحص", "اكتشف", "مشاكل الـ", "مشاكل ال", "ايش المشكلة", "وين المشكلة", "خطأ في", "خطأ بال"];
    const englishPatterns = ["analyze", "analyse", "debug", "diagnose", "find issue", "check issue", "fix workflow", "what's wrong", "what is wrong", "find problem", "identify problem"];
    return arabicPatterns.some(p => text.includes(p)) || englishPatterns.some(p => lower.includes(p));
  }, []);

  const handleSend = useCallback((overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending || !selectedConvId) return;

    // ── Intercept: if a workflow is pending analysis, use user's message as context ──
    if (pendingAnalysisWorkflow) {
      const wf = pendingAnalysisWorkflow;
      setPendingAnalysisWorkflow(null);
      setInput("");
      setAttachments([]);
      // Show user's message optimistically
      setOptimisticUserMsg({
        id: -1,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      });
      executeAnalyze(wf.id, wf.name, text);
      return;
    }

    // Intercept analysis intent → open picker instead (skip for auto-sent template messages)
    const bypassAnalysis = skipAnalysisRef.current;
    skipAnalysisRef.current = false;
    if (!bypassAnalysis && detectAnalysisIntent(text)) {
      setInput("");
      toast({
        title: isRTL ? "🔍 اختر مسار العمل للتحليل" : "🔍 Select a workflow to analyze",
        description: isRTL
          ? "استخدم نافذة الاختيار لتحديد الـ Workflow الذي تريد تحليله"
          : "Use the picker to select the workflow you want to analyze",
      });
      void openAnalyzePicker();
      return;
    }

    // Build content with attachments
    let fullContent = text;
    for (const att of attachments) {
      if (att.type !== "image" && att.content) {
        fullContent += `\n\n[${isRTL ? "ملف مرفق" : "Attached file"}: ${att.name}]\n\`\`\`\n${att.content}\n\`\`\``;
      } else if (att.type === "image") {
        fullContent += `\n\n[${isRTL ? "صورة مرفقة" : "Attached image"}: ${att.name}]`;
      }
    }

    lastUserMsgRef.current = fullContent;
    setInput("");
    setAttachments([]);
    setSending(true);
    setIsGenerating(true);
    setStreamingContent("");
    streamCompletedRef.current = false;
    setGenerationResult(null);
    saveGenerationResult(selectedConvId, null);
    setAnalysisResult(null);
    setPhases([]);

    // ── Optimistic UI: show user message immediately ──
    setOptimisticUserMsg({
      id: -1,
      role: "user",
      content: fullContent,
      createdAt: new Date().toISOString(),
    });

    const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const activeConvId = selectedConvId;

    // PROPOSAL 5: Create a fresh AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(`${API_BASE}/chat/conversations/${activeConvId}/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: fullContent, mode: chatMode }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok || !response.body) throw new Error("Network error");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let lastEventName = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            lastEventName = line.slice(7).trim();
            continue;
          }
          if (line.startsWith("data: ")) {
            const eventLine = line.slice(6);
            try {
              const parsed = JSON.parse(eventLine) as Record<string, unknown>;

              // ── Thinking event (immediate acknowledgment) ─────────────────
              if (lastEventName === "thinking") {
                setIsGenerating(true);

              // ── Stream chunk (streaming text) ─────────────────────────────
              } else if (lastEventName === "stream_chunk") {
                const delta = (parsed as { delta?: string }).delta ?? "";
                if (delta) setStreamingContent(prev => prev + delta);

              // ── Error event ───────────────────────────────────────────────
              } else if (lastEventName === "error") {
                const errMsg = (parsed as { message?: string }).message ?? (isRTL ? "حدث خطأ غير متوقع" : "Unexpected error");
                streamCompletedRef.current = true;
                setStreamingContent("");
                setSending(false);
                setIsGenerating(false);
                setOptimisticUserMsg(null);
                setPhases([]);
                toast({ title: `⚠️ ${errMsg}`, variant: "destructive" });

              // ── Phase progress ────────────────────────────────────────────
              } else if ((parsed as { phase?: number }).phase !== undefined) {
                const phaseData = parsed as unknown as PhaseProgress;
                setIsGenerating(true);
                setPhases(prev => {
                  const idx = prev.findIndex(p => p.phase === phaseData.phase);
                  if (idx >= 0) { const u = [...prev]; u[idx] = phaseData; return u; }
                  return [...prev, phaseData];
                });

              // ── Start event (type announcement) ───────────────────────────
              } else if ((parsed as { type?: string }).type !== undefined) {
                const type = (parsed as { type: string }).type;
                if (type === "sequential") {
                  setPhases([
                    { phase: 1, label: "GPT-4o: Creating workflow", labelAr: "GPT-4o: إنشاء الـ workflow", status: "pending" },
                    { phase: 2, label: "Gemini: Reviewing & scoring", labelAr: "Gemini: مراجعة وتقييم", status: "pending" },
                    { phase: 3, label: "GPT-4o: Refining workflow", labelAr: "GPT-4o: تحسين الـ workflow", status: "pending" },
                    { phase: 4, label: "Gemini: Final validation", labelAr: "Gemini: التحقق النهائي", status: "pending" },
                  ]);
                }
                setIsGenerating(true);

              // ── Complete event ────────────────────────────────────────────
              } else if ((parsed as { message?: unknown }).message !== undefined) {
                streamCompletedRef.current = true;
                setStreamingContent("");
                setIsGenerating(false);
                if ((parsed as { workflowJson?: unknown }).workflowJson) {
                  const r = parsed as { workflowJson: Record<string, unknown>; qualityScore: number; qualityGrade: string; roundsCount: number; totalTimeMs: number; phases: PhaseProgress[] };
                  const result: GenerationResult = {
                    workflowJson: r.workflowJson,
                    qualityScore: r.qualityScore ?? 75,
                    qualityGrade: r.qualityGrade ?? "B",
                    roundsCount: r.roundsCount ?? 1,
                    totalTimeMs: r.totalTimeMs ?? 0,
                    phases: r.phases ?? [],
                  };
                  setGenerationResult(result);
                  saveGenerationResult(activeConvId, result);

                  // PROPOSAL 6: Auto-Import — if enabled, push to n8n immediately after generation
                  if (localStorage.getItem("chat_auto_import") === "true" && r.workflowJson) {
                    const importHeaders: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
                    const t2 = localStorage.getItem("accessToken");
                    if (t2) importHeaders["Authorization"] = `Bearer ${t2}`;
                    fetch(`${API_BASE}/workflows/import`, {
                      method: "POST",
                      headers: importHeaders,
                      body: JSON.stringify({ workflowJson: r.workflowJson }),
                    }).then(async (importRes) => {
                      const importData = await importRes.json() as { success: boolean; error?: { message: string } };
                      if (importData.success) {
                        toast({ title: isRTL ? "⚡ تم الاستيراد التلقائي إلى n8n!" : "⚡ Auto-imported to n8n!" });
                        queryClient.invalidateQueries({ queryKey: ["workflows"] });
                      }
                    }).catch(() => { /* non-fatal — user can still import manually */ });
                  }
                } else {
                  setPhases([]);
                }
                // Refetch first, THEN clear optimistic message to avoid blank flash
                void refetchConv().then(() => {
                  setSending(false);
                  setOptimisticUserMsg(null);
                }).catch(() => {
                  setSending(false);
                  setOptimisticUserMsg(null);
                });
                void queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      // ── Stream ended without complete event → ensure cleanup ──────────
      if (!streamCompletedRef.current) {
        setStreamingContent("");
        setIsGenerating(false);
        setSending(false);
        setOptimisticUserMsg(null);
        void refetchConv();
      }
    }).catch((err: unknown) => {
      setStreamingContent("");
      setSending(false);
      setIsGenerating(false);
      setOptimisticUserMsg(null);
      setPhases([]);
      // PROPOSAL 5: AbortError means the user cancelled — show a calm notice, not an error toast
      if (err instanceof Error && err.name === "AbortError") {
        toast({ title: isRTL ? "⏹ تم إلغاء الطلب" : "⏹ Request cancelled" });
        void refetchConv();
      } else {
        toast({ title: String(err), variant: "destructive" });
      }
    });
  }, [input, sending, selectedConvId, authHeader, chatMode, refetchConv, queryClient, toast, attachments, isRTL, saveGenerationResult, detectAnalysisIntent, openAnalyzePicker, pendingAnalysisWorkflow, executeAnalyze]);

  useEffect(() => {
    if (selectedConvId && pendingAutoSend.current) {
      const message = pendingAutoSend.current;
      pendingAutoSend.current = null;
      skipAnalysisRef.current = true; // template auto-messages bypass analysis detection
      handleSend(message);
    }
  }, [selectedConvId, handleSend]);

  // ── Execute the actual analysis SSE call (called after user describes the problem) ──
  const executeAnalyze = useCallback((workflowId: string, workflowName: string, userContext: string) => {
    const convId = selectedConvId;
    if (!convId || sending) return;

    setSending(true);
    setIsGenerating(true);
    setPhases([
      { phase: 1, label: "GPT-4o: Analyzing workflow", labelAr: "GPT-4o: تحليل المشاكل", status: "pending" },
      { phase: 2, label: "Gemini: Validating analysis", labelAr: "Gemini: التحقق من التحليل", status: "pending" },
      { phase: 3, label: "GPT-4o: Generating fix", labelAr: "GPT-4o: إنشاء الإصلاح", status: "pending" },
    ]);
    setGenerationResult(null);
    setAnalysisResult(null);

    const fetchUrl = `${API_BASE}/chat/conversations/${convId}/analyze-workflow`;
    const freshAuthHeader = getAuthHeader();
    const headers: Record<string, string> = { ...freshAuthHeader, "Content-Type": "application/json" };

    fetch(fetchUrl, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ workflowId, userContext }),
    }).then(async (res) => {
      if (res.status === 401) {
        setSending(false);
        setIsGenerating(false);
        setPhases([]);
        toast({ title: isRTL ? "انتهت جلستك، يرجى تسجيل الدخول مجدداً" : "Session expired, please log in again", variant: "destructive" });
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(errData?.error?.message ?? `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      let buffer = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          const eventLine = lines.find(l => l.startsWith("event:"));
          const dataLine = lines.find(l => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event:", "").trim();
          try {
            const parsed = JSON.parse(dataLine.replace("data:", "").trim()) as Record<string, unknown>;

            if (event === "phase") {
              setPhases(prev => prev.map(p =>
                p.phase === parsed.phase
                  ? { ...p, status: parsed.status as string, durationMs: parsed.durationMs as number | undefined }
                  : p
              ));
            } else if (event === "complete") {
              setSending(false);
              setIsGenerating(false);
              const analysisRes: AnalysisResult = {
                problems: (parsed.problems ?? []) as WorkflowProblem[],
                fixedWorkflowJson: (parsed.fixedWorkflowJson ?? null) as Record<string, unknown> | null,
                workflowId,
                workflowName,
                totalTimeMs: (parsed.totalTimeMs ?? 0) as number,
                phases: (parsed.phases ?? []) as PhaseProgress[],
              };
              setAnalysisResult(analysisRes);
              setAnalyzeContext("");
              refetchConv();
              queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
            } else if (event === "error") {
              setSending(false);
              setIsGenerating(false);
              setPhases([]);
              toast({ title: (parsed.message as string) ?? "Error", variant: "destructive" });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    }).catch((err: unknown) => {
      setSending(false);
      setIsGenerating(false);
      setPhases([]);
      toast({ title: String(err), variant: "destructive" });
    });
  }, [sending, selectedConvId, refetchConv, queryClient, toast]);

  // ── Initiate analysis session: open conv + show greeting, wait for user input ──
  const initiateAnalyzeSession = useCallback((workflowId: string, workflowName: string) => {
    setAnalyzePickerOpen(false);
    if (sending) return;

    if (!selectedConvId) {
      // Create a new conversation first, then set pending after conv is created
      pendingAnalyzeRef.current = { workflowId, workflowName };
      createConv({ title: isRTL ? `تحليل: ${workflowName}` : `Analyze: ${workflowName}`, type: "analyze" } as Parameters<typeof createConv>[0]);
      return;
    }
    // Conversation exists — set pending state so user can describe the problem
    setPendingAnalysisWorkflow({ id: workflowId, name: workflowName });
  }, [sending, selectedConvId, isRTL, createConv]);

  // When a conv is newly created for a pending analysis, activate the session
  useEffect(() => {
    if (selectedConvId && pendingAnalyzeRef.current) {
      const { workflowId, workflowName } = pendingAnalyzeRef.current;
      pendingAnalyzeRef.current = null;
      setPendingAnalysisWorkflow({ id: workflowId, name: workflowName });
    }
  }, [selectedConvId]);

  // Phase 4: Keyboard handler with sendOnEnter setting
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sendOnEnter) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    } else {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  const handleSendToN8n = async () => {
    if (!generationResult?.workflowJson) return;
    const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      const res = await fetch(`${API_BASE}/workflows/import`, { method: "POST", headers, body: JSON.stringify({ workflowJson: generationResult.workflowJson }) });
      const data = await res.json() as { success: boolean; error?: { message: string } };
      if (data.success) {
        toast({ title: isRTL ? "تم إرسال الـ workflow لـ n8n بنجاح! ✅" : "Workflow sent to n8n successfully! ✅" });
        setGenerationResult(null);
        queryClient.invalidateQueries({ queryKey: ["workflows"] });
      } else {
        toast({ title: data.error?.message ?? "Failed", variant: "destructive" });
      }
    } catch (err) { toast({ title: String(err), variant: "destructive" }); }
  };

  // Phase 6: Rating
  const handleRate = (msgId: number, rating: "up" | "down") => {
    const updated = { ...ratings, [msgId]: rating };
    setRatings(updated);
    localStorage.setItem("msg_ratings", JSON.stringify(updated));
  };

  // Phase 6: Regenerate
  const handleRegenerate = () => {
    if (lastUserMsgRef.current && selectedConvId && !sending) {
      handleSend(lastUserMsgRef.current);
    }
  };

  // Phase 7: Pin/Unpin
  const togglePin = (convId: number) => {
    const updated = pinnedConvIds.includes(convId)
      ? pinnedConvIds.filter(id => id !== convId)
      : [convId, ...pinnedConvIds];
    setPinnedConvIds(updated);
    localStorage.setItem("pinned_convs", JSON.stringify(updated));
  };

  // Phase 7: Rename conversation
  const handleRenameSubmit = async (convId: number) => {
    if (!renameValue.trim()) { setRenamingConvId(null); return; }
    const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
      await fetch(`${API_BASE}/chat/conversations/${convId}`, { method: "PUT", headers, body: JSON.stringify({ title: renameValue.trim() }) });
      queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
    } catch { /* ignore */ }
    setRenamingConvId(null);
  };

  const suggestions = [
    t("chat.suggestions.email"),
    t("chat.suggestions.webhook"),
    t("chat.suggestions.report"),
    t("chat.suggestions.question"),
  ];

  const userInitial = user?.username?.[0]?.toUpperCase() ?? "U";
  const lastAssistantIdx = [...messages].reverse().findIndex(m => m.role === "assistant");
  const lastAssistantId = lastAssistantIdx >= 0 ? messages[messages.length - 1 - lastAssistantIdx]?.id : null;
  const userMessages = messages.filter(m => m.role === "user");
  const lastUserMsg = userMessages[userMessages.length - 1];
  if (lastUserMsg) lastUserMsgRef.current = lastUserMsg.content;

  // ── Context panel data ──
  const convType = selectedConv?.type ?? "query";
  const msgCount = selectedConv?.messageCount ?? 0;

  // ── Render sidebar conversation item ──
  const renderConvItem = (conv: Conversation) => {
    const isPinned = pinnedConvIds.includes(conv.id);
    const isRenaming = renamingConvId === conv.id;
    const isCreate = conv.type === "create";
    const isSelected = selectedConvId === conv.id;

    return (
      <div
        key={conv.id}
        className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer mb-0.5 group transition-all relative ${isSelected ? "bg-accent/10 shadow-sm" : "hover:bg-muted"}`}
        onClick={() => {
          if (isRenaming) return;
          setSelectedConvId(conv.id);
          setGenerationResult(null);
          setPhases([]);
        }}
      >
        {sidebarCollapsed ? (
          <div className="relative group/icon mx-auto">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isCreate ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"}`}>
              {isCreate ? <Zap size={11} /> : <MessageSquare size={11} />}
            </div>
            <div className={`absolute ${isRTL ? "right-full me-2" : "left-full ms-2"} top-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity z-50 pointer-events-none`}>
              {conv.title}
            </div>
          </div>
        ) : (
          <>
            {/* Type icon */}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isCreate ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"}`}>
              {isCreate ? <Zap size={10} /> : <MessageSquare size={10} />}
            </div>

            {isRenaming ? (
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(conv.id)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleRenameSubmit(conv.id);
                  if (e.key === "Escape") setRenamingConvId(null);
                }}
                onClick={e => e.stopPropagation()}
                className="flex-1 text-xs bg-background border border-accent/50 rounded px-1.5 py-0.5 focus:outline-none"
              />
            ) : (
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs truncate block font-medium ${isSelected ? "text-accent" : "text-foreground"} transition-colors`}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    setRenamingConvId(conv.id);
                    setRenameValue(conv.title);
                  }}
                >
                  {conv.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {relativeTime(conv.updatedAt, isRTL)}
                  {conv.messageCount > 0 && ` · ${conv.messageCount}`}
                </span>
              </div>
            )}

            <div className={`flex items-center gap-0.5 ${isRenaming ? "hidden" : "opacity-0 group-hover:opacity-100"} transition-opacity shrink-0`}>
              <button
                onClick={e => { e.stopPropagation(); togglePin(conv.id); }}
                className={`p-0.5 rounded hover:bg-accent/10 transition-colors ${isPinned ? "text-accent" : "text-muted-foreground"}`}
                title={isRTL ? "تثبيت" : "Pin"}
              >
                <Pin size={10} className={isPinned ? "fill-current" : ""} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteConv({ id: conv.id.toString() } as Parameters<typeof deleteConv>[0]); }}
                className="p-0.5 rounded hover:text-destructive text-muted-foreground transition-colors"
                title={isRTL ? "حذف" : "Delete"}
              >
                <Trash2 size={10} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Layout ──
  const sidebarStyle = sidebarCollapsed
    ? { width: "48px" }
    : { width: `${sidebarWidth}px` };

  return (
    <div
      className={`flex h-[calc(100vh-8rem)] gap-0 -m-6 overflow-hidden relative ${isDragging ? "select-none" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDragOver(false);
        Array.from(e.dataTransfer.files).forEach(processFile);
      }}
    >
      {/* ── Phase 2: Fullscreen overlay ── */}
      {fullscreen && (
        <button
          className="fixed inset-0 z-40 bg-background/5 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {!fullscreen && (
        <div
          className="bg-card border-e border-border flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
          style={sidebarStyle}
        >
          {/* Sidebar Header */}
          <div className="p-2 border-b border-border flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              {!sidebarCollapsed && (
                <button
                  onClick={() => {
                    createConv({ title: t("chat.newConversation"), type: "query" } as Parameters<typeof createConv>[0]);
                    setGenerationResult(null);
                    setPhases([]);
                  }}
                  className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors"
                >
                  <Plus size={14} />
                  {t("chat.newConversation")}
                </button>
              )}
              {sidebarCollapsed && (
                <button
                  onClick={() => {
                    createConv({ title: t("chat.newConversation"), type: "query" } as Parameters<typeof createConv>[0]);
                    setGenerationResult(null);
                    setPhases([]);
                  }}
                  className="w-full flex items-center justify-center p-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                  title={t("chat.newConversation")}
                >
                  <Plus size={16} />
                </button>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={sidebarCollapsed ? (isRTL ? "فتح الشريط" : "Expand sidebar") : (isRTL ? "طيّ الشريط" : "Collapse sidebar")}
              >
                {sidebarCollapsed
                  ? <PanelLeftOpen size={15} />
                  : <PanelLeftClose size={15} />
                }
              </button>
            </div>

            {/* Phase 7: Search */}
            {!sidebarCollapsed && (
              <div className="relative">
                <Search size={12} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? "بحث..." : "Search..."}
                  className="w-full ps-7 pe-6 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={11} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {!filteredConvs.length && (
              <p className="text-xs text-muted-foreground text-center py-8">
                {searchQuery ? (isRTL ? "لا نتائج" : "No results") : t("chat.noConversations")}
              </p>
            )}

            {/* Pinned Conversations */}
            {pinnedConvs.length > 0 && !sidebarCollapsed && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Pin size={9} className="fill-current" />
                  {isRTL ? "مثبتة" : "Pinned"}
                </p>
                {pinnedConvs.map(renderConvItem)}
                {unpinnedConvs.length > 0 && <div className="h-px bg-border my-1" />}
              </div>
            )}
            {sidebarCollapsed && pinnedConvs.map(renderConvItem)}

            {/* Grouped Conversations */}
            {Object.entries(groupedConvs).map(([group, convs]) => (
              <div key={group}>
                {!sidebarCollapsed && (
                  <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">{group}</p>
                )}
                {convs.map(renderConvItem)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Phase 2: Resize Handle ── */}
      {!fullscreen && !sidebarCollapsed && (
        <div
          className="w-1 hover:w-1.5 bg-transparent hover:bg-accent/30 cursor-col-resize transition-all shrink-0 active:bg-accent/50"
          onMouseDown={handleResizeStart}
        />
      )}

      {/* ── Main Chat Area ── */}
      <div className={`flex-1 flex flex-col bg-background min-w-0 ${fullscreen ? "fixed inset-0 z-50" : ""}`}>

        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {fullscreen && (
              <button onClick={() => setFullscreen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                {isRTL ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
            )}
            <h2 className="text-sm font-medium text-foreground truncate">
              {selectedConvId ? selectedConv?.title : t("chat.title")}
            </h2>
            {selectedConvId && selectedConv && (
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${convType === "create" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                  {convType === "create" ? (isRTL ? "إنشاء" : "Create") : (isRTL ? "استفسار" : "Query")}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode selector */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(["beginner", "expert"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setChatMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${chatMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {mode === "beginner" ? t("chat.beginner") : t("chat.expert")}
                </button>
              ))}
            </div>

            {/* Phase 8: Context panel toggle */}
            {selectedConvId && (
              <button
                onClick={() => setContextPanelOpen(!contextPanelOpen)}
                className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${contextPanelOpen ? "text-accent bg-accent/10" : "text-muted-foreground"}`}
                title={isRTL ? "لوحة السياق" : "Context panel"}
              >
                {contextPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
              </button>
            )}

            {/* Phase 2: Fullscreen toggle */}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              title={fullscreen ? (isRTL ? "تصغير" : "Exit fullscreen") : (isRTL ? "تكبير" : "Fullscreen")}
            >
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Messages area */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-1 transition-all ${isDragOver ? "bg-accent/5 ring-2 ring-dashed ring-accent/40" : ""}`}
          >
            {isDragOver && (
              <div className="fixed inset-0 z-30 flex items-center justify-center bg-accent/5 pointer-events-none">
                <div className="bg-card border-2 border-dashed border-accent rounded-2xl px-8 py-6 text-center">
                  <Paperclip size={32} className="text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{isRTL ? "أفلت الملف هنا" : "Drop file here"}</p>
                </div>
              </div>
            )}

            {!selectedConvId ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
                {/* Animated logo */}
                <div className="relative">
                  <motion.div
                    animate={{ boxShadow: ["0 0 0 0px rgba(139,92,246,0.3)", "0 0 0 12px rgba(139,92,246,0)", "0 0 0 0px rgba(139,92,246,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-violet-500/30"
                  >
                    <Bot size={30} className="text-white" />
                  </motion.div>
                  <div className="absolute -bottom-1.5 -end-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-sm">
                    <Zap size={11} className="text-white" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    {isRTL ? "مرحباً! أنا وكيل n8n AI" : "Hi! I'm your n8n AI Agent"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "أبني لك workflows احترافية بالذكاء الاصطناعي" : "I build professional workflows with AI"}
                  </p>
                </div>
                {/* Quick action cards */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  {[
                    { icon: <Send size={13} />, bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", label: isRTL ? "إرسال إيميل تلقائي" : "Auto send emails", desc: isRTL ? "Gmail + شروط مخصصة" : "Gmail + conditions", type: "create" as const },
                    { icon: <Zap size={13} />, bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400", label: isRTL ? "Webhook → Slack" : "Webhook → Slack", desc: isRTL ? "استقبل وأرسل تنبيه" : "Receive & notify", type: "create" as const },
                    { icon: <FileText size={13} />, bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: isRTL ? "تقرير أسبوعي" : "Weekly report", desc: isRTL ? "جدولة + Sheets" : "Schedule + Sheets", type: "create" as const },
                    { icon: <Bot size={13} />, bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400", label: isRTL ? "وكيل AI مخصص" : "Custom AI agent", desc: isRTL ? "GPT + APIs خارجية" : "GPT + external APIs", type: "create" as const },
                  ].map((action, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      onClick={() => createConv({ title: action.label, type: action.type } as Parameters<typeof createConv>[0])}
                      className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 hover:shadow-md transition-all text-start group"
                    >
                      <div className={`w-7 h-7 rounded-lg ${action.bg} flex items-center justify-center`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">{action.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : !messages.length && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-500/20 flex items-center justify-center">
                  <MessageSquare size={18} className="text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "اكتب رسالتك لبدء المحادثة" : "Type a message to start the conversation"}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const showDaySeparator = i === 0 || !isSameDay(messages[i - 1]!.createdAt, msg.createdAt);
                  const isLastAssistant = msg.id === lastAssistantId && !isGenerating && !sending;

                  return (
                    <div key={msg.id}>
                      {/* Phase 5: Day Separator */}
                      {showDaySeparator && <DaySeparator date={msg.createdAt} isRTL={isRTL} />}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        className={`flex items-end gap-2 mb-2 ${isUser ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
                        onMouseEnter={() => setHoveredMsgId(msg.id)}
                        onMouseLeave={() => setHoveredMsgId(null)}
                      >
                        {/* Assistant Avatar */}
                        {!isUser && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                            <Bot size={16} className="text-white" />
                          </div>
                        )}

                        {/* Phase 6: Edit mode for user messages */}
                        {isUser && editingMsgId === msg.id ? (
                          <div className="max-w-[75%] w-full">
                            <textarea
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              autoFocus
                              className="w-full px-4 py-3 rounded-xl border border-accent/50 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2 mt-1.5 justify-end">
                              <button
                                onClick={() => setEditingMsgId(null)}
                                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
                              >
                                {isRTL ? "إلغاء" : "Cancel"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMsgId(null);
                                  if (editContent.trim()) handleSend(editContent.trim());
                                }}
                                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors"
                              >
                                {isRTL ? "إرسال" : "Send"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[75%] relative group/msg ${isUser
                              ? "bg-gradient-to-br from-violet-600 to-indigo-500 text-white rounded-2xl rounded-te-sm shadow-md shadow-violet-500/20"
                              : "bg-card border border-border text-foreground rounded-2xl rounded-ts-sm shadow-sm"
                            } px-4 py-3 text-sm`}
                          >
                            {/* Phase 5: Model badge */}
                            {!isUser && msg.modelUsed && (
                              <div className="mb-1.5">
                                <ModelBadge model={msg.modelUsed} />
                              </div>
                            )}

                            {/* Message content */}
                            {!isUser
                              ? <div className="select-text cursor-text"><MessageContent content={msg.content} isRTL={isRTL} isLatest={msg.id === lastAssistantId} /></div>
                              : <p className="whitespace-pre-wrap leading-relaxed select-text cursor-text">{msg.content}</p>
                            }

                            {/* Phase 5: Timestamp on hover */}
                            <div className={`absolute ${isUser ? (isRTL ? "start-full ms-2" : "end-full me-2") : (isRTL ? "end-full me-2" : "start-full ms-2")} bottom-0 opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none`}>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-popover border border-border rounded px-1.5 py-0.5 shadow-sm">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            {/* Phase 6: Message tools */}
                            <AnimatePresence>
                              {hoveredMsgId === msg.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className={`absolute top-full mt-1 ${isUser ? (isRTL ? "start-0" : "end-0") : (isRTL ? "end-0" : "start-0")} flex items-center gap-1 bg-card border border-border rounded-lg px-1.5 py-1 shadow-sm z-10`}
                                >
                                  {/* Copy to input button — for all messages */}
                                  <button
                                    onClick={() => {
                                      const textToCopy = msg.content.replace(/```json[\s\S]*?```/g, "").trim();
                                      setInput(textToCopy || msg.content);
                                      const textarea = document.querySelector("textarea");
                                      textarea?.focus();
                                    }}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    title={isRTL ? "نقل إلى خانة الكتابة" : "Copy to input"}
                                  >
                                    <CornerDownLeft size={12} />
                                  </button>

                                  {!isUser && (
                                    <>
                                      <button
                                        onClick={() => handleRate(msg.id, "up")}
                                        className={`p-1 rounded hover:bg-muted transition-colors ${ratings[msg.id] === "up" ? "text-emerald-500" : "text-muted-foreground"}`}
                                        title={isRTL ? "إعجاب" : "Like"}
                                      >
                                        <ThumbsUp size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleRate(msg.id, "down")}
                                        className={`p-1 rounded hover:bg-muted transition-colors ${ratings[msg.id] === "down" ? "text-destructive" : "text-muted-foreground"}`}
                                        title={isRTL ? "عدم إعجاب" : "Dislike"}
                                      >
                                        <ThumbsDown size={12} />
                                      </button>
                                      {isLastAssistant && (
                                        <button
                                          onClick={handleRegenerate}
                                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                          title={isRTL ? "إعادة توليد" : "Regenerate"}
                                          disabled={sending}
                                        >
                                          <RotateCcw size={12} />
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {isUser && (
                                    <button
                                      onClick={() => { setEditingMsgId(msg.id); setEditContent(msg.content); }}
                                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                      title={isRTL ? "تحرير" : "Edit"}
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* User Avatar */}
                        {isUser && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center shrink-0 shadow-md shadow-accent/20 text-xs font-bold text-white">
                            {userInitial}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}

                {/* ── Streaming message bubble ── */}
                <AnimatePresence>
                  {streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-end gap-2.5 mb-2 ${isRTL ? "justify-end" : "justify-start"}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-ts-sm px-4 py-3 max-w-[75%] shadow-sm">
                        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed select-text">
                          <MarkdownRenderer content={streamingContent} />
                        </div>
                        <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5 align-text-bottom" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Phase 5: Improved typing indicator */}
                <AnimatePresence>
                  {isGenerating && !streamingContent && phases.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${isRTL ? "justify-end" : "justify-start"}`}
                    >
                      <PhaseProgressBar phases={phases} isRTL={isRTL} />
                    </motion.div>
                  )}
                  {isGenerating && !streamingContent && phases.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex ${isRTL ? "justify-end" : "justify-start"}`}
                    >
                      <TypingIndicator isRTL={isRTL} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quality Report */}
                <AnimatePresence>
                  {generationResult && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isRTL ? "justify-end" : "justify-start"}`}
                    >
                      <QualityReport result={generationResult} isRTL={isRTL} onSendToN8n={handleSendToN8n} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analysis Report */}
                <AnimatePresence>
                  {analysisResult && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full max-w-2xl mx-auto px-2"
                    >
                      <AnalysisReport result={analysisResult} isRTL={isRTL} authHeader={authHeader} toast={toast} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Phase 8: Context Panel */}
          <AnimatePresence>
            {contextPanelOpen && selectedConvId && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-s border-border bg-card overflow-hidden shrink-0"
              >
                <div className="w-64 h-full flex flex-col p-3 gap-3 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground">{isRTL ? "سياق المحادثة" : "Conversation Context"}</h3>
                    <button onClick={() => setContextPanelOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <X size={12} />
                    </button>
                  </div>

                  {/* Conversation info */}
                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded-lg p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{isRTL ? "المعرّف" : "ID"}</p>
                          <p className="text-xs font-medium text-foreground">#{selectedConvId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers size={12} className="text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{isRTL ? "النوع" : "Type"}</p>
                          <p className="text-xs font-medium text-foreground">
                            {convType === "create" ? (isRTL ? "إنشاء Workflow" : "Workflow Creation") : (isRTL ? "استفسار" : "Query")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare size={12} className="text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{isRTL ? "الرسائل" : "Messages"}</p>
                          <p className="text-xs font-medium text-foreground">{msgCount} {isRTL ? "رسالة" : "messages"}</p>
                        </div>
                      </div>
                      {selectedConv && (
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">{isRTL ? "آخر تحديث" : "Last updated"}</p>
                            <p className="text-xs font-medium text-foreground">{relativeTime(selectedConv.updatedAt, isRTL)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Models used */}
                    {messages.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">{isRTL ? "النماذج المستخدمة" : "Models Used"}</p>
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(messages.filter(m => m.modelUsed).map(m => m.modelUsed!))].map(model => (
                            <ModelBadge key={model} model={model} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ratings summary */}
                    {Object.keys(ratings).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">{isRTL ? "تقييماتك" : "Your ratings"}</p>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <ThumbsUp size={12} />
                            <span className="text-xs">{Object.values(ratings).filter(r => r === "up").length}</span>
                          </div>
                          <div className="flex items-center gap-1 text-destructive">
                            <ThumbsDown size={12} />
                            <span className="text-xs">{Object.values(ratings).filter(r => r === "down").length}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Input Area ── */}
        <div className="px-4 py-3 border-t border-border bg-card shrink-0">

          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {attachments.map(att => (
                <AttachmentBadge
                  key={att.id}
                  att={att}
                  onRemove={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                />
              ))}
            </div>
          )}

          {/* ── Pending Analysis Banner ── */}
          <AnimatePresence>
            {pendingAnalysisWorkflow && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mb-2.5 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-violet-500/20 shrink-0">
                  <ScanSearch className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-0.5">
                    {isRTL
                      ? `جاهز لتحليل: "${pendingAnalysisWorkflow.name}"`
                      : `Ready to analyze: "${pendingAnalysisWorkflow.name}"`}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isRTL
                      ? "✍️ اكتب وصف المشكلة أو ما تريد فحصه، ثم أرسل لبدء التحليل."
                      : "✍️ Describe the issue or what you want checked, then send to start analysis."}
                  </p>
                </div>
                <button
                  onClick={() => setPendingAnalysisWorkflow(null)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
                  title={isRTL ? "إلغاء" : "Cancel"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Super-input container ── */}
          <div className="border border-border rounded-2xl bg-background shadow-sm focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent/40 transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={pendingAnalysisWorkflow
                ? (isRTL ? `صف المشكلة في "${pendingAnalysisWorkflow.name}"...` : `Describe the issue with "${pendingAnalysisWorkflow.name}"...`)
                : selectedConvId
                  ? (isRTL ? t("chat.placeholder") : "Ask about n8n or describe a workflow to build...")
                  : (isRTL ? "← اختر محادثة أو أنشئ واحدة جديدة" : "Select or create a conversation →")}
              rows={1}
              className="w-full resize-none px-4 pt-3.5 pb-2 bg-transparent text-foreground text-sm focus:outline-none max-h-36 placeholder:text-muted-foreground/50"
            />

            <div className={`flex items-center justify-between px-3 pb-3 pt-0 gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              {/* Left tools */}
              <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={isRTL ? "إرفاق ملف" : "Attach file"}
                >
                  <Paperclip size={15} />
                </button>
                <button
                  onClick={openAnalyzePicker}
                  disabled={sending}
                  className="p-1.5 rounded-lg text-violet-500 hover:text-violet-600 hover:bg-violet-500/10 transition-colors disabled:opacity-40"
                  title={isRTL ? "كشف أخطاء وإصلاح مسار عمل موجود" : "Debug & fix an existing workflow"}
                >
                  <ScanSearch size={15} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,application/json,text/plain,text/yaml,application/x-yaml,.yaml,.yml"
                  multiple
                  onChange={handleFileSelect}
                />
                <div className="w-px h-4 bg-border mx-0.5" />
                <button
                  onClick={() => setSendOnEnter(!sendOnEnter)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors ${sendOnEnter ? "border-accent/40 text-accent bg-accent/5" : "border-border text-muted-foreground hover:border-accent/30"}`}
                  title={isRTL ? "تغيير طريقة الإرسال" : "Toggle send mode"}
                >
                  {sendOnEnter ? (isRTL ? "Enter ↑" : "↑ Enter") : "Ctrl+↵"}
                </button>
                {/* PROPOSAL 6: Auto-Import toggle */}
                <button
                  onClick={() => {
                    const next = !autoImport;
                    setAutoImport(next);
                    try { localStorage.setItem("chat_auto_import", String(next)); } catch { /* ignore */ }
                    toast({ title: next ? (isRTL ? "⚡ الاستيراد التلقائي مُفعَّل" : "⚡ Auto-import enabled") : (isRTL ? "الاستيراد التلقائي مُعطَّل" : "Auto-import disabled") });
                  }}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${autoImport ? "border-emerald-400/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" : "border-border text-muted-foreground hover:border-emerald-400/30"}`}
                  title={isRTL ? "تفعيل/تعطيل الاستيراد التلقائي إلى n8n" : "Toggle auto-import to n8n after generation"}
                >
                  <Zap size={10} />
                  {isRTL ? "استيراد تلقائي" : "Auto-import"}
                </button>
              </div>

              {/* Right: char counter + stop/send button */}
              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {charCount > 500 && !sending && (
                  <span className={`text-[10px] font-medium tabular-nums ${charCount >= 1900 ? "text-destructive" : charCount >= 1500 ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {charCount}/2000
                  </span>
                )}
                {/* PROPOSAL 5: Stop button — visible while generating, triggers AbortController */}
                {sending && (
                  <button
                    onClick={() => {
                      abortControllerRef.current?.abort();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/50 text-destructive text-xs font-medium hover:bg-destructive/10 transition-all"
                    title={isRTL ? "إلغاء الطلب الجاري" : "Cancel current request"}
                  >
                    <XCircle size={13} />
                    <span>{isRTL ? "إلغاء" : "Stop"}</span>
                  </button>
                )}
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && attachments.length === 0) || sending || !selectedConvId}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xs font-medium hover:opacity-90 transition-all disabled:opacity-40 shadow-sm shadow-violet-500/20"
                >
                  {sending
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Send size={13} />
                  }
                  {!sending && <span>{isRTL ? "إرسال" : "Send"}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Picker Modal */}
      <AnimatePresence>
        {analyzePickerOpen && (
          <WorkflowPickerModal
            open={analyzePickerOpen}
            onClose={() => setAnalyzePickerOpen(false)}
            workflows={n8nWorkflows}
            loading={loadingWorkflows}
            onSelect={initiateAnalyzeSession}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
