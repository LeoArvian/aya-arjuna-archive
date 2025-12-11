import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MultilingualText } from '../../../types'; 

interface SpriteViewerProps {
  sprites: string[]; // Array URL gambar
  talentName: string | MultilingualText;
}

export default function SpriteViewer({ sprites, talentName }: SpriteViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validSprites = sprites.filter(s => s && s.length > 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // LOGIKA NAMA (Safety Check)
  let nameString = '';
  if (typeof talentName === 'string') {
    nameString = talentName;
  } else if (talentName && typeof talentName === 'object' && talentName.id) {
    nameString = talentName.id; 
  }

  // --- LOGIKA AUTO SLIDE ---
  // Fungsi untuk reset timer saat interaksi manual
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (validSprites.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validSprites.length);
      }, 5000); // 5 Detik
    }
  };

  useEffect(() => {
    resetTimer(); // Mulai timer saat mount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current); // Bersihkan saat unmount
    };
  }, [validSprites.length]); // Reset jika jumlah sprite berubah

  const nextSprite = () => {
    setCurrentIndex((prev) => (prev + 1) % validSprites.length);
    resetTimer(); // Reset timer saat klik manual
  };

  const prevSprite = () => {
    setCurrentIndex((prev) => (prev - 1 + validSprites.length) % validSprites.length);
    resetTimer(); // Reset timer saat klik manual
  };

  if (validSprites.length === 0) return (
     <div className="flex flex-col items-center justify-center h-[400px] md:h-[600px] text-white/50 bg-dark-surface/50 rounded-xl border border-dashed border-white/10">
        <span className="text-2xl mb-4">🖼️</span>
        <p>No Sprite Available.</p>
     </div>
  );

  return (
    // Container Responsif: Mobile agak pendek (500px), Desktop tinggi (800px)
    <div className="relative h-[500px] md:h-[800px] w-full flex items-center justify-center overflow-hidden bg-dark-surface/30 rounded-3xl border border-white/5 shadow-2xl group">
      
      {/* Background Effect: Glow Halus di belakang karakter */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10 opacity-50 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
      
      {/* Sprite Image dengan Animasi Fade & Scale */}
      <AnimatePresence mode='wait'>
        <motion.img
          key={currentIndex}
          src={validSprites[currentIndex]}
          alt={`${nameString} costume ${currentIndex + 1}`}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // Object contain agar full body terlihat utuh
          className="h-[95%] w-auto object-contain z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] relative top-4"
        />
      </AnimatePresence>

      {/* Navigasi (Hanya muncul jika sprite > 1) */}
      {validSprites.length > 1 && (
        <>
          {/* Tombol Kiri */}
          <button 
            onClick={prevSprite}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-primary text-white rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Tombol Kanan */}
          <button 
            onClick={nextSprite}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-primary text-white rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indikator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-2 bg-black/30 rounded-full backdrop-blur-sm border border-white/5">
            {validSprites.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'bg-primary w-6' : 'bg-white/30 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}