import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { TeamMember, ThemeColor, Gender } from '../types/jobdesk';
import { THEME_CONFIG } from '../data/defaultData';
import { CHARACTER_AVATARS } from '../data/characterAvatars';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: Omit<TeamMember, 'id'>) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [avatarId, setAvatarId] = useState<string>('male-leader');
  const [theme, setTheme] = useState<ThemeColor>('indigo');
  const [initialTask, setInitialTask] = useState('Mencetak nota instan dan reguler');

  if (!isOpen) return null;

  const handleGenderChange = (g: Gender) => {
    setGender(g);
    const available = CHARACTER_AVATARS.filter(a => a.gender === g);
    setAvatarId(available[0]?.id || (g === 'female' ? 'female-admin' : 'male-leader'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim().toUpperCase(),
      role: role.trim().toUpperCase() || 'STAFF OPERASIONAL',
      badge: 'Team Member',
      theme,
      gender,
      avatarId,
      tasks: initialTask.trim() ? [
        {
          id: `t-${Date.now()}`,
          text: initialTask.trim(),
          category: 'Nota & Keuangan',
          priority: 'High',
          completed: false
        }
      ] : []
    });

    setName('');
    setRole('');
    setInitialTask('Mencetak nota instan dan reguler');
    onClose();
  };

  const availableAvatars = CHARACTER_AVATARS.filter(a => a.gender === gender);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Personel Baru
              </h3>
              <p className="text-xs text-slate-500">
                Pilih nama, peran, gender dan karakter avatar tim
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Jenis Kelamin (Gender)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  gender === 'male'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👨 Pria (Laki-laki)</span>
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  gender === 'female'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👩 Wanita (Perempuan)</span>
              </button>
            </div>
          </div>

          {/* Character Avatar Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pilih Profil Karakter ({gender === 'male' ? 'Pria' : 'Wanita'})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableAvatars.map(av => {
                const isSelected = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarId(av.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CharacterAvatarIcon avatarId={av.id} gender={gender} size="sm" />
                    <div className="truncate flex-1">
                      <div className="text-[11px] font-bold text-slate-900 truncate">{av.name}</div>
                      <div className="text-[9px] text-slate-500 truncate">{av.roleTag}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Personel
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: RIZKY"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          {/* Role Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Jabatan / Peran
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: ADMIN MARKETPLACE & CS"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          {/* Initial Task Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tugas Pertama (Jobdesk Awal)
            </label>
            <input
              type="text"
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              placeholder="Deskripsi tugas pertama..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pilihan Warna Kartu
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(THEME_CONFIG) as ThemeColor[]).map((col) => {
                const conf = THEME_CONFIG[col];
                const isSelected = theme === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setTheme(col)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-slate-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: conf.hex }}
                    />
                    <span className="text-[10px] font-semibold text-slate-700 capitalize">
                      {col}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

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
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg shadow-xs transition"
            >
              Simpan Personel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
