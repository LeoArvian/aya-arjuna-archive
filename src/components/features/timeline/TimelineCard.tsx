import type { TimelineItem } from '../../../types';
import { PlayCircle, ExternalLink, Calendar, Lock } from 'lucide-react'; // Tambah icon Lock
import { formatDate } from '../../../lib/utils';
import { toast } from 'sonner'; // Import toast untuk notifikasi

interface TimelineCardProps {
  item: TimelineItem;
  onPlay: (url: string) => void;
}

export default function TimelineCard({ item, onPlay }: TimelineCardProps) {
  
  const getBadgeColor = (badge: string) => {
    if (badge === 'membership') return 'bg-green-600 text-white shadow-green-900/20';
    if (badge === 'upcoming') return 'bg-gray-600 text-white shadow-gray-900/20';
    if (badge === 'original') return 'bg-primary text-white shadow-primary/20'; 
    if (badge === 'cover') return 'bg-purple-600 text-white shadow-purple-900/20'; 
    return 'hidden'; 
  };

  const handleAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // === LOGIKA BARU: CEK MEMBERSHIP ===
    if (item.badge === 'membership') {
      toast("Konten Khusus Membership", {
        description: "Video ini hanya tersedia untuk member. Silakan tonton langsung di YouTube channel mereka.",
        action: {
          label: "Buka YouTube",
          onClick: () => window.open(item.url, '_blank')
        },
        duration: 5000, // Muncul selama 5 detik
        icon: <Lock className="text-green-500" size={18} />
      });
      return; // Stop di sini, jangan buka player
    }

    // Jika bukan membership, lanjut seperti biasa
    if (item.type === 'stream' || item.type === 'video') {
      if (item.url) {
        onPlay(item.url);
      } else {
        toast.error("Link video tidak tersedia");
      }
    } else {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div 
      className="group relative bg-dark-surface rounded-xl overflow-hidden border border-dark-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10 cursor-pointer flex flex-col h-full"
      onClick={handleAction} 
    >
      
      {/* 1. Thumbnail / Cover */}
      <div className="relative aspect-video overflow-hidden bg-black">
        <img 
          src={item.thumbnail_url || "https://placehold.co/600x400/1a1a1a/FFF?text=No+Image"} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay Icon (Berubah jadi Gembok jika Membership) */}
        {(item.type === 'stream' || item.type === 'video') && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
            {item.badge === 'membership' ? (
               <Lock size={48} className="text-green-400 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
            ) : (
               <PlayCircle size={48} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
            )}
          </div>
        )}

        {/* Badge */}
        {item.badge !== 'none' && (
          <span className={`absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full shadow-lg ${getBadgeColor(item.badge)}`}>
            {item.badge}
          </span>
        )}

        {/* Tipe Label */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] uppercase font-bold rounded tracking-wider backdrop-blur-sm">
          {item.type}
        </span>
      </div>

      {/* 2. Content Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
          <Calendar size={12} />
          {formatDate(item.date)}
        </div>

        <h3 className="text-white font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        {/* Tombol Aksi (Menyesuaikan status membership) */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            handleAction();
          }}
          className={`w-full py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 mt-auto ${
            item.badge === 'membership' 
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white' 
              : 'bg-white/5 hover:bg-primary hover:text-white text-white/70'
          }`}
        >
          {item.badge === 'membership' ? (
            <> <Lock size={16} /> Member Only </>
          ) : (item.type === 'stream' || item.type === 'video') ? (
            <> <PlayCircle size={16} /> Tonton Video </>
          ) : (
            <> <ExternalLink size={16} /> Lihat Postingan </>
          )}
        </button>
      </div>
    </div>
  );
}