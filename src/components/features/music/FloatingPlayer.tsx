import { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '../../../store/usePlayerStore';
import { 
  X, Minimize2, Maximize2, Play, Pause, Tv, ChevronDown,
  SkipBack, SkipForward, Rewind, FastForward 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDuration } from '../../../lib/utils';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function FloatingPlayer() {
  const { 
    currentSong, closePlayer, mode, setMode, isPlaying, setIsPlaying,
    playNext, playPrev
  } = usePlayerStore();

  const playerRef = useRef<any>(null); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  // State Focus Mode UI
  const [showControls, setShowControls] = useState(true);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // --- 1. SETUP YOUTUBE API ---
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // --- 2. INIT PLAYER ENGINE ---
  useEffect(() => {
    if (currentSong && window.YT && window.YT.Player) {
      const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYoutubeId(currentSong.youtube_url);
      if (!videoId) return;

      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('yt-player-iframe', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            'autoplay': 1, 'controls': 0, 'modestbranding': 1, 'rel': 0, 
            'playsinline': 1, 'disablekb': 1, 'fs': 0, 'origin': window.location.origin,
          },
          events: {
            'onReady': (event: any) => {
              setIsReady(true);
              event.target.playVideo();
              setDuration(event.target.getDuration());
            },
            'onStateChange': (event: any) => {
              if (event.data === 1) setIsPlaying(true);
              if (event.data === 2) setIsPlaying(false);
              if (event.data === 0) playNext();
              // FORCE PLAY jika macet
              if (event.data === 5) event.target.playVideo();
            }
          }
        });
      } else {
        const currentUrl = playerRef.current.getVideoUrl();
        if (!currentUrl || !currentUrl.includes(videoId)) {
           playerRef.current.loadVideoById(videoId);
        }
      }
    }
  }, [currentSong]); 

  // --- 3. SYNC CONTROLS ---
  useEffect(() => {
    if (playerRef.current && isReady && typeof playerRef.current.playVideo === 'function') {
      isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady]);

  // --- 4. PROGRESS TRACKER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerRef.current && isReady) {
      interval = setInterval(() => {
        try {
           const curr = playerRef.current.getCurrentTime();
           const dur = playerRef.current.getDuration();
           if(curr) setCurrentTime(curr);
           if(dur && dur > 0) setDuration(dur);
        } catch(e) { /* ignore */ }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isReady]);

  // Handlers
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    playerRef.current?.seekTo(time, true);
  };

  const skipTime = (amount: number) => {
    if (playerRef.current) {
        const newTime = currentTime + amount;
        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    }
  };

  const handleClose = () => {
     if(playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
     setIsReady(false);
     closePlayer();
  };

  const resetIdleTimer = () => {
    setShowControls(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (!currentSong) return null;

  // --- REUSABLE CONTROLS ---
  const ControlButtons = ({ isLarge = false }: { isLarge?: boolean }) => (
    <div className={`flex items-center gap-6 ${isLarge ? 'scale-110' : ''}`}>
        <button onClick={(e) => { e.stopPropagation(); playPrev(); }} className="text-white hover:text-primary transition-colors" title="Previous">
          <SkipBack size={24} fill="currentColor"/>
        </button>
        <button onClick={(e) => { e.stopPropagation(); skipTime(-10); }} className="text-white hover:text-primary transition-colors" title="Mundur 10s">
          <Rewind size={24} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          {isPlaying ? <Pause size={24} fill="black"/> : <Play size={24} fill="black" className="ml-1"/>}
        </button>
        <button onClick={(e) => { e.stopPropagation(); skipTime(10); }} className="text-white hover:text-primary transition-colors" title="Maju 10s">
          <FastForward size={24} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); playNext(); }} className="text-white hover:text-primary transition-colors" title="Next">
          <SkipForward size={24} fill="currentColor"/>
        </button>
    </div>
  );

  return (
    <>
      {/* === 1. PLAYER ENGINE (VIDEO CONTAINER) === */}
      <motion.div 
         className={`overflow-hidden bg-black shadow-2xl transition-all duration-500 ease-in-out z-[10000] border border-white/10
            ${mode === 'mini' ? 'fixed bottom-0 right-0 w-1 h-1 opacity-0 pointer-events-none' : ''}
            ${mode === 'video' ? 'fixed bottom-36 right-4 w-[320px] sm:w-[400px] aspect-video rounded-xl opacity-100 pointer-events-auto' : ''}
            ${mode === 'focus' ? 'fixed inset-0 w-full h-full z-[10001] rounded-none border-none opacity-100 pointer-events-auto' : ''}
         `}
         onMouseMove={mode === 'focus' ? resetIdleTimer : undefined}
         onMouseLeave={mode === 'focus' ? () => setShowControls(false) : undefined}
      >
         <div id="yt-player-iframe" className="w-full h-full" />

         {/* === OVERLAY CONTROLS: MODE VIDEO KECIL (PIP) === */}
         {mode === 'video' && (
            <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 hover:opacity-100 transition-opacity bg-transparent">
               {/* Header: Window Controls */}
               <div className="flex justify-end gap-1 pointer-events-auto">
                  <button onClick={() => setMode('mini')} className="p-1.5 bg-black/50 hover:bg-primary text-white rounded-lg backdrop-blur-md transition-colors"><Minimize2 size={14}/></button>
                  <button onClick={() => setMode('focus')} className="p-1.5 bg-black/50 hover:bg-primary text-white rounded-lg backdrop-blur-md transition-colors"><Maximize2 size={14}/></button>
                  <button onClick={handleClose} className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-md transition-colors"><X size={14}/></button>
               </div>

               {/* Footer: Play Controls (TERPISAH & JELAS) */}
               <div className="flex justify-center items-center gap-3 pointer-events-auto">
                  {/* Prev */}
                  <button onClick={(e) => { e.stopPropagation(); playPrev(); }} className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110">
                     <SkipBack size={16} fill="currentColor"/>
                  </button>
                  
                  {/* Play/Pause Utama */}
                  <button 
                     onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
                     className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                  >
                     {isPlaying ? <Pause size={20} fill="black"/> : <Play size={20} fill="black" className="ml-0.5"/>}
                  </button>

                  {/* Next */}
                  <button onClick={(e) => { e.stopPropagation(); playNext(); }} className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110">
                     <SkipForward size={16} fill="currentColor"/>
                  </button>
               </div>
            </div>
         )}
         
         {/* === OVERLAY CONTROLS: MODE FOCUS (FULLSCREEN) === */}
         {mode === 'focus' && (
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col justify-between pointer-events-none"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                        <button onClick={() => setMode('mini')} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors flex items-center gap-2">
                            <ChevronDown size={28}/> <span className="text-sm font-bold">Minimize</span>
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => setMode('video')} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors" title="Pip Mode"><Minimize2 size={24}/></button>
                            <button onClick={handleClose} className="p-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-full backdrop-blur-md transition-colors" title="Close"><X size={24}/></button>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-8 pb-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-auto">
                        <div className="max-w-3xl mx-auto flex flex-col gap-6">
                            <div className="text-center">
                                <h2 className="text-white font-bold text-3xl drop-shadow-md mb-1">{currentSong.title}</h2>
                                <p className="text-white/60 text-lg uppercase tracking-widest">{currentSong.talent}</p>
                            </div>
                            <div className="w-full group">
                                <input 
                                    type="range" min={0} max={duration || 100} value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                                />
                                <div className="flex justify-between text-xs text-white/60 mt-2 font-mono font-bold">
                                    <span>{formatDuration(currentTime)}</span>
                                    <span>{formatDuration(duration)}</span>
                                </div>
                            </div>
                            <div className="flex justify-center pb-4">
                                <ControlButtons isLarge />
                            </div>
                        </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
         )}
      </motion.div>

      {/* === 2. UI LAYERS: MODE MINI BAR (FIXED BOTTOM) === */}
      <AnimatePresence mode="wait">
        {mode === 'mini' && (
          <motion.div 
            key="mini-ui"
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[10000] bg-dark-surface/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col"
          >
             {/* Progress Bar (Clickable) */}
             <div className="w-full h-1.5 bg-white/10 relative cursor-pointer group mb-1" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                playerRef.current?.seekTo(pos * duration, true);
             }}>
               <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 group-hover:bg-primary-light" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
             </div>

             {/* Container Utama - Responsif Grid */}
             <div className="w-full max-w-7xl mx-auto grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center p-3 gap-4">
                
                {/* 1. Info Lagu (Kiri) */}
                <div className="flex items-center gap-3 min-w-0 cursor-pointer group" onClick={() => setMode('focus')}>
                   <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                      <img src={currentSong.thumbnail_url} className="w-full h-full object-cover" />
                   </div>
                   <div className="overflow-hidden">
                      <h4 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">{currentSong.title}</h4>
                      <p className="text-white/50 text-[10px] uppercase tracking-wider truncate">{currentSong.talent}</p>
                   </div>
                </div>

                {/* 2. Controls (Tengah - Sekarang di Kanan untuk HP, Tengah untuk Desktop) */}
                <div className="flex justify-center md:justify-center row-start-2 col-span-2 md:row-start-1 md:col-span-1 pb-2 md:pb-0">
                   <ControlButtons />
                </div>

                {/* 3. Window Controls (Kanan) */}
                <div className="flex items-center justify-end gap-1 shrink-0">
                   <button onClick={() => setMode('video')} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Pip Mode"><Tv size={18}/></button>
                   <button onClick={() => setMode('focus')} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Fullscreen"><Maximize2 size={18}/></button>
                   <button onClick={handleClose} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Close"><X size={18}/></button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}