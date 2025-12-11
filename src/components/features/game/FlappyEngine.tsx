import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, X, Share2 } from 'lucide-react';
import { usePlayerStore } from '../../../store/usePlayerStore'; 
import { toast } from 'sonner'; 

// --- KONFIGURASI GAME ---
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_SPEED_START = 4;
const PIPE_SPAWN_RATE = 100;
const PIPE_GAP = 190;
const PIPE_WIDTH = 100; 
const FLOOR_HEIGHT = 80; 
const DAY_CYCLE_DURATION = 3600; 

// KONFIGURASI TRANSISI
const CHANGE_PHASE_EVERY = 10; // Ganti rintangan setiap 10 poin

interface FlappyEngineProps {
  character: 'aya' | 'arjuna';
  onGameOver: (score: number) => void;
  onExit: () => void;
}

export default function FlappyEngine({ character, onGameOver, onExit }: FlappyEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying: isMusicPlaying, setIsPlaying: setMusicPlaying } = usePlayerStore();
  
  // State React
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const wasMusicPlayingRef = useRef(false);

  // --- GAME STATE ---
  const gameState = useRef({
    birdY: window.innerHeight / 2,
    velocity: 0,
    // UPDATE: Tambahkan property 'type' di sini untuk menyimpan identitas pipa
    pipes: [] as { x: number, topHeight: number, passed: boolean, type: 'mic' | 'server' }[],
    frameCount: 0,
    speed: PIPE_SPEED_START,
    timeCycle: 0, 
    stars: [] as {x: number, y: number, alpha: number}[],
    shake: 0, 
    offset: 0 
  });

  // Assets Refs
  const birdImg = useRef<HTMLImageElement | null>(null);
  const pipeImgMic = useRef<HTMLImageElement | null>(null);
  const pipeImgServer = useRef<HTMLImageElement | null>(null);
  const floorImg = useRef<HTMLImageElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- AUDIO LOGIC ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: 'jump' | 'score' | 'die') => {
    try {
        if (!audioCtxRef.current) initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'jump') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'score') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'die') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            gain.gain.setValueAtTime(0.1, now); 
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        console.error("Audio error", e);
    }
  };

  // 1. Generate Bintang
  useEffect(() => {
    const starCount = 60;
    const stars = [];
    for(let i=0; i<starCount; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * (window.innerHeight / 1.5), 
            alpha: Math.random()
        });
    }
    gameState.current.stars = stars;
  }, []);

  // 2. Setup Assets & Resize
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    if (usePlayerStore.getState().isPlaying) {
        wasMusicPlayingRef.current = true;
        setMusicPlaying(false);
    }

    const imgChar = new Image(); 
    imgChar.src = character === 'aya' ? '/aya_px.png' : '/arjuna_px.png';
    birdImg.current = imgChar;

    const imgMic = new Image(); imgMic.src = '/mic_px.png';
    pipeImgMic.current = imgMic;

    const imgServer = new Image(); imgServer.src = '/server_px.png';
    pipeImgServer.current = imgServer;

    const imgFloor = new Image(); imgFloor.src = '/lantai_px.png';
    floorImg.current = imgFloor;

    return () => {
        window.removeEventListener('resize', handleResize);
        if (wasMusicPlayingRef.current) setMusicPlaying(true);
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
    };
  }, [character, setMusicPlaying]);

  // 3. Inputs
  const performJump = useCallback(() => {
    initAudio(); 
    if (!isPlaying) setIsPlaying(true);
    if (!isGameOver) {
        gameState.current.velocity = JUMP_STRENGTH;
        playSound('jump');
    }
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            performJump();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performJump]);

  const handleShare = () => {
    const text = `Aku dapat skor ${score} di Flappy ${character === 'aya' ? 'Aya' : 'Arjuna'}! 🚀\nCoba kalahkan aku di Aya & Arjuna Archive!`;
    navigator.clipboard.writeText(text).then(() => {
        toast.success("Skor disalin! Siap dipamerkan 😎");
    });
  };

  // 4. GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loop = () => {
      const state = gameState.current;
      const width = canvas.width;
      const height = canvas.height;
      const gameHeight = height - FLOOR_HEIGHT;

      state.timeCycle = (state.timeCycle + 1) % DAY_CYCLE_DURATION;
      if (state.shake > 0) state.shake *= 0.9;
      if (state.shake < 0.5) state.shake = 0;
      state.offset += state.speed; 

      if (isPlaying && !isGameOver) {
          state.frameCount++;
          state.speed = Math.min(PIPE_SPEED_START + Math.floor(score / 5) * 0.2, 8);
          state.velocity += GRAVITY;
          state.birdY += state.velocity;

          // --- LOGIKA SPAWN PIPA (DIPERBAIKI) ---
          if (state.frameCount % PIPE_SPAWN_RATE === 0) {
            const minPipe = 100;
            const maxPipe = gameHeight - PIPE_GAP - minPipe;
            const safeMax = maxPipe > minPipe ? maxPipe : minPipe + 50; 
            const randomHeight = Math.floor(Math.random() * (safeMax - minPipe + 1)) + minPipe;
            
            // Logic Ganti Skin: Berubah setiap 10 poin (0-9 Mic, 10-19 Server, 20-29 Mic...)
            // Math.floor(score / 10) % 2 === 0 artinya Genap (Mic), 1 artinya Ganjil (Server)
            const currentPhase = Math.floor(score / CHANGE_PHASE_EVERY);
            const pipeType = currentPhase % 2 === 0 ? 'mic' : 'server';

            state.pipes.push({ 
                x: width, 
                topHeight: randomHeight, 
                passed: false,
                type: pipeType // Simpan identitas pipa saat lahir!
            });
          }

          state.pipes.forEach(pipe => pipe.x -= state.speed);
          if (state.pipes.length > 0 && state.pipes[0].x < -PIPE_WIDTH) {
            state.pipes.shift();
          }

          const birdX = 100;
          const birdSize = 40; 
          const hitboxPadding = 30;

          state.pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
                pipe.passed = true;
                setScore(prev => prev + 1);
                playSound('score');
            }
            if (
              birdX + birdSize > pipe.x + hitboxPadding && 
              birdX < pipe.x + PIPE_WIDTH - hitboxPadding && 
              (state.birdY + 15 < pipe.topHeight || state.birdY + birdSize - 10 > pipe.topHeight + PIPE_GAP)
            ) {
               handleGameOver();
            }
          });

          if (state.birdY + birdSize > gameHeight || state.birdY < 0) {
            handleGameOver();
          }

      } else if (!isPlaying && !isGameOver) {
          state.birdY = (gameHeight / 2) + Math.sin(Date.now() / 300) * 15;
      }

      // --- RENDER ---
      ctx.save();
      if (state.shake > 0) {
          const dx = (Math.random() - 0.5) * state.shake;
          const dy = (Math.random() - 0.5) * state.shake;
          ctx.translate(dx, dy);
      }

      ctx.clearRect(0, 0, width, height);

      drawDynamicSky(ctx, width, height, state.timeCycle, state.stars, state.offset);

      // Render Pipa (Membaca TYPE masing-masing pipa, BUKAN skor global)
      state.pipes.forEach(pipe => {
        const imgToDraw = pipe.type === 'server' ? pipeImgServer.current : pipeImgMic.current;
        
        if (imgToDraw && imgToDraw.complete) {
             ctx.save();
             ctx.translate(pipe.x + PIPE_WIDTH/2, pipe.topHeight);
             ctx.scale(-1, -1); 
             ctx.drawImage(imgToDraw, -PIPE_WIDTH/2, 0, PIPE_WIDTH, 800); 
             ctx.restore();
             ctx.drawImage(imgToDraw, pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, 800);
        } else {
            // Fallback colors
            ctx.fillStyle = pipe.type === 'server' ? '#1e293b' : '#22c55e';
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, height);
        }
      });

      // Render Lantai
      if (floorImg.current && floorImg.current.complete) {
          const floorWidth = 100; 
          const offsetMod = state.offset % floorWidth;
          for (let i = -1; i < (width / floorWidth) + 1; i++) {
              ctx.drawImage(
                  floorImg.current, 
                  (i * floorWidth) - offsetMod, 
                  height - FLOOR_HEIGHT, 
                  floorWidth, 
                  FLOOR_HEIGHT
              );
          }
      } else {
          ctx.fillStyle = "#65a30d";
          ctx.fillRect(0, height - FLOOR_HEIGHT, width, FLOOR_HEIGHT);
      }

      // Render Karakter
      if (birdImg.current && birdImg.current.complete) {
          ctx.save();
          ctx.translate(100 + 32, state.birdY + 27); 
          let rotation = isPlaying ? Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (state.velocity * 0.1))) : 0;
          ctx.rotate(rotation);
          ctx.drawImage(birdImg.current, -32, -27, 64, 54); 
          ctx.restore();
      } else {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(100, state.birdY, 50, 40);
      }

      ctx.restore();
      
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isGameOver, score, character]);

  const handleAction = (e?: React.MouseEvent | React.TouchEvent) => {
    if(e) e.stopPropagation(); 
    performJump();
  };

  const handleGameOver = () => {
    if (!isGameOver) {
        setIsGameOver(true);
        setIsPlaying(false);
        onGameOver(score);
        playSound('die');
        gameState.current.shake = 25; 
    }
  };

  const resetGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameState.current = {
        ...gameState.current,
        birdY: window.innerHeight / 2,
        velocity: 0,
        pipes: [],
        frameCount: 0,
        speed: PIPE_SPEED_START,
        shake: 0
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(false);
    
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 w-full h-full overflow-hidden select-none">
      
      <button 
        onClick={onExit}
        className="absolute top-6 right-6 z-50 p-3 bg-black/40 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-all border border-white/10 group"
      >
        <X size={24} className="group-hover:scale-110 transition-transform"/>
      </button>

      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight}
        onMouseDown={handleAction}
        onTouchStart={handleAction}
        className="block w-full h-full cursor-pointer touch-none"
        style={{ imageRendering: 'pixelated' }} 
      />

      <div className="absolute top-8 left-1/2 -translate-x-1/2 font-black text-7xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] pointer-events-none" style={{ WebkitTextStroke: '2px black' }}>
        {score}
      </div>

      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center animate-pulse shadow-2xl">
                <img src="/hand-pointer.svg" className="w-16 h-16 invert mx-auto mb-4 opacity-90" alt="" />
                <h2 className="text-3xl font-black text-white tracking-widest drop-shadow-md">TAP / SPASI</h2>
                <p className="text-white/70 mt-2 text-lg">Hindari Mic & Server!</p>
            </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-40 animate-in fade-in zoom-in duration-200">
            <h2 className="text-6xl md:text-8xl font-black text-red-500 mb-4 drop-shadow-[0_4px_0_#fff] -rotate-3">GAME OVER</h2>
            <div className="text-white text-3xl mb-8 font-bold drop-shadow-lg">Score Akhir: {score}</div>
            
            <div className="flex flex-col gap-4 w-72">
                <button onClick={resetGame} className="w-full py-5 rounded-2xl font-black text-xl bg-primary text-white border-b-8 border-primary/50 active:border-b-0 active:translate-y-2 transition flex items-center justify-center gap-3 shadow-xl hover:brightness-110">
                    <RotateCcw size={28} /> MAIN LAGI
                </button>
                
                <button onClick={handleShare} className="w-full py-4 rounded-2xl font-bold text-lg bg-green-600 text-white hover:bg-green-500 transition shadow-lg border border-white/10 flex items-center justify-center gap-2">
                    <Share2 size={20} /> BAGIKAN SKOR
                </button>

                <button onClick={onExit} className="w-full py-4 rounded-2xl font-bold text-lg bg-slate-700 text-white hover:bg-slate-600 transition shadow-lg border border-white/10">
                    KELUAR
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

