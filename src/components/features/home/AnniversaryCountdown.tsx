import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// PartyPopper dihapus karena diganti dengan animasi kustom

export default function AnniversaryCountdown() {
  const { t } = useTranslation();
  
  const [celebration, setCelebration] = useState<{
    active: boolean;
    title: string;
    desc: string;
    colorClass: string; // Ganti 'color' jadi 'colorClass' biar lebih jelas
    baseColor: string; // Warna dasar untuk partikel (hex/rgb)
  } | null>(null);

  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentDate = now.getDate();

      // --- CONFIG TANGGAL SPESIAL ---

      // 1. Anniversary Debut Bersama: 15 Maret (Emas)
      if (currentMonth === 3 && currentDate === 15) {
        setCelebration({
          active: true,
          title: t('home.anniv_debut_title'),
          desc: t('home.anniv_debut_desc'),
          colorClass: 'text-yellow-400',
          baseColor: '#facc15' // Kuning Emas
        });
        return;
      }

      // 2. Anniversary Aya: 3 Oktober (Merah)
      if (currentMonth === 10 && currentDate === 3) {
        setCelebration({
          active: true,
          title: t('home.anniv_aya_title'),
          desc: t('home.anniv_aya_desc'),
          colorClass: 'text-red-500',
          baseColor: '#ef4444' // Merah
        });
        return;
      }

      // 3. Anniversary Arjuna: 7 Juli (Biru/Perak)
      if (currentMonth === 7 && currentDate === 7) {
        setCelebration({
          active: true,
          title: t('home.anniv_arjuna_title'),
          desc: t('home.anniv_arjuna_desc'),
          colorClass: 'text-blue-400',
          baseColor: '#60a5fa' // Biru Terang
        });
        return;
      }

      // Jika tidak ada yang cocok hari ini
      setCelebration(null);
    };

    checkDate();
    const interval = setInterval(checkDate, 60000); 
    return () => clearInterval(interval);
  }, [t]);

  if (!celebration) return null;

  // --- FUNGSI GENERATE PARTIKEL ---

  // 1. Kembang Api (Meledak dari tengah)
  const renderFireworks = () => {
    const particles = [];
    const colors = [celebration.baseColor, '#ffffff', '#FFD700', '#FF4500']; // Warna tema + variasi

    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2; // Sudut acak
      const distance = 50 + Math.random() * 150; // Jarak ledakan
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 6;
      const delay = Math.random() * 2; // Delay biar gak barengan

      particles.push(
        <div
          key={`fw-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full animate-firework-explode opacity-0 origin-center"
          style={{
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`, // Efek glowing
            '--tx': `${tx}px`,
            '--ty': `${ty}px`,
            animationDelay: `${delay}s`,
            zIndex: 0,
          } as React.CSSProperties}
        />
      );
    }
    return particles;
  };

  // 2. Pita Confetti (Jatuh dari atas)
  const renderConfetti = () => {
    const confetti = [];
    const colors = [celebration.baseColor, '#ffffff', '#FFD700', '#FF69B4', '#00BFFF'];

    for (let i = 0; i < 70; i++) {
      const left = Math.random() * 100; // Posisi horizontal acak (0-100%)
      const color = colors[Math.floor(Math.random() * colors.length)];
      const width = 8 + Math.random() * 10;
      const height = 15 + Math.random() * 20;
      const delay = Math.random() * 5; // Delay jatuh bervariasi
      const duration = 3 + Math.random() * 4; // Durasi jatuh bervariasi

      confetti.push(
        <div
          key={`cf-${i}`}
          className="absolute top-[-10%] animate-confetti-fall opacity-0"
          style={{
            left: `${left}%`,
            backgroundColor: color,
            width: `${width}px`,
            height: `${height}px`,
            transform: `rotate(${Math.random() * 360}deg)`, // Rotasi awal acak
            '--fall-duration': `${duration}s`,
            '--fall-delay': `${delay}s`,
            '--rot-dir': Math.random() > 0.5 ? 1 : -1, // Arah putaran acak
            zIndex: 0,
          } as React.CSSProperties}
        />
      );
    }
    return confetti;
  };

  return (
    <section className="py-24 relative overflow-hidden border-y border-white/10">
      
      {/* --- LAPISAN ANIMASI --- */}
      
      {/* 1. Background Glow Berkedip */}
      <div 
        className="absolute inset-0 animate-pulse-slow opacity-30"
        style={{ background: `radial-gradient(circle at center, ${celebration.baseColor} 0%, transparent 70%)` }}
      />

      {/* 2. Wadah Kembang Api (di tengah) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         {renderFireworks()}
      </div>

      {/* 3. Wadah Confetti (seluruh layar) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {renderConfetti()}
      </div>

      {/* --- KONTEN TEKS UTAMA (Foreground) --- */}
      <div className="container mx-auto px-4 text-center relative z-10 animate-in fade-in zoom-in duration-1000 delay-500">
        
        {/* Ikon Besar di Tengah (Ganti PartyPopper dengan teks emoji besar atau biarkan kosong agar fokus ke kembang api) */}
        <div className="mb-4 text-6xl md:text-8xl animate-bounce-slow drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
          🎉
        </div>

        <h2 className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight uppercase ${celebration.colorClass} drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]`}>
          {celebration.title}
        </h2>
        
        <p className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
          {celebration.desc}
        </p>

      </div>
    </section>
  );
}