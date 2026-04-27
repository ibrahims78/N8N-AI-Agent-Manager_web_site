import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ListItemSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 p-3", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton
            className="h-3 flex-1"
            style={{ maxWidth: `${60 + ((i * 13) % 35)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function ArticleSkeleton({
  lines = 10,
  showTitle = true,
  className,
}: {
  lines?: number;
  showTitle?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-4 p-6 max-w-3xl mx-auto w-full", className)}
      aria-hidden="true"
    >
      {showTitle && (
        <>
          <Skeleton className="h-7 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </>
      )}
      <div className="space-y-2.5 pt-2">
        {Array.from({ length: lines }).map((_, i) => {
          const widths = ["100%", "95%", "98%", "85%", "92%", "78%"];
          return (
            <Skeleton
              key={i}
              className="h-3.5"
              style={{ width: widths[i % widths.length] }}
            />
          );
        })}
      </div>
      <div className="space-y-2.5 pt-4">
        <Skeleton className="h-4 w-1/3" />
        {Array.from({ length: Math.max(3, Math.floor(lines / 3)) }).map(
          (_, i) => (
            <Skeleton
              key={i}
              className="h-3.5"
              style={{ width: i % 2 === 0 ? "94%" : "82%" }}
            />
          ),
        )}
      </div>
    </div>
  );
}

export function TableRowSkeleton({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-2", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid items-center gap-3 px-3 py-2.5 border border-border/40 rounded-md"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton
              key={c}
              className="h-3.5"
              style={{ width: `${55 + ((r * 17 + c * 11) % 40)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-border rounded-lg p-4 space-y-3 bg-card"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormFieldSkeleton({
  fields = 3,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)} aria-hidden="true">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function CenteredSpinnerSkeleton({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 gap-3 motion-safe:animate-pulse",
        className,
      )}
      aria-busy="true"
    >
      <div className="size-10 rounded-full border-2 border-muted border-t-accent motion-safe:animate-spin" />
      {label && (
        <p className="text-xs text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
