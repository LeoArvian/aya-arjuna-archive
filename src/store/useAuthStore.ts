import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminUser } from '../types';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  lastActivity: number; // Timestamp aktivitas terakhir
  login: (user: AdminUser) => void;
  logout: () => void;
  checkSession: () => void; // Fungsi untuk cek apakah sesi 24 jam sudah habis
  updateActivity: () => void; // Reset timer 24 jam saat ada aktivitas
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 Jam dalam milidetik

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      lastActivity: 0,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          lastActivity: Date.now(),
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          lastActivity: 0,
        });
      },

      updateActivity: () => {
        // Panggil ini setiap kali user melakukan aksi (klik/ketik)
        set({ lastActivity: Date.now() });
      },

      checkSession: () => {
        const { lastActivity, isAuthenticated, logout } = get();
        if (!isAuthenticated) return;

        const now = Date.now();
        // Jika selisih waktu sekarang dengan terakhir aktif > 24 jam, logout paksa
        if (now - lastActivity > SESSION_DURATION) {
          console.log("Sesi berakhir (24 jam timeout)");
          logout();
        }
      },
    }),
    {
      name: 'aya-arjuna-auth', // Nama key di LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);