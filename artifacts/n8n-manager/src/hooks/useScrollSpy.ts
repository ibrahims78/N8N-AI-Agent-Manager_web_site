import { useEffect, useState, type RefObject } from "react";

function resolveScroller(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  return (
    el.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]") ?? el
  );
}

/**
 * Observes a list of element ids inside `containerRef` and returns the id
 * of the heading currently considered "active" (closest to the top of the
 * viewport but already past it). Re-queries when `ids` or `resetKey` change.
 */
export function useScrollSpy(
  containerRef: RefObject<HTMLElement | null>,
  ids: string[],
  resetKey: unknown = null,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const root = containerRef.current;
    const scroller = resolveScroller(root);
    if (!scroller || ids.length === 0) {
      setActiveId(ids[0] ?? null);
      return;
    }

    // Make sure we always have *some* sane initial pick.
    setActiveId((curr) => (ids.includes(curr ?? "") ? curr : ids[0] ?? null));

    const elements = ids
      .map((id) => scroller.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    // Track the visibility of every observed heading.
    const visibility = new Map<string, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          visibility.set(
            id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        // Pick the heading that is intersecting and appears earliest in the
        // document order. If none is intersecting, fall back to the last
        // heading whose top is above the scroller's top edge.
        let chosen: string | null = null;
        for (const id of ids) {
          if ((visibility.get(id) ?? 0) > 0) {
            chosen = id;
            break;
          }
        }
        if (!chosen) {
          const scrollerTop = scroller.getBoundingClientRect().top;
          for (const el of elements) {
            if (el.getBoundingClientRect().top - scrollerTop <= 8) {
              chosen = el.id;
            }
          }
          if (!chosen) chosen = ids[0] ?? null;
        }
        setActiveId(chosen);
      },
      {
        root: scroller === document.documentElement ? null : scroller,
        rootMargin: "0px 0px -70% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ids.join("|"), resetKey]);

  return activeId;
}
