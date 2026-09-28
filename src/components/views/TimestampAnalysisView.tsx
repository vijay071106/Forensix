import React from 'react';
import {
  ClockAlert,
  AlertTriangle,
  Clock,
  Camera,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  Sliders,
  Scale
} from 'lucide-react';
import { TimestampCheck } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface TimestampAnalysisViewProps {
  timestampChecks: TimestampCheck[];
  onNavigateTab: (tab: any) => void;
}

export const TimestampAnalysisView: React.FC<TimestampAnalysisViewProps> = ({
  timestampChecks,
  onNavigateTab,
}) => {
  const sampleChecks: TimestampCheck[] = timestampChecks.length > 0 ? timestampChecks : [
    {
      id: 'TS-001',
      camera: 'Camera 02 (Loading Dock)',
      frameIndex: 113800,
      recordedTimeStr: '10:15:32',
      osdTimestamp: '2026-03-10 10:15:32',
      metadataTimestamp: '2026-03-10 10:15:47',
      filesystemTimestamp: '2026-03-10 10:15:31',
      maxDiffSeconds: 15,
      status: 'TIMESTAMP INCONSISTENCY',
      severity: 'warning',
      explanation: 'The observed difference may result from recorder clock drift, timezone configuration, metadata differences or other evidence conditions. It is not by itself proof of tampering.',
      offsetDetails: {
        osdVsMetadataDelta: '+15.00s (Metadata leads OSD)',
        osdVsFilesystemDelta: '-1.00s (Filesystem lags OSD)',
        metadataVsFilesystemDelta: '+16.00s'
      }
    },
    {
      id: 'TS-002',
      camera: 'Camera 01 (Gate West)',
      frameIndex: 45000,
      recordedTimeStr: '09:30:00',
      osdTimestamp: '2026-03-10 09:30:00',
      metadataTimestamp: '2026-03-10 09:30:00',
      filesystemTimestamp: '2026-03-10 09:30:00',
      maxDiffSeconds: 0,
      status: 'TIMESTAMPS CONSISTENT',
      severity: 'healthy',
      explanation: 'All three temporal anchors match within 0.1s threshold. Zero clock skew detected.',
      offsetDetails: {
        osdVsMetadataDelta: '0.00s',
        osdVsFilesystemDelta: '0.00s',
        metadataVsFilesystemDelta: '0.00s'
      }
    }
  ];

  const anomaly = sampleChecks[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <ClockAlert className="w-5 h-5 text-amber-400" />
              TIMESTAMP CONSISTENCY & CLOCK DRIFT ANALYSIS
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono text-[10px] font-bold uppercase">
              15s INCONSISTENCY DETECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Three-point temporal verification: Burned-in OSD text vs Stream packet timestamps vs Sector filesystem headers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="REVIEW REQUIRED" variant="warning" />
        </div>
      </div>

      {/* Mandatory Forensic Explanation Banner */}
      <div className="bg-slate-950 border-2 border-amber-600/70 rounded-lg p-4 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 font-mono">
          <div className="text-amber-300 font-bold uppercase text-[11px] tracking-wider">
            CRITICAL FORENSIC METHODOLOGY MANDATE (NON-ACCUSATORY STANDARDS):
          </div>
          <p className="text-slate-200 font-sans text-xs leading-relaxed">
            <b>"{anomaly.explanation}"</b>
          </p>
          <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs font-mono mt-1">
            <b>Forensic Principle:</b> A timestamp delta must never be presented in court as definitive evidence of human tampering or video splicing without first ruling out RTC hardware battery depletion, NTP synchronization dropouts, or DVR container re-multiplexing delays.
          </div>
        </div>
      </div>

      {/* Three-Point Comparison Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              SUBJECT CAMERA & FRAME
            </div>
            <div className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{anomaly.camera}</span>
              <span className="text-slate-500 text-xs font-normal">
                (Frame #{anomaly.frameIndex.toLocaleString()})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Max Delta</span>
              <span className="text-amber-400 font-bold text-sm">
                15 SECONDS
              </span>
            </div>
            <StatusBadge status="TIMESTAMP INCONSISTENCY" variant="warning" />
          </div>
        </div>

        {/* 3 Temporal Source Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* OSD Timestamp */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                1. OSD Burned-In Text
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono tracking-wide">
              {anomaly.osdTimestamp.split(' ')[1]}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">
              Rendered on physical video raster by camera DSP (Optical Character Recognition verified).
            </div>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400">
              Source: Video Pixel Plane
            </div>
          </div>

          {/* Video Stream Metadata */}
          <div className="p-4 bg-slate-950 border border-amber-800/60 rounded-lg space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 uppercase font-bold">
                2. Video Stream Metadata
              </span>
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-400 font-mono tracking-wide">
              {anomaly.metadataTimestamp.split(' ')[1]}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">
              Embedded Presentation Time Stamp (PTS) inside MPEG/H.264 stream packet header.
            </div>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-400 font-semibold">
              Delta: +15s (Leads OSD)
            </div>
          </div>

          {/* Filesystem / Container Header */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                3. Filesystem / Sector Header
              </span>
              <Scale className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono tracking-wide">
              {anomaly.filesystemTimestamp.split(' ')[1]}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">
              Recorded in DVR sector index table at file allocation cluster timestamp.
            </div>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400">
              Delta: -1s (Lags OSD)
            </div>
          </div>
        </div>

        {/* Delta Analysis Breakdown */}
        <div className="p-4 bg-slate-950/80 rounded border border-slate-800 text-xs font-mono space-y-2">
          <div className="text-slate-300 font-bold uppercase text-[11px]">
            MATHEMATICAL OFFSET BREAKDOWN:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">OSD vs Metadata:</span>
              <span className="text-amber-400 font-bold">{anomaly.offsetDetails.osdVsMetadataDelta}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">OSD vs Filesystem:</span>
              <span className="text-slate-200 font-bold">{anomaly.offsetDetails.osdVsFilesystemDelta}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Metadata vs Filesystem:</span>
              <span className="text-slate-200 font-bold">{anomaly.offsetDetails.metadataVsFilesystemDelta}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Camera Checks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="border-b border-slate-800 pb-2.5 mb-3 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
            ALL AUDITED CAMERA TIMESTAMP CHECKPOINTS
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            2 CHECKPOINTS EVALUATED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <th className="py-2.5 px-3">Camera</th>
                <th className="py-2.5 px-3">Frame</th>
                <th className="py-2.5 px-3">OSD Stamp</th>
                <th className="py-2.5 px-3">Metadata Stamp</th>
                <th className="py-2.5 px-3">Max Delta</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sampleChecks.map((chk) => (
                <tr key={chk.id} className="hover:bg-slate-850">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{chk.camera}</td>
                  <td className="py-2.5 px-3 text-slate-400">#{chk.frameIndex.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-300">{chk.osdTimestamp}</td>
                  <td className="py-2.5 px-3 text-slate-300">{chk.metadataTimestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{chk.maxDiffSeconds}s</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge
                      status={chk.status}
                      variant={chk.severity === 'warning' ? 'warning' : 'healthy'}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Timestamp analysis prepared for forensic documentation
        </span>
        <button
          onClick={() => onNavigateTab('ai-search')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO AI INCIDENT SEARCH & TRIAGE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
