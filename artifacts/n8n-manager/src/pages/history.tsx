import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, MessageSquare, Trash2, Download, FileJson, Printer, RotateCcw, ChevronRight } from "lucide-react";
import { useGetConversations, useGetConversation, useDeleteConversation, getGetConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: number;
  title: string;
  type: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: string;
  content: string;
  createdAt: string;
  modelUsed?: string;
}

const TYPE_ICONS: Record<string, string> = {
  create: "🟢",
  edit: "🔵",
  diagnose: "🔴",
  query: "🟡",
};

export default function HistoryPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data: convRes, isLoading } = useGetConversations({
    request: { headers: authHeader },
    query: { queryKey: getGetConversationsQueryKey() },
  } as Parameters<typeof useGetConversations>[0]);

  const { data: detailRes } = useGetConversation(
    selectedId?.toString() ?? "0",
    {
      request: { headers: authHeader },
      query: { enabled: !!selectedId, queryKey: selectedId ? getGetConversationQueryKey(selectedId.toString()) : [] },
    } as Parameters<typeof useGetConversation>[1],
  );

  const { mutate: deleteConv } = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setSelectedId(null);
        toast({ title: isRTL ? "تم حذف المحادثة" : "Conversation deleted" });
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useDeleteConversation>[0]);

  const conversations: Conversation[] = ((convRes as { data?: { conversations?: unknown[] } } | undefined)?.data?.conversations ?? []) as Conversation[];
  const detail = detailRes as { data?: { conversation?: Conversation; messages?: unknown[] } } | undefined;
  const messages = detail?.data?.messages as Message[] | undefined;
  const selectedConv = detail?.data?.conversation as Conversation | undefined;

  const filtered = conversations.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, conv) => {
    const now = new Date();
    const updatedAt = new Date(conv.updatedAt);
    const diff = (now.getTime() - updatedAt.getTime()) / 86400000;
    const group = diff < 1 ? t("history.today") : diff < 2 ? t("history.yesterday") : diff < 7 ? t("history.thisWeek") : t("history.older");
    if (!acc[group]) acc[group] = [];
    acc[group].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

  const exportAsJSON = () => {
    if (!selectedConv || !messages) return;
    const exportData = {
      conversation: {
        id: selectedConv.id,
        title: selectedConv.title,
        type: selectedConv.type,
        createdAt: selectedConv.createdAt,
        updatedAt: selectedConv.updatedAt,
      },
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        model: m.modelUsed,
        timestamp: m.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${selectedConv.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    toast({ title: isRTL ? "تم تصدير المحادثة كـ JSON ✅" : "Conversation exported as JSON ✅" });
  };

  const exportAsPDF = () => {
    if (!selectedConv || !messages) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const dir = isRTL ? "rtl" : "ltr";
    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? "ar" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${selectedConv.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; direction: ${dir}; color: #1a1a1a; }
    h1 { font-size: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
    .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
    .msg { margin-bottom: 16px; }
    .msg-role { font-size: 11px; font-weight: bold; color: #6366f1; margin-bottom: 4px; }
    .msg-content { background: #f4f4f8; padding: 12px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; line-height: 1.5; }
    .msg-content.user { background: #ede9fe; }
    .msg-time { font-size: 10px; color: #999; margin-top: 4px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>${selectedConv.title}</h1>
  <div class="meta">
    ${isRTL ? "النوع" : "Type"}: ${selectedConv.type} &nbsp;|&nbsp;
    ${isRTL ? "الرسائل" : "Messages"}: ${messages.length} &nbsp;|&nbsp;
    ${isRTL ? "التاريخ" : "Date"}: ${new Date(selectedConv.createdAt).toLocaleString()}
  </div>
  ${messages.map(m => `
    <div class="msg">
      <div class="msg-role">${m.role === "user" ? (isRTL ? "المستخدم" : "User") : (isRTL ? "الوكيل" : "Agent")}</div>
      <div class="msg-content ${m.role}">${m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      <div class="msg-time">${new Date(m.createdAt).toLocaleString()}</div>
    </div>
  `).join("")}
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    setShowExportMenu(false);
    toast({ title: isRTL ? "جاري فتح نافذة الطباعة..." : "Opening print dialog..." });
  };

  const replayRequest = () => {
    if (!messages) return;
    const firstUserMsg = messages.find(m => m.role === "user");
    if (firstUserMsg) {
      sessionStorage.setItem("chatReplay", firstUserMsg.content);
      navigate("/chat");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 gap-0 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Left column — conversation list */}
      <div className="w-80 bg-card border-e border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("history.search")}
              className="w-full ps-9 pe-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : !filtered.length ? (
            <div className="text-center py-8">
              <MessageSquare size={32} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{t("history.noHistory")}</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, convs]) => (
              <div key={group}>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">{group}</p>
                {convs.map(conv => (
                  <motion.div
                    key={conv.id}
                    whileHover={{ x: isRTL ? -2 : 2 }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 group transition-colors ${selectedId === conv.id ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"}`}
                    onClick={() => setSelectedId(conv.id)}
                  >
                    <span className="text-sm shrink-0">{TYPE_ICONS[conv.type] ?? "💬"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate font-medium">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">{conv.messageCount} {isRTL ? "رسائل" : "messages"}</p>
                    </div>
                    <ChevronRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Stats bar */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{conversations.length} {isRTL ? "محادثة" : "conversations"}</span>
              <span>{conversations.filter(c => c.type === "create").length} {isRTL ? "إنشاء" : "creations"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right column — conversation detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {isRTL ? "اختر محادثة" : "Select a conversation"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? "سيظهر هنا سجل المحادثة الكامل" : "The full conversation history will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground truncate">{selectedConv?.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {TYPE_ICONS[selectedConv?.type ?? "query"]} {selectedConv?.type} &nbsp;·&nbsp;
                  {messages?.length ?? 0} {isRTL ? "رسائل" : "messages"} &nbsp;·&nbsp;
                  {selectedConv ? new Date(selectedConv.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {/* Replay request button */}
                <button
                  onClick={replayRequest}
                  title={isRTL ? "إعادة الطلب" : "Replay request"}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw size={15} />
                </button>

                {/* Export dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(v => !v)}
                    title={isRTL ? "تصدير" : "Export"}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Download size={15} />
                  </button>
                  {showExportMenu && (
                    <div className={`absolute top-10 ${isRTL ? "left-0" : "right-0"} bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden min-w-[160px]`}>
                      <button
                        onClick={exportAsJSON}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                      >
                        <FileJson size={14} className="text-accent" />
                        {isRTL ? "تصدير JSON" : "Export JSON"}
                      </button>
                      <button
                        onClick={exportAsPDF}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                      >
                        <Printer size={14} className="text-accent" />
                        {isRTL ? "طباعة / PDF" : "Print / PDF"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteConv({ id: selectedId.toString() } as Parameters<typeof deleteConv>[0])}
                  title={isRTL ? "حذف المحادثة" : "Delete conversation"}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!messages?.length ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
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
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-accent text-white"
                        : "bg-card border border-border text-foreground"
                    }`}>
                      {msg.role === "assistant" && (
                        <p className="text-xs font-medium text-accent mb-1.5">
                          🤖 {msg.modelUsed ?? "AI"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                      <span className="text-xs opacity-40 mt-1.5 block">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
