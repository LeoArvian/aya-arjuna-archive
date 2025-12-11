import { useState, useEffect } from 'react';
import { songsService } from '../../services/songsService';
import type { SongItem } from '../../types';
import SongFilters from '../../components/features/songs/SongFilters';
import SongCard from '../../components/features/songs/SongCard';
import VideoModal from '../../components/features/timeline/VideoModal';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CoolLoader from '../../components/shared/CoolLoader';

export default function SongsPage({ talentFilter }: { talentFilter?: string }) {
  const { t } = useTranslation();

  // State Data
  const [items, setItems] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // State Filters
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // State Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await songsService.getSongs({
          page,
          limit: itemsPerPage,
          search,
          sort,
          typeFilter,
          talent: talentFilter // Filter talent dari props
        });
        
        setItems(res.data);
        setTotalItems(res.total);
      } catch (error) {
        console.error("Gagal mengambil lagu:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 500);
    return () => clearTimeout(timeoutId);
  }, [page, search, sort, typeFilter, talentFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, sort, typeFilter, talentFilter]);

  const handlePlay = (url: string) => {
    setActiveVideoUrl(url);
    setModalOpen(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className={`bg-dark-bg pb-20 ${talentFilter ? 'px-0 pt-0' : 'min-h-screen px-4 md:px-8 pt-8'}`}>
      <div className="container mx-auto max-w-7xl">
        
        {!talentFilter && (
          <>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Headphones size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('songs.title')}</h1>
                    <p className="text-white/50">{t('songs.desc')}</p>
                </div>
            </div>
            <div className="h-8"></div>
          </>
        )}

        {/* Filters */}
        <SongFilters 
          search={search} setSearch={setSearch}
          sort={sort} setSort={setSort}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        />

        {/* Content */}
        {loading ? (
          <div className="w-full">
            <CoolLoader text={t('songs.loading')} />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
            <SongCard 
              key={item.id} 
              item={item} 
              playlistContext={items} // <--- INI KUNCINYA: Kirim seluruh list yang tampil
              onPlay={handlePlay} 
            />
          ))}
        </div>
        ) : (
          <div className="text-center py-20 text-white/30 bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-xl">{t('songs.no_data')}</p>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button 
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:bg-primary disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft size={20} />
            </button>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:bg-primary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 mx-4 text-white font-bold">
               Page {page} of {totalPages}
            </div>

            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:bg-primary disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:bg-primary disabled:opacity-30 transition-colors"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
        )}

      </div>

      {/* Video Modal */}
      <VideoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        videoUrl={activeVideoUrl} 
      />
    </div>
  );
}