import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { StatSummary } from './components/StatSummary';
import { ViewSwitcher } from './components/ViewSwitcher';
import { CardsView } from './components/CardsView';
import { StructureGraphView } from './components/StructureGraphView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { MatrixView } from './components/MatrixView';
import { KanbanView } from './components/KanbanView';
import { ScheduleSopView } from './components/ScheduleSopView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddMemberModal } from './components/AddMemberModal';
import { ImportModal } from './components/ImportModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { AvatarSelectorModal } from './components/AvatarSelectorModal';
import { TaskNotesSidePanel } from './components/TaskNotesSidePanel';
import { ExportPdfModal } from './components/ExportPdfModal';
import { Toast, ToastMessage } from './components/Toast';
import { TeamMember, ViewMode, TaskCategory, JobdeskTask, TaskPriority, SortOption, Gender, TaskNote } from './types/jobdesk';
import { DEFAULT_TEAM_DATA } from './data/defaultData';
import { initAuth, googleSignIn, googleLogout, getAccessToken } from './services/firebaseAuth';
import { syncDataToSpreadsheet, pullDataFromSpreadsheet, SPREADSHEET_URL } from './services/googleSheetsService';
import { exportViewToPDF, exportFullReportToPDF } from './utils/exportUtils';

const STORAGE_KEY_DATA = 'jobdesk_team_data_v3';
const STORAGE_KEY_TITLE = 'jobdesk_title_v3';
const STORAGE_KEY_SUBTITLE = 'jobdesk_subtitle_v3';
const STORAGE_KEY_VIEW = 'jobdesk_view_v3';

