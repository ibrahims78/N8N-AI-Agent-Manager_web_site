import { type RefObject } from "react";
import { useReadingProgress } from "@/hooks/useReadingProgress";

interface ReadingProgressBarProps {
  containerRef: RefObject<HTMLElement | null>;
  /** Used to force-reset progress when the article content changes. */
  resetKey?: unknown;
  className?: string;
}

/**
 * A 2px-thin bar pinned to the top of the closest positioned ancestor that
 * fills left-to-right (or right-to-left in RTL — the bar uses `inset-inline-start`
 * so it grows from the leading edge in both directions) as the user scrolls.
 */
export function ReadingProgressBar({
  containerRef,
  resetKey,
  className,
}: ReadingProgressBarProps) {
  const progress = useReadingProgress(containerRef, resetKey);
  const widthPct = (progress * 100).toFixed(2);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 inset-inline-start-0 h-[2px] z-30 ${className ?? ""}`}
      style={{ width: `${widthPct}%` }}
    >
      <div className="h-full w-full bg-gradient-to-r from-accent/70 via-accent to-accent/80" />
    </div>
  );
}
