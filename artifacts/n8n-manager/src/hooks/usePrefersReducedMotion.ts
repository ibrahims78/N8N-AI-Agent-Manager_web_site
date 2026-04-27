import { useEffect, useState } from "react";

/**
 * Returns `true` when the user has requested reduced motion at the OS level
 * (System Settings → Accessibility → Reduce motion, or equivalent).
 *
 * Note: most motion in this app is handled automatically by:
 *   1. The global `@media (prefers-reduced-motion: reduce)` block in index.css
 *      which neutralises CSS animations/transitions.
 *   2. Framer Motion's `<MotionConfig reducedMotion="user">` at the App root
 *      which makes every motion component respect the same preference.
 *
 * Use this hook only for bespoke imperative animations (e.g. setTimeout-driven
 * tweens, requestAnimationFrame loops, scrollIntoView with smooth behaviour)
 * that bypass both layers above.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefers;
}
