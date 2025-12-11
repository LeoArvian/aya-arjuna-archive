import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ProfileSplit() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] w-full">
      {/* --- Bagian AYA --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative group h-full flex flex-col items-center justify-center p-10 border-r border-white/10 overflow-hidden"
      >
        {/* Background Hover Effect */}
        <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-all duration-500 ease-in-out" />
        
        {/* Konten */}
        <div className="relative z-10 text-center">
            {/* Mengembalikan ke tampilan Emoji & Glow Sederhana */}
          <div className="w-32 h-32 rounded-full bg-primary/20 mx-auto mb-6 border-4 border-primary/50 flex items-center justify-center group-hover:scale-105 transition-transform">
             <span className="text-4xl">🌹</span>
          </div>
          <h3 className="text-4xl font-bold text-white mb-2 group-hover:text-primary transition-colors">Aya Aulya</h3>
          <p className="text-white/60 mb-8 max-w-sm mx-auto">
            Sang adik yang ceria dengan suara merdu. Kenali lebih jauh tentang pesona dan karakternya.
          </p>
          
          <Link 
            to="/profile?talent=aya" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary/80 text-white rounded-full font-bold hover:bg-primary hover:scale-105 transition-all shadow-lg shadow-primary/30"
          >
            Lihat Profil Aya <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>

      {/* --- Bagian ARJUNA --- */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative group h-full flex flex-col items-center justify-center p-10 overflow-hidden"
      >
        {/* Background Hover Effect */}
        <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/40 transition-all duration-500 ease-in-out" />

        {/* Konten */}
        <div className="relative z-10 text-center">
             {/* Mengembalikan ke tampilan Emoji & Glow Sederhana */}
          <div className="w-32 h-32 rounded-full bg-blue-500/20 mx-auto mb-6 border-4 border-blue-500/50 flex items-center justify-center group-hover:scale-105 transition-transform">
             <span className="text-4xl">🛡️</span>
          </div>
          <h3 className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Arjuna Arkana</h3>
          <p className="text-white/60 mb-8 max-w-sm mx-auto">
            Sang kakak pelindung yang cool dan berbakat. Telusuri jejak langkah dan kisahnya.
          </p>
          
          <Link 
            to="/profile?talent=arjuna" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600/80 text-white rounded-full font-bold hover:bg-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-900/50"
          >
            Lihat Profil Arjuna <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}