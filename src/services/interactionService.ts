import { supabase } from '../lib/supabaseClient';

export const interactionService = {
  // Ambil skor saat ini
  async getOshiCounts() {
    const { data, error } = await supabase
      .from('oshi_meter')
      .select('id, count');
    
    if (error) return { aya: 0, arjuna: 0 };
    
    const counts = { aya: 0, arjuna: 0 };
    data?.forEach((item: any) => {
      if (item.id === 'aya') counts.aya = item.count;
      if (item.id === 'arjuna') counts.arjuna = item.count;
    });
    
    return counts;
  },

  // Kirim dukungan (Klik)
  async sendSupport(talentId: 'aya' | 'arjuna') {
    // Panggil fungsi RPC yang kita buat di SQL
    const { error } = await supabase.rpc('increment_oshi', { target_id: talentId });
    if (error) console.error("Gagal kirim dukungan:", error);
  }
};