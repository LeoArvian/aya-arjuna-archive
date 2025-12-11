import { useState, useEffect } from 'react';
import { memoriesService } from '../../../services/memoriesService';
import { contentService } from '../../../services/contentService';
import type { MemoryItem } from '../../../types';
import { Trash2, Image as ImageIcon, Search, ChevronLeft, ChevronRight, Pencil, X as XIcon, Upload, Link as LinkIcon, User, CheckCircle, AlertCircle, Calendar, List, PlusSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CoolLoader from '../../shared/CoolLoader';

export default function ManageMemories() {
  // === STATE DATA ===
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // === STATE FILTER ===
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // === STATE UI MOBILE (TAB SYSTEM) ===
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'list'>('list'); // Default ke List
  
  // === STATE FORM ===
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    talent: 'all',
    title: '',
    description: '',
    author_name: '',
    platform: 'twitter',
    platform_url: '',
    media_url: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [file, setFile] = useState<File | null>(null);

  // === FETCH DATA ===
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await memoriesService.getMemories({ 
        page, 
        limit: 12, 
        search,
        talent: form.talent 
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (e) {
      toast.error("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page, search, form.talent]);

  // === HANDLERS ===
  const handleEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setForm({
      talent: item.talent,
      title: item.title || '',
      description: item.description || '',
      author_name: item.author_name || '',
      platform: item.platform,
      platform_url: item.platform_url || '',
      media_url: item.media_url || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setUploadMode('url');
    setFile(null);
    
    // Pindah ke Tab Form saat edit
    setActiveMobileTab('form');
    toast.info("Mode Edit Aktif", { description: `Mengedit: ${item.title}` });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ 
      talent: 'all', 
      title: '', 
      description: '', 
      author_name: '', 
      platform: 'twitter', 
      platform_url: '', 
      media_url: '',
      date: new Date().toISOString().split('T')[0]
    });
    setFile(null);
    // Kembali ke List jika batal
    setActiveMobileTab('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan data...");

    try {
      let finalMedia = form.media_url;
      if (uploadMode === 'file' && file) {
        finalMedia = await contentService.uploadFile(file, 'memories');
      }
      
      const submitDate = new Date(`${form.date}T12:00:00`).toISOString();

      const data = {
        talent: form.talent as any,
        title: form.title,
        description: form.description,
        author_name: form.author_name,
        platform: form.platform as any,
        platform_url: form.platform_url,
        media_url: finalMedia,
        date: submitDate
      };

      if (editingId) {
        await contentService.updateMemory(editingId, data);
        toast.success("Berhasil Diupdate!", { id: toastId, icon: <CheckCircle className="text-green-500" /> });
      } else {
        await contentService.createMemory(data);
        toast.success("Berhasil Ditambahkan!", { id: toastId, icon: <CheckCircle className="text-green-500" /> });
      }

      cancelEdit();
      fetchItems();
    } catch(err) { 
      console.error(err);
      toast.error("Gagal Menyimpan", { id: toastId, icon: <AlertCircle className="text-red-500" /> });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: string) => {
    toast("Hapus Karya Ini?", {
      description: "Tindakan ini tidak bisa dibatalkan.",
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
           const toastId = toast.loading("Menghapus...");
           try {
             await contentService.deleteMemory(id);
             toast.success("Terhapus!", { id: toastId });
             fetchItems();
           } catch(e) {
             toast.error("Gagal menghapus", { id: toastId });
           }
        }
      },
      cancel: { label: "Batal", onClick: () => {} }
    });
  };

  const totalPages = Math.ceil(total / 12);
  const inputClass = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-white/20";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      
      {/* === HEADER MOBILE & TABS === */}
      <div className="md:hidden flex flex-col gap-4 mb-4 shrink-0">
         <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="text-primary" size={20} /> Karya Fans
            </h2>
            <button onClick={fetchItems} className="p-2 bg-white/10 rounded-lg text-white"><RefreshCw size={18}/></button>
         </div>
         
         {/* TAB CONTROL */}
         <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveMobileTab('list')} 
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'list' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
               <List size={14} /> Daftar Karya
            </button>
            <button 
              onClick={() => setActiveMobileTab('form')} 
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'form' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
               {editingId ? <Pencil size={14}/> : <PlusSquare size={14}/>} {editingId ? 'Edit Karya' : 'Upload Baru'}
            </button>
         </div>
      </div>

      {/* === CONTAINER UTAMA === */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* === FORM SECTION (Kiri Desktop / Tab Form Mobile) === */}
         <div className={`lg:col-span-4 flex flex-col h-full overflow-hidden ${activeMobileTab === 'form' ? 'block' : 'hidden lg:flex'}`}>
            <div className="bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full shadow-xl overflow-hidden">
                <div className="p-4 border-b border-dark-border bg-black/20 flex justify-between items-center shrink-0">
                   <h2 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                     {editingId ? <><Pencil size={16} className="text-yellow-400"/> Edit Mode</> : <><Upload size={16} className="text-primary"/> Upload Karya</>}
                   </h2>
                   {editingId && (
                     <button onClick={cancelEdit} className="text-white/50 hover:text-white bg-white/5 p-1.5 rounded-lg transition-colors" title="Batal"><XIcon size={16}/></button>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-4 pb-20 md:pb-0">
                     <div>
                       <Label>Tanggal Upload</Label>
                       <div className="relative">
                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                         <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={`${inputClass} pl-9`} />
                       </div>
                     </div>
                     <div>
                       <Label>Talent (Kategori)</Label>
                       <select value={form.talent} onChange={e => setForm({...form, talent: e.target.value})} className={inputClass}>
                         <option value="all" className="bg-dark-surface">Semua (Aya & Arjuna)</option>
                         <option value="aya" className="bg-dark-surface">Aya Aulya</option>
                         <option value="arjuna" className="bg-dark-surface">Arjuna Arkana</option>
                       </select>
                     </div>
                     <div><Label>Judul Karya</Label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Judul..." /></div>
                     <div><Label>Deskripsi</Label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`${inputClass} h-20 resize-none`} placeholder="Deskripsi..." /></div>
                     <div className="grid grid-cols-2 gap-3">
                        <div><Label>Creator</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} /><input required value={form.author_name} onChange={e => setForm({...form, author_name: e.target.value})} className={`${inputClass} pl-9`} placeholder="@user" /></div></div>
                        <div><Label>Platform</Label><select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className={inputClass}><option value="twitter" className="bg-dark-surface">X / Twitter</option><option value="youtube" className="bg-dark-surface">YouTube</option><option value="instagram" className="bg-dark-surface">Instagram</option><option value="game_download" className="bg-dark-surface">Game (DL)</option><option value="game_web" className="bg-dark-surface">Game (Web)</option><option value="other" className="bg-dark-surface">Lainnya</option></select></div>
                     </div>
                     <div><Label>Link Sumber</Label><input required value={form.platform_url} onChange={e => setForm({...form, platform_url: e.target.value})} className={inputClass} placeholder="https://..." /></div>
                     <div><Label>Media (Cover)</Label><div className="flex gap-1 mb-2"><ModeBtn active={uploadMode === 'url'} onClick={() => setUploadMode('url')}>Link</ModeBtn><ModeBtn active={uploadMode === 'file'} onClick={() => setUploadMode('file')}>Upload</ModeBtn></div><div className="space-y-2">{uploadMode === 'url' && <input value={form.media_url} onChange={e => setForm({...form, media_url: e.target.value})} className={inputClass} placeholder="https://..." />}{uploadMode === 'file' && <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-xs text-white bg-black/40 p-1 rounded-lg w-full border border-white/10" />}<div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">{(form.media_url || file) ? (<img src={file ? URL.createObjectURL(file) : form.media_url} className="w-full h-full object-contain" />) : (<div className="text-white/20 text-xs flex flex-col items-center gap-1"><Upload size={16} /> <span className="text-[10px]">Preview</span></div>)}</div></div></div>
                     <div className="flex gap-2 mt-4">
                        {editingId && <button type="button" onClick={cancelEdit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-sm">Batal</button>}
                        <button type="submit" disabled={isSubmitting} className={`flex-1 py-3 font-bold rounded-lg transition-all disabled:opacity-50 text-sm shadow-lg ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary-dark'} text-white`}>{isSubmitting ? 'Memproses...' : (editingId ? 'Update Karya' : 'Simpan Karya')}</button>
                     </div>
                  </form>
                </div>
            </div>
         </div>

         {/* === LIST SECTION (Kanan Desktop / Tab List Mobile) === */}
         <div className={`lg:col-span-8 bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full overflow-hidden ${activeMobileTab === 'list' ? 'block' : 'hidden lg:flex'}`}>
             <div className="p-4 border-b border-dark-border bg-black/10 flex justify-between items-center shrink-0">
                <div className="relative w-full max-w-xs">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                   <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari karya..." className="bg-black/30 text-white pl-9 pr-3 py-1.5 rounded-lg border border-white/10 text-sm w-full focus:outline-none focus:border-primary" />
                </div>
                <div className="ml-auto hidden md:block text-white/40 text-[10px] font-bold uppercase bg-white/5 px-2 py-1 rounded">Total: {total}</div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20 md:pb-4">
                {loading ? <CoolLoader text="Memuat..." /> : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {items.map(item => (
                       <div key={item.id} className={`relative group aspect-square bg-black rounded-xl overflow-hidden border border-white/10 ${editingId === item.id ? 'ring-2 ring-primary' : ''}`}>
                          <img src={item.media_url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                             <span className="text-white text-xs font-bold line-clamp-2 mb-1">{item.title}</span>
                             <span className="text-white/50 text-[10px] mb-3">by {item.author_name}</span>
                             <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"><Pencil size={14}/></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"><Trash2 size={14}/></button>
                             </div>
                          </div>
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white uppercase font-bold">{item.platform.replace('game_', '')}</div>
                       </div>
                     ))}
                  </div>
                )}
                {items.length === 0 && !loading && <div className="text-center py-20 text-white/30 italic text-sm">Belum ada karya.</div>}
             </div>
             
             {/* Pagination */}
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
function Label({ children }: any) { return <label className="text-[10px] font-bold text-white/40 uppercase mb-1.5 block tracking-wider">{children}</label>; }
function ModeBtn({ active, onClick, children }: any) { return <button type="button" onClick={onClick} className={`px-3 py-1 rounded text-[10px] font-bold transition-all border border-transparent ${active ? 'bg-primary text-white shadow-sm' : 'bg-black/30 text-white/40 hover:text-white border-white/5'}`}>{children}</button>; }