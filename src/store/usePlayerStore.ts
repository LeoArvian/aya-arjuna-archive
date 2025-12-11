import { create } from 'zustand';
import type { SongItem } from '../types';

export type PlayerMode = 'mini' | 'video' | 'focus';

interface PlayerState {
  currentSong: SongItem | null;
  playlist: SongItem[]; // Daftar antrian lagu
  isPlaying: boolean;
  mode: PlayerMode;
  
  // Actions
  playSong: (song: SongItem, playlist?: SongItem[]) => void;
  playNext: () => void;
  playPrev: () => void;
  closePlayer: () => void;
  setMode: (mode: PlayerMode) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  playlist: [],
  isPlaying: false,
  mode: 'video', 
  
  playSong: (song, newPlaylist) => {
    const state = get();
    // Jika ada playlist baru (misal dari halaman Songs), update playlist
    const updatedPlaylist = newPlaylist || state.playlist;

    set({ 
      currentSong: song, 
      playlist: updatedPlaylist,
      isPlaying: true, 
      // Jika mode sedang hidden, buka video. Jika tidak, pertahankan mode (misal lagi di mini/focus)
      mode: state.mode === 'mini' && !state.currentSong ? 'video' : state.mode 
    });
  },

  playNext: () => {
    const { playlist, currentSong } = get();
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length; // Loop ke awal jika habis
    set({ currentSong: playlist[nextIndex], isPlaying: true });
  },

  playPrev: () => {
    const { playlist, currentSong } = get();
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length; // Loop ke akhir
    set({ currentSong: playlist[prevIndex], isPlaying: true });
  },
  
  closePlayer: () => set({ currentSong: null, isPlaying: false, mode: 'video' }),
  setMode: (mode) => set({ mode }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));