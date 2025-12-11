import { ArrowLeft, Maximize2, RefreshCw } from 'lucide-react';
import { useRef } from 'react';

interface WebGamePlayerProps {
  gamePath: string; // Path ke file index.html
  title: string;
  onExit: () => void;
}

export default function WebGamePlayer({ gamePath, title, onExit }: WebGamePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFullscreen = () => {
    if (iframeRef.current?.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center animate-fade-in">
      {/* Header Player */}
      <div className="w-full flex justify-between items-center mb-4 px-4 bg-black/20 p-2 rounded-lg backdrop-blur-sm">
        <button 
          onClick={onExit}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold"
        >
          <ArrowLeft size={18} />
          <span>KELUAR</span>
        </button>

        <h2 className="text-lg font-bold text-white hidden md:block truncate max-w-md">{title}</h2>

        <div className="flex items-center gap-2">
           <button 
            onClick={handleRefresh}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Restart Game"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={handleFullscreen}
            className="p-2 text-primary hover:text-primary-light hover:bg-white/10 rounded-full transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Area Game (Iframe) */}
      <div className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
        <iframe
          ref={iframeRef}
          src={gamePath}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write;"
        />
      </div>

      <p className="mt-4 text-white/30 text-xs text-center max-w-2xl">
        *Jika layar hitam, coba refresh. Pastikan bermain di browser Chrome/Firefox/Edge. 
        Game save tersimpan di browser ini.
      </p>
    </div>
  );
}