import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Music, Calendar, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { songsService } from '../../services/songsService';
import { timelineService } from '../../services/timelineService';
import { memoriesService } from '../../services/memoriesService';
import { useDebounce } from '../../hooks/useDebounce';

// Tipe hasil pencarian
type SearchResult = {
  id: string;
  title: string;
  type: 'song' | 'timeline' | 'memory';
  detail: string;
  image: string;
  link: string;
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Gunakan Hook Debounce (Delay 500ms)
  const debouncedQuery = useDebounce(query, 500);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Handle Focus Input & Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      // Focus ke input saat modal terbuka
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery(''); // Reset query saat tutup
      setResults([]);
    }
  }, [isOpen]);

  // 2. Handle Tombol ESC (Keyboard) - PERBAIKAN UTAMA
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 3. Logika Pencarian (Jalan setiap debouncedQuery berubah)
  useEffect(() => {
    const searchAll = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const [songs, timeline, memories] = await Promise.all([
          songsService.getSongs({ search: debouncedQuery, limit: 3 }),
          timelineService.getTimeline({ search: debouncedQuery, limit: 3 }),
          memoriesService.getMemories({ search: debouncedQuery, limit: 3 })
        ]);

        const combined: SearchResult[] = [
          ...songs.data.map(s => ({
            id: s.id,
            title: s.title,
            type: 'song' as const,
            detail: `${s.talent} • ${s.type}`,
            image: s.thumbnail_url,
            link: `/songs`
          })),
          ...timeline.data.map(t => ({
            id: t.id,
            title: t.title,
            type: 'timeline' as const,
            detail: new Date(t.date).toLocaleDateString(),
            image: t.thumbnail_url,
            link: `/timeline`
          })),
          ...memories.data.map(m => ({
            id: m.id,
            title: m.title,
            type: 'memory' as const,
            detail: `by ${m.author_name}`,
            image: m.media_url,
            link: `/memories`
          }))
        ];

        setResults(combined);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setLoading(false);
      }
    };

    searchAll();
  }, [debouncedQuery]);

  const handleSelect = (link: string) => {
    navigate(link);
    onClose();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'song': return <Music size={16} className="text-purple-400"/>;
      case 'timeline': return <Calendar size={16} className="text-blue-400"/>;
      case 'memory': return <ImageIcon size={16} className="text-pink-400"/>;
      default: return <Search size={16}/>;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 md:pt-20 px-4">
        
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="w-full max-w-2xl bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]"
        >
          {/* Header Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/20">
            <Search className="text-white/50 shrink-0" size={20} />
            <input 
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari lagu, timeline, atau karya fans..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-base md:text-lg h-10 min-w-0"
            />
            
            {/* Loader & Close Button */}
            <div className="flex items-center gap-2 shrink-0">
               {loading && <Loader2 className="animate-spin text-primary" size={20}/>}
               
               {/* TOMBOL CLOSE RESPONSIVE */}
               <button 
                  onClick={onClose} 
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
                  title="Tutup Pencarian (ESC)"
               >
                  {/* Mobile: Icon X */}
                  <span className="md:hidden flex items-center justify-center">
                    <X size={18} />
                  </span>
                  
                  {/* Desktop: Text 'ESC' */}
                  <span className="hidden md:inline-block text-xs font-bold px-1">
                    ESC
                  </span>
               </button>
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto custom-scrollbar p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                 {results.map((item) => (
                   <button
                     key={`${item.type}-${item.id}`}
                     onClick={() => handleSelect(item.link)}
                     className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                   >
                      <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-white/10">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-white font-bold truncate group-hover:text-primary transition-colors">{item.title}</h4>
                         <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                            {getIcon(item.type)}
                            <span className="uppercase font-bold text-[10px] tracking-wider">{item.type}</span>
                            <span>•</span>
                            <span className="truncate">{item.detail}</span>
                         </div>
                      </div>
                      <ArrowRight size={16} className="text-white/20 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
                   </button>
                 ))}
              </div>
            ) : (
              <div className="py-12 text-center text-white/30">
                {query ? (
                  <p>Tidak ditemukan hasil untuk "{query}"</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Search size={40} className="opacity-20 mb-2"/>
                    <p>Ketik untuk mulai mencari...</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer Hint (Hanya tampil di desktop) */}
          <div className="hidden md:flex p-3 bg-black/40 border-t border-white/5 text-[10px] text-white/30 justify-between">
             <span>Protip: Gunakan tombol panah untuk navigasi (Next Update)</span>
             <span>Aya & Arjuna Archive</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}