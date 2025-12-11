import { useState, useEffect } from 'react';
import { dataService } from '../../../services/dataService';
import { contentService } from '../../../services/contentService';
import { logService } from '../../../services/logService'; 
import { Radio, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveStatusControl() {
  const [talents, setTalents] = useState<{ id: string; name: any; is_live: boolean; live_url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await dataService.getLiveStatus();
    setTalents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean, currentUrl: string) => {
    setUpdating(id);
    try {
      const newStatus = !currentStatus;
      // GANTI KE updateLiveConfig (Lebih aman untuk partial update)
      await contentService.updateLiveConfig(id, { is_live: newStatus });
      
      logService.addLog('UPDATE', 'Live Status', `Mengubah status live ${id} menjadi ${newStatus ? 'ON' : 'OFF'}`);
      toast.success(`Status ${id} diubah: ${newStatus ? 'LIVE 🔴' : 'OFFLINE ⚫'}`);
      
      // Optimistic update biar cepat
      setTalents(prev => prev.map(t => t.id === id ? { ...t, is_live: newStatus } : t));
    } catch (e) {
      console.error(e);
      toast.error("Gagal update status.");
    } finally {
      setUpdating(null);
    }
  };

  const handleUrlUpdate = async (id: string, newUrl: string) => {
    if (!newUrl) return;
    try {
      // GANTI KE updateLiveConfig
      await contentService.updateLiveConfig(id, { live_url: newUrl });
      toast.success("Link stream disimpan.");
      setTalents(prev => prev.map(t => t.id === id ? { ...t, live_url: newUrl } : t));
    } catch (e) {
      toast.error("Gagal simpan link.");
    }
  };

  return (
    <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Radio className="text-red-500" /> Live Stream Control
        </h3>
        <button onClick={fetchStatus} className="text-white/50 hover:text-white"><RefreshCw size={16}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {talents.map((t) => (
          <div key={t.id} className={`p-4 rounded-xl border transition-all ${t.is_live ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/20 border-white/5'}`}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-white/50 uppercase block mb-1">Talent</span>
                <h4 className="text-lg font-bold text-white capitalize">{t.id}</h4>
              </div>
              
              <button 
                onClick={() => handleToggle(t.id, t.is_live, t.live_url)}
                disabled={!!updating}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  t.is_live 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
              >
                {updating === t.id ? '...' : (t.is_live ? '● LIVE ON' : '○ OFFLINE')}
              </button>
            </div>

            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                defaultValue={t.live_url || ''}
                onBlur={(e) => handleUrlUpdate(t.id, e.target.value)}
                // PERBAIKAN PLACEHOLDER
                placeholder="https://youtube.com/live/..." 
                className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-primary outline-none"
              />
            </div>
            <p className="text-[10px] text-white/30 mt-2 italic">
              *Masukkan link stream sebelum menyalakan live.
            </p>

          </div>
        ))}
        
        {loading && <div className="col-span-2 text-center text-white/30 text-sm">Memuat status...</div>}
      </div>
    </div>
  );
}