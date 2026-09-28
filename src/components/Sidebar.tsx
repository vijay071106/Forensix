import React from 'react';
import {
  LayoutDashboard,
  FolderLock,
  HardDriveUpload,
  Cpu,
  ShieldCheck,
  Film,
  ArchiveRestore,
  Sparkles,
  Split,
  GitMerge,
  ClockAlert,
  Search,
  History,
  FileText,
  FileCheck,
  Flame
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  caseId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  caseId,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeVariant?: 'amber' | 'blue' | 'purple';
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incident-reconstruction', label: 'Incident Reconstruction', icon: GitMerge, badge: 'CROSS-CAM', badgeVariant: 'blue' },
    { id: 'cases', label: 'Cases', icon: FolderLock },
    { id: 'acquisition', label: 'Acquisition', icon: HardDriveUpload },
    { id: 'fingerprint', label: 'Device Fingerprint', icon: Cpu },
    { id: 'health', label: 'Health & Integrity', icon: ShieldCheck, badge: '92/100', badgeVariant: 'blue' },
    { id: 'metadata', label: 'Video / Metadata', icon: Film },
    { id: 'recovery', label: 'Recovery', icon: ArchiveRestore },
    { id: 'advanced-recovery', label: 'Advanced Carving', icon: Sparkles, badge: 'PLANNED', badgeVariant: 'purple' },
    { id: 'gaps', label: 'Gap Analysis', icon: Split, badge: '1 GAP', badgeVariant: 'amber' },
    { id: 'timeline', label: 'Multi-Cam Timeline', icon: GitMerge },
    { id: 'timestamps', label: 'Timestamp Analysis', icon: ClockAlert, badge: '15s DIFF', badgeVariant: 'amber' },
    { id: 'ai-search', label: 'AI Search & Triage', icon: Search },
    { id: 'video-replay', label: 'Forensic Video Replay', icon: Film, badge: 'SAMPLE VIDEO', badgeVariant: 'purple' },
    { id: 'custody', label: 'Chain of Custody', icon: History },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
    { id: 'bsa-section63', label: 'BSA Section 63', icon: FileCheck },
  ];

  return (
    <aside
      id="cfx-sidebar"
      className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 select-none h-screen"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-base text-slate-100 shadow-inner">
            <span className="text-emerald-400">C</span>
            <span className="text-slate-300">F</span>
            <span className="text-sky-400">X</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-widest text-slate-400 font-semibold uppercase">
                CCTV
              </span>
              <span className="font-mono text-sm font-bold text-slate-100 tracking-wider">
                FORENSIX
              </span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Digital Evidence Platform
            </div>
          </div>
        </div>
        <div className="mt-2.5 text-[10px] text-slate-400 font-mono tracking-tight border-t border-slate-900 pt-2">
          TAGLINE: "Digital CCTV Evidence Acquisition, Recovery & Analysis"
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5">
        <div className="px-2 pb-1 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
          Forensic Workflow
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                    item.badgeVariant === 'amber'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                      : item.badgeVariant === 'purple'
                      ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
                      : 'bg-sky-950/70 text-sky-300 border-sky-800/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-slate-300 font-medium">
              Forensic Engine Online
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0</span>
        </div>
        <div className="mt-1.5 text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>Python 3.11 • OpenCV • FFmpeg</span>
          <span className="text-emerald-400 font-semibold">SIH2026</span>
        </div>
      </div>
    </aside>
  );
};
