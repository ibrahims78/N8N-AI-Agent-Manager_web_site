import { useEffect, useState, type RefObject } from "react";

/**
 * Resolve the actual scrollable element. If `ref` points to a Radix
 * ScrollArea Root, we look up the inner Viewport (which is what actually
 * scrolls). Otherwise we use the element itself.
 */
function resolveScroller(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  const radixViewport = el.querySelector<HTMLElement>(
    "[data-radix-scroll-area-viewport]",
  );
  return radixViewport ?? el;
}

/**
 * Returns the reading progress (0..1) of a scrollable container.
 * Recomputes on scroll, on container resize, and on window resize.
 */
export function useReadingProgress(
  containerRef: RefObject<HTMLElement | null>,
  /** Reset trigger: change this to force a recompute (e.g. when content swaps). */
  resetKey: unknown = null,
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    const scroller = resolveScroller(root);
    if (!scroller) return;

    const compute = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      const ratio = scroller.scrollTop / max;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };

    compute();
    scroller.addEventListener("scroll", compute, { passive: true });

    const ro = new ResizeObserver(compute);
    ro.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", compute);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, resetKey]);

  return progress;
}
