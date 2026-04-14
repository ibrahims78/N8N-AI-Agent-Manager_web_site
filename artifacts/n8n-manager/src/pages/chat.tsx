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
} from "lucide-react";
import { useGetConversations, useCreateConversation, useGetConversation, useDeleteConversation, getGetConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, API_BASE } from "@/lib/api";
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
  const phaseColors = {
    pending: "bg-muted text-muted-foreground",
    running: "bg-accent/20 text-accent border border-accent/40",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    failed: "bg-destructive/10 text-destructive",
  };
  const phaseIcons = {
    pending: <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />,
    running: <Loader2 size={12} className="animate-spin text-accent" />,
    done: <CheckCircle2 size={12} className="text-emerald-500" />,
    failed: <XCircle size={12} className="text-destructive" />,
  };
  return (
    <div className="bg-card border border-border rounded-2xl rounded-ts-sm px-4 py-3 space-y-2 max-w-[85%]">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {isRTL ? "جاري إنشاء الـ Workflow..." : "Generating Workflow..."}
      </p>
      {phases.map((phase) => (
        <motion.div
          key={phase.phase}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: phase.phase * 0.1 }}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${phaseColors[phase.status]}`}
        >
          {phaseIcons[phase.status]}
          <span className="flex-1 font-medium">{isRTL ? phase.labelAr : phase.label}</span>
          {phase.durationMs !== undefined && phase.status === "done" && (
            <span className="text-[10px] opacity-60">{(phase.durationMs / 1000).toFixed(1)}s</span>
          )}
          {phase.status === "running" && (
            <span className="text-[10px] animate-pulse">{isRTL ? "جارٍ..." : "working..."}</span>
          )}
        </motion.div>
      ))}
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
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-accent" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-ts-sm px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent/70"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{isRTL ? "الوكيل يكتب..." : "Agent is typing..."}</span>
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
  const [phases, setPhases] = useState<PhaseProgress[]>([]);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
  const messages: Message[] = detail?.data?.messages ?? [];

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
  }, [messages, isGenerating, generationResult]);

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

  // ── Send Handler ──
  const handleSend = useCallback((overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending || !selectedConvId) return;

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
    setIsGenerating(false);
    setGenerationResult(null);
    setPhases([]);

    const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_BASE}/chat/conversations/${selectedConvId}/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: fullContent, mode: chatMode }),
    }).then(async (response) => {
      if (!response.ok || !response.body) throw new Error("Network error");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("event: ")) continue;
          if (line.startsWith("data: ")) {
            const eventLine = line.slice(6);
            try {
              const parsed = JSON.parse(eventLine) as Record<string, unknown>;
              if ((parsed as { phase?: number }).phase !== undefined) {
                const phaseData = parsed as unknown as PhaseProgress;
                setIsGenerating(true);
                setPhases(prev => {
                  const idx = prev.findIndex(p => p.phase === phaseData.phase);
                  if (idx >= 0) { const u = [...prev]; u[idx] = phaseData; return u; }
                  return [...prev, phaseData];
                });
              } else if ((parsed as { type?: string }).type === "sequential" || (parsed as { type?: string }).type === "gpt-only" || (parsed as { type?: string }).type === "chat") {
                if ((parsed as { type?: string }).type === "sequential") {
                  setPhases([
                    { phase: 1, label: "GPT-4o: Creating workflow", labelAr: "GPT-4o: إنشاء الـ workflow", status: "pending" },
                    { phase: 2, label: "Gemini: Reviewing & scoring", labelAr: "Gemini: مراجعة وتقييم", status: "pending" },
                    { phase: 3, label: "GPT-4o: Refining workflow", labelAr: "GPT-4o: تحسين الـ workflow", status: "pending" },
                    { phase: 4, label: "Gemini: Final validation", labelAr: "Gemini: التحقق النهائي", status: "pending" },
                  ]);
                  setIsGenerating(true);
                }
              } else if ((parsed as { message?: unknown }).message !== undefined) {
                setIsGenerating(false);
                setSending(false);
                if ((parsed as { workflowJson?: unknown }).workflowJson) {
                  const r = parsed as { workflowJson: Record<string, unknown>; qualityScore: number; qualityGrade: string; roundsCount: number; totalTimeMs: number; phases: PhaseProgress[] };
                  setGenerationResult({ workflowJson: r.workflowJson, qualityScore: r.qualityScore ?? 75, qualityGrade: r.qualityGrade ?? "B", roundsCount: r.roundsCount ?? 1, totalTimeMs: r.totalTimeMs ?? 0, phases: r.phases ?? [] });
                } else if ((parsed as { error?: string }).error) {
                  toast({ title: String((parsed as { error: string }).error), variant: "destructive" });
                  setPhases([]);
                } else {
                  setPhases([]);
                }
                refetchConv();
                queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
              }
            } catch { /* ignore */ }
          }
        }
      }
    }).catch((err: unknown) => {
      setSending(false);
      setIsGenerating(false);
      toast({ title: String(err), variant: "destructive" });
    });
  }, [input, sending, selectedConvId, authHeader, chatMode, refetchConv, queryClient, toast, attachments, isRTL]);

  useEffect(() => {
    if (selectedConvId && pendingAutoSend.current) {
      const message = pendingAutoSend.current;
      pendingAutoSend.current = null;
      handleSend(message);
    }
  }, [selectedConvId, handleSend]);

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
    const convTypeColor = conv.type === "create" ? "bg-emerald-500" : conv.type === "query" ? "bg-blue-500" : "bg-muted-foreground";

    return (
      <div
        key={conv.id}
        className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer mb-0.5 group transition-colors relative ${selectedConvId === conv.id ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"}`}
        onClick={() => {
          if (isRenaming) return;
          setSelectedConvId(conv.id);
          setGenerationResult(null);
          setPhases([]);
        }}
      >
        {sidebarCollapsed ? (
          <div className="relative group/icon mx-auto">
            <div className={`w-2 h-2 rounded-full shrink-0 ${convTypeColor}`} />
            <div className={`absolute ${isRTL ? "right-full me-2" : "left-full ms-2"} top-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity z-50 pointer-events-none`}>
              {conv.title}
            </div>
          </div>
        ) : (
          <>
            <div className={`w-2 h-2 rounded-full shrink-0 ${convTypeColor}`} />
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
              <span
                className="text-xs truncate flex-1"
                onDoubleClick={e => {
                  e.stopPropagation();
                  setRenamingConvId(conv.id);
                  setRenameValue(conv.title);
                }}
              >
                {conv.title}
              </span>
            )}

            <div className={`flex items-center gap-0.5 ${isRenaming ? "hidden" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
              <button
                onClick={e => { e.stopPropagation(); togglePin(conv.id); }}
                className={`p-0.5 rounded hover:bg-accent/10 transition-colors ${isPinned ? "text-accent" : "text-muted-foreground"}`}
                title={isRTL ? "تثبيت" : "Pin"}
              >
                <Pin size={11} className={isPinned ? "fill-current" : ""} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteConv({ id: conv.id.toString() } as Parameters<typeof deleteConv>[0]); }}
                className="p-0.5 rounded hover:text-destructive text-muted-foreground transition-colors"
                title={isRTL ? "حذف" : "Delete"}
              >
                <Trash2 size={11} />
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
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageSquare size={24} className="text-accent" />
                </div>
                <p className="text-muted-foreground text-sm">{t("chat.startNew")}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => createConv({ title: s, type: "query" } as Parameters<typeof createConv>[0])}
                      className="px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : !messages.length && !isGenerating ? (
              <div className="flex items-center justify-center h-full">
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
                        {/* Phase 5: Avatar - Assistant (shown on left for LTR, right for RTL) */}
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-accent" />
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
                              ? "bg-accent text-white rounded-2xl rounded-te-sm"
                              : "bg-card border border-border text-foreground rounded-2xl rounded-ts-sm"
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
                              ? <MessageContent content={msg.content} isRTL={isRTL} isLatest={msg.id === lastAssistantId} />
                              : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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

                        {/* Phase 5: User Avatar */}
                        {isUser && (
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                            {userInitial}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}

                {/* Phase 5: Improved typing indicator */}
                <AnimatePresence>
                  {isGenerating && phases.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${isRTL ? "justify-end" : "justify-start"}`}
                    >
                      <PhaseProgressBar phases={phases} isRTL={isRTL} />
                    </motion.div>
                  )}
                  {isGenerating && phases.length === 0 && (
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

          {/* Phase 3: Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map(att => (
                <AttachmentBadge
                  key={att.id}
                  att={att}
                  onRemove={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                />
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Phase 3: Attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title={isRTL ? "إرفاق ملف" : "Attach file"}
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,application/json,text/plain,text/yaml,application/x-yaml,.yaml,.yml"
              multiple
              onChange={handleFileSelect}
            />

            <div className="flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={selectedConvId
                  ? (isRTL ? t("chat.placeholder") : "Ask about n8n or request a workflow...")
                  : (isRTL ? "← اختر محادثة أو أنشئ واحدة جديدة" : "Select or create a conversation →")}
                rows={1}
                className="w-full resize-none px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 max-h-36 placeholder:text-muted-foreground/60"
              />

              {/* Phase 4: Input toolbar */}
              <div className="flex items-center justify-between mt-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {sendOnEnter
                      ? (isRTL ? "Enter للإرسال · Shift+Enter لسطر جديد" : "Enter to send · Shift+Enter for newline")
                      : (isRTL ? "Ctrl+Enter للإرسال" : "Ctrl+Enter to send")}
                  </span>
                  <button
                    onClick={() => setSendOnEnter(!sendOnEnter)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${sendOnEnter ? "border-accent/40 text-accent bg-accent/5" : "border-border text-muted-foreground"}`}
                    title={isRTL ? "تغيير طريقة الإرسال" : "Toggle send mode"}
                  >
                    {sendOnEnter ? "Enter" : "Ctrl+Enter"}
                  </button>
                </div>

                {/* Phase 4: Char counter */}
                {charCount > 500 && (
                  <span className={`text-[10px] font-medium tabular-nums ${charCount >= 1900 ? "text-destructive" : charCount >= 1500 ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {charCount}/2000
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || sending || !selectedConvId}
              className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>

          {/* Phase 4: Keyboard shortcut hint */}
          <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
            {isRTL ? "Ctrl+N محادثة جديدة · Escape للخروج من وضع التكبير" : "Ctrl+N new conversation · Escape to exit fullscreen"}
          </p>
        </div>
      </div>
    </div>
  );
}
