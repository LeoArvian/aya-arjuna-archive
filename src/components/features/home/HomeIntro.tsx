import { motion } from 'framer-motion';
import ScrollFloat from '../../shared/ScrollFloat'; // Import komponen animasi

export default function HomeIntro() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto text-center relative z-10">
      
      {/* JUDUL DENGAN EFEK SCROLL FLOAT */}
      <div className="mb-8 flex justify-center">
        <ScrollFloat 
          animationDuration={1} 
          ease='back.inOut(2)' 
          scrollStart='top bottom-=10%' 
          scrollEnd='bottom center' 
          stagger={0.05}
          textClassName="font-['Playfair_Display'] font-bold text-primary italic"
        >
          Tentang Website
        </ScrollFloat>
      </div>

      {/* Konten Paragraf (Tetap pakai Framer Motion untuk fade-in halus) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-6"
      >
        <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
          Selamat datang di <span className="text-white font-medium">Arsip Resmi Penggemar</span> untuk 
          <strong className="text-primary"> Aya Aulya</strong> dan <strong className="text-blue-400"> Arjuna Arkana</strong>.
        </p>
        
        <p className="text-lg text-white/60 leading-relaxed max-w-3xl mx-auto">
          Di sini kamu bisa menemukan biodata lengkap, jejak aktivitas (timeline), kumpulan karya musik, 
          serta galeri kenangan yang mendokumentasikan momen-momen terbaik perjalanan karir mereka.
        </p>

        {/* Garis Hiasan Bawah */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-12 rounded-full" />
      </motion.div>
    </section>
  );
}