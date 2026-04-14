import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n/config';

type Language = 'ar' | 'en';
type Theme = 'light' | 'dark';
type ChatMode = 'beginner' | 'expert';

interface AppState {
  language: Language;
  theme: Theme;
  chatMode: ChatMode;
  sidebarCollapsed: boolean;
  sendOnEnter: boolean;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  setChatMode: (mode: ChatMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSendOnEnter: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ar',
      theme: 'light',
      chatMode: 'beginner',
      sidebarCollapsed: false,
      sendOnEnter: true,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSendOnEnter: (value) => set({ sendOnEnter: value }),
      toggleLanguage: () =>
        set((state) => {
          const newLang = state.language === 'ar' ? 'en' : 'ar';
          i18n.changeLanguage(newLang);
          document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = newLang;
          return { language: newLang };
        }),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),
      setChatMode: (mode) => set({ chatMode: mode }),
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          i18n.changeLanguage(state.language);
          document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = state.language;
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
