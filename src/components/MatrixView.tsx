import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Minus, 
  Plus, 
  Info, 
  Star, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Receipt, 
  MessageSquare, 
  Package, 
  Video, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { TeamMember, TaskCategory } from '../types/jobdesk';
import { THEME_CONFIG, CATEGORIES, CATEGORY_STYLES } from '../data/defaultData';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface MatrixViewProps {
  teamData: TeamMember[];
  onAddTask?: (memberId: string, taskText: string, category?: TaskCategory) => void;
  onDeleteTask?: (memberId: string, taskId: string) => void;
  onOpenAvatarModal?: (member: TeamMember) => void;
}

export type RaciRole = 'utama' | 'backup' | 'none';

export interface RaciCompetency {
  id: string;
  label: string;
  category: TaskCategory;
  description: string;
  sla: string;
  defaultUtama: string[]; // Member names or IDs
  defaultBackup: string[]; // Member names or IDs
}

export const DETAILED_COMPETENCIES: RaciCompetency[] = [
  { 
    id: 'comp-1',
    label: 'Upload & Cek Produk Marketplace / SKU', 
    category: 'Manajemen & Katalog',
    description: 'Pembuatan SKU baru, penulisan deskripsi ATK, cek varian warna/ukuran, dan sinkronisasi stok AIO System.',
    sla: 'Harian (Maks 24 jam)',
    defaultUtama: ['BOBBY', 'PUTRI'],
    defaultBackup: ['WINDA']
  },
  { 
    id: 'comp-2',
    label: 'Update Desain Cover & Banner Marketplace', 
    category: 'Manajemen & Katalog',
    description: 'Pembuatan visual cover etalase promosi, banner flash sale, dan banner campaign musiman toko.',
    sla: '2x Seminggu / Event Promo',
    defaultUtama: ['BOBBY'],
    defaultBackup: ['PUTRI']
  },
  { 
    id: 'comp-3',
    label: 'Setting Campaign Marketplace (Flash Sale & Voucher)', 
    category: 'Manajemen & Katalog',
    description: 'Pendaftaran promosi toko, voucher diskon, broadcast pesan promosi pembeli, dan boost etalase.',
    sla: 'Sesuai Kalender Promo',
    defaultUtama: ['BOBBY'],
    defaultBackup: ['WINDA']
  },
  { 
    id: 'comp-4',
    label: 'Mencetak Nota Instan (Grab, Gojek, SPX Instan)', 
    category: 'Nota & Keuangan',
    description: 'Cetak nota penjualan cepat untuk pesanan same-day / instan, validasi pembayaran, dan serah ke packing.',
    sla: 'SLA < 15 Menit',
    defaultUtama: ['NAZWA', 'DESAK'],
    defaultBackup: ['NANDA', 'WINDA']
  },
  { 
    id: 'comp-5',
    label: 'Mencetak & Rekap Nota Reguler (J&T, SiCepat, SPX)', 
    category: 'Nota & Keuangan',
    description: 'Pencetakan resi dan nota pesanan reguler, verifikasi alamat, dan cross-check item produk ATK.',
    sla: 'Cutoff Harian 16:00 WIB',
    defaultUtama: ['NANDA'],
    defaultBackup: ['NAZWA', 'WINDA']
  },
  { 
    id: 'comp-6',
    label: 'Membuat Pelunasan & Rekonsiliasi Kas Toko', 
    category: 'Nota & Keuangan',
    description: 'Pencocokan mutasi uang kas masuk, transfer bank, pencatatan biaya operasional, dan closing kasir.',
    sla: 'Akhir Shift (18:00 WIB)',
    defaultUtama: ['WINDA'],
    defaultBackup: ['NAZWA', 'BOBBY']
  },
  { 
    id: 'comp-7',
    label: 'Membalas Chat WA & Marketplace (SLA < 5 min)', 
    category: 'CS & Chat',
    description: 'Menjawab pertanyaan ketersediaan alat tulis, spesifikasi item, negosiasi kuantiti grosir, dan konsultasi produk.',
    sla: 'Response Time < 5 Menit',
    defaultUtama: ['PUTRI', 'DESAK', 'NAZWA'],
    defaultBackup: ['WINDA', 'BOBBY']
  },
  { 
    id: 'comp-8',
    label: 'Menangani Komplain Customer & Solusi Retur', 
    category: 'CS & Chat',
    description: 'Validasi bukti unboxing, solusi barang rusak/kurang kirim, penukaran barang, dan koordinasi dengan ekspedisi.',
    sla: 'Resolusi < 2 Jam',
    defaultUtama: ['WINDA', 'DESAK'],
    defaultBackup: ['BOBBY']
  },
  { 
    id: 'comp-9',
    label: 'Picking & Packing Pesanan Reguler (Bubble Wrap / Dus)', 
    category: 'Packing & Logistik',
    description: 'Pengambilan barang dari rak gudang, pembungkusan bubble wrap sesuai standar item rentan/cair, dan packing dus.',
    sla: 'Cutoff 16:30 WIB',
    defaultUtama: ['DANANG'],
    defaultBackup: ['PUTRI', 'NAZWA']
  },
  { 
    id: 'comp-10',
    label: 'Packing Kilat Pesanan Instan / Same-Day', 
    category: 'Packing & Logistik',
    description: 'Pengemasan prioritas kecepatan untuk pesanan kilat GoSend/GrabExpress agar kurir tidak menunggu lama di toko.',
    sla: 'Siap Pickup < 20 Menit',
    defaultUtama: ['DESAK', 'DANANG'],
    defaultBackup: ['PUTRI', 'BOBBY']
  },
  { 
    id: 'comp-11',
    label: 'Mereturn Barang Cacat & Rinci Stok Kosong', 
    category: 'Packing & Logistik',
    description: 'Pemisahan item cacat dari distributor, pencatatan barang rusak, dan koordinasi matikan stok di etalase.',
    sla: 'Pukul 14:00 WIB',
    defaultUtama: ['DANANG', 'PUTRI'],
    defaultBackup: ['BOBBY']
  },
  { 
    id: 'comp-12',
    label: 'Handover Ekspedisi & Manifest Kurir Penjemputan', 
    category: 'Packing & Logistik',
    description: 'Scan barcode resi driver kurir J&T, SiCepat, SPX, penghitungan jumlah paket, dan penandatanganan manifest.',
    sla: '16:30 - 18:00 WIB',
    defaultUtama: ['DANANG', 'BOBBY'],
    defaultBackup: ['NANDA']
  },
  { 
    id: 'comp-13',
    label: 'Host Live Streaming Marketplace & TikTok Shop', 
    category: 'Live Streaming',
    description: 'Siaran langsung promosi produk stationery, demonstrasi alat tulis, interaksi audiens, dan pemicu checkout keranjang.',
    sla: 'Slot 11:00 & 19:30 WIB',
    defaultUtama: ['WINDA', 'DESAK'],
    defaultBackup: ['PUTRI']
  },
  { 
    id: 'comp-14',
    label: 'Persiapan Sampel & Setting Etalase Sesi Live', 
    category: 'Live Streaming',
    description: 'Penataan lighting, sampel fisik ATK yang dispill, setting harga promo khusus live, dan cek koneksi audio-video.',
    sla: '30 Menit Sebelum Live',
    defaultUtama: ['DESAK', 'PUTRI'],
    defaultBackup: ['WINDA']
  }
];

