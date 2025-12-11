import { useState, useEffect } from 'react';
import { songsService } from '../../../services/songsService';
import { contentService } from '../../../services/contentService';
import type { SongItem } from '../../../types';
import { Trash2, Music, Search, ChevronLeft, ChevronRight, Pencil, X as XIcon, Youtube, Upload, Link as LinkIcon, List, PlusSquare, RefreshCw, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import CoolLoader from '../../shared/CoolLoader';

export default function ManageSongs() {
  // === STATE DATA ===
  const [items, setItems] = useState<SongItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // === STATE UI MOBILE (TAB SYSTEM) ===
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'list'>('list'); // Default: Daftar Lagu

  // === STATE FORM ===
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    talent: 'aya',
    title: '',
    type: 'cover',
    duration: '',
    release_date: new Date().toISOString().split('T')[0],
    youtube_url: '',
    thumbnail_url: ''
  });
  
  const [uploadMode, setUploadMode] = useState<'auto' | 'url'>('auto');

  // === FETCH DATA ===
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await songsService.getSongs({ 
        page, 
        limit: 10,
        talent: form.talent // Filter otomatis agar preview sesuai input
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (e) {
      toast.error("Gagal memuat data lagu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page, form.talent]);

  // === HANDLERS ===
  
  const extractYoutubeThumb = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` : null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    const thumb = extractYoutubeThumb(newUrl);
    setForm(prev => ({ 
      ...prev, 
      youtube_url: newUrl, 
      thumbnail_url: thumb || (newUrl === '' ? '' : prev.thumbnail_url) 
    }));
    if (thumb) setUploadMode('auto');
  };

  const handleManualExtract = () => {
    const thumb = extractYoutubeThumb(form.youtube_url);
    if (thumb) {
        setForm(prev => ({ ...prev, thumbnail_url: thumb }));
        setUploadMode('auto');
        toast.success("Thumbnail berhasil diekstrak!");
    } else {
        toast.error("Gagal ekstrak. Pastikan link YouTube valid.");
    }
  };

  const handleEdit = (item: SongItem) => {
    setEditingId(item.id);
    setForm({
      talent: item.talent,
      title: item.title,
      type: item.type,
      duration: item.duration,
      release_date: item.release_date ? new Date(item.release_date).toISOString().split('T')[0] : '',
      youtube_url: item.youtube_url,
      thumbnail_url: item.thumbnail_url
    });
    setUploadMode('auto');
    
    // Pindah ke Tab Form (Mobile)
    setActiveMobileTab('form');
    toast.info("Mode Edit Aktif", { description: `Mengedit: ${item.title}` });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ talent: 'aya', title: '', type: 'cover', duration: '', release_date: new Date().toISOString().split('T')[0], youtube_url: '', thumbnail_url: '' });
    // Kembali ke List (Mobile)
    setActiveMobileTab('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan lagu...");

    try {
      const data = {
        talent: form.talent as any,
        title: form.title,
        type: form.type as any,
        duration: form.duration,
        release_date: form.release_date,
        youtube_url: form.youtube_url,
        thumbnail_url: form.thumbnail_url
      };

      if (editingId) {
        await contentService.updateSong(editingId, data);
        toast.success("Lagu Diperbarui!", { id: toastId, description: "Data di Timeline juga ikut terupdate." });
      } else {
        await contentService.createSong(data);
        toast.success("Lagu Ditambahkan!", { id: toastId, description: "Otomatis ditambahkan ke Timeline juga." });
      }
      
      cancelEdit();
      fetchItems();
    } catch(err) { 
      console.error(err);
      toast.error("Gagal menyimpan data.", { id: toastId });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
     toast("Hapus lagu ini?", {
       description: "Data di Timeline yang terkait juga akan dihapus.",
       action: {
         label: "Ya, Hapus",
         onClick: async () => {
            const t = toast.loading("Menghapus...");
            try {
               await contentService.deleteSong(id);
               toast.success("Terhapus!", { id: t });
               fetchItems();
            } catch(e) {
               toast.error("Gagal menghapus.", { id: t });
            }
         }
       },
       cancel: { label: "Batal", onClick: () => {} }
     });
  };

  const totalPages = Math.ceil(total / 10);
  const inputClass = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-white/20";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      
      {/* === HEADER MOBILE & TABS === */}
      <div className="md:hidden flex flex-col gap-4 mb-4 shrink-0">
         <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Music className="text-primary" size={20} /> Manage Songs</h2>
            <button onClick={fetchItems} className="p-2 bg-white/10 rounded-lg text-white"><RefreshCw size={18}/></button>
         </div>
         
         {/* TAB CONTROL */}
         <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveMobileTab('list')} 
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'list' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
               <List size={14} /> Daftar Lagu
            </button>
            <button 
              onClick={() => setActiveMobileTab('form')} 
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'form' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
               {editingId ? <Pencil size={14}/> : <PlusSquare size={14}/>} {editingId ? 'Edit Lagu' : 'Upload Baru'}
            </button>
         </div>
      </div>

      {/* === CONTAINER UTAMA === */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* === FORM SECTION (Kiri Desktop / Tab Form Mobile) === */}
         <div className={`lg:col-span-4 flex flex-col h-full overflow-hidden ${activeMobileTab === 'form' ? 'block' : 'hidden lg:flex'}`}>
            <div className="bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full shadow-xl overflow-hidden">
                <div className="p-4 border-b border-dark-border bg-black/20 flex justify-between items-center shrink-0">
                   <h2 className="font-bold text-white flex items-center gap-2">
                     {editingId ? <><Pencil size={18} className="text-yellow-400"/> Edit Lagu</> : <><Upload size={18} className="text-primary"/> Upload Lagu</>}
                   </h2>
                   {editingId && <button onClick={cancelEdit} className="text-white/50 hover:text-white bg-white/5 p-1.5 rounded-lg transition-colors" title="Batal Edit"><XIcon size={18}/></button>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-4 pb-20 md:pb-0">
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <Label>Talent</Label>
                         <select value={form.talent} onChange={e => setForm({...form, talent: e.target.value})} className={inputClass}>
                           <option value="aya" className="bg-dark-surface">Aya Aulya</option>
                           <option value="arjuna" className="bg-dark-surface">Arjuna Arkana</option>
                           <option value="duet" className="bg-dark-surface">Duet</option>
                         </select>
                       </div>
                       <div>
                         <Label>Tipe</Label>
                         <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputClass}>
                           <option value="cover" className="bg-dark-surface">Cover</option>
                           <option value="original" className="bg-dark-surface">Original</option>
                         </select>
                       </div>
                     </div>

                     <div>
                       <Label>Judul Lagu</Label>
                       <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Contoh: Harehare Ya" />
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <Label>Durasi (MM:SS)</Label>
                         <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className={inputClass} placeholder="04:20" />
                       </div>
                       <div>
                         <Label>Rilis</Label>
                         <input type="date" value={form.release_date} onChange={e => setForm({...form, release_date: e.target.value})} className={inputClass} />
                       </div>
                     </div>
                     
                     <div className="bg-black/20 p-3 rounded-lg border border-dark-border">
                        <Label className="flex justify-between items-center"><span>Link YouTube</span> <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded font-bold">WAJIB</span></Label>
                        <div className="flex gap-2 w-full">
                           <div className="relative flex-1 min-w-0">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"><LinkIcon size={14}/></div>
                              <input required value={form.youtube_url} onChange={handleUrlChange} className={`${inputClass} pl-9`} placeholder="https://..." />
                           </div>
                           <button type="button" onClick={handleManualExtract} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 transition-colors flex-shrink-0" title="Auto Extract Thumbnail"><Upload size={18} /></button>
                        </div>
                     </div>
                     
                     {/* Thumbnail Preview */}
                     <div>
                        <Label>Thumbnail (Auto Extract)</Label>
                        <div className="flex gap-1 mb-2">
                           <ModeBtn active={uploadMode === 'auto'} onClick={()=>setUploadMode('auto')}>Auto</ModeBtn>
                           <ModeBtn active={uploadMode === 'url'} onClick={()=>setUploadMode('url')}>Manual URL</ModeBtn>
                        </div>
                        
                        <div className="space-y-2">
                           {uploadMode === 'url' && (
                              <input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} className={inputClass} placeholder="URL Gambar..." />
                           )}
                           <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center group">
                              {form.thumbnail_url ? (
                                <img src={form.thumbnail_url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-white/20 text-xs flex flex-col items-center gap-1"><PlayCircle size={24} /> <span className="text-[10px]">No Preview</span></div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-2 mt-4">
                        {editingId && <button type="button" onClick={cancelEdit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-sm transition-colors">Batal</button>}
                        <button type="submit" disabled={isSubmitting} className={`flex-1 py-3 font-bold rounded-lg text-sm shadow-lg text-white flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-primary hover:bg-primary-dark'}`}>
                           {isSubmitting ? <RefreshCw className="animate-spin" size={16}/> : (editingId ? <Pencil size={16}/> : <Upload size={16}/>)}
                           {isSubmitting ? 'Menyimpan...' : (editingId ? 'Update Lagu' : 'Simpan Lagu')}
                        </button>
                     </div>
                  </form>
                </div>
            </div>
         </div>

         {/* === LIST SECTION (Kanan Desktop / Tab List Mobile) === */}
         <div className={`lg:col-span-8 bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full overflow-hidden shadow-xl ${activeMobileTab === 'list' ? 'block' : 'hidden lg:flex'}`}>
            <div className="p-4 border-b border-dark-border bg-black/10 flex justify-between items-center shrink-0">
               <span className="text-white/70 text-sm font-bold flex items-center gap-2"><List size={16}/> Daftar Lagu</span>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Showing: {form.talent}</span>
                  <div className="text-white/40 text-[10px] font-bold uppercase bg-white/5 px-2 py-1 rounded">Total: {total}</div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20 md:pb-4">
              {loading ? (
                 <CoolLoader text="Memuat Lagu..." />
              ) : items.length === 0 ? (
                 <div className="text-center text-white/30 py-20 italic">Belum ada lagu untuk {form.talent}.</div>
              ) : (
                 // WRAPPER TABEL SCROLLABLE
                 <div className="overflow-x-auto w-full pb-2">
                    <table className="w-full text-left text-sm min-w-[600px]">
                       <thead className="bg-black/20 text-white/50 uppercase text-[10px] font-bold sticky top-0 backdrop-blur-sm z-10">
                         <tr>
                           <th className="p-4 w-16">Cover</th>
                           <th className="p-4">Info Lagu</th>
                           <th className="p-4 w-24">Type</th>
                           <th className="p-4 w-24 text-right">Aksi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-white">
                         {items.map(item => (
                           <tr key={item.id} className={`hover:bg-white/5 transition-colors ${editingId === item.id ? 'bg-white/5 border-l-2 border-primary' : ''}`}>
                             <td className="p-3 align-middle">
                                <img src={item.thumbnail_url} className="w-10 h-10 object-cover rounded bg-black border border-white/10" />
                             </td>
                             <td className="p-3 align-middle">
                                <div className="font-bold text-white line-clamp-1">{item.title}</div>
                                <div className="text-[10px] text-white/50 uppercase">{item.talent} • {item.duration}</div>
                             </td>
                             <td className="p-3 align-middle">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'original' ? 'bg-primary/20 text-primary' : 'bg-purple-500/20 text-purple-400'}`}>
                                  {item.type}
                                </span>
                             </td>
                             <td className="p-3 text-right align-middle">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEdit(item)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition-colors"><Pencil size={14}/></button>
                                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={14}/></button>
                                </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              )}
            </div>
            
            <div className="p-3 border-t border-dark-border bg-black/20 flex justify-between items-center shrink-0">
               <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="p-1.5 rounded hover:bg-white/10 text-white disabled:opacity-30"><ChevronLeft size={16}/></button>
               <span className="text-white/40 text-xs">Page {page} of {totalPages || 1}</span>
               <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded hover:bg-white/10 text-white disabled:opacity-30"><ChevronRight size={16}/></button>
            </div>
         </div>
      </div>
    </div>
  );
}

// Helper Components
function Label({ children }: any) {
  return <label className="text-[10px] font-bold text-white/40 uppercase mb-1.5 block tracking-wider">{children}</label>;
}

function ModeBtn({ active, onClick, children }: any) {
  return (
    <button type="button" onClick={onClick} className={`px-3 py-1 rounded text-[10px] font-bold transition-all border border-transparent ${active ? 'bg-primary text-white shadow-sm' : 'bg-black/30 text-white/40 hover:text-white border-white/5'}`}>
      {children}
    </button>
  );
}