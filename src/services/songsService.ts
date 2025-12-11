import { supabase } from '../lib/supabaseClient';
import type { SongItem } from '../types';

export const songsService = {
  async getSongs({
    page = 1,
    limit = 12,
    search = '',
    sort = 'desc',
    typeFilter = '',
    talent = '' // Tambahkan parameter
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'asc' | 'desc';
    typeFilter?: string;
    talent?: string;
  }) {
    let query = supabase.from('content_songs').select('*', { count: 'exact' });

    if (talent && talent !== 'duet') query = query.eq('talent', talent); // Filter Talent
    if (search) query = query.ilike('title', `%${search}%`);
    if (typeFilter) query = query.eq('type', typeFilter);

    query = query.order('release_date', { ascending: sort === 'asc' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching songs:', error);
      return { data: [], total: 0 };
    }

    return { data: data as SongItem[], total: count || 0 };
  }
};