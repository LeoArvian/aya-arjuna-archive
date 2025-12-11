import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import type { ActivityLog } from '../types';

export const logService = {
  // Mencatat aktivitas
  async addLog(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER', section: string, details: string) {
    const currentUser = useAuthStore.getState().user;
    // Kalau tidak ada user login (misal user biasa kirim guestbook), skip log admin atau catat sebagai 'System'
    // Disini kita asumsikan hanya admin yg login yg dicatat
    if (!currentUser) return;

    const { error } = await supabase.from('activity_logs').insert({
      admin_id: currentUser.id,
      action_type: action,
      target_section: section,
      details: details
    });

    if (error) console.error("Gagal mencatat log:", error);
  },

  // Ambil semua log
  async getLogs() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        admin:admin_users!admin_id (username, role)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    return data.map((log: any) => ({
      ...log,
      admin_name: log.admin?.username || 'Unknown',
      admin_role: log.admin?.role || 'unknown'
    })) as ActivityLog[];
  },

  // === LOGIKA KEAMANAN KHUSUS ===
  
  // Hapus satu log (MENCATAT PELANGGARAN)
  async deleteLog(id: string) {
    // 1. Catat dulu siapa yang mencoba menghapus jejak
    // Kita beri label "SECURITY_ALERT" agar mudah difilter Leader
    await this.addLog('DELETE', 'SECURITY_ALERT', `MENGHAPUS SATU LOG AKTIVITAS (ID: ${id}). Tindakan mencurigakan.`);

    // 2. Baru hapus
    const { error } = await supabase.from('activity_logs').delete().eq('id', id);
    if (error) throw error;
  },

  // Hapus banyak log sekaligus (MENCATAT PELANGGARAN BERAT)
  async deleteLogs(ids: string[]) {
    // 1. Catat pelanggaran massal
    await this.addLog('DELETE', 'SECURITY_ALERT', `MENGHAPUS ${ids.length} LOG AKTIVITAS SEKALIGUS. Potensi penghilangan jejak.`);

    // 2. Baru hapus
    const { error } = await supabase.from('activity_logs').delete().in('id', ids);
    if (error) throw error;
  }
};