// Helper: Sky Renderer (Sama seperti sebelumnya)
function drawDynamicSky(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    time: number,
    stars: {x: number, y: number, alpha: number}[],
    offset: number
) {
    const total = DAY_CYCLE_DURATION;
    let colorTop = "#0ea5e9";
    let colorBottom = "#bae6fd";
    
    if (time < total * 0.25) { 
        colorTop = "#38bdf8"; colorBottom = "#e0f2fe";
    } else if (time < total * 0.5) { 
        colorTop = "#0284c7"; colorBottom = "#7dd3fc";
    } else if (time < total * 0.75) { 
        colorTop = "#c026d3"; colorBottom = "#fb923c";
    } else { 
        colorTop = "#0f172a"; colorBottom = "#1e1b4b";
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colorTop);
    gradient.addColorStop(1, colorBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (time > total * 0.05 && time < total * 0.70) {
        const sunProgress = (time - total * 0.05) / (total * 0.65);
        const sunX = sunProgress * width; 
        const sunY = height - Math.sin(sunProgress * Math.PI) * (height * 0.6);

        ctx.shadowBlur = 40;
        ctx.shadowColor = "yellow";
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        const cloudX = (width - (offset * 0.5) % (width + 200));
        for(let i=0; i<3; i++) {
            let cx = (cloudX + i * 400) % (width + 200) - 100;
            ctx.beginPath();
            ctx.arc(cx, 150 + i*50, 40, 0, Math.PI * 2);
            ctx.arc(cx + 50, 160 + i*50, 50, 0, Math.PI * 2);
            ctx.arc(cx + 100, 150 + i*50, 40, 0, Math.PI * 2);
            ctx.fill();
        }
    } 

    let moonProgress = -1;
    if (time >= total * 0.70) {
        moonProgress = (time - total * 0.70) / (total * 0.35); 
    } else if (time <= total * 0.05) {
        const nightDuration = total * 0.35; 
        const currentNightTime = (total * 0.30) + time;
        moonProgress = currentNightTime / nightDuration;
    }

    if (moonProgress >= 0) {
        const moonX = moonProgress * width;
        const moonY = height - Math.sin(moonProgress * Math.PI) * (height * 0.8);

        ctx.fillStyle = "white";
        stars.forEach(star => {
            ctx.globalAlpha = Math.abs(Math.sin(time / 50 + star.alpha)); 
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}