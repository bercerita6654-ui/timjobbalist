import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        
        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          Reset ke Data Awal Bawaan?
        </h3>
        
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Semua perubahan kustom, tugas baru, dan status checklist harian akan dikembalikan ke konfigurasi standar Jobdesk Team Online (Bobby, Winda, Putri, Desak, Nazwa, Danang, Nanda).
        </p>

        <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
          >
            Ya, Reset Sekarang
          </button>
        </div>

      </div>
    </div>
  );
};
