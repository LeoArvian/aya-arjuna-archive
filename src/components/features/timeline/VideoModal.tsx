import { useEffect, useState, useRef } from 'react';
import { X, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Listener untuk perubahan fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.error("Gagal masuk fullscreen", err);
      }
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && videoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            ref={containerRef} 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative bg-black overflow-hidden shadow-2xl flex flex-col justify-center ${isFullscreen ? 'w-screen h-screen' : 'w-full max-w-5xl aspect-video rounded-xl border border-white/10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* PERBAIKAN DI SINI:
                1. Menghapus 'opacity-0 hover:opacity-100' agar selalu muncul.
                2. Menambah 'pointer-events-none' pada container agar klik di area kosong tembus ke video.
            */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-2 z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              
              {/* Tombol Fullscreen (pointer-events-auto agar bisa diklik) */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm pointer-events-auto"
                title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>

              {/* Tombol Close (pointer-events-auto agar bisa diklik) */}
              <button
                onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen();
                    onClose();
                }}
                className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm pointer-events-auto"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Iframe Youtube */}
            <div className="w-full h-full bg-black">
                <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
                ></iframe>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}