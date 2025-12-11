import { useState, useEffect } from 'react';
import { dataService } from '../../../services/dataService';
import { contentService } from '../../../services/contentService';
import type { TalentProfile, MultilingualText, Hashtag } from '../../../types';
import { UserCog, Save, Image as ImageIcon, Link as LinkIcon, Info, Globe, Plus, Minus, Trash2, Hash, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import CoolLoader from '../../shared/CoolLoader';

// Default value untuk multilingual kosong
const defaultMulti = { id: '', en: '', jp: '', kr: '', ru: '' };

export default function EditProfile() {
  const [selectedTalent, setSelectedTalent] = useState<'aya' | 'arjuna'>('aya');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State Hashtag Dinamis
  const [hashtags, setHashtags] = useState<Hashtag[]>([
    { label: 'General', value: '' },
    { label: 'Art', value: '' }
  ]);

  // State Sprite Dinamis (Array of URLs)
  const [sprites, setSprites] = useState<string[]>(['']); 

  // Initial State Form
  const [form, setForm] = useState<TalentProfile>({
    id: 'aya',
    name: defaultMulti,
    description: defaultMulti,
    sub_count: 0,
    languages: [],
    debut_date: '',
    birthday: '',
    fan_name: defaultMulti,
    hashtags: [], 
    likes: [],
    dislikes: [],
    family: defaultMulti,
    sprites: [], // Field Baru
    social_links: {
      youtube: '', twitter: '', instagram: '', tiktok: '', 
      saweria: '', whatsapp: '', discord: ''
    },
    contact_email: ''
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await dataService.getProfile(selectedTalent);
        if (data) {
          const ensureMulti = (val: any) => (typeof val === 'string' ? { id: val, en: val, jp: val, kr: val, ru: val } : val || defaultMulti);

          setForm({
            ...data,
            name: ensureMulti(data.name),
            description: ensureMulti(data.description),
            fan_name: ensureMulti(data.fan_name),
            family: ensureMulti(data.family),
            social_links: data.social_links || {}
          });

          // Load Hashtags
          if (data.hashtags && Array.isArray(data.hashtags) && data.hashtags.length > 0) {
             setHashtags(data.hashtags);
          } else {
             setHashtags([{ label: 'General', value: '' }, { label: 'Art', value: '' }]);
          }

          // Load Sprites (Dinamis)
          if (data.sprites && Array.isArray(data.sprites) && data.sprites.length > 0) {
             setSprites(data.sprites);
          } else {
             // Fallback cek field lama jika migrasi belum sempurna
             const legacySprites = [];
             if ((data as any).sprite_url) legacySprites.push((data as any).sprite_url);
             if ((data as any).sprite_url_2) legacySprites.push((data as any).sprite_url_2);
             if ((data as any).sprite_url_3) legacySprites.push((data as any).sprite_url_3);
             
             setSprites(legacySprites.length > 0 ? legacySprites : ['']); // Minimal 1 slot kosong
          }
        }
      } catch (e) {
        toast.error("Gagal memuat profil.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedTalent]);

  // --- HANDLERS UMUM ---
  const handleChange = (field: keyof TalentProfile, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiChange = (field: keyof TalentProfile, lang: keyof MultilingualText, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as MultilingualText),
        [lang]: value
      }
    }));
  };

  const handleArrayChange = (field: keyof TalentProfile, value: string) => {
    const arrayVal = value.split(',').map(s => s.trim());
    setForm(prev => ({ ...prev, [field]: arrayVal }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setForm(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  // --- SPRITE HANDLERS (DINAMIS) ---
  const handleFileUpload = async (index: number, file: File) => {
    const toastId = toast.loading("Mengunggah Sprite...");
    try {
      const url = await contentService.uploadFile(file, 'sprites');
      const newSprites = [...sprites];
      newSprites[index] = url;
      setSprites(newSprites);
      toast.success("Upload berhasil!", { id: toastId, icon: <CheckCircle className="text-green-500"/> });
    } catch (err) {
      toast.error("Gagal upload file.", { id: toastId });
    }
  };

  const addSpriteRow = () => {
    setSprites([...sprites, '']); // Tambah slot kosong
  };

  const removeSpriteRow = (index: number) => {
    const newSprites = sprites.filter((_, i) => i !== index);
    setSprites(newSprites.length ? newSprites : ['']); // Sisakan 1 jika habis
  };

  // --- HASHTAG HANDLERS ---
  const updateHashtag = (index: number, field: 'label' | 'value', text: string) => {
    const newTags = [...hashtags];
    newTags[index] = { ...newTags[index], [field]: text };
    setHashtags(newTags);
  };

  const addHashtagRow = () => {
    setHashtags([...hashtags, { label: '', value: '' }]);
  };

  const removeHashtagRow = (index: number) => {
    const newTags = hashtags.filter((_, i) => i !== index);
    setHashtags(newTags.length ? newTags : [{ label: '', value: '' }]);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Menyimpan perubahan...");
    
    try {
      const payload = {
        ...form,
        hashtags: hashtags,
        sprites: sprites.filter(s => s.trim() !== '') // Hapus slot kosong sebelum simpan
      };
      
      // Bersihkan properti lama (legacy cleanup)
      delete (payload as any).hashtag_general;
      delete (payload as any).hashtag_art;
      delete (payload as any).sprite_url;
      delete (payload as any).sprite_url_2;
      delete (payload as any).sprite_url_3;

      await contentService.updateProfile(selectedTalent, payload);
      
      toast.success(`Profil ${selectedTalent === 'aya' ? 'Aya' : 'Arjuna'} berhasil diperbarui!`, { 
        id: toastId,
        icon: <CheckCircle className="text-green-500"/>
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CoolLoader text="Memuat Profil..." />;

  return (
    <div className="max-w-5xl pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserCog className="text-primary" size={32} /> Edit Profil Talent
          </h2>
          <p className="text-white/50 mt-1">Ubah biodata, sprite, dan link resmi.</p>
        </div>
        
        <div className="bg-dark-surface p-1.5 rounded-xl border border-dark-border flex shadow-lg w-full md:w-auto">
          <button onClick={() => setSelectedTalent('aya')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold transition-all ${selectedTalent === 'aya' ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Aya Aulya</button>
          <button onClick={() => setSelectedTalent('arjuna')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold transition-all ${selectedTalent === 'arjuna' ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Arjuna Arkana</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. INFORMASI DASAR */}
        <SectionCard title="Informasi Dasar (Multi-bahasa)" icon={<Globe size={20}/>}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
               <MultilingualInput label="Nama Lengkap" value={form.name} onChange={(l, v) => handleMultiChange('name', l, v)} />
               <MultilingualInput label="Deskripsi" value={form.description} onChange={(l, v) => handleMultiChange('description', l, v)} isTextArea />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <MultilingualInput label="Fan Name" value={form.fan_name} onChange={(l, v) => handleMultiChange('fan_name', l, v)} />
               <MultilingualInput label="Keluarga" value={form.family} onChange={(l, v) => handleMultiChange('family', l, v)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
               <InputGroup label="Subscriber Count" type="number" value={form.sub_count} onChange={(v: any) => handleChange('sub_count', parseInt(v))} />
               <InputGroup label="Tanggal Debut" type="date" value={form.debut_date} onChange={(v: any) => handleChange('debut_date', v)} />
               <InputGroup label="Ulang Tahun (Contoh: 15 Maret)" value={form.birthday} onChange={(v: any) => handleChange('birthday', v)} />
            </div>
          </div>
        </SectionCard>

        {/* 2. DETAIL & HASHTAG */}
        <SectionCard title="Detail & Hashtag" icon={<Info size={20}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* --- HASHTAG DINAMIS --- */}
             <div className="md:col-span-2 bg-black/20 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold text-red-400 uppercase mb-4 block tracking-wider flex items-center gap-2">
                   <Hash size={14}/> Daftar Hashtag (Label + Tag)
                </label>
                
                <div className="space-y-3">
                  {hashtags.map((tag, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-black/30 p-2 rounded-xl border border-white/5">
                      <div className="w-full md:w-1/3">
                        <input 
                          value={tag.label} 
                          onChange={(e) => updateHashtag(index, 'label', e.target.value)}
                          placeholder="Label"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none"
                        />
                      </div>
                      <div className="w-full md:flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-bold">#</span>
                        <input 
                          value={tag.value} 
                          onChange={(e) => updateHashtag(index, 'value', e.target.value)}
                          placeholder="Tag (Tanpa #)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:border-red-500 outline-none" 
                        />
                      </div>
                      <div className="flex gap-1 w-full md:w-auto justify-end">
                        {index === hashtags.length - 1 && (
                          <button type="button" onClick={addHashtagRow} className="p-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition-colors">
                            <Plus size={18} />
                          </button>
                        )}
                        <button type="button" onClick={() => removeHashtagRow(index)} className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Minus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="md:col-span-2"><InputGroup label="Bahasa (Pisahkan koma)" value={form.languages?.join(', ')} onChange={(v:any) => handleArrayChange('languages', v)} /></div>
             
             <div>
               <label className="text-xs font-bold text-green-400 uppercase mb-2 block tracking-wider">Likes</label>
               <textarea value={form.likes?.join(', ')} onChange={e => handleArrayChange('likes', e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary h-24 resize-none" placeholder="Pisahkan dengan koma..." />
             </div>
             <div>
               <label className="text-xs font-bold text-red-400 uppercase mb-2 block tracking-wider">Dislikes</label>
               <textarea value={form.dislikes?.join(', ')} onChange={e => handleArrayChange('dislikes', e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary h-24 resize-none" placeholder="Pisahkan dengan koma..." />
             </div>
          </div>
        </SectionCard>

        {/* 3. SOCIAL LINKS */}
        <SectionCard title="Kontak & Social Media" icon={<LinkIcon size={20}/>}>
           <div className="mb-6"><InputGroup label="Contact Email" value={form.contact_email} onChange={(v: any) => handleChange('contact_email', v)} /></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="YouTube URL" value={form.social_links?.youtube} onChange={(v: any) => handleSocialChange('youtube', v)} />
              <InputGroup label="Twitter/X URL" value={form.social_links?.twitter} onChange={(v: any) => handleSocialChange('twitter', v)} />
              <InputGroup label="Instagram URL" value={form.social_links?.instagram} onChange={(v: any) => handleSocialChange('instagram', v)} />
              <InputGroup label="TikTok URL" value={form.social_links?.tiktok} onChange={(v: any) => handleSocialChange('tiktok', v)} />
              <InputGroup label="Saweria URL" value={form.social_links?.saweria} onChange={(v: any) => handleSocialChange('saweria', v)} />
              <InputGroup label="WhatsApp Channel" value={form.social_links?.whatsapp} onChange={(v: any) => handleSocialChange('whatsapp', v)} />
              <InputGroup label="Discord Invite" value={form.social_links?.discord} onChange={(v: any) => handleSocialChange('discord', v)} />
           </div>
        </SectionCard>

        {/* 4. SPRITE DINAMIS (UNLIMITED + TOMBOL PLUS/MINUS) */}
        <SectionCard title="Sprite Karakter" icon={<ImageIcon size={20}/>}>
           {/* Gunakan Flex/Grid yang responsif */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sprites.map((url, index) => (
                <div key={index} className="relative group">
                   <SpriteUploader 
                      label={`Sprite ${index + 1}`}
                      url={url}
                      onChange={(f: File) => handleFileUpload(index, f)}
                      // Di sini kita tidak pakai tombol hapus di dalam component, tapi tombol minus di luar
                      onRemove={() => {}} // Opsional jika mau clear gambar saja
                   />
                   
                   {/* Tombol Kontrol (+/-) di Pojok Kanan Atas Kartu */}
                   <div className="absolute top-2 right-2 flex gap-1 z-10">
                      {index === sprites.length - 1 && (
                        <button 
                          type="button" 
                          onClick={addSpriteRow} 
                          className="p-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
                          title="Tambah Slot Sprite"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => removeSpriteRow(index)} 
                        className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                        title="Hapus Slot Sprite"
                      >
                        <Minus size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
           <p className="text-center text-white/30 text-xs mt-6 italic">*Gunakan tombol (+) untuk menambah variasi kostum, dan (-) untuk menghapus slot.</p>
        </SectionCard>

        {/* SUBMIT BUTTON - DILETAKKAN STATIC DI BAWAH */}
        <div className="pt-6 border-t border-white/10 mt-8">
           <button 
             type="submit" 
             disabled={saving} 
             className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
           >
             {saving ? <span className="animate-spin">⏳</span> : <Save size={24} />}
             {saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Perubahan'}
           </button>
        </div>

      </form>
    </div>
  );
}

// === COMPONENTS (Sama seperti sebelumnya) ===

function MultilingualInput({ label, value, onChange, isTextArea }: { label: string, value: MultilingualText, onChange: (l: keyof MultilingualText, v: string) => void, isTextArea?: boolean }) {
  const [activeLang, setActiveLang] = useState<keyof MultilingualText>('id');
  const langs: { code: keyof MultilingualText, label: string }[] = [
    { code: 'id', label: '🇮🇩 ID' },
    { code: 'en', label: '🇺🇸 EN' },
    { code: 'jp', label: '🇯🇵 JP' },
    { code: 'kr', label: '🇰🇷 KR' },
    { code: 'ru', label: '🇷🇺 RU' },
  ];

  return (
    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">{label}</label>
        <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-lg w-full sm:w-auto">
          {langs.map(l => (
            <button key={l.code} type="button" onClick={() => setActiveLang(l.code)} className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[10px] font-bold transition-colors whitespace-nowrap ${activeLang === l.code ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>{l.label}</button>
          ))}
        </div>
      </div>
      {isTextArea ? (
        <textarea value={value[activeLang]} onChange={(e) => onChange(activeLang, e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors h-24 resize-none" placeholder={`Masukkan ${label} (${activeLang.toUpperCase()})...`} />
      ) : (
        <input value={value[activeLang]} onChange={(e) => onChange(activeLang, e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder={`Masukkan ${label} (${activeLang.toUpperCase()})...`} />
      )}
    </div>
  );
}

function SectionCard({ title, icon, children }: any) {
  return (
    <div className="bg-dark-surface p-6 md:p-8 rounded-2xl border border-dark-border shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 pb-4 border-b border-white/5"><span className="p-2 bg-white/5 rounded-lg text-primary">{icon}</span> {title}</h3>
      {children}
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <label className="text-xs font-bold text-white/50 uppercase mb-2 block tracking-wider">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black/30 border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20" placeholder={placeholder || ""} />
    </div>
  );
}

function SpriteUploader({ label, url, onChange }: any) {
  return (
    <div className="bg-black/20 p-4 md:p-6 rounded-xl border border-dark-border text-center hover:border-primary/30 transition-colors group relative h-full flex flex-col justify-between">
       <div>
         <label className="text-xs font-bold text-white/50 uppercase block mb-4 tracking-wider">{label}</label>
         <div className="relative h-48 md:h-64 mb-4 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-primary/20 transition-colors">
           {url ? <img src={url} alt="Sprite" className="h-full w-full object-contain animate-in zoom-in duration-300" /> : <div className="text-white/20 flex flex-col items-center gap-2"><ImageIcon size={32} /><span className="text-sm">No Image</span></div>}
         </div>
       </div>
       <label className="cursor-pointer block mt-auto">
          <span className="w-full py-2 px-4 bg-white/10 hover:bg-primary text-white rounded-lg text-sm font-bold transition-colors inline-block shadow-md">{url ? 'Ganti File' : 'Pilih File'}</span>
          <input type="file" onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} className="hidden" accept="image/png, image/jpeg, image/webp" />
       </label>
    </div>
  );
}