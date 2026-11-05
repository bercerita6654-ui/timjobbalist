import { TeamMember, TaskPriority, Gender, ShiftSchedule, SOPItem } from '../types/jobdesk';
import { autoDetectCategory, autoDetectPriority, PRIORITY_CONFIG, DEFAULT_SHIFT_SCHEDULE, DEFAULT_SOPS } from '../data/defaultData';
import { DETAILED_COMPETENCIES, RaciCompetency } from '../components/MatrixView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportSectionOptions {
  includeCards: boolean;
  includeStructure: boolean;
  includeSpreadsheet: boolean;
  includeMatrix: boolean;
  includeSopSchedule: boolean;
}

export function exportToCSV(teamData: TeamMember[], filename: string = 'Data_Jobdesk_Team_Online.csv') {
  const rows: (string | number)[][] = [
    ['No', 'Nama Personel', 'Jabatan / Peran', 'Deskripsi Tugas (Jobdesk)', 'Kategori Tugas', 'Prioritas', 'Status Selesai', 'Tema Warna']
  ];

  let counter = 1;
  teamData.forEach(member => {
    if (member.tasks.length === 0) {
      rows.push([counter++, member.name, member.role, '', 'Manajemen & Katalog', 'Medium', 'Belum', member.theme]);
    } else {
      member.tasks.forEach(task => {
        const priority = task.priority || 'Medium';
        rows.push([
          counter++,
          member.name,
          member.role,
          task.text,
          task.category,
          priority,
          task.completed ? 'Selesai' : 'Belum',
          member.theme
        ]);
      });
    }
  });

  const csvContent = '\uFEFF' + rows.map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToWord(teamData: TeamMember[], title: string, subtitle: string) {
  let wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 24px; }
        .header-box { background-color: #4338ca; color: #ffffff; padding: 24px; text-align: center; border-radius: 8px; margin-bottom: 24px; }
        h1 { font-size: 22pt; margin: 0; font-weight: bold; letter-spacing: -0.5px; }
        p.sub { font-size: 11pt; color: #e0e7ff; margin-top: 6px; }
        .stats-bar { font-size: 9.5pt; color: #fde047; margin-top: 10px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background-color: #312e81; color: #ffffff; padding: 10px 12px; font-size: 10.5pt; border: 1px solid #cbd5e1; text-align: left; }
        td { padding: 10px 12px; border: 1px solid #cbd5e1; vertical-align: top; font-size: 10pt; }
        .member-name { font-weight: bold; font-size: 11.5pt; color: #312e81; }
        .member-role { font-size: 9pt; color: #64748b; font-weight: 600; margin-top: 2px; }
        ul { margin: 0; padding-left: 18px; }
        li { margin-bottom: 6px; }
        .cat-tag { font-size: 8pt; color: #4338ca; font-weight: bold; background: #e0e7ff; padding: 1px 6px; border-radius: 3px; }
        .priority-high { font-size: 8pt; color: #be123c; font-weight: bold; background: #ffe4e6; padding: 1px 6px; border-radius: 3px; }
        .priority-med { font-size: 8pt; color: #b45309; font-weight: bold; background: #fef3c7; padding: 1px 6px; border-radius: 3px; }
        .priority-low { font-size: 8pt; color: #475569; font-weight: bold; background: #f1f5f9; padding: 1px 6px; border-radius: 3px; }
        .status-badge { font-size: 8pt; color: #047857; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <h1>${title}</h1>
        <p class="sub">${subtitle}</p>
        <p class="stats-bar">Total Personel: ${teamData.length} Orang | Total Tugas: ${teamData.reduce((acc, m) => acc + m.tasks.length, 0)} Item</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 6%; text-align:center;">No</th>
            <th style="width: 26%;">Nama & Jabatan Personel</th>
            <th style="width: 68%;">Rincian Tugas Operasional & Tingkat Prioritas</th>
          </tr>
        </thead>
        <tbody>
  `;

  teamData.forEach((member, idx) => {
    const taskItems = member.tasks.map(t => {
      const p = t.priority || 'Medium';
      const pClass = p === 'High' ? 'priority-high' : p === 'Medium' ? 'priority-med' : 'priority-low';
      const pLabel = p === 'High' ? 'Prioritas Tinggi' : p === 'Medium' ? 'Prioritas Sedang' : 'Prioritas Rendah';

      return `<li>${t.text} &nbsp;<span class="${pClass}">[${pLabel}]</span> &nbsp;<span class="cat-tag">[${t.category}]</span>${t.completed ? ' &nbsp;<span class="status-badge">✓ Selesai</span>' : ''}</li>`;
    }).join('');

    wordHtml += `
      <tr>
        <td style="text-align:center; font-weight:bold;">${idx + 1}</td>
        <td>
          <div class="member-name">${member.name}</div>
          <div class="member-role">${member.role}</div>
        </td>
        <td>
          <ul>${taskItems || '<li style="color:#94a3b8; font-style:italic;">Belum ada tugas tercatat</li>'}</ul>
        </td>
      </tr>
    `;
  });

  wordHtml += `
        </tbody>
      </table>
      <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 20px; text-align: center;">
        Dokumen dicetak otomatis dari Sistem SOP & Jobdesk Team Online pada ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
      </p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(teamData: TeamMember[], title: string, subtitle: string) {
  const data = {
    title,
    subtitle,
    exportDate: new Date().toISOString(),
    teamData
  };
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Backup_Jobdesk_Team_Online_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a complete, high-resolution vector A4 PDF report with cover header,
 * KPI metrics, personnel details, priority badges, and team notes.
 * This runs natively via jsPDF with 0 external DOM dependencies for 100% reliability.
 */
export async function exportFullReportToPDF(
  teamData: TeamMember[],
  title: string = 'JOBDESK TEAM ONLINE - BALISTATIONERY',
  subtitle: string = 'Struktur Pembagian Tugas Operasional E-Commerce, CS & Logistik',
  filename: string = 'Laporan_Lengkap_Jobdesk_Balistationery.pdf'
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 182mm
  const marginBottom = 20;

  let y = 14;
  let pageNumber = 1;

  // Helper: Draw running header on subsequent pages
  const drawPageHeader = () => {
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(marginX, 10, contentWidth, 10, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(245, 158, 11); // amber-400
    pdf.text('BALISTATIONERY', marginX + 3, 16.5);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.text('•  Laporan Resmi Pembagian Tugas Operasional', marginX + 32, 16.5);

    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.setFontSize(7);
    const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' });
    pdf.text(dateStr, marginX + contentWidth - 3, 16.5, { align: 'right' });

    y = 26;
  };

  // Helper: Draw running footer on every page
  const drawPageFooter = (currentPage: number, totalPagesPlaceholder: boolean = false) => {
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text('Dokumen ini sah dicetak dari Sistem SOP & Jobdesk Balistationery', marginX, pageHeight - 8);

    const pageStr = totalPagesPlaceholder ? `Halaman ${currentPage}` : `Halaman ${currentPage}`;
    pdf.text(pageStr, marginX + contentWidth, pageHeight - 8, { align: 'right' });
  };

  // --- PAGE 1: COVER HEADER ---
  // Background Box
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.roundedRect(marginX, y, contentWidth, 34, 3, 3, 'F');

  // Gold Brand Tag
  pdf.setFillColor(245, 158, 11); // amber-400
  pdf.roundedRect(marginX + 6, y + 5, 36, 4.5, 1, 1, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(15, 23, 42);
  pdf.text('BALISTATIONERY', marginX + 8, y + 8.2);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(129, 140, 248); // indigo-300
  pdf.text('OFFICIAL WORKLOAD & SOP REPORT', marginX + 46, y + 8.2);

  // Main Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text(title || 'JOBDESK TEAM ONLINE - BALISTATIONERY', marginX + 6, y + 17);

  // Subtitle
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(203, 213, 225); // slate-300
  const subLines = pdf.splitTextToSize(subtitle || 'Struktur Pembagian Tugas Operasional E-Commerce, CS & Logistik', contentWidth - 12);
  pdf.text(subLines[0] || '', marginX + 6, y + 23);

  // Metadata Timestamp
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  const nowStr = `Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} • Sinkronisasi: Google Sheets Cloud`;
  pdf.text(nowStr, marginX + 6, y + 29);

  y += 38;

  // --- KPI SUMMARY METRICS BOXES ---
  const totalTasks = teamData.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = teamData.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const highPriorityCount = teamData.reduce((acc, m) => acc + m.tasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length, 0);

  const cardW = (contentWidth - 9) / 4; // 4 cards with 3mm gaps
  const cardH = 16;

  // Metric 1: Total Personel
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(marginX, y, cardW, cardH, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL PERSONEL', marginX + cardW / 2, y + 5, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${teamData.length} Orang`, marginX + cardW / 2, y + 11.5, { align: 'center' });

  // Metric 2: Total Jobdesk
  const x2 = marginX + cardW + 3;
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(x2, y, cardW, cardH, 2, 2, 'FD');
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL TUGAS', x2 + cardW / 2, y + 5, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${totalTasks} Tugas`, x2 + cardW / 2, y + 11.5, { align: 'center' });

  // Metric 3: Rasio Selesai
  const x3 = x2 + cardW + 3;
  pdf.setFillColor(240, 253, 244); // emerald-50
  pdf.setDrawColor(187, 247, 208); // emerald-200
  pdf.roundedRect(x3, y, cardW, cardH, 2, 2, 'FD');
  pdf.setFontSize(6.5);
  pdf.setTextColor(22, 101, 52);
  pdf.text('SELESAI (DONE)', x3 + cardW / 2, y + 5, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setTextColor(21, 128, 61);
  pdf.text(`${completionPercent}% (${completedTasks}/${totalTasks})`, x3 + cardW / 2, y + 11.5, { align: 'center' });

  // Metric 4: Urgent
  const x4 = x3 + cardW + 3;
  pdf.setFillColor(255, 241, 242); // rose-50
  pdf.setDrawColor(254, 205, 211); // rose-200
  pdf.roundedRect(x4, y, cardW, cardH, 2, 2, 'FD');
  pdf.setFontSize(6.5);
  pdf.setTextColor(159, 18, 57);
  pdf.text('PRIORITAS TINGGI', x4 + cardW / 2, y + 5, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setTextColor(190, 18, 60);
  pdf.text(`${highPriorityCount} Urgent`, x4 + cardW / 2, y + 11.5, { align: 'center' });

  y += cardH + 7;

  // --- TABLE HEADER HELPER ---
  const colW = {
    no: 8,
    member: 38,
    task: 78,
    category: 28,
    priority: 15,
    status: 15
  };

  const drawTableHeader = (curY: number) => {
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.rect(marginX, curY, contentWidth, 7, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);

    let curX = marginX;
    pdf.text('NO', curX + colW.no / 2, curY + 4.8, { align: 'center' });
    curX += colW.no;

    pdf.text('NAMA & JABATAN', curX + 2, curY + 4.8);
    curX += colW.member;

    pdf.text('RINCIAN TUGAS & CATATAN', curX + 2, curY + 4.8);
    curX += colW.task;

    pdf.text('DIVISI / KATEGORI', curX + 2, curY + 4.8);
    curX += colW.category;

    pdf.text('PRIORITAS', curX + colW.priority / 2, curY + 4.8, { align: 'center' });
    curX += colW.priority;

    pdf.text('STATUS', curX + colW.status / 2, curY + 4.8, { align: 'center' });

    return curY + 7;
  };

  y = drawTableHeader(y);

  // --- TABLE ROWS ITERATION ---
  let counter = 1;

  teamData.forEach((member) => {
    if (member.tasks.length === 0) {
      if (y > pageHeight - marginBottom - 12) {
        drawPageFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawPageHeader();
        y = drawTableHeader(y);
      }

      pdf.setFillColor(255, 255, 255);
      pdf.rect(marginX, y, contentWidth, 8, 'F');
      pdf.setDrawColor(241, 245, 249);
      pdf.line(marginX, y + 8, marginX + contentWidth, y + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text(String(counter++), marginX + colW.no / 2, y + 5, { align: 'center' });

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(member.name, marginX + colW.no + 2, y + 5);

      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(148, 163, 184);
      pdf.text('Belum ada tugas tercatat', marginX + colW.no + colW.member + 2, y + 5);

      y += 8;
      return;
    }

    member.tasks.forEach((task, tIdx) => {
      // Split task text to fit colW.task
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      const textLines = pdf.splitTextToSize(task.text, colW.task - 4);
      
      const hasNotes = task.notes && task.notes.length > 0;
      let notesLines: string[] = [];
      if (hasNotes) {
        const latestNote = task.notes![task.notes!.length - 1];
        notesLines = pdf.splitTextToSize(`💬 Catatan (${latestNote.authorName}): "${latestNote.content}"`, colW.task - 4);
      }

      const totalLinesCount = textLines.length + (hasNotes ? notesLines.length : 0);
      const rowHeight = Math.max(8.5, totalLinesCount * 3.8 + (hasNotes ? 3 : 2));

      // Page break check
      if (y + rowHeight > pageHeight - marginBottom) {
        drawPageFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawPageHeader();
        y = drawTableHeader(y);
      }

      // Alternate row background
      if (counter % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(marginX, y, contentWidth, rowHeight, 'F');
      }

      // Row bottom divider
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.2);
      pdf.line(marginX, y + rowHeight, marginX + contentWidth, y + rowHeight);

      let curX = marginX;

      // Col: No
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text(String(counter), curX + colW.no / 2, y + 4.8, { align: 'center' });
      curX += colW.no;

      // Col: Member Name & Role
      if (tIdx === 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(15, 23, 42);
        pdf.text(member.name, curX + 2, y + 4.2);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(100, 116, 139);
        const roleShort = member.role.length > 22 ? member.role.substring(0, 20) + '...' : member.role;
        pdf.text(roleShort, curX + 2, y + 7.5);
      } else {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`↑ ${member.name}`, curX + 2, y + 4.5);
      }
      curX += colW.member;

      // Col: Task Text & Notes
      pdf.setFont('helvetica', task.completed ? 'normal' : 'bold');
      pdf.setFontSize(7.2);
      pdf.setTextColor(task.completed ? 148 : 30, task.completed ? 163 : 41, task.completed ? 184 : 59);

      let textY = y + 4.2;
      textLines.forEach((tl: string) => {
        pdf.text(tl, curX + 2, textY);
        textY += 3.4;
      });

      if (hasNotes) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(6.5);
        pdf.setTextColor(79, 70, 229); // indigo-600
        notesLines.forEach((nl: string) => {
          pdf.text(nl, curX + 2, textY);
          textY += 3.2;
        });
      }
      curX += colW.task;

      // Col: Category
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      pdf.setTextColor(71, 85, 105);
      pdf.text(task.category, curX + 2, y + 4.5);
      curX += colW.category;

      // Col: Priority Badge
      const prio = task.priority || 'Medium';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      if (prio === 'High') {
        pdf.setFillColor(255, 228, 230);
        pdf.setTextColor(190, 18, 60);
      } else if (prio === 'Medium') {
        pdf.setFillColor(254, 243, 199);
        pdf.setTextColor(180, 83, 9);
      } else {
        pdf.setFillColor(241, 245, 249);
        pdf.setTextColor(71, 85, 105);
      }
      pdf.roundedRect(curX + 1.5, y + 2, colW.priority - 3, 4.5, 1, 1, 'F');
      pdf.text(prio, curX + colW.priority / 2, y + 5.2, { align: 'center' });
      curX += colW.priority;

      // Col: Status
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      if (task.completed) {
        pdf.setTextColor(5, 150, 105);
        pdf.text('Selesai', curX + colW.status / 2, y + 5.2, { align: 'center' });
      } else {
        pdf.setTextColor(217, 119, 6);
        pdf.text('Proses', curX + colW.status / 2, y + 5.2, { align: 'center' });
      }

      y += rowHeight;
      counter++;
    });
  });

  // Draw footer on final page
  drawPageFooter(pageNumber);

  // Trigger instant PDF download
  pdf.save(filename);
}

/**
 * Generate an ALL-IN-ONE MASTER PDF combining:
 * 1. Visual Cards & Member Competencies
 * 2. Organizational Structure Graph & Chain of Command
 * 3. Complete Data Spreadsheet
 * 4. RACI Matrix & Team Absence Backup Distribution (Utama & Backup)
 * 5. Daily Shift Schedule & Standard Operating Procedures (SOPs)
 */
export async function exportComprehensiveMasterPDF(
  teamData: TeamMember[],
  title: string = 'DOKUMEN INDUK OPERASIONAL - BALISTATIONERY',
  subtitle: string = 'Kompilasi Lengkap Kartu Visual, Struktur, Spreadsheet, RACI, dan SOP Shift',
  sections: PDFExportSectionOptions = {
    includeCards: true,
    includeStructure: true,
    includeSpreadsheet: true,
    includeMatrix: true,
    includeSopSchedule: true
  },
  shifts: ShiftSchedule[] = DEFAULT_SHIFT_SCHEDULE,
  sops: SOPItem[] = DEFAULT_SOPS,
  filename: string = 'Master_Laporan_Lengkap_Balistationery.pdf'
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 182mm
  const marginBottom = 20;

  let y = 14;
  let pageNumber = 1;

  // Draw running header on subsequent pages
  const drawPageHeader = (sectionTitle: string = 'DOKUMEN INDUK OPERASIONAL') => {
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(marginX, 10, contentWidth, 9, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(245, 158, 11); // amber-400
    pdf.text('BALISTATIONERY', marginX + 3, 16);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`•  ${sectionTitle}`, marginX + 32, 16);

    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.setFontSize(7);
    const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' });
    pdf.text(dateStr, marginX + contentWidth - 3, 16, { align: 'right' });

    y = 24;
  };

  // Draw running footer on every page
  const drawPageFooter = (currentPage: number) => {
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text('Dokumen Resmi Terpadu • Balistationery Marketplace & E-Commerce Operations', marginX, pageHeight - 8);

    pdf.text(`Halaman ${currentPage}`, marginX + contentWidth, pageHeight - 8, { align: 'right' });
  };

  // Section Banner Divider Helper
  const drawSectionTitle = (secNum: string, secName: string, secDesc: string) => {
    if (y > pageHeight - marginBottom - 30) {
      drawPageFooter(pageNumber);
      pdf.addPage();
      pageNumber++;
      drawPageHeader(secName);
    }

    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.roundedRect(marginX, y, contentWidth, 13, 2, 2, 'F');
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(marginX, y, contentWidth, 13, 2, 2, 'D');

    // Section Number Badge
    pdf.setFillColor(79, 70, 229); // indigo-600
    pdf.roundedRect(marginX + 3, y + 2.5, 18, 8, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text(secNum, marginX + 12, y + 7.8, { align: 'center' });

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(secName, marginX + 24, y + 6.5);

    // Description
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139);
    pdf.text(secDesc, marginX + 24, y + 10.5);

    y += 17;
  };

  // --- COVER & SUMMARY HEADER (Page 1) ---
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.roundedRect(marginX, y, contentWidth, 34, 3, 3, 'F');

  // Gold Brand Tag
  pdf.setFillColor(245, 158, 11); // amber-400
  pdf.roundedRect(marginX + 6, y + 5, 36, 4.5, 1, 1, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(15, 23, 42);
  pdf.text('BALISTATIONERY', marginX + 8, y + 8.2);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(129, 140, 248); // indigo-300
  pdf.text('MASTER ALL-IN-ONE OPERATIONAL REPORT', marginX + 46, y + 8.2);

  // Main Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, marginX + 6, y + 17);

  // Subtitle
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(203, 213, 225); // slate-300
  const subLines = pdf.splitTextToSize(subtitle, contentWidth - 12);
  pdf.text(subLines[0] || '', marginX + 6, y + 23);

  // Metadata
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  const nowStr = `Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} • 5 Komponen Terpadu dalam 1 Dokumen`;
  pdf.text(nowStr, marginX + 6, y + 29);

  y += 38;

  // KPI Quick Stats Box
  const totalTasks = teamData.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = teamData.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
  const highPriorityCount = teamData.reduce((acc, m) => acc + m.tasks.filter(t => (t.priority || 'Medium') === 'High').length, 0);

  const cardW = (contentWidth - 9) / 4;
  const cardH = 14;

  const kpis = [
    { label: 'TOTAL PERSONEL', val: `${teamData.length} Staf`, bg: [248, 250, 252], col: [15, 23, 42] },
    { label: 'TOTAL JOBDESK', val: `${totalTasks} Tugas`, bg: [248, 250, 252], col: [15, 23, 42] },
    { label: 'PRIORITAS TINGGI', val: `${highPriorityCount} Urgent`, bg: [255, 241, 242], col: [190, 18, 60] },
    { label: 'DOKUMEN SOP', val: `${sops.length} Prosedur`, bg: [240, 253, 244], col: [21, 128, 61] }
  ];

  kpis.forEach((kpi, idx) => {
    const kX = marginX + idx * (cardW + 3);
    pdf.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(kX, y, cardW, cardH, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(kpi.label, kX + cardW / 2, y + 4.8, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(kpi.col[0], kpi.col[1], kpi.col[2]);
    pdf.text(kpi.val, kX + cardW / 2, y + 10.5, { align: 'center' });
  });

  y += cardH + 7;

  // ==========================================
  // SECTION 1: KARTU VISUAL PERSONEL & TUGAS
  // ==========================================
  if (sections.includeCards) {
    drawSectionTitle(
      'BAGIAN 1', 
      'KARTU VISUAL PERSONEL & DISTRIBUSI JOBDESK', 
      'Rincian profil anggota tim, divisi operasional, kompetensi, dan daftar tugas per individu.'
    );

    teamData.forEach((member, mIdx) => {
      // Calculate required height for member card
      const taskLinesCount = member.tasks.length;
      const cardHeight = Math.max(34, 16 + taskLinesCount * 4.6);

      if (y + cardHeight > pageHeight - marginBottom) {
        drawPageFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawPageHeader('BAGIAN 1: KARTU VISUAL PERSONEL');
      }

      // Member Box
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginX, y, contentWidth, cardHeight, 2, 2, 'FD');

      // Top color strip
      pdf.setFillColor(79, 70, 229); // indigo
      pdf.roundedRect(marginX, y, contentWidth, 3, 2, 2, 'F');

      // Member Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${mIdx + 1}. ${member.name}`, marginX + 4, y + 8.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Peran: ${member.role}  |  Gender: ${member.gender === 'female' ? 'Perempuan' : 'Laki-laki'}  |  Badge: ${member.badge}`, marginX + 4, y + 12.5);

      pdf.setDrawColor(241, 245, 249);
      pdf.line(marginX + 4, y + 14.5, marginX + contentWidth - 4, y + 14.5);

      // Tasks list inside member card
      let taskY = y + 18.5;
      if (member.tasks.length === 0) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Belum ada tugas operasional terdaftar.', marginX + 6, taskY);
      } else {
        member.tasks.forEach((task, tIdx) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(6.8);
          pdf.setTextColor(79, 70, 229);
          pdf.text(`• [${task.category}]`, marginX + 6, taskY);

          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(30, 41, 59);
          const taskTrunc = task.text.length > 85 ? task.text.substring(0, 82) + '...' : task.text;
          pdf.text(taskTrunc, marginX + 36, taskY);

          // Priority Tag
          const prio = task.priority || 'Medium';
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(6);
          if (prio === 'High') {
            pdf.setTextColor(190, 18, 60);
          } else if (prio === 'Medium') {
            pdf.setTextColor(180, 83, 9);
          } else {
            pdf.setTextColor(71, 85, 105);
          }
          pdf.text(`[${prio}]`, marginX + contentWidth - 14, taskY);

          taskY += 4.5;
        });
      }

      y += cardHeight + 4;
    });

    y += 4;
  }

  // ==========================================
  // SECTION 2: STRUKTUR ORGANISASI & ALUR KOMANDO
  // ==========================================
  if (sections.includeStructure) {
    drawSectionTitle(
      'BAGIAN 2', 
      'STRUKTUR ORGANISASI & ALUR KOMANDO OPERASIONAL', 
      'Hierarki Marketplace Balistationery, koordinasi pimpinan toko, dan alur penugasan divisi.'
    );

    const leader = teamData.find(m => m.role.toLowerCase().includes('leader') || m.role.toLowerCase().includes('koordinator')) || teamData[0];
    const otherMembers = teamData.filter(m => m.id !== leader?.id);

    // Box 1: Perusahaan / Marketplace Balistationery (Hub Pusat)
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.roundedRect(marginX + 20, y, contentWidth - 40, 16, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(245, 158, 11); // gold
    pdf.text('MARKETPLACE / PERUSAHAAN: BALISTATIONERY', marginX + contentWidth / 2, y + 6.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(226, 232, 240);
    pdf.text('Pusat Operasional E-Commerce, Multi-Channel Store & Logistik', marginX + contentWidth / 2, y + 11.5, { align: 'center' });

    y += 21;

    // Connector Line
    pdf.setDrawColor(79, 70, 229);
    pdf.setLineWidth(0.6);
    pdf.line(marginX + contentWidth / 2, y - 5, marginX + contentWidth / 2, y);

    // Box 2: Koordinator Tim Online / Leader
    if (leader) {
      pdf.setFillColor(238, 242, 255); // indigo-50
      pdf.setDrawColor(199, 210, 254);
      pdf.roundedRect(marginX + 30, y, contentWidth - 60, 15, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(67, 56, 202);
      pdf.text(`KOORDINATOR TIM ONLINE: ${leader.name}`, marginX + contentWidth / 2, y + 6, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`${leader.role} • Pengawas Mutu & Penyelaras Workflow Tim`, marginX + contentWidth / 2, y + 10.5, { align: 'center' });

      y += 19;
    }

    // Connector Fork to Divisions
    pdf.setDrawColor(79, 70, 229);
    pdf.line(marginX + contentWidth / 2, y - 4, marginX + contentWidth / 2, y);
    pdf.line(marginX + 15, y, marginX + contentWidth - 15, y);

    y += 4;

    // Sub-Divisions Grid (4 boxes)
    const subBoxes = [
      { name: 'DIVISI CS & CHAT', staff: otherMembers[0]?.name || 'Staff CS', role: 'Pelayanan Chat, Komplain, WhatsApp' },
      { name: 'DIVISI PACKING & LOGISTIK', staff: otherMembers[1]?.name || 'Staff Logistik', role: 'Quality Control, Cetak Resi, Ekspedisi' },
      { name: 'DIVISI MARKETING & LIVE', staff: otherMembers[2]?.name || 'Host Live', role: 'Live Streaming, Konten, Promo Campaign' },
      { name: 'DIVISI NOTA & KEUANGAN', staff: otherMembers[3]?.name || 'Admin Keuangan', role: 'Pelunasan, Stok Opname, Rekonsiliasi' }
    ];

    const boxW = (contentWidth - 9) / 4;
    subBoxes.forEach((sb, sIdx) => {
      const bX = marginX + sIdx * (boxW + 3);
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(bX, y, boxW, 20, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(sb.name, bX + boxW / 2, y + 5, { align: 'center' });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(79, 70, 229);
      pdf.text(sb.staff, bX + boxW / 2, y + 10.5, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(100, 116, 139);
      const roleLines = pdf.splitTextToSize(sb.role, boxW - 4);
      pdf.text(roleLines[0] || '', bX + boxW / 2, y + 15, { align: 'center' });
    });

    y += 26;
  }

  // ==========================================
  // SECTION 3: TABEL SPREADSHEET LENGKAP
  // ==========================================
  if (sections.includeSpreadsheet) {
    drawSectionTitle(
      'BAGIAN 3', 
      'TABEL SPREADSHEET INTERAKTIF & PRIORITAS TUGAS', 
      'Data tabular lengkap seluruh tugas, nama personel, kategori kerja, prioritas, dan status.'
    );

    // Table Header
    const colW = { no: 8, member: 38, task: 78, category: 28, priority: 15, status: 15 };

    const drawTableHead = (curY: number) => {
      pdf.setFillColor(30, 41, 59);
      pdf.rect(marginX, curY, contentWidth, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);

      let curX = marginX;
      pdf.text('NO', curX + colW.no / 2, curY + 4.8, { align: 'center' });
      curX += colW.no;
      pdf.text('NAMA & JABATAN', curX + 2, curY + 4.8);
      curX += colW.member;
      pdf.text('RINCIAN TUGAS', curX + 2, curY + 4.8);
      curX += colW.task;
      pdf.text('DIVISI / KATEGORI', curX + 2, curY + 4.8);
      curX += colW.category;
      pdf.text('PRIORITAS', curX + colW.priority / 2, curY + 4.8, { align: 'center' });
      curX += colW.priority;
      pdf.text('STATUS', curX + colW.status / 2, curY + 4.8, { align: 'center' });

      return curY + 7;
    };

    y = drawTableHead(y);

    let counter = 1;
    teamData.forEach((member) => {
      member.tasks.forEach((task, tIdx) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.2);
        const textLines = pdf.splitTextToSize(task.text, colW.task - 4);
        const rowHeight = Math.max(7.5, textLines.length * 3.6 + 2);

        if (y + rowHeight > pageHeight - marginBottom) {
          drawPageFooter(pageNumber);
          pdf.addPage();
          pageNumber++;
          drawPageHeader('BAGIAN 3: TABEL SPREADSHEET TUGAS');
          y = drawTableHead(y);
        }

        if (counter % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(marginX, y, contentWidth, rowHeight, 'F');
        }

        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.2);
        pdf.line(marginX, y + rowHeight, marginX + contentWidth, y + rowHeight);

        let curX = marginX;

        // No
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(String(counter), curX + colW.no / 2, y + 4.5, { align: 'center' });
        curX += colW.no;

        // Member
        if (tIdx === 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7.5);
          pdf.setTextColor(15, 23, 42);
          pdf.text(member.name, curX + 2, y + 4.2);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.2);
          pdf.setTextColor(100, 116, 139);
          const rSub = member.role.length > 20 ? member.role.substring(0, 18) + '...' : member.role;
          pdf.text(rSub, curX + 2, y + 7.2);
        } else {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(6.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`↑ ${member.name}`, curX + 2, y + 4.5);
        }
        curX += colW.member;

        // Task
        pdf.setFont('helvetica', task.completed ? 'normal' : 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(task.completed ? 148 : 30, task.completed ? 163 : 41, task.completed ? 184 : 59);
        let tY = y + 4.2;
        textLines.forEach((tl: string) => {
          pdf.text(tl, curX + 2, tY);
          tY += 3.4;
        });
        curX += colW.task;

        // Category
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text(task.category, curX + 2, y + 4.5);
        curX += colW.category;

        // Priority
        const prio = task.priority || 'Medium';
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        if (prio === 'High') pdf.setTextColor(190, 18, 60);
        else if (prio === 'Medium') pdf.setTextColor(180, 83, 9);
        else pdf.setTextColor(71, 85, 105);
        pdf.text(prio, curX + colW.priority / 2, y + 4.5, { align: 'center' });
        curX += colW.priority;

        // Status
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        if (task.completed) {
          pdf.setTextColor(5, 150, 105);
          pdf.text('Selesai', curX + colW.status / 2, y + 4.5, { align: 'center' });
        } else {
          pdf.setTextColor(217, 119, 6);
          pdf.text('Aktif', curX + colW.status / 2, y + 4.5, { align: 'center' });
        }

        y += rowHeight;
        counter++;
      });
    });

    y += 6;
  }

  // ==========================================
  // SECTION 4: MATRIKS RACI & CADANGAN BACKUP
  // ==========================================
  if (sections.includeMatrix) {
    drawSectionTitle(
      'BAGIAN 4', 
      'MATRIKS DISTRIBUSI TANGGUNG JAWAB (RACI) & BACKUP TIM', 
      'Pemetaan tegas penanggung jawab utama dan staf backup jika personel utama berhalangan hadir.'
    );

    // RACI Columns
    const raciColW = {
      no: 8,
      task: 62,
      cat: 30,
      primary: 42,
      backup: 40
    };

    const drawRaciHead = (curY: number) => {
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(marginX, curY, contentWidth, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.8);
      pdf.setTextColor(255, 255, 255);

      let curX = marginX;
      pdf.text('NO', curX + raciColW.no / 2, curY + 4.8, { align: 'center' });
      curX += raciColW.no;
      pdf.text('AKTIVITAS / TUGAS OPERASIONAL', curX + 2, curY + 4.8);
      curX += raciColW.task;
      pdf.text('DIVISI', curX + 2, curY + 4.8);
      curX += raciColW.cat;
      pdf.text('⭐ TUGAS UTAMA SIAPA (PIC)', curX + 2, curY + 4.8);
      curX += raciColW.primary;
      pdf.text('🛡️ CADANGAN BACKUP (JIKA ABSEN)', curX + 2, curY + 4.8);

      return curY + 7;
    };

    y = drawRaciHead(y);

    DETAILED_COMPETENCIES.forEach((comp: RaciCompetency, cIdx: number) => {
      // Find matching primary and backup members
      const matchingMembers = teamData.filter(m => 
        comp.defaultUtama.some(u => u.toLowerCase() === m.name.toLowerCase()) ||
        m.tasks.some(t => t.text.toLowerCase().includes(comp.label.toLowerCase().slice(0, 8)))
      );

      const primary = matchingMembers[0]?.name || comp.defaultUtama.join(', ') || teamData[0]?.name || 'Leader Tim';
      const backupMembers = teamData.filter(m => comp.defaultBackup.some(b => b.toLowerCase() === m.name.toLowerCase()));
      const backup = backupMembers.length > 0 
        ? backupMembers.map(m => m.name).join(', ')
        : (comp.defaultBackup.join(', ') || 'Staf Cadangan');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const compLines = pdf.splitTextToSize(comp.label, raciColW.task - 4);
      const rowH = Math.max(8, compLines.length * 3.8 + 2);

      if (y + rowH > pageHeight - marginBottom) {
        drawPageFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawPageHeader('BAGIAN 4: MATRIKS TANGGUNG JAWAB RACI & BACKUP');
        y = drawRaciHead(y);
      }

      if (cIdx % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(marginX, y, contentWidth, rowH, 'F');
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.2);
      pdf.line(marginX, y + rowH, marginX + contentWidth, y + rowH);

      let curX = marginX;

      // No
      pdf.setTextColor(148, 163, 184);
      pdf.text(String(cIdx + 1), curX + raciColW.no / 2, y + 4.8, { align: 'center' });
      curX += raciColW.no;

      // Activity
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      let cy = y + 4.2;
      compLines.forEach((cl: string) => {
        pdf.text(cl, curX + 2, cy);
        cy += 3.4;
      });
      curX += raciColW.task;

      // Divisi
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(comp.category, curX + 2, y + 4.8);
      curX += raciColW.cat;

      // Primary
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`⭐ ${primary}`, curX + 2, y + 4.8);
      curX += raciColW.primary;

      // Backup
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      pdf.setTextColor(5, 150, 105);
      const bTrunc = backup.length > 25 ? backup.substring(0, 23) + '...' : backup;
      pdf.text(`🛡️ ${bTrunc}`, curX + 2, y + 4.8);

      y += rowH;
    });

    y += 6;
  }

  // ==========================================
  // SECTION 5: JADWAL SHIFT & PERPUSTAKAAN SOP
  // ==========================================
  if (sections.includeSopSchedule) {
    drawSectionTitle(
      'BAGIAN 5', 
      'JADWAL SHIFT HARIAN & STANDAR OPERASIONAL PROSEDUR (SOP)', 
      'Ritme kerja shift jam operasional serta panduan mutu penanganan pesanan dan customer service.'
    );

    // 5A. Shift Schedule Sub-table
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('A. Jadwal Shift & Milestone Operasional (08:30 - 17:30 WIB)', marginX, y);
    y += 4;

    const shiftColW = { time: 28, label: 55, action: 65, pic: 34 };
    
    // Shift table head
    pdf.setFillColor(79, 70, 229); // indigo
    pdf.rect(marginX, y, contentWidth, 6.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(255, 255, 255);

    let sx = marginX;
    pdf.text('JAM / WAKTU', sx + 2, y + 4.5);
    sx += shiftColW.time;
    pdf.text('MILESTONE / AGENDA', sx + 2, y + 4.5);
    sx += shiftColW.label;
    pdf.text('TINDAKAN OPERASIONAL', sx + 2, y + 4.5);
    sx += shiftColW.action;
    pdf.text('PENANGGUNG JAWAB (PIC)', sx + 2, y + 4.5);

    y += 6.5;

    shifts.forEach((s, sIdx) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      const actLines = pdf.splitTextToSize(s.action, shiftColW.action - 4);
      const rowH = Math.max(7.5, actLines.length * 3.4 + 2);

      if (y + rowH > pageHeight - marginBottom) {
        drawPageFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawPageHeader('BAGIAN 5: JADWAL SHIFT & SOP');
      }

      if (sIdx % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(marginX, y, contentWidth, rowH, 'F');
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.2);
      pdf.line(marginX, y + rowH, marginX + contentWidth, y + rowH);

      let curX = marginX;

      // Time
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(67, 56, 202);
      pdf.text(s.time, curX + 2, y + 4.5);
      curX += shiftColW.time;

      // Label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.8);
      pdf.setTextColor(15, 23, 42);
      const lTrunc = s.label.length > 32 ? s.label.substring(0, 30) + '...' : s.label;
      pdf.text(lTrunc, curX + 2, y + 4.5);
      curX += shiftColW.label;

      // Action
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(51, 65, 85);
      let ay = y + 4.2;
      actLines.forEach((al: string) => {
        pdf.text(al, curX + 2, ay);
        ay += 3.2;
      });
      curX += shiftColW.action;

      // PIC
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(79, 70, 229);
      const picTrunc = s.assignedTo.length > 22 ? s.assignedTo.substring(0, 20) + '...' : s.assignedTo;
      pdf.text(picTrunc, curX + 2, y + 4.5);

      y += rowH;
    });

    y += 8;

    // 5B. SOP Library Cards
    if (y > pageHeight - marginBottom - 30) {
      drawPageFooter(pageNumber);
      pdf.addPage();
      pageNumber++;
      drawPageHeader('BAGIAN 5: STANDAR OPERASIONAL PROSEDUR (SOP)');
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('B. Perpustakaan SOP & Standar Prosedur Mutu', marginX, y);
    y += 4;

    sops.forEach((sop, sopIdx) => {
      const checkLinesCount = sop.checklist.length;
      const sopCardH = Math.max(26, 14 + checkLinesCount * 4);

      if (y + sopCardH > pageHeight - marginBottom) {
        drawPageFooter(pageNumber);
        pdf.addPage();
        pageNumber++;
        drawPageHeader('BAGIAN 5: STANDAR OPERASIONAL PROSEDUR (SOP)');
      }

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginX, y, contentWidth, sopCardH, 2, 2, 'FD');

      // Top strip
      pdf.setFillColor(5, 150, 105); // emerald
      pdf.roundedRect(marginX, y, contentWidth, 2.5, 2, 2, 'F');

      // SOP Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${sopIdx + 1}. ${sop.title}`, marginX + 4, y + 7.5);

      // SLA Tag
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(5, 150, 105);
      pdf.text(`[Target SLA: ${sop.sla}]`, marginX + contentWidth - 45, y + 7.5);

      // Description
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      const descLines = pdf.splitTextToSize(sop.description, contentWidth - 10);
      pdf.text(descLines[0] || '', marginX + 4, y + 11.5);

      // Checklist bullets
      let cy = y + 15.5;
      sop.checklist.forEach((item) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(51, 65, 85);
        const itemTrunc = item.length > 95 ? item.substring(0, 92) + '...' : item;
        pdf.text(`☑  ${itemTrunc}`, marginX + 6, cy);
        cy += 3.8;
      });

      y += sopCardH + 3.5;
    });
  }

  // Draw footer on final page
  drawPageFooter(pageNumber);

  // Trigger instant PDF download
  pdf.save(filename);
}

export async function exportViewToPDF(
  elementId: string = 'printable-area',
  filename: string = 'Laporan_Tampilan_Jobdesk.pdf',
  teamData?: TeamMember[],
  title?: string,
  subtitle?: string
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    if (teamData && teamData.length > 0) {
      return exportFullReportToPDF(teamData, title, subtitle, filename);
    }
    throw new Error('Area tampilan tidak ditemukan untuk diekspor ke PDF');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      ignoreElements: (el) => {
        return el.classList?.contains('no-print') || el.tagName.toLowerCase() === 'svg';
      }
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    
    let heightLeft = contentHeight;
    let position = margin;

    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
    heightLeft -= (pageHeight - (margin * 2));

    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - (margin * 2));
    }

    pdf.save(filename);
  } catch (canvasErr) {
    console.warn('html2canvas view export error, falling back cleanly to vector PDF report:', canvasErr);
    if (teamData && teamData.length > 0) {
      await exportFullReportToPDF(teamData, title, subtitle, filename);
    } else {
      throw canvasErr;
    }
  }
}

export function parseCSV(csvText: string): TeamMember[] {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const grouped = new Map<string, TeamMember>();
  const availableThemes: TeamMember['theme'][] = ['indigo', 'rose', 'purple', 'emerald', 'amber', 'cyan', 'blue'];
  let themeIdx = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 3) continue;

    const name = (cols[1] || 'ANGGOTA').toUpperCase();
    const role = cols[2] || 'STAFF OPERASIONAL';
    const taskText = cols[3] || '';
    const rawCategory = cols[4];
    const category = rawCategory || autoDetectCategory(taskText);
    
    // Check if col[5] is Priority or Completion
    let priority: TaskPriority = 'Medium';
    let completed = false;

    if (cols[5] === 'High' || cols[5] === 'Medium' || cols[5] === 'Low') {
      priority = cols[5] as TaskPriority;
      completed = cols[6]?.toLowerCase() === 'selesai' || cols[6]?.toLowerCase() === 'true';
    } else {
      priority = autoDetectPriority(taskText);
      completed = cols[5]?.toLowerCase() === 'selesai' || cols[5]?.toLowerCase() === 'true';
    }

    const theme = (cols[7] as TeamMember['theme']) || availableThemes[themeIdx % availableThemes.length];

    if (!grouped.has(name)) {
      const lowerName = name.toLowerCase();
      const isFemaleGuess = lowerName.includes('siti') || lowerName.includes('dewi') || lowerName.includes('putri') || lowerName.includes('dinda') || lowerName.includes('rahma') || lowerName.includes('lilis') || lowerName.includes('nur') || lowerName.includes('lia');
      const memberGender: Gender = isFemaleGuess ? 'female' : 'male';
      const memberAvatar = isFemaleGuess ? 'female-admin' : 'male-leader';

      grouped.set(name, {
        id: `m-${Date.now()}-${i}`,
        name,
        role,
        badge: 'Team Member',
        theme: availableThemes.includes(theme) ? theme : availableThemes[themeIdx++ % availableThemes.length],
        gender: memberGender,
        avatarId: memberAvatar,
        tasks: []
      });
    }

    if (taskText) {
      grouped.get(name)!.tasks.push({
        id: `t-${Date.now()}-${i}`,
        text: taskText,
        category: category as any,
        priority,
        completed
      });
    }
  }

  return Array.from(grouped.values());
}
