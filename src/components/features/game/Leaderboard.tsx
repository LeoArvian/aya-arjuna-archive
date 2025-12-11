import { useEffect, useState } from 'react';
import { Medal, Trophy, User, Edit2, Save } from 'lucide-react';
import { leaderboardService, type LeaderboardEntry } from '../../../services/leaderboardService';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  gameId: string;
  refreshTrigger: number; // Agar bisa refresh otomatis pas game over
}

export default function Leaderboard({ gameId, refreshTrigger }: LeaderboardProps) {
  const [topList, setTopList] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // ID Player disimpan di LocalStorage browser agar "ingat" user ini siapa
  const getPlayerId = () => {
    let id = localStorage.getItem('player_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('player_device_id', id);
    }
    return id;
  };

  const playerId = getPlayerId();

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tops = await leaderboardService.getLeaderboard(gameId);
        const myStats = await leaderboardService.getUserStats(gameId, playerId);
        
        setTopList(tops || []);
        setUserRank(myStats);
        if (myStats) setTempName(myStats.player_name);
        else {
           // Default name dari localstorage lama kalo ada
           setTempName(localStorage.getItem('flappy_player_name') || 'Player');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gameId, refreshTrigger]);

  // Fungsi Ganti Nama
  const handleUpdateName = () => {
    setEditingName(false);
    localStorage.setItem('flappy_player_name', tempName);
    // Kita pancing submit score dengan skor yg sama agar nama terupdate di DB
    if (userRank) {
       leaderboardService.submitScore(gameId, playerId, tempName, userRank.score);
       // Update UI lokal langsung biar cepet
       setUserRank({ ...userRank, player_name: tempName });
    }
  };

  // Helper Render Icon Ranking
  const renderRankIcon = (index: number) => {
    if (index === 0) return <Medal className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />; // Emas
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />;   // Perak
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" />;    // Perunggu
    return <span className="font-bold text-white/50 w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="bg-dark-surface/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full max-w-md h-fit shadow-2xl">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <Trophy className="text-primary" />
        <h3 className="text-xl font-bold text-white">TOP PLAYERS</h3>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/30 animate-pulse">Memuat Data...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* LIST 1 - 10 */}
          {topList.map((player, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30' : 
                'bg-white/5 border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                {renderRankIcon(idx)}
                <span className={`font-bold truncate max-w-[120px] ${idx === 0 ? 'text-yellow-200' : 'text-white'}`}>
                  {player.player_name}
                </span>
              </div>
              <span className="font-mono font-bold text-primary">{player.score}</span>
            </motion.div>
          ))}

          {/* EMPTY STATE */}
          {topList.length === 0 && (
             <p className="text-center text-white/30 py-4">Belum ada penantang. Jadilah yang pertama!</p>
          )}

          {/* PEMISAH JIKA USER DI LUAR 10 BESAR */}
          {userRank && userRank.rank && userRank.rank > 10 && (
            <>
              <div className="flex justify-center my-2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                </div>
              </div>

              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center justify-between p-3 rounded-xl bg-primary/20 border border-primary/50 relative overflow-hidden"
              >
                 <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
                 
                 <div className="flex items-center gap-4 relative z-10">
                    <span className="font-bold text-white/70 w-6 text-center text-sm">#{userRank.rank}</span>
                    <div className="flex flex-col">
                       <span className="text-[10px] text-primary-light font-bold uppercase tracking-wider">Rank Kamu</span>
                       <span className="font-bold text-white truncate max-w-[120px]">{userRank.player_name}</span>
                    </div>
                 </div>
                 <span className="font-mono font-bold text-white relative z-10">{userRank.score}</span>
              </motion.div>
            </>
          )}

          {/* EDIT NAMA SECTION */}
          <div className="mt-6 pt-4 border-t border-white/5">
             <div className="flex items-center gap-2 justify-between bg-black/20 p-2 rounded-lg">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                   <User size={14} />
                   <span>Nama Player:</span>
                </div>
                
                {editingName ? (
                   <div className="flex items-center gap-2">
                      <input 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-white/10 border border-white/10 rounded px-2 py-1 text-sm text-white w-24 focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button onClick={handleUpdateName} className="p-1 bg-primary text-white rounded hover:bg-primary-light">
                        <Save size={14} />
                      </button>
                   </div>
                ) : (
                   <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{tempName}</span>
                      <button onClick={() => setEditingName(true)} className="text-white/30 hover:text-white transition-colors">
                        <Edit2 size={12} />
                      </button>
                   </div>
                )}
             </div>
          </div>

        </div>
      )}
    </div>
  );
}