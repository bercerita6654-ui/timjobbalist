import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  CheckSquare, 
  Square, 
  LayoutGrid, 
  GitFork, 
  Table2, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';
import { TeamMember, ShiftSchedule, SOPItem } from '../types/jobdesk';
import { PDFExportSectionOptions, exportComprehensiveMasterPDF } from '../utils/exportUtils';
import { DEFAULT_SHIFT_SCHEDULE, DEFAULT_SOPS } from '../data/defaultData';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamData: TeamMember[];
  docTitle: string;
  docSubtitle: string;
  shifts?: ShiftSchedule[];
  sops?: SOPItem[];
  onSuccessToast: (msg: string) => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  teamData,
  docTitle,
  docSubtitle,
  shifts = DEFAULT_SHIFT_SCHEDULE,
  sops = DEFAULT_SOPS,
  onSuccessToast
}) => {
  const [sections, setSections] = useState<PDFExportSectionOptions>({
    includeCards: true,
    includeStructure: true,
    includeSpreadsheet: true,
    includeMatrix: true,
    includeSopSchedule: true
  });

  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (key: keyof PDFExportSectionOptions) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = () => {
    setSections({
      includeCards: true,
      includeStructure: true,
      includeSpreadsheet: true,
      includeMatrix: true,
      includeSopSchedule: true
    });
  };

  const selectJobdeskOnly = () => {
    setSections({
      includeCards: true,
      includeStructure: true,
      includeSpreadsheet: true,
      includeMatrix: true,
      includeSopSchedule: false
    });
  };

  const selectSopShiftOnly = () => {
    setSections({
      includeCards: false,
      includeStructure: false,
      includeSpreadsheet: false,
      includeMatrix: false,
      includeSopSchedule: true
    });
  };

  const selectedCount = Object.values(sections).filter(Boolean).length;

  const handleDownload = async () => {
    if (selectedCount === 0) return;

    try {
      setIsGenerating(true);
      const safeTitle = (docTitle || 'Balistationery').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = selectedCount === 5 
        ? `${safeTitle}_Master_Semua_Data_Lengkap.pdf`
        : `${safeTitle}_Kompilasi_Pilihan.pdf`;

      // Read current shifts and sops from localStorage if present
      let currentShifts = shifts;
      try {
        const savedShifts = localStorage.getItem('jobdesk_shifts_v2');
        if (savedShifts) currentShifts = JSON.parse(savedShifts);
      } catch (e) {
        console.warn('Shift read error:', e);
      }

      let currentSops = sops;
      try {
        const savedSops = localStorage.getItem('jobdesk_sops_v2');
        if (savedSops) currentSops = JSON.parse(savedSops);
      } catch (e) {
        console.warn('SOP read error:', e);
      }

      await exportComprehensiveMasterPDF(
        teamData,
        docTitle,
        docSubtitle,
        sections,
        currentShifts,
        currentSops,
        filename
      );

      onSuccessToast('File PDF komprehensif berhasil diunduh!');
      onClose();
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Gagal mengunduh PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Unduh Master PDF Terpadu (Semua Komponen)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kompilasi seluruh modul operasional Balistationery ke dalam 1 file PDF A4 siap cetak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Pilihan Preset Cepat:
              </span>
              <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">
                {selectedCount} dari 5 Bagian Terpilih
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={selectAll}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  selectedCount === 5 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-bold' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✓ Semua Komponen (1 PDF)
              </button>
              <button
                type="button"
                onClick={selectJobdeskOnly}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
              >
                Hanya Jobdesk & RACI
              </button>
              <button
                type="button"
                onClick={selectSopShiftOnly}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
              >
                Hanya SOP & Shift
              </button>
            </div>
          </div>

          {/* Section Selection Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Pilih Bagian yang Ingin Dimasukkan ke Dokumen:
            </span>

            {/* 1. Visual Cards */}
            <div 
              onClick={() => toggleSection('includeCards')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                sections.includeCards 
                  ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs' 
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {sections.includeCards ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    1. Profil & Kartu Visual Personel Tim
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Profil anggota tim, avatar, jabatan, kompetensi, dan daftar lengkap tugas per individu beserta badge prioritas.
                </p>
              </div>
            </div>

            {/* 2. Structure Graph */}
            <div 
              onClick={() => toggleSection('includeStructure')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                sections.includeStructure 
                  ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs' 
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {sections.includeStructure ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    2. Struktur Organisasi & Alur Komando Balistationery
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bagan hierarki toko online: Pusat Balistationery, Koordinator Tim Online, dan alur penugasan 4 divisi operasional.
                </p>
              </div>
            </div>

            {/* 3. Spreadsheet */}
            <div 
              onClick={() => toggleSection('includeSpreadsheet')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                sections.includeSpreadsheet 
                  ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs' 
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {sections.includeSpreadsheet ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Table2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    3. Tabel Data Spreadsheet Lengkap
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tabel data menyeluruh seluruh rincian tugas operasional, divisi, tingkat prioritas (High, Med, Low), dan status.
                </p>
              </div>
            </div>

            {/* 4. RACI Matrix & Backup */}
            <div 
              onClick={() => toggleSection('includeMatrix')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                sections.includeMatrix 
                  ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs' 
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {sections.includeMatrix ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    4. Matriks Distribusi Tanggung Jawab (RACI) & Backup Tim
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Penegasan Tugas Utama (⭐ PIC Utama) dan Petugas Cadangan (🛡️ Backup) jika personel utama absen/berhalangan.
                </p>
              </div>
            </div>

            {/* 5. SOP & Shift Schedule */}
            <div 
              onClick={() => toggleSection('includeSopSchedule')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                sections.includeSopSchedule 
                  ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs' 
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {sections.includeSopSchedule ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    5. Jadwal Shift & Perpustakaan Standar Prosedur (SOP)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Milestone jam kerja (08:30 - 17:30 WIB) serta 5 dokumen SOP baku (Chat CS, Cetak Nota, Packing, Retur, Live Streaming).
                </p>
              </div>
            </div>

          </div>

          {/* Document Note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
            <span className="text-base">📄</span>
            <span>
              Format A4 Standar Resmi dengan Kop <strong>Balistationery</strong>, penomoran halaman otomatis, dan resolusi tajam vector.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={selectedCount === 0 || isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
            <span>
              {isGenerating ? 'Menyusun Dokumen PDF...' : `Unduh ${selectedCount} Bagian dalam 1 PDF`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
