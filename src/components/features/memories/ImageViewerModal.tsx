import { useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  originalLink?: string;
}

export default function ImageViewerModal({ isOpen, onClose, imageUrl, title, originalLink }: ImageViewerModalProps) {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          {/* Controls Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white font-medium truncate max-w-md hidden md:block">{title}</h3>
            <div className="flex items-center gap-4 ml-auto">
              {originalLink && (
                <a 
                  href={originalLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  title="Lihat Sumber Asli"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={20} />
                </a>
              )}
              <a 
                href={imageUrl} 
                download 
                target="_blank"
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                title="Download / Buka Full"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={20} />
              </a>
              <button
                onClick={onClose}
                className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center pointer-events-none"
          >
            <img 
              src={imageUrl} 
              alt={title} 
              className="max-w-full max-h-[90vh] object-contain shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()} // Supaya klik gambar tidak nutup modal
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}