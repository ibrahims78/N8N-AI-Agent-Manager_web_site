import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Send, Plus, Trash2, MessageSquare, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useGetConversations, useCreateConversation, useGetConversation, useDeleteConversation, useSendMessage, getGetConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";

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

export default function ChatPage() {
  const { t } = useTranslation();
  const { language, chatMode, setChatMode } = useAppStore();
  const { user } = useAuthStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const { data: convRes } = useGetConversations({
    request: { headers: authHeader },
    query: { queryKey: getGetConversationsQueryKey(), refetchInterval: 10000 },
  } as Parameters<typeof useGetConversations>[0]);

  const { data: convDetail } = useGetConversation(
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
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useDeleteConversation>[0]);

  const { mutate: sendMessage } = useSendMessage({
    mutation: {
      onSuccess: () => {
        if (selectedConvId) {
          queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(selectedConvId.toString()) });
          queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        }
        setSending(false);
      },
      onError: () => setSending(false),
    },
    request: { headers: authHeader },
  } as Parameters<typeof useSendMessage>[0]);

  const conversations: Conversation[] = ((convRes as { data?: { conversations?: unknown[] } } | undefined)?.data?.conversations ?? []) as Conversation[];
  const detail = convDetail as { data?: { conversation?: Conversation; messages?: Message[] } } | undefined;
  const messages: Message[] = detail?.data?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sending || !selectedConvId) return;
    setSending(true);
    sendMessage({ id: selectedConvId.toString(), content: input, mode: chatMode } as Parameters<typeof sendMessage>[0]);
    setInput("");
  };

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
    acc[group].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-6 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`w-72 bg-card border-e border-border flex flex-col shrink-0`}>
        <div className="p-3 border-b border-border">
          <button
            onClick={() => createConv({ title: t("chat.newConversation"), type: "query" } as Parameters<typeof createConv>[0])}
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
                    onClick={() => setSelectedConvId(conv.id)}
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
          ) : !messages.length ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">{isRTL ? "اكتب رسالتك لبدء المحادثة" : "Type a message to start the conversation"}</p>
            </div>
          ) : (
            messages.map((msg, i) => (
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
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))
          )}

          {sending && (
            <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-accent" />
                <span className="text-xs text-muted-foreground">{isRTL ? "جاري المعالجة..." : "Processing..."}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={selectedConvId ? t("chat.placeholder") : (isRTL ? "اختر أو أنشئ محادثة أولاً" : "Select or create a conversation first")}
              disabled={!selectedConvId || sending}
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 max-h-36"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || !selectedConvId}
              className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
