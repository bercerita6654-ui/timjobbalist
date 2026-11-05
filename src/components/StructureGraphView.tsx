import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Crown, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Layers, 
  Package, 
  MessageSquare, 
  Receipt, 
  Video, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  GitFork,
  Workflow,
  BarChart3,
  Calendar,
  ExternalLink,
  GripVertical,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sliders,
  Grid,
  Store
} from 'lucide-react';
import { TeamMember, TaskCategory, JobdeskTask, TaskPriority } from '../types/jobdesk';
import { CATEGORIES, CATEGORY_STYLES, THEME_CONFIG, PRIORITIES, PRIORITY_CONFIG } from '../data/defaultData';
import { CharacterAvatarIcon } from './CharacterAvatarIcon';

interface StructureGraphViewProps {
  teamData: TeamMember[];
  onToggleTaskComplete: (memberId: string, taskId: string) => void;
  onUpdateTask: (memberId: string, taskId: string, updates: Partial<JobdeskTask>) => void;
  onOpenAvatarModal: (member: TeamMember) => void;
  onOpenNotesForTask?: (memberId: string, taskId: string) => void;
}

type GraphTab = 'org-tree' | 'workflow-pipeline' | 'workload-distribution';

interface NodePos {
  x: number;
  y: number;
}

const DEFAULT_POSITIONS: Record<string, NodePos> = {
  leader: { x: 440, y: 35 },
  'Manajemen & Katalog': { x: 25, y: 310 },
  'Nota & Keuangan': { x: 255, y: 310 },
  'CS & Chat': { x: 485, y: 310 },
  'Packing & Logistik': { x: 715, y: 310 },
  'Live Streaming': { x: 945, y: 310 }
};

const STORAGE_KEY = 'jobdesk_graph_node_positions_v1';

