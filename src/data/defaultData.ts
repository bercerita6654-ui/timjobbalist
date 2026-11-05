import { TeamMember, TaskCategory, ThemeColor, SOPItem, ShiftSchedule, TaskPriority, SortOption, JobdeskTask } from '../types/jobdesk';

export const CATEGORIES: TaskCategory[] = [
  'Manajemen & Katalog',
  'Nota & Keuangan',
  'CS & Chat',
  'Packing & Logistik',
  'Live Streaming'
];

export const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

export const PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  shortLabel: string;
  badge: string;
  dot: string;
  text: string;
  bgLight: string;
  border: string;
  weight: number;
}> = {
  High: {
    label: 'Prioritas Tinggi (High)',
    shortLabel: 'Tinggi',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
    bgLight: 'bg-rose-50/70',
    border: 'border-rose-200',
    weight: 3
  },
  Medium: {
    label: 'Prioritas Sedang (Medium)',
    shortLabel: 'Sedang',
    badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    bgLight: 'bg-amber-50/70',
    border: 'border-amber-200',
    weight: 2
  },
  Low: {
    label: 'Prioritas Rendah (Low)',
    shortLabel: 'Rendah',
    badge: 'bg-slate-50 text-slate-600 border-slate-200/80',
    dot: 'bg-slate-400',
    text: 'text-slate-600',
    bgLight: 'bg-slate-50/70',
    border: 'border-slate-200',
    weight: 1
  }
};

export const CATEGORY_STYLES: Record<TaskCategory, { badge: string; dot: string }> = {
  'Manajemen & Katalog': {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    dot: 'bg-indigo-600'
  },
  'Nota & Keuangan': {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/70',
    dot: 'bg-amber-600'
  },
  'CS & Chat': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200/70',
    dot: 'bg-purple-600'
  },
  'Packing & Logistik': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    dot: 'bg-emerald-600'
  },
  'Live Streaming': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/70',
    dot: 'bg-rose-600'
  }
};

export const THEME_CONFIG: Record<ThemeColor, {
  label: string;
  headerBg: string;
  avatarBg: string;
  border: string;
  badgeBg: string;
  hex: string;
}> = {
  indigo: {
    label: 'Indigo (Leader / Utama)',
    headerBg: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    hex: '#4f46e5'
  },
  rose: {
    label: 'Rose (Keuangan & Live)',
    headerBg: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    hex: '#e11d48'
  },
  purple: {
    label: 'Purple (Katalog & CS)',
    headerBg: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    hex: '#9333ea'
  },
  emerald: {
    label: 'Emerald (Operasional & Live)',
    headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    hex: '#059669'
  },
  amber: {
    label: 'Amber (Nota & Packing)',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    hex: '#d97706'
  },
  cyan: {
    label: 'Cyan (Logistik Reguler)',
    headerBg: 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-cyan-200',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    hex: '#0891b2'
  },
  blue: {
    label: 'Blue (Fulfillment Nota)',
    headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
    avatarBg: 'bg-white/20 text-white',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    hex: '#2563eb'
  }
};

