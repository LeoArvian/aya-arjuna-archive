import { Search, ArrowUp, ArrowDown, Music, Mic2 } from 'lucide-react';

interface SongFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  sort: 'asc' | 'desc';
  setSort: (val: 'asc' | 'desc') => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
}

export default function SongFilters({
  search, setSearch, sort, setSort, typeFilter, setTypeFilter
}: SongFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-surface p-4 rounded-xl border border-dark-border mb-8 shadow-lg">
      
      {/* 1. Pencarian */}
      <div className="relative w-full md:w-auto flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input 
          type="text" 
          placeholder="Cari judul lagu..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/30 text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none transition-all"
        />
      </div>

      {/* 2. Filter Tipe & Sort */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        
        {/* Filter Type Tabs */}
        <div className="bg-black/30 p-1 rounded-lg flex border border-white/10">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!typeFilter ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter('original')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${typeFilter === 'original' ? 'bg-primary text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
            <Music size={14} /> Original
          </button>
          <button
            onClick={() => setTypeFilter('cover')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${typeFilter === 'cover' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
          >
            <Mic2 size={14} /> Cover
          </button>
        </div>

        {/* Sort Button */}
        <button
          onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg transition-all active:scale-95 h-[42px]"
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