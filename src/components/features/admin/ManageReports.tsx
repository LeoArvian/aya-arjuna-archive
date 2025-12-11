import { useState, useEffect, useRef } from 'react';
import { reportsService } from '../../../services/reportsService';
import type { ReportTicket } from '../../../types';
import { AlertTriangle, CheckCircle, Clock, Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CoolLoader from '../../shared/CoolLoader';
import ImageViewerModal from '../memories/ImageViewerModal';

export default function ManageReports() {
  const [reports, setReports] = useState<ReportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  
  // State untuk Preview Gambar
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getReports();
      setReports(data);
    } catch (e) {
      toast.error("Gagal memuat daftar laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    const toastId = toast.loading("Memproses...");
    try {
      await reportsService.resolveReport(id);
      toast.success("Masalah ditandai selesai!", { id: toastId });
      fetchReports(); 
    } catch (e) {
      toast.error("Gagal mengupdate status.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    toast("Hapus laporan ini?", {
      description: "Data akan hilang permanen.",
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
          const toastId = toast.loading("Menghapus...");
          try {
            await reportsService.deleteReport(id);
            toast.success("Laporan dihapus.", { id: toastId });
            fetchReports();
          } catch (e) {
            toast.error("Gagal menghapus laporan.", { id: toastId });
          }
        }
      },
      cancel: {
        label: "Batal",
        onClick: () => {}
      }
    });
  };

  const filteredReports = reports.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-6xl mx-auto w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-primary" /> Laporan Masalah
          </h2>
          <p className="text-white/50 text-sm">Daftar feedback dan bug yang dilaporkan user.</p>
        </div>
        <button onClick={fetchReports} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors self-end md:self-auto" title="Refresh Data">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* FILTERS (RESPONSIVE GRID) */}
      {/* Perbaikan: Gunakan grid-cols-3 di mobile agar pas lebar layar, flex di desktop */}
      <div className="grid grid-cols-3 md:flex md:w-fit gap-2 mb-6 bg-dark-surface p-1.5 rounded-xl border border-dark-border shadow-lg">
        <FilterBtn 
          active={filter === 'pending'} 
          onClick={() => setFilter('pending')} 
          label="Pending" 
          count={reports.filter(r => r.status === 'pending').length} 
        />
        <FilterBtn 
          active={filter === 'resolved'} 
          onClick={() => setFilter('resolved')} 
          label="Selesai" 
          count={reports.filter(r => r.status === 'resolved').length} 
        />
        <FilterBtn 
          active={filter === 'all'} 
          onClick={() => setFilter('all')} 
          label="Semua" 
          count={reports.length} 
        />
      </div>

      {/* LIST CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-surface rounded-xl border border-dark-border p-4 shadow-xl">
        {loading ? (
          <CoolLoader text="Mengambil Laporan..." />
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 italic gap-3 py-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
               <AlertTriangle size={32} className="opacity-50"/>
            </div>
            <p>Tidak ada laporan dengan status ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <div key={report.id} className={`group p-4 rounded-xl border flex flex-col gap-3 transition-all hover:shadow-lg ${report.status === 'resolved' ? 'bg-green-900/5 border-green-500/20 opacity-80 hover:opacity-100' : 'bg-black/20 border-white/10 hover:border-primary/40 hover:bg-black/30'}`}>
                
                {/* Header Card */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                      {report.status}
                    </span>
                    <span className="text-white/40 text-[10px] flex items-center gap-1 font-mono">
                      <Clock size={10}/> {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider border border-primary/20">
                    {report.category}
                  </span>
                </div>

                {/* Deskripsi */}
                <div className="flex-1 bg-black/30 p-3 rounded-lg border border-white/5 relative overflow-hidden">
                   <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words relative z-10">
                     "{report.description}"
                   </p>
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                      <AlertTriangle size={40} className="text-white"/>
                   </div>
                </div>

                {/* Tombol Lihat Bukti */}
                {report.image_url && (
                  <button 
                    onClick={() => setPreviewImage(report.image_url!)}
                    className="flex items-center justify-center gap-2 p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-colors border border-blue-500/20 hover:border-blue-500/50 group/btn"
                  >
                    <ImageIcon size={14} className="group-hover/btn:scale-110 transition-transform"/> Lihat Screenshot
                  </button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 mt-auto border-t border-white/5">
                  {report.status === 'pending' && (
                    <button 
                      onClick={() => handleResolve(report.id)}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 hover:shadow-green-500/20 active:scale-95"
                    >
                      <CheckCircle size={14}/> Selesai
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(report.id)}
                    className={`py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${report.status === 'resolved' ? 'w-full' : ''}`}
                    title="Hapus Laporan"
                  >
                    <Trash2 size={14}/> {report.status === 'resolved' ? 'Hapus Laporan' : ''}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Preview Gambar */}
      <ImageViewerModal 
        isOpen={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        imageUrl={previewImage || ''} 
        title="Bukti Laporan Masalah"
      />
    </div>
  );
}

// Helper: Filter Button (Responsive)
function FilterBtn({ active, onClick, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      // Menggunakan w-full dan justify-center agar rapi di grid mobile
      className={`w-full md:w-auto px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-2 ${active ? 'bg-primary text-white shadow-lg scale-105' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
    >
      {label} 
      <span className={`px-1.5 py-0.5 rounded-full ${active ? 'bg-black/20' : 'bg-white/10'} text-[9px] md:text-[10px] min-w-[18px] text-center`}>
        {count}
      </span>
    </button>
  );
}