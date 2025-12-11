import type { SongItem } from '../../../types';
import { PlayCircle, Clock, Calendar, Mic2, Music } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { usePlayerStore } from '../../../store/usePlayerStore';

interface SongCardProps {
  item: SongItem;
  playlistContext?: SongItem[]; // Prop baru: Daftar lagu teman-temannya
  onPlay?: (url: string) => void; 
}

export default function SongCard({ item, playlistContext }: SongCardProps) {
  const { playSong } = usePlayerStore();
  const isOriginal = item.type === 'original';

  const handlePlay = () => {
    // Kirim lagu + playlistnya ke store
    playSong(item, playlistContext);
  };

  return (
    <div className="group relative bg-dark-surface rounded-xl overflow-hidden border border-dark-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10 flex flex-col h-full">
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={handlePlay}
      >
        <img 
          src={item.thumbnail_url || "https://placehold.co/400?text=No+Cover"} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <PlayCircle size={64} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
        </div>
        <span className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1 ${isOriginal ? 'bg-primary text-white' : 'bg-purple-600 text-white'}`}>
          {isOriginal ? <Music size={12} /> : <Mic2 size={12} />}
          {item.type.toUpperCase()}
        </span>
        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded backdrop-blur-sm flex items-center gap-1">
          <Clock size={12} /> {item.duration}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
          <Calendar size={12} />
          {formatDate(item.release_date)}
        </div>
        <h3 className="text-white font-bold text-lg leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-white/50 text-sm mb-4">
          by {item.talent === 'duet' ? 'Aya & Arjuna' : (item.talent === 'aya' ? 'Aya Aulya' : 'Arjuna Arkana')}
        </p>
        <button 
          onClick={handlePlay}
          className="mt-auto w-full py-2 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-white/70 text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <PlayCircle size={16} /> Putar Lagu
        </button>
      </div>
    </div>
  );
}