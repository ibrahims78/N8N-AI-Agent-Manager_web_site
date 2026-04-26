/**
 * Tiny p-all replacement: run an async mapper over `items` with a hard cap on
 * the number of in-flight tasks. Preserves input order in the output.
 *
 * Pulled in by SmartCacheService — see Phase 2 of unified-content-cache-plan.md.
 *
 * No external deps; ~30 lines.
 */
export async function pAll<T, R>(
  items: readonly T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = 6,
): Promise<R[]> {
  if (concurrency <= 0) throw new Error("concurrency must be > 0");
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await mapper(items[i] as T, i);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}
