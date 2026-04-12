import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, AreaChart, Area,
} from "recharts";
import {
  RefreshCw, TrendingUp, TrendingDown, Activity, CheckCircle2,
  XCircle, Clock, AlertTriangle, Info, Bell, Zap, MessageSquare,
  ChevronRight, ChevronLeft, X, Workflow,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { getAuthHeader, API_BASE } from "@/lib/api";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// ─── Types ─────────────────────────────────────────────────────────
interface Stats {
  totalWorkflows: number; activeWorkflows: number; todayExecutions: number;
  successRate: number; avgExecutionTime: number; n8nConnected: boolean;
  todayExecutionsChange: number; successRateChange: number;
}

interface ChartPoint { date: string; successful: number; failed: number; avgDuration: number; }
interface Execution { id: string; workflowId?: string; status: string; startedAt: string; stoppedAt?: string; workflowName?: string; }
interface TopWorkflow { id: string; name: string; executionCount: number; successRate: number; }
interface Alert { id: string; severity: "high" | "medium" | "info"; workflowId?: string; workflowName?: string; message: string; messageEn: string; }
interface HeatmapPoint { date: string; count: number; successRate: number; }

// ─── Sparkline ──────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={pts} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#sg-${color})`} strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────
function KpiCard({ title, value, change, icon: Icon, color, sparkData, sparkColor }: {
  title: string; value: string | number; change?: number; icon: React.ElementType;
  color: string; sparkData?: number[]; sparkColor: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
              {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{change > 0 ? "+" : ""}{change}%</span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color} shrink-0`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl p-4 border border-border animate-pulse">
      <div className="h-3 bg-muted rounded w-20 mb-3" /><div className="h-7 bg-muted rounded w-14 mb-2" />
      <div className="h-3 bg-muted rounded w-10 mb-3" /><div className="h-10 bg-muted/50 rounded" />
    </div>
  );
}

// ─── Heatmap ────────────────────────────────────────────────────────
function ActivityHeatmap({ data }: { data: HeatmapPoint[] }) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState<{ date: string; count: number; rate: number } | null>(null);
  const year = new Date().getFullYear();
  const jan1 = new Date(year, 0, 1);
  const startOffset = jan1.getDay();
  const total = 371;
  const map = new Map(data.map(d => [d.date, d]));

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/40";
    if (count < 5) return "bg-emerald-200 dark:bg-emerald-900";
    if (count < 15) return "bg-emerald-400 dark:bg-emerald-700";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.activityHeatmap")}</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {Array.from({ length: 53 }, (_, week) => (
            <div key={week} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }, (_, day) => {
                const idx = week * 7 + day - startOffset;
                if (idx < 0 || idx >= 365) return <div key={day} className="w-3 h-3" />;
                const date = new Date(year, 0, idx + 1);
                const key = date.toISOString().split("T")[0]!;
                const entry = map.get(key);
                return (
                  <div
                    key={day}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-70 ${getColor(entry?.count ?? 0)}`}
                    onMouseEnter={() => setTooltip({ date: key, count: entry?.count ?? 0, rate: entry?.successRate ?? 0 })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="mt-2 text-xs text-muted-foreground">
          {tooltip.date} — {tooltip.count} تنفيذ، نسبة النجاح: {tooltip.rate}%
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">أقل</span>
        {["bg-muted/40", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-muted-foreground">أكثر</span>
      </div>
    </div>
  );
}

// ─── Guided Tour ────────────────────────────────────────────────────
const TOUR_STEPS = [
  { key: "kpi", titleAr: "بطاقات المؤشرات", titleEn: "KPI Cards", descAr: "تعرض إحصائيات الأداء اليومي مع Sparklines ومقارنة بالأمس.", descEn: "Shows daily performance with sparklines and yesterday comparison.", position: "bottom" },
  { key: "chart", titleAr: "الرسم البياني", titleEn: "Activity Chart", descAr: "تتبع التنفيذات الناجحة والفاشلة مع متوسط وقت التنفيذ.", descEn: "Track successful and failed executions with average duration.", position: "top" },
  { key: "feed", titleAr: "التغذية الحية", titleEn: "Live Feed", descAr: "آخر التنفيذات تُحدَّث كل 30 ثانية. انقر تشخيص للتنفيذات الفاشلة.", descEn: "Latest executions auto-refresh every 30s. Click Diagnose for failures.", position: "top" },
  { key: "alerts", titleAr: "مركز التنبيهات", titleEn: "Alerts Center", descAr: "تنبيهات ذكية عن الـ workflows الفاشلة. انقر تشخيص للمعالجة الفورية.", descEn: "Smart alerts for failing workflows. Click Diagnose for instant analysis.", position: "top" },
];

function GuidedTour({ onClose, isRTL }: { onClose: () => void; isRTL: boolean }) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step]!;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full mx-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-accent" : "w-1.5 bg-muted"}`} />
            ))}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X size={14} /></button>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
          <Zap size={20} className="text-accent" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">{isRTL ? current.titleAr : current.titleEn}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{isRTL ? current.descAr : current.descEn}</p>
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {isRTL ? "تخطي الجولة" : "Skip Tour"}
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-muted transition-colors">
                {isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                {isRTL ? "السابق" : "Back"}
              </button>
            )}
            <button
              onClick={() => { if (step < TOUR_STEPS.length - 1) setStep(s => s + 1); else onClose(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs hover:bg-accent/90 transition-colors"
            >
              {step < TOUR_STEPS.length - 1 ? (isRTL ? "التالي" : "Next") : (isRTL ? "ابدأ الآن" : "Start Now")}
              {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const authHeader = getAuthHeader();
  const { toast } = useToast();
  const [period, setPeriod] = useState<"7d" | "30d" | "3m">("7d");
  const [feedFilter, setFeedFilter] = useState<"all" | "success" | "error">("all");
  const [topPeriod, setTopPeriod] = useState<"week" | "month" | "all">("week");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("dashboard_tour_seen");
    if (!seen) { setShowTour(true); localStorage.setItem("dashboard_tour_seen", "1"); }
  }, []);

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/stats`, { headers: authHeader }); return r.json(); },
    refetchInterval: 30000,
  });

  const { data: chartRes, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-chart", period],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/chart-data?period=${period}`, { headers: authHeader }); return r.json(); },
    refetchInterval: 60000,
  });

  const { data: feedRes, isLoading: feedLoading, refetch: refetchFeed } = useQuery({
    queryKey: ["dashboard-feed"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/live-feed?limit=20`, { headers: authHeader }); return r.json(); },
    refetchInterval: 30000,
  });

  const { data: insightRes, isLoading: insightLoading, refetch: refetchInsight } = useQuery({
    queryKey: ["dashboard-insight"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/ai-insight`, { headers: authHeader }); return r.json(); },
    refetchInterval: 300000,
  });

  const { data: topRes } = useQuery({
    queryKey: ["dashboard-top", topPeriod],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/top-workflows?period=${topPeriod}`, { headers: authHeader }); return r.json(); },
  });

  const { data: alertsRes } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/alerts`, { headers: authHeader }); return r.json(); },
    refetchInterval: 60000,
  });

  const { data: heatmapRes } = useQuery({
    queryKey: ["dashboard-heatmap"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/dashboard/heatmap?year=${new Date().getFullYear()}`, { headers: authHeader }); return r.json(); },
  });

  const stats: Stats | undefined = statsRes?.data;
  const chartData: ChartPoint[] = chartRes?.data?.points ?? [];
  const allExecutions: Execution[] = feedRes?.data?.executions ?? [];
  const insight: string = insightRes?.data?.insight ?? "";
  const topWorkflows: TopWorkflow[] = topRes?.data?.workflows ?? [];
  const alerts: Alert[] = (alertsRes?.data?.alerts ?? []).filter((a: Alert) => !dismissedAlerts.has(a.id));
  const heatmapData: HeatmapPoint[] = heatmapRes?.data?.heatmap ?? [];

  const filteredFeed = allExecutions.filter(e => {
    if (feedFilter === "success") return e.status === "success";
    if (feedFilter === "error") return e.status === "error";
    return true;
  });

  const sparkData = chartData.map(p => p.successful);
  const successSparkData = chartData.map(p => p.successful > 0 || p.failed > 0 ? Math.round(p.successful / (p.successful + p.failed) * 100) : 0);

  const kpis = [
    { title: isRTL ? "إجمالي الـ Workflows" : "Total Workflows", value: stats?.totalWorkflows ?? 0, icon: Workflow, color: "bg-accent", sparkColor: "#6366F1", sparkData, change: undefined },
    { title: isRTL ? "الـ Workflows النشطة" : "Active Workflows", value: stats?.activeWorkflows ?? 0, icon: CheckCircle2, color: "bg-emerald-500", sparkColor: "#10B981", sparkData: sparkData.map(v => v > 0 ? 1 : 0), change: undefined },
    { title: isRTL ? "تنفيذات اليوم" : "Today's Executions", value: stats?.todayExecutions ?? 0, icon: Activity, color: "bg-blue-500", sparkColor: "#3B82F6", sparkData, change: stats?.todayExecutionsChange },
    { title: isRTL ? "نسبة النجاح" : "Success Rate", value: `${stats?.successRate ?? 0}%`, icon: TrendingUp, color: "bg-purple-500", sparkColor: "#A855F7", sparkData: successSparkData, change: stats?.successRateChange },
  ];

  const formatDuration = (start: string, stop?: string) => {
    if (!stop) return "-";
    const ms = new Date(stop).getTime() - new Date(start).getTime();
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const alertIcon = (severity: string) => {
    if (severity === "high") return <XCircle size={15} className="text-destructive shrink-0" />;
    if (severity === "medium") return <AlertTriangle size={15} className="text-yellow-500 shrink-0" />;
    return <Info size={15} className="text-blue-500 shrink-0" />;
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <AnimatePresence>{showTour && <GuidedTour onClose={() => setShowTour(false)} isRTL={isRTL} />}</AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{isRTL ? "لوحة التحكم" : "Dashboard"}</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {isRTL ? "حي" : "Live"}
          </div>
          <button onClick={() => setShowTour(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
            <Zap size={13} /> {isRTL ? "جولة سريعة" : "Quick Tour"}
          </button>
        </div>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <KpiCard {...kpi} />
              </motion.div>
            ))}
      </div>

      {/* Row 2 — Activity Chart */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-foreground">{isRTL ? "إحصائيات التنفيذ" : "Execution Statistics"}</h3>
          <div className="flex gap-1">
            {(["7d", "30d", "3m"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? "bg-accent text-white" : "text-muted-foreground hover:bg-muted"}`}>
                {p === "7d" ? (isRTL ? "٧ أيام" : "7 Days") : p === "30d" ? (isRTL ? "٣٠ يوم" : "30 Days") : (isRTL ? "٣ أشهر" : "3 Months")}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div className="h-52 bg-muted/20 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(val: number, name: string) => [val, name === "successful" ? (isRTL ? "ناجح" : "Success") : name === "failed" ? (isRTL ? "فاشل" : "Failed") : (isRTL ? "مدة (ms)" : "Duration (ms)")]}
              />
              <Bar yAxisId="left" dataKey="successful" fill="#10B981" name="successful" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar yAxisId="left" dataKey="failed" fill="#EF4444" name="failed" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="#6366F1" dot={false} strokeWidth={2} name="avgDuration" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row 3 — Live Feed + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Feed */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{isRTL ? "التغذية الحية" : "Live Feed"}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {(["all", "success", "error"] as const).map(f => (
                  <button key={f} onClick={() => setFeedFilter(f)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${feedFilter === f ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    {f === "all" ? (isRTL ? "الكل" : "All") : f === "success" ? (isRTL ? "ناجح" : "OK") : (isRTL ? "فاشل" : "Fail")}
                  </button>
                ))}
              </div>
              <button onClick={() => refetchFeed()} className="p-1 hover:bg-muted rounded transition-colors">
                <RefreshCw size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {feedLoading ? (
              <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-9 bg-muted rounded animate-pulse" />)}</div>
            ) : !filteredFeed.length ? (
              <div className="text-center py-10 text-muted-foreground text-sm">{isRTL ? "لا توجد تنفيذات" : "No executions"}</div>
            ) : (
              filteredFeed.map(exec => (
                <div key={exec.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                  <div className="shrink-0">
                    {exec.status === "success" ? <CheckCircle2 size={14} className="text-emerald-500" />
                      : exec.status === "error" ? <XCircle size={14} className="text-destructive" />
                      : <Clock size={14} className="text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{exec.workflowName ?? exec.workflowId ?? exec.id}</p>
                    <p className="text-xs text-muted-foreground">{new Date(exec.startedAt).toLocaleTimeString()} • {formatDuration(exec.startedAt, exec.stoppedAt)}</p>
                  </div>
                  {exec.status === "error" && (
                    <Link href={`/chat?diagnosisExecId=${exec.id}`}>
                      <button className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs hover:bg-destructive/20 transition-colors shrink-0">
                        <MessageSquare size={11} />{isRTL ? "تشخيص" : "Diagnose"}
                      </button>
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts Center */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">{isRTL ? "مركز التنبيهات" : "Alerts Center"}</h3>
              {alerts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold">{alerts.length}</span>
              )}
            </div>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {!alerts.length ? (
              <div className="text-center py-10">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{isRTL ? "لا توجد تنبيهات نشطة" : "No active alerts"}</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  {alertIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{isRTL ? alert.message : alert.messageEn}</p>
                    {alert.workflowId && (
                      <Link href={`/chat?diagnosisWorkflowId=${alert.workflowId}`}>
                        <button className="mt-1 flex items-center gap-1 text-xs text-accent hover:underline">
                          <MessageSquare size={11} />{isRTL ? "تشخيص فوري" : "Instant Diagnose"}
                        </button>
                      </Link>
                    )}
                  </div>
                  <button onClick={() => setDismissedAlerts(prev => new Set([...prev, alert.id]))}
                    className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 4 — Top Workflows + AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Workflows */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{isRTL ? "أكثر الـ Workflows نشاطاً" : "Top Workflows"}</h3>
            <div className="flex gap-0.5">
              {(["week", "month", "all"] as const).map(p => (
                <button key={p} onClick={() => setTopPeriod(p)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${topPeriod === p ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  {p === "week" ? (isRTL ? "أسبوع" : "Week") : p === "month" ? (isRTL ? "شهر" : "Month") : (isRTL ? "الكل" : "All")}
                </button>
              ))}
            </div>
          </div>
          {!topWorkflows.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">{isRTL ? "لا توجد بيانات" : "No data"}</p>
          ) : (
            <div className="space-y-4">
              {topWorkflows.map((wf, i) => (
                <div key={wf.id}>
                  <div className="flex items-center justify-between mb-1">
                    <Link href={`/workflows/${wf.id}`}>
                      <span className="text-xs text-foreground hover:text-accent cursor-pointer transition-colors truncate max-w-[160px]">{wf.name}</span>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{wf.executionCount} تنفيذ</span>
                      <span className={`text-xs font-medium ${wf.successRate >= 90 ? "text-emerald-500" : wf.successRate >= 70 ? "text-yellow-500" : "text-destructive"}`}>
                        {wf.successRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${wf.successRate}%` }} transition={{ delay: i * 0.08 }}
                      className={`h-full rounded-full ${wf.successRate >= 90 ? "bg-emerald-500" : wf.successRate >= 70 ? "bg-yellow-500" : "bg-destructive"}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                <Zap size={14} className="text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{isRTL ? "ملخص الذكاء الاصطناعي" : "AI Insight"}</h3>
            </div>
            <button onClick={() => refetchInsight()} className="p-1.5 hover:bg-muted rounded-md transition-colors" title={isRTL ? "تحديث" : "Refresh"}>
              <RefreshCw size={13} className="text-muted-foreground" />
            </button>
          </div>
          {insightLoading ? (
            <div className="space-y-2.5">
              {[...Array(4)].map((_, i) => <div key={i} className="h-3.5 bg-muted rounded animate-pulse" style={{ width: `${55 + i * 15}%` }} />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{insight || (isRTL ? "لا يوجد تحليل متاح حالياً." : "No insight available yet.")}</p>
          )}
          {insightRes?.data?.stats && (
            <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2">
              {[
                { label: isRTL ? "إجمالي" : "Total", value: insightRes.data.stats.total },
                { label: isRTL ? "ناجح" : "Success", value: insightRes.data.stats.successful, color: "text-emerald-500" },
                { label: isRTL ? "فاشل" : "Failed", value: insightRes.data.stats.failed, color: "text-destructive" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className={`text-base font-bold ${s.color ?? "text-foreground"}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 5 — Heatmap */}
      <ActivityHeatmap data={heatmapData} />
    </div>
  );
}
