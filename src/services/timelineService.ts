import { supabase } from '../lib/supabaseClient';
import type { TimelineItem } from '../types';

export const timelineService = {
  // Ambil data timeline dengan filter kompleks
  async getTimeline({
    page = 1,
    limit = 10,
    search = '',
    year = '',
    month = '',
    sort = 'desc',
    talent = '' 
  }: {
    page?: number;
    limit?: number;
    search?: string;
    year?: string;
    month?: string;
    sort?: 'asc' | 'desc';
    talent?: string;
  }) {
    let query = supabase.from('content_timeline').select('*', { count: 'exact' });

    if (talent) query = query.eq('talent', talent);
    if (search) query = query.ilike('title', `%${search}%`);
    
    // Filter Tahun Saja
    if (year && !month) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31 23:59:59`;
      query = query.gte('date', startDate).lte('date', endDate);
    }
    
    // Filter Tahun DAN Bulan
    if (year && month) {
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const start = `${year}-${month}-01`;
        const end = `${year}-${month}-${lastDay} 23:59:59`;
        query = query.gte('date', start).lte('date', end);
    }

    // Filter Bulan Saja (Tanpa Tahun) - LOGIKA BARU
    if (month && !year) {
        // Menggunakan pattern matching ISO Date: YYYY-MM-DD
        // '____' match 4 digit tahun, lalu bulan yg dipilih
        query = query.like('date', `____-${month}-%`);
    }

    query = query.order('date', { ascending: sort === 'asc' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching timeline:', error);
      return { data: [], total: 0 };
    }

    return { data: data as TimelineItem[], total: count || 0 };
  },

  // === FITUR BARU: NEXT STREAM WIDGET ===
  async getUpcomingStream() {
    const now = new Date().toISOString();
    
    // Ambil 1 stream yang waktunya > sekarang DAN statusnya 'upcoming' atau tipe 'stream'
    const { data, error } = await supabase
      .from('content_timeline')
      .select('*')
      .or(`badge.eq.upcoming,type.eq.stream`) // Bisa badge upcoming ATAU tipe stream
      .gte('date', now) // Wajib di masa depan
      .order('date', { ascending: true }) // Yang paling dekat
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return data as TimelineItem | null;
  }
};