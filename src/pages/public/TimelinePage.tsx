import { useState, useEffect } from 'react';
import { timelineService } from '../../services/timelineService';
import type { TimelineItem } from '../../types';
import TimelineFilters from '../../components/features/timeline/TimelineFilters';
import TimelineCard from '../../components/features/timeline/TimelineCard';
import VideoModal from '../../components/features/timeline/VideoModal';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CoolLoader from '../../components/shared/CoolLoader';

export default function TimelinePage({ talentFilter }: { talentFilter?: string }) {
  const { t } = useTranslation();
  
  // State Data
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // State Filters
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // State Modal Video
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await timelineService.getTimeline({
          page,
          limit: itemsPerPage,
          search,
          year,
          month,
          sort,
          talent: talentFilter // Filter otomatis jika ada props (misal dari profil Aya)
        });
        
        setItems(res.data);
        setTotalItems(res.total);
      } catch (error) {
        console.error("Gagal mengambil data timeline:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [page, search, year, month, sort, talentFilter]);

  // Reset page ke 1 jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, year, month, sort, talentFilter]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePlayVideo = (url: string) => {
    setActiveVideoUrl(url);
    setModalOpen(true);
  };

  return (
    // Logika Class: Jika di dalam profil (ada talentFilter), hapus padding dan margin atas
    <div className={`bg-dark-bg pb-20 ${talentFilter ? 'px-0 pt-0' : 'min-h-screen px-4 md:px-8 pt-8'}`}>
      <div className="container mx-auto max-w-6xl">
        
        {/* Sembunyikan Judul Halaman jika sedang di dalam Tab Profil */}
        {!talentFilter && (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">{t('timeline.title')}</h1>
            <p className="text-white/50 mb-8">{t('timeline.desc')}</p>
          </>
        )}

        {/* Komponen Filter */}
        <TimelineFilters 
          search={search} setSearch={setSearch}
          year={year} setYear={setYear}
          month={month} setMonth={setMonth}
          sort={sort} setSort={setSort}
        />

        {/* Grid Content */}
        {loading ? (
          <div className="w-full">
             <CoolLoader text={t('timeline.loading')} />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <TimelineCard key={item.id} item={item} onPlay={handlePlayVideo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/30 bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-xl">{t('timeline.no_data')}</p>
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

      {/* Video Modal Popup */}
      <VideoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        videoUrl={activeVideoUrl} 
      />
    </div>
  );
}