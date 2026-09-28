import React, { useState } from 'react';
import {
  Split,
  AlertTriangle,
  Clock,
  Camera,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
  FileQuestion,
  Cpu
} from 'lucide-react';
import { RecordingGap } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface GapAnalysisViewProps {
  gaps: RecordingGap[];
  onNavigateTab: (tab: any) => void;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  gaps,
  onNavigateTab,
}) => {
  const sampleGaps: RecordingGap[] = gaps.length > 0 ? gaps : [
    {
      id: 'GAP-001',
      camera: 'Camera 01 (Gate West)',
      cameraId: 'CAM-01',
      gapStart: '09:42:18',
      gapEnd: '09:57:43',
      gapStartSeconds: 2538,
      gapEndSeconds: 3463,
      duration: '15m 25s',
      durationSeconds: 925,
      classification: 'REVIEW REQUIRED',
      priorSegmentEnd: '09:42:18',
      nextSegmentStart: '09:57:43',
      possibleCauses: [
        'Camera power loss / electrical interruption on circuit B-4',
        'DVR storage / write buffer flush timeout / sector retry',
        'Motion detection recording schedule (no motion detected)',
        'Coaxial / Cat6 signal cable disconnected or packet loss',
        'Physical manual power toggle or local breaker trip',
        'DVR embedded Linux watchdog reboot cycle'
      ],
      forensicNote: 'The presence of a recording gap indicates missing temporal continuity. A gap alone does not determine tampering. Other technical causes must be considered.'
    }
  ];

  const [selectedGap, setSelectedGap] = useState<RecordingGap>(sampleGaps[0]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <Split className="w-5 h-5 text-amber-400" />
              RECORDING GAP & CONTINUITY ANALYSIS
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono text-[10px] font-bold uppercase">
              1 TEMPORAL GAP DETECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Frame-accurate continuity inspection across chronological surveillance chunks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="REVIEW REQUIRED" variant="warning" />
        </div>
      </div>

      {/* Critical Forensic Principle Banner */}
      <div className="bg-slate-950 border-2 border-amber-600/70 rounded-lg p-4 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 font-mono">
          <div className="text-amber-300 font-bold uppercase text-[11px] tracking-wider">
            CRITICAL FORENSIC METHODOLOGY MANDATE (NON-ACCUSATORY STANDARDS):
          </div>
          <p className="text-slate-200 font-sans text-xs leading-relaxed">
            <b>"Never automatically classify a recording gap as tampering."</b>
          </p>
          <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs font-mono mt-1">
            <b>Forensic Indicator Note:</b> "{selectedGap.forensicNote}"
          </div>
        </div>
      </div>

      {/* Visual Timeline Continuity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              {selectedGap.camera} — CONTINUITY DISCONTINUITY
            </span>
          </div>
          <span className="font-mono text-xs text-amber-400 font-bold">
            GAP DURATION: {selectedGap.duration}
          </span>
        </div>

        {/* Visual Continuity Bar */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Segment A (Recorded: 42m 18s)</span>
            <span className="text-amber-400 font-bold">MISSING TIMELINE WINDOW</span>
            <span>Segment B (Recorded: 33m 37s)</span>
          </div>

          <div className="flex items-center w-full h-10 rounded overflow-hidden border border-slate-800 text-xs font-bold">
            {/* Segment A */}
            <div className="w-5/12 bg-emerald-950/90 border-r border-slate-800 h-full flex items-center justify-center text-emerald-300 text-[11px] px-2 truncate">
              09:00:00 ➔ 09:42:18
            </div>

            {/* The Gap */}
            <div className="w-2/12 bg-amber-950/90 border-r border-slate-800 h-full flex items-center justify-center text-amber-300 text-[11px] px-2 animate-pulse gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">⚠ 15m 25s GAP</span>
            </div>

            {/* Segment B */}
            <div className="w-5/12 bg-emerald-950/90 h-full flex items-center justify-center text-emerald-300 text-[11px] px-2 truncate">
              09:57:43 ➔ 10:31:20
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Prior Segment End: {selectedGap.priorSegmentEnd}</span>
            <span className="text-amber-400 font-semibold">Gap Span: {selectedGap.gapStart} to {selectedGap.gapEnd}</span>
            <span>Next Segment Start: {selectedGap.nextSegmentStart}</span>
          </div>
        </div>
      </div>

      {/* Gap Diagnostic Details & Possible Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Forensic Classification Details */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="border-b border-slate-800 pb-2.5">
            <span className="text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              GAP DIAGNOSTIC ATTRIBUTES
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Camera ID:</span>
              <span className="text-slate-100 font-bold">{selectedGap.cameraId}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Camera Name:</span>
              <span className="text-slate-200">{selectedGap.camera}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Gap Start Timestamp:</span>
              <span className="text-amber-400 font-bold">{selectedGap.gapStart}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Gap End Timestamp:</span>
              <span className="text-amber-400 font-bold">{selectedGap.gapEnd}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Exact Duration:</span>
              <span className="text-slate-100 font-bold">{selectedGap.duration} ({selectedGap.durationSeconds}s)</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Legal/Forensic Classification:</span>
              <div className="mt-1">
                <StatusBadge status={selectedGap.classification} variant="warning" size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Neutral Forensic Cause Enumeration */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                TECHNICAL & ENVIRONMENTAL HYPOTHESES TO INVESTIGATE
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              6 CAUSAL FACTORS
            </span>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            In accordance with objective forensic standards, the investigator must correlate external evidence (such as power grid logs, DVR system journals, and adjacent camera feeds) before concluding human intervention:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {selectedGap.possibleCauses.map((cause, idx) => (
              <div
                key={cause}
                className="p-3 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <div className="text-slate-300 font-sans text-xs leading-relaxed">
                  {cause}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 rounded bg-sky-950/30 border border-sky-800/40 text-xs font-mono text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Recommendation: Cross-reference with <b>Camera 02</b> and <b>Camera 03</b> during this exact 15m 25s window on the Multi-Camera Timeline.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Discontinuity logged into Case Incident Registry
        </span>
        <button
          onClick={() => onNavigateTab('timeline')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO MULTI-CAMERA TIMELINE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
