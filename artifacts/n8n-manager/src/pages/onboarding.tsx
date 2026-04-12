import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";

type Status = "idle" | "testing" | "ok" | "fail";

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [, navigate] = useLocation();
  const isRTL = language === "ar";

  const [step, setStep] = useState(1);
  const [n8nUrl, setN8nUrl] = useState("");
  const [n8nKey, setN8nKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [n8nStatus, setN8nStatus] = useState<Status>("idle");
  const [n8nResult, setN8nResult] = useState<string>("");
  const [openaiStatus, setOpenaiStatus] = useState<Status>("idle");
  const [geminiStatus, setGeminiStatus] = useState<Status>("idle");
  const [completing, setCompleting] = useState(false);

  const testN8n = async () => {
    if (!n8nUrl || !n8nKey) return;
    setN8nStatus("testing");
    try {
      const res = await apiRequest<{ success: boolean; data?: { connected: boolean; version?: string; workflowsCount?: number; message?: string } }>("/settings/n8n/test", {
        method: "POST",
        body: JSON.stringify({ url: n8nUrl, apiKey: n8nKey }),
      });
      if (res.data?.connected) {
        setN8nStatus("ok");
        setN8nResult(`${isRTL ? "الإصدار" : "Version"}: ${res.data.version ?? "?"} | ${res.data.workflowsCount ?? 0} ${isRTL ? "مسارات" : "workflows"}`);
      } else {
        setN8nStatus("fail");
        setN8nResult(res.data?.message ?? "Connection failed");
      }
    } catch {
      setN8nStatus("fail");
    }
  };

  const testOpenAI = async () => {
    if (!openaiKey) return;
    setOpenaiStatus("testing");
    try {
      const res = await apiRequest<{ success: boolean; data?: { valid: boolean; message?: string } }>("/settings/openai/test", {
        method: "POST",
        body: JSON.stringify({ apiKey: openaiKey }),
      });
      setOpenaiStatus(res.data?.valid ? "ok" : "fail");
    } catch {
      setOpenaiStatus("fail");
    }
  };

  const testGemini = async () => {
    if (!geminiKey) return;
    setGeminiStatus("testing");
    try {
      const res = await apiRequest<{ success: boolean; data?: { valid: boolean } }>("/settings/gemini/test", {
        method: "POST",
        body: JSON.stringify({ apiKey: geminiKey }),
      });
      setGeminiStatus(res.data?.valid ? "ok" : "fail");
    } catch {
      setGeminiStatus("fail");
    }
  };

  const saveAndNext = async () => {
    if (step === 1) {
      if (n8nStatus === "ok") {
        await apiRequest("/settings/n8n", { method: "PUT", body: JSON.stringify({ url: n8nUrl, apiKey: n8nKey }) });
      }
      setStep(2);
    } else if (step === 2) {
      if (openaiStatus === "ok") {
        await apiRequest("/settings/openai", { method: "PUT", body: JSON.stringify({ apiKey: openaiKey }) });
      }
      setStep(3);
    } else {
      if (geminiStatus === "ok") {
        await apiRequest("/settings/gemini", { method: "PUT", body: JSON.stringify({ apiKey: geminiKey }) });
      }
      await finish();
    }
  };

  const finish = async () => {
    setCompleting(true);
    try {
      await apiRequest("/settings/onboarding-complete", { method: "POST" });
    } catch {}
    navigate("/");
  };

  const steps = [
    { num: 1, label: t("onboarding.step1") },
    { num: 2, label: t("onboarding.step2") },
    { num: 3, label: t("onboarding.step3") },
  ];

  const StatusIcon = ({ status }: { status: Status }) => {
    if (status === "testing") return <Loader2 size={18} className="animate-spin text-accent" />;
    if (status === "ok") return <CheckCircle size={18} className="text-emerald-500" />;
    if (status === "fail") return <XCircle size={18} className="text-destructive" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 to-accent-secondary/5 flex items-center justify-center p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">N8</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("onboarding.title")}</h1>
        </div>

        <div className="flex items-center justify-center mb-8 gap-3">
          {steps.map(({ num, label }) => (
            <div key={num} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= num ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {step > num ? <CheckCircle size={16} /> : num}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{label}</span>
              </div>
              {num < 3 && <div className={`h-px w-12 ${step > num ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-sm"
        >
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t("onboarding.step1")}</h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t("onboarding.n8nUrl")}</label>
                <input
                  value={n8nUrl}
                  onChange={e => setN8nUrl(e.target.value)}
                  placeholder="http://localhost:5678"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t("onboarding.n8nApiKey")}</label>
                <input
                  type="password"
                  value={n8nKey}
                  onChange={e => setN8nKey(e.target.value)}
                  placeholder="n8n_api_..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={testN8n} disabled={!n8nUrl || !n8nKey || n8nStatus === "testing"} className="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors text-sm disabled:opacity-50">
                  {n8nStatus === "testing" ? t("onboarding.testing") : t("onboarding.testConnection")}
                </button>
                <StatusIcon status={n8nStatus} />
                {n8nResult && <span className="text-xs text-muted-foreground">{n8nResult}</span>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t("onboarding.step2")}</h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t("onboarding.openaiKey")}</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={testOpenAI} disabled={!openaiKey || openaiStatus === "testing"} className="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors text-sm disabled:opacity-50">
                  {openaiStatus === "testing" ? t("onboarding.testing") : t("onboarding.testConnection")}
                </button>
                <StatusIcon status={openaiStatus} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t("onboarding.step3")}</h2>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">{t("onboarding.geminiKey")}</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={testGemini} disabled={!geminiKey || geminiStatus === "testing"} className="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors text-sm disabled:opacity-50">
                  {geminiStatus === "testing" ? t("onboarding.testing") : t("onboarding.testConnection")}
                </button>
                <StatusIcon status={geminiStatus} />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={finish}
              disabled={completing}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("onboarding.skip")}
            </button>
            <button
              onClick={saveAndNext}
              disabled={completing}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors text-sm disabled:opacity-60"
            >
              {step < 3 ? t("onboarding.next") : (completing ? "..." : t("onboarding.finish"))}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
