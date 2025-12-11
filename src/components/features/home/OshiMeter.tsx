import { useState, useEffect } from 'react';
import { interactionService } from '../../../services/interactionService';
import { useTranslation } from 'react-i18next';
import { Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';

export default function OshiMeter() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({ aya: 0, arjuna: 0 });
  const [clicks, setClicks] = useState<{id: number, talent: 'aya'|'arjuna', x: number, y: number}[]>([]);

  useEffect(() => {
    interactionService.getOshiCounts().then(setCounts);
    const channel = supabase
      .channel('oshi_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'oshi_meter' }, (payload) => {
        const newData = payload.new as { id: 'aya'|'arjuna', count: number };
        setCounts(prev => ({ ...prev, [newData.id]: newData.count }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleClick = (talent: 'aya' | 'arjuna', e: React.MouseEvent) => {
    setCounts(prev => ({ ...prev, [talent]: prev[talent] + 1 }));
    interactionService.sendSupport(talent);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newClick = { id: Date.now(), talent, x, y };
    setClicks(prev => [...prev, newClick]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 1000);
  };

  return (
    // SECTION BACKGROUND: Mengikuti Tema (Primary)
    // Menggunakan bg-primary/5 agar ada tint warna tema, border-primary/20
    <section className="py-20 bg-gradient-to-b from-dark-surface to-primary/10 border-y border-primary/20 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-10">
        
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          {/* Icon Petir ikut warna tema */}
          <Zap className="text-primary" /> {t('home.oshi_title')}
        </h2>
        <p className="text-white/50 mb-12">{t('home.oshi_desc')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* CARD AYA: TETAP MERAH (Hardcoded) */}
          <div className="relative group">
            <button 
              onClick={(e) => handleClick('aya', e)}
              className="w-full bg-gradient-to-br from-red-900/40 to-black border border-red-500/30 p-8 rounded-3xl hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all active:scale-95 overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="mb-4">
                 <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">🌹</span>
                 </div>
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-1">Aya Aulya</h3>
               <div className="text-4xl font-black text-red-500 tabular-nums mb-4">
                 {counts.aya.toLocaleString()}
               </div>
               <span className="text-xs font-bold text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full group-hover:bg-red-600 group-hover:text-white group-hover:border-transparent transition-colors">
                 {t('home.btn_support_aya')}
               </span>

               <AnimatePresence>
                 {clicks.filter(c => c.talent === 'aya').map(c => (
                   <motion.div
                     key={c.id}
                     initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                     animate={{ opacity: 0, y: -100, x: (Math.random() - 0.5) * 50, scale: 1.5 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.8 }}
                     className="absolute pointer-events-none text-red-500"
                     style={{ left: '50%', top: '40%' }}
                   >
                     <Heart fill="currentColor" size={24} />
                   </motion.div>
                 ))}
               </AnimatePresence>
            </button>
          </div>

          {/* CARD ARJUNA: TETAP BIRU (Hardcoded) */}
          <div className="relative group">
            <button 
              onClick={(e) => handleClick('arjuna', e)}
              className="w-full bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 p-8 rounded-3xl hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all active:scale-95 overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="mb-4">
                 <div className="w-24 h-24 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">🛡️</span>
                 </div>
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-1">Arjuna Arkana</h3>
               <div className="text-4xl font-black text-blue-400 tabular-nums mb-4">
                 {counts.arjuna.toLocaleString()}
               </div>
               <span className="text-xs font-bold text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-colors">
                 {t('home.btn_support_arjuna')}
               </span>

               <AnimatePresence>
                 {clicks.filter(c => c.talent === 'arjuna').map(c => (
                   <motion.div
                     key={c.id}
                     initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                     animate={{ opacity: 0, y: -100, x: (Math.random() - 0.5) * 50, scale: 1.5 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.8 }}
                     className="absolute pointer-events-none text-blue-400"
                     style={{ left: '50%', top: '40%' }}
                   >
                     <Heart fill="currentColor" size={24} />
                   </motion.div>
                 ))}
               </AnimatePresence>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}