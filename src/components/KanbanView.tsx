import React, { useState, useMemo } from 'react';
import { 
  Layers,
  Flame,
  Users,
  Search,
  Filter,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { TeamMember, TaskCategory, JobdeskTask, TaskPriority } from '../types/jobdesk';
import { CATEGORIES, CATEGORY_STYLES, PRIORITIES, PRIORITY_CONFIG } from '../data/defaultData';

interface KanbanViewProps {
  teamData: TeamMember[];
  onToggleTaskComplete?: (memberId: string, taskId: string) => void;
  onUpdateTask?: (memberId: string, taskId: string, updates: Partial<JobdeskTask>) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  teamData
}) => {
  // Pure informational grouping modes: Category (Divisi), Member (Personel), Priority (Prioritas)
  const [groupBy, setGroupBy] = useState<'category' | 'member' | 'priority'>('category');
  const [searchFilter, setSearchFilter] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Extract all cards with member data
  interface KanbanCard {
    memberId: string;
    memberName: string;
    memberRole: string;
    memberTheme: TeamMember['theme'];
    gender: TeamMember['gender'];
    task: JobdeskTask;
  }

  const allCards = useMemo(() => {
    const list: KanbanCard[] = [];
    teamData.forEach(member => {
      member.tasks.forEach(task => {
        list.push({
          memberId: member.id,
          memberName: member.name,
          memberRole: member.role,
          memberTheme: member.theme,
          gender: member.gender,
          task
        });
      });
    });
    return list;
  }, [teamData]);

  // Filtered cards based on internal search
  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      const matchesSearch = searchFilter.trim() === '' || 
        c.task.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.memberName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.memberRole.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCat = filterCategory === 'ALL' || c.task.category === filterCategory;

      return matchesSearch && matchesCat;
    });
  }, [allCards, searchFilter, filterCategory]);

  return (
    <div className="space-y-4" id="kanban-view">
      
      {/* Information Header & Mode Switcher Bar (Tanpa Alur Status) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pr-1">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Papan Informasi Jobdesk:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setGroupBy('category')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                groupBy === 'category'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Divisi Operasional (5 Kolom)
            </button>

            <button
              type="button"
              onClick={() => setGroupBy('member')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                groupBy === 'member'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Personel Tim ({teamData.length} Staf)</span>
            </button>

            <button
              type="button"
              onClick={() => setGroupBy('priority')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                groupBy === 'priority'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Tingkat Prioritas (3 Kolom)</span>
            </button>
          </div>
        </div>

        {/* Right: Search & Counter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari info tugas / nama..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-44 sm:w-56"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 whitespace-nowrap">
            {filteredCards.length} Kartu Jobdesk
          </div>
        </div>

      </div>

      {/* Info Banner: Penjelasan Mode Informasi Murni */}
      <div className="px-3.5 py-2 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            <strong>Papan Informasi Jobdesk:</strong> Menampilkan katalog rincian tugas operasional toko secara informatif tanpa alur perpindahan status.
          </span>
        </div>
        <span className="text-[11px] text-indigo-600 font-medium">Balistationery E-Commerce</span>
      </div>

      {/* 1. Grouped by Divisi / Kategori (5 Kolom) */}
      {groupBy === 'category' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(category => {
            const cards = filteredCards.filter(c => c.task.category === category);
            const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['Manajemen & Katalog'];

            return (
              <div 
                key={category} 
                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/90 flex flex-col min-h-[520px]"
              >
                {/* Column Header */}
                <div className="pb-3 mb-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {category}
                    </h3>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {cards.length} Tugas Terdaftar
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-xs font-mono font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                    {cards.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {cards.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-medium italic">
                      Tidak ada tugas di divisi ini
                    </div>
                  ) : (
                    cards.map(card => {
                      const priority = card.task.priority || 'Medium';
                      const priConfig = PRIORITY_CONFIG[priority];

                      return (
                        <div 
                          key={`${card.memberId}-${card.task.id}`}
                          className="bg-white rounded-xl p-3 border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition"
                        >
                          {/* Member Badge & Priority Tag */}
                          <div className="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              <span className="truncate max-w-[110px]">{card.memberName}</span>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${priConfig.badge}`}>
                              {priConfig.shortLabel}
                            </span>
                          </div>

                          {/* Task Description */}
                          <p className="text-xs font-medium text-slate-800 leading-relaxed">
                            {card.task.text}
                          </p>

                          {/* Role Tag & Notes Indicator */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[130px] font-medium text-slate-500">
                              {card.memberRole}
                            </span>
                            {card.task.notes && card.task.notes.length > 0 && (
                              <span className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded">
                                {card.task.notes.length} Catatan
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Grouped by Personel Tim (Kolom per Anggota) */}
      {groupBy === 'member' && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(teamData.length, 5)} gap-4`}>
          {teamData.map(member => {
            const cards = filteredCards.filter(c => c.memberId === member.id);

            return (
              <div 
                key={member.id} 
                className="bg-slate-100/70 rounded-2xl p-3.5 border border-slate-200/90 flex flex-col min-h-[520px]"
              >
                {/* Column Header: Personel */}
                <div className="pb-3 mb-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {member.name}
                      </h3>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-xs font-mono font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                    {cards.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {cards.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-medium italic">
                      Tidak ada tugas tercatat
                    </div>
                  ) : (
                    cards.map(card => {
                      const priority = card.task.priority || 'Medium';
                      const priConfig = PRIORITY_CONFIG[priority];
                      const catStyle = CATEGORY_STYLES[card.task.category] || CATEGORY_STYLES['Manajemen & Katalog'];

                      return (
                        <div 
                          key={`${card.memberId}-${card.task.id}`}
                          className="bg-white rounded-xl p-3 border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition"
                        >
                          {/* Category Badge & Priority */}
                          <div className="flex items-center justify-between text-[10px] mb-2 pb-1.5 border-b border-slate-100">
                            <span className={`px-1.5 py-0.2 rounded font-medium border ${catStyle.badge}`}>
                              {card.task.category}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded font-bold border ${priConfig.badge}`}>
                              {priConfig.shortLabel}
                            </span>
                          </div>

                          {/* Task Description */}
                          <p className="text-xs font-medium text-slate-800 leading-relaxed">
                            {card.task.text}
                          </p>

                          {/* Task Notes indicator if available */}
                          {card.task.notes && card.task.notes.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-indigo-600 font-medium flex items-center justify-between">
                              <span>Diskusi internal:</span>
                              <span className="bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                                {card.task.notes.length} pesan
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Grouped by Tingkat Prioritas (3 Kolom: High, Medium, Low) */}
      {groupBy === 'priority' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRIORITIES.map(priority => {
            const conf = PRIORITY_CONFIG[priority];
            const cards = filteredCards.filter(c => (c.task.priority || 'Medium') === priority);

            return (
              <div 
                key={priority}
                className={`rounded-2xl p-3.5 border flex flex-col min-h-[520px] transition ${
                  priority === 'High' 
                    ? 'bg-rose-50/30 border-rose-200/80' 
                    : priority === 'Medium'
                    ? 'bg-amber-50/30 border-amber-200/80'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div className="pb-3 mb-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                      <h3 className="text-xs font-bold text-slate-900">
                        {conf.label}
                      </h3>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {cards.length} Tugas Prioritas {priority}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${conf.badge}`}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {cards.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-medium italic">
                      Tidak ada tugas di prioritas ini
                    </div>
                  ) : (
                    cards.map(card => {
                      const catStyle = CATEGORY_STYLES[card.task.category] || CATEGORY_STYLES['Manajemen & Katalog'];

                      return (
                        <div 
                          key={`${card.memberId}-${card.task.id}`}
                          className="bg-white rounded-xl p-3 border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition"
                        >
                          {/* Member & Category Tag */}
                          <div className="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-slate-100">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                              {card.memberName}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${catStyle.badge}`}>
                              {card.task.category}
                            </span>
                          </div>

                          {/* Task Description */}
                          <p className="text-xs font-medium text-slate-800 leading-relaxed">
                            {card.task.text}
                          </p>

                          {/* Footer Tag */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[160px] font-medium text-slate-500">
                              {card.memberRole}
                            </span>
                            <span className="font-mono text-slate-400">ID: {card.task.id}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
