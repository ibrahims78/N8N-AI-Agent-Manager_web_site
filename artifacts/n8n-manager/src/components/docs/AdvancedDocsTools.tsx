/**
 * AdvancedDocsTools.tsx
 * يجمع كل أدوات نظام التوثيقات الاحترافية القابلة لإلصاقها بأي عقدة:
 *  - Operations (Sub-nodes) panel
 *  - History drawer (versioning + rollback)
 *  - Manual override editor
 *  - Workflow JSON viewer
 */
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2, History, Pencil, Save, X, RotateCcw, GitFork,
  Code2, Trash2, Eye, FileJson,
} from "lucide-react";
import { apiRequest, API_BASE, getAuthHeader } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/components/ConfirmDialogProvider";
import { ArticleSkeleton } from "@/components/ui/skeletons";

type Lang = "en" | "ar";

interface Operation {
  name: string;
  description: string;
  resource?: string;
  parameters: { name: string; required: boolean; description: string }[];
}

interface HistoryEntry {
  id: number;
  changeType: string;
  changedBy: number | null;
  note: string | null;
  snapshotAt: string;
  length: number;
}

/* ─────────────────────────────────────────────────── */
/* 1) Operations / Sub-nodes Panel                     */
/* ─────────────────────────────────────────────────── */
export function OperationsPanel({
  nodeType, lang, isRTL,
}: { nodeType: string; lang: Lang; isRTL: boolean }) {
  const [ops, setOps] = useState<Operation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await apiRequest<{ success: boolean; data: { operations: Operation[]; count: number } }>(
        `/catalog/docs-advanced/${encodeURIComponent(nodeType)}/operations?lang=${lang}`
      );
      setOps(r.data.operations);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (open && !ops) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lang]);

  // Group by resource
  const grouped: Record<string, Operation[]> = {};
  (ops || []).forEach((o) => {
    const k = o.resource || (isRTL ? "عام" : "General");
    (grouped[k] = grouped[k] || []).push(o);
  });

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 px-2 gap-1">
        <GitFork size={12} /><span className="text-xs">{isRTL ? "العمليات" : "Operations"}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitFork size={18} />
              {isRTL ? "العمليات الفرعية" : "Sub-operations"} — {nodeType}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[65vh]">
            {loading ? (
              <ArticleSkeleton lines={6} showTitle={false} className="p-4" />
            ) : !ops || ops.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                {isRTL ? "لم يتم العثور على عمليات قابلة للاستخراج لهذه العقدة." : "No extractable operations for this node."}
              </p>
            ) : (
              <div className="space-y-4 p-2">
                {Object.entries(grouped).map(([resource, items]) => (
                  <div key={resource} className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{resource}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {items.length} {isRTL ? "عملية" : "operations"}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {items.map((op, i) => (
                        <div key={i} className="bg-background border border-border rounded px-3 py-2">
                          <div className="font-semibold text-sm">{op.name}</div>
                          {op.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">{op.description}</div>
                          )}
                          {op.parameters.length > 0 && (
                            <details className="mt-1 text-xs">
                              <summary className="cursor-pointer text-accent">
                                {op.parameters.length} {isRTL ? "معاملات" : "params"}
                              </summary>
                              <ul className="mt-1 space-y-0.5 ps-3">
                                {op.parameters.map((p, j) => (
                                  <li key={j}>
                                    <code className="text-[10px]">{p.name}</code>
                                    {p.required && <span className="text-red-500 ms-1">*</span>}
                                    <span className="text-muted-foreground"> — {p.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────────── */
/* 2) History Drawer (versioning + rollback)           */
/* ─────────────────────────────────────────────────── */
export function HistoryPanel({
  nodeType, lang, isRTL, isAdmin, onRestored,
}: {
  nodeType: string; lang: Lang; isRTL: boolean;
  isAdmin: boolean; onRestored?: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMd, setPreviewMd] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await apiRequest<{ success: boolean; data: { entries: HistoryEntry[] } }>(
        `/catalog/docs-advanced/${encodeURIComponent(nodeType)}/history?lang=${lang}`
      );
      setEntries(r.data.entries);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open, lang]);

  async function preview(e: HistoryEntry) {
    const r = await apiRequest<{ success: boolean; data: { markdown: string } }>(
      `/catalog/docs-advanced/history/${e.id}`
    );
    setPreviewMd(r.data.markdown);
    setPreviewTitle(`${e.changeType} — ${new Date(e.snapshotAt).toLocaleString()}`);
  }

  async function rollback(e: HistoryEntry) {
    const ok = await confirmDialog({
      title: isRTL ? "استعادة هذه النسخة" : "Restore this version",
      description: isRTL
        ? "سيتم حفظها كتعديل يدوي يطغى على المصدر الأصلي."
        : "It will be saved as a manual override that takes precedence over the upstream source.",
      confirmText: isRTL ? "استعادة" : "Restore",
      cancelText: isRTL ? "إلغاء" : "Cancel",
    });
    if (!ok) return;
    try {
      await apiRequest(`/catalog/docs-advanced/history/${e.id}/rollback`, { method: "POST" });
      toast({ title: isRTL ? "تمت الاستعادة ✅" : "Restored ✅" });
      onRestored?.();
      await load();
    } catch (err) {
      toast({
        title: isRTL ? "فشلت الاستعادة" : "Restore failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  const labelMap: Record<string, string> = {
    fetch: isRTL ? "جلب" : "Fetch",
    translate: isRTL ? "ترجمة" : "Translate",
    manual_edit: isRTL ? "تعديل يدوي" : "Manual edit",
    auto_sync: isRTL ? "مزامنة" : "Auto-sync",
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 px-2 gap-1">
        <History size={12} /><span className="text-xs">{isRTL ? "الإصدارات" : "History"}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={18} />
              {isRTL ? "سجل إصدارات التوثيق" : "Documentation history"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {loading ? (
              <ArticleSkeleton lines={6} showTitle={false} className="p-4" />
            ) : !entries || entries.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                {isRTL ? "لا توجد إصدارات سابقة محفوظة لهذه العقدة بعد." : "No previous versions saved yet."}
              </p>
            ) : (
              <div className="space-y-1.5">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-muted/40">
                    <Badge variant="secondary" className="text-[10px]">
                      {labelMap[e.changeType] || e.changeType}
                    </Badge>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="text-foreground">{new Date(e.snapshotAt).toLocaleString()}</div>
                      {e.note && <div className="text-muted-foreground truncate">{e.note}</div>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{e.length} {isRTL ? "حرف" : "chars"}</span>
                    <Button variant="ghost" size="sm" onClick={() => preview(e)} className="h-6 px-2">
                      <Eye size={12} />
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => rollback(e)} className="h-6 px-2 text-amber-600">
                        <RotateCcw size={12} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewMd} onOpenChange={(o) => !o && setPreviewMd(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]" dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-sm">{previewTitle}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <article className="prose prose-sm dark:prose-invert max-w-none p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewMd || ""}</ReactMarkdown>
            </article>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────────── */
/* 3) Manual Editor                                    */
/* ─────────────────────────────────────────────────── */
export function ManualEditor({
  nodeType, lang, isRTL, currentMarkdown, hasOverride, onSaved,
}: {
  nodeType: string; lang: Lang; isRTL: boolean;
  currentMarkdown: string;
  hasOverride: boolean;
  onSaved?: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(currentMarkdown);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { setText(currentMarkdown); }, [currentMarkdown, open]);

  async function save() {
    if (text.trim().length < 5) {
      toast({ title: isRTL ? "النص فارغ" : "Empty content", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiRequest(`/catalog/docs-advanced/${encodeURIComponent(nodeType)}/manual?lang=${lang}`, {
        method: "PUT",
        body: JSON.stringify({ markdown: text, note: note || undefined }),
      });
      toast({ title: isRTL ? "تم الحفظ ✅" : "Saved ✅" });
      onSaved?.();
      setOpen(false);
    } catch (err) {
      toast({
        title: isRTL ? "فشل الحفظ" : "Save failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally { setSaving(false); }
  }

  async function clearOverride() {
    const ok = await confirmDialog({
      title: isRTL ? "حذف التعديل اليدوي" : "Clear manual override",
      description: isRTL
        ? "هل تريد العودة إلى النسخة الأصلية من المصدر؟"
        : "Revert to the original upstream version?",
      confirmText: isRTL ? "حذف" : "Clear",
      cancelText: isRTL ? "إلغاء" : "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await apiRequest(`/catalog/docs-advanced/${encodeURIComponent(nodeType)}/manual?lang=${lang}`, { method: "DELETE" });
      toast({ title: isRTL ? "تم الحذف ✅" : "Cleared ✅" });
      onSaved?.();
      setOpen(false);
    } catch (err) {
      toast({
        title: isRTL ? "فشل الحذف" : "Clear failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 px-2 gap-1">
        <Pencil size={12} />
        <span className="text-xs">{isRTL ? "تحرير" : "Edit"}</span>
        {hasOverride && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title={isRTL ? "محرَّر" : "overridden"} />}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil size={18} />
              {isRTL ? "تحرير التوثيق" : "Edit documentation"} — {nodeType} ({lang})
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[70vh]">
            <div className="flex flex-col gap-2">
              <textarea
                className="flex-1 w-full font-mono text-xs border border-border rounded p-3 bg-background resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir={lang === "ar" ? "rtl" : "ltr"}
                spellCheck={false}
              />
              <input
                className="border border-border rounded px-3 py-2 text-xs bg-background"
                placeholder={isRTL ? "ملاحظة (اختياري) — تُحفظ في سجل الإصدارات" : "Optional note — saved in history"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="border border-border rounded overflow-hidden bg-muted/20">
              <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border">
                {isRTL ? "معاينة" : "Preview"}
              </div>
              <ScrollArea className="h-[calc(70vh-30px)]">
                <article className="prose prose-sm dark:prose-invert max-w-none p-3" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                </article>
              </ScrollArea>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {hasOverride && (isRTL ? "هذه النسخة محرَّرة يدوياً وتعلو على النسخة المُترجمة آلياً." : "This is a manual override of the auto-translation.")}
            </div>
            <div className="flex gap-2">
              {hasOverride && (
                <Button variant="outline" size="sm" onClick={clearOverride}>
                  <Trash2 size={14} className="me-1" />
                  {isRTL ? "إلغاء التعديل" : "Clear override"}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X size={14} className="me-1" />{isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin me-1" /> : <Save size={14} className="me-1" />}
                {isRTL ? "حفظ" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────────────────────────── */
/* 4) Workflow JSON Viewer                              */
/* ─────────────────────────────────────────────────── */
export function WorkflowJsonViewer({ markdown, isRTL }: { markdown: string; isRTL: boolean }) {
  // Find any ```json blocks that look like an n8n workflow
  const blocks: { json: string; nodes: number }[] = [];
  const re = /```(?:json)\s*([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed && Array.isArray(parsed.nodes)) {
        blocks.push({ json: m[1].trim(), nodes: parsed.nodes.length });
      }
    } catch { /* ignore */ }
  }
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  if (blocks.length === 0) return null;
  const cur = blocks[selected];
  let parsed: { nodes: { name: string; type: string; position?: number[] }[]; connections?: Record<string, unknown> } = { nodes: [] };
  try { parsed = JSON.parse(cur.json); } catch { /* ignore */ }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 px-2 gap-1">
        <FileJson size={12} />
        <span className="text-xs">{isRTL ? "ساحة JSON" : "Workflow JSON"} ({blocks.length})</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson size={18} />
              {isRTL ? "ساحة استعراض workflows في التوثيق" : "Workflow JSON Playground"}
            </DialogTitle>
          </DialogHeader>
          {blocks.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              {blocks.map((b, i) => (
                <Button
                  key={i} size="sm" variant={i === selected ? "default" : "outline"}
                  onClick={() => setSelected(i)}
                >#{i + 1} ({b.nodes})</Button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[65vh]">
            <ScrollArea className="border border-border rounded bg-muted/20">
              <pre className="text-[10px] font-mono p-3 leading-relaxed" dir="ltr">
                {cur.json}
              </pre>
            </ScrollArea>
            <div className="border border-border rounded p-3 overflow-auto">
              <h4 className="text-sm font-semibold mb-2">
                {isRTL ? `العقد (${parsed.nodes.length})` : `Nodes (${parsed.nodes.length})`}
              </h4>
              <div className="space-y-1.5">
                {parsed.nodes.map((n, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-1.5 border border-border rounded">
                    <Badge variant="outline" className="text-[10px]">{i + 1}</Badge>
                    <span className="font-medium">{n.name}</span>
                    <code className="text-[10px] text-muted-foreground ms-auto">{n.type}</code>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full gap-1"
                onClick={() => navigator.clipboard.writeText(cur.json)}
              >
                <Code2 size={12} />{isRTL ? "نسخ JSON" : "Copy JSON"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
