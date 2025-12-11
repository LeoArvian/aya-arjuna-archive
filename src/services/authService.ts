import { supabase } from '../lib/supabaseClient';
import type { AdminUser } from '../types';

export const authService = {
  // Fungsi Login
  async login(username: string, passwordInput: string): Promise<{ user: AdminUser | null; error: string | null }> {
    try {
      // 1. Cari user berdasarkan username di tabel 'admin_users'
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        return { user: null, error: 'Username tidak ditemukan.' };
      }

      // 2. Cek Password
      // CATATAN: Untuk keamanan production, password harus di-hash (bcrypt). 
      // Tapi untuk MVP ini sesuai request, kita bandingkan langsung string-nya dulu.
      // Nanti bisa diupgrade.
      if (data.password_hash !== passwordInput) {
        return { user: null, error: 'Password salah.' };
      }

      // 3. Cek apakah akun dikunci (Locked)
      if (data.is_locked) {
        return { user: null, error: 'Akun ini sedang dikunci oleh Leader.' };
      }

      // 4. Update last_login di database
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      // Kembalikan data user (tanpa password)
      const user: AdminUser = {
        id: data.id,
        username: data.username,
        role: data.role,
        avatar_url: data.avatar_url,
        is_locked: data.is_locked,
        created_at: data.created_at,
        created_by: data.created_by,
      };

      return { user, error: null };

    } catch (err) {
      console.error('Login error:', err);
      return { user: null, error: 'Terjadi kesalahan sistem.' };
    }
  },

  // Fungsi Logout (Opsional jika mau log aktivitas ke DB)
  async logout() {
    // Bisa tambahkan log activity di sini nanti
    return true;
  }
};