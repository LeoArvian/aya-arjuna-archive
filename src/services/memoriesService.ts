import { supabase } from '../lib/supabaseClient';
import type { MemoryItem } from '../types';

export const memoriesService = {
  async getMemories({
    page = 1,
    limit = 10,
    search = '',
    year = '',
    month = '',
    sort = 'desc',
    talent = '' // Tambahkan parameter
  }: {
    page?: number;
    limit?: number;
    search?: string;
    year?: string;
    month?: string;
    sort?: 'asc' | 'desc';
    talent?: string;
  }) {
    let query = supabase.from('content_memories').select('*', { count: 'exact' });

    // Filter Talent (Aya/Arjuna + All)
    if (talent && talent !== 'all') {
      query = query.or(`talent.eq.${talent},talent.eq.all`);
    }

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

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
        // Cari semua data di bulan tersebut dari tahun berapapun
        query = query.like('date', `____-${month}-%`);
    }

    query = query.order('date', { ascending: sort === 'asc' });
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching memories:', error);
      return { data: [], total: 0 };
    }

    return { data: data as MemoryItem[], total: count || 0 };
  }
};