const STORAGE_RACI_KEY = 'jobdesk_raci_assignments_v3';

export const MatrixView: React.FC<MatrixViewProps> = ({
  teamData,
  onAddTask,
  onDeleteTask,
  onOpenAvatarModal
}) => {
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'optimal' | 'no-backup' | 'no-utama'>('all');

  // Absence / Simulator State: "Jika anggota ini tidak masuk / cuti / sakit"
  const [simulatedAbsentMemberId, setSimulatedAbsentMemberId] = useState<string>('none');

  // Active cell popover for changing role
  const [activeCellPopover, setActiveCellPopover] = useState<{
    compId: string;
    memberId: string;
  } | null>(null);

  // Initialize RACI Assignments
  const [assignments, setAssignments] = useState<Record<string, Record<string, RaciRole>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RACI_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Gagal memuat raci matrix:', e);
    }

    // Default intelligent mapping from DETAILED_COMPETENCIES
    const initMap: Record<string, Record<string, RaciRole>> = {};
    DETAILED_COMPETENCIES.forEach(comp => {
      initMap[comp.id] = {};
      teamData.forEach(member => {
        const memNameUpper = member.name.toUpperCase();
        if (comp.defaultUtama.some(u => memNameUpper.includes(u))) {
          initMap[comp.id][member.id] = 'utama';
        } else if (comp.defaultBackup.some(b => memNameUpper.includes(b))) {
          initMap[comp.id][member.id] = 'backup';
        } else {
          initMap[comp.id][member.id] = 'none';
        }
      });
    });
    return initMap;
  });

  // Save to localStorage
  const saveAssignments = (newAssignments: Record<string, Record<string, RaciRole>>) => {
    try {
      localStorage.setItem(STORAGE_RACI_KEY, JSON.stringify(newAssignments));
    } catch {
      // ignore
    }
  };

  // Change a member's role on a competency
  const setMemberRole = (compId: string, memberId: string, role: RaciRole) => {
    setAssignments(prev => {
      const next = {
        ...prev,
        [compId]: {
          ...(prev[compId] || {}),
          [memberId]: role
        }
      };
      saveAssignments(next);
      return next;
    });
    setActiveCellPopover(null);
  };

  // Quick toggle on click: none -> utama -> backup -> none
  const handleQuickToggle = (compId: string, memberId: string) => {
    const current = assignments[compId]?.[memberId] || 'none';
    let nextRole: RaciRole = 'none';
    if (current === 'none') nextRole = 'utama';
    else if (current === 'utama') nextRole = 'backup';
    else nextRole = 'none';

    setMemberRole(compId, memberId, nextRole);
  };

  // Reset to default standard assignments
  const handleResetToDefault = () => {
    const initMap: Record<string, Record<string, RaciRole>> = {};
    DETAILED_COMPETENCIES.forEach(comp => {
      initMap[comp.id] = {};
      teamData.forEach(member => {
        const memNameUpper = member.name.toUpperCase();
        if (comp.defaultUtama.some(u => memNameUpper.includes(u))) {
          initMap[comp.id][member.id] = 'utama';
        } else if (comp.defaultBackup.some(b => memNameUpper.includes(b))) {
          initMap[comp.id][member.id] = 'backup';
        } else {
          initMap[comp.id][member.id] = 'none';
        }
      });
    });
    setAssignments(initMap);
    saveAssignments(initMap);
    setSimulatedAbsentMemberId('none');
  };

  // Filtered competencies
  const filteredCompetencies = useMemo(() => {
    return DETAILED_COMPETENCIES.filter(comp => {
      // Category filter
      if (selectedCategory !== 'ALL' && comp.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLabel = comp.label.toLowerCase().includes(q);
        const matchDesc = comp.description.toLowerCase().includes(q);
        const matchCat = comp.category.toLowerCase().includes(q);
        if (!matchLabel && !matchDesc && !matchCat) return false;
      }

      // Status filter
      const compAssignments = assignments[comp.id] || {};
      const utamaMembers = teamData.filter(m => compAssignments[m.id] === 'utama');
      const backupMembers = teamData.filter(m => compAssignments[m.id] === 'backup');

      if (statusFilter === 'optimal') {
        return utamaMembers.length > 0 && backupMembers.length > 0;
      }
      if (statusFilter === 'no-backup') {
        return utamaMembers.length > 0 && backupMembers.length === 0;
      }
      if (statusFilter === 'no-utama') {
        return utamaMembers.length === 0;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, statusFilter, assignments, teamData]);

  // Overall Statistics
  const stats = useMemo(() => {
    let optimal = 0;
    let noBackup = 0;
    let noUtama = 0;

    DETAILED_COMPETENCIES.forEach(comp => {
      const compAssignments = assignments[comp.id] || {};
      const utamaCount = teamData.filter(m => compAssignments[m.id] === 'utama').length;
      const backupCount = teamData.filter(m => compAssignments[m.id] === 'backup').length;

      if (utamaCount === 0) {
        noUtama++;
      } else if (backupCount === 0) {
        noBackup++;
      } else {
        optimal++;
      }
    });

    return {
      total: DETAILED_COMPETENCIES.length,
      optimal,
      noBackup,
      noUtama
    };
  }, [assignments, teamData]);

  const absentMember = teamData.find(m => m.id === simulatedAbsentMemberId);

  return (
    <div className="space-y-6" id="matrix-view">
      
      {/* 1. Header & Summary Statistics Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* Top Title & Reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                Matriks Pembagian Peran Operasional (RACI Balistationery)
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {teamData.length} Personel Terdaftar
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              Matriks Distribusi Tanggung Jawab Tim (Utama & Backup)
            </h2>
            
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Pemetaan pembagian tugas operasional harian: menentukan <strong>Penanggung Jawab Utama (★ UTAMA)</strong> dan <strong>Petugas Cadangan (🛡 BACKUP)</strong>. Dilengkapi simulasi kesiapan operasional jika ada personel yang berhalangan atau tidak masuk kerja.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition shadow-2xs cursor-pointer"
              title="Kembalikan konfigurasi matriks ke rekomendasi standar operasional Balistationery"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Standar Rekomendasi</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-slate-100">
          
          <div 
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Total Tanggung Jawab</span>
              <Layers className={`w-4 h-4 ${statusFilter === 'all' ? 'text-indigo-300' : 'text-slate-400'}`} />
            </div>
            <div className="text-2xl font-black font-mono mt-1 tabular-nums">
              {stats.total}
            </div>
            <span className={`text-[10px] ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              Semua kompetensi harian
            </span>
          </div>

          <div 
            onClick={() => setStatusFilter('optimal')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'optimal' 
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' 
                : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Aman / Lengkap</span>
              <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'optimal' ? 'text-emerald-200' : 'text-emerald-600'}`} />
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-emerald-600 tabular-nums">
              <span className={statusFilter === 'optimal' ? 'text-white' : ''}>{stats.optimal}</span>
            </div>
            <span className={`text-[10px] ${statusFilter === 'optimal' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Ada PIC Utama & Ada Backup
            </span>
          </div>

          <div 
            onClick={() => setStatusFilter('no-backup')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'no-backup' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                : 'bg-amber-50/70 border-amber-200 hover:border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Tanpa Backup (Rawan)</span>
              <AlertTriangle className={`w-4 h-4 ${statusFilter === 'no-backup' ? 'text-amber-200' : 'text-amber-600'}`} />
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-amber-600 tabular-nums">
              <span className={statusFilter === 'no-backup' ? 'text-white' : ''}>{stats.noBackup}</span>
            </div>
            <span className={`text-[10px] ${statusFilter === 'no-backup' ? 'text-amber-100' : 'text-amber-700'}`}>
              Beresiko macet jika utama izin
            </span>
          </div>

          <div 
            onClick={() => setStatusFilter('no-utama')}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'no-utama' 
                ? 'bg-rose-700 text-white border-rose-700 shadow-sm' 
                : 'bg-rose-50/70 border-rose-200 hover:border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Belum Ada PIC (Kritis)</span>
              <UserX className={`w-4 h-4 ${statusFilter === 'no-utama' ? 'text-rose-200' : 'text-rose-600'}`} />
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-rose-600 tabular-nums">
              <span className={statusFilter === 'no-utama' ? 'text-white' : ''}>{stats.noUtama}</span>
            </div>
            <span className={`text-[10px] ${statusFilter === 'no-utama' ? 'text-rose-100' : 'text-rose-700'}`}>
              Belum ditunjuk penanggung jawab
            </span>
          </div>

        </div>

        {/* 2. SIMULASI KETIDAKHADIRAN / IJIN SAKIT (ABSENCE SIMULATOR) */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-indigo-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold tracking-tight">
                  Simulasi: "Bagaimana Jika Anggota Tidak Masuk Kerja?"
                </h3>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-black uppercase">
                  Uji Kontingensi
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Pilih salah satu anggota tim untuk mensimulasikan siapa yang otomatis mengambil alih tugasnya dan mendeteksi tugas yang beresiko mangkrak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <span className="text-xs text-indigo-200 font-medium whitespace-nowrap hidden sm:inline">
              Simulasi Absen:
            </span>
            <div className="relative w-full sm:w-64">
              <select
                value={simulatedAbsentMemberId}
                onChange={(e) => setSimulatedAbsentMemberId(e.target.value)}
                className="w-full appearance-none bg-white text-slate-900 text-xs font-bold py-2.5 px-3.5 pr-8 rounded-xl border border-indigo-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="none">✓ Semua Anggota Masuk (Normal)</option>
                {teamData.map(m => (
                  <option key={m.id} value={m.id}>
                    ⚠️ Jika {m.name} ({m.role}) Tidak Masuk
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {simulatedAbsentMemberId !== 'none' && (
              <button
                type="button"
                onClick={() => setSimulatedAbsentMemberId('none')}
                className="px-2.5 py-2 text-xs font-bold text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
                title="Hentikan simulasi"
              >
                Reset
              </button>
            )}
          </div>

        </div>

        {/* Active Simulation Alert Banner if absent */}
        {absentMember && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-bold text-slate-900 shrink-0">
                !
              </div>
              <div>
                <h4 className="text-xs font-extrabold">
                  Mode Simulasi Aktif: <span className="underline">{absentMember.name}</span> diasumsikan tidak hadir.
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Perhatikan kolom <strong>"Backup Jika Utama Tidak Masuk"</strong> di bawah. Tugas yang memiliki backup otomatis dialihkan, sedangkan tugas berlatar merah membutuhkan penugasan darurat segera!
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-1 rounded-lg shrink-0">
              Absen: {absentMember.name}
            </span>
          </div>
        )}

        {/* 3. Filter Toolbar & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({DETAILED_COMPETENCIES.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = DETAILED_COMPETENCIES.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau kompetensi..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

        </div>

      </div>

      {/* 4. THE COMPREHENSIVE RACI CROSS-MATRIX TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Table Instructions Strip & Legend */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Panduan Peran:</span>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-extrabold shadow-2xs">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>UTAMA (PIC)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-900 px-2.5 py-1 rounded-lg text-[11px] font-extrabold shadow-2xs">
              <Shield className="w-3 h-3 text-cyan-600" />
              <span>BACKUP (Pengganti)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="font-mono">—</span>
              <span>Tidak Ditugaskan</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Klik pada sel tabel untuk mengubah alokasi peran secara instan</span>
          </div>

        </div>

        {/* Scrollable Matrix Table with Frozen Header & Column */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin relative border-b border-slate-200">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-30 shadow-xs">
              <tr className="text-slate-700 text-xs uppercase tracking-wider font-bold">
                
                {/* Column 1: Competency & Category - Frozen Top & Left */}
                <th className="py-3.5 px-4 w-72 sticky top-0 left-0 bg-slate-100 z-40 border-r border-b border-slate-200 shadow-[2px_2px_4px_rgba(0,0,0,0.06)]">
                  Kompetensi / Tugas Operasional
                </th>

                {/* Column 2: PIC UTAMA Summary - Frozen Top */}
                <th className="py-3.5 px-3.5 w-52 sticky top-0 z-30 bg-[#fef3c7] border-r border-b border-amber-200/80 text-amber-950 font-extrabold text-center shadow-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Tugas Utama Siapa?</span>
                  </div>
                  <span className="text-[9px] font-normal text-amber-800 block normal-case">
                    Penanggung jawab harian
                  </span>
                </th>

                {/* Column 3: BACKUP Summary - Frozen Top */}
                <th className="py-3.5 px-3.5 w-60 sticky top-0 z-30 bg-[#cffafe] border-r border-b border-cyan-200/80 text-cyan-950 font-extrabold text-center shadow-xs">
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Jika Utama Tidak Masuk, Di-backup Oleh?</span>
                  </div>
                  <span className="text-[9px] font-normal text-cyan-800 block normal-case">
                    Petugas pengganti saat izin/cuti
                  </span>
                </th>

                {/* Individual Team Member Columns - Frozen Top */}
                {teamData.map(m => (
                  <th key={m.id} className="py-3 px-2 text-center min-w-[105px] sticky top-0 z-30 bg-slate-100 border-r border-b border-slate-200/60 shadow-xs">
                    <div className="flex flex-col items-center justify-center">
                      <CharacterAvatarIcon
                        avatarId={m.avatarId || (m.gender === 'female' ? 'female-admin' : 'male-leader')}
                        gender={m.gender || 'male'}
                        size="sm"
                      />
                      <span className="font-extrabold text-slate-900 mt-1 truncate max-w-[95px] block text-[11px]">
                        {m.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-normal truncate max-w-[95px] block leading-tight">
                        {m.role}
                      </span>
                    </div>
                  </th>
                ))}

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCompetencies.map((comp) => {
                const compAssignments = assignments[comp.id] || {};
                
                // Identify members with Utama & Backup
                const utamaMembers = teamData.filter(m => compAssignments[m.id] === 'utama');
                const backupMembers = teamData.filter(m => compAssignments[m.id] === 'backup');

                // Simulation checks if an absent member is selected
                const isAbsentMainPIC = absentMember ? utamaMembers.some(u => u.id === absentMember.id) : false;
                const hasBackupAvailable = backupMembers.length > 0;
                const isAtRisk = isAbsentMainPIC && !hasBackupAvailable;

                return (
                  <tr 
                    key={comp.id} 
                    className={`transition-colors ${
                      isAtRisk 
                        ? 'bg-rose-50/60 hover:bg-rose-50' 
                        : isAbsentMainPIC 
                        ? 'bg-amber-50/40 hover:bg-amber-50/60' 
                        : 'hover:bg-indigo-50/30'
                    }`}
                  >
                    
                    {/* Col 1: Competency info */}
                    <td className="py-3 px-4 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200">
                      <div className="font-bold text-slate-900 leading-tight">
                        {comp.label}
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal mt-1 leading-snug">
                        {comp.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono">
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {comp.category}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-indigo-600 font-semibold">
                          SLA: {comp.sla}
                        </span>
                      </div>
                    </td>

                    {/* Col 2: Tugas Utama Siapa? */}
                    <td className="py-3 px-3.5 bg-amber-50/30 border-r border-amber-200/60">
                      {utamaMembers.length > 0 ? (
                        <div className="space-y-1">
                          {utamaMembers.map(u => {
                            const isThisAbsent = absentMember?.id === u.id;
                            return (
                              <div 
                                key={u.id}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-bold ${
                                  isThisAbsent 
                                    ? 'bg-rose-100 border-rose-300 text-rose-800 line-through opacity-70' 
                                    : 'bg-amber-100/80 border-amber-300 text-amber-950'
                                }`}
                              >
                                <Star className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
                                <span className="truncate">{u.name}</span>
                                {isThisAbsent && (
                                  <span className="text-[8px] bg-rose-600 text-white px-1 rounded ml-auto not-line-through">
                                    ABSEN
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                          ⚠️ Belum Ada PIC Utama
                        </div>
                      )}
                    </td>

                    {/* Col 3: Jika Utama Tidak Masuk, Di-backup Oleh? */}
                    <td className="py-3 px-3.5 bg-cyan-50/30 border-r border-cyan-200/60">
                      {isAbsentMainPIC ? (
                        hasBackupAvailable ? (
                          <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-[10px] space-y-1">
                            <div className="font-extrabold flex items-center gap-1 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Otomatis Diambil Alih Oleh:</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {backupMembers.map(b => (
                                <span key={b.id} className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded shadow-2xs">
                                  🛡 {b.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-rose-500 text-white text-[10px] font-black animate-pulse shadow-sm">
                            🚨 DARURAT: Tidak ada backup! Operasional macet jika utama tidak masuk!
                          </div>
                        )
                      ) : backupMembers.length > 0 ? (
                        <div className="space-y-1">
                          {backupMembers.map(b => (
                            <div 
                              key={b.id}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-100/70 border border-cyan-300 text-cyan-950 text-[11px] font-bold"
                            >
                              <Shield className="w-3 h-3 text-cyan-600 shrink-0" />
                              <span className="truncate">{b.name}</span>
                              <span className="text-[8px] text-cyan-700 bg-cyan-200/60 px-1 rounded ml-auto">
                                Backup
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold text-center">
                          ⚠️ Tanpa Backup (Rentan)
                        </div>
                      )}
                    </td>

                    {/* Member Interactive Cells */}
                    {teamData.map(member => {
                      const role = compAssignments[member.id] || 'none';
                      const isUtama = role === 'utama';
                      const isBackup = role === 'backup';
                      const isSimulatedAbsent = absentMember?.id === member.id;

                      return (
                        <td key={member.id} className="py-2.5 px-2 text-center border-r border-slate-100 relative">
                          <button
                            type="button"
                            onClick={() => handleQuickToggle(comp.id, member.id)}
                            className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-extrabold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                              isSimulatedAbsent
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                                : isUtama
                                ? 'bg-amber-400 text-slate-950 border border-amber-500 shadow-xs hover:bg-amber-500'
                                : isBackup
                                ? 'bg-cyan-500 text-white border border-cyan-600 hover:bg-cyan-600'
                                : 'bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 border border-transparent'
                            }`}
                            title={`Klik untuk ubah: ${member.name} pada ${comp.label} (Saat ini: ${role.toUpperCase()})`}
                          >
                            {isUtama ? (
                              <>
                                <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                                <span>UTAMA</span>
                              </>
                            ) : isBackup ? (
                              <>
                                <Shield className="w-2.5 h-2.5" />
                                <span>BACKUP</span>
                              </>
                            ) : (
                              <span className="text-slate-300 hover:text-slate-600 font-mono text-sm leading-none">—</span>
                            )}
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>

            {/* Matrix Footer Totals */}
            <tfoot className="sticky bottom-0 z-30 shadow-[0_-2px_6px_rgba(0,0,0,0.06)]">
              <tr className="bg-slate-100 border-t-2 border-slate-300 text-xs font-bold">
                <td className="py-3 px-4 text-slate-800 sticky bottom-0 left-0 bg-slate-100 z-40 border-r border-slate-300 shadow-[2px_0_4px_rgba(0,0,0,0.06)]">
                  Total Tanggung Jawab (Utama / Backup)
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-amber-900 bg-[#fef3c7] border-r border-slate-300 tabular-nums">
                  {stats.optimal + stats.noBackup} Tugas Ber-PIC
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-cyan-900 bg-[#cffafe] border-r border-slate-300 tabular-nums">
                  {stats.optimal} Tugas Terlindungi
                </td>
                {teamData.map(m => {
                  const totalUtama = DETAILED_COMPETENCIES.filter(c => assignments[c.id]?.[m.id] === 'utama').length;
                  const totalBackup = DETAILED_COMPETENCIES.filter(c => assignments[c.id]?.[m.id] === 'backup').length;

                  return (
                    <td key={m.id} className="py-3 px-2 text-center border-r border-slate-200/60 font-mono text-[11px]">
                      <div className="flex flex-col items-center">
                        <span className="font-extrabold text-amber-800">
                          {totalUtama} Utama
                        </span>
                        <span className="text-[9px] text-cyan-800 font-semibold">
                          {totalBackup} Backup
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>

          </table>
        </div>

        {/* Bottom Help Notice */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <span>Pengaturan Matriks RACI otomatis tersimpan di browser Anda</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-800 font-bold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Klik 1x: Jadikan Utama
            </span>
            <span className="flex items-center gap-1 text-cyan-800 font-bold">
              <Shield className="w-3 h-3 text-cyan-600" />
              Klik 2x: Jadikan Backup
            </span>
            <span className="text-slate-400">
              Klik 3x: Kosongkan
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
