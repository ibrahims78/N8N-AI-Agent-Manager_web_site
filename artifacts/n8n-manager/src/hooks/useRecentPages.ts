import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const STORAGE_KEY = "n8n-mgr:recent-pages";
const MAX_RECENT = 6;

/**
 * Routes that should never appear in the "Recently visited" list because they
 * are transient or sensitive (login screens, deep edit URLs, etc).
 */
const EXCLUDED_PREFIXES = ["/login"];

function isExcluded(path: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

function load(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    return [];
  }
}

function save(list: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore storage quota / privacy errors */
  }
}

/**
 * Tracks the user's recently visited routes (most-recent first, deduplicated,
 * capped at MAX_RECENT). Persists in sessionStorage so the list survives
 * navigation but resets when the tab closes.
 *
 * Returns the current list so callers (e.g. the command palette) can render
 * it directly. The hook also subscribes to wouter's location so the list
 * updates as the user navigates.
 */
export function useRecentPages(): string[] {
  const [location] = useLocation();
  const [recent, setRecent] = useState<string[]>(() => load());

  useEffect(() => {
    if (!location || isExcluded(location)) return;
    setRecent((prev) => {
      const filtered = prev.filter((p) => p !== location);
      const next = [location, ...filtered].slice(0, MAX_RECENT);
      save(next);
      return next;
    });
  }, [location]);

  return recent;
}
