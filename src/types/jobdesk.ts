export type TaskCategory = 
  | 'Manajemen & Katalog'
  | 'Nota & Keuangan'
  | 'CS & Chat'
  | 'Packing & Logistik'
  | 'Live Streaming';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type SortOption = 'default' | 'priority-desc' | 'priority-asc' | 'alpha';

export type ThemeColor = 'indigo' | 'rose' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'blue';

export type Gender = 'male' | 'female';

export interface CharacterAvatar {
  id: string;
  name: string;
  gender: Gender;
  roleTag: string;
  avatarBg: string;
  badge: string;
}

export interface TaskNote {
  id: string;
  authorName: string;
  authorRole?: string;
  authorAvatarId: string;
  authorGender: Gender;
  content: string;
  createdAt: string;
}

export interface JobdeskTask {
  id: string;
  text: string;
  category: TaskCategory;
  priority?: TaskPriority;
  completed?: boolean;
  notes?: TaskNote[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge: string;
  theme: ThemeColor;
  gender: Gender;
  avatarId: string;
  tasks: JobdeskTask[];
}

export type ViewMode = 'cards' | 'structure' | 'spreadsheet' | 'matrix' | 'kanban' | 'schedule' | 'analytics';

export interface SOPItem {
  id: string;
  title: string;
  sla: string;
  description: string;
  responsibleRoles: string[];
  checklist: string[];
}

export interface ShiftSchedule {
  time: string;
  label: string;
  action: string;
  assignedTo: string;
  type: 'urgent' | 'regular' | 'checkpoint';
}

export interface SheetsSyncState {
  spreadsheetId: string;
  spreadsheetUrl: string;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  syncSuccessCount: number;
}
