import { useState, useEffect } from 'react';
import { memoriesService } from '../../services/memoriesService';
import type { MemoryItem } from '../../types';
import TimelineFilters from '../../components/features/timeline/TimelineFilters';
import MemoryCard from '../../components/features/memories/MemoryCard';
import VideoModal from '../../components/features/timeline/VideoModal';
import ImageViewerModal from '../../components/features/memories/ImageViewerModal';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CoolLoader from '../../components/shared/CoolLoader';

export default function MemoriesPage({ talentFilter }: { talentFilter?: string }) {
  const { t } = useTranslation();

  // State Data
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // State Filters
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // State Modals
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState({ url: '', title: '', link: '' });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await memoriesService.getMemories({
          page,
          limit: itemsPerPage,
          search,
          year,
          month,
          sort,
          talent: talentFilter // Filter talent
        });
        
        setItems(res.data);
        setTotalItems(res.total);
      } catch (error) {
        console.error("Gagal mengambil memories:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 500);
    return () => clearTimeout(timeoutId);
  }, [page, search, year, month, sort, talentFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, year, month, sort, talentFilter]);

  // Handlers
  const handlePlayVideo = (url: string) => {
    setActiveVideoUrl(url);
    setVideoModalOpen(true);
  };

  const handleZoomImage = (url: string, title: string, link: string) => {
    setActiveImage({ url, title, link });
    setImageModalOpen(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className={`bg-dark-bg pb-20 ${talentFilter ? 'px-0 pt-0' : 'min-h-screen px-4 md:px-8 pt-8'}`}>
      <div className="container mx-auto max-w-7xl">
        
        {!talentFilter && (
          <>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('memories.title')}</h1>
                    <p className="text-white/50">{t('memories.desc')}</p>
                </div>
            </div>
            <div className="h-8"></div>
          </>
        )}

        <TimelineFilters 
          search={search} setSearch={setSearch}
          year={year} setYear={setYear}
          month={month} setMonth={setMonth}
          sort={sort} setSort={setSort}
        />

        {/* Grid Content */}
        {loading ? (
          <div className="w-full">
             <CoolLoader text={t('memories.loading')} />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
              <MemoryCard 
                key={item.id} 
                item={item} 
                onPlay={handlePlayVideo} 
                onZoom={handleZoomImage} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/30 bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-xl">{t('memories.no_data')}</p>
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

      {/* Modals */}
      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
        videoUrl={activeVideoUrl} 
      />
      <ImageViewerModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={activeImage.url}
        title={activeImage.title}
        originalLink={activeImage.link}
      />
    </div>
  );
}