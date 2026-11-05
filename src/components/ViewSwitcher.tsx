import React from 'react';
import { 
  LayoutGrid, 
  Table2, 
  Grid3X3, 
  Kanban, 
  Clock, 
  BarChart3, 
  Network,
  Search, 
  X,
  ArrowUpDown,
  Flame
} from 'lucide-react';
import { ViewMode, TaskCategory, TeamMember, TaskPriority, SortOption } from '../types/jobdesk';
import { CATEGORIES, PRIORITIES, PRIORITY_CONFIG } from '../data/defaultData';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  selectedMember: string;
  onMemberChange: (memberId: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  teamData: TeamMember[];
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  selectedMember,
  onMemberChange,
  sortOption,
  onSortChange,
  teamData
}) => {
  const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'cards', label: 'Kartu Visual', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'structure', label: 'Struktur Grafik', icon: <Network className="w-4 h-4" /> },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: <Table2 className="w-4 h-4" /> },
    { id: 'matrix', label: 'Matriks Tugas', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'kanban', label: 'Kanban Alur', icon: <Kanban className="w-4 h-4" /> },
    { id: 'schedule', label: 'SOP & Shift', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analisis Beban', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const hasActiveFilters = 
    selectedCategory !== 'ALL' || 
    selectedPriority !== 'ALL' || 
    selectedMember !== 'ALL' || 
    searchQuery !== '' ||
    sortOption !== 'default';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 mb-6 shadow-xs no-print flex flex-col gap-3">
      
      {/* Top Row: View Segmented Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* View Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {views.map(view => {
            const isActive = currentView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {view.icon}
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas, prioritas, atau staf..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Filter & Sorting Strip */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" />
              Prioritas:
            </span>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Prioritas</option>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>
                  {p === 'High' ? '🔴 Tinggi (High)' : p === 'Medium' ? '🟡 Sedang (Medium)' : '⚪ Rendah (Low)'}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Kategori:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Member filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Personel:
            </span>
            <select
              value={selectedMember}
              onChange={(e) => onMemberChange(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Personel</option>
              {teamData.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.tasks.length})</option>
              ))}
            </select>
          </div>

        </div>

        {/* Right side: Sorting control & Reset Filter */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Urutkan:
            </span>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="default">Urutan Standar</option>
              <option value="priority-desc">Prioritas Tertinggi (High → Low)</option>
              <option value="priority-asc">Prioritas Terendah (Low → High)</option>
              <option value="alpha">Nama Tugas (A-Z)</option>
            </select>
          </div>

          {/* Reset filter button if any active */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('ALL');
                onPriorityChange('ALL');
                onMemberChange('ALL');
                onSortChange('default');
              }}
              title="Reset semua filter dan pengurutan"
              className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition whitespace-nowrap"
            >
              Reset Filter
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
