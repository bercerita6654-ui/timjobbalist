import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Database, 
  Upload, 
  UserPlus, 
  RotateCcw, 
  Save, 
  Check, 
  ChevronDown,
  RefreshCw,
  ExternalLink,
  LogIn,
  LogOut,
  User as UserIcon,
  CloudCheck,
  Sparkles,
  Download,
  MessageSquare
} from 'lucide-react';
import { User } from 'firebase/auth';
import { TeamMember } from '../types/jobdesk';
import { exportToCSV, exportToWord, exportToJSON } from '../utils/exportUtils';
import { SPREADSHEET_URL, SPREADSHEET_ID } from '../services/googleSheetsService';

interface HeaderProps {
  title: string;
  subtitle: string;
  onUpdateTitle: (title: string) => void;
  onUpdateSubtitle: (subtitle: string) => void;
  teamData: TeamMember[];
  onOpenAddModal: () => void;
  onOpenResetModal: () => void;
  onOpenImportModal: () => void;
  onSave: () => void;
  lastSavedAt: Date | null;
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onSyncGoogleSheets: () => void;
  onPullGoogleSheets: () => void;
  isSyncingSheets: boolean;
  sheetsSyncSuccess: boolean;
  onOpenNotesPanel: () => void;
  totalNotesCount: number;
  onExportViewPDF: () => void;
  onExportFullReportPDF: () => void;
  onOpenExportPdfModal: () => void;
  isExportingPDF?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onUpdateTitle,
  onUpdateSubtitle,
  teamData,
  onOpenAddModal,
  onOpenResetModal,
  onOpenImportModal,
  onSave,
  lastSavedAt,
  currentUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncGoogleSheets,
  onPullGoogleSheets,
  isSyncingSheets,
  sheetsSyncSuccess,
  onOpenNotesPanel,
  totalNotesCount,
  onExportViewPDF,
  onExportFullReportPDF,
  onOpenExportPdfModal,
  isExportingPDF
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
      
      {/* Top Bar Zone: Brand | Google Sheets Status | Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              JO
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base leading-tight tracking-tight whitespace-nowrap">
                Jobdesk Ops
              </span>
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                Manajemen Tim & SOP E-Commerce
              </span>
            </div>
          </div>

          {/* Google Sheets Sync & User Center */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            
            {/* Google Sheets Status Banner */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="truncate max-w-[200px] md:max-w-xs">
                <span className="font-semibold">Spreadsheet:</span>{' '}
                <span className="text-emerald-700 font-mono text-[11px]">10Vpsulp...</span>
              </div>
              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded hover:bg-emerald-100 transition"
                title="Buka Spreadsheet di Google Docs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Sync Now button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onSyncGoogleSheets}
                  disabled={isSyncingSheets}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-xs transition whitespace-nowrap"
                  title="Simpan data saat ini ke masing-masing sheet spreadsheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">Simpan ke Spreadsheet</span>
                  <span className="md:hidden">Simpan</span>
                </button>

                <button
                  type="button"
                  onClick={onPullGoogleSheets}
                  disabled={isSyncingSheets}
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-xl transition whitespace-nowrap"
                  title="Tarik data terbaru dari Spreadsheet"
                >
                  Tarik Data
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun Google & Sinkron</span>
              </button>
            )}

            {/* User Profile or Logout */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold px-2 py-1 bg-slate-100 rounded-lg max-w-[140px] truncate">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.displayName || currentUser.email}</span>
                </div>
                <button
                  onClick={onGoogleSignOut}
                  title="Keluar dari akun Google"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Team Notes / Chat Button */}
            <button
              type="button"
              onClick={onOpenNotesPanel}
              className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition shadow-2xs whitespace-nowrap cursor-pointer"
              title="Buka panel catatan & diskusi tim"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Catatan Tim</span>
              {totalNotesCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {totalNotesCount}
                </span>
              )}
            </button>

            {/* Quick Add Member Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Personel</span>
            </button>

            {/* Comprehensive Master PDF Button */}
            <button
              type="button"
              onClick={onOpenExportPdfModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition whitespace-nowrap cursor-pointer border border-slate-700"
              title="Unduh semua data: Kartu visual, Struktur grafik, Spreadsheet, Matriks RACI, SOP & Shift dalam 1 PDF"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Unduh Semua (1 PDF)</span>
              <span className="sm:hidden">1 PDF</span>
            </button>

            {/* Export Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-xl border border-slate-200 transition whitespace-nowrap cursor-pointer"
              >
                <span>Format Lain</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {exportOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setExportOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    
                    {/* Master PDF Option */}
                    <div className="px-3.5 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/50 flex items-center justify-between">
                      <span>Dokumen Terpadu</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">Recommended</span>
                    </div>

                    <button
                      onClick={() => {
                        onOpenExportPdfModal();
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition text-left cursor-pointer border-b border-slate-100"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-slate-900">
                          <span>Unduh Semua Komponen (1 PDF)</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Kartu, Struktur, Spreadsheet, RACI & SOP Shift</div>
                      </div>
                    </button>

                    {/* PDF Section Header */}
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      Pilihan PDF Lainnya
                    </div>

                    <button
                      onClick={() => {
                        onExportViewPDF();
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>Unduh PDF Tampilan Aktif (.PDF)</span>
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">A4</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Layout tab aktif saat ini</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onExportFullReportPDF();
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>Unduh Laporan Lengkap (.PDF)</span>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-bold">Resmi</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Tabel lengkap seluruh divisi & catatan</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handlePrint();
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600 shrink-0" />
                      <div>
                        <div className="font-semibold">Cetak / Dialog Print</div>
                        <div className="text-[10px] text-slate-400">Print dialog sistem browser (Ctrl+P)</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100" />
                    
                    {/* Data Section Header */}
                    <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Format Data Lainnya
                    </div>

                    <button
                      onClick={() => {
                        exportToCSV(teamData);
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold">Spreadsheet (CSV)</div>
                        <div className="text-[10px] text-slate-400">Kompatibel dengan Microsoft Excel</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        exportToWord(teamData, title, subtitle);
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-semibold">Dokumen Word (.DOC)</div>
                        <div className="text-[10px] text-slate-400">Format rapi dengan tabel & header</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        exportToJSON(teamData, title, subtitle);
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left"
                    >
                      <Database className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-semibold">Cadangan Data (JSON)</div>
                        <div className="text-[10px] text-slate-400">Arsip lengkap struktur tim</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        onOpenImportModal();
                        setExportOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition text-left"
                    >
                      <Upload className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-semibold">Impor Data CSV</div>
                        <div className="text-[10px] text-slate-400">Unggah file data jobdesk</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Manual Save Button */}
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simpan</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onOpenResetModal}
              title="Kembalikan ke data awal bawaan"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subheader: Clean Document Title */}
      <div className="border-t border-slate-100 bg-slate-50/70 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => onUpdateTitle(e.target.value)}
                  className="text-base font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                />
                <button 
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 text-slate-600 hover:text-emerald-600"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h1 
                onClick={() => setIsEditingTitle(true)}
                title="Klik untuk mengubah judul dokumen"
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 cursor-pointer hover:text-indigo-600 transition"
              >
                {title}
              </h1>
            )}

            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
            <span>📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
