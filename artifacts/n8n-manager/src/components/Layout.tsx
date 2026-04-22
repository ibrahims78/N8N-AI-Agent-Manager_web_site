import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Workflow, MessageSquare, FileText, History,
  Users, Settings, LogOut, ChevronLeft, ChevronRight, Sun, Moon, User, Package,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiRequest } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { language, theme, toggleLanguage, toggleTheme, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { user, clearAuth } = useAuthStore();
  const [location] = useLocation();

  const isRTL = language === "ar";
  const isAdmin = user?.role === "admin";

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: t("app.dashboard"), path: "/" },
    { icon: Workflow, label: t("app.workflows"), path: "/workflows" },
    { icon: MessageSquare, label: t("app.chat"), path: "/chat" },
    { icon: FileText, label: t("app.templates"), path: "/templates" },
    { icon: Package, label: isRTL ? "كتالوج العقد" : "Nodes Catalog", path: "/nodes-catalog" },
    { icon: History, label: t("app.history"), path: "/history" },
    { icon: Users, label: t("app.users"), path: "/users", adminOnly: true },
    { icon: Settings, label: t("app.settings"), path: "/settings" },
  ].filter(item => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {}
    clearAuth();
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.location.href = `${base}/login`;
  };

  const CollapseIcon = isRTL
    ? (sidebarCollapsed ? ChevronLeft : ChevronRight)
    : (sidebarCollapsed ? ChevronRight : ChevronLeft);

  const sidebarSide = isRTL ? "right-0 border-l" : "left-0 border-r";

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed top-0 bottom-0 ${sidebarSide} z-30 bg-card border-border flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-border">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                className="flex items-center gap-2 min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">N8</span>
                </div>
                <span className="font-bold text-sm text-foreground truncate">N8N AI</span>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center mx-auto hover:bg-accent/80 transition-colors"
              title={t("app.expand")}
            >
              <span className="text-white text-xs font-bold">N8</span>
            </button>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <CollapseIcon size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = path === "/" ? location === "/" : location.startsWith(path);
            return (
              <Link key={path} href={path}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm truncate"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-3 border-t border-border text-muted-foreground hover:text-foreground flex justify-center"
          >
            <CollapseIcon size={16} />
          </button>
        )}
      </motion.aside>

      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ [isRTL ? "marginRight" : "marginLeft"]: sidebarCollapsed ? 64 : 240 }}
      >
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
          <h1 className="text-base font-semibold text-foreground">
            {navItems.find(item => item.path === "/" ? location === "/" : location.startsWith(item.path))?.label ?? ""}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors text-foreground"
            >
              {language === "ar" ? "EN" : "عر"}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <User size={16} className="text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground hidden sm:block">{user?.username}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut size={16} className="me-2" />
                  {t("app.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
