import { supabase } from '../lib/supabaseClient';
import type { TalentProfile } from '../types';

export const dataService = {
  async getProfile(id: string): Promise<TalentProfile | null> {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  // FITUR BARU: Ambil status live untuk Navbar
  async getLiveStatus() {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('id, name, is_live, live_url');

    if (error) return [];
    return data as { id: string; name: any; is_live: boolean; live_url: string }[];
  }
};