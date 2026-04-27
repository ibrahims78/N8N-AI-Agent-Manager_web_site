import { useEffect, type RefObject } from "react";

const STORAGE_PREFIX = "n8n-mgr:scroll:";

function resolveScroller(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  return (
    el.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]") ?? el
  );
}

/**
 * Persists the scroll position of `containerRef` keyed by `key` in
 * sessionStorage and restores it the next time the same key mounts.
 *
 * `enabled = false` disables persistence entirely (useful before the
 * key is known yet).
 */
export function useSavedScrollPosition(
  containerRef: RefObject<HTMLElement | null>,
  key: string | null | undefined,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled || !key) return;
    const root = containerRef.current;
    const scroller = resolveScroller(root);
    if (!scroller) return;

    const storageKey = `${STORAGE_PREFIX}${key}`;

    // Restore (defer one frame so that content has rendered and scrollHeight is final).
    const raf = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (raw == null) return;
        const top = Number.parseInt(raw, 10);
        if (!Number.isFinite(top) || top <= 0) return;
        scroller.scrollTo({ top, behavior: "auto" });
      } catch {
        /* ignore quota / privacy errors */
      }
    });

    let saveTimer: number | null = null;
    const save = () => {
      if (saveTimer != null) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(storageKey, String(scroller.scrollTop));
        } catch {
          /* ignore */
        }
      }, 200);
    };

    scroller.addEventListener("scroll", save, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      if (saveTimer != null) window.clearTimeout(saveTimer);
      scroller.removeEventListener("scroll", save);
    };
  }, [containerRef, key, enabled]);
}
