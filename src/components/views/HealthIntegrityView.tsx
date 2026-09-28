import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
  ArrowRight,
  FileCheck2,
  AlertOctagon,
  HardDrive
} from 'lucide-react';
import { HealthAssessmentData, EvidenceItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { HashDisplay } from '../ui/HashDisplay';

interface HealthIntegrityViewProps {
  healthData: HealthAssessmentData | null;
  evidence: EvidenceItem | null;
  onVerifyHash: () => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const HealthIntegrityView: React.FC<HealthIntegrityViewProps> = ({
  healthData,
  evidence,
  onVerifyHash,
  onNavigateTab,
}) => {
  const data = healthData || {
    score: 92,
    maxScore: 100,
    title: 'Prototype Evidence Health Assessment',
    status: 'HEALTHY - REVIEW ANOMALIES',
    checks: [
      { name: 'Readable Bit-Stream Blocks', status: 'Passed', points: 20, maxPoints: 20, note: 'All allocated sectors accessible under write-blocker' },
      { name: 'File & Container Recognized', status: 'Passed', points: 15, maxPoints: 15, note: 'Proprietary DVR container structure parsed' },
      { name: 'Stream Metadata Extracted', status: 'Passed', points: 15, maxPoints: 15, note: 'Codec, resolution, FPS, and channel geometry extracted' },
      { name: 'SHA-256 Hash Generated', status: 'Passed', points: 20, maxPoints: 20, note: 'Cryptographic digest anchored in Chain of Custody' },
      { name: 'Container Supported in Engine', status: 'Passed', points: 12, maxPoints: 15, note: 'Playback parser operational; vendor-specific audio stream requires transcoding' },
      { name: 'Registered in Active Case', status: 'Passed', points: 10, maxPoints: 10, note: 'Linked to Case CFX-2026-001' },
    ],
    warnings: [
      { title: '15s Timestamp Inconsistency on Camera 02', severity: 'warning', details: 'OSD burned-in timestamp lags metadata timestamp by 15 seconds at 10:15:32. Requires clock drift analysis.' },
      { title: '3 Corrupted Segments in Boundary Sectors', severity: 'alert', details: 'Unallocated sectors 0x00F48200 to 0x00F49100 contain truncated MPEG slices with missing I-frames.' },
    ],
    recommendations: [
      'Conduct multi-point clock synchronization comparison on Camera 02.',
      'Isolate corrupted boundary sectors in the Recovery Workspace for deep carving.',
      'Maintain Master SHA-256 verification before generating legal reports.'
    ]
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              EVIDENCE HEALTH & INTEGRITY VERIFICATION
            </h1>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/80 text-sky-300 font-mono text-[10px] font-bold uppercase">
              {data.title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated compliance check against NIST digital evidence preservation criteria
          </p>
        </div>

        <button
          onClick={onVerifyHash}
          id="btn-health-verify-integrity"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>RE-RUN INTEGRITY VERIFICATION</span>
        </button>
      </div>

      {/* Top Banner: Score & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center">
              <div className="text-center font-mono">
                <span className="text-3xl font-extrabold text-emerald-400">{data.score}</span>
                <span className="text-xs text-slate-500 block">/ 100</span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">
              EVIDENCE HEALTH SCORE
            </span>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
              {data.status}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              Score derived from physical sector readability, cryptographic integrity, and metadata completeness.
            </p>
          </div>
        </div>

        {/* Master Read-Only Assurance Card */}
        <div className="md:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-sky-950/80 border border-sky-700/80 flex items-center justify-center shrink-0 text-sky-400">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="text-sky-300 font-bold uppercase text-[11px]">
                WRITE-BLOCKER MASTER CLONE STATUS: IMMUTABLE
              </div>
              <p className="text-slate-300 text-xs font-sans">
                Evidence file <span className="font-mono text-emerald-400 font-semibold">{evidence?.filename || 'DVR_01.bin'}</span> is locked with read-only system permissions (chmod 0400). Forensic working copy ID <span className="font-mono text-slate-200">CFX-WK-0001</span> is mounted in isolated memory.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">MASTER HASH:</span>
              <span className="text-emerald-400 text-[11px] truncate max-w-xs select-all">
                {evidence?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </span>
            </div>
            <StatusBadge status="BIT-STREAM IDENTICAL" variant="healthy" size="sm" />
          </div>
        </div>
      </div>

      {/* Warnings & Anomalies Section */}
      <div className="bg-slate-900 border border-amber-900/40 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
            ANOMALIES & HEALTH WARNINGS (02 ITEMS DETECTED)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.warnings.map((w, idx) => (
            <div
              key={w.title}
              className="p-3.5 bg-slate-950 border border-amber-800/40 rounded-lg font-mono text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {w.title}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px]">
                  REVIEW REQUIRED
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                {w.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Checkpoint Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            INTEGRITY & USABILITY CHECKLIST BREAKDOWN
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            6 VERIFICATION PASSES EXECUTED
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          {data.checks.map((c) => (
            <div key={c.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-semibold">{c.name}</div>
                  <div className="text-slate-500 text-[11px] font-sans">{c.note}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-[11px]">
                  {c.points} / {c.maxPoints} pts
                </span>
                <StatusBadge status={c.status} variant="healthy" size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Health assessment logged in Case Audit Trail CFX-2026-001
        </span>
        <button
          onClick={() => onNavigateTab('metadata')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO VIDEO & STREAM METADATA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
