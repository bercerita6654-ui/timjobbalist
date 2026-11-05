import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Crown, 
  Camera,
  Flame,
  Clock,
  Sparkles,
  Edit2,
  Check,
  Package,
  MessageSquare,
  Receipt,
  Video,
  Layers,
  ChevronDown,
  Maximize2,
  X,
  Search,
  Filter
} from 'lucide-react';
import { TeamMember, TaskCategory, JobdeskTask, TaskPriority, SortOption } from '../types/jobdesk';
import { 
  THEME_CONFIG, 
  CATEGORY_STYLES, 
  CATEGORIES, 
  PRIORITIES, 
  PRIORITY_CONFIG, 
  autoDetectCategory, 
  autoDetectPriority,
  sortTasks 
} from '../data/defaultData';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface CardsViewProps {
  teamData: TeamMember[];
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedMember: string;
  sortOption: SortOption;
  onUpdateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  onDeleteMember: (memberId: string) => void;
  onAddTask: (memberId: string, taskText: string, category?: TaskCategory, priority?: TaskPriority) => void;
  onUpdateTask: (memberId: string, taskId: string, updates: Partial<JobdeskTask>) => void;
  onDeleteTask: (memberId: string, taskId: string) => void;
  onToggleTaskComplete: (memberId: string, taskId: string) => void;
  onOpenAvatarModal: (member: TeamMember) => void;
  onOpenNotesForTask?: (memberId: string, taskId: string) => void;
}

// Category icon helper
const getCategoryIcon = (category: TaskCategory) => {
  switch (category) {
    case 'Packing & Logistik':
      return <Package className="w-3 h-3 shrink-0" />;
    case 'CS & Chat':
      return <MessageSquare className="w-3 h-3 shrink-0" />;
    case 'Nota & Keuangan':
      return <Receipt className="w-3 h-3 shrink-0" />;
    case 'Live Streaming':
      return <Video className="w-3 h-3 shrink-0" />;
    case 'Manajemen & Katalog':
    default:
      return <Layers className="w-3 h-3 shrink-0" />;
  }
};

