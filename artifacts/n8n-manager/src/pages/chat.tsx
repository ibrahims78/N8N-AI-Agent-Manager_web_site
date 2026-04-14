import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Send, Plus, Trash2, MessageSquare, CheckCircle2, XCircle,
  Loader2, ChevronRight, Copy, ExternalLink, Award, Zap,
} from "lucide-react";
import { useGetConversations, useCreateConversation, useGetConversation, useDeleteConversation, getGetConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader, API_BASE } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/hooks/use-toast";

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
          <span className="flex-1 font-medium">
            {isRTL ? phase.labelAr : phase.label}
          </span>
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
    : result.qualityGrade === "B"
    ? "text-blue-500"
    : result.qualityGrade === "C"
    ? "text-yellow-500"
    : "text-orange-500";

  const scoreColor = result.qualityScore >= 85
    ? "bg-emerald-500"
    : result.qualityScore >= 70
    ? "bg-yellow-500"
    : "bg-orange-500";

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
            {isRTL ? `${result.roundsCount} جولة · ${(result.totalTimeMs / 1000).toFixed(1)} ثانية` : `${result.roundsCount} round(s) · ${(result.totalTimeMs / 1000).toFixed(1)}s`}
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
            {p.status === "done" && <div className="text-[8px] opacity-70">{p.durationMs ? `${(p.durationMs / 1000).toFixed(0)}s` : "✓"}</div>}
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

