import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FileCheck, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { DEFAULT_SOPS, DEFAULT_SHIFT_SCHEDULE } from '../data/defaultData';
import { SOPItem, ShiftSchedule, TeamMember } from '../types/jobdesk';

interface ScheduleSopViewProps {
  teamData?: TeamMember[];
}

const STORAGE_SHIFTS_KEY = 'jobdesk_shifts_v2';
const STORAGE_SOPS_KEY = 'jobdesk_sops_v2';

export const ScheduleSopView: React.FC<ScheduleSopViewProps> = ({ teamData = [] }) => {
  // 1. Shift Schedule State
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SHIFTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading shifts:', e);
    }
    return DEFAULT_SHIFT_SCHEDULE;
  });

  // 2. SOP List State
  const [sopList, setSopList] = useState<SOPItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOPS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading sops:', e);
    }
    return DEFAULT_SOPS;
  });

  const [activeSopId, setActiveSopId] = useState<string>(() => {
    return sopList[0]?.id || DEFAULT_SOPS[0].id;
  });

  const activeSop = sopList.find(s => s.id === activeSopId) || sopList[0] || DEFAULT_SOPS[0];

  // Daily execution checklist toggles (transient)
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});
  const [completedShifts, setCompletedShifts] = useState<Record<string, boolean>>({});

  // --- MODAL / EDIT STATES ---
  // Shift modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null); // null = add new
  const [shiftForm, setShiftForm] = useState<ShiftSchedule>({
    time: '08:30 - 09:30',
    label: '',
    action: '',
    assignedTo: '',
    type: 'regular'
  });

  // SOP modal
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [editingSopId, setEditingSopId] = useState<string | null>(null); // null = add new
  const [sopForm, setSopForm] = useState<Omit<SOPItem, 'id' | 'checklist'>>({
    title: '',
    sla: '< 15 Menit',
    description: '',
    responsibleRoles: []
  });
  const [sopRolesInput, setSopRolesInput] = useState('');

  // Checklist inline add
  const [newChecklistText, setNewChecklistText] = useState('');
  const [editingChecklistIdx, setEditingChecklistIdx] = useState<number | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState('');

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(shiftSchedules));
    } catch (e) {
      console.error('Save shifts error:', e);
    }
  }, [shiftSchedules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SOPS_KEY, JSON.stringify(sopList));
    } catch (e) {
      console.error('Save sops error:', e);
    }
  }, [sopList]);

  // Toggle helpers
  const toggleChecklistItem = (sopId: string, itemIdx: number) => {
    const key = `${sopId}-${itemIdx}`;
    setCompletedChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleShiftItem = (time: string) => {
    setCompletedShifts(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
  };

  // --- SHIFT SCHEDULE ACTIONS ---
  const handleOpenAddShift = () => {
    setEditingShiftIndex(null);
    setShiftForm({
      time: '08:30 - 09:30',
      label: '',
      action: '',
      assignedTo: teamData.length > 0 ? teamData[0].name : 'Admin Operasional',
      type: 'regular'
    });
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (index: number) => {
    setEditingShiftIndex(index);
    setShiftForm({ ...shiftSchedules[index] });
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.time.trim() || !shiftForm.label.trim()) return;

    if (editingShiftIndex !== null) {
      // Update
      setShiftSchedules(prev => prev.map((s, idx) => idx === editingShiftIndex ? shiftForm : s));
    } else {
      // Add new
      setShiftSchedules(prev => [...prev, shiftForm]);
    }
    setIsShiftModalOpen(false);
  };

  const handleDeleteShift = (index: number) => {
    if (confirm(`Hapus milestone shift "${shiftSchedules[index].label}"?`)) {
      setShiftSchedules(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleResetShifts = () => {
    if (confirm('Kembalikan jadwal shift ke pengaturan standar awal?')) {
      setShiftSchedules(DEFAULT_SHIFT_SCHEDULE);
      localStorage.removeItem(STORAGE_SHIFTS_KEY);
    }
  };

  // --- SOP LIBRARY ACTIONS ---
  const handleOpenAddSop = () => {
    setEditingSopId(null);
    setSopForm({
      title: '',
      sla: '< 15 Menit',
      description: '',
      responsibleRoles: []
    });
    setSopRolesInput(teamData.map(t => t.name).slice(0, 3).join(', '));
    setIsSopModalOpen(true);
  };

  const handleOpenEditSop = () => {
    if (!activeSop) return;
    setEditingSopId(activeSop.id);
    setSopForm({
      title: activeSop.title,
      sla: activeSop.sla,
      description: activeSop.description,
      responsibleRoles: activeSop.responsibleRoles
    });
    setSopRolesInput(activeSop.responsibleRoles.join(', '));
    setIsSopModalOpen(true);
  };

  const handleSaveSop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopForm.title.trim()) return;

    const parsedRoles = sopRolesInput
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (editingSopId) {
      // Update
      setSopList(prev => prev.map(s => {
        if (s.id === editingSopId) {
          return {
            ...s,
            title: sopForm.title.trim(),
            sla: sopForm.sla.trim(),
            description: sopForm.description.trim(),
            responsibleRoles: parsedRoles.length > 0 ? parsedRoles : ['Seluruh Tim']
          };
        }
        return s;
      }));
    } else {
      // Add new
      const newId = `sop-${Date.now()}`;
      const newSop: SOPItem = {
        id: newId,
        title: sopForm.title.trim(),
        sla: sopForm.sla.trim() || 'Standar',
        description: sopForm.description.trim() || 'Prosedur operasional toko online.',
        responsibleRoles: parsedRoles.length > 0 ? parsedRoles : ['Seluruh Tim'],
        checklist: ['Lakukan verifikasi awal', 'Jalankan prosedur sesuai urutan', 'Selesaikan dan laporkan hasil']
      };
      setSopList(prev => [...prev, newSop]);
      setActiveSopId(newId);
    }
    setIsSopModalOpen(false);
  };

  const handleDeleteSop = (id: string) => {
    if (sopList.length <= 1) {
      alert('Minimal harus ada 1 dokumen SOP di perpustakaan.');
      return;
    }
    const target = sopList.find(s => s.id === id);
    if (confirm(`Hapus dokumen SOP "${target?.title}"?`)) {
      const remaining = sopList.filter(s => s.id !== id);
      setSopList(remaining);
      setActiveSopId(remaining[0].id);
    }
  };

  const handleResetSops = () => {
    if (confirm('Kembalikan seluruh daftar SOP ke standar awal Balistationery?')) {
      setSopList(DEFAULT_SOPS);
      setActiveSopId(DEFAULT_SOPS[0].id);
      localStorage.removeItem(STORAGE_SOPS_KEY);
    }
  };

  // --- CHECKLIST ACTIONS ON ACTIVE SOP ---
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !activeSop) return;

    setSopList(prev => prev.map(s => {
      if (s.id === activeSop.id) {
        return {
          ...s,
          checklist: [...s.checklist, newChecklistText.trim()]
        };
      }
      return s;
    }));
    setNewChecklistText('');
  };

  const handleStartEditChecklist = (idx: number, currentText: string) => {
    setEditingChecklistIdx(idx);
    setEditingChecklistText(currentText);
  };

  const handleSaveEditChecklist = (idx: number) => {
    if (!editingChecklistText.trim() || !activeSop) return;

    setSopList(prev => prev.map(s => {
      if (s.id === activeSop.id) {
        const nextList = [...s.checklist];
        nextList[idx] = editingChecklistText.trim();
        return { ...s, checklist: nextList };
      }
      return s;
    }));
    setEditingChecklistIdx(null);
    setEditingChecklistText('');
  };

  const handleDeleteChecklistItem = (idx: number) => {
    if (!activeSop) return;
    setSopList(prev => prev.map(s => {
      if (s.id === activeSop.id) {
        return {
          ...s,
          checklist: s.checklist.filter((_, i) => i !== idx)
        };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6" id="sop-timeline">
      
      {/* 1. Daily Operational Schedule / Shift Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Section Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Jadwal Shift & Milestone Operasional Harian
              </h2>
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {shiftSchedules.length} Milestone
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ritme kerja operasional toko online mulai dari cetak nota pagi hingga cut-off ekspedisi sore (Dapat diedit & disesuaikan).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddShift}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal Shift</span>
            </button>

            <button
              type="button"
              onClick={handleResetShifts}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              title="Reset ke jadwal shift standar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shift List Container */}
        <div className="p-4 sm:p-5">
          <div className="space-y-3">
            {shiftSchedules.map((shift, idx) => {
              const isDone = !!completedShifts[shift.time];

              return (
                <div 
                  key={`${shift.time}-${idx}`}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
                    isDone 
                      ? 'bg-emerald-50/30 border-emerald-200/80' 
                      : shift.type === 'urgent'
                      ? 'bg-amber-50/30 border-amber-200/80'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleShiftItem(shift.time)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-600 text-white' 
                          : 'border border-slate-300 hover:border-indigo-600 text-slate-400'
                      }`}
                      title={isDone ? 'Tandai belum selesai' : 'Centang milestone selesai'}
                    >
                      {isDone ? '✓' : idx + 1}
                    </button>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                          {shift.time}
                        </span>
                        <h3 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {shift.label}
                        </h3>
                        {shift.type === 'urgent' && !isDone && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Prioritas Tinggi
                          </span>
                        )}
                        {shift.type === 'checkpoint' && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            Evaluasi
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {shift.action}
                      </p>
                    </div>
                  </div>

                  {/* Actions & PIC */}
                  <div className="flex items-center justify-between md:justify-end gap-3 self-stretch md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs shrink-0">
                    <span className="text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                      PIC: <strong className="text-slate-800">{shift.assignedTo}</strong>
                    </span>

                    {/* Edit & Delete Shift Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditShift(idx)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Edit milestone shift ini"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShift(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus milestone ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleShiftItem(shift.time)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isDone ? 'Terlaksana' : 'Centang'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Interactive SOP (Standard Operating Procedures) Library */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Section Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Standar Operasional Prosedur (SOP) Tim Online Balistationery
              </h2>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {sopList.length} SOP Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Panduan baku mutu penanganan pesanan, chat CS, packing resi, retur, dan live streaming (Bisa diedit & ditambah SOP baru).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddSop}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah SOP Baru</span>
            </button>

            <button
              type="button"
              onClick={handleResetSops}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              title="Reset ke daftar SOP standar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SOP Body Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* SOP List Selector (Sidebar) */}
          <div className="p-3.5 space-y-1.5 bg-slate-50/40">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Daftar Prosedur</span>
              <span>{sopList.length} Dokumen</span>
            </div>

            {sopList.map(sop => {
              const isSelected = activeSop.id === sop.id;
              return (
                <button
                  key={sop.id}
                  type="button"
                  onClick={() => setActiveSopId(sop.id)}
                  className={`w-full text-left p-3 rounded-xl transition text-xs flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white shadow-xs border border-indigo-200 text-indigo-700 font-bold'
                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="truncate">{sop.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      SLA: {sop.sla} • {sop.checklist.length} checklist
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* SOP Detail & Checklist Editor */}
          <div className="md:col-span-2 p-5 flex flex-col justify-between">
            <div>
              {/* Header of Active SOP */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {activeSop.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/70">
                      Target SLA: {activeSop.sla}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>PIC: <strong>{activeSop.responsibleRoles.join(', ')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* SOP Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleOpenEditSop}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    title="Edit judul, SLA, deskripsi & tim penanggung jawab"
                  >
                    <Pencil className="w-3 h-3 text-indigo-600" />
                    <span>Edit SOP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSop(activeSop.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus SOP ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-0.5">Ringkasan Prosedur:</span>
                {activeSop.description}
              </div>

              {/* Operational Checklist Section */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    Daftar Periksa Prosedur (Checklist Operasional):
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeSop.checklist.length} Langkah
                  </span>
                </div>

                {/* Checklist items list */}
                <div className="space-y-2">
                  {activeSop.checklist.map((item, idx) => {
                    const key = `${activeSop.id}-${idx}`;
                    const checked = !!completedChecklist[key];
                    const isEditing = editingChecklistIdx === idx;

                    return (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border text-xs transition ${
                          checked 
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-500' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChecklistItem(activeSop.id, idx)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />

                          {isEditing ? (
                            <input
                              type="text"
                              value={editingChecklistText}
                              onChange={(e) => setEditingChecklistText(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border border-indigo-300 rounded focus:outline-none bg-white"
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => toggleChecklistItem(activeSop.id, idx)}
                              className={`flex-1 cursor-pointer ${checked ? 'line-through text-slate-400' : ''}`}
                            >
                              {item}
                            </span>
                          )}
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => handleSaveEditChecklist(idx)}
                              className="px-2 py-0.5 text-[11px] font-bold text-white bg-indigo-600 rounded cursor-pointer"
                            >
                              Simpan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEditChecklist(idx, item)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer"
                              title="Edit teks butir checklist ini"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteChecklistItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Hapus butir ini"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new checklist item form */}
                <form onSubmit={handleAddChecklistItem} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="+ Tambah butir langkah periksa baru..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!newChecklistText.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </form>
              </div>

            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>SOP Balistationery • Tersimpan di Browser</span>
              <span>Diperbarui untuk efisiensi mutu & pelayanan</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL 1: EDIT / TAMBAH SHIFT --- */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingShiftIndex !== null ? 'Edit Milestone Shift' : 'Tambah Milestone Shift Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam / Rentang Waktu</label>
                <input
                  type="text"
                  required
                  value={shiftForm.time}
                  onChange={(e) => setShiftForm({ ...shiftForm, time: e.target.value })}
                  placeholder="Contoh: 08:30 - 09:30 WIB"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Milestone / Agenda</label>
                <input
                  type="text"
                  required
                  value={shiftForm.label}
                  onChange={(e) => setShiftForm({ ...shiftForm, label: e.target.value })}
                  placeholder="Contoh: Buka Toko & Cetak Resi Pagi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rincian Tindakan Operasional</label>
                <textarea
                  rows={3}
                  required
                  value={shiftForm.action}
                  onChange={(e) => setShiftForm({ ...shiftForm, action: e.target.value })}
                  placeholder="Tuliskan detail pekerjaan yang harus diselesaikan pada shift ini..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    required
                    value={shiftForm.assignedTo}
                    onChange={(e) => setShiftForm({ ...shiftForm, assignedTo: e.target.value })}
                    placeholder="Nama PIC (contoh: Bobby, Winda)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Prioritas</label>
                  <select
                    value={shiftForm.type}
                    onChange={(e) => setShiftForm({ ...shiftForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="regular">Reguler (Standard)</option>
                    <option value="urgent">Prioritas Tinggi (Urgent)</option>
                    <option value="checkpoint">Checkpoint (Evaluasi)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Simpan Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT / TAMBAH SOP --- */}
      {isSopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingSopId ? 'Edit Dokumen SOP' : 'Tambah SOP Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSopModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSop} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul SOP</label>
                <input
                  type="text"
                  required
                  value={sopForm.title}
                  onChange={(e) => setSopForm({ ...sopForm, title: e.target.value })}
                  placeholder="Contoh: SOP Penanganan Retur & Tukar Barang"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target SLA (Waktu Respon)</label>
                  <input
                    type="text"
                    required
                    value={sopForm.sla}
                    onChange={(e) => setSopForm({ ...sopForm, sla: e.target.value })}
                    placeholder="Contoh: < 5 Menit / Cut-off 15:00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (Pisahkan Koma)</label>
                  <input
                    type="text"
                    required
                    value={sopRolesInput}
                    onChange={(e) => setSopRolesInput(e.target.value)}
                    placeholder="Contoh: WINDA, PUTRI, DESAK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Prosedur Mutu</label>
                <textarea
                  rows={3}
                  required
                  value={sopForm.description}
                  onChange={(e) => setSopForm({ ...sopForm, description: e.target.value })}
                  placeholder="Tuliskan pedoman kerja operasional secara ringkas dan tegas..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSopModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Simpan Dokumen SOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
