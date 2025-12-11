import { Search, ArrowUp, ArrowDown } from 'lucide-react';

interface TimelineFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  month: string;
  setMonth: (val: string) => void;
  sort: 'asc' | 'desc';
  setSort: (val: 'asc' | 'desc') => void;
}

export default function TimelineFilters({
  search, setSearch, year, setYear, month, setMonth, sort, setSort
}: TimelineFiltersProps) {
  
  // Generate Tahun (2025 - 2035 sesuai request)
  const years = Array.from({ length: 11 }, (_, i) => (2025 + i).toString());
  
  // Generate Bulan (01 - 12)
  const months = [
    { val: '', label: 'Semua Bulan' },
    { val: '01', label: 'Januari' }, { val: '02', label: 'Februari' },
    { val: '03', label: 'Maret' }, { val: '04', label: 'April' },
    { val: '05', label: 'Mei' }, { val: '06', label: 'Juni' },
    { val: '07', label: 'Juli' }, { val: '08', label: 'Agustus' },
    { val: '09', label: 'September' }, { val: '10', label: 'Oktober' },
    { val: '11', label: 'November' }, { val: '12', label: 'Desember' },
  ];

  // Class khusus untuk option agar terlihat di background gelap
  const optionClass = "bg-dark-surface text-white";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-surface p-4 rounded-xl border border-dark-border mb-8 shadow-lg">
      
      {/* 1. Pencarian */}
      <div className="relative w-full md:w-auto flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input 
          type="text" 
          placeholder="Cari judul aktivitas..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/30 text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      {/* 2. Filter Waktu & Sort (Horizontal) */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        
        {/* Tahun Scroll */}
        <select 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none appearance-none cursor-pointer hover:bg-white/5"
        >
          <option value="" className={optionClass}>Semua Tahun</option>
          {years.map(y => (
            <option key={y} value={y} className={optionClass}>
              {y}
            </option>
          ))}
        </select>

        {/* Bulan Scroll - SEKARANG SELALU AKTIF & TERLIHAT */}
        <select 
          value={month} 
          onChange={(e) => setMonth(e.target.value)}
          className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none appearance-none cursor-pointer hover:bg-white/5"
        >
          {months.map(m => (
            <option key={m.val} value={m.val} className={optionClass}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Sort Button (Panah Atas/Bawah) */}
        <button
          onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg transition-all active:scale-95"
          title={sort === 'desc' ? "Terbaru ke Terlama" : "Terlama ke Terbaru"}
        >
          {sort === 'desc' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
          <span className="text-sm font-bold hidden sm:inline">
            {sort === 'desc' ? 'Terbaru' : 'Terlama'}
          </span>
        </button>

      </div>
    </div>
  );
}