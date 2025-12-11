import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import type { TalentProfile } from '../../types';
import SpriteViewer from '../../components/features/profile/SpriteViewer';
import ProfileBio from '../../components/features/profile/ProfileBio';
import { User, Calendar, Image as ImageIcon, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CoolLoader from '../../components/shared/CoolLoader';
import { useTranslation } from 'react-i18next';

// Import Halaman Konten Lengkap
import TimelinePage from './TimelinePage';
import MemoriesPage from './MemoriesPage';
import SongsPage from './SongsPage';

type TabType = 'bio' | 'timeline' | 'memories' | 'songs';

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  
  const activeTalentId = searchParams.get('talent') || 'aya';
  
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('bio');

  // State baru untuk mengontrol kapan SpriteViewer boleh muncul
  const [isSpriteViewerReady, setIsSpriteViewerReady] = useState(true);

  // Cek apakah sedang di tab Bio
  const isBio = activeTab === 'bio';

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      // Beri sedikit delay visual agar animasi transisi talent terlihat smooth
      await new Promise(r => setTimeout(r, 100)); 
      const data = await dataService.getProfile(activeTalentId);
      setProfile(data);
      setLoading(false);
      // Pastikan SpriteViewer langsung muncul saat load awal
      setIsSpriteViewerReady(true);
    }
    fetchProfile();
  }, [activeTalentId]);

  // LOGIKA UTAMA PERBAIKAN BUG OVERLAP (Delay munculnya SpriteViewer saat kembali ke Bio)
  useEffect(() => {
    if (activeTab !== 'bio') {
      // Sembunyikan segera saat pindah dari Bio
      setIsSpriteViewerReady(false);
    } else {
      // Tampilkan SETELAH durasi transisi layout selesai (450ms > 400ms layout duration)
      const delay = setTimeout(() => {
        setIsSpriteViewerReady(true);
      }, 450); 
      return () => clearTimeout(delay);
    }
  }, [activeTab]);

  const switchTalent = (id: string) => {
    if (id === activeTalentId) return;
    setSearchParams({ talent: id });
    setActiveTab('bio');
  };

  // Gunakan CoolLoader dengan teks terjemahan
  if (loading) return <CoolLoader text={t('profile.loading')} />;
  
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center text-white flex-col gap-4">
       <h2 className="text-2xl font-bold">Profil Tidak Ditemukan</h2>
       <p className="text-white/50">Pastikan data sudah diisi di Admin Panel.</p>
    </div>
  );

  const sprites = [profile.sprites?.[0], profile.sprites?.[1], profile.sprites?.[2]].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-dark-bg pt-8 pb-20 overflow-x-hidden">
      <div className="container mx-auto px-4">
        
        {/* Toggle Talent Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-dark-surface p-1 rounded-full border border-dark-border inline-flex relative z-20 shadow-lg">
            <button 
              onClick={() => switchTalent('aya')}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTalentId === 'aya' ? 'bg-red-600 text-white shadow-lg transform scale-105' : 'text-white/50 hover:text-white'}`}
            >
              Aya Aulya
            </button>
            <button 
              onClick={() => switchTalent('arjuna')}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTalentId === 'arjuna' ? 'bg-gray-700 text-white shadow-lg transform scale-105' : 'text-white/50 hover:text-white'}`}
            >
              Arjuna Arkana
            </button>
          </div>
        </div>

        {/* ANIMASI PERGANTIAN PROFIL (Aya <-> Arjuna) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTalentId} // Kunci animasi ganti talent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative"
          >
            
            {/* KIRI: Sprite (Muncul di Mobile & Desktop) */}
            <AnimatePresence mode="popLayout"> 
              {isBio && isSpriteViewerReady && ( 
                <motion.div 
                  key="sprite-sidebar"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                  layoutId="sprite-sidebar" 
                  // HAPUS 'hidden lg:block' AGAR MUNCUL DI MOBILE
                  className="lg:col-span-5 lg:sticky lg:top-24" 
                >
                  <SpriteViewer sprites={sprites} talentName={profile.name} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* KANAN: Content Area (Animasi Lebar) */}
            <motion.div 
              layout // Mengaktifkan animasi layout otomatis saat class berubah
              transition={{ 
                layout: { duration: 0.4, type: "spring", bounce: 0, damping: 25 } 
              }}
              // PERBAIKAN:
              // Saat Bio: lg:col-start-6 (Mulai di kolom 6, sisa 7 kolom ke kanan, total 13 garis grid)
              // Saat Timeline: lg:col-start-1 (Mulai di kolom 1, full width)
              // Ini MEMAKSA elemen untuk diam di kanan saat menyusut.
              className={`flex flex-col w-full ${isBio ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-12 lg:col-start-1'}`} 
            >
              
              {/* Tab Navigation */}
              <div className={`flex overflow-x-auto pb-2 mb-6 border-b border-white/10 gap-6 no-scrollbar sticky top-16 bg-dark-bg z-30 pt-2 transition-all duration-500 ${isBio ? '' : 'justify-center'}`}>
                <TabButton 
                  isActive={activeTab === 'bio'} 
                  onClick={() => setActiveTab('bio')} 
                  icon={<User size={18} />} 
                  label={t('profile.tabs.bio')} 
                />
                <TabButton 
                  isActive={activeTab === 'timeline'} 
                  onClick={() => setActiveTab('timeline')} 
                  icon={<Calendar size={18} />} 
                  label={t('profile.tabs.timeline')} 
                />
                <TabButton 
                  isActive={activeTab === 'memories'} 
                  onClick={() => setActiveTab('memories')} 
                  icon={<ImageIcon size={18} />} 
                  label={t('profile.tabs.memories')} 
                />
                <TabButton 
                  isActive={activeTab === 'songs'} 
                  onClick={() => setActiveTab('songs')} 
                  icon={<Music size={18} />} 
                  label={t('profile.tabs.songs')} 
                />
              </div>

              {/* Tab Content dengan Animasi Fade */}
              <div className="min-h-[400px]">
                {activeTab === 'bio' && (
                  <FadeIn>
                    <ProfileBio profile={profile} />
                  </FadeIn>
                )}
                
                {activeTab === 'timeline' && (
                  <FadeIn>
                    <div className={`transition-all duration-500 ${isBio ? '-mx-4 md:mx-0' : ''}`}> 
                       <TimelinePage talentFilter={activeTalentId} />
                    </div>
                  </FadeIn>
                )}
                
                {activeTab === 'memories' && (
                   <FadeIn>
                     <div className={`transition-all duration-500 ${isBio ? '-mx-4 md:mx-0' : ''}`}>
                       <MemoriesPage talentFilter={activeTalentId} />
                     </div>
                   </FadeIn>
                )}
                
                {activeTab === 'songs' && (
                   <FadeIn>
                     <div className={`transition-all duration-500 ${isBio ? '-mx-4 md:mx-0' : ''}`}>
                       <SongsPage talentFilter={activeTalentId} />
                     </div>
                   </FadeIn>
                )}
              </div>

            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ isActive, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 px-1 transition-all whitespace-nowrap border-b-2 ${
        isActive 
          ? 'border-primary text-white font-bold' 
          : 'border-transparent text-white/50 hover:text-white hover:border-white/30'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// Helper untuk animasi konten agar kode lebih bersih
function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}