import React from 'react';
import { 
  BarChart2, 
  PieChart, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Zap,
  Activity,
  Flame,
  Clock
} from 'lucide-react';
import { TeamMember, TaskCategory, TaskPriority } from '../types/jobdesk';
import { CATEGORIES, CATEGORY_STYLES, THEME_CONFIG, PRIORITIES, PRIORITY_CONFIG } from '../data/defaultData';

interface AnalyticsViewProps {
  teamData: TeamMember[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ teamData }) => {
  const totalTasks = teamData.reduce((acc, m) => acc + m.tasks.length, 0);

  // Category counts
  const categoryCounts: Record<TaskCategory, number> = {
    'Manajemen & Katalog': 0,
    'Nota & Keuangan': 0,
    'CS & Chat': 0,
    'Packing & Logistik': 0,
    'Live Streaming': 0
  };

  // Priority counts
  const priorityCounts: Record<TaskPriority, number> = {
    High: 0,
    Medium: 0,
    Low: 0
  };

  const pendingHighPriorityTasks: { memberName: string; taskText: string; category: string }[] = [];

  teamData.forEach(m => {
    m.tasks.forEach(t => {
      if (categoryCounts[t.category] !== undefined) {
        categoryCounts[t.category]++;
      }
      const p = t.priority || 'Medium';
      if (priorityCounts[p] !== undefined) {
        priorityCounts[p]++;
      }
      if (p === 'High' && !t.completed) {
        pendingHighPriorityTasks.push({
          memberName: m.name,
          taskText: t.text,
          category: t.category
        });
      }
    });
  });

  // Calculate average tasks per member
  const avgTasks = teamData.length > 0 ? (totalTasks / teamData.length).toFixed(1) : '0';

  return (
    <div className="space-y-6" id="workload-analytics">
      
      {/* Top Overview Cards including Priority Alert */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1: High Priority Alert */}
        <div className="bg-white p-4.5 rounded-xl border border-rose-200/90 shadow-xs bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              Prioritas Tinggi
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
              URGENT
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-rose-700 tabular-nums">
              {priorityCounts.High}
            </span>
            <span className="text-xs text-rose-600 font-medium">Tugas Utama</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingHighPriorityTasks.length} tugas masih berjalan hari ini
          </p>
        </div>

        {/* Metric 2: Medium & Low Priority */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Prioritas Sedang & Rendah
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {priorityCounts.Medium + priorityCounts.Low}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({priorityCounts.Medium} Med / {priorityCounts.Low} Low)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Operasional harian & pemeliharaan katalog
          </p>
        </div>

        {/* Metric 3: Rata-rata Tugas */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rata-rata Tugas / Orang
            </span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {avgTasks}
            </span>
            <span className="text-xs text-slate-500">tugas/personel</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Distribusi beban kerja seimbang
          </p>
        </div>

        {/* Metric 4: Keseimbangan Operasional */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fokus Utama Logistik
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">
              Packing & Logistik
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              ({categoryCounts['Packing & Logistik']})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            6 dari 7 personel mendukung pengemasan
          </p>
        </div>

      </div>

      {/* Main Charts & Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Beban Tugas per Anggota Tim */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alokasi Tugas per Personel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jumlah jobdesk yang dipegang masing-masing anggota tim
              </p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5">
            {teamData.map(member => {
              const maxTasks = Math.max(...teamData.map(m => m.tasks.length), 1);
              const percentage = Math.round((member.tasks.length / maxTasks) * 100);
              const theme = THEME_CONFIG[member.theme] || THEME_CONFIG.indigo;
              const highCount = member.tasks.filter(t => (t.priority || 'Medium') === 'High').length;

              return (
                <div key={member.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span>{member.name}</span>
                      <span className="text-[11px] font-normal text-slate-500 truncate max-w-[150px]">
                        ({member.role})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      {highCount > 0 && (
                        <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {highCount} High
                        </span>
                      )}
                      <span className="font-semibold text-slate-700">
                        {member.tasks.length} Tugas
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: theme.hex 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Komposisi Prioritas & Divisi */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Komposisi Tingkat Prioritas Tim
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pembagian tugas berdasarkan urgensi terhadap pesanan pembeli
                </p>
              </div>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            {/* Priority Bars */}
            <div className="space-y-3 mb-6">
              {PRIORITIES.map(priority => {
                const count = priorityCounts[priority];
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                const conf = PRIORITY_CONFIG[priority];

                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                        <span className="font-semibold text-slate-800">{conf.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-slate-500">{count} item</span>
                        <span className="font-bold text-slate-900 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${conf.dot}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Bars Mini */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Distribusi Divisi Kategori:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CATEGORIES.map(cat => {
                  const count = categoryCounts[cat];
                  const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  const catStyle = CATEGORY_STYLES[cat];

                  return (
                    <div key={cat} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div className="truncate pr-1 text-[11px] font-medium text-slate-700">
                        {cat}
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-[11px] tabular-nums shrink-0">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="mt-5 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
            <div className="font-bold flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              Rekomendasi Manajemen Prioritas:
            </div>
            Tugas berprioritas tinggi (Cetak Nota, Chat SLA &lt; 5 min, Komplain, Packing Cut-Off) harus diprioritaskan sebelum jam 15:00 WIB untuk memastikan paket lolos pick-up ekspedisi harian.
          </div>

        </div>

      </div>

    </div>
  );
};
