/**
 * <ContentRefreshPanel> — unified UI for the smart refresh flow.
 *
 * Phase 6B of unified-content-cache-plan.md.
 *
 * Talks exclusively to the unified content API:
 *   POST /api/content/:kind/refresh-all
 *
 * Parses named-event SSE (`event: progress|done|error\ndata: {...}`).
 *
 * Two presentational pieces, plus one driving hook so callers can
 * interleave them with their own layout:
 *
 *   const ctrl = useContentRefresh({ kind, supportsTranslation, onComplete });
 *   <ContentRefreshButtons ctrl={ctrl} isAdmin={...} ... />
 *   <ContentRefreshStrip   ctrl={ctrl} ... />
 *
 * Or use the convenience composite:
 *   <ContentRefreshPanel kind="guide" supportsTranslation onComplete={...} ... />
 */
import { useCallback, useRef, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Search,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { API_BASE, getAuthHeader } from "@/lib/api";

export type ContentKind = "guide" | "node-doc";

export interface NormalizedProgress {
  done: number;
  total: number;
  label?: string;
  phase?: "fetch" | "translate";
  dryRun?: boolean;
  added: number;
  updated: number;
  unchanged: number;
  failed: number;
}

export interface RefreshOptions {
  translate?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

export interface ContentRefreshController {
  refresh: (opts?: RefreshOptions) => Promise<void>;
  refreshing: boolean;
  progress: NormalizedProgress | null;
}

interface UseContentRefreshOpts {
  kind: ContentKind;
  supportsTranslation?: boolean;
  onComplete?: () => void | Promise<void>;
  onError?: (msg: string) => void;
}

function parseSseChunk(buffer: string): { events: Array<{ event: string; data: unknown }>; rest: string } {
  const events: Array<{ event: string; data: unknown }> = [];
  const blocks = buffer.split("\n\n");
  const rest = blocks.pop() ?? "";
  for (const block of blocks) {
    let event = "message";
    let dataLine = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
    }
    if (!dataLine) continue;
    try {
      events.push({ event, data: JSON.parse(dataLine) });
    } catch {
      // ignore malformed
    }
  }
  return { events, rest };
}

function pickBuckets(p: Record<string, unknown>, phase: "fetch" | "translate" | undefined): {
  added: number;
  updated: number;
  unchanged: number;
  failed: number;
} {
  // Guides: split EN/AR buckets per phase.
  // Node-docs: single added/updated/unchanged/failed.
  const isTr = phase === "translate";
  const num = (v: unknown) => (typeof v === "number" ? v : 0);
  if ("enAdded" in p || "arAdded" in p) {
    return {
      added: num(isTr ? p.arAdded : p.enAdded),
      updated: num(isTr ? p.arUpdated : p.enUpdated),
      unchanged: num(isTr ? p.arUnchanged : p.enUnchanged),
      failed: num(isTr ? p.arFailed : p.enFailed),
    };
  }
  return {
    added: num(p.added),
    updated: num(p.updated),
    unchanged: num(p.unchanged),
    failed: num(p.failed),
  };
}

export function useContentRefresh({
  kind,
  onComplete,
  onError,
}: UseContentRefreshOpts): ContentRefreshController {
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState<NormalizedProgress | null>(null);
  const { toast } = useToast();
  // Latest options we ran with (used to decide post-run side effects).
  const lastOptsRef = useRef<RefreshOptions>({});

  const refresh = useCallback(
    async (opts: RefreshOptions = {}) => {
      const { translate = false, dryRun = false, force = false } = opts;
      lastOptsRef.current = opts;
      setRefreshing(true);
      setProgress({ done: 0, total: 0, dryRun, phase: "fetch", added: 0, updated: 0, unchanged: 0, failed: 0 });
      try {
        const auth = getAuthHeader().Authorization;
        const params = new URLSearchParams();
        params.set("smart", "true");
        if (translate) params.set("translate", "true");
        if (dryRun) params.set("dryRun", "true");
        if (force) params.set("force", "true");

        const res = await fetch(
          `${API_BASE}/content/${kind}/refresh-all?${params.toString()}`,
          {
            method: "POST",
            headers: auth ? { Authorization: auth } : {},
            credentials: "include",
          },
        );
        if (!res.ok || !res.body) {
          throw new Error(`refresh failed: HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let lastDone: Record<string, unknown> | null = null;
        let lastError: string | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const parsed = parseSseChunk(buf);
          buf = parsed.rest;
          for (const ev of parsed.events) {
            const data = (ev.data ?? {}) as Record<string, unknown>;
            if (ev.event === "progress") {
              const phase =
                (data.phase as "fetch" | "translate" | undefined) ??
                progress?.phase ??
                "fetch";
              const buckets = pickBuckets(data, phase);
              setProgress({
                done: typeof data.done === "number" ? data.done : 0,
                total: typeof data.total === "number" ? data.total : 0,
                label:
                  (typeof data.current === "string" && data.current) ||
                  (typeof data.slug === "string" && data.slug) ||
                  undefined,
                phase,
                dryRun,
                ...buckets,
              });
            } else if (ev.event === "done") {
              lastDone = data;
            } else if (ev.event === "error") {
              lastError =
                typeof data.message === "string" ? data.message : "unknown error";
            }
          }
        }

        if (lastError) {
          toast({
            title: "Refresh failed",
            description: lastError,
            variant: "destructive",
          });
          if (onError) onError(lastError);
        } else if (lastDone) {
          const buckets = pickBuckets(lastDone, lastOptsRef.current.translate ? "translate" : "fetch");
          const verb = dryRun ? "would" : "did";
          toast({
            title: dryRun ? "Update preview (no writes)" : "Refresh complete",
            description: `${verb}: +${buckets.added} new · ~${buckets.updated} updated · ${buckets.unchanged} unchanged${
              buckets.failed > 0 ? ` · ${buckets.failed} failed` : ""
            }`,
          });
          if (!dryRun && onComplete) await onComplete();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ title: "Refresh failed", description: msg, variant: "destructive" });
        if (onError) onError(msg);
      } finally {
        setRefreshing(false);
        setProgress(null);
      }
    },
    [kind, onComplete, onError, toast, progress?.phase],
  );

  return { refresh, refreshing, progress };
}

/* ─────────────────────── Buttons ─────────────────────── */
interface ButtonsProps {
  ctrl: ContentRefreshController;
  isAdmin: boolean;
  supportsTranslation?: boolean;
  labels?: {
    check?: string;
    fetchEn?: string;
    fetchAndTranslate?: string;
  };
}

export function ContentRefreshButtons({
  ctrl,
  isAdmin,
  supportsTranslation = false,
  labels = {},
}: ButtonsProps) {
  if (!isAdmin) return null;
  const { refresh, refreshing } = ctrl;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refresh({ translate: supportsTranslation, dryRun: true })}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 size={14} className="animate-spin me-1.5" /> : <Search size={14} className="me-1.5" />}
            {labels.check ?? "Check for updates"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          Dry-run: discover what would change without any DB write or AI usage
        </TooltipContent>
      </Tooltip>
      <Button
        size="sm"
        variant="outline"
        onClick={() => refresh({ translate: false })}
        disabled={refreshing}
      >
        {refreshing ? <Loader2 size={14} className="animate-spin me-1.5" /> : <RefreshCw size={14} className="me-1.5" />}
        {labels.fetchEn ?? "Fetch all (EN)"}
      </Button>
      {supportsTranslation && (
        <Button
          size="sm"
          onClick={() => refresh({ translate: true })}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 size={14} className="animate-spin me-1.5" /> : <Languages size={14} className="me-1.5" />}
          {labels.fetchAndTranslate ?? "Fetch + Translate AR"}
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────── Progress strip ─────────────────────── */
interface StripProps {
  ctrl: ContentRefreshController;
  labels?: {
    fetching?: string;
    translating?: string;
    checkingFetch?: string;
    checkingTranslate?: string;
  };
}

export function ContentRefreshStrip({ ctrl, labels = {} }: StripProps) {
  const { progress } = ctrl;
  if (!progress) return null;
  const total = progress.total || 1;
  const pctOf = (n: number) => `${Math.min(100, (n / total) * 100)}%`;
  const haveBuckets =
    progress.added + progress.updated + progress.unchanged + progress.failed > 0;
  const isTr = progress.phase === "translate";
  const stripBg = progress.dryRun
    ? "bg-sky-500/10 border-sky-500/30"
    : "bg-amber-500/10 border-amber-500/30";

  const headerLabel = progress.dryRun
    ? isTr
      ? labels.checkingTranslate ?? "Checking translation:"
      : labels.checkingFetch ?? "Checking source:"
    : isTr
      ? labels.translating ?? "Translating:"
      : labels.fetching ?? "Fetching:";

  return (
    <div className={`px-5 py-2 ${stripBg} border-t text-xs flex items-center gap-2`}>
      {progress.dryRun ? (
        <Search size={12} className="text-sky-600 dark:text-sky-400" />
      ) : isTr ? (
        <Languages size={12} />
      ) : (
        <RefreshCw size={12} className="animate-spin" />
      )}
      <span className="font-medium">{headerLabel}</span>
      <span className="text-muted-foreground truncate flex-1">{progress.label ?? ""}</span>
      {haveBuckets && (
        <span className="font-mono text-[11px] tabular-nums hidden sm:inline-flex items-center gap-2">
          {progress.added > 0 && <span className="text-emerald-700 dark:text-emerald-400">+{progress.added}</span>}
          {progress.updated > 0 && <span className="text-blue-700 dark:text-blue-400">~{progress.updated}</span>}
          {progress.unchanged > 0 && <span className="text-muted-foreground">={progress.unchanged}</span>}
          {progress.failed > 0 && <span className="text-rose-700 dark:text-rose-400">!{progress.failed}</span>}
        </span>
      )}
      <span className="font-mono text-[11px] tabular-nums">
        {progress.done}/{progress.total}
      </span>
      <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden flex">
        {haveBuckets ? (
          <>
            <div className="h-full bg-emerald-500 transition-all" style={{ width: pctOf(progress.added) }} title={`${progress.added} new`} />
            <div className="h-full bg-blue-500 transition-all" style={{ width: pctOf(progress.updated) }} title={`${progress.updated} updated`} />
            <div className="h-full bg-slate-400 transition-all" style={{ width: pctOf(progress.unchanged) }} title={`${progress.unchanged} unchanged`} />
            <div className="h-full bg-rose-500 transition-all" style={{ width: pctOf(progress.failed) }} title={`${progress.failed} failed`} />
          </>
        ) : (
          <div
            className={`h-full ${progress.dryRun ? "bg-sky-500" : "bg-amber-500"} transition-all`}
            style={{ width: pctOf(progress.done) }}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Convenience composite ─────────────────────── */
interface PanelProps extends UseContentRefreshOpts {
  isAdmin: boolean;
  buttonLabels?: ButtonsProps["labels"];
  stripLabels?: StripProps["labels"];
}

export default function ContentRefreshPanel(props: PanelProps) {
  const ctrl = useContentRefresh({
    kind: props.kind,
    supportsTranslation: props.supportsTranslation,
    onComplete: props.onComplete,
    onError: props.onError,
  });
  return (
    <div className="flex flex-col gap-2">
      <ContentRefreshButtons
        ctrl={ctrl}
        isAdmin={props.isAdmin}
        supportsTranslation={props.supportsTranslation}
        labels={props.buttonLabels}
      />
      <ContentRefreshStrip ctrl={ctrl} labels={props.stripLabels} />
    </div>
  );
}
