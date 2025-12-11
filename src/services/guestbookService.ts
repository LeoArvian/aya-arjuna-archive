import { supabase } from '../lib/supabaseClient';
import type { GuestbookMessage } from '../types';
import { logService } from './logService'; // Import logService

export const guestbookService = {
  // Public: Kirim Pesan
  async sendMessage(name: string, message: string) {
    const { error } = await supabase
      .from('guestbook')
      .insert({ sender_name: name, message: message, status: 'pending' });
    
    if (error) throw error;
  },

  // Public: Ambil Pesan yang Approved
  async getApprovedMessages() {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as GuestbookMessage[];
  },

  // Admin: Ambil Semua Pesan
  async getAllMessages() {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GuestbookMessage[];
  },

  // Admin: Approve
  async approveMessage(id: string) {
    const { error } = await supabase
      .from('guestbook')
      .update({ status: 'approved' })
      .eq('id', id);
    if (error) throw error;
    
    // LOG AKTIVITAS
    logService.addLog('UPDATE', 'Guestbook', `Menyetujui pesan fans ID: ${id}`);
  },

  // Admin: Delete
  async deleteMessage(id: string) {
    // Ambil data dulu buat log detail (siapa pengirimnya)
    const { data } = await supabase.from('guestbook').select('sender_name').eq('id', id).single();
    
    const { error } = await supabase
      .from('guestbook')
      .delete()
      .eq('id', id);
    if (error) throw error;

    // LOG AKTIVITAS
    logService.addLog('DELETE', 'Guestbook', `Menghapus pesan fans dari: ${data?.sender_name || 'Unknown'}`);
  }
};