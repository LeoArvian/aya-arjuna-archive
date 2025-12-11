import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';

// Tambahkan type ThemeMode
export type Language = 'id' | 'en' | 'jp' | 'ru' | 'kr';
export type ThemeMode = 'default' | 'aya' | 'arjuna'; 

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // State Baru untuk Tema
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'id', 
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      // Default tema
      theme: 'default',
      setTheme: (theme) => set({ theme }),

      isSettingsOpen: false,
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
    }),
    {
      name: 'aya-arjuna-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      }
    }
  )
);