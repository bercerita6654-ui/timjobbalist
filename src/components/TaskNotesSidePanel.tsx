import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Trash2, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Filter, 
  Search, 
  ChevronDown,
  Layers,
  ArrowRight,
  Pin
} from 'lucide-react';
import { TeamMember, JobdeskTask, TaskNote, TaskPriority } from '../types/jobdesk';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';
import { PRIORITY_CONFIG, CATEGORY_STYLES } from '../data/defaultData';

interface TaskNotesSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  teamData: TeamMember[];
  activeTaskContext: { memberId: string; taskId: string } | null;
  onSelectTaskContext: (context: { memberId: string; taskId: string } | null) => void;
  onAddNote: (memberId: string, taskId: string, note: Omit<TaskNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (memberId: string, taskId: string, noteId: string) => void;
}

export const TaskNotesSidePanel: React.FC<TaskNotesSidePanelProps> = ({
  isOpen,
  onClose,
  teamData,
  activeTaskContext,
  onSelectTaskContext,
  onAddNote,
  onDeleteNote
}) => {
  // Active sender selection (defaults to first member, e.g. Bobby)
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(() => {
    return teamData[0]?.id || '';
  });

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualTaskPickMemberId, setManualTaskPickMemberId] = useState<string>('');
  const [manualTaskPickTaskId, setManualTaskPickTaskId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync author if teamData changes
  useEffect(() => {
    if (!selectedAuthorId && teamData.length > 0) {
      setSelectedAuthorId(teamData[0].id);
    }
  }, [teamData, selectedAuthorId]);

  // Scroll to bottom when context changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeTaskContext]);

  if (!isOpen) return null;

  const currentAuthor = teamData.find(m => m.id === selectedAuthorId) || teamData[0];

  // Find active task and member if specific context is active
  let activeMember: TeamMember | undefined;
  let activeTask: JobdeskTask | undefined;

  if (activeTaskContext) {
    activeMember = teamData.find(m => m.id === activeTaskContext.memberId);
    activeTask = activeMember?.tasks.find(t => t.id === activeTaskContext.taskId);
  }

  // Flatten all notes across all tasks for the team feed
  interface FlattenedNote {
    note: TaskNote;
    memberId: string;
    memberName: string;
    memberRole: string;
    memberAvatarId: string;
    memberGender: TeamMember['gender'];
    taskId: string;
    taskText: string;
    taskCategory: string;
    taskPriority: TaskPriority;
    taskCompleted: boolean;
  }

  const allNotes: FlattenedNote[] = [];
  teamData.forEach(member => {
    member.tasks.forEach(task => {
      if (task.notes && task.notes.length > 0) {
        task.notes.forEach(note => {
          allNotes.push({
            note,
            memberId: member.id,
            memberName: member.name,
            memberRole: member.role,
            memberAvatarId: member.avatarId,
            memberGender: member.gender,
            taskId: task.id,
            taskText: task.text,
            taskCategory: task.category,
            taskPriority: (task.priority || 'Medium') as TaskPriority,
            taskCompleted: !!task.completed
          });
        });
      }
    });
  });

  // Sort notes newest first for feed or oldest first for single task
  const displayedNotes = activeTaskContext && activeTask
    ? (activeTask.notes || []).map(note => ({
        note,
        memberId: activeMember!.id,
        memberName: activeMember!.name,
        memberRole: activeMember!.role,
        memberAvatarId: activeMember!.avatarId,
        memberGender: activeMember!.gender,
        taskId: activeTask!.id,
        taskText: activeTask!.text,
        taskCategory: activeTask!.category,
        taskPriority: (activeTask!.priority || 'Medium') as TaskPriority,
        taskCompleted: !!activeTask!.completed
      }))
    : allNotes.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.note.content.toLowerCase().includes(q) ||
          item.note.authorName.toLowerCase().includes(q) ||
          item.taskText.toLowerCase().includes(q) ||
          item.memberName.toLowerCase().includes(q)
        );
      }).sort((a, b) => new Date(b.note.createdAt).getTime() - new Date(a.note.createdAt).getTime());

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Determine target member and task
    const targetMemberId = activeTaskContext ? activeTaskContext.memberId : manualTaskPickMemberId;
    const targetTaskId = activeTaskContext ? activeTaskContext.taskId : manualTaskPickTaskId;

    if (!targetMemberId || !targetTaskId) {
      return;
    }

    if (!currentAuthor) return;

    onAddNote(targetMemberId, targetTaskId, {
      authorName: currentAuthor.name,
      authorRole: currentAuthor.role,
      authorAvatarId: currentAuthor.avatarId || (currentAuthor.gender === 'female' ? 'female-admin' : 'male-leader'),
      authorGender: currentAuthor.gender || 'male',
      content: messageInput.trim()
    });

    setMessageInput('');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity no-print"
        onClick={onClose}
      />

      {/* Side Panel Drawer */}
      <aside 
        className="fixed top-0 bottom-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 transition-transform no-print animate-in slide-in-from-right duration-200"
        aria-label="Panel Catatan Tim"
      >
        
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Catatan & Diskusi Tugas</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                  {allNotes.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Berbagi konteks, kendala & update serah terima tim
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            title="Tutup panel catatan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Context Navigation & Filter Strip */}
        <div className="p-3 border-b border-slate-100 bg-white space-y-2">
          
          {/* Active Task Context Banner OR All-Notes Switcher */}
          {activeTaskContext && activeTask && activeMember ? (
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3 relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CharacterAvatarIcon
                    avatarId={activeMember.avatarId}
                    gender={activeMember.gender}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block truncate">
                      Tugas: {activeMember.name}
                    </span>
                    <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {activeTask.text}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTaskContext(null)}
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-1 rounded-lg border border-indigo-200 shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                >
                  Semua Catatan
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">Divisi: {activeTask.category}</span>
                <span>·</span>
                <span className={`font-bold ${activeTask.priority === 'High' ? 'text-rose-600' : 'text-slate-600'}`}>
                  Prioritas {activeTask.priority || 'Medium'}
                </span>
                <span>·</span>
                <span>{activeTask.completed ? '✓ Selesai' : 'Sedang berjalan'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-indigo-600" />
                  Feed Semua Catatan Tim ({allNotes.length})
                </span>
                <span className="text-[10px] text-slate-400">
                  Terbaru pertama
                </span>
              </div>

              {/* Search note text or author */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari isi catatan, nama pengirim, atau tugas..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          )}

        </div>

        {/* 3. Notes Messages Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
          
          {displayedNotes.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">Belum Ada Catatan</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {activeTaskContext 
                  ? 'Gunakan formulir di bawah untuk meninggalkan instruksi, nomor resi, kendala stok, atau catatan serah terima untuk tugas ini.' 
                  : 'Belum ada catatan tim yang ditinggalkan pada tugas. Pilih salah satu tugas di bawah untuk memulai diskusi.'}
              </p>
            </div>
          ) : (
            displayedNotes.map(({ note, memberId, memberName, taskId, taskText, taskCategory, taskPriority }) => {
              return (
                <div 
                  key={note.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 hover:border-slate-300 transition"
                >
                  
                  {/* Note Header: Author info & Delete button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CharacterAvatarIcon
                        avatarId={note.authorAvatarId}
                        gender={note.authorGender}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {note.authorName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {note.authorGender === 'female' ? '♀' : '♂'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                          {note.authorRole || 'Tim Operasional'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {note.createdAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(memberId, taskId, note.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition cursor-pointer"
                        title="Hapus catatan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Task Context Tag (clickable if not in specific task view) */}
                  {!activeTaskContext && (
                    <div 
                      onClick={() => onSelectTaskContext({ memberId, taskId })}
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg border border-slate-200/80 cursor-pointer transition max-w-full"
                      title="Klik untuk fokus pada tugas ini"
                    >
                      <Pin className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                      <span className="font-bold text-slate-800">{memberName}:</span>
                      <span className="truncate">{taskText}</span>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 break-words whitespace-pre-wrap">
                    {note.content}
                  </div>

                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Bottom Form: Author Switcher & Message Input */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          
          {/* Author Selector: "Kirim sebagai personel" */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kirim Sebagai:
            </span>

            <div className="flex items-center gap-1.5">
              <CharacterAvatarIcon
                avatarId={currentAuthor?.avatarId || 'male-leader'}
                gender={currentAuthor?.gender || 'male'}
                size="sm"
              />
              <select
                value={selectedAuthorId}
                onChange={(e) => setSelectedAuthorId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {teamData.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If no active task context is selected, choose which task to comment on */}
          {!activeTaskContext && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500">
                Pilih Tugas yang Dituju:
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Pick Member */}
                <select
                  value={manualTaskPickMemberId}
                  onChange={(e) => {
                    setManualTaskPickMemberId(e.target.value);
                    const mem = teamData.find(m => m.id === e.target.value);
                    setManualTaskPickTaskId(mem?.tasks[0]?.id || '');
                  }}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Pilih Staf --</option>
                  {teamData.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {/* 2. Pick Task of Member */}
                <select
                  value={manualTaskPickTaskId}
                  onChange={(e) => setManualTaskPickTaskId(e.target.value)}
                  disabled={!manualTaskPickMemberId}
                  className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="">-- Pilih Tugas --</option>
                  {manualTaskPickMemberId && teamData
                    .find(m => m.id === manualTaskPickMemberId)
                    ?.tasks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.text.substring(0, 32)}...
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="space-y-2">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={2}
              placeholder={
                activeTaskContext 
                  ? `Tulis catatan untuk tugas "${activeTask?.text.substring(0, 24)}..."` 
                  : "Tulis catatan operasional untuk tugas yang dipilih..."
              }
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition"
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Tekan <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Enter</kbd> untuk kirim
              </span>

              <button
                type="submit"
                disabled={
                  !messageInput.trim() || 
                  (!activeTaskContext && (!manualTaskPickMemberId || !manualTaskPickTaskId))
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Catatan</span>
              </button>
            </div>
          </form>

        </div>

      </aside>
    </>
  );
};
