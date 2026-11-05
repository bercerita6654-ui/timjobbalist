import { TeamMember, TaskCategory, TaskPriority, Gender } from '../types/jobdesk';
import { autoDetectCategory, autoDetectPriority } from '../data/defaultData';

export const SPREADSHEET_ID = '10VpsulpMNzoD8BtZCRiJHbZI3vgKbhW5bKRE3cj3qBc';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?usp=sharing`;

const MASTER_SHEET = 'Semua_Jobdesk';
const CATEGORY_SHEETS: { category: TaskCategory; sheetTitle: string }[] = [
  { category: 'Manajemen & Katalog', sheetTitle: 'Manajemen_Katalog' },
  { category: 'Nota & Keuangan', sheetTitle: 'Nota_Keuangan' },
  { category: 'CS & Chat', sheetTitle: 'CS_Chat' },
  { category: 'Packing & Logistik', sheetTitle: 'Packing_Logistik' },
  { category: 'Live Streaming', sheetTitle: 'Live_Streaming' }
];

// Helper: Get existing sheets in the spreadsheet
export async function getExistingSheetTitles(accessToken: string): Promise<string[]> {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Gagal mengakses metadata spreadsheet');
    }
    const data = await res.json();
    return (data.sheets || []).map((s: any) => s.properties?.title as string);
  } catch (e: any) {
    console.error('Error fetching sheet titles:', e);
    throw e;
  }
}

// Helper: Ensure all required sheets exist
export async function ensureRequiredSheetsExist(accessToken: string): Promise<void> {
  const existing = await getExistingSheetTitles(accessToken);
  const required = [MASTER_SHEET, ...CATEGORY_SHEETS.map(c => c.sheetTitle)];
  const toCreate = required.filter(title => !existing.includes(title));

  if (toCreate.length === 0) return;

  const requests = toCreate.map(title => ({
    addSheet: {
      properties: {
        title,
        gridProperties: {
          rowCount: 100,
          columnCount: 12
        }
      }
    }
  }));

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!res.ok) {
    console.warn('BatchUpdate sheet creation warning:', await res.text());
  }
}

// 1. Read / Pull Data from Spreadsheet
export async function pullDataFromSpreadsheet(accessToken: string): Promise<TeamMember[] | null> {
  try {
    const existingTitles = await getExistingSheetTitles(accessToken);
    const targetSheet = existingTitles.includes(MASTER_SHEET) 
      ? MASTER_SHEET 
      : existingTitles[0] || 'Sheet1';

    const range = `${targetSheet}!A1:J200`;
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      throw new Error(`Gagal membaca data dari sheet ${targetSheet}`);
    }

    const data = await res.json();
    const rows: string[][] = data.values || [];

    if (rows.length <= 1) {
      // Empty or header only
      return null;
    }

    const grouped = new Map<string, TeamMember>();
    const themes: TeamMember['theme'][] = ['indigo', 'rose', 'purple', 'emerald', 'amber', 'cyan', 'blue'];
    let themeIdx = 0;

    // Row format expected:
    // [No, Nama Personel, Gender, Avatar ID, Jabatan / Peran, Deskripsi Tugas, Kategori, Prioritas, Status Selesai]
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;

      const name = (row[1] || 'ANGGOTA').trim().toUpperCase();
      const rawGender = (row[2] || '').trim().toLowerCase();
      const gender: Gender = rawGender === 'female' || rawGender === 'wanita' || rawGender === 'perempuan' ? 'female' : 'male';
      const avatarId = row[3] || (gender === 'female' ? 'female-admin' : 'male-leader');
      const role = (row[4] || 'STAFF TIM ONLINE').trim().toUpperCase();
      const taskText = (row[5] || '').trim();
      const category = (row[6] || autoDetectCategory(taskText)) as TaskCategory;
      const priority = (row[7] || autoDetectPriority(taskText)) as TaskPriority;
      const completed = (row[8] || '').toLowerCase() === 'selesai' || (row[8] || '').toLowerCase() === 'true';

      if (!grouped.has(name)) {
        grouped.set(name, {
          id: `m-sheet-${i}-${name.toLowerCase().replace(/\s+/g, '')}`,
          name,
          role,
          badge: name === 'BOBBY' ? 'Team Leader' : 'Team Member',
          theme: themes[themeIdx++ % themes.length],
          gender,
          avatarId,
          tasks: []
        });
      }

      if (taskText) {
        grouped.get(name)!.tasks.push({
          id: `t-sheet-${i}-${Date.now()}`,
          text: taskText,
          category,
          priority,
          completed
        });
      }
    }

    if (grouped.size > 0) {
      return Array.from(grouped.values());
    }
    return null;
  } catch (err: any) {
    console.error('Error pulling spreadsheet data:', err);
    throw err;
  }
}

// 2. Save / Sync Data to Spreadsheet across all individual sheets
export async function syncDataToSpreadsheet(teamData: TeamMember[], accessToken: string): Promise<void> {
  // Ensure all required sheets exist in user's spreadsheet
  await ensureRequiredSheetsExist(accessToken);

  // --- 1. Master Sheet (Semua_Jobdesk) ---
  const masterHeaders = [
    'No',
    'Nama Personel',
    'Gender',
    'Avatar ID',
    'Jabatan / Peran',
    'Deskripsi Tugas (Jobdesk)',
    'Kategori',
    'Prioritas',
    'Status Selesai',
    'Terakhir Disinkronkan'
  ];

  const nowStr = new Date().toLocaleString('id-ID');
  const masterRows: (string | number)[][] = [masterHeaders];
  let counter = 1;

  teamData.forEach(member => {
    if (member.tasks.length === 0) {
      masterRows.push([
        counter++,
        member.name,
        member.gender,
        member.avatarId,
        member.role,
        '',
        'Manajemen & Katalog',
        'Medium',
        'Belum',
        nowStr
      ]);
    } else {
      member.tasks.forEach(task => {
        masterRows.push([
          counter++,
          member.name,
          member.gender,
          member.avatarId,
          member.role,
          task.text,
          task.category,
          task.priority || 'Medium',
          task.completed ? 'Selesai' : 'Belum',
          nowStr
        ]);
      });
    }
  });

  // Clear and update master sheet
  await clearAndUpdateSheet(accessToken, MASTER_SHEET, masterRows);

  // --- 2. Write to each individual category sheet ---
  for (const catConfig of CATEGORY_SHEETS) {
    const catHeaders = [
      'No',
      'Nama Personel',
      'Jabatan / Peran',
      'Tugas Divisi (' + catConfig.category + ')',
      'Prioritas',
      'Status Selesai',
      'Gender',
      'Waktu Update'
    ];

    const catRows: (string | number)[][] = [catHeaders];
    let catCounter = 1;

    teamData.forEach(member => {
      const matchingTasks = member.tasks.filter(t => t.category === catConfig.category);
      matchingTasks.forEach(task => {
        catRows.push([
          catCounter++,
          member.name,
          member.role,
          task.text,
          task.priority || 'Medium',
          task.completed ? 'Selesai' : 'Belum',
          member.gender,
          nowStr
        ]);
      });
    });

    await clearAndUpdateSheet(accessToken, catConfig.sheetTitle, catRows);
  }
}

// Helper: Clear range and put new values
async function clearAndUpdateSheet(
  accessToken: string,
  sheetTitle: string,
  values: (string | number)[][]
): Promise<void> {
  const clearRange = `${sheetTitle}!A1:Z200`;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(clearRange)}:clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const updateRange = `${sheetTitle}!A1`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Gagal menulis data ke sheet ${sheetTitle}`);
  }
}
