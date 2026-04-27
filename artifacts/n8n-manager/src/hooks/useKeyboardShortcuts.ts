import { useEffect } from "react";

export interface ShortcutHandler {
  /** e.g. ["mod","k"] where "mod" means Cmd on macOS / Ctrl elsewhere */
  combo: string[];
  handler: (e: KeyboardEvent) => void;
  /** If true, the handler also fires when an input/textarea is focused. */
  allowInInput?: boolean;
  description?: string;
}

const isMac =
  typeof navigator !== "undefined" &&
  /(Mac|iPhone|iPad|iPod)/i.test(navigator.platform);

function comboMatches(combo: string[], e: KeyboardEvent): boolean {
  const need = combo.map((k) => k.toLowerCase());
  const wantMod = need.includes("mod");
  const wantShift = need.includes("shift");
  const wantAlt = need.includes("alt");
  const key = need.find(
    (k) => k !== "mod" && k !== "shift" && k !== "alt",
  );
  if (!key) return false;
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (wantMod !== mod) return false;
  if (wantShift !== e.shiftKey) return false;
  if (wantAlt !== e.altKey) return false;
  return e.key.toLowerCase() === key;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Register an array of global keyboard shortcuts. Re-registers on changes.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        if (!comboMatches(s.combo, e)) continue;
        if (!s.allowInInput && isEditableTarget(e.target)) continue;
        e.preventDefault();
        s.handler(e);
        return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}

/** Pretty-print a shortcut combo for the current OS. */
export function formatCombo(combo: string[]): string {
  return combo
    .map((k) => {
      if (k === "mod") return isMac ? "⌘" : "Ctrl";
      if (k === "shift") return isMac ? "⇧" : "Shift";
      if (k === "alt") return isMac ? "⌥" : "Alt";
      return k.length === 1 ? k.toUpperCase() : k;
    })
    .join(isMac ? "" : "+");
}

export const IS_MAC = isMac;
