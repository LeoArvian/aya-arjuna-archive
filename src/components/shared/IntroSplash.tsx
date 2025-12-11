import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface IntroSplashProps {
  onFinish: () => void;
}

const TERMINAL_LINES = [
  { text: "> SYSTEM_BOOT_SEQUENCE_INITIATED...", color: "text-green-500/80", delay: 10 },
  { text: "> CONNECTING_TO_FAN_ARCHIVE_SERVER...", color: "text-white/70", delay: 30 },
  { text: "> ACCESSING_DATABASE: SUBJECT_01 [AYA_AULYA]...", color: "text-pink-500", delay: 20 },
  { text: "> VERIFYING_ASSETS... [OK]", color: "text-pink-400/60", delay: 10 },
  { text: "> ACCESSING_DATABASE: SUBJECT_02 [ARJUNA_ARKANA]...", color: "text-blue-500", delay: 20 },
  { text: "> VERIFYING_ASSETS... [OK]", color: "text-blue-400/60", delay: 10 },
  { text: "> DECRYPTING_SECURE_CONNECTION... 100%", color: "text-green-500", delay: 40 },
  { text: "> LAUNCHING_INTERFACE_V2.0", color: "text-white font-bold blink", delay: 50 },
];

export default function IntroSplash({ onFinish }: IntroSplashProps) {
  const [lines, setLines] = useState<typeof TERMINAL_LINES>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Jika semua baris sudah selesai diketik
    if (currentLineIndex >= TERMINAL_LINES.length) {
      setTimeout(() => {
        // Tampilkan Logo
        setShowLogo(true);
        // Tahan sebentar lalu masuk ke Web Utama
        setTimeout(() => {
           onFinish();
        }, 2000); 
      }, 500);
      return;
    }

    const targetLine = TERMINAL_LINES[currentLineIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      charIndex++;
      setCurrentText(targetLine.text.slice(0, charIndex));

      if (charIndex === targetLine.text.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setLines((prev) => [...prev, targetLine]);
          setCurrentText("");
          setCurrentLineIndex((prev) => prev + 1);
        }, 100); // Kecepatan jeda antar baris
      }
    }, 20); // Kecepatan ngetik

    return () => clearInterval(typeInterval);
  }, [currentLineIndex, onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden font-mono"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      
      {!showLogo ? (
        // === MODE TERMINAL ===
        <div className="relative z-10 w-full max-w-2xl px-6 md:px-0 flex flex-col justify-end min-h-[50vh] pb-20">
          
          {/* Baris yang sudah selesai diketik */}
          <div className="flex flex-col gap-1">
            {lines.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs md:text-sm tracking-wider ${line.color}`}
              >
                {line.text}
              </motion.div>
            ))}
          </div>

          {/* Baris yang sedang diketik (Cursor Hijau) */}
          <div className={`text-xs md:text-sm tracking-wider mt-1 h-6 flex items-center ${TERMINAL_LINES[currentLineIndex]?.color || 'text-white'}`}>
            <span>{currentText}</span>
            <span className="w-2 h-4 bg-green-500 ml-1 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          </div>
        </div>
      ) : (
        // === MODE LOGO (FINAL) ===
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 flex flex-col items-center"
        >
          {/* Logo Container */}
          <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 blur-3xl opacity-20 animate-pulse" />
             <img 
               src="/AJA.png" 
               alt="Aya & Arjuna" 
               className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
             />
          </div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-2xl md:text-4xl font-black text-white tracking-[0.2em] uppercase"
          >
            Aya <span className="text-white/30">&</span> Arjuna
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-0.5 bg-gradient-to-r from-pink-500 to-blue-500 mt-4"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-[10px] md:text-xs text-white/40 font-mono tracking-widest"
          >
            OFFICIAL FAN ARCHIVE
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}