export const DEFAULT_TEAM_DATA: TeamMember[] = [
  {
    id: 'm-bobby',
    name: 'BOBBY',
    role: 'LEADER TEAM ONLINE',
    badge: 'Team Leader',
    theme: 'indigo',
    gender: 'male',
    avatarId: 'male-leader',
    tasks: [
      { id: 't-101', text: 'Upload Produk baru Marketplace & AIO System', category: 'Manajemen & Katalog', priority: 'Medium', completed: false },
      { id: 't-102', text: 'Update Design cover & Banner Marketplace', category: 'Manajemen & Katalog', priority: 'Medium', completed: false },
      { 
        id: 't-103', 
        text: 'Update Campaign sesuai Jadwal yang ditentukan marketplace', 
        category: 'Manajemen & Katalog', 
        priority: 'High', 
        completed: false,
        notes: [
          {
            id: 'n-101',
            authorName: 'BOBBY',
            authorRole: 'LEADER TEAM ONLINE',
            authorAvatarId: 'male-leader',
            authorGender: 'male',
            content: 'Banner promo Payday 25th sudah disiapkan di folder Marketing. Tolong pastikan kuota voucher diskon sudah aktif sebelum jam 12 malam.',
            createdAt: 'Hari ini 09:15'
          },
          {
            id: 'n-102',
            authorName: 'WINDA',
            authorRole: 'ADMIN KEUANGAN',
            authorAvatarId: 'female-admin',
            authorGender: 'female',
            content: 'Siap Mas Bobby, kuota voucher diskon 15% sudah aktif di Shopee dan Tokopedia.',
            createdAt: 'Hari ini 09:42'
          }
        ]
      },
      { id: 't-104', text: 'Mereturn barang Reguler', category: 'Packing & Logistik', priority: 'Medium', completed: false },
      { id: 't-105', text: 'Perbaikan SKU produk di marketplace', category: 'Manajemen & Katalog', priority: 'Low', completed: false },
      { id: 't-106', text: 'Mencetak nota instan dan reguler (Sesuai Jadwal/Opsional)', category: 'Nota & Keuangan', priority: 'High', completed: false }
    ]
  },
  {
    id: 'm-winda',
    name: 'WINDA',
    role: 'ADMIN KEUANGAN, CS & HOST LIVE',
    badge: 'Senior Admin',
    theme: 'rose',
    gender: 'female',
    avatarId: 'female-admin',
    tasks: [
      { id: 't-201', text: 'Mencetak nota instan dan reguler', category: 'Nota & Keuangan', priority: 'High', completed: false },
      { id: 't-202', text: 'Membuat pelunasan', category: 'Nota & Keuangan', priority: 'High', completed: false },
      { id: 't-203', text: 'Mereturn barang', category: 'Packing & Logistik', priority: 'Medium', completed: false },
      { 
        id: 't-204', 
        text: 'Membalas chat WA dan marketplace', 
        category: 'CS & Chat', 
        priority: 'High', 
        completed: false,
        notes: [
          {
            id: 'n-201',
            authorName: 'WINDA',
            authorRole: 'ADMIN CS',
            authorAvatarId: 'female-admin',
            authorGender: 'female',
            content: 'Broadcast promo gratis ongkir sudah dikirim ke 450 pelanggan repeat order.',
            createdAt: 'Hari ini 11:20'
          }
        ]
      },
      { id: 't-205', text: 'Menangani komplain customer', category: 'CS & Chat', priority: 'High', completed: false },
      { id: 't-206', text: 'Packing pesanan', category: 'Packing & Logistik', priority: 'High', completed: false },
      { id: 't-207', text: 'Menambahkan dan mengecek produk di marketplace', category: 'Manajemen & Katalog', priority: 'Medium', completed: false },
      { id: 't-208', text: 'Merinci barang kosong', category: 'Manajemen & Katalog', priority: 'Low', completed: false },
      { 
        id: 't-209', 
        text: 'Live Streaming Marketplace / Sosmed', 
        category: 'Live Streaming', 
        priority: 'High', 
        completed: false,
        notes: [
          {
            id: 'n-202',
            authorName: 'WINDA',
            authorRole: 'HOST LIVE',
            authorAvatarId: 'female-live',
            authorGender: 'female',
            content: 'Sample gamis & hijab baru sudah di-steam di studio live room 2. Target GMV malam ini Rp 15.000.000.',
            createdAt: 'Hari ini 14:10'
          }
        ]
      }
    ]
  },
  {
    id: 'm-putri',
    name: 'PUTRI',
    role: 'ADMIN CS, KATALOG & PACKING',
    badge: 'Admin & CS',
    theme: 'purple',
    gender: 'female',
    avatarId: 'female-katalog',
    tasks: [
      { id: 't-301', text: 'Mencetak nota instan dan reguler', category: 'Nota & Keuangan', priority: 'High', completed: false },
      { id: 't-302', text: 'Membalas chat WA dan marketplace', category: 'CS & Chat', priority: 'High', completed: false },
      { id: 't-303', text: 'Menangani komplain customer', category: 'CS & Chat', priority: 'High', completed: false },
      { id: 't-304', text: 'Packing pesanan', category: 'Packing & Logistik', priority: 'High', completed: false },
      { id: 't-305', text: 'Menambahkan dan mengecek produk di marketplace', category: 'Manajemen & Katalog', priority: 'Medium', completed: false },
      { id: 't-306', text: 'Merinci barang kosong', category: 'Manajemen & Katalog', priority: 'Low', completed: false }
    ]
  },
  {
    id: 'm-desak',
    name: 'DESAK',
    role: 'ADMIN CS, INSTAN & HOST LIVE',
    badge: 'CS & Live',
    theme: 'emerald',
    gender: 'female',
    avatarId: 'female-live',
    tasks: [
      { id: 't-401', text: 'Mencetak nota instan dan reguler', category: 'Nota & Keuangan', priority: 'High', completed: false },
      { id: 't-402', text: 'Membalas chat WA dan marketplace', category: 'CS & Chat', priority: 'High', completed: false },
      { id: 't-403', text: 'Packing pesanan', category: 'Packing & Logistik', priority: 'High', completed: false },
      { id: 't-404', text: 'Live Streaming Marketplace / Sosmed', category: 'Live Streaming', priority: 'High', completed: false },
      { id: 't-405', text: 'Menyiapkan barang nota instan', category: 'Packing & Logistik', priority: 'High', completed: false }
    ]
  },
  {
    id: 'm-nazwa',
    name: 'NAZWA',
    role: 'ADMIN CS, NOTA & PACKING',
    badge: 'Admin & Packing',
    theme: 'amber',
    gender: 'female',
    avatarId: 'female-packing',
    tasks: [
      { id: 't-501', text: 'Mencetak nota instan dan reguler', category: 'Nota & Keuangan', priority: 'High', completed: false },
      { id: 't-502', text: 'Membalas chat WA dan marketplace', category: 'CS & Chat', priority: 'High', completed: false },
      { id: 't-503', text: 'Packing pesanan', category: 'Packing & Logistik', priority: 'High', completed: false }
    ]
  },
  {
    id: 'm-danang',
    name: 'DANANG',
    role: 'SPESIALIS PACKING REGULER',
    badge: 'Logistik Packing',
    theme: 'cyan',
    gender: 'male',
    avatarId: 'male-packing',
    tasks: [
      { id: 't-601', text: 'Packing barang nota reguler', category: 'Packing & Logistik', priority: 'High', completed: false }
    ]
  },
  {
    id: 'm-nanda',
    name: 'NANDA',
    role: 'SPESIALIS NOTA REGULER',
    badge: 'Fulfillment Nota',
    theme: 'blue',
    gender: 'male',
    avatarId: 'male-nota',
    tasks: [
      { id: 't-701', text: 'Menyiapkan nota reguler', category: 'Nota & Keuangan', priority: 'High', completed: false }
    ]
  }
];

