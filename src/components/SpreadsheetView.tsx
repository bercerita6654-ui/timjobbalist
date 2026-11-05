import React, { useState, useMemo } from 'react';
import { Plus, Download, Trash2, CheckCircle2, Circle, ArrowUpDown, MessageSquare, Layers, UserCheck } from 'lucide-react';
import { TeamMember, TaskCategory, TaskPriority, SortOption } from '../types/jobdesk';
import { CATEGORIES, CATEGORY_STYLES, PRIORITIES, PRIORITY_CONFIG } from '../data/defaultData';
import { exportToCSV } from '../utils/exportUtils';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface SpreadsheetViewProps {
  teamData: TeamMember[];
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedMember: string;
  sortOption: SortOption;
  onUpdateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  onUpdateTask: (memberId: string, taskId: string, updates: { text?: string; category?: TaskCategory; priority?: TaskPriority; completed?: boolean }) => void;
  onDeleteTask: (memberId: string, taskId: string) => void;
  onAddTask: (memberId: string, taskText: string, category?: TaskCategory, priority?: TaskPriority) => void;
  onOpenAvatarModal?: (member: TeamMember) => void;
  onOpenNotesForTask?: (memberId: string, taskId: string) => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  teamData,
  searchQuery,
  selectedCategory,
  selectedPriority,
  selectedMember,
  sortOption,
  onUpdateMember,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onOpenAvatarModal,
  onOpenNotesForTask
}) => {
  // Option to toggle cell merging (Group by Person vs Flat)
  const [isGroupedByName, setIsGroupedByName] = useState<boolean>(true);

  // Filter and group team data
  interface ProcessedTask {
    id: string;
    text: string;
    category: TaskCategory;
    priority: TaskPriority;
    completed: boolean;
    notesCount: number;
  }

  interface ProcessedMemberGroup {
    member: TeamMember;
    tasks: ProcessedTask[];
  }

  const memberGroups: ProcessedMemberGroup[] = useMemo(() => {
    const groups: ProcessedMemberGroup[] = [];

    teamData.forEach(member => {
      if (selectedMember !== 'ALL' && member.id !== selectedMember) return;

      const matchingTasks: ProcessedTask[] = [];

      member.tasks.forEach(task => {
        const priority = task.priority || 'Medium';
        const matchSearch = searchQuery === '' ||
                            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = selectedCategory === 'ALL' || task.category === selectedCategory;
        const matchPri = selectedPriority === 'ALL' || priority === selectedPriority;

        if (matchSearch && matchCat && matchPri) {
          matchingTasks.push({
            id: task.id,
            text: task.text,
            category: task.category,
            priority,
            completed: !!task.completed,
            notesCount: task.notes ? task.notes.length : 0
          });
        }
      });

      // Sort tasks within member according to sortOption
      if (sortOption === 'priority-desc') {
        matchingTasks.sort((a, b) => {
          const wA = PRIORITY_CONFIG[a.priority]?.weight || 2;
          const wB = PRIORITY_CONFIG[b.priority]?.weight || 2;
          return wB - wA;
        });
      } else if (sortOption === 'priority-asc') {
        matchingTasks.sort((a, b) => {
          const wA = PRIORITY_CONFIG[a.priority]?.weight || 2;
          const wB = PRIORITY_CONFIG[b.priority]?.weight || 2;
          return wA - wB;
        });
      } else if (sortOption === 'alpha') {
        matchingTasks.sort((a, b) => a.text.localeCompare(b.text));
      }

      // If search query is empty or member has matching tasks, include group
      if (matchingTasks.length > 0 || (searchQuery === '' && selectedCategory === 'ALL' && selectedPriority === 'ALL')) {
        groups.push({
          member,
          tasks: matchingTasks
        });
      }
    });

    // Sort member groups if needed
    if (sortOption === 'priority-desc') {
      groups.sort((a, b) => {
        const maxA = Math.max(...a.tasks.map(t => PRIORITY_CONFIG[t.priority]?.weight || 0), 0);
        const maxB = Math.max(...b.tasks.map(t => PRIORITY_CONFIG[t.priority]?.weight || 0), 0);
        return maxB - maxA;
      });
    }

    return groups;
  }, [teamData, searchQuery, selectedCategory, selectedPriority, selectedMember, sortOption]);

  const totalFilteredTasks = memberGroups.reduce((acc, g) => acc + g.tasks.length, 0);

  const handleAddNewRow = () => {
    if (teamData.length === 0) return;
    const targetMember = teamData[0];
    onAddTask(targetMember.id, 'Tugas operasional baru (Klik untuk edit)', 'Manajemen & Katalog', 'Medium');
  };

  let globalRowCounter = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden" id="spreadsheet-view">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Tabel Data Spreadsheet Interaktif & Prioritas Tugas
            </h2>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
              {isGroupedByName ? 'Gabung per Personel (Nama Muncul 1x)' : 'Semua Baris Rata'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Nama dan identitas setiap personel disatukan dalam satu grup baris agar lebih rapi, teratur, dan tidak berulang-ulang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Button for Row Grouping */}
          <button
            type="button"
            onClick={() => setIsGroupedByName(!isGroupedByName)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
              isGroupedByName
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Beralih antara tampilan gabung nama atau tampilan baris berulang"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isGroupedByName ? 'Nama Muncul 1x: Aktif' : 'Tampilkan Ulang Nama'}</span>
          </button>

          <button
            onClick={handleAddNewRow}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tugas</span>
          </button>
          
          <button
            onClick={() => exportToCSV(teamData)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table with Sticky Header */}
      <div className="overflow-x-auto overflow-y-auto max-h-[660px] scrollbar-thin relative border-b border-slate-200">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead className="sticky top-0 z-30 shadow-xs bg-slate-100">
            <tr className="text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200 font-bold">
              <th className="py-3.5 px-3 w-12 text-center font-mono sticky top-0 left-0 bg-slate-100 z-40 border-r border-slate-200">
                No
              </th>
              <th className="py-3.5 px-3 w-52 sticky top-0 bg-slate-100 z-30 border-r border-slate-200">
                Personel & Karakter
              </th>
              <th className="py-3.5 px-3 w-44 sticky top-0 bg-slate-100 z-30 border-r border-slate-200">
                Jabatan / Peran
              </th>
              <th className="py-3.5 px-4 sticky top-0 bg-slate-100 z-30 border-r border-slate-200">
                Deskripsi Tugas (Jobdesk)
              </th>
              <th className="py-3.5 px-3 w-36 sticky top-0 bg-slate-100 z-30 border-r border-slate-200 text-center">
                Prioritas
              </th>
              <th className="py-3.5 px-3 w-44 sticky top-0 bg-slate-100 z-30 border-r border-slate-200">
                Divisi / Kategori
              </th>
              <th className="py-3.5 px-3 w-20 sticky top-0 bg-slate-100 z-30 border-r border-slate-200 text-center">
                Catatan
              </th>
              <th className="py-3.5 px-3 w-16 sticky top-0 bg-slate-100 z-30 text-center no-print">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {memberGroups.length === 0 || totalFilteredTasks === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                  Tidak ada baris tugas yang cocok dengan filter saat ini.
                </td>
              </tr>
            ) : (
              memberGroups.map((group, groupIdx) => {
                const member = group.member;
                const taskCount = group.tasks.length;

                // If member has no tasks matching filter, show one empty row
                if (taskCount === 0) {
                  globalRowCounter++;
                  return (
                    <tr key={`empty-${member.id}`} className="bg-slate-50/40 border-t-2 border-slate-200">
                      <td className="py-3 px-3 text-center font-mono text-slate-400 tabular-nums border-r border-slate-200">
                        {globalRowCounter}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <CharacterAvatarIcon
                            avatarId={member.avatarId || (member.gender === 'female' ? 'female-admin' : 'male-leader')}
                            gender={member.gender || 'male'}
                            size="sm"
                          />
                          <span className="font-extrabold text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium border-r border-slate-200">
                        {member.role}
                      </td>
                      <td colSpan={5} className="py-3 px-4 text-slate-400 italic">
                        Belum ada tugas pada kategori ini
                      </td>
                      <td className="py-3 px-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onAddTask(member.id, 'Tugas baru', 'Manajemen & Katalog', 'Medium')}
                          className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold"
                          title="Tambah tugas untuk personel ini"
                        >
                          + Tambah
                        </button>
                      </td>
                    </tr>
                  );
                }

                return group.tasks.map((task, taskIdx) => {
                  globalRowCounter++;
                  const isFirstTask = taskIdx === 0;
                  const isLastTask = taskIdx === taskCount - 1;
                  const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES['Manajemen & Katalog'];
                  const priConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;

                  return (
                    <tr 
                      key={`${member.id}-${task.id}`} 
                      className={`hover:bg-indigo-50/25 transition-colors ${
                        isFirstTask && groupIdx !== 0 ? 'border-t-2 border-slate-300' : ''
                      }`}
                    >
                      {/* Sequential Row Number */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums border-r border-slate-200 bg-white">
                        {globalRowCounter}
                      </td>

                      {/* Member Column: Appears EXACTLY ONCE with rowSpan if isGroupedByName is active */}
                      {isGroupedByName ? (
                        isFirstTask ? (
                          <td 
                            rowSpan={taskCount} 
                            className="py-3.5 px-3 align-top bg-white border-r border-slate-200 shadow-[1px_0_3px_rgba(0,0,0,0.02)]"
                          >
                            <div className="flex items-start gap-2.5 sticky top-14">
                              <button
                                type="button"
                                onClick={() => onOpenAvatarModal && onOpenAvatarModal(member)}
                                className="shrink-0 hover:scale-110 transition cursor-pointer relative"
                                title="Klik untuk memilih profil karakter & gender"
                              >
                                <CharacterAvatarIcon
                                  avatarId={member.avatarId || (member.gender === 'female' ? 'female-admin' : 'male-leader')}
                                  gender={member.gender || 'male'}
                                  size="md"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-white text-slate-800 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-slate-200 shadow-2xs">
                                  {member.gender === 'female' ? '♀' : '♂'}
                                </span>
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    defaultValue={member.name}
                                    onBlur={(e) => {
                                      if (e.target.value.trim() && e.target.value.trim() !== member.name) {
                                        onUpdateMember(member.id, { name: e.target.value.trim() });
                                      }
                                    }}
                                    className="w-full font-black text-slate-900 bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-1 py-0.5 focus:bg-white focus:outline-none transition text-xs"
                                  />
                                </div>

                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                    {taskCount} Tugas
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onAddTask(member.id, 'Tugas baru', 'Manajemen & Katalog', 'Medium')}
                                    className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                    title="Tambah tugas baru untuk personel ini"
                                  >
                                    + Tugas
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        ) : null
                      ) : (
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <CharacterAvatarIcon
                              avatarId={member.avatarId || (member.gender === 'female' ? 'female-admin' : 'male-leader')}
                              gender={member.gender || 'male'}
                              size="sm"
                            />
                            <span className="font-bold text-slate-900">{member.name}</span>
                          </div>
                        </td>
                      )}

                      {/* Role Column: Appears EXACTLY ONCE with rowSpan if isGroupedByName is active */}
                      {isGroupedByName ? (
                        isFirstTask ? (
                          <td 
                            rowSpan={taskCount} 
                            className="py-3.5 px-3 align-top bg-white border-r border-slate-200"
                          >
                            <div className="sticky top-14">
                              <input
                                type="text"
                                defaultValue={member.role}
                                onBlur={(e) => {
                                  if (e.target.value.trim() && e.target.value.trim() !== member.role) {
                                    onUpdateMember(member.id, { role: e.target.value.trim() });
                                  }
                                }}
                                className="w-full text-slate-600 font-semibold bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-1 py-0.5 focus:bg-white focus:outline-none transition text-xs"
                              />
                              <span className="text-[9px] text-slate-400 block px-1 mt-0.5">
                                Divisi Utama
                              </span>
                            </div>
                          </td>
                        ) : null
                      ) : (
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <span className="text-slate-600 font-medium">{member.role}</span>
                        </td>
                      )}

                      {/* Task Text (Editable) */}
                      <td className="py-2.5 px-4 border-r border-slate-200">
                        <input
                          type="text"
                          defaultValue={task.text}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value.trim() !== task.text) {
                              onUpdateTask(member.id, task.id, { text: e.target.value.trim() });
                            }
                          }}
                          className={`w-full font-semibold bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-1.5 py-1 focus:bg-white focus:outline-none transition ${
                            task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800'
                          }`}
                        />
                      </td>

                      {/* Priority Dropdown */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="relative inline-flex items-center w-full">
                          <select
                            value={task.priority}
                            onChange={(e) => onUpdateTask(member.id, task.id, { priority: e.target.value as TaskPriority })}
                            className={`w-full text-[11px] font-bold pl-4 pr-1 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${priConfig.badge}`}
                          >
                            <option value="High">🔴 Tinggi</option>
                            <option value="Medium">🟡 Sedang</option>
                            <option value="Low">⚪ Rendah</option>
                          </select>
                          <span 
                            className={`absolute left-1.5 w-1.5 h-1.5 rounded-full pointer-events-none ${priConfig.dot}`} 
                          />
                        </div>
                      </td>

                      {/* Category Dropdown */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <select
                          value={task.category}
                          onChange={(e) => onUpdateTask(member.id, task.id, { category: e.target.value as TaskCategory })}
                          className={`w-full text-[11px] font-medium px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${catStyle.badge}`}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>


                      {/* Notes Button */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        <button
                          type="button"
                          onClick={() => onOpenNotesForTask && onOpenNotesForTask(member.id, task.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                            task.notesCount > 0
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Buka catatan untuk tugas ini"
                        >
                          <MessageSquare className="w-3 h-3 text-indigo-600" />
                          <span>{task.notesCount > 0 ? `${task.notesCount}` : '+'}</span>
                        </button>
                      </td>

                      {/* Action Delete */}
                      <td className="py-2.5 px-3 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onDeleteTask(member.id, task.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus tugas ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                });
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Total: <strong>{memberGroups.length} Personel</strong></span>
          <span>•</span>
          <span>Total Tugas: <strong>{totalFilteredTasks} Tugas Terdaftar</strong></span>
        </div>
        <span>Perubahan data tersimpan otomatis & tersinkron</span>
      </div>

    </div>
  );
};