export const StructureGraphView: React.FC<StructureGraphViewProps> = ({
  teamData,
  onToggleTaskComplete,
  onUpdateTask,
  onOpenAvatarModal,
  onOpenNotesForTask
}) => {
  const [activeTab, setActiveTab] = useState<GraphTab>('org-tree');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'leader': true,
    'Manajemen & Katalog': true,
    'Nota & Keuangan': true,
    'CS & Chat': true,
    'Packing & Logistik': true,
    'Live Streaming': true
  });
  const [selectedMemberModal, setSelectedMemberModal] = useState<TeamMember | null>(null);

  // Canvas Pan & Zoom State
  const [zoom, setZoom] = useState<number>(0.95);
  const [pan, setPan] = useState<NodePos>({ x: 20, y: 15 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Node Positions (Saved in localStorage)
  const [nodePositions, setNodePositions] = useState<Record<string, NodePos>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.leader) {
          return { ...DEFAULT_POSITIONS, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_POSITIONS;
  });

  // Active dragging node state
  const [activeDraggingNode, setActiveDraggingNode] = useState<string | null>(null);
  const nodeDragStartRef = useRef<{
    nodeId: string;
    initialMouseX: number;
    initialMouseY: number;
    initialNodeX: number;
    initialNodeY: number;
  } | null>(null);

  // Save node positions to localStorage
  const savePositions = (positions: Record<string, NodePos>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // ignore
    }
  };

  const resetLayout = () => {
    setNodePositions(DEFAULT_POSITIONS);
    savePositions(DEFAULT_POSITIONS);
    setZoom(0.95);
    setPan({ x: 20, y: 15 });
  };

  // Canvas Panning Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking on canvas backdrop, not on cards or buttons
    if ((e.target as HTMLElement).closest('.graph-node-card') || 
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('.canvas-control-button')) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  // Node Dragging Handlers
  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const currentNodePos = nodePositions[nodeId] || DEFAULT_POSITIONS[nodeId] || { x: 100, y: 100 };
    setActiveDraggingNode(nodeId);
    nodeDragStartRef.current = {
      nodeId,
      initialMouseX: clientX,
      initialMouseY: clientY,
      initialNodeX: currentNodePos.x,
      initialNodeY: currentNodePos.y
    };
  };

  // Global Mouse Move & Mouse Up during active drag/pan
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (nodeDragStartRef.current && activeDraggingNode) {
        const deltaX = (e.clientX - nodeDragStartRef.current.initialMouseX) / zoom;
        const deltaY = (e.clientY - nodeDragStartRef.current.initialMouseY) / zoom;
        const newX = Math.round(nodeDragStartRef.current.initialNodeX + deltaX);
        const newY = Math.round(nodeDragStartRef.current.initialNodeY + deltaY);

        setNodePositions(prev => {
          const next = {
            ...prev,
            [activeDraggingNode]: { x: newX, y: newY }
          };
          return next;
        });
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y
        });
      }
    };

    const handleMouseUp = () => {
      if (nodeDragStartRef.current && activeDraggingNode) {
        setActiveDraggingNode(null);
        nodeDragStartRef.current = null;
        setNodePositions(current => {
          savePositions(current);
          return current;
        });
      }
      if (isPanning) {
        setIsPanning(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDraggingNode, isPanning, zoom]);

  // Handle Zoom
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(1.8, Math.max(0.45, Number((prev + delta).toFixed(2)))));
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Find Leader
  const leader = teamData.find(m => m.name.toUpperCase().includes('BOBBY')) || teamData[0];
  const totalTasks = teamData.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = teamData.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
  const totalHighPriority = teamData.reduce((acc, m) => acc + m.tasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length, 0);

  // Group members and tasks by category
  const categoryGroups: {
    category: TaskCategory;
    icon: React.ReactNode;
    color: string;
    bgHeader: string;
    border: string;
    members: { member: TeamMember; tasks: JobdeskTask[] }[];
  }[] = [
    {
      category: 'Manajemen & Katalog',
      icon: <Layers className="w-4 h-4" />,
      color: 'text-indigo-600',
      bgHeader: 'bg-indigo-600 text-white',
      border: 'border-indigo-200',
      members: []
    },
    {
      category: 'Nota & Keuangan',
      icon: <Receipt className="w-4 h-4" />,
      color: 'text-amber-600',
      bgHeader: 'bg-amber-600 text-white',
      border: 'border-amber-200',
      members: []
    },
    {
      category: 'CS & Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'text-purple-600',
      bgHeader: 'bg-purple-600 text-white',
      border: 'border-purple-200',
      members: []
    },
    {
      category: 'Packing & Logistik',
      icon: <Package className="w-4 h-4" />,
      color: 'text-emerald-600',
      bgHeader: 'bg-emerald-600 text-white',
      border: 'border-emerald-200',
      members: []
    },
    {
      category: 'Live Streaming',
      icon: <Video className="w-4 h-4" />,
      color: 'text-rose-600',
      bgHeader: 'bg-rose-600 text-white',
      border: 'border-rose-200',
      members: []
    }
  ];

  categoryGroups.forEach(group => {
    teamData.forEach(member => {
      const matchingTasks = member.tasks.filter(t => t.category === group.category);
      if (matchingTasks.length > 0) {
        group.members.push({ member, tasks: matchingTasks });
      }
    });
  });

  // Calculate dynamic connector paths between leader and each division node
  const leaderPos = nodePositions['leader'] || DEFAULT_POSITIONS['leader'];
  // Leader node dimensions: width = 320px, height ~ 102px
  const leaderCenter = {
    x: leaderPos.x + 160,
    y: leaderPos.y + 102
  };

  return (
    <div className="space-y-6" id="view-structure-graph">
      
      {/* Top Controller Strip: Structure Tab Bar & Meta */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('org-tree')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'org-tree'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Bagan Hirarki Tim & Delegasi (Interaktif)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow-pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'workflow-pipeline'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Grafik Alur Operasional (Pipeline)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workload-distribution')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'workload-distribution'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Grafik Metrik Beban Kerja</span>
          </button>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {completedTasks}/{totalTasks} Selesai ({Math.round((completedTasks / (totalTasks || 1)) * 100)}%)
          </span>
          {totalHighPriority > 0 && (
            <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              {totalHighPriority} Urgent
            </span>
          )}
        </div>

      </div>

      {/* =========================================================================
          TAB 1: BAGAN HIRARKI TIM & DELEGASI (INTERAKTIF & BISA DIGESER-GESER)
         ========================================================================= */}
      {activeTab === 'org-tree' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          
          {/* Canvas Sub-Header & Interactive Guidance */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-medium text-slate-700">
                <strong className="text-slate-900 font-bold">Kanvas Interaktif:</strong> Klik & geser latar untuk menggeser kanvas. Tarik pegangan <GripVertical className="w-3.5 h-3.5 inline text-indigo-600 -mt-0.5" /> pada kartu untuk memindahkan posisi divisi sesuka Anda.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetLayout}
                className="canvas-control-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-2xs cursor-pointer"
                title="Kembalikan posisi kartu dan kanvas ke tata letak default"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tata Letak Otomatis</span>
              </button>
            </div>
          </div>

          {/* Interactive Infinite Canvas Container */}
          <div 
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            className={`relative w-full h-[660px] overflow-hidden select-none ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            } bg-[#f8fafc]`}
            style={{
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)',
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
          >
            {/* Floating Zoom & Pan Controls on top-right */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md">
              <button
                type="button"
                onClick={() => handleZoom(0.1)}
                className="canvas-control-button p-2 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition"
                title="Perbesar Kanvas (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <span className="text-[11px] font-mono font-bold text-slate-600 px-1 min-w-[42px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => handleZoom(-0.1)}
                className="canvas-control-button p-2 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition"
                title="Perkecil Kanvas (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-slate-200 mx-0.5" />

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 20, y: 15 });
                }}
                className="canvas-control-button p-2 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition"
                title="Pusatkan Kanvas (Reset Zoom 100%)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Transform Canvas Surface */}
            <div
              className="absolute inset-0 origin-top-left transition-transform duration-75 pointer-events-auto"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                width: '1800px',
                height: '1400px'
              }}
            >
              {/* Dynamic SVG Connectors between Leader and Division Cards */}
              <svg 
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%', zIndex: 5 }}
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                  </linearGradient>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="#6366f1" />
                  </marker>
                </defs>

                {categoryGroups.map(group => {
                  const divPos = nodePositions[group.category] || DEFAULT_POSITIONS[group.category] || { x: 200, y: 300 };
                  // Division card target connector: top center
                  const divTarget = {
                    x: divPos.x + 110,
                    y: divPos.y
                  };

                  // Cubic Bezier curve control points
                  const dy = divTarget.y - leaderCenter.y;
                  const cp1Y = leaderCenter.y + Math.max(30, dy * 0.45);
                  const cp2Y = divTarget.y - Math.max(30, dy * 0.45);
                  const pathD = `M ${leaderCenter.x} ${leaderCenter.y} C ${leaderCenter.x} ${cp1Y}, ${divTarget.x} ${cp2Y}, ${divTarget.x} ${divTarget.y}`;

                  return (
                    <g key={`connector-${group.category}`}>
                      {/* Glow shadow line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="5"
                        strokeOpacity="0.2"
                        strokeLinecap="round"
                      />
                      {/* Core connecting line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeDasharray={activeDraggingNode ? "4,4" : undefined}
                        strokeLinecap="round"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* 1. DRAGGABLE MARKETPLACE / PERUSAHAAN (BALISTATIONERY) ROOT NODE */}
              <div
                className={`graph-node-card absolute z-20 group/leader transition-shadow ${
                  activeDraggingNode === 'leader' ? 'shadow-2xl ring-4 ring-indigo-400/50 scale-102' : ''
                }`}
                style={{
                  transform: `translate3d(${leaderPos.x}px, ${leaderPos.y}px, 0)`,
                  width: '320px'
                }}
              >
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 to-indigo-600 opacity-60 blur-xs group-hover/leader:opacity-90 transition" />

                <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border border-indigo-400/40 shadow-xl text-center">
                  
                  {/* Drag Handle Top Bar */}
                  <div 
                    onMouseDown={(e) => handleNodeDragStart('leader', e)}
                    className="flex items-center justify-between gap-1 pb-2 border-b border-white/10 cursor-grab active:cursor-grabbing hover:bg-white/5 -mt-1 -mx-1 px-1 rounded-t-xl transition"
                    title="Klik dan geser untuk memindahkan kartu Marketplace Balistationery"
                  >
                    <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-mono">
                      <GripVertical className="w-3.5 h-3.5 text-amber-400" />
                      <span>Geser Posisi</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs uppercase">
                      <Store className="w-2.5 h-2.5" />
                      MARKETPLACE / PERUSAHAAN
                    </span>
                  </div>

                  {/* Company / Marketplace Brand Header: BALISTATIONERY */}
                  <div className="mt-2.5 py-2 px-3.5 bg-white/10 border border-white/15 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                        B
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black tracking-wider text-white uppercase leading-none font-mono">
                          Balistationery
                        </h4>
                        <span className="text-[10px] text-amber-300 font-medium leading-none block mt-1">
                          Official Store & E-Commerce Pusat
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded tracking-wider">
                      PUSAT
                    </span>
                  </div>

                </div>
              </div>

              {/* 2. DRAGGABLE DIVISION NODES */}
              {categoryGroups.map((group) => {
                const currentPos = nodePositions[group.category] || DEFAULT_POSITIONS[group.category] || { x: 200, y: 300 };
                const isExpanded = expandedNodes[group.category];
                const allGroupTasks = group.members.flatMap(m => m.tasks);
                const completedCount = allGroupTasks.filter(t => t.completed).length;
                const highCount = allGroupTasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length;
                const isDragging = activeDraggingNode === group.category;

                return (
                  <div 
                    key={group.category}
                    className={`graph-node-card absolute z-20 flex flex-col bg-white rounded-2xl border ${
                      isDragging ? 'ring-3 ring-indigo-500 shadow-2xl scale-102 border-indigo-400' : 'border-slate-200/90 shadow-md hover:shadow-lg'
                    } transition-shadow overflow-hidden`}
                    style={{
                      transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`,
                      width: '220px'
                    }}
                  >
                    {/* Draggable Header */}
                    <div 
                      onMouseDown={(e) => handleNodeDragStart(group.category, e)}
                      className={`${group.bgHeader} p-2.5 relative cursor-grab active:cursor-grabbing select-none`}
                      title="Klik & tarik di sini untuk memindahkan kartu divisi ini"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-white/70 hover:text-white shrink-0" />
                          {group.icon}
                          <h4 className="text-[11px] font-extrabold truncate">
                            {group.category}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNode(group.category);
                          }}
                          className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono opacity-90">
                        <span>{completedCount}/{allGroupTasks.length} Selesai</span>
                        {highCount > 0 && (
                          <span className="bg-rose-500 text-white font-bold px-1.5 rounded">
                            {highCount} Urgent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Personnel Cards inside Division */}
                    <div className="p-2 space-y-2 flex-1 max-h-[360px] overflow-y-auto scrollbar-thin">
                      {group.members.map(({ member, tasks }) => (
                        <div 
                          key={`${group.category}-${member.id}`}
                          className="bg-slate-50/70 rounded-xl border border-slate-200/90 p-2 shadow-2xs hover:border-indigo-400 transition"
                        >
                          {/* Member Meta */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenAvatarModal(member)}
                              className="shrink-0 relative cursor-pointer hover:scale-105 transition"
                              title="Ganti karakter avatar"
                            >
                              <CharacterAvatarIcon
                                avatarId={member.avatarId || (member.gender === 'female' ? 'female-admin' : 'male-leader')}
                                gender={member.gender || 'male'}
                                size="sm"
                              />
                              <span className="absolute -bottom-1 -right-1 bg-white text-slate-800 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-slate-100 shadow-2xs">
                                {member.gender === 'female' ? '♀' : '♂'}
                              </span>
                            </button>

                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                                {member.name}
                              </h5>
                              <p className="text-[9px] text-slate-500 truncate leading-tight">
                                {member.role}
                              </p>
                            </div>
                          </div>

                          {/* Task List (Collapsible) */}
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1.5">
                              {tasks.map(t => {
                                const priority = (t.priority || 'Medium') as TaskPriority;
                                const isHigh = priority === 'High';

                                return (
                                  <div 
                                    key={t.id}
                                    className={`p-1.5 rounded-lg border text-[10px] flex items-start gap-1.5 transition ${
                                      t.completed 
                                        ? 'bg-slate-100/70 border-slate-200 text-slate-400 line-through' 
                                        : isHigh 
                                        ? 'bg-rose-50/60 border-rose-200 text-slate-900 font-medium' 
                                        : 'bg-white border-slate-200/90 text-slate-800'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => onToggleTaskComplete(member.id, t.id)}
                                      className="mt-0.5 shrink-0 cursor-pointer"
                                    >
                                      {t.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-indigo-600" />
                                      )}
                                    </button>
                                    <span className="flex-1 leading-tight break-words text-[10px]">
                                      {t.text}
                                    </span>
                                    {t.notes && t.notes.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => onOpenNotesForTask && onOpenNotesForTask(member.id, t.id)}
                                        className="text-[8px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded shrink-0 flex items-center gap-0.5 cursor-pointer"
                                        title="Buka catatan tugas"
                                      >
                                        <MessageSquare className="w-2.5 h-2.5" />
                                        <span>{t.notes.length}</span>
                                      </button>
                                    )}
                                    {isHigh && !t.completed && (
                                      <span className="text-[9px] font-bold text-rose-600 shrink-0" title="Prioritas Tinggi">
                                        🔴
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* Bottom status strip */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Posisi grafik tersimpan otomatis di perangkat Anda</span>
            <span>Zoom: {Math.round(zoom * 100)}% | Geser: X={Math.round(pan.x)}, Y={Math.round(pan.y)}</span>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: GRAFIK ALUR OPERASIONAL (WORKFLOW PIPELINE)
         ========================================================================= */}
      {activeTab === 'workflow-pipeline' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-3 py-1 rounded-full">
                Alur Kerja Terpadu (Daily Operational Pipeline)
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Grafik Alur Delegasi Tugas & Serah Terima Antar Divisi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualisasi siklus pesanan harian e-commerce dari interaksi CS, pencatatan nota, packing, hingga live streaming.
              </p>
            </div>

            {/* Pipeline Stage Cards */}
            <div className="space-y-4 relative">
              
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 z-0 hidden sm:block" />

              {[
                {
                  step: '01',
                  time: '08:00 - 09:30 WIB',
                  title: 'Inbound Orders, Chat Masuk & Retur',
                  category: 'CS & Chat',
                  lead: 'Dinda & Tim CS',
                  avatarId: 'female-admin',
                  gender: 'female' as const,
                  desc: 'Pengecekan pesan masuk semua channel marketplace, follow up keranjang belum checkout, dan validasi keluhan/retur pembeli.',
                  color: 'indigo'
                },
                {
                  step: '02',
                  time: '09:30 - 11:00 WIB',
                  title: 'Rekapitulasi Nota Pesanan & Validasi Mutasi Kas',
                  category: 'Nota & Keuangan',
                  lead: 'Maya & Kasir Nota',
                  avatarId: 'female-finance',
                  gender: 'female' as const,
                  desc: 'Penulisan nota penjualan instan, pencocokan mutasi kas masuk dengan transaksi sistem e-commerce, dan rekap closing pembukuan.',
                  color: 'amber'
                },
                {
                  step: '03',
                  time: '11:00 - 13:00 WIB',
                  title: 'Update Stok, Katalog Produk & Campaign',
                  category: 'Manajemen & Katalog',
                  lead: 'Siti & Tim Katalog',
                  avatarId: 'female-katalog',
                  gender: 'female' as const,
                  desc: 'Penyesuaian stok habis, unggah foto produk & banner promosi baru, serta aktivasi voucher flash sale mingguan.',
                  color: 'purple'
                },
                {
                  step: '04',
                  time: '13:00 - 16:30 WIB',
                  title: 'Picking, Packing Kardus & Cetak Resi Ekspedisi',
                  category: 'Packing & Logistik',
                  lead: 'Eko, Rizky & Bobby',
                  avatarId: 'male-packing',
                  gender: 'male' as const,
                  desc: 'Cetak resi otomatis, pengambilan barang dari rak, pembungkusan bubble wrap tebal, dan pemilahan berdasarkan ekspedisi.',
                  color: 'emerald'
                },
                {
                  step: '05',
                  time: '16:30 - 18:00 WIB',
                  title: 'Handover Kurir & Konfirmasi Pickup',
                  category: 'Packing & Logistik',
                  lead: 'Bobby & Eko',
                  avatarId: 'male-leader',
                  gender: 'male' as const,
                  desc: 'Pengecekan barcode resi dengan scanner driver J&T, SiCepat, SPX, dan konfirmasi manifest pengiriman harian.',
                  color: 'cyan'
                },
                {
                  step: '06',
                  time: '19:30 - 22:30 WIB',
                  title: 'Live Streaming Prime Time & Interaksi Penjualan',
                  category: 'Live Streaming',
                  lead: 'Siti / Host Live',
                  avatarId: 'female-live',
                  gender: 'female' as const,
                  desc: 'Siaran langsung TikTok Shop & Shopee Live, pinning produk etalase terlaris, kuis follower, dan kejar target GMV.',
                  color: 'rose'
                }
              ].map((stage, idx) => (
                <div 
                  key={stage.step}
                  className="relative z-10 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  
                  {/* Step Icon / Circle */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-mono font-bold flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span className="text-[10px] text-indigo-300">STEP</span>
                    <span className="text-base leading-none">{stage.step}</span>
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-md">
                        {stage.time}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Divisi: {stage.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {stage.title}
                    </h4>
                    
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>

                  {/* Responsible Person with Avatar */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 shrink-0">
                    <CharacterAvatarIcon
                      avatarId={stage.avatarId}
                      gender={stage.gender}
                      size="sm"
                    />
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block leading-tight font-medium">Penanggung Jawab:</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight block">{stage.lead}</span>
                    </div>
                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: GRAFIK METRIK BEBAN KERJA & PRIORITAS
         ========================================================================= */}
      {activeTab === 'workload-distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Beban Kerja per Personel (Bar Chart Grafik) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Grafik Beban Kerja per Personel
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jumlah tugas terdaftar dan rasio tugas selesai
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {totalTasks} Tugas Total
                </span>
              </div>

              {/* Bar charts container */}
              <div className="mt-6 space-y-4">
                {teamData.map(m => {
                  const mTotal = m.tasks.length;
                  const mDone = m.tasks.filter(t => t.completed).length;
                  const maxTasksInTeam = Math.max(...teamData.map(x => x.tasks.length), 1);
                  const barPercent = Math.round((mTotal / maxTasksInTeam) * 100);
                  const donePercent = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
                  const highCount = m.tasks.filter(t => (t.priority || 'Medium') === 'High' && !t.completed).length;

                  return (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CharacterAvatarIcon
                            avatarId={m.avatarId || (m.gender === 'female' ? 'female-admin' : 'male-leader')}
                            gender={m.gender || 'male'}
                            size="sm"
                          />
                          <span className="font-bold text-slate-800">{m.name}</span>
                          <span className="text-slate-400 text-[11px]">({m.role})</span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          {highCount > 0 && (
                            <span className="text-rose-600 font-bold">🔴 {highCount}</span>
                          )}
                          <span className="font-bold text-slate-700">{mDone}/{mTotal}</span>
                          <span className="text-slate-400">({donePercent}%)</span>
                        </div>
                      </div>

                      {/* Visual Bar Track */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 relative">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPercent}%` }}
                        />
                        {/* Completed portion overlay */}
                        <div 
                          className="bg-emerald-400 h-full rounded-full absolute top-0.5 left-0.5 transition-all duration-500 opacity-80"
                          style={{ width: `${(mDone / maxTasksInTeam) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <span>Total Tugas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Telah Selesai</span>
              </div>
            </div>

          </div>

          {/* Chart 2: Proporsi Beban per Divisi & Prioritas */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Grafik Proporsi Tugas Antar Divisi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konsentrasi aktivitas operasional harian
              </p>

              {/* Division proportions visual grid */}
              <div className="mt-6 space-y-3.5">
                {categoryGroups.map(group => {
                  const groupTaskCount = group.members.reduce((acc, m) => acc + m.tasks.length, 0);
                  const groupPercent = totalTasks > 0 ? Math.round((groupTaskCount / totalTasks) * 100) : 0;

                  return (
                    <div key={group.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          {group.icon}
                          {group.category}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {groupTaskCount} tugas ({groupPercent}%)
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-indigo-700"
                          style={{ width: `${groupPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Priority Distribution Matrix */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Distribusi Prioritas Tugas
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  {PRIORITIES.map(p => {
                    const count = teamData.reduce((acc, m) => acc + m.tasks.filter(t => (t.priority || 'Medium') === p).length, 0);
                    const cfg = PRIORITY_CONFIG[p];

                    return (
                      <div key={p} className={`p-3 rounded-2xl border ${cfg.border} ${cfg.bgLight} text-center`}>
                        <span className="text-[10px] font-bold block">{cfg.shortLabel}</span>
                        <span className="text-2xl font-extrabold font-mono tabular-nums block mt-1">{count}</span>
                        <span className="text-[10px] opacity-75">Tugas</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center font-mono">
              Terintegrasi dengan Google Spreadsheet 10Vpsulp...
            </div>

          </div>

        </div>
      )}

      {/* Member Details Modal */}
      {selectedMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <CharacterAvatarIcon
                  avatarId={selectedMemberModal.avatarId || (selectedMemberModal.gender === 'female' ? 'female-admin' : 'male-leader')}
                  gender={selectedMemberModal.gender || 'male'}
                  size="md"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMemberModal.name}</h3>
                  <p className="text-xs text-slate-500">{selectedMemberModal.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedMemberModal.tasks.map(t => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTaskComplete(selectedMemberModal.id, t.id)}
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <span className={t.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {t.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {t.priority || 'Medium'}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedMemberModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
