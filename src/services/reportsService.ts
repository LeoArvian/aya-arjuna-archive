import { supabase } from '../lib/supabaseClient';
import type { ReportTicket } from '../types';
import { contentService } from './contentService';
import { logService } from './logService';

export const reportsService = {
  // Public: Kirim Laporan (Untuk User)
  async sendReport(data: { category: string; description: string; file?: File }) {
    let imageUrl = '';

    // Jika ada file, upload dulu ke bucket 'reports'
    if (data.file) {
      // Pastikan bucket 'reports' atau 'public-assets' sudah ada/diizinkan
      try {
        imageUrl = await contentService.uploadFile(data.file, 'reports');
      } catch (e) {
        console.error("Gagal upload gambar laporan", e);
        // Lanjut kirim laporan tanpa gambar jika upload gagal
      }
    }

    const { error } = await supabase.from('report_tickets').insert({
      category: data.category,
      description: data.description,
      image_url: imageUrl,
      status: 'pending'
    });

    if (error) throw error;
  },

  // Admin: Ambil Semua Laporan
  async getReports() {
    const { data, error } = await supabase
      .from('report_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ReportTicket[];
  },

  // Admin: Tandai Selesai
  async resolveReport(id: string) {
    const { error } = await supabase
      .from('report_tickets')
      .update({ status: 'resolved' })
      .eq('id', id);
    if (error) throw error;

    // LOG AKTIVITAS
    logService.addLog('UPDATE', 'Reports', `Menyelesaikan laporan masalah ID: ${id}`);
  },

// Admin: Hapus Laporan
  async deleteReport(id: string) {
    const { error } = await supabase
      .from('report_tickets')
      .delete()
      .eq('id', id);
    if (error) throw error;

    // LOG AKTIVITAS
    logService.addLog('DELETE', 'Reports', `Menghapus tiket laporan ID: ${id}`);
  }
};