import type { MemoryItem } from '../../../types';
import { ExternalLink, PlayCircle, Image as ImageIcon, Twitter, Youtube, Instagram, Gamepad2, Download } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface MemoryCardProps {
  item: MemoryItem;
  onPlay: (url: string) => void;
  onZoom: (url: string, title: string, link: string) => void;
}

export default function MemoryCard({ item, onPlay, onZoom }: MemoryCardProps) {
  
  // Menentukan Icon Platform
  const getPlatformIcon = () => {
    switch (item.platform) {
      case 'twitter': return <Twitter size={14} />;
      case 'youtube': return <Youtube size={14} />;
      case 'instagram': return <Instagram size={14} />;
      case 'game_download': 
      case 'game_web': return <Gamepad2 size={14} />; // Icon Game
      default: return <ExternalLink size={14} />;
    }
  };

  const getPlatformLabel = () => {
    switch (item.platform) {
      case 'twitter': return 'Lihat di X';
      case 'youtube': return 'Tonton di YouTube';
      case 'instagram': return 'Lihat di Instagram';
      case 'game_download': return 'Download Game'; // Label Download
      case 'game_web': return 'Mainkan Sekarang'; // Label Main
      default: return 'Lihat Sumber';
    }
  };

  // Handler Klik Sampul
  const handleCoverClick = () => {
    if (item.platform === 'youtube') {
      onPlay(item.platform_url || item.media_url);
    } else if (item.platform === 'game_web') {
      window.open(item.platform_url, '_blank'); // Buka game web di tab baru
    } else if (item.platform === 'game_download') {
      window.open(item.platform_url, '_blank'); // Buka link download
    } else {
      onZoom(item.media_url, item.title, item.platform_url);
    }
  };

  // Handler Klik Button Bawah
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Biar gak trigger zoom
    window.open(item.platform_url, '_blank');
  };

  return (
    <div className="group bg-dark-surface rounded-xl overflow-hidden border border-dark-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10 flex flex-col h-full">
      
      {/* 1. Media Preview */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer bg-black/50"
        onClick={handleCoverClick}
      >
        <img 
          src={item.media_url || "https://placehold.co/400?text=No+Media"} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Icon (Play or Zoom or Game) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          {item.platform === 'youtube' ? (
            <PlayCircle size={48} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
          ) : (item.platform === 'game_web' || item.platform === 'game_download') ? (
            <Gamepad2 size={48} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
          ) : (
            <ImageIcon size={48} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
          )}
        </div>

        {/* Platform Badge (Pojok Kanan Atas) */}
        <span className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-sm text-white ${(item.platform === 'game_web' || item.platform === 'game_download') ? 'bg-primary/80' : 'bg-black/60'}`}>
          {getPlatformIcon()}
        </span>
      </div>

      {/* 2. Content Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <span className="text-xs text-white/40 uppercase tracking-wider">{item.talent === 'all' ? 'Aya & Arjuna' : item.talent}</span>
           <span className="text-xs text-white/40">{formatDate(item.date)}</span>
        </div>

        <h3 className="text-white font-bold text-lg leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        <p className="text-white/60 text-sm line-clamp-3 mb-4 flex-1">
          {item.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
           {/* Author Credit */}
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] text-white font-bold">
                {item.author_name.charAt(0)}
             </div>
             <span className="text-xs text-white/70 truncate max-w-[100px]" title={item.author_name}>
                {item.author_name}
             </span>
           </div>

           {/* Button External */}
           <button 
             onClick={handleExternalClick}
             className={`text-xs font-bold flex items-center gap-1 transition-colors ${(item.platform === 'game_download' || item.platform === 'game_web') ? 'text-green-400 hover:text-green-300' : 'text-primary hover:text-white'}`}
           >
             {getPlatformLabel()} 
             {item.platform === 'game_download' ? <Download size={12}/> : (item.platform === 'game_web' ? <PlayCircle size={12}/> : <ExternalLink size={12} />)}
           </button>
        </div>
      </div>
    </div>
  );
}