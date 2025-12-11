import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion'; 

import MainLayout from './components/layout/MainLayout';
import AdminOverlay from './components/features/admin/AdminOverlay';
import HomePage from './pages/public/HomePage';
import ProfilePage from './pages/public/ProfilePage';
import IntroSplash from './components/shared/IntroSplash'; 
import TimelinePage from './pages/public/TimelinePage';
import MemoriesPage from './pages/public/MemoriesPage';
import SongsPage from './pages/public/SongsPage';
import TargetCursor from './components/shared/TargetCursor';
import GamePage from './pages/public/GamePage';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true); 

  const openAdmin = useCallback(() => setIsAdminOpen(true), []);
  const closeAdmin = useCallback(() => setIsAdminOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        openAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAdmin]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <IntroSplash onFinish={handleSplashFinish} />
        )}
      </AnimatePresence>

      {/* Pasang Target Cursor di sini agar aktif global */}
      <TargetCursor />

      <BrowserRouter>
        <Toaster 
          position="top-right" 
          theme="dark"
          // === SETTING NOTIFIKASI BARU ===
          duration={3000} // Otomatis hilang dalam 3 detik
          closeButton // Munculkan tombol silang (X)
          // ==============================
          toastOptions={{
            style: {
              background: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '16px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            },
          }}
        />

        <AdminOverlay isOpen={isAdminOpen} onClose={closeAdmin} />

        <Routes>
          <Route path="/" element={<MainLayout onTriggerAdmin={openAdmin} />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="memories" element={<MemoriesPage />} />
            <Route path="songs" element={<SongsPage />} />
            <Route path="game" element={<GamePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;