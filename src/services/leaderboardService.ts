import { supabase } from '../lib/supabaseClient';

export interface LeaderboardEntry {
  player_name: string;
  score: number;
  rank?: number;
  is_current_user?: boolean;
}

export const leaderboardService = {
  // 1. Ambil Top 10 Leaderboard
  async getLeaderboard(gameId: string) {
    const { data, error } = await supabase
      .from('game_leaderboards')
      .select('player_name, score, player_id')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  },

  // 2. Ambil Posisi Player (Jika di luar 10 besar)
  async getUserStats(gameId: string, playerId: string) {
    // Ambil data user
    const { data: userData, error } = await supabase
      .from('game_leaderboards')
      .select('score, player_name')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .single();

    if (error || !userData) return null;

    // Hitung Ranking (Jumlah orang yang skornya lebih tinggi + 1)
    const { count } = await supabase
      .from('game_leaderboards')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .gt('score', userData.score);

    return {
      player_name: userData.player_name,
      score: userData.score,
      rank: (count || 0) + 1
    };
  },

  // 3. Submit Score (Cek dulu skor lama, kalau lebih tinggi baru update)
  async submitScore(gameId: string, playerId: string, playerName: string, newScore: number) {
    // Cek skor lama dulu
    const { data: existing } = await supabase
      .from('game_leaderboards')
      .select('score')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .single();

    // Jika sudah ada data dan skor baru LEBIH KECIL/SAMA, jangan update db
    if (existing && existing.score >= newScore) {
       // Tetap update nama jika user ganti nama
       await supabase
         .from('game_leaderboards')
         .update({ player_name: playerName })
         .eq('game_id', gameId)
         .eq('player_id', playerId);
       return; 
    }

    // Jika belum ada atau skor baru REKOR BARU -> UPSERT
    const { error } = await supabase
      .from('game_leaderboards')
      .upsert({ 
        game_id: gameId, 
        player_id: playerId, 
        player_name: playerName,
        score: newScore 
      }, { onConflict: 'game_id, player_id' });

    if (error) console.error('Gagal save skor:', error);
  }
};