function MessageContent({ content, isRTL }: { content: string; isRTL: boolean }) {
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
      await navigator.clipboard.writeText(jsonMatch[1]);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      {textPart && (
        <p className="whitespace-pre-wrap leading-relaxed text-sm">{textPart}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        <button
          onClick={handleCopyText}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copiedText
            ? <CheckCircle2 size={11} className="text-emerald-500" />
            : <Copy size={11} />}
          {copiedText
            ? (isRTL ? "تم النسخ!" : "Copied!")
            : (isRTL ? "نسخ" : "Copy")}
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
              {copiedJson
                ? <CheckCircle2 size={11} className="text-emerald-500" />
                : <Copy size={11} />}
              {copiedJson
                ? (isRTL ? "تم النسخ!" : "Copied!")
                : (isRTL ? "نسخ JSON" : "Copy JSON")}
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

export default function ChatPage() {
  const { t } = useTranslation();
  const { language, chatMode, setChatMode } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const pendingAutoSend = useRef<string | null>(null);
  const [phases, setPhases] = useState<PhaseProgress[]>([]);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      onSuccess: (data) => {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, generationResult]);

  // Load replay request from History page
  useEffect(() => {
    const replay = sessionStorage.getItem("chatReplay");
    if (replay) {
      sessionStorage.removeItem("chatReplay");
      setInput(replay);
    }
  }, []);

  // Load template use request and auto-send
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

  const handleSend = useCallback((overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending || !selectedConvId) return;
    setInput("");
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
      body: JSON.stringify({ content: text, mode: chatMode }),
    }).then(async (response) => {
      if (!response.ok || !response.body) {
        throw new Error("Network error");
      }

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
          if (line.startsWith("event: ")) {
            continue;
          }
          if (line.startsWith("data: ")) {
            const eventLine = line.slice(6);
            try {
              const parsed = JSON.parse(eventLine) as Record<string, unknown>;

              if ((parsed as { phase?: number }).phase !== undefined) {
                const phaseData = parsed as PhaseProgress;
                setIsGenerating(true);
                setPhases(prev => {
                  const idx = prev.findIndex(p => p.phase === phaseData.phase);
                  if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = phaseData;
                    return updated;
                  }
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
                  const r = parsed as {
                    workflowJson: Record<string, unknown>;
                    qualityScore: number;
                    qualityGrade: string;
                    roundsCount: number;
                    totalTimeMs: number;
                    phases: PhaseProgress[];
                  };
                  setGenerationResult({
                    workflowJson: r.workflowJson,
                    qualityScore: r.qualityScore ?? 75,
                    qualityGrade: r.qualityGrade ?? "B",
                    roundsCount: r.roundsCount ?? 1,
                    totalTimeMs: r.totalTimeMs ?? 0,
                    phases: r.phases ?? [],
                  });
                } else if ((parsed as { error?: string }).error) {
                  toast({ title: String((parsed as { error: string }).error), variant: "destructive" });
                  setPhases([]);
                } else {
                  setPhases([]);
                }

                refetchConv();
                queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
              }
            } catch {
              // ignore JSON parse errors for non-data lines
            }
          }
        }
      }
    }).catch((err: unknown) => {
      setSending(false);
      setIsGenerating(false);
      toast({ title: String(err), variant: "destructive" });
    });
  }, [input, sending, selectedConvId, authHeader, chatMode, refetchConv, queryClient, toast]);

  // Auto-send when selectedConvId is ready and there's a pending template message
  useEffect(() => {
    if (selectedConvId && pendingAutoSend.current) {
      const message = pendingAutoSend.current;
      pendingAutoSend.current = null;
      handleSend(message);
    }
  }, [selectedConvId, handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
      const res = await fetch(`${API_BASE}/workflows/import`, {
        method: "POST",
        headers,
        body: JSON.stringify({ workflowJson: generationResult.workflowJson }),
      });
      const data = await res.json() as { success: boolean; error?: { message: string } };
      if (data.success) {
        toast({ title: isRTL ? "تم إرسال الـ workflow لـ n8n بنجاح! ✅" : "Workflow sent to n8n successfully! ✅" });
        setGenerationResult(null);
        queryClient.invalidateQueries({ queryKey: ["workflows"] });
      } else {
        toast({ title: data.error?.message ?? "Failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  };

  const suggestions = [
    t("chat.suggestions.email"),
    t("chat.suggestions.webhook"),
    t("chat.suggestions.report"),
    t("chat.suggestions.question"),
  ];

  const groupedConvs = conversations.reduce((acc, conv) => {
    const now = new Date();
    const updatedAt = new Date(conv.updatedAt);
    const diff = (now.getTime() - updatedAt.getTime()) / 86400000;
    const group = diff < 1 ? t("chat.today") : diff < 2 ? t("chat.yesterday") : t("chat.thisWeek");
    if (!acc[group]) acc[group] = [];
    acc[group]!.push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-6 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <div className="w-72 bg-card border-e border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <button
            onClick={() => {
              createConv({ title: t("chat.newConversation"), type: "query" } as Parameters<typeof createConv>[0]);
              setGenerationResult(null);
              setPhases([]);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} />
            {t("chat.newConversation")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {!conversations.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">{t("chat.noConversations")}</p>
          ) : (
            Object.entries(groupedConvs).map(([group, convs]) => (
              <div key={group}>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">{group}</p>
                {convs.map(conv => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 group transition-colors ${selectedConvId === conv.id ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"}`}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setGenerationResult(null);
                      setPhases([]);
                    }}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="text-xs truncate flex-1">{conv.title}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteConv({ id: conv.id.toString() } as Parameters<typeof deleteConv>[0]); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground">
              {selectedConvId ? conversations.find(c => c.id === selectedConvId)?.title : t("chat.title")}
            </h2>
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["beginner", "expert"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setChatMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${chatMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {mode === "beginner" ? t("chat.beginner") : t("chat.expert")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    onClick={() => {
                      createConv({ title: s, type: "query" } as Parameters<typeof createConv>[0]);
                    }}
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
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex ${msg.role === "user" ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
                >
                  <div className={`max-w-[75%] ${msg.role === "user"
                    ? "bg-accent text-white rounded-2xl rounded-te-sm"
                    : "bg-card border border-border text-foreground rounded-2xl rounded-ts-sm"
                  } px-4 py-3 text-sm`}>
                    {msg.role === "assistant" && msg.modelUsed && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        {msg.modelUsed}
                      </div>
                    )}
                    {msg.role === "assistant"
                      ? <MessageContent content={msg.content} isRTL={isRTL} />
                      : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    }
                    <span className="text-xs opacity-50 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Live Phase Progress Bar */}
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
                    <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-accent" />
                      <span className="text-xs text-muted-foreground">{isRTL ? "جاري المعالجة..." : "Processing..."}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quality Report after generation */}
              <AnimatePresence>
                {generationResult && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isRTL ? "justify-end" : "justify-start"}`}
                  >
                    <QualityReport
                      result={generationResult}
                      isRTL={isRTL}
                      onSendToN8n={handleSendToN8n}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={selectedConvId
                ? (isRTL ? t("chat.placeholder") : "Ask about n8n or request a workflow...")
                : (isRTL ? "اختر أو أنشئ محادثة أولاً" : "Select or create a conversation first")}
              disabled={!selectedConvId || sending}
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 max-h-36"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || !selectedConvId}
              className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