export const CORE_COMPETENCIES = [
  { 
    id: 'comp-1',
    label: 'Upload & Cek Produk Marketplace / SKU', 
    category: 'Manajemen & Katalog',
    keywords: ['upload', 'produk', 'sku', 'katalog', 'banner', 'campaign'] 
  },
  { 
    id: 'comp-2',
    label: 'Mencetak Nota Instan & Reguler', 
    category: 'Nota & Keuangan',
    keywords: ['mencetak nota', 'menyiapkan nota'] 
  },
  { 
    id: 'comp-3',
    label: 'Membuat Pelunasan & Rekonsiliasi', 
    category: 'Nota & Keuangan',
    keywords: ['pelunasan'] 
  },
  { 
    id: 'comp-4',
    label: 'Membalas Chat WA & Marketplace (SLA < 5 min)', 
    category: 'CS & Chat',
    keywords: ['chat'] 
  },
  { 
    id: 'comp-5',
    label: 'Menangani Komplain Customer & Solusi', 
    category: 'CS & Chat',
    keywords: ['komplain'] 
  },
  { 
    id: 'comp-6',
    label: 'Packing Pesanan (Reguler & Instan)', 
    category: 'Packing & Logistik',
    keywords: ['packing', 'menyiapkan barang'] 
  },
  { 
    id: 'comp-7',
    label: 'Mereturn Barang & Rinci Stok Kosong', 
    category: 'Packing & Logistik',
    keywords: ['mereturn', 'barang kosong'] 
  },
  { 
    id: 'comp-8',
    label: 'Host Live Streaming Marketplace / TikTok', 
    category: 'Live Streaming',
    keywords: ['live'] 
  }
];

