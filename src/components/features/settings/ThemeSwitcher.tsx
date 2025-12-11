import { useSettingsStore, type ThemeMode } from '../../../store/useSettingsStore';
import { Palette, Check } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useSettingsStore();

  const themes: { id: ThemeMode; label: string; color: string }[] = [
    { id: 'default', label: 'Default (Rose)', color: 'bg-[#E11D48]' },
    { id: 'aya', label: 'Aya Mode (Pink)', color: 'bg-pink-500' },
    { id: 'arjuna', label: 'Arjuna Mode (Blue)', color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase mb-2">
        <Palette size={14} /> Tampilan Tema
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative flex items-center gap-4 p-3 rounded-xl border transition-all overflow-hidden group ${
              theme === t.id 
                ? 'border-primary bg-primary/10' 
                : 'border-white/10 bg-black/20 hover:bg-white/5'
            }`}
          >
            {/* Indikator Warna Bulat */}
            <div className={`w-8 h-8 rounded-full ${t.color} shadow-lg flex items-center justify-center`}>
               {theme === t.id && <Check size={16} className="text-white" />}
            </div>

            <span className={`text-sm font-medium ${theme === t.id ? 'text-white' : 'text-white/70'}`}>
              {t.label}
            </span>

            {/* Efek Glow Background saat aktif */}
            {theme === t.id && (
              <div className={`absolute inset-0 ${t.color} opacity-10 blur-xl -z-10`} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}