export default function App() {
  // Load saved state from LocalStorage
  const [teamData, setTeamData] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal memuat data dari LocalStorage:', e);
    }
    return DEFAULT_TEAM_DATA;
  });

  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_TITLE) || 'JOBDESK TEAM ONLINE - BALISTATIONERY';
  });

  const [docSubtitle, setDocSubtitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SUBTITLE) || 
      'Struktur Pembagian Tugas Operasional Marketplace Balistationery, E-Commerce, CS & Logistik';
  });

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEY_VIEW) as ViewMode) || 'cards';
  });

  // Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Modals & Toasts
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [avatarModalMember, setAvatarModalMember] = useState<TeamMember | null>(null);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [activeNotesTaskContext, setActiveNotesTaskContext] = useState<{ memberId: string; taskId: string } | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportPdfModalOpen, setIsExportPdfModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());

  // Google Sheets Sync States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncSuccess, setSheetsSyncSuccess] = useState(false);
  const isFirstMount = useRef(true);

  // Show Toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Initialize Auth on Mount and auto-pull from Google Sheets if logged in
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        // Automatically pull latest data from Google Sheets so it follows sheet across logins
        try {
          setIsSyncingSheets(true);
          const remoteData = await pullDataFromSpreadsheet(token);
          if (remoteData && remoteData.length > 0) {
            setTeamData(remoteData);
            showToast(`Data tim berhasil dimuat dari Google Spreadsheet`, 'info');
          }
        } catch (err: any) {
          console.warn('Auto-pull from spreadsheet info:', err.message);
        } finally {
          setIsSyncingSheets(false);
        }
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(teamData));
      localStorage.setItem(STORAGE_KEY_TITLE, docTitle);
      localStorage.setItem(STORAGE_KEY_SUBTITLE, docSubtitle);
      localStorage.setItem(STORAGE_KEY_VIEW, currentView);
      setLastSavedAt(new Date());
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [teamData, docTitle, docSubtitle, currentView]);

  // 3. Debounced Auto-Sync to Google Spreadsheet when user is logged in
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!currentUser) return;

    const timer = setTimeout(async () => {
      const token = await getAccessToken();
      if (!token) return;

      try {
        setIsSyncingSheets(true);
        await syncDataToSpreadsheet(teamData, token);
        setSheetsSyncSuccess(true);
      } catch (err: any) {
        console.error('Auto-sync error:', err);
      } finally {
        setIsSyncingSheets(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [teamData, currentUser]);

  // Google Login Handlers
  const handleGoogleSignIn = async () => {
    try {
      setIsSyncingSheets(true);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        showToast(`Berhasil masuk sebagai ${res.user.displayName || res.user.email}`);

        // Pull latest data from spreadsheet on login
        try {
          const remoteData = await pullDataFromSpreadsheet(res.accessToken);
          if (remoteData && remoteData.length > 0) {
            setTeamData(remoteData);
            showToast(`Data tim disinkronkan dari Google Spreadsheet`);
          } else {
            // Push current data into spreadsheet if remote was empty
            await syncDataToSpreadsheet(teamData, res.accessToken);
            showToast(`Data awal berhasil dicatat ke Google Spreadsheet`);
          }
        } catch (e: any) {
          console.warn('Initial sync warning:', e);
        }
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      showToast('Gagal masuk ke akun Google. Silakan coba kembali.', 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleLogout();
    setCurrentUser(null);
    showToast('Telah keluar dari akun Google');
  };

  const handleManualSyncGoogleSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleGoogleSignIn();
      return;
    }

    try {
      setIsSyncingSheets(true);
      await syncDataToSpreadsheet(teamData, token);
      setSheetsSyncSuccess(true);
      showToast('Data berhasil disimpan ke masing-masing sheet spreadsheet!');
    } catch (err: any) {
      console.error('Manual sync failed:', err);
      showToast(`Gagal menyimpan ke spreadsheet: ${err.message}`, 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handlePullGoogleSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleGoogleSignIn();
      return;
    }

    try {
      setIsSyncingSheets(true);
      const remoteData = await pullDataFromSpreadsheet(token);
      if (remoteData && remoteData.length > 0) {
        setTeamData(remoteData);
        showToast('Data berhasil diperbarui dari Google Spreadsheet!');
      } else {
        showToast('Spreadsheet belum memiliki baris data.');
      }
    } catch (err: any) {
      console.error('Pull failed:', err);
      showToast(`Gagal menarik data: ${err.message}`, 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // CRUD Actions
  const handleUpdateMember = (memberId: string, updates: Partial<TeamMember>) => {
    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, ...updates };
      }
      return m;
    }));
    showToast(`Data personel berhasil diperbarui`);
  };

  const handleDeleteMember = (memberId: string) => {
    const member = teamData.find(m => m.id === memberId);
    setTeamData(prev => prev.filter(m => m.id !== memberId));
    showToast(`Personel ${member?.name || ''} telah dihapus dari daftar`);
  };

  const handleAddMember = (newMemberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...newMemberData,
      id: `m-${Date.now()}`
    };
    setTeamData(prev => [...prev, newMember]);
    showToast(`Personel ${newMember.name} berhasil ditambahkan`);
  };

  const handleAddTask = (
    memberId: string, 
    taskText: string, 
    category: TaskCategory = 'Manajemen & Katalog',
    priority: TaskPriority = 'Medium'
  ) => {
    const newTask: JobdeskTask = {
      id: `t-${Date.now()}`,
      text: taskText,
      category,
      priority,
      completed: false
    };

    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          tasks: [...m.tasks, newTask]
        };
      }
      return m;
    }));
    showToast('Tugas baru berhasil ditambahkan');
  };

  const handleUpdateTask = (memberId: string, taskId: string, updates: Partial<JobdeskTask>) => {
    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          tasks: m.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        };
      }
      return m;
    }));
  };

  const handleDeleteTask = (memberId: string, taskId: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          tasks: m.tasks.filter(t => t.id !== taskId)
        };
      }
      return m;
    }));
    showToast('Item tugas berhasil dihapus');
  };

  const handleToggleTaskComplete = (memberId: string, taskId: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          tasks: m.tasks.map(t => {
            if (t.id === taskId) {
              const nextState = !t.completed;
              return { ...t, completed: nextState };
            }
            return t;
          })
        };
      }
      return m;
    }));
  };

  const handleSelectAvatar = (memberId: string, gender: Gender, avatarId: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, gender, avatarId };
      }
      return m;
    }));
    showToast('Profil karakter & gender berhasil diperbarui');
  };

  const handleImportCSV = (newMembers: TeamMember[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setTeamData(newMembers);
      showToast(`Data berhasil digantikan dengan ${newMembers.length} personel baru`);
    } else {
      setTeamData(prev => [...prev, ...newMembers]);
      showToast(`Berhasil menambahkan ${newMembers.length} personel dari file CSV`);
    }
  };

  const handleConfirmReset = () => {
    setTeamData(DEFAULT_TEAM_DATA);
    setDocTitle('JOBDESK TEAM ONLINE');
    setDocSubtitle('Struktur Pembagian Tugas Operasional E-Commerce, Customer Service & Logistik');
    showToast('Data berhasil dikembalikan ke standar awal');
  };

  const handleManualSave = () => {
    setLastSavedAt(new Date());
    showToast('Seluruh perubahan berhasil disimpan di penyimpanan browser');
  };

  // Task Notes Handlers
  const handleOpenNotesForTask = (memberId: string, taskId: string) => {
    setActiveNotesTaskContext({ memberId, taskId });
    setIsNotesPanelOpen(true);
  };

  const handleOpenNotesPanel = () => {
    setActiveNotesTaskContext(null);
    setIsNotesPanelOpen(true);
  };

  const handleAddNote = (memberId: string, taskId: string, noteData: Omit<TaskNote, 'id' | 'createdAt'>) => {
    const newNote: TaskNote = {
      ...noteData,
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          tasks: m.tasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                notes: [...(t.notes || []), newNote]
              };
            }
            return t;
          })
        };
      }
      return m;
    }));
    showToast('Catatan berhasil ditambahkan pada tugas');
  };

  const handleDeleteNote = (memberId: string, taskId: string, noteId: string) => {
    setTeamData(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          tasks: m.tasks.map(t => {
            if (t.id === taskId && t.notes) {
              return {
                ...t,
                notes: t.notes.filter(n => n.id !== noteId)
              };
            }
            return t;
          })
        };
      }
      return m;
    }));
    showToast('Catatan tugas dihapus');
  };

  // PDF Export Handlers
  const handleExportViewPDF = async () => {
    try {
      setIsExportingPDF(true);
      showToast('Menyiapkan file PDF...', 'info');
      await exportViewToPDF(
        'printable-area',
        `${docTitle.replace(/\s+/g, '_')}_Tampilan.pdf`,
        teamData,
        docTitle,
        docSubtitle
      );
      showToast('File PDF berhasil diunduh!');
    } catch (err: any) {
      console.error('PDF view export error:', err);
      try {
        await exportFullReportToPDF(teamData, docTitle, docSubtitle, `${docTitle.replace(/\s+/g, '_')}_Laporan.pdf`);
        showToast('File PDF berhasil diunduh (Format Laporan Resmi)!');
      } catch (fallbackErr: any) {
        showToast('Gagal mengunduh PDF: ' + (fallbackErr.message || 'Error'), 'error');
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportFullReportPDF = async () => {
    try {
      setIsExportingPDF(true);
      showToast('Membuat laporan lengkap PDF A4...', 'info');
      await exportFullReportToPDF(teamData, docTitle, docSubtitle, `${docTitle.replace(/\s+/g, '_')}_Laporan_Lengkap.pdf`);
      showToast('Laporan PDF lengkap berhasil diunduh!');
    } catch (err: any) {
      console.error('Full PDF report error:', err);
      showToast('Gagal mengunduh laporan PDF: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const totalNotesCount = teamData.reduce((acc, m) => {
    return acc + m.tasks.reduce((tAcc, t) => tAcc + (t.notes ? t.notes.length : 0), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Top Header with Google Sheets Sync */}
      <Header
        title={docTitle}
        subtitle={docSubtitle}
        onUpdateTitle={setDocTitle}
        onUpdateSubtitle={setDocSubtitle}
        teamData={teamData}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onSave={handleManualSave}
        lastSavedAt={lastSavedAt}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onSyncGoogleSheets={handleManualSyncGoogleSheets}
        onPullGoogleSheets={handlePullGoogleSheets}
        isSyncingSheets={isSyncingSheets}
        sheetsSyncSuccess={sheetsSyncSuccess}
        onOpenNotesPanel={handleOpenNotesPanel}
        totalNotesCount={totalNotesCount}
        onExportViewPDF={handleExportViewPDF}
        onExportFullReportPDF={handleExportFullReportPDF}
        onOpenExportPdfModal={() => setIsExportPdfModalOpen(true)}
        isExportingPDF={isExportingPDF}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="printable-area">
        
        {/* KPI / Metric Summary Strip */}
        <StatSummary teamData={teamData} />

        {/* View Switcher, Filter & Search Bar */}
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedMember={selectedMember}
          onMemberChange={setSelectedMember}
          sortOption={sortOption}
          onSortChange={setSortOption}
          teamData={teamData}
        />

        {/* Dynamic Views */}
        <div id="view-workspace">
          {currentView === 'cards' && (
            <CardsView
              teamData={teamData}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              selectedMember={selectedMember}
              sortOption={sortOption}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenAvatarModal={(m) => setAvatarModalMember(m)}
              onOpenNotesForTask={handleOpenNotesForTask}
            />
          )}

          {currentView === 'structure' && (
            <StructureGraphView
              teamData={teamData}
              onToggleTaskComplete={handleToggleTaskComplete}
              onUpdateTask={handleUpdateTask}
              onOpenAvatarModal={(m) => setAvatarModalMember(m)}
              onOpenNotesForTask={handleOpenNotesForTask}
            />
          )}

          {currentView === 'spreadsheet' && (
            <SpreadsheetView
              teamData={teamData}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              selectedMember={selectedMember}
              sortOption={sortOption}
              onUpdateMember={handleUpdateMember}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onOpenAvatarModal={(m) => setAvatarModalMember(m)}
              onOpenNotesForTask={handleOpenNotesForTask}
            />
          )}

          {currentView === 'matrix' && (
            <MatrixView
              teamData={teamData}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanView
              teamData={teamData}
              onToggleTaskComplete={handleToggleTaskComplete}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {currentView === 'schedule' && (
            <ScheduleSopView teamData={teamData} />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView teamData={teamData} />
          )}
        </div>

      </main>

      {/* Printable Watermark / Print Header */}
      <div className="hidden print:block p-4 text-center border-t border-slate-300 mt-8 text-xs text-slate-500 font-mono">
        Dicetak dari SOP & Manajemen Jobdesk Team Online pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="font-semibold text-slate-800">Sistem SOP & Jobdesk Team Online</span>
            <span>·</span>
            <span>Tersinkronisasi dengan Google Spreadsheet & Cloud</span>
          </div>
          <div>
            <span>ID Dokumen: 10VpsulpMNzoD8BtZCRiJHbZI3vgKbhW5bKRE3cj3qBc</span>
          </div>
        </div>
      </footer>

      {/* Modals & Notifications */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />

      <AvatarSelectorModal
        isOpen={!!avatarModalMember}
        onClose={() => setAvatarModalMember(null)}
        member={avatarModalMember}
        onSelectAvatar={handleSelectAvatar}
      />

      <TaskNotesSidePanel
        isOpen={isNotesPanelOpen}
        onClose={() => setIsNotesPanelOpen(false)}
        teamData={teamData}
        activeTaskContext={activeNotesTaskContext}
        onSelectTaskContext={(ctx) => setActiveNotesTaskContext(ctx)}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSV}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      <ExportPdfModal
        isOpen={isExportPdfModalOpen}
        onClose={() => setIsExportPdfModalOpen(false)}
        teamData={teamData}
        docTitle={docTitle}
        docSubtitle={docSubtitle}
        onSuccessToast={(msg) => showToast(msg)}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
