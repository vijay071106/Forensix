import React from 'react';
import {
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  HardDrive,
  Camera,
  FolderOpen,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  Film,
  Download,
  Sparkles,
  GitMerge
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { StatusBadge } from '../ui/StatusBadge';
import { ActiveTab, CaseItem, EvidenceItem } from '../../types';

interface OverviewViewProps {
  currentCase: CaseItem | null;
  evidence: EvidenceItem | null;
  onNavigateTab: (tab: ActiveTab) => void;
  onNewCase: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentCase,
  evidence,
  onNavigateTab,
  onNewCase,
}) => {
  const workflowSteps = [
    { label: 'Acquisition', status: 'completed', tab: 'acquisition' as ActiveTab },
    { label: 'Fingerprint', status: 'completed', tab: 'fingerprint' as ActiveTab },
    { label: 'Integrity', status: 'completed', tab: 'health' as ActiveTab },
    { label: 'Recovery', status: 'completed', tab: 'recovery' as ActiveTab },
    { label: 'Timeline', status: 'completed', tab: 'timeline' as ActiveTab },
    { label: 'Analysis', status: 'in_progress', tab: 'gaps' as ActiveTab },
    { label: 'Verification', status: 'pending', tab: 'timestamps' as ActiveTab },
    { label: 'Report', status: 'pending', tab: 'reports' as ActiveTab },
  ];

  const recentEvents = [
    {
      time: '09:42:18',
      title: 'Recording gap detected',
      sub: 'Camera 01 (Duration: 15m 25s)',
      type: 'warning',
      actionTab: 'gaps' as ActiveTab,
    },
    {
      time: '10:15:32',
      title: 'Timestamp inconsistency detected',
      sub: 'Camera 02 (OSD vs Metadata delta: 15s)',
      type: 'warning',
      actionTab: 'timestamps' as ActiveTab,
    },
    {
      time: '10:31:04',
      title: 'Evidence integrity verified',
      sub: 'Working copy SHA-256 matches read-only master bit-stream',
      type: 'healthy',
      actionTab: 'health' as ActiveTab,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wider">
              CCTV FORENSIX
            </h1>
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              SIH Prototype
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-300 mt-1">
            Digital CCTV Evidence Investigation Workspace
          </div>
          <p className="text-xs text-slate-400 mt-0.5 italic">
            "Acquire, reconstruct, analyze and preserve CCTV evidence."
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('incident-reconstruction')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-slate-950 font-mono text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>INCIDENT RECONSTRUCTION</span>
          </button>

          <button
            onClick={() => onNavigateTab('video-replay')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>PLAY SAMPLE VIDEO</span>
          </button>

          <button
            onClick={onNewCase}
            id="btn-new-investigation"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ NEW INVESTIGATION</span>
          </button>
        </div>
      </div>

      {/* Evaluator Sample Video Showcase Banner */}
      <div className="bg-slate-900 border border-emerald-800/80 rounded-lg p-4 font-mono text-xs shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/90 border border-emerald-700/80 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <Film className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-100 font-bold uppercase text-xs">
                  SIH EVALUATOR SAMPLE FOOTAGE AVAILABLE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  READY TO REPLAY
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px]">
                  H.264 / 720p / 25 FPS
                </span>
              </div>
              <p className="text-slate-400 text-xs font-sans">
                Authentic CCTV incident clips generated for evaluator testing, featuring vehicle ingress, burned-in surveillance OSD, and clock synchronization drift for forensic reconstruction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <a
              href="/api/evidence/sample-video/download/CAM-01-GATE"
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>DOWNLOAD .MP4</span>
            </a>

            <button
              onClick={() => onNavigateTab('video-replay')}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>LAUNCH VIDEO REPLAY →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          id="stat-active-cases"
          title="ACTIVE CASES"
          value="03"
          subtext="Central Hub, Retail, Transit"
          icon={FolderOpen}
        />
        <StatCard
          id="stat-evidence-items"
          title="EVIDENCE ITEMS"
          value="12"
          subtext="Bit-stream images & clips"
          icon={HardDrive}
        />
        <StatCard
          id="stat-cameras"
          title="CAMERAS"
          value="16"
          subtext="Synchronized DVR channels"
          icon={Camera}
        />
        <StatCard
          id="stat-anomalies"
          title="ANOMALIES"
          value="04"
          subtext="1 gap, 1 clock drift, 2 alerts"
          icon={AlertTriangle}
          variant="alert"
        />
      </div>

      {/* Current Investigation & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Case Details */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                CURRENT INVESTIGATION
              </span>
              <StatusBadge status="Analysis in Progress" variant="info" size="sm" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">
                  Case ID:
                </span>
                <span className="text-slate-100 font-bold text-sm">
                  {currentCase?.id || 'CFX-2026-001'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">
                  Case Name:
                </span>
                <span className="text-slate-200 font-sans font-medium text-xs">
                  {currentCase?.name || 'Warehouse CCTV Investigation'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">
                  Evidence:
                </span>
                <span className="text-emerald-400 font-semibold">
                  {evidence?.filename || 'DVR_01.bin'}
                </span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  ({evidence?.fileSizeBytesFormatted || '4.00 GB'} • {evidence?.sourceType || 'Physical SATA Dump'})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">
                  Status:
                </span>
                <span className="text-sky-300">
                  Analysis in Progress
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => onNavigateTab('timeline')}
              className="flex-1 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>TIMELINE</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="flex-1 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>REPORT</span>
              <FileText className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Workflow Stepper */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              FORENSIC INVESTIGATION WORKFLOW
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              5 OF 8 PHASES COMPLETE
            </span>
          </div>

          {/* Workflow list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {workflowSteps.map((step, idx) => {
              const isDone = step.status === 'completed';
              const isInProgress = step.status === 'in_progress';

              return (
                <button
                  key={step.label}
                  onClick={() => onNavigateTab(step.tab)}
                  className={`p-3 rounded border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                    isDone
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : isInProgress
                      ? 'bg-sky-950/40 border-sky-700/80 shadow-xs'
                      : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500">
                      PHASE 0{idx + 1}
                    </span>
                    {isDone ? (
                      <span className="text-emerald-400 font-bold font-mono text-xs">✓</span>
                    ) : isInProgress ? (
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    ) : (
                      <span className="text-slate-600 font-mono text-xs">○</span>
                    )}
                  </div>
                  <div className={`font-mono text-xs font-semibold ${
                    isDone ? 'text-slate-200' : isInProgress ? 'text-sky-300' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 capitalize font-sans">
                    {step.status.replace('_', ' ')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Integrity Guarantee note */}
          <div className="mt-5 p-3 rounded bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-400 text-[11px] leading-relaxed">
              <span className="text-slate-200 font-semibold font-mono uppercase">Forensic Isolation Guarantee:</span> Original evidence is preserved as read-only (Master SHA-256 verified). Analysis and AI triage execute strictly on isolated working duplicates to maintain complete evidentiary chain of custody.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Forensic Events Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
              RECENT FORENSIC EVENTS
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('custody')}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            VIEW FULL AUDIT LOG →
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          {recentEvents.map((evt) => (
            <div
              key={evt.time + evt.title}
              onClick={() => onNavigateTab(evt.actionTab)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-850/60 px-2 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {evt.time}
                </span>
                <div>
                  <div className="text-slate-200 font-semibold">
                    {evt.title}
                  </div>
                  <div className="text-slate-400 text-[11px] font-sans">
                    {evt.sub}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge
                  status={evt.type === 'warning' ? 'REVIEW REQUIRED' : 'VERIFIED'}
                  variant={evt.type === 'warning' ? 'warning' : 'healthy'}
                  size="sm"
                />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
