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
      // LOCK KE 'id'. Jangan biarkan berubah.
      language: 'id', 
      
      // Walaupun dipanggil, paksa tetap 'id'
      setLanguage: (lang) => {
        const lockedLang = 'id'; 
        i18n.changeLanguage(lockedLang);
        set({ language: lockedLang });
      },

      // Theme tetap jalan normal
      theme: 'default',
      setTheme: (theme) => set({ theme }),

      isSettingsOpen: false,
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
    }),
    {
      name: 'aya-arjuna-settings',
      // Saat website di-refresh, paksa balik ke ID
      onRehydrateStorage: () => (state) => {
        i18n.changeLanguage('id'); 
      }
    }
  )
);