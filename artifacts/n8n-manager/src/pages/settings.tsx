import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, TestTube2 } from "lucide-react";
import { useGetN8nSettings, useTestN8nConnection, useSaveN8nSettings, useSaveOpenAiKey, useTestOpenAI, useSaveGeminiKey, useTestGemini, useChangePassword, useGetSystemStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/api";
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
            <h2 className="text-sm font-semibold text-foreground mb-1">{t("settings.n8n")}</h2>
            {n8nData?.url && <p className="text-xs text-muted-foreground mb-4">{isRTL ? "متصل حالياً:" : "Currently connected:"} {n8nData.url}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("settings.url")}</label>
                <input value={n8nUrl} onChange={e => setN8nUrl(e.target.value)} placeholder={n8nData?.url ?? "http://localhost:5678"} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t("settings.apiKey")}</label>
                <div className="relative">
                  <input
                    type={showN8nKey ? "text" : "password"}
                    value={n8nKey}
                    onChange={e => setN8nKey(e.target.value)}
                    placeholder={n8nData?.hasApiKey ? "••••••••••••" : "n8n_api_..."}
                    className="w-full px-3 py-2 pe-10 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <button type="button" onClick={() => setShowN8nKey(!showN8nKey)} className="absolute inset-y-0 end-3 text-muted-foreground">
                    {showN8nKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setN8nStatus("testing"); testN8n({ url: n8nUrl, apiKey: n8nKey } as Parameters<typeof testN8n>[0]); }} disabled={!n8nUrl || !n8nKey} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-50">
                  {t("settings.test")}
                </button>
                <StatusIcon status={n8nStatus} />
                <button onClick={() => saveN8n({ url: n8nUrl, apiKey: n8nKey } as Parameters<typeof saveN8n>[0])} disabled={!n8nUrl || !n8nKey} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {t("app.save")}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4">{t("settings.openai")}</h2>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showOpenai ? "text" : "password"}
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pe-10 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button type="button" onClick={() => setShowOpenai(!showOpenai)} className="absolute inset-y-0 end-3 text-muted-foreground">
                  {showOpenai ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setOpenaiStatus("testing"); testOai({ apiKey: openaiKey } as Parameters<typeof testOai>[0]); }} disabled={!openaiKey} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-50">
                  {t("settings.test")}
                </button>
                <StatusIcon status={openaiStatus} />
                <button onClick={() => saveOai({ apiKey: openaiKey } as Parameters<typeof saveOai>[0])} disabled={!openaiKey} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {t("app.save")}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4">{t("settings.gemini")}</h2>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showGemini ? "text" : "password"}
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 pe-10 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button type="button" onClick={() => setShowGemini(!showGemini)} className="absolute inset-y-0 end-3 text-muted-foreground">
                  {showGemini ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setGeminiStatus("testing"); testGem({ apiKey: geminiKey } as Parameters<typeof testGem>[0]); }} disabled={!geminiKey} className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-50">
                  {t("settings.test")}
                </button>
                <StatusIcon status={geminiStatus} />
                <button onClick={() => saveGem({ apiKey: geminiKey } as Parameters<typeof saveGem>[0])} disabled={!geminiKey} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {t("app.save")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