export const DEFAULT_SOPS: SOPItem[] = [
  {
    id: 'sop-1',
    title: 'SOP Pelayanan Chat Customer (SLA < 5 Menit)',
    sla: '< 5 Menit di Jam Kerja',
    description: 'Menjawab setiap pesan masuk dengan ramah, informatif, dan mengarahkan ke konfirmasi pesanan.',
    responsibleRoles: ['WINDA', 'PUTRI', 'DESAK', 'NAZWA'],
    checklist: [
      'Gunakan salam pembuka standar toko',
      'Cek ketersediaan stok fisik jika ada varian spesifik',
      'Kirim link checkout / keranjang kuning aktif',
      'Pastikan tidak ada pesan unread sebelum meninggalkan shift'
    ]
  },
  {
    id: 'sop-2',
    title: 'SOP Cetak Nota & Pemisahan Instan / Reguler',
    sla: '08:30 Pagi & 13:30 Siang',
    description: 'Proses validasi pesanan baru, filter pesanan COD, dan urutkan nota berdasarkan jenis pengiriman.',
    responsibleRoles: ['NANDA', 'BOBBY', 'WINDA', 'PUTRI', 'DESAK', 'NAZWA'],
    checklist: [
      'Sinkronisasi pesanan dari seluruh marketplace (Shopee, Tokopedia, TikTok)',
      'Pisahkan nota INSTAN / SAMEDAY untuk diprioritaskan terlebih dahulu',
      'Kelompokkan nota REGULER berdasarkan jenis ekspedisi',
      'Serahkan fisik nota ke meja packing dengan tanda terima'
    ]
  },
  {
    id: 'sop-3',
    title: 'SOP Standar Packing & Quality Control',
    sla: 'Cut-off Reguler 15:00 WIB',
    description: 'Pengecekan fisik barang, barcode, bubble wrap tebal, dan label resi ekspedisi.',
    responsibleRoles: ['DANANG', 'WINDA', 'PUTRI', 'DESAK', 'NAZWA'],
    checklist: [
      'Cek fisik barang: tidak cacat, warna & ukuran sesuai nota',
      'Bungkus lapisan bubble wrap minimal 2 lapis untuk produk pecah belah',
      'Tempel resi ekspedisi di bidang datar tanpa menutupi barcode',
      'Pastikan resi dapat terbaca scanner kurir'
    ]
  },
  {
    id: 'sop-4',
    title: 'SOP Penanganan Barang Retur & Stok Kosong',
    sla: 'Maksimal 1x24 Jam Sejak Diterima',
    description: 'Dokumentasi unboxing retur, validasi kendala ekspedisi/cacat, serta pelaporan stok habis ke tim katalog.',
    responsibleRoles: ['BOBBY', 'WINDA', 'PUTRI'],
    checklist: [
      'Video unboxing barang retur sebagai bukti klaim marketplace',
      'Klasifikasikan barang: Masuk stok kembali vs Rusak/Klaim kurir',
      'Rinci SKU barang kosong di spreadsheet internal setiap sore',
      'Update status stok di marketplace menjadi 0 untuk mencegah pesanan batal'
    ]
  },
  {
    id: 'sop-5',
    title: 'SOP Sesi Live Streaming Marketplace & Sosmed',
    sla: 'Sesi Siang (13:00) & Sesi Sore (16:00)',
    description: 'Persiapan sampel produk, promo voucher live, interaksi viewer, dan rekap closing produk.',
    responsibleRoles: ['WINDA', 'DESAK'],
    checklist: [
      'Cek pencahayaan, mic, dan koneksi internet 15 menit sebelum on-air',
      'Siapkan 10 SKU produk best-seller di meja display',
      'Semayamkan voucher toko & free ongkir eksklusif live',
      'Rekap total pesanan live dan serahkan ke bagian cetak nota'
    ]
  }
];

