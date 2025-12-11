import { supabase } from '../lib/supabaseClient';
import type { TimelineItem, MemoryItem, SongItem, TalentProfile } from '../types';
import { logService } from './logService';

export const contentService = {
  // ... (kode uploadFile, timeline, memories, songs TETAP SAMA, jangan dihapus) ...
  async uploadFile(file: File, folder: string) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from('public-assets').upload(`${folder}/${fileName}`, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('public-assets').getPublicUrl(`${folder}/${fileName}`);
    return publicUrl.publicUrl;
  },

  // === TIMELINE ===
  async createTimeline(item: Omit<TimelineItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('content_timeline').insert(item).select().single();
    if (error) throw error;
    logService.addLog('CREATE', 'Timeline', `Menambah aktivitas: ${item.title}`);
    return data;
  },
  async updateTimeline(id: string, updates: Partial<TimelineItem>) {
    const { data, error } = await supabase.from('content_timeline').update(updates).eq('id', id).select().single();
    if (error) throw error;
    logService.addLog('UPDATE', 'Timeline', `Mengedit aktivitas: ${updates.title || id}`);
    return data;
  },
  async deleteTimeline(id: string) {
    const { error } = await supabase.from('content_timeline').delete().eq('id', id);
    if (error) throw error;
    logService.addLog('DELETE', 'Timeline', `Menghapus aktivitas ID: ${id}`);
  },

  // === MEMORIES ===
  async createMemory(item: Omit<MemoryItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('content_memories').insert(item).select().single();
    if (error) throw error;
    logService.addLog('CREATE', 'Memories', `Upload kenangan: ${item.title}`);
    return data;
  },
  async updateMemory(id: string, updates: Partial<MemoryItem>) {
    const { data, error } = await supabase.from('content_memories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    logService.addLog('UPDATE', 'Memories', `Edit kenangan: ${updates.title || id}`);
    return data;
  },
  async deleteMemory(id: string) {
    const { error } = await supabase.from('content_memories').delete().eq('id', id);
    if (error) throw error;
    logService.addLog('DELETE', 'Memories', `Hapus kenangan ID: ${id}`);
  },

  // === SONGS ===
  async createSong(item: Omit<SongItem, 'id' | 'created_at'>) {
    const { data: songData, error } = await supabase.from('content_songs').insert(item).select().single();
    if (error) throw error;
    const timelineItem = {
      talent: item.talent as any,
      title: `Rilis Lagu: ${item.title}`, 
      description: `Tonton lagu terbaru ${item.title} (${item.type}) sekarang!`,
      type: 'video', 
      badge: item.type as any, 
      date: `${item.release_date}T12:00:00`, 
      url: item.youtube_url,
      thumbnail_url: item.thumbnail_url
    };
    await supabase.from('content_timeline').insert(timelineItem);
    logService.addLog('CREATE', 'Songs', `Upload lagu: ${item.title} (+Timeline)`);
    return songData;
  },
  async updateSong(id: string, updates: Partial<SongItem>) {
    const { data: oldData } = await supabase.from('content_songs').select('youtube_url').eq('id', id).single();
    const { data, error } = await supabase.from('content_songs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (oldData && oldData.youtube_url) {
      const timelineUpdates: any = {};
      if (updates.title) timelineUpdates.title = `Rilis Lagu: ${updates.title}`;
      if (updates.talent) timelineUpdates.talent = updates.talent;
      if (updates.type) timelineUpdates.badge = updates.type;
      if (updates.release_date) timelineUpdates.date = `${updates.release_date}T12:00:00`;
      if (updates.youtube_url) timelineUpdates.url = updates.youtube_url;
      if (updates.thumbnail_url) timelineUpdates.thumbnail_url = updates.thumbnail_url;
      if (Object.keys(timelineUpdates).length > 0) {
        await supabase.from('content_timeline').update(timelineUpdates).eq('url', oldData.youtube_url); 
      }
    }
    logService.addLog('UPDATE', 'Songs', `Edit lagu: ${updates.title || id}`);
    return data;
  },
  async deleteSong(id: string) {
    const { data: songData } = await supabase.from('content_songs').select('youtube_url').eq('id', id).single();
    const { error } = await supabase.from('content_songs').delete().eq('id', id);
    if (error) throw error;
    if (songData && songData.youtube_url) {
      await supabase.from('content_timeline').delete().eq('url', songData.youtube_url);
    }
    logService.addLog('DELETE', 'Songs', `Hapus lagu ID: ${id}`);
  },

  // === PROFILE (Upsert untuk Edit Profil Lengkap) ===
  async updateProfile(id: string, updates: Partial<TalentProfile>) {
    const { data, error } = await supabase.from('talent_profiles').upsert({ id, ...updates }).select().single();
    if (error) throw error;
    logService.addLog('UPDATE', 'Profile', `Update profil talent: ${id}`);
    return data;
  },

  // === FITUR BARU: UPDATE LIVE CONFIG (Update Ringan) ===
  async updateLiveConfig(id: string, updates: { is_live?: boolean; live_url?: string }) {
    // Gunakan .update() bukan .upsert() agar tidak error validasi data lain
    const { data, error } = await supabase
      .from('talent_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};