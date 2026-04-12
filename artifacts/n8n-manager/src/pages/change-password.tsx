import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAppStore } from "@/stores/useAppStore";
import { getAuthHeader } from "@/lib/api";
import { API_BASE } from "@/lib/api";

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["ضعيفة جداً", "ضعيفة", "متوسطة", "قوية"];
  const enLabels = ["Very Weak", "Weak", "Medium", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-500" : "text-green-500"}`}>
        {labels[score - 1] || ""} {enLabels[score - 1] ? `(${enLabels[score - 1]})` : ""}
      </p>
    </div>
  );
}

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { user, setAuth, token } = useAuthStore();
  const { language } = useAppStore();
  const [, setLocation] = useLocation();
  const isRTL = language === "ar";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isForcedChange = user?.forcePasswordChange === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(isRTL ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError(isRTL ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError(isRTL ? "كلمة المرور يجب أن تحتوي على حرف كبير" : "Password must contain an uppercase letter");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError(isRTL ? "كلمة المرور يجب أن تحتوي على حرف صغير" : "Password must contain a lowercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError(isRTL ? "كلمة المرور يجب أن تحتوي على رقم" : "Password must contain a number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { success: boolean; error?: { message: string }; data?: { user?: { forcePasswordChange?: boolean } } };

      if (!data.success) {
        setError(data.error?.message || (isRTL ? "فشل تغيير كلمة المرور" : "Failed to change password"));
        return;
      }

      if (user && token) {
        setAuth({ ...user, forcePasswordChange: false }, token);
      }
      setSuccess(true);
      setTimeout(() => setLocation("/"), 1500);
    } catch {
      setError(isRTL ? "خطأ في الاتصال بالخادم" : "Connection error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-4"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center border-b border-border">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
            >
              <ShieldCheck className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground font-arabic">
              {isRTL ? "تغيير كلمة المرور" : "Change Password"}
            </h1>
            {isForcedChange && (
              <p className="text-sm text-muted-foreground mt-2">
                {isRTL
                  ? "يجب عليك تغيير كلمة المرور قبل المتابعة"
                  : "You must change your password before continuing"}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                {isRTL ? "كلمة المرور الحالية" : "Current Password"}
              </label>
              <div className="relative">
                <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-muted-foreground`} />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={`w-full h-10 ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                  placeholder={isRTL ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-muted-foreground hover:text-foreground`}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                {isRTL ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <div className="relative">
                <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-muted-foreground`} />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`w-full h-10 ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                  placeholder={isRTL ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-muted-foreground hover:text-foreground`}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={newPassword} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>
              <div className="relative">
                <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-muted-foreground`} />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full h-10 ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                  placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Re-enter new password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} text-muted-foreground hover:text-foreground`}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 font-arabic"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-green-500/10 text-green-600 text-sm rounded-lg border border-green-500/20 font-arabic"
              >
                {isRTL ? "✓ تم تغيير كلمة المرور بنجاح، جاري التحويل..." : "✓ Password changed successfully, redirecting..."}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 font-arabic"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {isRTL ? "تغيير كلمة المرور" : "Change Password"}
            </button>

            {!isForcedChange && (
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="w-full h-10 text-muted-foreground text-sm hover:text-foreground transition-colors font-arabic"
              >
                {isRTL ? "← العودة" : "← Back"}
              </button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
