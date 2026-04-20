import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search, Star, Eye, ArrowRight, Zap, X, Plus,
  Download, Globe, BookMarked, ChevronLeft, ChevronRight,
  Loader2, User, BarChart2, Languages, Mail, Webhook,
  Clock, Code2, Database, Globe2, Send, GitBranch, Filter, Trash2,
  Upload, FileJson, CheckCircle2, Sparkles, Settings2, AlertTriangle,
  ExternalLink, Copy, ChevronDown, Info,
} from "lucide-react";
import { useGetTemplates, getGetTemplatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, API_BASE } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: Record<string, unknown>;
}

interface WorkflowJson {
  name?: string;
  nodes?: WorkflowNode[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

interface LocalTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  nodesCount: number;
  usageCount: number;
  avgRating: number;
  ratingCount: number;
  isSystem?: boolean;
  workflowJson?: WorkflowJson;
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

interface TranslatedContent {
  name: string;
  description: string;
}

const LOCAL_CATEGORIES = ["all", "email", "reports", "api", "scheduling", "alerts", "database"];
const N8N_CATEGORIES = ["all", "Marketing", "Sales", "Engineering", "IT Ops", "HR", "Finance", "Design", "Other"];

function getNodeStyle(type: string): { color: string; bg: string; Icon: React.ElementType } {
  const t = type.toLowerCase();
  if (t.includes("schedule") || t.includes("cron")) return { color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30", Icon: Clock };
  if (t.includes("webhook")) return { color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30", Icon: Webhook };
  if (t.includes("email") || t.includes("gmail")) return { color: "text-orange-600", bg: "bg-orange-500/10 border-orange-500/30", Icon: Mail };
  if (t.includes("send") || t.includes("telegram") || t.includes("slack")) return { color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/30", Icon: Send };
  if (t.includes("http") || t.includes("request")) return { color: "text-cyan-600", bg: "bg-cyan-500/10 border-cyan-500/30", Icon: Globe2 };
  if (t.includes("code") || t.includes("function") || t.includes("javascript")) return { color: "text-yellow-600", bg: "bg-yellow-500/10 border-yellow-500/30", Icon: Code2 };
  if (t.includes("database") || t.includes("postgres") || t.includes("mysql") || t.includes("mongo")) return { color: "text-rose-600", bg: "bg-rose-500/10 border-rose-500/30", Icon: Database };
  if (t.includes("if") || t.includes("switch") || t.includes("filter")) return { color: "text-violet-600", bg: "bg-violet-500/10 border-violet-500/30", Icon: Filter };
  if (t.includes("merge") || t.includes("split") || t.includes("aggregate")) return { color: "text-teal-600", bg: "bg-teal-500/10 border-teal-500/30", Icon: GitBranch };
  return { color: "text-accent", bg: "bg-accent/10 border-accent/30", Icon: Zap };
}

function NodeGraphPreview({ workflowJson, isRTL }: { workflowJson?: WorkflowJson; isRTL: boolean }) {
  const nodes = workflowJson?.nodes ?? [];

  if (nodes.length === 0) {
    return (
      <div className="h-36 bg-muted/50 rounded-xl border border-border flex items-center justify-center">
        <div className="text-center">
          <Zap size={22} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">{isRTL ? "لا توجد عقد في هذا القالب" : "No nodes in this template"}</p>
        </div>
      </div>
    );
  }

  const hasPositions = nodes.every(n => n.position && n.position.length === 2);

  if (hasPositions && nodes.length > 1) {
    const xs = nodes.map(n => n.position![0]);
    const ys = nodes.map(n => n.position![1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const W = 340, H = 120;

    return (
      <div className="relative bg-muted/40 rounded-xl border border-border overflow-hidden" style={{ height: 144 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {nodes.map((node, i) => {
            if (i === 0) return null;
            const prev = nodes[i - 1];
            const x1 = 12 + ((prev.position![0] - minX) / rangeX) * W;
            const y1 = 12 + ((prev.position![1] - minY) / rangeY) * H;
            const x2 = 12 + ((node.position![0] - minX) / rangeX) * W;
            const y2 = 12 + ((node.position![1] - minY) / rangeY) * H;
            return (
              <line key={`line-${i}`} x1={x1 + 28} y1={y1 + 14} x2={x2} y2={y2 + 14}
                stroke="currentColor" strokeOpacity={0.2} strokeWidth={1.5} strokeDasharray="4 3" className="text-foreground" />
            );
          })}
        </svg>
        {nodes.map((node) => {
          const { color, bg, Icon } = getNodeStyle(node.type);
          const x = 12 + ((node.position![0] - minX) / rangeX) * W;
          const y = 12 + ((node.position![1] - minY) / rangeY) * H;
          return (
            <div key={node.id} className="absolute" style={{ left: x, top: y, zIndex: 1 }}>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium whitespace-nowrap shadow-sm ${bg} ${color}`}
                style={{ maxWidth: 120 }}>
                <Icon size={10} className="shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-muted/40 rounded-xl border border-border p-3 overflow-x-auto">
      <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
        {nodes.map((node, i) => {
          const { color, bg, Icon } = getNodeStyle(node.type);
          return (
            <div key={node.id ?? i} className="flex items-center gap-1.5 shrink-0">
              <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-medium shadow-sm ${bg} ${color}`}>
                <Icon size={11} className="shrink-0" />
                <span className="whitespace-nowrap max-w-[90px] truncate">{node.name}</span>
              </div>
              {i < nodes.length - 1 && (
                <ArrowRight size={11} className="text-muted-foreground/50 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isArabicText(text: string): boolean {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicChars / text.length > 0.2;
}

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return text;
  const arabic = isArabicText(text);
  const langpair = arabic ? "ar|en" : "en|ar";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${langpair}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("Translation request failed");
  const data = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number };
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  throw new Error("Translation failed");
}

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

const TIMEZONES = [
  "UTC", "Asia/Riyadh", "Asia/Dubai", "Asia/Kuwait", "Asia/Baghdad",
  "Asia/Cairo", "Africa/Casablanca", "Europe/London", "Europe/Paris",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
];

interface ExportModalProps {
  template: LocalTemplate;
  isRTL: boolean;
  onClose: () => void;
  onExported: (workflowName: string) => void;
}

function ExportModal({ template, isRTL, onClose, onExported }: ExportModalProps) {
  const { toast } = useToast();
  const authHeader = getAuthHeader();

  type Phase = "prepare" | "configure" | "library" | "exporting" | "done";
  const [phase, setPhase] = useState<Phase>("prepare");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [preparedJson, setPreparedJson] = useState<WorkflowJson>(template.workflowJson ?? { nodes: [], connections: {} });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [changes, setChanges] = useState<string[]>([]);
  const [exportName, setExportName] = useState(template.name);
  const [timezone, setTimezone] = useState("UTC");
  const [executionOrder, setExecutionOrder] = useState("v1");
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [libLoading, setLibLoading] = useState(false);
  const [libError, setLibError] = useState<string | null>(null);
  const [libContent, setLibContent] = useState<{
    title: string;
    description: string;
    categories: string[];
    prerequisites: string[];
    tags: string[];
    usageInstructions: string[];
    submissionUrl: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [libTestLoading, setLibTestLoading] = useState(false);
  const [libTestDone, setLibTestDone] = useState(false);
  const [showLibChecklist, setShowLibChecklist] = useState(false);

  const hasNodes = Array.isArray(preparedJson?.nodes) && (preparedJson?.nodes?.length ?? 0) > 0;

  const handlePrepareWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/templates/${template.id}/prepare-export`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
      });
      const data = await res.json() as {
        success: boolean;
        data?: { workflowName: string; workflowJson: WorkflowJson; warnings: string[]; changes: string[] };
        error?: { code?: string; message?: string };
      };
      if (data.success && data.data) {
        setPreparedJson(data.data.workflowJson);
        setExportName(data.data.workflowName);
        setWarnings(data.data.warnings ?? []);
        setChanges(data.data.changes ?? []);
        setPhase("configure");
      } else {
        const code = data.error?.code;
        const msg = code === "AI_NOT_CONFIGURED"
          ? (isRTL ? "مفتاح OpenAI غير مُهيَّأ في الإعدادات" : "OpenAI key not configured in settings")
          : (data.error?.message ?? (isRTL ? "فشل التحضير بالذكاء الاصطناعي" : "AI preparation failed"));
        setAiError(msg);
      }
    } catch {
      setAiError(isRTL ? "خطأ في الاتصال بالخادم" : "Server connection error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSkipAI = () => {
    setPreparedJson(template.workflowJson ?? { nodes: [], connections: {} });
    setWarnings([]);
    setChanges([]);
    setPhase("configure");
  };

  const handleDownloadJson = () => {
    const finalJson = {
      ...preparedJson,
      name: exportName,
      settings: { executionOrder, timezone },
    };
    const blob = new Blob([JSON.stringify(finalJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: isRTL ? `✅ تم تحميل "${exportName}.json"` : `✅ Downloaded "${exportName}.json"` });
  };

  const handleCopyJson = () => {
    const finalJson = { ...preparedJson, name: exportName, settings: { executionOrder, timezone } };
    navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2)).then(() => {
      toast({ title: isRTL ? "تم نسخ JSON إلى الحافظة ✅" : "JSON copied to clipboard ✅" });
    });
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({ title: isRTL ? "فشل النسخ" : "Copy failed", variant: "destructive" });
    }
  };

  const handlePrepareLibrary = async () => {
    setLibLoading(true);
    setLibError(null);
    try {
      const res = await fetch(`${API_BASE}/templates/${template.id}/prepare-library`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
      });
      const data = await res.json() as {
        success: boolean;
        data?: typeof libContent;
        error?: { code?: string; message?: string };
      };
      if (data.success && data.data) {
        setLibContent(data.data);
        setPhase("library");
      } else {
        const code = data.error?.code;
        const msg = code === "AI_NOT_CONFIGURED"
          ? (isRTL ? "مفتاح OpenAI غير مُهيَّأ في الإعدادات" : "OpenAI key not configured in settings")
          : (data.error?.message ?? (isRTL ? "فشل التحضير" : "Preparation failed"));
        setLibError(msg);
      }
    } catch {
      setLibError(isRTL ? "خطأ في الاتصال بالخادم" : "Server connection error");
    } finally {
      setLibLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!libContent) return;
    setZipLoading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const finalJson = { ...preparedJson, name: exportName || libContent.title, settings: { executionOrder, timezone } };
      zip.file("workflow.json", JSON.stringify(finalJson, null, 2));

      const descriptionMd = `# ${libContent.title}

## Description
${libContent.description}

## Categories
${libContent.categories.map(c => `- ${c}`).join("\n")}

## Tags
${libContent.tags.map(t => `\`${t}\``).join(", ")}
`;
      zip.file("description.md", descriptionMd);

      const readme = `# ${libContent.title}

${libContent.description}

## Prerequisites

${libContent.prerequisites.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## How to Use

${libContent.usageInstructions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Submitting to n8n Library

1. Go to ${libContent.submissionUrl}
2. Log in to your n8n.io account
3. Upload \`workflow.json\` from this package
4. Copy the title and description from \`description.md\`
5. Select categories: ${libContent.categories.join(", ")}
6. Add tags: ${libContent.tags.join(", ")}
7. Submit for review
`;
      zip.file("README.md", readme);

      const metadata = {
        title: libContent.title,
        description: libContent.description,
        categories: libContent.categories,
        tags: libContent.tags,
        prerequisites: libContent.prerequisites,
        usageInstructions: libContent.usageInstructions,
        submissionUrl: libContent.submissionUrl,
        nodesCount: (preparedJson?.nodes ?? []).length,
        exportedAt: new Date().toISOString(),
      };
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(libContent.title || exportName).replace(/\s+/g, "_")}_n8n_submission.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: isRTL ? "✅ تم تحميل حزمة الإرسال الكاملة" : "✅ Complete submission package downloaded" });
    } catch (err) {
      toast({ title: isRTL ? "فشل تحميل الحزمة" : "Package download failed", variant: "destructive" });
      console.error(err);
    } finally {
      setZipLoading(false);
    }
  };

  const handleExportToN8n = async () => {
    setExportLoading(true);
    setPhase("exporting");
    try {
      const res = await fetch(`${API_BASE}/templates/${template.id}/deploy`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowJson: preparedJson,
          name: exportName,
          timezone,
          executionOrder,
        }),
      });
      const data = await res.json() as {
        success: boolean;
        data?: { workflowId?: string; workflowName?: string };
        error?: { code?: string; message?: string };
      };
      if (data.success) {
        setPhase("done");
        onExported(data.data?.workflowName ?? exportName);
      } else {
        const code = data.error?.code;
        const msg = code === "N8N_NOT_CONFIGURED"
          ? (isRTL ? "n8n غير مُهيَّأ - تحقق من الإعدادات" : "n8n not configured - check settings")
          : (data.error?.message ?? (isRTL ? "فشل التصدير" : "Export failed"));
        toast({ title: msg, variant: "destructive" });
        setPhase("configure");
      }
    } catch {
      toast({ title: isRTL ? "فشل التصدير" : "Export failed", variant: "destructive" });
      setPhase("configure");
    } finally {
      setExportLoading(false);
    }
  };

  const handleLibTestInN8n = async () => {
    if (!libContent) return;
    setLibTestLoading(true);
    setLibTestDone(false);
    try {
      const res = await fetch(`${API_BASE}/templates/${template.id}/deploy`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowJson: preparedJson,
          name: `[TEST] ${libContent.title}`,
          timezone,
          executionOrder,
        }),
      });
      const data = await res.json() as {
        success: boolean;
        data?: { workflowId?: string; workflowName?: string };
        error?: { code?: string; message?: string };
      };
      if (data.success) {
        setLibTestDone(true);
        toast({ title: isRTL ? "تم اختبار الـ workflow في n8n" : "Workflow sent to n8n for testing" });
      } else {
        const code = data.error?.code;
        const msg = code === "N8N_NOT_CONFIGURED"
          ? (isRTL ? "n8n غير مُهيَّأ - تحقق من الإعدادات" : "n8n not configured - check settings")
          : (data.error?.message ?? (isRTL ? "فشل الإرسال" : "Send failed"));
        toast({ title: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: isRTL ? "فشل الاتصال" : "Connection failed", variant: "destructive" });
    } finally {
      setLibTestLoading(false);
    }
  };

  const nodes = preparedJson?.nodes ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-border shadow-2xl"
      >
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <ExternalLink size={15} className="text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {isRTL ? "تصدير احترافي إلى n8n" : "Professional Export to n8n"}
                </h2>
                <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">{template.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X size={15} className="text-muted-foreground" />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 mb-5">
            {[
              { key: "prepare", label: isRTL ? "التحضير" : "Prepare" },
              { key: "configure", label: isRTL ? "الإعدادات" : "Configure" },
              { key: "library", label: isRTL ? "المكتبة" : "Library" },
              { key: "done", label: isRTL ? "تم" : "Done" },
            ].map((step, i, arr) => {
              const stepOrder = ["prepare", "configure", "library", "exporting", "done"];
              const currentIdx = stepOrder.indexOf(phase);
              const stepIdx = stepOrder.indexOf(step.key);
              const isActive = phase === step.key || (step.key === "done" && phase === "exporting");
              const isDone = currentIdx > stepIdx;
              return (
                <div key={step.key} className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${isDone ? "bg-green-500 text-white" : isActive ? "bg-accent text-white" : "bg-muted text-muted-foreground"}`}>
                      {isDone ? <CheckCircle2 size={10} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-medium truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className={`h-px flex-1 shrink transition-colors ${isDone ? "bg-green-500/50" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>

          {/* PHASE: PREPARE */}
          {phase === "prepare" && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                    <FileJson size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {nodes.length > 0
                        ? `${nodes.length} ${isRTL ? "عقدة في الـ workflow" : "nodes in workflow"}`
                        : (isRTL ? "لا توجد عقد" : "No nodes")}
                    </p>
                    {nodes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(nodes as WorkflowNode[]).slice(0, 5).map((n, i) => {
                          const { color, bg } = getNodeStyle(n.type ?? "");
                          return (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${bg} ${color}`}>
                              {n.name ?? n.type}
                            </span>
                          );
                        })}
                        {nodes.length > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                            +{nodes.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-violet-500/5 rounded-xl p-4 border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {isRTL ? "التحضير الذكي بالذكاء الاصطناعي" : "AI-Powered Preparation"}
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• {isRTL ? "إعادة تسمية العقد بأسماء واضحة" : "Rename nodes with descriptive names"}</li>
                      <li>• {isRTL ? "ترتيب مواضع العقد بشكل منظم" : "Organize node positions neatly"}</li>
                      <li>• {isRTL ? "اقتراح اسم احترافي للـ workflow" : "Suggest a professional workflow name"}</li>
                      <li>• {isRTL ? "كشف Credentials المفقودة" : "Detect missing credentials"}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {aiError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">{aiError}</p>
                </div>
              )}

              <div className="flex gap-2.5">
                <button onClick={handleSkipAI} disabled={!hasNodes}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40">
                  {isRTL ? "تخطي، أكمل يدوياً" : "Skip, continue manually"}
                </button>
                <button onClick={handlePrepareWithAI} disabled={aiLoading || !hasNodes}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {aiLoading ? (isRTL ? "جاري التحليل..." : "Analyzing...") : (isRTL ? "تحضير بالذكاء الاصطناعي" : "Prepare with AI")}
                </button>
              </div>

              {!hasNodes && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Info size={13} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {isRTL ? "هذا القالب لا يحتوي على عقد. لا يمكن تصديره إلى n8n." : "This template has no nodes. It cannot be exported to n8n."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PHASE: CONFIGURE */}
          {phase === "configure" && (
            <div className="space-y-4">
              {/* Changes from AI */}
              {changes.length > 0 && (
                <div className="bg-green-500/5 rounded-xl p-3.5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {isRTL ? `تم إجراء ${changes.length} تحسينات بالذكاء الاصطناعي` : `${changes.length} AI improvements applied`}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {changes.map((c, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-500 shrink-0">✓</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="bg-amber-500/5 rounded-xl p-3.5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      {isRTL ? "تحذيرات تحتاج انتباهك" : "Warnings requiring attention"}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-amber-500 shrink-0">⚠</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Workflow name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  {isRTL ? "اسم الـ Workflow في n8n" : "Workflow Name in n8n"} *
                </label>
                <input value={exportName} onChange={e => setExportName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder={isRTL ? "اسم الـ workflow" : "Workflow name"} />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    <Settings2 size={11} className="inline me-1" />
                    {isRTL ? "المنطقة الزمنية" : "Timezone"}
                  </label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/50">
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    <Settings2 size={11} className="inline me-1" />
                    {isRTL ? "ترتيب التنفيذ" : "Execution Order"}
                  </label>
                  <select value={executionOrder} onChange={e => setExecutionOrder(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/50">
                    <option value="v1">v1 (Default)</option>
                    <option value="v0">v0 (Legacy)</option>
                  </select>
                </div>
              </div>

              {/* Nodes preview */}
              <div>
                <button onClick={() => setShowJsonPreview(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
                  <ChevronDown size={12} className={`transition-transform ${showJsonPreview ? "rotate-180" : ""}`} />
                  {isRTL ? "معاينة العقد المُحضَّرة" : "Preview prepared nodes"}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">{nodes.length}</span>
                </button>
                {showJsonPreview && (
                  <div className="bg-muted/40 rounded-xl border border-border p-3 overflow-x-auto max-h-36 overflow-y-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {(nodes as WorkflowNode[]).map((n, i) => {
                        const { color, bg, Icon } = getNodeStyle(n.type ?? "");
                        return (
                          <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium ${bg} ${color}`}>
                            <Icon size={10} className="shrink-0" />
                            {n.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Download / Copy for testing */}
              <div className="bg-muted/30 rounded-xl p-3 border border-border">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                  {isRTL ? "اختبر الـ workflow قبل التصدير" : "Test the workflow before exporting"}
                </p>
                <div className="flex gap-2">
                  <button onClick={handleDownloadJson}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs transition-colors">
                    <Download size={12} />
                    {isRTL ? "تحميل JSON" : "Download JSON"}
                  </button>
                  <button onClick={handleCopyJson}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs transition-colors">
                    <Copy size={12} />
                    {isRTL ? "نسخ JSON" : "Copy JSON"}
                  </button>
                </div>
              </div>

              {/* Library error */}
              {libError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle size={13} className="text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">{libError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setPhase("prepare")}
                  className="px-3 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors shrink-0">
                  {isRTL ? "رجوع" : "Back"}
                </button>
                <button onClick={handlePrepareLibrary} disabled={libLoading || !hasNodes}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 text-sm transition-colors disabled:opacity-50">
                  {libLoading ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
                  {libLoading ? (isRTL ? "جاري التحضير..." : "Preparing...") : (isRTL ? "إعداد للمكتبة" : "Prepare for Library")}
                </button>
                <button onClick={handleExportToN8n} disabled={!exportName.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                  <ExternalLink size={13} />
                  {isRTL ? "تصدير n8n" : "Export to n8n"}
                </button>
              </div>
            </div>
          )}

          {/* PHASE: LIBRARY */}
          {phase === "library" && libContent && (
            <div className="space-y-3">
              {/* Title card */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {isRTL ? "العنوان" : "Title"}
                  </span>
                  <button onClick={() => handleCopy(libContent.title, "title")}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                    {copiedKey === "title" ? <CheckCircle2 size={10} className="text-green-500" /> : <Copy size={10} />}
                    {copiedKey === "title" ? (isRTL ? "تم" : "Copied!") : (isRTL ? "نسخ" : "Copy")}
                  </button>
                </div>
                <p className="text-sm font-medium text-foreground">{libContent.title}</p>
              </div>

              {/* Description card */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {isRTL ? "الوصف" : "Description"}
                  </span>
                  <button onClick={() => handleCopy(libContent.description, "desc")}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                    {copiedKey === "desc" ? <CheckCircle2 size={10} className="text-green-500" /> : <Copy size={10} />}
                    {copiedKey === "desc" ? (isRTL ? "تم" : "Copied!") : (isRTL ? "نسخ" : "Copy")}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-5">{libContent.description}</p>
              </div>

              {/* Categories + Tags row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {isRTL ? "التصنيفات" : "Categories"}
                    </span>
                    <button onClick={() => handleCopy(libContent.categories.join(", "), "cats")}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                      {copiedKey === "cats" ? <CheckCircle2 size={9} className="text-green-500" /> : <Copy size={9} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {libContent.categories.map(c => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 font-medium">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {isRTL ? "الـ Tags" : "Tags"}
                    </span>
                    <button onClick={() => handleCopy(libContent.tags.join(", "), "tags")}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                      {copiedKey === "tags" ? <CheckCircle2 size={9} className="text-green-500" /> : <Copy size={9} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {libContent.tags.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted border border-border text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {libContent.prerequisites.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-500" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                        {isRTL ? "المتطلبات المسبقة" : "Prerequisites"}
                      </span>
                    </div>
                    <button onClick={() => handleCopy(libContent.prerequisites.join("\n"), "prereqs")}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                      {copiedKey === "prereqs" ? <CheckCircle2 size={9} className="text-green-500" /> : <Copy size={9} />}
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {libContent.prerequisites.map((p, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Usage Instructions */}
              {libContent.usageInstructions.length > 0 && (
                <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {isRTL ? "خطوات الإعداد" : "Setup Instructions"}
                    </span>
                    <button onClick={() => handleCopy(libContent.usageInstructions.map((s, i) => `${i + 1}. ${s}`).join("\n"), "steps")}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-accent/10 hover:text-accent transition-colors">
                      {copiedKey === "steps" ? <CheckCircle2 size={9} className="text-green-500" /> : <Copy size={9} />}
                    </button>
                  </div>
                  <ol className="space-y-1">
                    {libContent.usageInstructions.map((s, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-accent font-bold shrink-0">{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* n8n library requirements checklist */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                <button
                  onClick={() => setShowLibChecklist(v => !v)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-blue-500">i</span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                      {isRTL ? "ماذا تحتاج صفحة إرسال n8n؟" : "What does the n8n submission page require?"}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-500 font-medium">{showLibChecklist ? "▲" : "▼"}</span>
                </button>
                {showLibChecklist && (
                  <div className="px-3.5 pb-3 space-y-1.5 border-t border-blue-500/10">
                    <p className="text-[10px] text-muted-foreground pt-2.5 pb-1">
                      {isRTL
                        ? "صفحة الإرسال على n8n.io تطلب المعلومات التالية:"
                        : "The n8n.io submission form requires the following:"}
                    </p>
                    {[
                      { done: true, ar: "حساب n8n.io (مجاني)", en: "n8n.io account (free)" },
                      { done: true, ar: "ملف workflow.json — موجود في حزمة ZIP", en: "workflow.json file — included in the ZIP" },
                      { done: true, ar: "العنوان — تم توليده بالـ AI", en: "Title — AI-generated above" },
                      { done: true, ar: "الوصف — تم توليده بالـ AI", en: "Description — AI-generated above" },
                      { done: true, ar: "التصنيفات والـ Tags — موجودة أعلاه", en: "Categories & Tags — listed above" },
                      { done: false, ar: "صورة screenshot للـ workflow (مطلوب يدوياً)", en: "Workflow screenshot image (manual)" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.done
                          ? <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                          : <div className="w-[11px] h-[11px] rounded-full border border-amber-500 shrink-0" />}
                        <span className={`text-[10px] ${item.done ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400 font-medium"}`}>
                          {isRTL ? item.ar : item.en}
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 pt-1.5 flex items-start gap-1">
                      <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                      {isRTL
                        ? "الشيء الوحيد غير متوفر في الحزمة هو الـ Screenshot — يمكنك التقاطه من n8n مباشرةً بعد الاختبار."
                        : "The only thing not in the ZIP is a screenshot — capture it from n8n after testing."}
                    </p>
                  </div>
                )}
              </div>

              {/* Test result banner */}
              {libTestDone && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                  <p className="text-[11px] text-green-700 dark:text-green-400">
                    {isRTL
                      ? "تم إرسال الـ workflow إلى n8n بصيغة [TEST] — اختبره الآن ثم التقط screenshot قبل الإرسال للمكتبة."
                      : 'Workflow sent to n8n as [TEST] — test it now, then take a screenshot before submitting.'}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => setPhase("configure")}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
                  {isRTL ? "رجوع" : "Back"}
                </button>
                <button onClick={handleLibTestInN8n} disabled={libTestLoading}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-sm transition-colors disabled:opacity-50">
                  {libTestLoading ? <Loader2 size={13} className="animate-spin" /> : libTestDone ? <CheckCircle2 size={13} className="text-green-500" /> : <ExternalLink size={13} />}
                  {libTestLoading ? (isRTL ? "جاري الإرسال..." : "Sending...") : libTestDone ? (isRTL ? "تم الإرسال لـ n8n" : "Sent to n8n!") : (isRTL ? "اختبر في n8n أولاً" : "Test in n8n first")}
                </button>
                <button onClick={handleDownloadZip} disabled={zipLoading}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 text-sm transition-colors disabled:opacity-50">
                  {zipLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  {zipLoading ? (isRTL ? "جاري التحضير..." : "Preparing...") : (isRTL ? "تحميل حزمة ZIP" : "Download ZIP Package")}
                </button>
                <a href={libContent.submissionUrl} target="_blank" rel="noopener noreferrer"
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-accent/90 transition-colors">
                  <ExternalLink size={13} />
                  {isRTL ? "فتح صفحة الإرسال" : "Open Submission Page"}
                </a>
              </div>
            </div>
          )}

          {/* PHASE: EXPORTING */}
          {phase === "exporting" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Loader2 size={26} className="text-accent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isRTL ? "جاري التصدير إلى n8n..." : "Exporting to n8n..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? "قد يستغرق هذا بضع ثوانٍ" : "This may take a few seconds"}
                </p>
              </div>
            </div>
          )}

          {/* PHASE: DONE */}
          {phase === "done" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 size={30} className="text-green-500" />
              </motion.div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">
                  {isRTL ? "تم التصدير بنجاح! 🎉" : "Exported Successfully! 🎉"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL
                    ? `تم إرسال "${exportName}" إلى n8n وهو جاهز للتشغيل`
                    : `"${exportName}" has been sent to n8n and is ready to run`}
                </p>
              </div>
              <button onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-accent/90 transition-colors">
                {isRTL ? "إغلاق" : "Close"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function TemplatesPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [tab, setTab] = useState<"local" | "n8n">("local");

  const [localSearch, setLocalSearch] = useState("");
  const [localCategory, setLocalCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<LocalTemplate | null>(null);
  const [localRatings, setLocalRatings] = useState<Record<number, { avgRating: number; ratingCount: number }>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", category: "api" });
  const [addingTemplate, setAddingTemplate] = useState(false);
  const [uploadedJson, setUploadedJson] = useState<WorkflowJson | null>(null);
  const [uploadedJsonName, setUploadedJsonName] = useState<string | null>(null);
  const [jsonUploadError, setJsonUploadError] = useState<string | null>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);

  const [n8nSearch, setN8nSearch] = useState("");
  const [n8nCategory, setN8nCategory] = useState("all");
  const [n8nSortBy, setN8nSortBy] = useState<"views" | "recent" | "default">("views");
  const [n8nPage, setN8nPage] = useState(1);
  const [n8nTemplates, setN8nTemplates] = useState<N8nTemplate[]>([]);
  const [n8nTotal, setN8nTotal] = useState(0);
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nError, setN8nError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());
  const [n8nPreview, setN8nPreview] = useState<N8nTemplate | null>(null);

  const [translatedLocal, setTranslatedLocal] = useState<Record<number, TranslatedContent>>({});
  const [translatingLocalId, setTranslatingLocalId] = useState<number | null>(null);
  const [translatedN8n, setTranslatedN8n] = useState<Record<number, TranslatedContent>>({});
  const [translatingN8nId, setTranslatingN8nId] = useState<number | null>(null);

  const N8N_ROWS = 18;
  const n8nTotalPages = Math.ceil(n8nTotal / N8N_ROWS);

  const { data: res, isLoading: localLoading, isError: localError } = useGetTemplates(undefined, {});

  const [usingTemplate, setUsingTemplate] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);
  const [exportTemplate, setExportTemplate] = useState<LocalTemplate | null>(null);

  const handleDownloadJson = (template: LocalTemplate) => {
    const json = template.workflowJson;
    if (!json) {
      toast({ title: isRTL ? "لا يوجد JSON لهذا القالب" : "No JSON available for this template", variant: "destructive" });
      return;
    }
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: isRTL ? `✅ تم تحميل "${template.name}.json"` : `✅ Downloaded "${template.name}.json"` });
  };

  const handleDeleteTemplate = async (template: LocalTemplate) => {
    const isSystemTemplate = template.isSystem;
    let confirmMsg: string;
    if (isSystemTemplate) {
      confirmMsg = isRTL
        ? `⚠️ تحذير: "${template.name}" هو قالب نظامي!\n\nسيُعاد إنشاؤه تلقائياً عند إعادة تشغيل الخادم.\nهل أنت متأكد من الحذف المؤقت؟`
        : `⚠️ Warning: "${template.name}" is a system template!\n\nIt will be recreated automatically on server restart.\nAre you sure you want to temporarily delete it?`;
    } else {
      confirmMsg = isRTL
        ? `هل أنت متأكد من حذف القالب "${template.name}"؟`
        : `Are you sure you want to delete "${template.name}"?`;
    }
    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;
    setDeletingTemplateId(template.id);
    try {
      const headers: Record<string, string> = { ...getAuthHeader() };
      const res = await fetch(`${API_BASE}/templates/${template.id}`, { method: "DELETE", headers });
      const data = await res.json() as { success: boolean; error?: { message?: string } };
      if (data.success) {
        toast({ title: isRTL ? "تم حذف القالب ✅" : "Template deleted ✅" });
        queryClient.invalidateQueries({ queryKey: getGetTemplatesQueryKey() });
        if (previewTemplate?.id === template.id) setPreviewTemplate(null);
      } else {
        const msg = data.error?.message ?? (isRTL ? "فشل الحذف" : "Delete failed");
        toast({ title: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handleUseTemplate = async (template: LocalTemplate) => {
    if (usingTemplate) return;

    const hasNodes = Array.isArray(template.workflowJson?.nodes) && (template.workflowJson?.nodes?.length ?? 0) > 0;

    if (!hasNodes) {
      // No nodes → send to AI agent to generate the workflow from description
      setUsingTemplate(true);
      try {
        const headers: Record<string, string> = { ...getAuthHeader(), "Content-Type": "application/json" };
        const res = await fetch(`${API_BASE}/templates/${template.id}/use`, { method: "POST", headers });
        const data = await res.json() as { success: boolean; data?: { id?: number } };
        if (data.success && data.data?.id) {
          const message = isRTL
            ? `أريد إنشاء workflow في n8n بناءً على هذا القالب:\n📌 الاسم: ${template.name}${template.description ? `\n📝 الوصف: ${template.description}` : ""}`
            : `I want to create a workflow in n8n based on this template:\n📌 Name: ${template.name}${template.description ? `\n📝 Description: ${template.description}` : ""}`;
          sessionStorage.setItem("templateUse", JSON.stringify({ convId: data.data.id, message }));
          window.location.href = "/chat";
        } else {
          toast({ title: isRTL ? "فشل تطبيق القالب" : "Failed to apply template", variant: "destructive" });
        }
      } catch {
        toast({ title: isRTL ? "فشل تطبيق القالب" : "Failed to apply template", variant: "destructive" });
      } finally {
        setUsingTemplate(false);
      }
      return;
    }

    // Has nodes → send directly to n8n
    setUsingTemplate(true);
    try {
      const headers: Record<string, string> = { ...getAuthHeader(), "Content-Type": "application/json" };
      const res = await fetch(`${API_BASE}/templates/${template.id}/deploy`, { method: "POST", headers });
      const data = await res.json() as {
        success: boolean;
        data?: { workflowId?: string; workflowName?: string };
        error?: { code?: string; message?: string };
      };
      if (data.success) {
        toast({
          title: isRTL
            ? `✅ تم إرسال "${data.data?.workflowName ?? template.name}" إلى n8n بنجاح`
            : `✅ "${data.data?.workflowName ?? template.name}" sent to n8n successfully`,
        });
        setPreviewTemplate(null);
      } else {
        const msg = data.error?.message ?? (isRTL ? "فشل إرسال القالب إلى n8n" : "Failed to send template to n8n");
        toast({ title: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: isRTL ? "فشل إرسال القالب إلى n8n" : "Failed to send template to n8n", variant: "destructive" });
    } finally {
      setUsingTemplate(false);
    }
  };

  const rawTemplates = ((res as { data?: { templates?: unknown[] } } | undefined)?.data?.templates ?? []) as LocalTemplate[];
  const templates = rawTemplates.map(tmpl => ({
    ...tmpl,
    avgRating: localRatings[tmpl.id]?.avgRating ?? (tmpl.avgRating ?? 0),
    ratingCount: localRatings[tmpl.id]?.ratingCount ?? (tmpl.ratingCount ?? 0),
  }));
  const filtered = templates.filter(tmpl => {
    const matchSearch = !localSearch || tmpl.name.toLowerCase().includes(localSearch.toLowerCase()) || tmpl.description.toLowerCase().includes(localSearch.toLowerCase());
    const matchCat = localCategory === "all" || tmpl.category === localCategory;
    return matchSearch && matchCat;
  });
  const mostUsed = templates.slice().sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);

  const n8nSearchRef = useRef(n8nSearch);
  n8nSearchRef.current = n8nSearch;

  const [fetchTrigger, setFetchTrigger] = useState(0);
  const triggerFetch = useCallback(() => { setN8nPage(1); setFetchTrigger(c => c + 1); }, []);

  useEffect(() => {
    if (tab !== "n8n") return;
    let cancelled = false;
    setN8nLoading(true);
    setN8nError(null);
    const params = new URLSearchParams({
      rows: String(N8N_ROWS),
      page: String(n8nPage),
      sortBy: n8nSortBy,
    });
    if (n8nSearchRef.current) params.set("search", n8nSearchRef.current);
    if (n8nCategory !== "all") params.set("category", n8nCategory);
    fetch(`${API_BASE}/templates/n8n-library?${params}`, { headers: { ...getAuthHeader() } })
      .then(r => r.json())
      .then((data: { success: boolean; data?: { templates: N8nTemplate[]; total: number } }) => {
        if (cancelled) return;
        if (data.success && data.data) {
          setN8nTemplates(data.data.templates);
          setN8nTotal(data.data.total);
        } else {
          setN8nError("تعذر جلب القوالب");
        }
      })
      .catch(() => { if (!cancelled) setN8nError("خطأ في الاتصال"); })
      .finally(() => { if (!cancelled) setN8nLoading(false); });
    return () => { cancelled = true; };
  }, [tab, n8nPage, n8nSortBy, n8nCategory, fetchTrigger]);

  const fetchN8n = triggerFetch;
  const handleN8nSearch = (val: string) => { setN8nSearch(val); };
  const handleN8nCategory = (cat: string) => { setN8nCategory(cat); setN8nPage(1); };

  const handleImport = async (template: N8nTemplate) => {
    setImportingId(template.id);
    try {
      const headers: Record<string, string> = { ...getAuthHeader(), "Content-Type": "application/json" };
      const body = JSON.stringify({
        name: template.name,
        description: template.description,
        category: template.category,
        nodesCount: template.nodesCount,
      });
      const res = await fetch(`${API_BASE}/templates/n8n-library/import/${template.id}`, { method: "POST", headers, body });
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

  const handleTranslateLocal = async (template: LocalTemplate) => {
    if (translatedLocal[template.id]) {
      setTranslatedLocal(p => { const n = { ...p }; delete n[template.id]; return n; });
      return;
    }
    setTranslatingLocalId(template.id);
    try {
      const [name, description] = await Promise.all([
        translateText(template.name),
        template.description ? translateText(template.description) : Promise.resolve(""),
      ]);
      setTranslatedLocal(p => ({ ...p, [template.id]: { name, description } }));
    } catch {
      toast({ title: isRTL ? "فشل الترجمة، حاول مجدداً" : "Translation failed, try again", variant: "destructive" });
    } finally {
      setTranslatingLocalId(null);
    }
  };

  const handleTranslateN8n = async (template: N8nTemplate) => {
    if (translatedN8n[template.id]) {
      setTranslatedN8n(p => { const n = { ...p }; delete n[template.id]; return n; });
      return;
    }
    setTranslatingN8nId(template.id);
    try {
      const [name, description] = await Promise.all([
        translateText(template.name),
        template.description ? translateText(template.description) : Promise.resolve(""),
      ]);
      setTranslatedN8n(p => ({ ...p, [template.id]: { name, description } }));
    } catch {
      toast({ title: isRTL ? "فشل الترجمة، حاول مجدداً" : "Translation failed, try again", variant: "destructive" });
    } finally {
      setTranslatingN8nId(null);
    }
  };

  const handleJsonFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJsonUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      setJsonUploadError(isRTL ? "يجب أن يكون الملف بصيغة JSON" : "File must be a .json file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as WorkflowJson;
        if (typeof parsed !== "object" || parsed === null) throw new Error("invalid");
        setUploadedJson(parsed);
        setUploadedJsonName(file.name);
        if (!newTemplate.name.trim() && parsed.name) {
          setNewTemplate(p => ({ ...p, name: parsed.name ?? "" }));
        }
      } catch {
        setJsonUploadError(isRTL ? "الملف غير صالح، يرجى التحقق من صيغة JSON" : "Invalid file, please check the JSON format");
        setUploadedJson(null);
        setUploadedJsonName(null);
      }
    };
    reader.readAsText(file);
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.description.trim()) return;
    setAddingTemplate(true);
    try {
      const headers: Record<string, string> = { ...getAuthHeader(), "Content-Type": "application/json" };
      const workflowJson = uploadedJson ?? { name: newTemplate.name.trim(), nodes: [], connections: {} };
      const nodesCount = uploadedJson?.nodes?.length ?? 0;
      const res = await fetch(`${API_BASE}/templates`, {
        method: "POST", headers,
        body: JSON.stringify({ name: newTemplate.name.trim(), description: newTemplate.description.trim(), category: newTemplate.category, nodesCount, workflowJson }),
      });
      const data = await res.json() as { success: boolean };
      if (data.success) {
        toast({ title: isRTL ? "تم إضافة القالب ✅" : "Template added ✅" });
        queryClient.invalidateQueries({ queryKey: getGetTemplatesQueryKey() });
        setShowAddModal(false);
        setNewTemplate({ name: "", description: "", category: "api" });
        setUploadedJson(null);
        setUploadedJsonName(null);
        setJsonUploadError(null);
      } else {
        toast({ title: isRTL ? "فشل إضافة القالب" : "Failed to add template", variant: "destructive" });
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
          {n8nTemplates.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs">{n8nTemplates.length} {isRTL ? "قالب" : "templates"}</span>}
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
                {mostUsed.map((template, i) => {
                  const translated = translatedLocal[template.id];
                  const isTranslating = translatingLocalId === template.id;
                  return (
                    <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-gradient-to-br from-accent/10 to-accent-secondary/5 rounded-xl p-5 border border-accent/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                          <Zap size={20} className="text-accent" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTranslateLocal(template)}
                            disabled={isTranslating}
                            title={translated ? "إخفاء الترجمة" : "ترجمة إلى العربية"}
                            className={`p-1 rounded-md transition-colors disabled:opacity-50 ${translated ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}>
                            {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Languages size={13} />}
                          </button>
                          <StarRating templateId={template.id} currentRating={template.avgRating} ratingCount={template.ratingCount} isRTL={isRTL} onRated={(avg, count) => setLocalRatings(p => ({ ...p, [template.id]: { avgRating: avg, ratingCount: count } }))} />
                        </div>
                      </div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{translated ? translated.name : template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{translated ? translated.description : template.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{template.nodesCount} {t("workflows.nodes")}</span>
                        <div className="flex items-center gap-1.5">
                          {template.workflowJson && (
                            <button
                              onClick={() => handleDownloadJson(template)}
                              title={isRTL ? "تحميل JSON" : "Download JSON"}
                              className="flex items-center justify-center p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                              <Download size={12} />
                            </button>
                          )}
                          {(isAdmin || !template.isSystem) && (
                            <button
                              onClick={() => handleDeleteTemplate(template)}
                              disabled={deletingTemplateId === template.id}
                              title={template.isSystem ? (isRTL ? "حذف قالب نظامي" : "Delete system template") : (isRTL ? "حذف" : "Delete")}
                              className={`flex items-center justify-center p-1.5 rounded-lg border transition-colors disabled:opacity-50 ${template.isSystem ? "border-orange-500/30 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10" : "border-border/60 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"}`}>
                              {deletingTemplateId === template.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>
                          )}
                          {Array.isArray(template.workflowJson?.nodes) && (template.workflowJson?.nodes?.length ?? 0) > 0 && (
                            <button
                              onClick={() => setExportTemplate(template)}
                              title={isRTL ? "تصدير احترافي إلى n8n" : "Professional export to n8n"}
                              className="flex items-center justify-center p-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors">
                              <ExternalLink size={12} />
                            </button>
                          )}
                          <button onClick={() => handleUseTemplate(template)}
                            disabled={usingTemplate}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                            {usingTemplate ? <Loader2 size={12} className="animate-spin" /> : <>{t("templates.use")} <ArrowRight size={12} /></>}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
            ) : localError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="text-destructive" size={24} />
                </div>
                <p className="text-sm font-medium text-destructive">{isRTL ? "فشل تحميل القوالب" : "Failed to load templates"}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? "تحقق من اتصال الخادم وأعد المحاولة" : "Check server connection and try again"}</p>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: getGetTemplatesQueryKey() })}
                  className="mt-1 px-4 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors">
                  {isRTL ? "إعادة المحاولة" : "Retry"}
                </button>
              </div>
            ) : !filtered.length ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">{t("templates.noTemplates")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((template, i) => {
                  const translated = translatedLocal[template.id];
                  const isTranslating = translatingLocalId === template.id;
                  return (
                    <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-xl p-5 border border-border hover:border-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Zap size={18} className="text-accent" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTranslateLocal(template)}
                            disabled={isTranslating}
                            title={translated ? "إخفاء الترجمة" : "ترجمة إلى العربية"}
                            className={`p-1 rounded-md transition-colors disabled:opacity-50 ${translated ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}>
                            {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Languages size={13} />}
                          </button>
                          {(isAdmin || !template.isSystem) && (
                            <button
                              onClick={() => handleDeleteTemplate(template)}
                              disabled={deletingTemplateId === template.id}
                              title={
                                template.isSystem
                                  ? (isRTL ? "حذف قالب نظامي (أدمن)" : "Delete system template (admin)")
                                  : (isRTL ? "حذف القالب" : "Delete template")
                              }
                              className={`p-1 rounded-md transition-colors disabled:opacity-50 ${template.isSystem ? "text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"}`}>
                              {deletingTemplateId === template.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
                          )}
                          <StarRating templateId={template.id} currentRating={template.avgRating} ratingCount={template.ratingCount} isRTL={isRTL} onRated={(avg, count) => setLocalRatings(p => ({ ...p, [template.id]: { avgRating: avg, ratingCount: count } }))} />
                        </div>
                      </div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{translated ? translated.name : template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{translated ? translated.description : template.description}</p>
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
                        {template.workflowJson && (
                          <button
                            onClick={() => handleDownloadJson(template)}
                            title={isRTL ? "تحميل JSON" : "Download JSON"}
                            className="flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
                            <Download size={12} />
                          </button>
                        )}
                        {Array.isArray(template.workflowJson?.nodes) && (template.workflowJson?.nodes?.length ?? 0) > 0 && (
                          <button
                            onClick={() => setExportTemplate(template)}
                            title={isRTL ? "تصدير احترافي إلى n8n" : "Professional export to n8n"}
                            className="flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors shrink-0">
                            <ExternalLink size={12} />
                          </button>
                        )}
                        <button onClick={() => handleUseTemplate(template)}
                          disabled={usingTemplate}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                          {usingTemplate ? <Loader2 size={12} className="animate-spin" /> : <>{t("templates.use")} <ArrowRight size={12} /></>}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "n8n" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={n8nSearch} onChange={e => handleN8nSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchN8n()}
                placeholder={isRTL ? "ابحث في مكتبة n8n..." : "Search n8n library..."}
                className="w-full ps-9 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <button onClick={fetchN8n} disabled={n8nLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors shrink-0 disabled:opacity-50">
              {n8nLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {isRTL ? "بحث" : "Search"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">{isRTL ? "ترتيب:" : "Sort:"}</span>
            {([
              { key: "views", labelAr: "الأكثر مشاهدة", labelEn: "Most Viewed" },
              { key: "recent", labelAr: "الأحدث", labelEn: "Latest" },
              { key: "default", labelAr: "المميزة", labelEn: "Featured" },
            ] as const).map(opt => (
              <button key={opt.key}
                onClick={() => { setN8nSortBy(opt.key); setN8nPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${n8nSortBy === opt.key ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {isRTL ? opt.labelAr : opt.labelEn}
              </button>
            ))}
            <span className="text-muted-foreground/40 text-xs">|</span>
            <span className="text-xs text-muted-foreground shrink-0">{isRTL ? "التصنيف:" : "Category:"}</span>
            {N8N_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => handleN8nCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${n8nCategory === cat ? "bg-accent/20 text-accent border border-accent/30" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {cat === "all" ? (isRTL ? "الكل" : "All") : cat}
              </button>
            ))}
          </div>

          {!n8nLoading && !n8nError && n8nTemplates.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                {isRTL
                  ? `صفحة ${n8nPage} من ${n8nTotalPages} · ${n8nTotal.toLocaleString()} قالب إجمالاً`
                  : `Page ${n8nPage} of ${n8nTotalPages} · ${n8nTotal.toLocaleString()} total templates`}
              </span>
              <span className="flex items-center gap-1">
                {n8nSortBy === "views" && (isRTL ? "مرتبة: الأكثر مشاهدة" : "Sorted: Most Viewed")}
                {n8nSortBy === "recent" && (isRTL ? "مرتبة: الأحدث" : "Sorted: Latest")}
                {n8nSortBy === "default" && (isRTL ? "مرتبة: المميزة" : "Sorted: Featured")}
              </span>
            </div>
          )}

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
                  const translated = translatedN8n[template.id];
                  const isTranslating = translatingN8nId === template.id;
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
                          <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2 flex-1">
                            {translated ? translated.name : template.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleTranslateN8n(template)}
                              disabled={isTranslating}
                              title={translated ? "إخفاء الترجمة" : "ترجمة إلى العربية"}
                              className={`p-1 rounded-md transition-colors disabled:opacity-50 ${translated ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}>
                              {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                            </button>
                            {imported && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">
                                {isRTL ? "مستورد" : "Imported"}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                          {translated
                            ? (translated.description || (isRTL ? "لا يوجد وصف" : "No description"))
                            : (template.description || (isRTL ? "لا يوجد وصف" : "No description"))}
                        </p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" onClick={() => setPreviewTemplate(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-border shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex-1 leading-tight">
                  {translatedLocal[previewTemplate.id]?.name ?? previewTemplate.name}
                </h2>
                <div className="flex items-center gap-2 ms-2 shrink-0">
                  <button
                    onClick={() => handleTranslateLocal(previewTemplate)}
                    disabled={translatingLocalId === previewTemplate.id}
                    title={translatedLocal[previewTemplate.id] ? "إخفاء الترجمة" : "ترجمة إلى العربية"}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${translatedLocal[previewTemplate.id] ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}>
                    {translatingLocalId === previewTemplate.id ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                  </button>
                  <button onClick={() => setPreviewTemplate(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {translatedLocal[previewTemplate.id]?.description ?? previewTemplate.description}
              </p>
              <div className="mb-4">
                <StarRating templateId={previewTemplate.id} currentRating={previewTemplate.avgRating} ratingCount={previewTemplate.ratingCount} isRTL={isRTL}
                  onRated={(avg, count) => { setLocalRatings(p => ({ ...p, [previewTemplate.id]: { avgRating: avg, ratingCount: count } })); setPreviewTemplate(prev => prev ? { ...prev, avgRating: avg, ratingCount: count } : null); }} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "العقد" : "Nodes"}</p>
                  <p className="font-semibold text-foreground text-sm">{previewTemplate.nodesCount || previewTemplate.workflowJson?.nodes?.length || 0}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الاستخدامات" : "Uses"}</p>
                  <p className="font-semibold text-foreground text-sm">{previewTemplate.usageCount}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">{isRTL ? "مخطط العقد" : "Node Graph"}</p>
                <NodeGraphPreview workflowJson={previewTemplate.workflowJson} isRTL={isRTL} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
                {previewTemplate.workflowJson && (
                  <button
                    onClick={() => handleDownloadJson(previewTemplate)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Download size={14} />
                    {isRTL ? "تحميل JSON" : "Download JSON"}
                  </button>
                )}
                {(isAdmin || !previewTemplate.isSystem) && (
                  <button
                    onClick={() => { void handleDeleteTemplate(previewTemplate); }}
                    disabled={deletingTemplateId === previewTemplate.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors disabled:opacity-50 ${previewTemplate.isSystem ? "border-orange-500/40 text-orange-500 hover:bg-orange-500/10" : "border-red-500/40 text-red-500 hover:bg-red-500/10"}`}>
                    {deletingTemplateId === previewTemplate.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    {previewTemplate.isSystem ? (isRTL ? "حذف (نظامي)" : "Delete (system)") : (isRTL ? "حذف" : "Delete")}
                  </button>
                )}
                {Array.isArray(previewTemplate.workflowJson?.nodes) && (previewTemplate.workflowJson?.nodes?.length ?? 0) > 0 && (
                  <button
                    onClick={() => { setExportTemplate(previewTemplate); setPreviewTemplate(null); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent/40 text-accent hover:bg-accent/10 text-sm transition-colors">
                    <ExternalLink size={14} />
                    {isRTL ? "تصدير احترافي" : "Professional Export"}
                  </button>
                )}
                <button onClick={() => { void handleUseTemplate(previewTemplate); setPreviewTemplate(null); }}
                  disabled={usingTemplate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {usingTemplate ? <Loader2 size={14} className="animate-spin" /> : t("templates.use")}
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {n8nPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" onClick={() => setN8nPreview(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-border shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground leading-tight flex-1">
                  {translatedN8n[n8nPreview.id]?.name ?? n8nPreview.name}
                </h2>
                <div className="flex items-center gap-2 ms-2 shrink-0">
                  <button
                    onClick={() => handleTranslateN8n(n8nPreview)}
                    disabled={translatingN8nId === n8nPreview.id}
                    title={translatedN8n[n8nPreview.id] ? "إخفاء الترجمة" : "ترجمة إلى العربية"}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${translatedN8n[n8nPreview.id] ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}>
                    {translatingN8nId === n8nPreview.id ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                  </button>
                  <button onClick={() => setN8nPreview(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              {n8nPreview.imageUrl && (
                <img src={n8nPreview.imageUrl} alt={n8nPreview.name} className="w-full h-40 object-cover rounded-xl mb-4 bg-muted" />
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {translatedN8n[n8nPreview.id]?.description
                  ?? (n8nPreview.description || (isRTL ? "لا يوجد وصف" : "No description available"))}
              </p>
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
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-card rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-border shadow-2xl">
            <div className="p-4 sm:p-6">
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    {isRTL ? "ملف Workflow JSON" : "Workflow JSON File"}
                    <span className="ms-1 text-muted-foreground/60 font-normal">{isRTL ? "(اختياري)" : "(optional)"}</span>
                  </label>
                  <input
                    ref={jsonFileRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleJsonFileChange}
                    className="hidden"
                  />
                  {uploadedJsonName ? (
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-green-500/40 bg-green-500/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                        <FileJson size={14} className="text-green-600 shrink-0" />
                        <span className="text-xs text-green-700 dark:text-green-400 truncate font-medium">{uploadedJsonName}</span>
                        {uploadedJson?.nodes && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            ({uploadedJson.nodes.length} {isRTL ? "عقدة" : "nodes"})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { setUploadedJson(null); setUploadedJsonName(null); setJsonUploadError(null); if (jsonFileRef.current) jsonFileRef.current.value = ""; }}
                        className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                        <X size={13} className="text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => jsonFileRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-colors group">
                      <Upload size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">
                        {isRTL ? "اضغط لرفع ملف JSON" : "Click to upload a JSON file"}
                      </span>
                    </button>
                  )}
                  {jsonUploadError && (
                    <p className="text-xs text-destructive mt-1.5">{jsonUploadError}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowAddModal(false); setUploadedJson(null); setUploadedJsonName(null); setJsonUploadError(null); }} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">{t("app.cancel")}</button>
                <button onClick={handleAddTemplate} disabled={addingTemplate || !newTemplate.name.trim() || !newTemplate.description.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {addingTemplate ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ القالب" : "Save Template")}
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportTemplate && (
          <ExportModal
            template={exportTemplate}
            isRTL={isRTL}
            onClose={() => setExportTemplate(null)}
            onExported={(workflowName) => {
              toast({
                title: isRTL
                  ? `✅ تم تصدير "${workflowName}" إلى n8n بنجاح`
                  : `✅ "${workflowName}" exported to n8n successfully`,
              });
              queryClient.invalidateQueries({ queryKey: getGetTemplatesQueryKey() });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
