import { useState, useEffect } from 'react';
import { X, AlertTriangle, Upload, Send, Palette } from 'lucide-react'; // Ganti Globe jadi Palette
import { useSettingsStore } from '../../../store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ThemeSwitcher from './ThemeSwitcher';
import { reportsService } from '../../../services/reportsService';
import { toast } from 'sonner';

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useSettingsStore();
  // Default tab langsung ke 'theme' (pengaturan tampilan)
  const [activeTab, setActiveTab] = useState<'theme' | 'report'>('theme');
  const { t } = useTranslation();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
    };
    if (isSettingsOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border bg-black/20">
            <h2 className="text-xl font-bold text-white">{t('settings.title')}</h2>
            <button onClick={closeSettings} className="text-white/50 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* TABS - Hapus Tab Bahasa, Ganti jadi Tampilan */}
          <div className="flex border-b border-dark-border">
            <button 
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'theme' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Palette size={16} /> Tampilan
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'report' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <AlertTriangle size={16} /> {t('settings.tab_report')}
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {activeTab === 'theme' ? (
              <div className="space-y-4">
                 {/* Langsung Tampilkan Theme Switcher Saja */}
                 <p className="text-white/50 text-xs font-bold uppercase mb-2">Tema Aplikasi</p>
                 <ThemeSwitcher />
              </div>
            ) : (
              <ReportForm onClose={closeSettings} />
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ... (Biarkan function ReportForm di bawahnya tetap sama seperti sebelumnya, tidak perlu diubah) ...
// Cuma pastikan function ReportForm masih ada di file ini ya!
function ReportForm({ onClose }: { onClose: () => void }) {
  // ... Paste isi function ReportForm yang lama di sini ...
  // (Karena kepanjangan, copy saja bagian ReportForm dari file aslimu yang lama)
  const { t } = useTranslation();
  const [category, setCategory] = useState('home');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const toastId = toast.loading("Mengirim laporan...");
    
    try {
      await reportsService.sendReport({
        category: category === 'other' ? customCategory : category,
        description,
        file: file || undefined
      });
      
      toast.success(t('settings.report.success'), { id: toastId });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim laporan. Coba lagi.", { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase mb-3">{t('settings.report.category_label')}</label>
        <div className="space-y-2">
          {['home', 'profile', 'timeline', 'memories', 'songs'].map((item) => (
            <label key={item} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${category === item ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
              <input type="radio" name="category" value={item} checked={category === item} onChange={(e) => setCategory(e.target.value)} className="accent-primary w-4 h-4"/>
              <span className="text-white capitalize">{t(`settings.report.cat_${item}`)}</span>
            </label>
          ))}
          <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${category === 'other' ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
            <input type="radio" name="category" value="other" checked={category === 'other'} onChange={(e) => setCategory(e.target.value)} className="accent-primary w-4 h-4"/>
            <span className="text-white">{t('settings.report.cat_other')}</span>
          </label>
          {category === 'other' && (
            <input type="text" required value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder={t('settings.report.other_placeholder')} className="w-full mt-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none animate-in fade-in slide-in-from-top-2" />
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase mb-2">{t('settings.report.desc_label')}</label>
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none resize-none" placeholder={t('settings.report.desc_placeholder')} />
      </div>
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase mb-2">{t('settings.report.upload_label')}</label>
        <div className="relative">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="report-file" accept="image/*" />
          <label htmlFor="report-file" className="flex items-center justify-center gap-2 w-full p-4 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
            <Upload size={18} className="text-white/50" />
            <span className="text-sm text-white/70">{file ? file.name : t('settings.report.upload_btn')}</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button type="button" onClick={onClose} disabled={sending} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors">{t('settings.report.cancel')}</button>
        <button type="submit" disabled={sending} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">{sending ? 'Mengirim...' : <><Send size={18} /> {t('settings.report.submit')}</>}</button>
      </div>
    </form>
  );
}