export const CardsView: React.FC<CardsViewProps> = ({
  teamData,
  searchQuery,
  selectedCategory,
  selectedPriority,
  selectedMember,
  sortOption,
  onUpdateMember,
  onDeleteMember,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskComplete,
  onOpenAvatarModal,
  onOpenNotesForTask
}) => {
  const [quickTaskInputs, setQuickTaskInputs] = useState<Record<string, string>>({});
  const [quickTaskPriority, setQuickTaskPriority] = useState<Record<string, TaskPriority>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingMemberRole, setEditingMemberRole] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Pop-up modal state for viewing full list of jobdesk
  const [modalMember, setModalMember] = useState<TeamMember | null>(null);
  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalCategory, setModalCategory] = useState<string>('ALL');
  const [modalPriority, setModalPriority] = useState<string>('ALL');
  const [modalNewTaskText, setModalNewTaskText] = useState<string>('');
  const [modalNewTaskPriority, setModalNewTaskPriority] = useState<TaskPriority>('Medium');

  const activeModalMember = modalMember ? teamData.find(m => m.id === modalMember.id) || null : null;

  const handleQuickTaskSubmit = (e: React.FormEvent, memberId: string) => {
    e.preventDefault();
    const text = quickTaskInputs[memberId]?.trim();
    if (!text) return;
    const priority = quickTaskPriority[memberId] || autoDetectPriority(text);
    onAddTask(memberId, text, autoDetectCategory(text), priority);
    setQuickTaskInputs(prev => ({ ...prev, [memberId]: '' }));
  };

  const handleModalAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalMember || !modalNewTaskText.trim()) return;
    onAddTask(activeModalMember.id, modalNewTaskText.trim(), autoDetectCategory(modalNewTaskText.trim()), modalNewTaskPriority);
    setModalNewTaskText('');
  };

  const filteredMembers = teamData.filter(member => {
    if (selectedMember !== 'ALL' && member.id !== selectedMember) {
      return false;
    }

    const memberMatches = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchQuery.toLowerCase());

    const hasMatchingTask = member.tasks.some(task => {
      const matchSearch = searchQuery === '' || 
                          task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.priority || 'Medium').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || task.category === selectedCategory;
      const matchPri = selectedPriority === 'ALL' || (task.priority || 'Medium') === selectedPriority;
      return matchSearch && matchCat && matchPri;
    });

    if (searchQuery === '' && selectedCategory === 'ALL' && selectedPriority === 'ALL') {
      return true;
    }

    return memberMatches || hasMatchingTask;
  });

  if (filteredMembers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center my-6 shadow-xs max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Tidak ada personel atau tugas yang cocok</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Coba sesuaikan kata kunci pencarian, filter kategori tugas, atau tingkat prioritas pada bilah di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="view-cards">
      {filteredMembers.map(member => {
        const theme = THEME_CONFIG[member.theme] || THEME_CONFIG.indigo;
        
        // Filter tasks within this member card
        const rawFilteredTasks = member.tasks.filter(task => {
          const matchSearch = searchQuery === '' || 
                              task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (task.priority || 'Medium').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              member.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchCat = selectedCategory === 'ALL' || task.category === selectedCategory;
          const matchPri = selectedPriority === 'ALL' || (task.priority || 'Medium') === selectedPriority;
          return matchSearch && matchCat && matchPri;
        });

        // Apply sorting
        const visibleTasks = sortTasks(rawFilteredTasks, sortOption);

        const totalMemberTasks = member.tasks.length;
        const completedCount = member.tasks.filter(t => t.completed).length;
        const completionRate = totalMemberTasks > 0 ? Math.round((completedCount / totalMemberTasks) * 100) : 0;
        const highPriorityCount = member.tasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length;
        const isLeader = member.name.toUpperCase().includes('BOBBY');

        return (
          <div 
            key={member.id}
            className="print-break rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group/card"
          >
            
            {/* Card Header with Modern Gradient, Character Avatar & Progress */}
            <div className={`${theme.headerBg} p-5 relative overflow-hidden`}>
              
              {/* Subtle ambient circle in background */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                
                {/* Left: Avatar & Personal Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  
                  {/* Interactive Character Avatar */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenAvatarModal(member)}
                      className="relative block rounded-2xl p-0.5 ring-2 ring-white/40 hover:ring-white transition shadow-sm group/avatar cursor-pointer"
                      title="Klik untuk memilih profil karakter & gender"
                    >
                      <CharacterAvatarIcon
                        avatarId={member.avatarId || (member.gender === 'female' ? 'female-admin' : 'male-leader')}
                        gender={member.gender || 'male'}
                        size="lg"
                        className="rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/45 rounded-xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white backdrop-blur-xs">
                        <Camera className="w-4 h-4" />
                      </div>
                    </button>
                    {/* Small Gender Badge on Avatar */}
                    <span 
                      onClick={() => onOpenAvatarModal(member)}
                      className="absolute -bottom-1 -right-1 cursor-pointer bg-white text-slate-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-slate-100 font-bold"
                      title={member.gender === 'female' ? 'Wanita' : 'Pria'}
                    >
                      {member.gender === 'female' ? '♀' : '♂'}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-extrabold tracking-tight text-white leading-tight truncate">
                        {member.name}
                      </h3>
                      {isLeader && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                          <Crown className="w-2.5 h-2.5" />
                          LEAD
                        </span>
                      )}
                    </div>

                    {/* Role / Job Position */}
                    {editingMemberRole === member.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          defaultValue={member.role}
                          autoFocus
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value.trim() !== member.role) {
                              onUpdateMember(member.id, { role: e.target.value.trim() });
                            }
                            setEditingMemberRole(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (e.currentTarget.value.trim()) {
                                onUpdateMember(member.id, { role: e.currentTarget.value.trim() });
                              }
                              setEditingMemberRole(null);
                            }
                          }}
                          className="text-xs bg-white text-slate-900 rounded px-1.5 py-0.5 focus:outline-none w-full"
                        />
                      </div>
                    ) : (
                      <p 
                        onClick={() => setEditingMemberRole(member.id)}
                        title="Klik untuk mengedit jabatan"
                        className="text-xs text-white/90 font-medium leading-tight mt-1 truncate cursor-pointer hover:underline flex items-center gap-1"
                      >
                        <span>{member.role}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-60 inline" />
                      </p>
                    )}

                    {/* Gender and Avatar Quick Action */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenAvatarModal(member)}
                        className="text-[10px] font-semibold text-white/95 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-0.5 rounded-full transition flex items-center gap-1 shadow-xs"
                      >
                        <span>{member.gender === 'female' ? '👩 Karakter Wanita' : '👨 Karakter Pria'}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Right: Actions (Delete / Options) */}
                <div className="shrink-0 no-print">
                  {deletingMemberId === member.id ? (
                    <div className="flex items-center gap-1 bg-white text-slate-800 text-[10px] font-bold px-2 py-1 rounded-xl shadow-md border border-slate-200 animate-in fade-in">
                      <span>Hapus?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteMember(member.id);
                          setDeletingMemberId(null);
                        }}
                        className="text-rose-600 hover:text-rose-700 px-1 font-extrabold"
                      >
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingMemberId(null)}
                        className="text-slate-500 hover:text-slate-700 px-1 font-normal"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingMemberId(member.id)}
                      title="Hapus personel ini"
                      className="p-1.5 text-white/60 hover:text-white hover:bg-white/15 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

             </div>

            {/* Tasks Section */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-slate-50/40">
              
              <div className="space-y-2.5">
                
                {/* Header count label - Clickable to open pop-up modal list */}
                <div className="flex items-center justify-between px-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMember(member);
                      setModalSearch('');
                      setModalCategory('ALL');
                      setModalPriority('ALL');
                    }}
                    className="group/btn inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 px-2.5 py-1 rounded-xl transition shadow-2xs cursor-pointer"
                    title="Klik untuk membuka pop-up daftar jobdesk lengkap"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daftar Jobdesk ({visibleTasks.length})</span>
                    <Maximize2 className="w-3 h-3 text-slate-400 group-hover/btn:text-indigo-600 ml-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalMember(member);
                      setModalSearch('');
                      setModalCategory('ALL');
                      setModalPriority('ALL');
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Buka pop-up daftar jobdesk"
                  >
                    <span>Pop-up ↗</span>
                  </button>
                </div>

               <div className="space-y-3 py-6 text-center">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                   <Layers className="w-6 h-6" />
                 </div>
                 <div>
                   <h4 className="text-xs font-bold text-slate-800">
                     Daftar Jobdesk ({totalMemberTasks} Tugas)
                   </h4>
                   <p className="text-[11px] text-slate-500 mt-0.5">
                     Klik tombol di bawah untuk melihat, mengedit, dan menambah jobdesk dalam pop-up.
                   </p>
                 </div>

                 <button
                   type="button"
                   onClick={() => {
                     setModalMember(member);
                     setModalSearch('');
                     setModalCategory('ALL');
                     setModalPriority('ALL');
                   }}
                   className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer mx-auto"
                 >
                   <Maximize2 className="w-3.5 h-3.5" />
                   <span>Buka Pop-up Daftar Jobdesk</span>
                 </button>
               </div>

              </div>

              {/* Quick Add Task Form */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/80 no-print">
                <form 
                  onSubmit={(e) => handleQuickTaskSubmit(e, member.id)}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={quickTaskInputs[member.id] || ''}
                    onChange={(e) => setQuickTaskInputs(prev => ({ ...prev, [member.id]: e.target.value }))}
                    placeholder={`+ Tambah tugas ${member.name.split(' ')[0]}...`}
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-xs transition"
                  />
                  
                  {/* Quick Priority Selector */}
                  <select
                    value={quickTaskPriority[member.id] || 'Medium'}
                    onChange={(e) => setQuickTaskPriority(prev => ({ ...prev, [member.id]: e.target.value as TaskPriority }))}
                    className="text-[10px] font-bold border border-slate-200 bg-white px-2 py-2 rounded-xl focus:outline-none shadow-xs text-slate-700 cursor-pointer"
                    title="Pilih prioritas tugas baru"
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Med</option>
                    <option value="Low">⚪ Low</option>
                  </select>

                  <button
                    type="submit"
                    className="p-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl transition shadow-xs cursor-pointer shrink-0"
                    title="Tambah tugas"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        );
      })}

      {/* =========================================================================
          POP-UP MODAL: DAFTAR JOBDESK LENGKAP
         ========================================================================= */}
      {activeModalMember && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setModalMember(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${THEME_CONFIG[activeModalMember.theme]?.headerBg || 'bg-slate-900 text-white'} p-5 relative overflow-hidden shrink-0`}>
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3.5">
                  <CharacterAvatarIcon
                    avatarId={activeModalMember.avatarId || (activeModalMember.gender === 'female' ? 'female-admin' : 'male-leader')}
                    gender={activeModalMember.gender || 'male'}
                    size="md"
                    className="ring-2 ring-white/50 rounded-xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white leading-tight">
                        {activeModalMember.name}
                      </h3>
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                        {activeModalMember.tasks.length} Jobdesk
                      </span>
                    </div>
                    <p className="text-xs text-white/80 font-medium mt-0.5">
                      {activeModalMember.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalMember(null)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/15 rounded-xl transition cursor-pointer"
                  title="Tutup pop-up (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar inside Modal Header */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white font-mono">
                <span>
                  Selesai: {activeModalMember.tasks.filter(t => t.completed).length}/{activeModalMember.tasks.length} ({activeModalMember.tasks.length > 0 ? Math.round((activeModalMember.tasks.filter(t => t.completed).length / activeModalMember.tasks.length) * 100) : 0}%)
                </span>
                {activeModalMember.tasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {activeModalMember.tasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length} Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Quick Filter Bar inside Modal */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Cari tugas di pop-up..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Category Filter */}
              <select
                value={modalCategory}
                onChange={(e) => setModalCategory(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="ALL">Semua Divisi</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={modalPriority}
                onChange={(e) => setModalPriority(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="High">🔴 Tinggi (High)</option>
                <option value="Medium">🟡 Sedang (Med)</option>
                <option value="Low">⚪ Rendah (Low)</option>
              </select>
            </div>

            {/* Modal Body: Task List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
              {(() => {
                const modalTasks = activeModalMember.tasks.filter(task => {
                  const prio = task.priority || 'Medium';
                  const matchSearch = modalSearch === '' || task.text.toLowerCase().includes(modalSearch.toLowerCase());
                  const matchCat = modalCategory === 'ALL' || task.category === modalCategory;
                  const matchPrio = modalPriority === 'ALL' || prio === modalPriority;
                  return matchSearch && matchCat && matchPrio;
                });

                if (modalTasks.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 italic">
                      Tidak ada tugas yang sesuai dengan filter pencarian.
                    </div>
                  );
                }

                return modalTasks.map(task => {
                  const priority = (task.priority || 'Medium') as TaskPriority;
                  const priConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
                  const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES['Manajemen & Katalog'];

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-2xl border transition ${
                        task.completed
                          ? 'bg-slate-50 border-slate-200/80 opacity-70'
                          : priority === 'High'
                          ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                          : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleTaskComplete(activeModalMember.id, task.id)}
                          className="mt-0.5 shrink-0 cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            defaultValue={task.text}
                            onBlur={(e) => {
                              if (e.target.value.trim() && e.target.value.trim() !== task.text) {
                                onUpdateTask(activeModalMember.id, task.id, { text: e.target.value.trim() });
                              }
                            }}
                            className={`w-full text-xs font-semibold bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-1.5 py-0.5 focus:bg-white focus:outline-none transition ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          />

                          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {/* Priority Dropdown */}
                              <select
                                value={priority}
                                onChange={(e) => onUpdateTask(activeModalMember.id, task.id, { priority: e.target.value as TaskPriority })}
                                className={`text-[10px] font-bold border rounded-lg px-2 py-0.5 cursor-pointer ${priConfig.badge}`}
                              >
                                <option value="High">🔴 Tinggi</option>
                                <option value="Medium">🟡 Sedang</option>
                                <option value="Low">⚪ Rendah</option>
                              </select>

                              {/* Category Dropdown */}
                              <select
                                value={task.category}
                                onChange={(e) => onUpdateTask(activeModalMember.id, task.id, { category: e.target.value as TaskCategory })}
                                className={`text-[10px] font-semibold border rounded-lg px-2 py-0.5 cursor-pointer ${catStyle.badge}`}
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>

                              {/* Notes Button */}
                              {onOpenNotesForTask && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenNotesForTask(activeModalMember.id, task.id);
                                  }}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                                    task.notes && task.notes.length > 0
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <MessageSquare className="w-3 h-3 text-indigo-600" />
                                  <span>{task.notes && task.notes.length > 0 ? `${task.notes.length}` : 'Catatan'}</span>
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteTask(activeModalMember.id, task.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus tugas ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Bottom: Add New Task Form */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <form onSubmit={handleModalAddTask} className="flex items-center gap-2">
                <input
                  type="text"
                  value={modalNewTaskText}
                  onChange={(e) => setModalNewTaskText(e.target.value)}
                  placeholder={`+ Tambah tugas baru untuk ${activeModalMember.name}...`}
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />

                <select
                  value={modalNewTaskPriority}
                  onChange={(e) => setModalNewTaskPriority(e.target.value as TaskPriority)}
                  className="text-xs font-bold border border-slate-200 bg-white px-2.5 py-2 rounded-xl text-slate-700 cursor-pointer shadow-2xs focus:outline-none"
                >
                  <option value="High">🔴 Tinggi</option>
                  <option value="Medium">🟡 Sedang</option>
                  <option value="Low">⚪ Rendah</option>
                </select>

                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                >
                  + Tambah
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
