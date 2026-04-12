import { useState, useRef } from "react";
import { motion, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAppStore } from "@/stores/useAppStore";
import { apiRequest, API_BASE } from "@/lib/api";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
  const { language, theme, toggleLanguage, toggleTheme } = useAppStore();
  const [, navigate] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const shakeCard = () => {
    if (cardRef.current) {
      animate(cardRef.current, { x: [0, -12, 12, -8, 8, -4, 4, 0] }, { duration: 0.5 });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t("auth.invalidCredentials"));
      shakeCard();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiRequest<{
        success: boolean;
        data?: {
          accessToken: string;
          user: {
            id: number;
            username: string;
            role: string;
            isActive: boolean;
            forcePasswordChange: boolean;
            permissions: Array<{ key: string; isEnabled: boolean }>;
          };
          requiresPasswordChange?: boolean;
          requiresOnboarding?: boolean;
        };
        error?: { message: string };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (res.success && res.data) {
        setAuth(res.data.user as Parameters<typeof setAuth>[0], res.data.accessToken);
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");

        if (res.data.requiresOnboarding) {
          navigate("/onboarding");
        } else if (res.data.requiresPasswordChange) {
          navigate("/change-password");
        } else {
          navigate("/");
        }
      } else {
        setError(res.error?.message ?? t("auth.invalidCredentials"));
        shakeCard();
      }
    } catch {
      setError(t("auth.invalidCredentials"));
      shakeCard();
    } finally {
      setLoading(false);
    }
  };

  const isRTL = language === "ar";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10 bg-white"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 60 - 30],
              y: [0, Math.random() * 60 - 30],
            }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="absolute top-4 end-4 flex gap-2">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          {language === "ar" ? "EN" : "عر"}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">N8</span>
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-foreground">{t("app.title")}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "ar" ? "مرحباً بك في نظام إدارة مسارات العمل" : "Welcome to your workflow management system"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("auth.username")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder={language === "ar" ? "اسم المستخدم" : "Username"}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors pe-12"
                    placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {language === "ar" ? "جاري الدخول..." : "Signing in..."}
                  </span>
                ) : t("auth.loginBtn")}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              {language === "ar"
                ? "المدير الافتراضي: مدير / Admin@2024"
                : "Default admin: مدير / Admin@2024"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
