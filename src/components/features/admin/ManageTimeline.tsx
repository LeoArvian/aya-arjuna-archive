import { useState, useEffect } from 'react';
import { timelineService } from '../../../services/timelineService';
import { contentService } from '../../../services/contentService';
import type { TimelineItem } from '../../../types';
import { Trash2, Calendar, Search, ChevronLeft, ChevronRight, Upload, Link as LinkIcon, Youtube, X as XIcon, Pencil, RefreshCw, PlayCircle, FileText, Video, List, PlusSquare, Music, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import CoolLoader from '../../shared/CoolLoader';

// === MAIN COMPONENT ===
export default function ManageTimeline() {
  // STATE DATA
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // STATE FILTER
  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  
  // STATE UI MOBILE (TAB)
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'list'>('list');

  // STATE FORM
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [form, setForm] = useState({
    talent: 'aya',
    title: '',
    description: '',
    type: 'stream',
    badge: 'none',
    date: new Date().toISOString().split('T')[0],
    time: '19:00', 
    url: '',
    thumbnail_url: ''
  });
  const [uploadMode, setUploadMode] = useState<'auto' | 'url' | 'file'>('auto');
  const [file, setFile] = useState<File | null>(null);

  // FETCH DATA
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await timelineService.getTimeline({ 
        page, 
        limit: 10, 
        year: yearFilter, 
        month: monthFilter,
        talent: form.talent 
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (e) {
      toast.error("Gagal memuat data timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page, yearFilter, monthFilter, form.talent]);

  // HANDLERS
  const extractYoutubeThumb = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` : null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    const extractedThumb = extractYoutubeThumb(newUrl);
    setForm(prev => ({ ...prev, url: newUrl, thumbnail_url: extractedThumb || (newUrl === '' ? '' : prev.thumbnail_url) }));
    if (extractedThumb) setUploadMode('auto');
  };

  const handleManualExtract = () => {
    const thumb = extractYoutubeThumb(form.url);
    if (thumb) {
        setForm(prev => ({ ...prev, thumbnail_url: thumb }));
        setUploadMode('auto');
        toast.success("Thumbnail berhasil diekstrak!");
    } else {
        toast.error("Gagal ekstrak. Cek link YouTube.");
    }
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    const dateObj = new Date(item.date);
    setForm({
      talent: item.talent,
      title: item.title,
      description: item.description || '',
      type: item.type,
      badge: item.badge,
      date: dateObj.toISOString().split('T')[0],
      time: dateObj.toTimeString().split(' ')[0].slice(0, 5),
      url: item.url,
      thumbnail_url: item.thumbnail_url
    });
    setUploadMode('url'); 
    setFile(null);
    
    setActiveMobileTab('form');
    toast.info("Mengedit data...");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      talent: 'aya',
      title: '',
      description: '',
      type: 'stream',
      badge: 'none',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      url: '',
      thumbnail_url: ''
    });
    setUploadMode('auto');
    setFile(null);
    setActiveMobileTab('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan aktivitas...");

    try {
      let finalThumb = form.thumbnail_url;
      if (uploadMode === 'file' && file) {
        finalThumb = await contentService.uploadFile(file, 'timeline_thumbs');
      }
      const timeToUse = (form.badge === 'upcoming' || form.badge === 'ongoing') ? form.time : '12:00';
      const fullDate = new Date(`${form.date}T${timeToUse}:00`).toISOString();
      const timelineData = {
        talent: form.talent as 'aya' | 'arjuna',
        title: form.title,
        description: form.description,
        type: form.type as any,
        badge: form.badge as any,
        date: fullDate,
        url: form.url,
        thumbnail_url: finalThumb
      };

      if (editingId) {
        await contentService.updateTimeline(editingId, timelineData);
        toast.success("Diperbarui!", { id: toastId });
      } else {
        await contentService.createTimeline(timelineData);
        toast.success("Ditambahkan!", { id: toastId });
      }
      
      setEditingId(null);
      setForm({ ...form, title: '', description: '', url: '', thumbnail_url: '' }); 
      setFile(null);
      fetchItems();
      setActiveMobileTab('list');

    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    toast("Hapus aktivitas?", {
      action: {
        label: "Hapus",
        onClick: async () => {
           const t = toast.loading("Menghapus...");
           try {
              await contentService.deleteTimeline(id);
              toast.success("Terhapus!", { id: t });
              fetchItems();
           } catch(e) { toast.error("Gagal.", { id: t }); }
        }
      }
    });
  };

  const totalPages = Math.ceil(total / 10);
  const inputClass = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-white/20";
  const showTimeInput = form.badge === 'upcoming' || form.badge === 'ongoing';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      
      {/* === HEADER & TABS (MOBILE ONLY) === */}
      <div className="md:hidden flex flex-col gap-4 mb-4 shrink-0">
         <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="text-primary" size={20} /> Timeline</h2>
            <button onClick={fetchItems} className="p-2 bg-white/10 rounded-lg text-white"><RefreshCw size={18}/></button>
         </div>
         
         {/* TAB CONTROL */}
         <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveMobileTab('list')} 
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'list' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
               <List size={14} /> Daftar (Tabel)
            </button>
            <button 
              onClick={() => setActiveMobileTab('form')} 
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeMobileTab === 'form' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
               {editingId ? <Pencil size={14}/> : <PlusSquare size={14}/>} {editingId ? 'Edit Data' : 'Upload Baru'}
            </button>
         </div>
      </div>

      {/* === CONTAINER UTAMA === */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-6">
         
         {/* === FORM SECTION === */}
         <div className={`md:col-span-4 flex flex-col h-full overflow-hidden ${activeMobileTab === 'form' ? 'block' : 'hidden md:flex'}`}>
            <div className="bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full shadow-xl overflow-hidden">
                <div className="p-4 border-b border-dark-border bg-black/20 flex justify-between items-center shrink-0">
                   <h2 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                     {editingId ? <><Pencil size={16} className="text-yellow-400"/> Edit Mode</> : <><Upload size={16} className="text-primary"/> Upload Baru</>}
                   </h2>
                   {editingId && (
                     <button onClick={cancelEdit} className="text-white/50 hover:text-white bg-white/5 p-1.5 rounded-lg transition-colors" title="Batal Edit"><XIcon size={16} /></button>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-4 pb-20 md:pb-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Talent</Label><select value={form.talent} onChange={e => setForm({...form, talent: e.target.value})} className={inputClass}><option value="aya" className="bg-dark-surface">Aya</option><option value="arjuna" className="bg-dark-surface">Arjuna</option></select></div>
                      <div><Label>Tipe</Label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputClass}><option value="stream" className="bg-dark-surface">Stream</option><option value="video" className="bg-dark-surface">Video</option><option value="post" className="bg-dark-surface">Post</option></select></div>
                    </div>
                    <div><Label>Judul</Label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Judul..." /></div>
                    <div><Label>Status</Label><select value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} className={inputClass}><option value="none" className="bg-dark-surface">None</option><option value="upcoming" className="bg-dark-surface">Upcoming</option><option value="ongoing" className="bg-dark-surface">Ongoing (Live)</option><option value="membership" className="bg-dark-surface">Membership</option></select></div>
                    <div className={`grid ${showTimeInput ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      <div><Label>Tanggal</Label><input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inputClass} /></div>
                      {showTimeInput && <div className="animate-in fade-in slide-in-from-left-2"><Label>Jam (WIB)</Label><input type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} className={inputClass} /></div>}
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-dark-border"><Label className="flex justify-between"><span>Link URL</span><span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded">WAJIB</span></Label><div className="flex gap-2 w-full"><div className="relative flex-1 min-w-0"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"><LinkIcon size={14} /></div><input required value={form.url} onChange={handleUrlChange} className={`${inputClass} pl-9`} placeholder="https://..." /></div><button type="button" onClick={handleManualExtract} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg border border-white/10 flex-shrink-0"><Youtube size={18} /></button></div></div>
                    <div><Label>Thumbnail</Label><div className="flex gap-1 mb-2"><ModeBtn active={uploadMode === 'auto'} onClick={() => setUploadMode('auto')}>Auto</ModeBtn><ModeBtn active={uploadMode === 'url'} onClick={() => setUploadMode('url')}>Link</ModeBtn><ModeBtn active={uploadMode === 'file'} onClick={() => setUploadMode('file')}>File</ModeBtn></div><div className="space-y-2">{uploadMode === 'url' && <input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} placeholder="URL..." className={inputClass} />}{uploadMode === 'file' && <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-xs text-white w-full bg-black/40 p-1 rounded-lg border border-white/10" />}<div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">{(form.thumbnail_url || file) ? (<img src={file ? URL.createObjectURL(file) : form.thumbnail_url} className="w-full h-full object-cover" />) : (<div className="text-white/20 text-xs flex flex-col items-center gap-1"><Upload size={16} /> <span className="text-[10px]">Preview</span></div>)}</div></div></div>
                    <div className="pt-2"><button type="submit" disabled={isSubmitting} className={`w-full py-3 font-bold rounded-lg transition-all disabled:opacity-50 text-sm shadow-lg flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary-dark'} text-white`}>{isSubmitting ? <RefreshCw className="animate-spin" size={18}/> : (editingId ? <Pencil size={18}/> : <Upload size={18}/>)}{isSubmitting ? 'Menyimpan...' : (editingId ? 'Update Data' : 'Simpan Timeline')}</button></div>
                  </form>
                </div>
            </div>
         </div>

         {/* === LIST SECTION (TABEL SCROLLABLE) === */}
         <div className={`md:col-span-8 flex flex-col h-full overflow-hidden ${activeMobileTab === 'list' ? 'block' : 'hidden md:flex'}`}>
            <div className="bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full shadow-xl overflow-hidden">
                
                {/* Filter Bar */}
                <div className="p-4 border-b border-dark-border flex flex-wrap gap-3 items-center bg-black/10 shrink-0">
                   <div className="relative flex-1 min-w-[140px]">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                     <input placeholder="Cari judul..." className="bg-black/30 text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 text-sm w-full focus:outline-none focus:border-primary" />
                   </div>
                   <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 text-sm outline-none cursor-pointer">
                      <option value="" className="bg-dark-surface">Tahun</option>
                      <option value="2025" className="bg-dark-surface">2025</option>
                      <option value="2026" className="bg-dark-surface">2026</option>
                   </select>
                   <div className="ml-auto hidden md:block text-white/40 text-[10px] font-bold uppercase bg-white/5 px-2 py-1 rounded">Total: {total}</div>
                </div>

                {/* Content Table (Scrollable di Mobile) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20 md:pb-4">
                   {loading ? (
                     <CoolLoader text="Memuat Data..." />
                   ) : items.length === 0 ? (
                     <div className="text-center text-white/30 py-20 italic">Belum ada data timeline untuk {form.talent}.</div>
                   ) : (
                     // WRAPPER AGAR BISA SCROLL HORIZONTAL DI HP
                     <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full text-left text-sm min-w-[600px]">
                          <thead className="bg-black/20 text-white/50 uppercase text-[10px] font-bold">
                            <tr><th className="p-3">Thumb</th><th className="p-3">Konten</th><th className="p-3">Status</th><th className="p-3 text-right">Aksi</th></tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-white">
                            {items.map(item => {
                              const isSong = item.badge === 'original' || item.badge === 'cover';
                              return (
                                <tr key={item.id} className={`hover:bg-white/5 transition-colors ${editingId === item.id ? 'bg-white/5 border-l-2 border-primary' : ''}`}>
                                  <td className="p-3"><img src={item.thumbnail_url} className="w-16 aspect-video object-cover rounded bg-black border border-white/10"/></td>
                                  <td className="p-3">
                                    <div className="font-bold line-clamp-1">{item.title}</div>
                                    <div className="text-[10px] text-white/50 uppercase">{item.talent} • {new Date(item.date).toLocaleDateString()}</div>
                                  </td>
                                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase">{item.badge}</span></td>
                                  <td className="p-3 text-right">
                                    {isSong ? (
                                       <div className="flex justify-end items-center gap-1 text-white/30 text-[10px] italic">
                                          <Music size={12} /> <span>Songs</span>
                                       </div>
                                    ) : (
                                       <div className="flex justify-end gap-2">
                                         <button onClick={() => handleEdit(item)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded"><Pencil size={14}/></button>
                                         <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded"><Trash2 size={14}/></button>
                                       </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                     </div>
                   )}
                </div>

                {/* Pagination */}
                <div className="p-3 border-t border-dark-border bg-black/20 flex justify-between items-center shrink-0">
                   <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="p-2 rounded hover:bg-white/10 text-white disabled:opacity-30"><ChevronLeft size={16}/></button>
                   <span className="text-white/40 text-xs font-bold">Page {page} / {totalPages || 1}</span>
                   <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="p-2 rounded hover:bg-white/10 text-white disabled:opacity-30"><ChevronRight size={16}/></button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// Helper Components
function Label({ children, className }: any) { return <label className={`text-[10px] font-bold text-white/40 uppercase mb-1.5 block tracking-wider ${className}`}>{children}</label>; }
function ModeBtn({ active, onClick, children }: any) { return <button type="button" onClick={onClick} className={`px-3 py-1 rounded text-[10px] font-bold transition-all border border-transparent ${active ? 'bg-primary text-white shadow-sm border-primary/50' : 'bg-black/30 text-white/40 hover:text-white border-white/5'}`}>{children}</button>; }