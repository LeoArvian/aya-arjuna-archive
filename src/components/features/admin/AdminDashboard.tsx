import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { adminService } from '../../../services/adminService';
import { 
  LayoutDashboard, Users, UserCog, Calendar, Image as ImageIcon, Music, 
  LogOut, X, BarChart3, MessageSquare, History, AlertTriangle, Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Semua Komponen Fitur Admin
import ManageAdmins from './ManageAdmins';
import ManageTimeline from './ManageTimeline';
import ManageMemories from './ManageMemories';
import ManageSongs from './ManageSongs';
import ManageGuestbook from './ManageGuestbook';
import ActivityLogs from './ActivityLogs';
import EditProfile from './EditProfile';
import LiveStatusControl from './LiveStatusControl';
import ManageReports from './ManageReports'; 

interface AdminDashboardProps {
  onClose: () => void;
}

type MenuType = 
  | 'dashboard' | 'admins' | 'profile' | 'timeline' | 'memories' | 'songs' | 'guestbook' | 'logs' | 'reports';

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { user, logout } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState<MenuType>('dashboard');
  
  // State untuk Statistik Dashboard
  const [stats, setStats] = useState({ timeline: 0, memories: 0, songs: 0, admins: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // State Menu Mobile & Deteksi Layar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Deteksi Ukuran Layar (Untuk mengatur sidebar otomatis)
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // Desktop selalu buka
      } else {
        setIsSidebarOpen(false); // Mobile default tutup
      }
    };
    
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Fetch Stats hanya saat menu Dashboard aktif
  useEffect(() => {
    if (activeMenu === 'dashboard') {
      const loadStats = async () => {
        setLoadingStats(true);
        try {
          const data = await adminService.getDashboardStats();
          setStats({
            timeline: data.timelineCount,
            memories: data.memoriesCount,
            songs: data.songsCount,
            admins: data.adminsCount
          });
        } catch (e) {
          console.error("Gagal load stats", e);
        } finally {
          setLoadingStats(false);
        }
      };
      loadStats();
    }
  }, [activeMenu]);

  // Helper untuk menutup sidebar saat menu diklik (khusus mobile)
  const handleMenuClick = (menu: MenuType) => {
    setActiveMenu(menu);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-dark-bg text-white overflow-hidden relative">
      
      {/* === HEADER MOBILE (Hamburger) === */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-3">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
              <Menu size={24} />
           </button>
           <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <button onClick={onClose} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
           <X size={24} />
        </button>
      </div>

      {/* === BACKDROP MOBILE === */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-[45] md:hidden" // Z-Index di bawah sidebar, di atas konten
          />
        )}
      </AnimatePresence>

      {/* === SIDEBAR (Responsive Motion) === */}
      <motion.aside 
        className="fixed md:relative inset-y-0 left-0 z-[50] w-64 bg-dark-surface border-r border-dark-border flex flex-col flex-shrink-0 shadow-2xl md:shadow-none"
        animate={{ 
          x: isMobile ? (isSidebarOpen ? 0 : "-100%") : 0 
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        initial={{ x: isMobile ? "-100%" : 0 }}
      >
        {/* User Profile Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between bg-black/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={user?.avatar_url || "https://placehold.co/100"} 
              alt="User" 
              className="w-10 h-10 rounded-full border border-primary object-cover flex-shrink-0"
            />
            <div className="overflow-hidden">
              <h3 className="font-bold text-white truncate text-sm" style={{ color: user?.username_color || '#ffffff' }}>
                {user?.username}
              </h3>
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider flex items-center gap-1">
                {user?.role === 'leader' && '👑'} {user?.role}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <MenuItem active={activeMenu === 'dashboard'} onClick={() => handleMenuClick('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          
          {/* === PERBAIKAN UTAMA: HANYA LEADER YANG LIHAT MENU INI === */}
          {user?.role === 'leader' && (
            <MenuItem active={activeMenu === 'admins'} onClick={() => handleMenuClick('admins')} icon={<Users size={20} />} label="Manage Admins" />
          )}

          {user?.role === 'leader' && (
            <MenuItem active={activeMenu === 'logs'} onClick={() => handleMenuClick('logs')} icon={<History size={20} />} label="Activity Logs" />
          )}
          {/* ========================================================== */}

          <div className="pt-4 pb-2 text-xs font-bold text-white/30 uppercase px-4">Interaksi Fans</div>
          <MenuItem active={activeMenu === 'guestbook'} onClick={() => handleMenuClick('guestbook')} icon={<MessageSquare size={20} />} label="Pesan Fans" />
          <MenuItem active={activeMenu === 'reports'} onClick={() => handleMenuClick('reports')} icon={<AlertTriangle size={20} />} label="Laporan Masalah" />

          <div className="pt-4 pb-2 text-xs font-bold text-white/30 uppercase px-4">Konten & Data</div>
          <MenuItem active={activeMenu === 'profile'} onClick={() => handleMenuClick('profile')} icon={<UserCog size={20} />} label="Edit Profil Talent" />
          <MenuItem active={activeMenu === 'timeline'} onClick={() => handleMenuClick('timeline')} icon={<Calendar size={20} />} label="Timeline Activity" />
          <MenuItem active={activeMenu === 'memories'} onClick={() => handleMenuClick('memories')} icon={<ImageIcon size={20} />} label="Karya Fans" />
          <MenuItem active={activeMenu === 'songs'} onClick={() => handleMenuClick('songs')} icon={<Music size={20} />} label="Diskografi Lagu" />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-dark-border space-y-2 bg-black/10">
          <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors text-sm">
            <X size={20} /> Keluar Panel
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* === KONTEN KANAN (MAIN AREA) === */}
      <main className="flex-1 overflow-y-auto bg-dark-bg p-4 md:p-8 custom-scrollbar pt-20 md:pt-8 w-full">
        
        {/* Render Komponen */}
        {activeMenu === 'dashboard' && (
          <div className="max-w-5xl animate-in fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-white/50 mb-8 text-sm md:text-base">Ringkasan data Aya & Arjuna Project.</p>
            
            <LiveStatusControl />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <StatCard label="Total Aktivitas" value={stats.timeline} icon={<Calendar size={24}/>} color="text-blue-400" loading={loadingStats} />
              <StatCard label="Total Karya Fans" value={stats.memories} icon={<ImageIcon size={24}/>} color="text-pink-400" loading={loadingStats} />
              <StatCard label="Total Lagu" value={stats.songs} icon={<Music size={24}/>} color="text-purple-400" loading={loadingStats} />
              
              {/* Hanya Leader yang melihat Stat Admin */}
              {user?.role === 'leader' && (
                <StatCard label="Total Admin" value={stats.admins} icon={<Users size={24}/>} color="text-yellow-400" loading={loadingStats} />
              )}
            </div>
            
            <div className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold text-xl md:text-2xl mb-2 flex items-center gap-2">
                  <BarChart3 className="text-primary"/> Sistem Berjalan Normal
                </h3>
                <p className="text-white/70 max-w-xl leading-relaxed text-sm md:text-base">
                  Selamat datang kembali, <strong style={{ color: user?.username_color || '#fff' }}>{user?.username}</strong>! 
                  Semua sistem manajemen konten siap digunakan.
                </p>
                <div className="mt-6 flex gap-3">
                   <button onClick={() => setActiveMenu('timeline')} className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-sm font-bold transition-colors">Upload Aktivitas</button>
                   <button onClick={() => setActiveMenu('reports')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">Cek Laporan</button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 md:w-64 md:h-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-500"></div>
            </div>
          </div>
        )}

        {/* PROTEKSI RENDER: HANYA LEADER YANG BISA RENDER MANAGE ADMINS */}
        {activeMenu === 'admins' && user?.role === 'leader' && <ManageAdmins />}
        
        {activeMenu === 'guestbook' && <ManageGuestbook />}
        {activeMenu === 'reports' && <ManageReports />}
        
        {/* PROTEKSI RENDER: LOGS JUGA HANYA LEADER */}
        {activeMenu === 'logs' && user?.role === 'leader' && <ActivityLogs />}
        
        {activeMenu === 'profile' && <EditProfile />}
        {activeMenu === 'timeline' && <ManageTimeline />}
        {activeMenu === 'memories' && <ManageMemories />}
        {activeMenu === 'songs' && <ManageSongs />}

      </main>
    </div>
  );
}

// === HELPER COMPONENTS ===

function MenuItem({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, icon, color, loading }: any) {
  return (
    <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border hover:border-primary/30 transition-colors shadow-lg group">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {loading ? (
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-primary animate-spin"></div>
        ) : (
          <span className="text-3xl font-bold text-white">{value}</span>
        )}
      </div>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}