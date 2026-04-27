import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Workflow,
  MessageSquare,
  FileText,
  Package,
  BookOpen,
  History,
  Users,
  Settings,
  KeyRound,
  LogOut,
  Sun,
  Moon,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  Keyboard,
  Clock3,
} from "lucide-react";
import { useRecentPages } from "@/hooks/useRecentPages";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiRequest } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useKeyboardShortcuts,
  formatCombo,
  type ShortcutHandler,
} from "@/hooks/useKeyboardShortcuts";

interface PaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx)
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [, navigate] = useLocation();
  const {
    theme,
    sidebarCollapsed,
    toggleLanguage,
    toggleTheme,
    setSidebarCollapsed,
  } = useAppStore();
  const { user, clearAuth } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const close = useCallback(() => setOpen(false), []);
  const openPalette = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const go = useCallback(
    (path: string) => {
      navigate(path);
      setOpen(false);
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {}
    clearAuth();
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.location.href = `${base}/login`;
  }, [clearAuth]);

  const shortcuts: ShortcutHandler[] = useMemo(
    () => [
      {
        combo: ["mod", "k"],
        allowInInput: true,
        description: isRTL
          ? "فتح لوحة الأوامر"
          : "Open command palette",
        handler: () => setOpen((o) => !o),
      },
      {
        combo: ["mod", "b"],
        description: isRTL ? "إظهار/إخفاء الشريط الجانبي" : "Toggle sidebar",
        handler: () => setSidebarCollapsed(!sidebarCollapsed),
      },
      {
        combo: ["mod", "j"],
        description: isRTL ? "تبديل اللغة" : "Toggle language",
        handler: () => toggleLanguage(),
      },
      {
        combo: ["mod", "."],
        description: isRTL ? "تبديل المظهر (فاتح/داكن)" : "Toggle theme",
        handler: () => toggleTheme(),
      },
      {
        combo: ["shift", "?"],
        description: isRTL
          ? "عرض اختصارات لوحة المفاتيح"
          : "Show keyboard shortcuts",
        handler: () => setHelpOpen(true),
      },
    ],
    [
      isRTL,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleLanguage,
      toggleTheme,
    ],
  );

  useKeyboardShortcuts(shortcuts);

  const navPages = useMemo(
    () => [
      { icon: LayoutDashboard, label: t("app.dashboard"), path: "/" },
      { icon: Workflow, label: t("app.workflows"), path: "/workflows" },
      { icon: MessageSquare, label: t("app.chat"), path: "/chat" },
      { icon: FileText, label: t("app.templates"), path: "/templates" },
      {
        icon: Package,
        label: isRTL ? "كتالوج العقد" : "Nodes Catalog",
        path: "/nodes-catalog",
      },
      {
        icon: BookOpen,
        label: isRTL ? "أدلة n8n" : "Guides",
        path: "/guides",
      },
      { icon: History, label: t("app.history"), path: "/history" },
      ...(isAdmin
        ? [{ icon: Users, label: t("app.users"), path: "/users" }]
        : []),
      { icon: Settings, label: t("app.settings"), path: "/settings" },
      {
        icon: KeyRound,
        label: isRTL ? "تغيير كلمة المرور" : "Change password",
        path: "/change-password",
      },
    ],
    [t, isRTL, isAdmin],
  );

  // Recently visited pages live across the app (sessionStorage-backed). We
  // surface them at the top of the palette so power users can jump back to
  // what they were just doing without typing or scrolling. We exclude the
  // page they're currently on, since navigating to it is a no-op.
  const recentPaths = useRecentPages();
  const recentEntries = useMemo(() => {
    const byPath = new Map(navPages.map((p) => [p.path, p]));
    return recentPaths
      .filter((p) => byPath.has(p))
      .slice(1) // drop current location (always first in the list)
      .slice(0, 4)
      .map((p) => byPath.get(p)!)
      .filter(Boolean);
  }, [recentPaths, navPages]);

  return (
    <PaletteContext.Provider value={{ open: openPalette, close, toggle }}>
      {children}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={
            isRTL
              ? "ابحث عن صفحة أو إجراء…"
              : "Search pages or actions…"
          }
          dir={isRTL ? "rtl" : "ltr"}
        />
        <CommandList>
          <CommandEmpty>
            {isRTL ? "لا توجد نتائج." : "No results found."}
          </CommandEmpty>

          {recentEntries.length > 0 && (
            <>
              <CommandGroup heading={isRTL ? "آخر ما زرته" : "Recently visited"}>
                {recentEntries.map((p) => {
                  const Icon = p.icon;
                  return (
                    <CommandItem
                      key={`recent-${p.path}`}
                      value={`recent ${p.label} ${p.path}`}
                      onSelect={() => go(p.path)}
                    >
                      <Clock3 className="me-2 size-4 text-muted-foreground" />
                      <span>{p.label}</span>
                      <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                        {p.path}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading={isRTL ? "الصفحات" : "Pages"}>
            {navPages.map((p) => {
              const Icon = p.icon;
              return (
                <CommandItem
                  key={p.path}
                  value={`${p.label} ${p.path}`}
                  onSelect={() => go(p.path)}
                >
                  <Icon className="me-2 size-4" />
                  <span>{p.label}</span>
                  <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                    {p.path}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={isRTL ? "إجراءات سريعة" : "Quick actions"}>
            <CommandItem
              value={isRTL ? "تبديل المظهر فاتح داكن" : "toggle theme dark light"}
              onSelect={() => {
                toggleTheme();
                setOpen(false);
              }}
            >
              {theme === "dark" ? (
                <Sun className="me-2 size-4" />
              ) : (
                <Moon className="me-2 size-4" />
              )}
              <span>
                {isRTL
                  ? theme === "dark"
                    ? "التبديل للمظهر الفاتح"
                    : "التبديل للمظهر الداكن"
                  : theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"}
              </span>
              <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                {formatCombo(["mod", "."])}
              </span>
            </CommandItem>

            <CommandItem
              value={isRTL ? "تبديل اللغة عربي إنجليزي" : "toggle language ar en"}
              onSelect={() => {
                toggleLanguage();
                setOpen(false);
              }}
            >
              <Languages className="me-2 size-4" />
              <span>
                {isRTL ? "تبديل اللغة (عربي/إنجليزي)" : "Toggle language (AR/EN)"}
              </span>
              <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                {formatCombo(["mod", "j"])}
              </span>
            </CommandItem>

            <CommandItem
              value={isRTL ? "إظهار إخفاء الشريط الجانبي" : "toggle sidebar"}
              onSelect={() => {
                setSidebarCollapsed(!sidebarCollapsed);
                setOpen(false);
              }}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="me-2 size-4" />
              ) : (
                <PanelLeftClose className="me-2 size-4" />
              )}
              <span>
                {isRTL
                  ? sidebarCollapsed
                    ? "إظهار الشريط الجانبي"
                    : "إخفاء الشريط الجانبي"
                  : sidebarCollapsed
                  ? "Show sidebar"
                  : "Hide sidebar"}
              </span>
              <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                {formatCombo(["mod", "b"])}
              </span>
            </CommandItem>

            <CommandItem
              value={
                isRTL
                  ? "اختصارات لوحة المفاتيح مساعدة"
                  : "keyboard shortcuts help"
              }
              onSelect={() => {
                setOpen(false);
                setTimeout(() => setHelpOpen(true), 50);
              }}
            >
              <Keyboard className="me-2 size-4" />
              <span>
                {isRTL
                  ? "اختصارات لوحة المفاتيح"
                  : "Keyboard shortcuts"}
              </span>
              <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                ?
              </span>
            </CommandItem>

            {user && (
              <CommandItem
                value={isRTL ? "تسجيل الخروج" : "logout sign out"}
                onSelect={() => {
                  setOpen(false);
                  void handleLogout();
                }}
                className="text-destructive data-[selected=true]:text-destructive"
              >
                <LogOut className="me-2 size-4" />
                <span>{isRTL ? "تسجيل الخروج" : "Logout"}</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <ShortcutsHelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        shortcuts={shortcuts}
        isRTL={isRTL}
      />
    </PaletteContext.Provider>
  );
}

function ShortcutsHelpDialog({
  open,
  onOpenChange,
  shortcuts,
  isRTL,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  shortcuts: ShortcutHandler[];
  isRTL: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-5" />
            {isRTL ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? "أسرع طريقة للتنقّل والتحكّم في التطبيق."
              : "The fastest way to navigate and control the app."}
          </DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border rounded-md border border-border">
          {shortcuts.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span className="text-foreground/80">{s.description}</span>
              <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground shadow-sm">
                {formatCombo(s.combo)}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
