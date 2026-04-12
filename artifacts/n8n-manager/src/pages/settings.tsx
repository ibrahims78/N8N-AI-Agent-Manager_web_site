import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, TestTube2, AlertTriangle, Trash2, RotateCcw, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader, API_BASE } from "@/lib/api";
import { useGetN8nSettings, useTestN8nConnection, useSaveN8nSettings, useSaveOpenAiKey, useTestOpenAI, useSaveGeminiKey, useTestGemini, useChangePassword, useGetSystemStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";

type TestStatus = "idle" | "testing" | "valid" | "invalid" | "low-balance";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const { user } = useAuthStore();
  const isRTL = language === "ar";
  const authHeader = getAuthHeader();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const [dangerAction, setDangerAction] = useState<"conversations" | "versions" | "factory" | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState("");
  const [dangerLoading, setDangerLoading] = useState(false);

  const DANGER_CONFIRM_WORD = isRTL ? "احذف" : "DELETE";

  const executeDangerAction = async () => {
    if (dangerConfirmText !== DANGER_CONFIRM_WORD) return;
    setDangerLoading(true);

    const headers: Record<string, string> = { ...authHeader, "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let url = "";
    let method = "DELETE";

    if (dangerAction === "conversations") url = `${API_BASE}/settings/danger/conversations`;
    else if (dangerAction === "versions") url = `${API_BASE}/settings/danger/versions`;
    else if (dangerAction === "factory") { url = `${API_BASE}/settings/danger/factory-reset`; method = "POST"; }

    try {
      const res = await fetch(url, { method, headers });
      const data = await res.json() as { success: boolean; message?: string; error?: { message: string } };
      if (data.success) {
        toast({ title: isRTL ? "تم تنفيذ العملية بنجاح ✅" : "Operation completed successfully ✅" });
        queryClient.invalidateQueries();
        if (dangerAction === "factory") {
          setTimeout(() => { window.location.href = "/"; }, 1500);
        }
      } else {
        toast({ title: data.error?.message ?? "Error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    } finally {
      setDangerLoading(false);
      setDangerAction(null);
      setDangerConfirmText("");
    }
  };

  const [n8nUrl, setN8nUrl] = useState("");
  const [n8nKey, setN8nKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showN8nKey, setShowN8nKey] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<TestStatus>("idle");
  const [openaiStatus, setOpenaiStatus] = useState<TestStatus>("idle");
  const [geminiStatus, setGeminiStatus] = useState<TestStatus>("idle");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: n8nSettings } = useGetN8nSettings({
    request: { headers: authHeader },
  } as Parameters<typeof useGetN8nSettings>[0]);

  const { data: systemStatusData } = useGetSystemStatus({
    request: { headers: authHeader },
  } as Parameters<typeof useGetSystemStatus>[0]);

  const systemServices = (systemStatusData as { data?: { services?: Array<{ name: string; status: string }> } } | undefined)?.data?.services ?? [];
  const openaiSaved = systemServices.find(s => s.name === "openai")?.status === "ok";
  const geminiSaved = systemServices.find(s => s.name === "gemini")?.status === "ok";

  useEffect(() => {
    const url = (n8nSettings as { data?: { url?: string } } | undefined)?.data?.url;
    if (url && !n8nUrl) {
      setN8nUrl(url);
    }
  }, [n8nSettings]);

  const { mutate: testN8n } = useTestN8nConnection({
    mutation: {
      onSuccess: (data) => {
        const d = (data as { data?: { connected?: boolean } })?.data;
        setN8nStatus(d?.connected ? "valid" : "invalid");
      },
      onError: () => setN8nStatus("invalid"),
    },
    request: { headers: authHeader },
  } as Parameters<typeof useTestN8nConnection>[0]);

  const { mutate: saveN8n } = useSaveN8nSettings({
    mutation: { onSuccess: () => queryClient.invalidateQueries() },
    request: { headers: authHeader },
  } as Parameters<typeof useSaveN8nSettings>[0]);

  const { mutate: testOai } = useTestOpenAI({
    mutation: {
      onSuccess: (data) => {
        const d = (data as { data?: { valid?: boolean } })?.data;
        setOpenaiStatus(d?.valid ? "valid" : "invalid");
      },
      onError: () => setOpenaiStatus("invalid"),
    },
    request: { headers: authHeader },
  } as Parameters<typeof useTestOpenAI>[0]);

  const { mutate: saveOai } = useSaveOpenAiKey({
    request: { headers: authHeader },
  } as Parameters<typeof useSaveOpenAiKey>[0]);

  const { mutate: testGem } = useTestGemini({
    mutation: {
      onSuccess: (data) => {
        const d = (data as { data?: { valid?: boolean } })?.data;
        setGeminiStatus(d?.valid ? "valid" : "invalid");
      },
      onError: () => setGeminiStatus("invalid"),
    },
    request: { headers: authHeader },
  } as Parameters<typeof useTestGemini>[0]);

  const { mutate: saveGem } = useSaveGeminiKey({
    request: { headers: authHeader },
  } as Parameters<typeof useSaveGeminiKey>[0]);

  const { mutate: changePwd } = useChangePassword({
    mutation: {
      onSuccess: () => setPwdMsg({ type: "ok", text: t("auth.changePassword") + " ✓" }),
      onError: () => setPwdMsg({ type: "err", text: isRTL ? "حدث خطأ" : "Error occurred" }),
    },
    request: { headers: authHeader },
  } as Parameters<typeof useChangePassword>[0]);

  const handleChangePassword = () => {
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "err", text: t("auth.passwordMismatch") });
      return;
    }
    changePwd({ currentPassword: currentPwd, newPassword: newPwd } as Parameters<typeof changePwd>[0]);
  };

  const StatusIcon = ({ status }: { status: TestStatus }) => {
    if (status === "testing") return <Loader2 size={16} className="animate-spin text-accent" />;
    if (status === "valid") return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (status === "invalid") return <XCircle size={16} className="text-destructive" />;
    return null;
  };

  const n8nData = (n8nSettings as { data?: { url?: string; hasApiKey?: boolean } } | undefined)?.data;

  return (
    <div className="space-y-6 max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t("settings.password")}</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">{t("auth.currentPassword")}</label>
            <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">{t("auth.newPassword")}</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">{t("auth.confirmPassword")}</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          {pwdMsg && (
            <p className={`text-xs ${pwdMsg.type === "ok" ? "text-emerald-500" : "text-destructive"}`}>{pwdMsg.text}</p>
          )}
          <button onClick={handleChangePassword} className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent/90 transition-colors">
            {t("auth.updatePassword")}
          </button>
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-foreground">{t("settings.n8n")}</h2>
              {n8nData?.hasApiKey && (
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <KeyRound size={12} />
                  {isRTL ? "مفتاح محفوظ ✅" : "Key saved ✅"}
                </span>
              )}
            </div>
            {n8nData?.url && <p className="text-xs text-muted-foreground mb-4">{isRTL ? "متصل حالياً:" : "Currently connected:"} <span className="text-accent font-mono">{n8nData.url}</span></p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("settings.url")}</label>
                <input
                  value={n8nUrl}
                  onChange={e => setN8nUrl(e.target.value)}
                  placeholder="https://n8n.example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  {t("settings.apiKey")}
                  {n8nData?.hasApiKey && !n8nKey && (
                    <span className="ms-2 text-xs text-muted-foreground font-normal">{isRTL ? "(اتركه فارغاً للإبقاء على المفتاح الحالي)" : "(leave blank to keep current key)"}</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showN8nKey ? "text" : "password"}
                    value={n8nKey}
                    onChange={e => setN8nKey(e.target.value)}
                    placeholder={n8nData?.hasApiKey ? "••••••••••••  (محفوظ)" : "n8n_api_..."}
                    className="w-full px-3 py-2 pe-10 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <button type="button" onClick={() => setShowN8nKey(!showN8nKey)} className="absolute inset-y-0 end-3 text-muted-foreground">
                    {showN8nKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setN8nStatus("testing"); testN8n({ url: n8nUrl, apiKey: n8nKey } as Parameters<typeof testN8n>[0]); }}
                  disabled={!n8nUrl || (!n8nKey && !n8nData?.hasApiKey)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {t("settings.test")}
                </button>
                <StatusIcon status={n8nStatus} />
                <button
                  onClick={() => saveN8n({ url: n8nUrl, apiKey: n8nKey || "KEEP_EXISTING" } as Parameters<typeof saveN8n>[0])}
                  disabled={!n8nUrl}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {t("app.save")}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{t("settings.openai")}</h2>
              {openaiSaved && (
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <KeyRound size={12} />
                  {isRTL ? "مفتاح محفوظ ✅" : "Key saved ✅"}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showOpenai ? "text" : "password"}
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder={openaiSaved ? "••••••••••••  (محفوظ)" : "sk-..."}
                  className="w-full px-3 py-2 pe-10 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button type="button" onClick={() => setShowOpenai(!showOpenai)} className="absolute inset-y-0 end-3 text-muted-foreground">
                  {showOpenai ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setOpenaiStatus("testing"); testOai({ apiKey: openaiKey } as Parameters<typeof testOai>[0]); }}
                  disabled={!openaiKey}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {t("settings.test")}
                </button>
                <StatusIcon status={openaiStatus} />
                {openaiSaved && openaiStatus === "idle" && <CheckCircle2 size={16} className="text-emerald-500" />}
                <button
                  onClick={() => saveOai({ apiKey: openaiKey } as Parameters<typeof saveOai>[0])}
                  disabled={!openaiKey}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {t("app.save")}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{t("settings.gemini")}</h2>
              {geminiSaved && (
                <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <KeyRound size={12} />
                  {isRTL ? "مفتاح محفوظ ✅" : "Key saved ✅"}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showGemini ? "text" : "password"}
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder={geminiSaved ? "••••••••••••  (محفوظ)" : "AIza..."}
                  className="w-full px-3 py-2 pe-10 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button type="button" onClick={() => setShowGemini(!showGemini)} className="absolute inset-y-0 end-3 text-muted-foreground">
                  {showGemini ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setGeminiStatus("testing"); testGem({ apiKey: geminiKey } as Parameters<typeof testGem>[0]); }}
                  disabled={!geminiKey}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {t("settings.test")}
                </button>
                <StatusIcon status={geminiStatus} />
                {geminiSaved && geminiStatus === "idle" && <CheckCircle2 size={16} className="text-emerald-500" />}
                <button
                  onClick={() => saveGem({ apiKey: geminiKey } as Parameters<typeof saveGem>[0])}
                  disabled={!geminiKey}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {t("app.save")}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/5 rounded-xl p-5 border border-destructive/30"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-destructive" />
                <h2 className="text-sm font-semibold text-destructive">
                  {isRTL ? "منطقة الخطر" : "Danger Zone"}
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-destructive/10">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isRTL ? "حذف جميع المحادثات" : "Delete all conversations"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "يحذف جميع الرسائل والمحادثات نهائياً" : "Permanently deletes all messages and conversations"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDangerAction("conversations"); setDangerConfirmText(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-xs hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-destructive/10">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isRTL ? "حذف سجلات الإصدارات" : "Delete workflow versions"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "يحذف جميع إصدارات الـ workflows المحفوظة" : "Deletes all saved workflow version history"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDangerAction("versions"); setDangerConfirmText(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-xs hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    {isRTL ? "حذف" : "Delete"}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-bold text-destructive">
                      {isRTL ? "إعادة الضبط الكاملة" : "Factory Reset"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "يمسح كل البيانات والإعدادات — لا يمكن التراجع!" : "Wipes all data and settings — irreversible!"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDangerAction("factory"); setDangerConfirmText(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs hover:bg-destructive/90 transition-colors"
                  >
                    <RotateCcw size={12} />
                    {isRTL ? "إعادة الضبط" : "Reset"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Danger Confirmation Modal */}
          <AnimatePresence>
            {dangerAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                onClick={() => { setDangerAction(null); setDangerConfirmText(""); }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-card border border-destructive/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {isRTL ? "تأكيد العملية الخطرة" : "Confirm Dangerous Action"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? "هذا الإجراء لا يمكن التراجع عنه" : "This action cannot be undone"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {isRTL
                      ? `اكتب "${DANGER_CONFIRM_WORD}" للتأكيد`
                      : `Type "${DANGER_CONFIRM_WORD}" to confirm`}
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={dangerConfirmText}
                    onChange={e => setDangerConfirmText(e.target.value)}
                    placeholder={DANGER_CONFIRM_WORD}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-destructive/40 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 mb-3"
                    onKeyDown={e => { if (e.key === "Enter") executeDangerAction(); }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDangerAction(null); setDangerConfirmText(""); }}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                    >
                      {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      onClick={executeDangerAction}
                      disabled={dangerConfirmText !== DANGER_CONFIRM_WORD || dangerLoading}
                      className="flex-1 px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {dangerLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      {isRTL ? "تأكيد" : "Confirm"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
