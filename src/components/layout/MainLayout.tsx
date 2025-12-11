import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Settings, Menu, X, Radio, Home, User, Calendar, 
  Image as ImageIcon, Music, Search as SearchIcon, 
  Gamepad2 // <-- Import Icon Gamepad baru
} from 'lucide-react'; 
import { useSettingsStore } from '../../store/useSettingsStore';
import SettingsModal from '../features/settings/SettingsModal';
import { useTranslation } from 'react-i18next';
import { dataService } from '../../services/dataService';
import FloatingPlayer from '../features/music/FloatingPlayer';
import GlobalSearch from '../shared/GlobalSearch'; 
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  onTriggerAdmin: () => void; 
}

export default function MainLayout({ onTriggerAdmin }: MainLayoutProps) {
  const { openSettings, theme } = useSettingsStore(); 
  const { t } = useTranslation(); 
  const location = useLocation();
  
  const [clickCount, setClickCount] = useState(0);
  const [liveTalents, setLiveTalents] = useState<{ id: string, url: string }[]>([]);
  
  // State UI
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Daftar Menu Navigasi (Sudah Update ada Minigame)
  const navLinks = [
    { path: '/', label: t('nav.home'), icon: <Home size={18} /> },
    { path: '/profile', label: t('nav.profile'), icon: <User size={18} /> },
    // === MENU BARU DI SINI ===
    { path: '/game', label: 'Minigame', icon: <Gamepad2 size={18} /> }, 
    // =========================
    { path: '/timeline', label: t('nav.timeline'), icon: <Calendar size={18} /> },
    { path: '/memories', label: t('nav.memories'), icon: <ImageIcon size={18} /> },
    { path: '/songs', label: t('nav.songs'), icon: <Music size={18} /> },
  ];
  
  // === LOGIKA GANTI TEMA ===
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-aya', 'theme-arjuna');
    
    if (theme === 'aya') {
      root.classList.add('theme-aya');
    } else if (theme === 'arjuna') {
      root.classList.add('theme-arjuna');
    }
  }, [theme]);

  // Admin Trigger (Klik Logo 6x)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (clickCount > 0) {
      timer = setTimeout(() => setClickCount(0), 500);
    }
    if (clickCount >= 6) {
      onTriggerAdmin(); 
      setClickCount(0); 
    }
    return () => clearTimeout(timer);
  }, [clickCount, onTriggerAdmin]);

  // Live Status Check (Interval 1 menit)
  useEffect(() => {
    const checkLive = async () => {
      const data = await dataService.getLiveStatus();
      const liveOnes = data.filter(d => d.is_live).map(d => ({ id: d.id, url: d.live_url }));
      setLiveTalents(liveOnes);
    };
    checkLive();
    const interval = setInterval(checkLive, 60000);
    return () => clearInterval(interval);
  }, []);

  // Shortcut Ctrl+K untuk Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tutup menu mobile saat ganti halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-primary selection:text-white transition-colors duration-500 flex flex-col">
      
      {/* Global Components */}
      <SettingsModal />
      <FloatingPlayer />
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* === NAVBAR === */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border h-16 transition-colors duration-500">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          
          {/* KIRI: Logo & Live Status (Desktop) */}
          <div className="flex items-center gap-4">
             <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 group relative z-50">
                <img
                  src="/AJA.png"
                  alt="Logo Aya & Arjuna"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md rounded-full border-2 border-white/10 animate-float"
                />
                <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">
                  Aya & Arjuna
                </span>
             </Link>

             {/* Live Badge Desktop */}
             {liveTalents.map((lt) => (
                <a 
                  key={lt.id}
                  href={lt.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/50 rounded-full text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all animate-pulse"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  LIVE: {lt.id.toUpperCase()}
                </a>
             ))}
          </div>

          {/* TENGAH: Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/70">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`hover:text-primary transition-colors flex items-center gap-2 ${location.pathname === link.path ? 'text-primary font-bold' : ''}`}
              >
                {/* Kita sembunyikan icon di desktop menu biar rapi, atau dimunculkan juga boleh */}
                {/* <span className="hidden lg:inline">{link.icon}</span> */} 
                {link.label}
              </Link>
            ))}
          </div>

          {/* KANAN: Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Tombol Search */}
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 group flex items-center gap-2"
              title="Search (Ctrl+K)"
            >
              <SearchIcon size={20} />
              <span className="hidden lg:inline-block text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/5 text-white/30 group-hover:text-white/70 transition-colors">Ctrl K</span>
            </button>

            {/* Tombol Settings */}
            <button 
              onClick={openSettings} 
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95" 
              title={t('nav.settings')}
            >
              <Settings size={20} />
            </button>
            
            {/* Tombol Hamburger Mobile (Tanpa AnimatePresence agar stabil) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <div className="relative w-6 h-6">
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 1, rotate: 0, scale: 1 }}
                  animate={{ 
                    opacity: isMobileMenuOpen ? 0 : 1, 
                    rotate: isMobileMenuOpen ? 90 : 0,
                    scale: isMobileMenuOpen ? 0.5 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>

                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ 
                    opacity: isMobileMenuOpen ? 1 : 0, 
                    rotate: isMobileMenuOpen ? 0 : -90,
                    scale: isMobileMenuOpen ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* === MOBILE MENU OVERLAY === */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Gelap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            />
            
            {/* Menu Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="fixed top-16 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-xl border-b border-white/10 shadow-2xl overflow-hidden md:hidden rounded-b-2xl"
              style={{ transformOrigin: "top right" }}
            >
              <div className="p-4 flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                        location.pathname === link.path 
                          ? 'bg-primary/20 text-primary font-bold border border-primary/30' 
                          : 'hover:bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${location.pathname === link.path ? 'bg-primary text-white' : 'bg-white/10'}`}>
                        {link.icon}
                      </div>
                      <span className="text-sm">{link.label}</span>
                      
                      {location.pathname === link.path && (
                        <motion.div layoutId="active-dot" className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Footer Menu Mobile */}
              <div className="p-4 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  Aya & Arjuna Fan Archive
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Live Alert Mobile (Fixed Top) */}
      {liveTalents.length > 0 && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-20 bg-primary text-white text-xs font-bold py-2 px-4 text-center shadow-lg flex justify-center gap-4 animate-in slide-in-from-top-full">
           {liveTalents.map(lt => (
             <a key={lt.id} href={lt.url} target="_blank" className="flex items-center gap-2 animate-pulse">
                <Radio size={14} /> {lt.id.toUpperCase()} IS LIVE!
             </a>
           ))}
        </div>
      )}

      {/* Main Content */}
      <main className={`pt-16 min-h-screen ${liveTalents.length > 0 ? 'mt-8 md:mt-0' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-primary/10 to-dark-bg border-t border-primary/20 py-10 mt-20 transition-colors duration-500 relative z-10">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <div className="flex justify-center items-center gap-4 mb-4">
             <img
                  src="/AJA.png"
                  alt="Logo Aya & Arjuna"
                  className="w-12 h-12 object-contain drop-shadow-md rounded-full border-2 border-white/10 animate-float"
                />
          </div>
          <p>© 2026 Aya Aulya & Arjuna Arkana Project.</p>
          <p className="mt-2 text-xs flex items-center justify-center gap-1">
            Created with <span className="text-primary">❤</span> by Fans.
          </p>
        </div>
      </footer>
    </div>
  );
}