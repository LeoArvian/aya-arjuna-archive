import { useState, useEffect } from 'react';
import { guestbookService } from '../../../services/guestbookService';
import type { GuestbookMessage } from '../../../types';
import { Send, MessageSquareHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function GuestbookSection() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Ambil pesan yang approved
    const fetch = async () => {
      try {
        const data = await guestbookService.getApprovedMessages();
        setMessages(data);
      } catch (e) { console.error(e); }
    };
    fetch();
    // Refresh tiap 30 detik biar live
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) return;
    
    setSending(true);
    try {
      await guestbookService.sendMessage(name, msg);
      toast.success("Pesan terkirim! Menunggu moderasi admin.");
      setName('');
      setMsg('');
    } catch (e) {
      toast.error("Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-20 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-dark-bg to-black pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <MessageSquareHeart className="text-primary" /> Kirim Pesan Semangat
          </h2>
          <p className="text-white/50">Tulis pesan dukunganmu untuk Aya & Arjuna. Pesan terpilih akan muncul di bawah ini!</p>
        </div>

        {/* FORM KIRIM PESAN */}
        <form onSubmit={handleSend} className="max-w-xl mx-auto bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-xl mb-16">
          <div className="flex flex-col gap-4">
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Nama Kamu / Inisial" 
              maxLength={20}
              className="w-full bg-black/30 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
            <textarea 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              placeholder="Tulis pesan semangatmu di sini..." 
              maxLength={150}
              className="w-full h-24 bg-black/30 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
              required
            />
            <button 
              type="submit" 
              disabled={sending}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? 'Mengirim...' : <><Send size={18} /> Kirim Pesan</>}
            </button>
          </div>
        </form>

        {/* RUNNING TEXT (MARQUEE) */}
        {messages.length > 0 && (
          <div className="relative w-full overflow-hidden py-4 bg-white/5 backdrop-blur-sm border-y border-white/5">
            <div className="flex gap-8 animate-marquee whitespace-nowrap w-max">
              {/* Duplicate array to ensure smooth loop */}
              {[...messages, ...messages, ...messages].map((m, i) => (
                <div key={`${m.id}-${i}`} className="inline-flex items-center gap-3 px-6 py-2 bg-black/40 rounded-full border border-white/10">
                  <span className="font-bold text-primary">{m.sender_name}:</span>
                  <span className="text-white/80">"{m.message}"</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}