/**
 * SyncSettingsCard.tsx — لوحة تحكم المزامنة الدورية + التصدير + إعادة بناء الفهرس.
 */
import { useEffect, useState } from "react";
import { Loader2, Download, RefreshCw, FileText, Save, Database } from "lucide-react";
import { apiRequest, API_BASE, getAuthHeader } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SyncSettings {
  id: number;
  enabled: boolean;
  intervalHours: number;
  autoTranslate: boolean;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  lastRunSummary: string | null;
  nextRunAt: string | null;
}

export function SyncSettingsCard({ isRTL }: { isRTL: boolean }) {
  const { toast } = useToast();
  const [s, setS] = useState<SyncSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  async function load() {
    const r = await apiRequest<{ success: boolean; data: SyncSettings }>(`/catalog/docs-advanced/sync`);
    setS(r.data);
  }
  useEffect(() => { load(); }, []);

  async function update(patch: Partial<SyncSettings>) {
    setLoading(true);
    try {
      const r = await apiRequest<{ success: boolean; data: SyncSettings }>(`/catalog/docs-advanced/sync`, {
        method: "PUT", body: JSON.stringify(patch),
      });
      setS(r.data);
      toast({ title: isRTL ? "تم الحفظ ✅" : "Saved ✅" });
    } catch (err) {
      toast({ title: isRTL ? "فشل الحفظ" : "Save failed", description: String(err), variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function runNow() {
    setRunning(true);
    try {
      const r = await apiRequest<{ success: boolean; data: object }>(`/catalog/docs-advanced/sync/run`, { method: "POST" });
      toast({ title: isRTL ? "اكتملت المزامنة" : "Sync done", description: JSON.stringify(r.data) });
      await load();
    } catch (err) {
      toast({ title: isRTL ? "فشلت المزامنة" : "Sync failed", description: String(err), variant: "destructive" });
    } finally { setRunning(false); }
  }

  async function reindex() {
    setReindexing(true);
    try {
      const r = await apiRequest<{ success: boolean; data: { totalSections: number } }>(
        `/catalog/docs-advanced/reindex`, { method: "POST" }
      );
      toast({ title: isRTL ? "تم بناء الفهرس" : "Reindexed", description: `${r.data.totalSections} sections` });
    } catch (err) {
      toast({ title: isRTL ? "فشل" : "Failed", description: String(err), variant: "destructive" });
    } finally { setReindexing(false); }
  }

  function downloadExport(kind: "html" | "md", lang: "en" | "ar") {
    const url = `${API_BASE}/catalog/docs-advanced/export.${kind}?lang=${lang}`;
    const auth = getAuthHeader().Authorization;
    fetch(url, { headers: auth ? { Authorization: auth } : {}, credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `n8n-docs-${lang}-${new Date().toISOString().slice(0, 10)}.${kind}`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => toast({ title: "Export failed", description: String(e), variant: "destructive" }));
  }

  if (!s) return null;
  const summary = s.lastRunSummary ? JSON.parse(s.lastRunSummary) : null;

  return (
    <Card className="p-4 space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2">
        <Database size={16} className="text-accent" />
        <h3 className="font-semibold text-sm">{isRTL ? "المزامنة الدورية وأدوات النظام" : "Auto-sync & system tools"}</h3>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <label className="flex items-center gap-2 p-2 border border-border rounded">
          <input
            type="checkbox" checked={s.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            disabled={loading}
          />
          <span>{isRTL ? "تفعيل المزامنة" : "Enable auto-sync"}</span>
        </label>
        <label className="flex items-center gap-2 p-2 border border-border rounded">
          <span>{isRTL ? "كل" : "Every"}</span>
          <input
            type="number" min={1} max={720}
            value={s.intervalHours}
            onChange={(e) => setS({ ...s, intervalHours: Number(e.target.value) })}
            onBlur={() => update({ intervalHours: s.intervalHours })}
            className="w-16 border border-border rounded px-1 py-0.5 bg-background"
          />
          <span>{isRTL ? "ساعة" : "hours"}</span>
        </label>
        <label className="flex items-center gap-2 p-2 border border-border rounded">
          <input
            type="checkbox" checked={s.autoTranslate}
            onChange={(e) => update({ autoTranslate: e.target.checked })}
            disabled={loading}
          />
          <span>{isRTL ? "ترجمة تلقائية" : "Auto-translate"}</span>
        </label>
      </div>

      <div className="text-xs text-muted-foreground">
        {s.lastRunAt && (
          <div>
            {isRTL ? "آخر تشغيل:" : "Last run:"} {new Date(s.lastRunAt).toLocaleString()}{" "}
            <Badge variant="outline" className="ms-1 text-[10px]">{s.lastRunStatus}</Badge>
            {summary && (
              <span className="ms-2">
                ({summary.changed} {isRTL ? "متغيِّر" : "changed"}, {summary.fetched} {isRTL ? "محدَّث" : "fetched"}, {summary.translated} {isRTL ? "مترجم" : "translated"})
              </span>
            )}
          </div>
        )}
        {s.nextRunAt && (
          <div>
            {isRTL ? "التشغيل التالي:" : "Next run:"} {new Date(s.nextRunAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <Button size="sm" variant="outline" onClick={runNow} disabled={running}>
          {running ? <Loader2 size={12} className="animate-spin me-1" /> : <RefreshCw size={12} className="me-1" />}
          {isRTL ? "مزامنة الآن" : "Run sync now"}
        </Button>
        <Button size="sm" variant="outline" onClick={reindex} disabled={reindexing}>
          {reindexing ? <Loader2 size={12} className="animate-spin me-1" /> : <Save size={12} className="me-1" />}
          {isRTL ? "إعادة بناء فهرس البحث" : "Rebuild search index"}
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => downloadExport("html", "ar")} className="gap-1">
          <FileText size={12} />{isRTL ? "كتاب عربي (HTML→PDF)" : "Arabic Book"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => downloadExport("html", "en")} className="gap-1">
          <FileText size={12} />{isRTL ? "كتاب إنجليزي" : "English Book"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => downloadExport("md", "ar")} className="gap-1">
          <Download size={12} /> .md
        </Button>
      </div>
    </Card>
  );
}
