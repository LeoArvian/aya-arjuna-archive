import { useState, useEffect } from 'react';
import { guestbookService } from '../../../services/guestbookService';
import type { GuestbookMessage } from '../../../types';
import { MessageSquare, Check, Trash2, Clock, Search, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageGuestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<GuestbookMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await guestbookService.getAllMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleApprove = async (id: string) => {
    const toastId = toast.loading("Memproses...");
    try {
      await guestbookService.approveMessage(id);
      toast.success("Pesan disetujui! Akan muncul di web.", { id: toastId });
      fetchMessages();
    } catch (err) {
      toast.error("Gagal menyetujui.", { id: toastId });
    }
  };

  // 1. Buka Modal Konfirmasi
  const openDeleteModal = (msg: GuestbookMessage) => {
    setMessageToDelete(msg);
    setShowDeleteModal(true);
  };

  // 2. Eksekusi Hapus
  const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Menghapus pesan...");
    
    try {
      await guestbookService.deleteMessage(messageToDelete.id);
      toast.success("Pesan berhasil dihapus.", { id: toastId });
      
      // Tutup modal & refresh
      setShowDeleteModal(false);
      setMessageToDelete(null);
      fetchMessages();
    } catch (err) {
      toast.error("Gagal menghapus pesan.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingMessages = messages.filter(m => m.status === 'pending');
  const approvedMessages = messages.filter(m => m.status === 'approved' && (m.sender_name.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] relative">
      
      {/* KOLOM KIRI: PENDING (BUTUH PERSETUJUAN) */}
      <div className="bg-dark-surface rounded-xl border border-dark-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dark-border bg-yellow-500/10 flex justify-between items-center">
          <h2 className="font-bold text-yellow-500 flex items-center gap-2">
            <Clock size={20} /> Menunggu Persetujuan ({pendingMessages.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {pendingMessages.length === 0 ? (
            <div className="text-center py-10 text-white/30 italic">Tidak ada pesan baru.</div>
          ) : (
            pendingMessages.map(msg => (
              <div key={msg.id} className="bg-black/30 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-white text-sm">{msg.sender_name}</span>
                  <span className="text-[10px] text-white/40">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-white/80 text-sm mb-4 bg-white/5 p-3 rounded-lg italic">"{msg.message}"</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openDeleteModal(msg)} 
                    className="flex-1 py-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                  <button 
                    onClick={() => handleApprove(msg.id)} 
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={14} /> Terima
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* KOLOM KANAN: APPROVED (RIWAYAT) */}
      <div className="bg-dark-surface rounded-xl border border-dark-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dark-border bg-black/20 flex gap-3 items-center">
          <MessageSquare className="text-primary" size={20} />
          <h2 className="font-bold text-white mr-auto">Pesan Diterima</h2>
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" size={14}/>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari..." 
              className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-xs text-white focus:outline-none focus:border-primary" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
          {approvedMessages.map(msg => (
            <div key={msg.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5 group hover:border-white/20 transition-colors">
              <div className="overflow-hidden pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-xs">{msg.sender_name}</span>
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 rounded">Live</span>
                </div>
                <p className="text-white/60 text-xs truncate">"{msg.message}"</p>
              </div>
              <button 
                onClick={() => openDeleteModal(msg)} 
                className="p-2 text-white/20 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Hapus Pesan"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {approvedMessages.length === 0 && (
            <div className="text-center py-10 text-white/30 italic text-sm">Belum ada pesan diterima.</div>
          )}
        </div>
      </div>

      {/* === MODAL KONFIRMASI HAPUS YANG KEREN === */}
      {showDeleteModal && messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-dark-surface border border-red-500/30 rounded-2xl p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Icon Warning */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hapus Pesan?</h3>
              <p className="text-white/60 text-sm mb-4">
                Tindakan ini tidak dapat dibatalkan. Pesan dari <strong className="text-white">{messageToDelete.sender_name}</strong> akan dihapus permanen.
              </p>
              
              {/* Preview Pesan */}
              <div className="w-full bg-black/40 p-3 rounded-lg border border-white/5 text-left">
                <p className="text-white/80 text-xs italic line-clamp-3">"{messageToDelete.message}"</p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Menghapus...' : <><Trash2 size={16}/> Ya, Hapus</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}