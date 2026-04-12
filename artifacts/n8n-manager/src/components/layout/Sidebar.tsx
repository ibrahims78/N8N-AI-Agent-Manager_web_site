import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { 
  LayoutDashboard, 
  Workflow, 
  MessageSquare, 
  LayoutTemplate, 
  History, 
  Users, 
  Settings 
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user } = useAuthStore();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: t('app.dashboard') },
    { href: '/workflows', icon: Workflow, label: t('app.workflows') },
    { href: '/chat', icon: MessageSquare, label: t('app.chat') },
    { href: '/templates', icon: LayoutTemplate, label: t('app.templates') },
    { href: '/history', icon: History, label: t('app.history') },
    ...(user?.role === 'admin' ? [{ href: '/users', icon: Users, label: t('app.users') }] : []),
    { href: '/settings', icon: Settings, label: t('app.settings') },
  ];

  return (
    <div className="flex flex-col h-full bg-sidebar border-x border-sidebar-border w-64 flex-shrink-0 z-10 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
        <span className="font-bold text-lg text-sidebar-foreground tracking-tight">N8N AI Manager</span>
      </div>
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group",
                  isActive 
                    ? "text-sidebar-primary-foreground bg-sidebar-primary font-medium" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-sidebar-primary rounded-md shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")} />
                <span className="relative z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
