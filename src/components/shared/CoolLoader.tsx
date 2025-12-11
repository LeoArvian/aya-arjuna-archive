import { motion } from 'framer-motion';

export default function CoolLoader({ text = "ACCESSING DATA..." }: { text?: string }) {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center gap-8 bg-transparent">
      
      {/* === SYSTEM CORE SPINNER === */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        
        {/* Ring 1 (Aya Color - Pink) - Putar Kanan Cepat */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
        />

        {/* Ring 2 (Arjuna Color - Blue) - Putar Kiri Lambat */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        />

        {/* Core (Inti Tengah) - Denyut */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"
        />
        
        {/* Orbit Dot Kecil (Hiasan) */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 w-full h-full"
        >
           <div className="w-1.5 h-1.5 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
        </motion.div>

      </div>
      
      {/* === TEXT STATUS === */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-white/70 font-mono text-xs tracking-[0.3em] animate-pulse font-bold">
          {text.toUpperCase()}
        </p>
        <div className="flex gap-1">
           <motion.div 
             animate={{ opacity: [0, 1, 0] }} 
             transition={{ duration: 1, repeat: Infinity, delay: 0 }}
             className="w-1 h-1 bg-white/30 rounded-full" 
           />
           <motion.div 
             animate={{ opacity: [0, 1, 0] }} 
             transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
             className="w-1 h-1 bg-white/30 rounded-full" 
           />
           <motion.div 
             animate={{ opacity: [0, 1, 0] }} 
             transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
             className="w-1 h-1 bg-white/30 rounded-full" 
           />
        </div>
      </div>

    </div>
  );
}