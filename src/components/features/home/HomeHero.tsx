import { motion } from 'framer-motion';

export default function HomeHero() {
  return (
    <div className="relative h-[55vh] md:h-[65vh] flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* Background Gradient & Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-primary/5 to-dark-bg z-0 transition-colors duration-500" />
      <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none transition-colors duration-500" />

      {/* Konten Utama */}
      <div className="relative z-10 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center"
        >
          {/* 1. JUDUL UTAMA: Playfair Display Italic (Mewah & Cantik) */}
          <span 
            className="font-['Playfair_Display'] italic font-black text-6xl md:text-8xl tracking-tight leading-tight pb-4 mb-0 
                       bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-light to-white 
                       transition-colors duration-500 drop-shadow-[0_2px_10px_rgba(var(--primary),0.3)]"
          >
            Aya & Arjuna
          </span>
          
          {/* 2. SUBTITLE: Playfair Display Regular (Serasi tapi Rapi) */}
          {/* Menggunakan font-classic agar senada dengan judul, tapi tracking diperlebar biar elegan */}
          <span className="font-classic text-white/80 text-lg md:text-2xl block font-normal tracking-[0.3em] uppercase opacity-90 mt-1">
            Official Fan Archive
          </span>
        </motion.h1>

        {/* Garis Pemanis */}
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '120px' }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-8 transition-colors duration-500"
        />

        {/* 3. DESKRIPSI BAWAH: Outfit (Modern & Unik) */}
        {/* Menggunakan font-modern (Outfit) supaya tidak kaku seperti Arial biasa */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-modern text-sm md:text-base text-white/50 font-bold tracking-widest uppercase mt-6"
        >
          Virtual Youtubers • Content Creators • Idols
        </motion.p>
      </div>
    </div>
  );
}