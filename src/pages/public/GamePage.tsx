import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, ArrowLeft, Joystick, Heart, Play, Trophy } from 'lucide-react';
import { toast } from 'sonner';

// --- IMPORTS KOMPONEN ---
import FlappyEngine from '../../components/features/game/FlappyEngine';
import WebGamePlayer from '../../components/features/game/WebGamePlayer';
import Leaderboard from '../../components/features/game/Leaderboard'; // Pastikan path ini benar
import { leaderboardService } from '../../services/leaderboardService'; // Pastikan path ini benar

// ==============================================
// 1. CONFIG DATABASE (TEMPAT NAMBAH GAME DISINI)
// ==============================================

type GameCategory = 'fun' | 'fan';
type GameType = 'flappy' | 'iframe';

interface GameConfig {
  id: string;
  category: GameCategory; // 'fun' (Minigame) atau 'fan' (Karya Fans)
  type: GameType;         // 'flappy' (Internal) atau 'iframe' (Upload-an)
  title: string;
  description: string;
  thumbnail: string;      // Gambar cover
  path?: string;          // KHUSUS 'iframe': Link ke file index.html di folder public
  color: string;          // Warna background card
}

const GAMES_DATABASE: GameConfig[] = [
  // --- FUN GAMES (Official Minigames) ---
  {
    id: 'flappy-archive',
    category: 'fun',
    type: 'flappy',
    title: 'Flappy Archive',
    description: 'Bantu Aya & Arjuna melewati rintangan mic dan server!',
    thumbnail: '/aya_px.png', 
    color: 'from-purple-600/20 to-indigo-900/20'
  },
  
  // --- FAN GAMES (Upload-an Kalian) ---
  {
    id: 'vn-server-love',
    category: 'fan',
    type: 'iframe',
    title: 'Kandang Ayam: Behind the Stream',
    description: 'Ciptaan ituajasih.',
    thumbnail: '/aya_px.png', 
    path: '/fangames/KandangAyam/index.html', // Sesuaikan path ini dengan folder public kamu
    color: 'from-pink-500/20 to-rose-900/20'
  },
];

// ==============================================
// 2. MAIN COMPONENT
// ==============================================

