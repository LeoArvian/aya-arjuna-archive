import { useState, useEffect } from 'react';
import { timelineService } from '../../../services/timelineService';
import type { TimelineItem } from '../../../types';
import { Calendar, Radio, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NextStreamWidget() {
  const { t } = useTranslation();
  const [nextStream, setNextStream] = useState<TimelineItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await timelineService.getUpcomingStream();
        setNextStream(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Jika loading, jangan tampilkan apa-apa dulu
  if (loading) return null; 

  // === PERBAIKAN UTAMA ===
  // Jika tidak ada stream (data null), langsung return null.
  // Ini akan membuat widget HILANG sepenuhnya dari halaman.
  if (!nextStream) return null;

  // Helper function untuk format waktu Indonesia yang rapi
  const formatWIB = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format Tanggal: "27 November"
    const datePart = date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long' 
    });
    
    // Format Jam: "20:00"
    const timePart = date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }).replace('.', ':');

    return `${datePart} • ${timePart} WIB`;
  };

  return (
    <div className="bg-gradient-to-r from-red-900/80 to-black/80 border-y border-red-500/30 backdrop-blur-md relative z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* LABEL & INFO */}
          <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
            <div className="flex items-center gap-2 text-red-500 animate-pulse shrink-0">
              <Radio size={20} />
              <span className="font-bold tracking-wider uppercase text-sm">{t('home.next_stream')}</span>
            </div>
            
            <div className="h-6 w-px bg-white/20 hidden md:block"></div>

            {/* STREAM DETAILS */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 overflow-hidden">
              <span className="font-bold text-white truncate">{nextStream.title}</span>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="px-2 py-0.5 rounded bg-white/10 uppercase font-bold">{nextStream.talent}</span>
                <span>•</span>
                <span className="text-yellow-400 flex items-center gap-1 font-bold">
                    <Calendar size={12}/> 
                    {formatWIB(nextStream.date)}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <a 
            href={nextStream.url} 
            target="_blank" 
            rel="noreferrer"
            className="w-full md:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-red-600/20"
          >
            {t('home.remind_me')} <ExternalLink size={16} />
          </a>

        </div>
      </div>
    </div>
  );
}