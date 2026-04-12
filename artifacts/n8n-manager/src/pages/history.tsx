import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, MessageSquare, ArrowRight, Trash2, Download } from "lucide-react";
import { useGetConversations, useGetConversation, useDeleteConversation, getGetConversationsQueryKey, getGetConversationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";

interface Conversation {
  id: number;
  title: string;
  type: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const authHeader = getAuthHeader();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
      },
    },
    request: { headers: authHeader },
  } as Parameters<typeof useDeleteConversation>[0]);

  const conversations: Conversation[] = ((convRes as { data?: { conversations?: unknown[] } } | undefined)?.data?.conversations ?? []) as Conversation[];
  const detail = detailRes as { data?: { conversation?: Conversation; messages?: unknown[] } } | undefined;
  const messages = detail?.data?.messages as Array<{ id: number; role: string; content: string; createdAt: string }> | undefined;

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

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 gap-0 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
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
            <p className="text-xs text-muted-foreground text-center py-8">{t("history.noHistory")}</p>
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
                    <MessageSquare size={14} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">{conv.messageCount} {isRTL ? "رسائل" : "messages"}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{isRTL ? "اختر محادثة لعرض التفاصيل" : "Select a conversation to view details"}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{detail?.data?.conversation?.title}</h2>
                <p className="text-xs text-muted-foreground">{messages?.length ?? 0} {isRTL ? "رسائل" : "messages"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteConv({ id: selectedId.toString() } as Parameters<typeof deleteConv>[0])}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages?.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex ${msg.role === "user" ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
                >
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-accent text-white" : "bg-card border border-border text-foreground"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <span className="text-xs opacity-50 mt-1 block">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
