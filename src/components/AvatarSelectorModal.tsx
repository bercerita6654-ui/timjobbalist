import React, { useState } from 'react';
import { X, Check, Sparkles, User, Users } from 'lucide-react';
import { CharacterAvatar, Gender, TeamMember } from '../types/jobdesk';
import { CHARACTER_AVATARS } from '../data/characterAvatars';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSelectAvatar: (memberId: string, gender: Gender, avatarId: string) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  member,
  onSelectAvatar
}) => {
  const [activeGender, setActiveGender] = useState<Gender>(member?.gender || 'male');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(member?.avatarId || 'male-leader');

  if (!isOpen || !member) return null;

  const handleGenderTabChange = (g: Gender) => {
    setActiveGender(g);
    // Auto-pick first avatar of that gender if current doesn't match
    const avatarsOfGender = CHARACTER_AVATARS.filter(a => a.gender === g);
    if (!avatarsOfGender.some(a => a.id === selectedAvatarId)) {
      setSelectedAvatarId(avatarsOfGender[0]?.id || (g === 'female' ? 'female-admin' : 'male-leader'));
    }
  };

  const handleSave = () => {
    onSelectAvatar(member.id, activeGender, selectedAvatarId);
    onClose();
  };

  const filteredAvatars = CHARACTER_AVATARS.filter(a => a.gender === activeGender);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                Pilih Karakter Profil & Gender
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan avatar karakter untuk <strong className="text-slate-800">{member.name}</strong> ({member.role})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gender Selection Tabs */}
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Pilih Jenis Kelamin (Gender):
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleGenderTabChange('male')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
                activeGender === 'male'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨 Karakter Pria (Laki-laki)</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderTabChange('female')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
                activeGender === 'female'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩 Karakter Wanita (Perempuan)</span>
            </button>
          </div>
        </div>

        {/* Avatar Grid Selection */}
        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Pilihan Avatar Gaya Karakter:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredAvatars.map(avatar => {
              const isSelected = selectedAvatarId === avatar.id;

              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CharacterAvatarIcon
                    avatarId={avatar.id}
                    gender={avatar.gender}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {avatar.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {avatar.roleTag}
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {avatar.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg shadow-xs transition"
          >
            Terapkan Karakter
          </button>
        </div>

      </div>
    </div>
  );
};
