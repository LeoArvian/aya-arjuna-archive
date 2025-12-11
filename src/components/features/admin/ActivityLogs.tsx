import { useState, useEffect, useRef } from 'react';
import { logService } from '../../../services/logService';
import type { ActivityLog } from '../../../types';
import { History, Search, RefreshCw, Trash2, FileDown, CheckSquare, Square, X, User, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityLogs() {
  // === STATE DATA ===
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // === STATE SELECTION ===
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const tableRef = useRef<HTMLTableElement>(null);

  // === FETCH LOGS ===
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await logService.getLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat log aktivitas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // === FILTERING ===
  const filteredLogs = logs.filter(l => 
    l.admin_name?.toLowerCase().includes(filter.toLowerCase()) || 
    l.details.toLowerCase().includes(filter.toLowerCase()) ||
    l.action_type.toLowerCase().includes(filter.toLowerCase())
  );

  // === HANDLERS SELECTION ===
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLogs.length) {
      setSelectedIds(new Set()); // Unselect all
    } else {
      const allIds = new Set(filteredLogs.map(l => l.id));
      setSelectedIds(allIds); // Select all
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // === HANDLERS DELETE ===
  
  // Hapus Satu Log
  const handleDeleteOne = (id: string) => {
    toast("Hapus catatan aktivitas ini?", {
      description: "Tindakan ini akan tercatat sebagai Security Alert.",
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
          const toastId = toast.loading("Menghapus...");
          try {
            await logService.deleteLog(id);
            toast.success("Log berhasil dihapus.", { id: toastId });
            fetchLogs();
          } catch (e) {
            toast.error("Gagal menghapus log.", { id: toastId });
          }
        }
      },
      cancel: {
        label: "Batal",
        onClick: () => {}
      }
    });
  };

  // Hapus Banyak
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    toast(`Hapus ${selectedIds.size} catatan terpilih?`, {
      description: "Penghapusan massal akan memicu Security Alert tingkat tinggi.",
      action: {
        label: "Hapus Semua",
        onClick: async () => {
          setIsDeleting(true);
          const toastId = toast.loading("Menghapus data...");
          try {
            await logService.deleteLogs(Array.from(selectedIds));
            toast.success("Data terpilih berhasil dihapus.", { id: toastId });
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            fetchLogs();
          } catch (e) { 
            toast.error("Gagal menghapus data.", { id: toastId }); 
          } finally {
            setIsDeleting(false);
          }
        }
      },
      cancel: {
        label: "Batal",
        onClick: () => {}
      }
    });
  };

  // === HANDLER PRINT PDF ===
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=600');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Laporan Aktivitas Admin</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { margin-bottom: 20px; font-size: 12px; color: #555; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #eee; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Laporan Aktivitas Admin</h1>
          <div class="meta">
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            <p>Total Data: ${filteredLogs.length} baris</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Aksi</th>
                <th>Target</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs.map(log => `
                <tr>
                  <td>${new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td><strong>${log.admin_name}</strong><br/><span style="font-size:10px; color:#666;">${log.admin_role}</span></td>
                  <td>${log.action_type}</td>
                  <td>${log.target_section}</td>
                  <td>${log.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Helper Warna Badge
  const getActionColor = (type: string) => {
    switch(type) {
      case 'CREATE': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'UPDATE': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELETE': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'LOGIN': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    // PERBAIKAN: Gunakan flex-col dan h-full agar mengisi ruang yang ada
    <div className="max-w-6xl h-full flex flex-col pb-20 md:pb-0">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <History className="text-primary" /> Activity Logs
          </h2>
          <p className="text-white/50 text-sm">Rekaman aktivitas semua admin (CCTV).</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={handlePrint} className="flex-1 md:flex-none justify-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-xs md:text-sm flex items-center gap-2 transition-colors">
             <FileDown size={18}/> <span className="hidden md:inline">Unduh PDF</span><span className="md:hidden">PDF</span>
           </button>
           <button onClick={fetchLogs} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Refresh">
             <RefreshCw size={20} />
           </button>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-dark-surface p-4 rounded-xl border border-dark-border mb-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg flex-shrink-0">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Cari admin, aksi, atau detail..." 
              className="bg-black/30 text-white pl-10 pr-4 py-2.5 rounded-lg border border-white/10 w-full text-sm focus:outline-none focus:border-primary transition-all"
            />
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {isSelectionMode ? (
              <>
                <span className="text-white/50 text-xs">{selectedIds.size} dipilih</span>
                <button 
                  onClick={handleDeleteSelected} 
                  disabled={selectedIds.size === 0 || isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20"
                >
                  <Trash2 size={16}/> Hapus
                </button>
                <button onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                   <X size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSelectionMode(true)} 
                className="w-full md:w-auto px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <CheckSquare size={16}/> Pilih Banyak
              </button>
            )}
         </div>
      </div>

      {/* === 1. TAMPILAN DESKTOP (TABEL) === */}
      <div className="hidden md:block bg-dark-surface rounded-xl border border-dark-border flex-1 overflow-hidden shadow-xl flex flex-col h-full">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm" ref={tableRef}>
            <thead className="bg-black/20 text-white/50 uppercase font-bold sticky top-0 backdrop-blur-sm z-10">
              <tr>
                {isSelectionMode && (
                  <th className="p-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-white hover:text-primary">
                      {selectedIds.size === filteredLogs.length && filteredLogs.length > 0 ? <CheckSquare size={18} className="text-primary"/> : <Square size={18}/>}
                    </button>
                  </th>
                )}
                <th className="p-4">Waktu</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Aksi</th>
                <th className="p-4">Target</th>
                <th className="p-4">Detail</th>
                {!isSelectionMode && <th className="p-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-white/30">Memuat log...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-white/30">Tidak ada aktivitas ditemukan.</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(log.id) ? 'bg-primary/5' : ''}`}>
                    {isSelectionMode && (
                      <td className="p-4 text-center">
                         <button onClick={() => toggleSelectOne(log.id)} className="text-white/50 hover:text-white">
                            {selectedIds.has(log.id) ? <CheckSquare size={18} className="text-primary"/> : <Square size={18}/>}
                         </button>
                      </td>
                    )}
                    <td className="p-4 text-white/40 whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold">
                      {log.admin_name}
                      <span className="block text-[10px] font-normal text-white/40 uppercase">{log.admin_role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getActionColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="p-4 text-white/70 text-xs uppercase font-bold tracking-wider">{log.target_section}</td>
                    <td className="p-4 text-white/80 text-xs">{log.details}</td>
                    {!isSelectionMode && (
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteOne(log.id)} className="p-2 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-lg transition-colors" title="Hapus Log">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === 2. TAMPILAN MOBILE (CARD VIEW) === */}
      {/* PERBAIKAN: Gunakan flex-1 dan overflow-y-auto agar scroll di dalam container, bukan body */}
      <div className="md:hidden flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-32 pr-1">
        {loading ? (
           <div className="text-center text-white/30 py-10 text-sm">Memuat data...</div>
        ) : filteredLogs.length === 0 ? (
           <div className="text-center text-white/30 py-10 text-sm">Tidak ada aktivitas.</div>
        ) : (
           filteredLogs.map((log) => (
             <div 
                key={log.id} 
                onClick={() => isSelectionMode && toggleSelectOne(log.id)}
                className={`bg-dark-surface p-4 rounded-xl border relative transition-all ${
                  selectedIds.has(log.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-white/10 bg-black/20'
                }`}
             >
                {/* Selection Indicator */}
                {isSelectionMode && (
                  <div className="absolute top-3 right-3">
                    {selectedIds.has(log.id) ? <CheckSquare size={20} className="text-primary"/> : <Square size={20} className="text-white/30"/>}
                  </div>
                )}

                {/* Header Card */}
                <div className="flex justify-between items-start mb-3 pr-6">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                         <User size={14} className="text-white/70" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">{log.admin_name}</p>
                         <p className="text-[10px] text-white/40 uppercase">{log.admin_role}</p>
                      </div>
                   </div>
                   <span className="text-[10px] text-white/30 font-mono mt-1">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                
                {/* Date Divider */}
                <div className="text-[10px] text-white/20 mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                   <span className="w-1 h-1 rounded-full bg-white/20"></span>
                   {new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                   <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getActionColor(log.action_type)}`}>
                      {log.action_type}
                   </span>
                   <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border border-white/10 bg-white/5 text-white/60 flex items-center gap-1">
                      <Target size={10} /> {log.target_section}
                   </span>
                </div>

                {/* Details Box */}
                <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-1">
                   <p className="text-xs text-white/80 leading-relaxed flex items-start gap-2">
                      <AlertCircle size={12} className="shrink-0 mt-0.5 text-white/30" />
                      {log.details}
                   </p>
                </div>

                {/* Action (Delete Individual) - Hanya jika mode select MATI */}
                {!isSelectionMode && (
                   <div className="flex justify-end mt-3 pt-2 border-t border-white/5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteOne(log.id); }} 
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors"
                      >
                         <Trash2 size={12} /> Hapus
                      </button>
                   </div>
                )}
             </div>
           ))
        )}
      </div>

    </div>
  );
}