export const DEFAULT_SHIFT_SCHEDULE: ShiftSchedule[] = [
  {
    time: '08:30 - 09:30',
    label: 'Cetak Nota Kloter 1 & Respon Chat Pagi',
    action: 'Cetak nota order malam, balas chat akumulasi malam, validasi stok instan.',
    assignedTo: 'Nanda, Winda, Putri',
    type: 'urgent'
  },
  {
    time: '09:30 - 12:00',
    label: 'Packing Reguler Kloter 1 & Siapkan Instan',
    action: 'Packing cepat untuk pesanan instan, pengemasan order reguler kloter pagi.',
    assignedTo: 'Danang, Desak, Nazwa',
    type: 'regular'
  },
  {
    time: '12:00 - 13:00',
    label: 'Istirahat Siang Bergantian',
    action: 'Minimal 1 staf stand by memantau chat darurat & pesanan instan.',
    assignedTo: 'Tim Bergantian (Piket Chat: Putri)',
    type: 'checkpoint'
  },
  {
    time: '13:00 - 15:00',
    label: 'Sesi Live Siang & Packing Final Cut-Off (15:00)',
    action: 'Host mulai live streaming. Tim logistik kejar deadline cut-off ekspedisi reguler 15:00.',
    assignedTo: 'Host: Winda/Desak | Packing: Danang & Tim',
    type: 'urgent'
  },
  {
    time: '15:00 - 16:30',
    label: 'Pick-Up Kurir Ekspedisi & Pelunasan Nota',
    action: 'Serah terima paket ke kurir J&T, SiCepat, Shopee Xpress, rekonsiliasi pelunasan.',
    assignedTo: 'Danang, Bobby, Winda',
    type: 'regular'
  },
  {
    time: '16:30 - 17:30',
    label: 'Rekap Retur, Update Stok Kosong & Evaluasi',
    action: 'Input SKU kosong ke katalog, penanganan komplain tertunda, checklist harian.',
    assignedTo: 'Bobby (Leader), Winda, Putri',
    type: 'checkpoint'
  }
];

export function autoDetectCategory(text: string): TaskCategory {
  const lower = text.toLowerCase();
  if (lower.includes('live') || lower.includes('streaming') || lower.includes('tiktok')) {
    return 'Live Streaming';
  }
  if (lower.includes('nota') || lower.includes('pelunasan') || lower.includes('keuangan')) {
    return 'Nota & Keuangan';
  }
  if (lower.includes('chat') || lower.includes('komplain') || lower.includes('wa') || lower.includes('cs') || lower.includes('customer')) {
    return 'CS & Chat';
  }
  if (lower.includes('packing') || lower.includes('return') || lower.includes('menyiapkan barang') || lower.includes('logistik') || lower.includes('resi') || lower.includes('kurir')) {
    return 'Packing & Logistik';
  }
  return 'Manajemen & Katalog';
}

export function autoDetectPriority(text: string): TaskPriority {
  const lower = text.toLowerCase();
  if (
    lower.includes('komplain') || 
    lower.includes('nota instan') || 
    lower.includes('nota reguler') || 
    lower.includes('menyiapkan nota') || 
    lower.includes('mencetak nota') ||
    lower.includes('chat') ||
    lower.includes('pelunasan') ||
    lower.includes('packing barang nota') ||
    lower.includes('menyiapkan barang nota instan')
  ) {
    return 'High';
  }
  if (
    lower.includes('packing') || 
    lower.includes('live') || 
    lower.includes('upload') || 
    lower.includes('campaign') ||
    lower.includes('design') ||
    lower.includes('banner') ||
    lower.includes('menambahkan') ||
    lower.includes('mereturn')
  ) {
    return 'Medium';
  }
  return 'Low';
}

export function sortTasks(tasks: JobdeskTask[], sortOption: SortOption): JobdeskTask[] {
  const cloned = [...tasks];
  switch (sortOption) {
    case 'priority-desc':
      return cloned.sort((a, b) => {
        const pA = (a.priority || 'Medium') as TaskPriority;
        const pB = (b.priority || 'Medium') as TaskPriority;
        const wA = PRIORITY_CONFIG[pA]?.weight || 2;
        const wB = PRIORITY_CONFIG[pB]?.weight || 2;
        return wB - wA;
      });
    case 'priority-asc':
      return cloned.sort((a, b) => {
        const pA = (a.priority || 'Medium') as TaskPriority;
        const pB = (b.priority || 'Medium') as TaskPriority;
        const wA = PRIORITY_CONFIG[pA]?.weight || 2;
        const wB = PRIORITY_CONFIG[pB]?.weight || 2;
        return wA - wB;
      });
    case 'alpha':
      return cloned.sort((a, b) => a.text.localeCompare(b.text));
    case 'default':
    default:
      return cloned;
  }
}
