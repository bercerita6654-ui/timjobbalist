import { CharacterAvatar, Gender } from '../types/jobdesk';

export const CHARACTER_AVATARS: CharacterAvatar[] = [
  // --- MALE CHARACTERS ---
  {
    id: 'male-leader',
    name: 'Bobby (Leader)',
    gender: 'male',
    roleTag: 'Team Leader',
    avatarBg: 'bg-indigo-600',
    badge: '👑 Leader'
  },
  {
    id: 'male-packing',
    name: 'Danang (Logistik)',
    gender: 'male',
    roleTag: 'Spesialis Packing Reguler',
    avatarBg: 'bg-cyan-600',
    badge: '📦 Packing'
  },
  {
    id: 'male-nota',
    name: 'Nanda (Nota)',
    gender: 'male',
    roleTag: 'Fulfillment Nota & Dokumen',
    avatarBg: 'bg-blue-600',
    badge: '🧾 Nota'
  },
  {
    id: 'male-admin',
    name: 'Rian (Admin AIO)',
    gender: 'male',
    roleTag: 'Admin Marketplace & IT',
    avatarBg: 'bg-emerald-600',
    badge: '💻 Admin'
  },
  {
    id: 'male-creative',
    name: 'Aldi (Host Pria)',
    gender: 'male',
    roleTag: 'Host Live & Konten Kreatif',
    avatarBg: 'bg-purple-600',
    badge: '🎙️ Live'
  },

  // --- FEMALE CHARACTERS ---
  {
    id: 'female-admin',
    name: 'Winda (Senior Admin)',
    gender: 'female',
    roleTag: 'Keuangan, CS & Host Live',
    avatarBg: 'bg-rose-500',
    badge: '⭐ Keuangan'
  },
  {
    id: 'female-katalog',
    name: 'Putri (CS & Katalog)',
    gender: 'female',
    roleTag: 'Admin CS & Manajemen Produk',
    avatarBg: 'bg-purple-500',
    badge: '🏷️ Katalog'
  },
  {
    id: 'female-live',
    name: 'Desak (CS & Live)',
    gender: 'female',
    roleTag: 'Host Live Streaming & Instan',
    avatarBg: 'bg-pink-500',
    badge: '✨ Host Live'
  },
  {
    id: 'female-packing',
    name: 'Nazwa (Nota & Packing)',
    gender: 'female',
    roleTag: 'Admin CS & Logistik Packing',
    avatarBg: 'bg-amber-500',
    badge: '🎁 Fulfillment'
  },
  {
    id: 'female-finance',
    name: 'Citra (Keuangan)',
    gender: 'female',
    roleTag: 'Spesialis Rekonsiliasi & Kas',
    avatarBg: 'bg-teal-600',
    badge: '📊 Finansial'
  }
];

export function getAvatarById(avatarId: string): CharacterAvatar {
  return CHARACTER_AVATARS.find(a => a.id === avatarId) || CHARACTER_AVATARS[0];
}
