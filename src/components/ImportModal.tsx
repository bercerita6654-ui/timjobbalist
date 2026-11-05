import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { TeamMember } from '../types/jobdesk';
import { parseCSV } from '../utils/exportUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newMembers: TeamMember[], mode: 'replace' | 'append') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [parsedData, setParsedData] = useState<TeamMember[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const members = parseCSV(text);
        if (members.length === 0) {
          setErrorMsg('File CSV tidak memiliki data yang valid atau format baris tidak sesuai.');
          setParsedData([]);
        } else {
          setParsedData(members);
        }
      } catch (err) {
        setErrorMsg('Gagal membaca isi file CSV. Pastikan format teks terpisah koma.');
        setParsedData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImport(parsedData, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Impor File Spreadsheet CSV
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4 space-y-4">
          
          {/* File Upload Drop Zone */}
          <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition">
            <FileSpreadsheet className="w-8 h-8 text-teal-600 mb-2" />
            <span className="text-xs font-bold text-slate-700">
              {fileName || 'Pilih atau Tarik File CSV ke Sini'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Format: No, Nama Personel, Jabatan, Deskripsi Tugas, Kategori
            </span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview of Parsed Data */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Data Berhasil Dibaca:</span>
                <span className="font-mono text-indigo-600">
                  {parsedData.length} Personel ({parsedData.reduce((acc, m) => acc + m.tasks.length, 0)} Tugas)
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {parsedData.map((m, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between hover:bg-slate-50">
                    <span className="font-bold text-slate-800">{m.name}</span>
                    <span className="text-slate-500 font-mono">{m.tasks.length} item tugas</span>
                  </div>
                ))}
              </div>

              {/* Import Mode Radio */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Metode Penerapan Data:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition ${
                      importMode === 'replace'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Gantikan Data Lama (Replace)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition ${
                      importMode === 'append'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Gabungkan ke Data Lama (Merge)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-xs transition"
            >
              Terapkan Impor CSV
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
