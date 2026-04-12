import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { RefreshCw, TrendingUp, TrendingDown, Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useGetDashboardStats, useGetChartData, useGetAiInsight, useGetTopWorkflows, useGetRecentExecutions } from "@workspace/api-client-react";
import { useAppStore } from "@/stores/useAppStore";
import { getAuthHeader } from "@/lib/api";

function KpiCard({ title, value, change, icon: Icon, color }: {
  title: string; value: string | number; change?: number; icon: React.ElementType; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 border border-border"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${change >= 0 ? "text-emerald-500" : "text-destructive"}`}>
              {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-24 mb-3" />
      <div className="h-8 bg-muted rounded w-16 mb-2" />
      <div className="h-3 bg-muted rounded w-12" />
    </div>
  );
}

function ActivityHeatmap() {
  const { language } = useAppStore();
  const { t } = useTranslation();
  const weeks = 53;
  const days = 7;
  const data = Array.from({ length: weeks * days }, () => Math.floor(Math.random() * 5));
  const colors = ["bg-muted/50", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600", "bg-emerald-800"];

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.activityHeatmap")}</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5">
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} className="flex flex-col gap-0.5">
              {Array.from({ length: days }, (_, d) => {
                const val = data[w * days + d] ?? 0;
                return (
                  <div key={d} className={`w-3 h-3 rounded-sm ${colors[val]}`} title={`${val}`} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const isRTL = language === "ar";
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  const authHeader = getAuthHeader();
  const { data: statsRes, isLoading: statsLoading } = useGetDashboardStats({
    request: { headers: authHeader },
  } as Parameters<typeof useGetDashboardStats>[0]);

  const { data: chartRes, isLoading: chartLoading } = useGetChartData({
    request: { headers: authHeader },
  } as Parameters<typeof useGetChartData>[0]);

  const { data: insightRes, isLoading: insightLoading, refetch: refetchInsight } = useGetAiInsight({
    request: { headers: authHeader },
  } as Parameters<typeof useGetAiInsight>[0]);

  const { data: topRes } = useGetTopWorkflows({
    request: { headers: authHeader },
  } as Parameters<typeof useGetTopWorkflows>[0]);

  const { data: executionsRes, isLoading: execLoading } = useGetRecentExecutions({
    request: { headers: authHeader },
  } as Parameters<typeof useGetRecentExecutions>[0]);

  const stats = (statsRes as { data?: Record<string, unknown> } | undefined)?.data as {
    totalWorkflows?: number;
    activeWorkflows?: number;
    todayExecutions?: number;
    successRate?: number;
    todayExecutionsChange?: number;
    successRateChange?: number;
  } | undefined;

  const chartData = (chartRes as { data?: { points?: unknown[] } } | undefined)?.data?.points as Array<{
    date: string;
    successful: number;
    failed: number;
    avgDuration: number;
  }> | undefined;

  const insight = (insightRes as { data?: { insight?: string } } | undefined)?.data?.insight as string | undefined;
  const topWorkflows = (topRes as { data?: { workflows?: unknown[] } } | undefined)?.data?.workflows as Array<{
    id: string;
    name: string;
    executionCount: number;
    successRate: number;
  }> | undefined;

  const executions = (executionsRes as { data?: { executions?: unknown[] } } | undefined)?.data?.executions as Array<{
    id: string;
    workflowId: string;
    status: string;
    startedAt: string;
    stoppedAt?: string;
  }> | undefined;

  const kpis = [
    { title: t("dashboard.totalWorkflows"), value: stats?.totalWorkflows ?? 0, icon: Activity, color: "bg-accent", change: undefined },
    { title: t("dashboard.activeWorkflows"), value: stats?.activeWorkflows ?? 0, icon: CheckCircle2, color: "bg-emerald-500", change: undefined },
    { title: t("dashboard.todayExecutions"), value: stats?.todayExecutions ?? 0, icon: Clock, color: "bg-blue-500", change: stats?.todayExecutionsChange },
    { title: `${t("dashboard.successRate")} %`, value: `${stats?.successRate ?? 0}%`, icon: TrendingUp, color: "bg-purple-500", change: stats?.successRateChange },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <KpiCard {...kpi} />
              </motion.div>
            ))}
      </div>

      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{isRTL ? "إحصائيات التنفيذ" : "Execution Statistics"}</h3>
          <div className="flex gap-1">
            {(["today", "week", "month"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === p ? "bg-accent text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(`dashboard.period.${p}`)}
              </button>
            ))}
          </div>
        </div>
        {chartLoading ? (
          <div className="h-48 bg-muted/20 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="successful" fill="#10B981" name={isRTL ? "ناجح" : "Successful"} radius={[3, 3, 0, 0]} />
              <Bar yAxisId="left" dataKey="failed" fill="#EF4444" name={isRTL ? "فاشل" : "Failed"} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="#6366F1" dot={false} name={isRTL ? "مدة (ms)" : "Duration (ms)"} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.recentExecutions")}</h3>
          {execLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : !executions?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {isRTL ? "لا توجد تنفيذات بعد" : "No executions yet"}
            </p>
          ) : (
            <div className="space-y-2">
              {executions.slice(0, 6).map(exec => (
                <div key={exec.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {exec.status === "success"
                      ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      : exec.status === "error"
                      ? <XCircle size={14} className="text-destructive shrink-0" />
                      : <Clock size={14} className="text-yellow-500 shrink-0" />}
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">{exec.workflowId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(exec.startedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{t("dashboard.aiInsight")}</h3>
              <button onClick={() => refetchInsight()} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                <RefreshCw size={14} className="text-muted-foreground" />
              </button>
            </div>
            {insightLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + i * 20}%` }} />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{insight ?? (isRTL ? "لا يوجد تحليل متاح" : "No insight available")}</p>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.topWorkflows")}</h3>
            {!topWorkflows?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">{isRTL ? "لا توجد بيانات" : "No data"}</p>
            ) : (
              <div className="space-y-3">
                {topWorkflows.map((wf, i) => (
                  <div key={wf.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground truncate max-w-[180px]">{wf.name}</span>
                      <span className="text-xs text-muted-foreground">{wf.successRate}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${wf.successRate}%` }}
                        transition={{ delay: i * 0.1 }}
                        className={`h-full rounded-full ${wf.successRate >= 90 ? "bg-emerald-500" : wf.successRate >= 70 ? "bg-yellow-500" : "bg-destructive"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ActivityHeatmap />
    </div>
  );
}