export default function GamePage() {
  // State Navigasi Utama
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  
  // State Khusus Flappy
  const [flappyChar, setFlappyChar] = useState<'aya' | 'arjuna' | null>(null);
  const [refreshBoard, setRefreshBoard] = useState(0); // Trigger update leaderboard

  // Helper Reset
  const handleBackToHome = () => {
    setFlappyChar(null);
    setActiveGameId(null);
    setSelectedCategory(null);
  };

  const handleBackToCategory = () => {
    setFlappyChar(null);
    setActiveGameId(null);
  };

  // Ambil data game yang sedang aktif
  const activeGameConfig = GAMES_DATABASE.find(g => g.id === activeGameId);

  // --- LOGIC GAME OVER (FLAPPY) ---
  const handleFlappyGameOver = async (score: number) => {
    // 1. Ambil Nama & ID dari LocalStorage
    const name = localStorage.getItem('flappy_player_name') || 'Player';
    let playerId = localStorage.getItem('player_device_id');
    
    // Jika belum ada ID, buat baru
    if (!playerId) {
        playerId = crypto.randomUUID();
        localStorage.setItem('player_device_id', playerId);
    }

    try {
      // 2. Kirim ke Supabase (Otomatis cek record tertinggi di backend service)
      await leaderboardService.submitScore('flappy-archive', playerId, name, score);
      
      // 3. Notifikasi Sukses
      toast.success(`Game Over! Skor kamu: ${score}`, {
        description: 'Cek leaderboard untuk melihat peringkatmu.'
      });
      
      // 4. Trigger refresh leaderboard agar skor baru langsung muncul
      setRefreshBoard(prev => prev + 1);
    } catch (error) {
      console.error("Gagal save skor:", error);
      toast.error("Gagal menyimpan skor ke server.");
    }
  };

  // --- RENDERER: MENU PILIH KATEGORI (STEP 1) ---
  const renderCategorySelection = () => (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl gap-8 animate-fade-in-up">
       <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center justify-center gap-3">
            <Gamepad2 className="text-primary w-10 h-10 md:w-12 md:h-12" />
            GAME CENTER
          </h1>
          <p className="text-white/60">Pilih zona permainanmu</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
          {/* CARD 1: FUN GAMES */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory('fun')}
            className="cursor-pointer bg-gradient-to-br from-purple-500/10 to-blue-900/10 border border-purple-500/30 hover:border-purple-400 rounded-3xl p-8 flex flex-col items-center text-center group transition-all"
          >
            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.3)]">
               <Joystick className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">FUN GAMES</h2>
            <p className="text-white/50 text-sm">Minigames santai pengisi waktu luang. Tantang skor tertinggi!</p>
          </motion.div>

          {/* CARD 2: FAN GAMES */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory('fan')}
            className="cursor-pointer bg-gradient-to-br from-pink-500/10 to-rose-900/10 border border-pink-500/30 hover:border-pink-400 rounded-3xl p-8 flex flex-col items-center text-center group transition-all"
          >
            <div className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(236,72,153,0.3)]">
               <Heart className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">FAN GAMES</h2>
            <p className="text-white/50 text-sm">Karya kreatif dari komunitas (Visual Novel, RPG, Fan-made).</p>
          </motion.div>
       </div>
    </div>
  );

  // --- RENDERER: LIST GAME DALAM KATEGORI (STEP 2) ---
  const renderGameList = () => {
    // Filter game berdasarkan kategori yang dipilih
    const filteredGames = GAMES_DATABASE.filter(g => g.category === selectedCategory);

    return (
      <div className="w-full max-w-6xl px-4 animate-fade-in">
        {/* Tombol Back */}
        <button 
          onClick={handleBackToHome}
          className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
        >
          <div className="p-1 rounded-full bg-white/5 group-hover:bg-white/10"><ArrowLeft size={16} /></div>
          <span className="text-sm font-bold">KEMBALI KE MENU UTAMA</span>
        </button>

        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
           {selectedCategory === 'fun' ? <Joystick className="text-purple-400"/> : <Heart className="text-pink-400"/>}
           {selectedCategory === 'fun' ? 'Official Minigames' : 'Community Creations'}
        </h2>

        {filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-white/30">Belum ada game di kategori ini. Coming Soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredGames.map(game => (
               <motion.div
                 key={game.id}
                 whileHover={{ y: -5 }}
                 onClick={() => setActiveGameId(game.id)}
                 className="cursor-pointer bg-dark-surface border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden shadow-lg group"
               >
                  {/* Thumbnail */}
                  <div className={`h-48 bg-gradient-to-br ${game.color} relative flex items-center justify-center overflow-hidden`}>
                     <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        className="w-24 h-24 object-contain rendering-pixelated group-hover:scale-110 transition-transform duration-500 drop-shadow-xl"
                     />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Play className="fill-white text-white w-12 h-12 drop-shadow-lg" />
                     </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{game.title}</h3>
                    <p className="text-white/50 text-sm line-clamp-2">{game.description}</p>
                    {game.type === 'flappy' && (
                       <div className="mt-3 flex items-center gap-1 text-xs text-yellow-500 font-bold">
                         <Trophy size={12} /> Leaderboard Active
                       </div>
                    )}
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </div>
    );
  };

  // --- RENDERER: GAMEPLAY AREA (STEP 3) ---
  const renderActiveGameplay = () => {
    if (!activeGameConfig) return null;

    // A. JIKA TIPE NYA FLAPPY (Flow: Pilih Karakter + Leaderboard -> Main)
    if (activeGameConfig.type === 'flappy') {
       if (!flappyChar) {
          // --- LAYAR PRE-GAME (PILIH KARAKTER & LEADERBOARD) ---
          return (
            <div className="w-full max-w-6xl animate-zoom-in px-4">
               <button onClick={handleBackToCategory} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                 <ArrowLeft size={18} /> Ganti Game
               </button>

               <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                  
                  {/* KOLOM KIRI: PILIH KARAKTER */}
                  <div className="flex-1 w-full order-2 lg:order-1">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <Gamepad2 className="text-primary" /> Pilih Karakter
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Aya */}
                        <div onClick={() => setFlappyChar('aya')} className="group cursor-pointer bg-dark-surface border border-white/5 hover:border-pink-500 rounded-2xl p-8 hover:scale-[1.02] transition-all relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">START</span>
                            </div>
                            <img src="/aya_px.png" className="w-24 h-[65px] object-contain mx-auto mb-4 rendering-pixelated group-hover:animate-bounce-custom"/>
                            <h3 className="text-2xl font-bold text-pink-400 text-center">Team Aya</h3>
                            <p className="text-white/40 text-xs text-center mt-2">Speciality: Cute Jump</p>
                        </div>
                        {/* Arjuna */}
                        <div onClick={() => setFlappyChar('arjuna')} className="group cursor-pointer bg-dark-surface border border-white/5 hover:border-blue-500 rounded-2xl p-8 hover:scale-[1.02] transition-all relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">START</span>
                            </div>
                            <img src="/arjuna_px.png" className="w-24 h-[65px] object-contain mx-auto mb-4 rendering-pixelated group-hover:animate-bounce-custom"/>
                            <h3 className="text-2xl font-bold text-blue-400 text-center">Team Arjuna</h3>
                            <p className="text-white/40 text-xs text-center mt-2">Speciality: Cool Dive</p>
                        </div>
                    </div>
                    
                    {/* INSTRUKSI */}
                    <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                           <Joystick size={16} /> Cara Main:
                        </h4>
                        <ul className="text-white/60 text-sm list-disc list-inside space-y-2">
                            <li>Klik layar atau tekan <kbd className="bg-white/10 px-1 rounded text-white font-mono">SPASI</kbd> untuk melompat.</li>
                            <li>Hindari microphone dan server yang error.</li>
                            <li>Jadilah ranking #1 untuk mendapatkan <span className="text-yellow-400 font-bold">Medali Emas!</span></li>
                        </ul>
                    </div>
                  </div>

                  {/* KOLOM KANAN: LEADERBOARD */}
                  <div className="w-full lg:w-[400px] order-1 lg:order-2">
                      <Leaderboard gameId="flappy-archive" refreshTrigger={refreshBoard} />
                  </div>

               </div>
            </div>
          );
       }
       
       // --- LAYAR UTAMA GAME (ENGINE) ---
       return (
         <FlappyEngine 
            character={flappyChar} 
            onGameOver={handleFlappyGameOver} 
            onExit={() => { setFlappyChar(null); setRefreshBoard(prev => prev + 1); }} 
         />
       );
    }

    // B. JIKA TIPE NYA IFRAME (Visual Novel / HTML5)
    if (activeGameConfig.type === 'iframe' && activeGameConfig.path) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in px-4">
            <WebGamePlayer 
               gamePath={activeGameConfig.path}
               title={activeGameConfig.title}
               onExit={handleBackToCategory}
            />
        </div>
      );
    }

    return <div className="text-white p-10">Error: Konfigurasi game tidak valid.</div>;
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-10 flex flex-col items-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />
      
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
         {/* STATE 1: BELUM PILIH KATEGORI */}
         {!selectedCategory && (
            <motion.div key="category-select" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full flex justify-center z-10">
               {renderCategorySelection()}
            </motion.div>
         )}

         {/* STATE 2: SUDAH PILIH KATEGORI, BELUM PILIH GAME */}
         {selectedCategory && !activeGameId && (
            <motion.div key="game-list" initial={{opacity:0, x: 20}} animate={{opacity:1, x:0}} exit={{opacity:0, x: -20}} className="w-full flex justify-center z-10">
               {renderGameList()}
            </motion.div>
         )}

         {/* STATE 3: LAGI MAIN GAME (atau Pilih Karakter Flappy) */}
         {activeGameId && (
            <motion.div key="gameplay" initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale: 0.95}} className="w-full flex justify-center z-20">
               {renderActiveGameplay()}
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}