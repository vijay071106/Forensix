import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Layers,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);

  const steps: {
    number: number;
    title: string;
    tab: ActiveTab;
    objective: string;
    forensicStandard: string;
    keyObservation: string;
    actionLabel: string;
  }[] = [
    {
      number: 1,
      title: 'Select Digital Evidence',
      tab: 'acquisition',
      objective: 'Ingest raw CCTV / DVR container bit-stream dump under write-blocker isolation.',
      forensicStandard: 'Hardware write-blocker (read-only master image; analysis conducted on isolated clone).',
      keyObservation: 'Evidence item DVR_01.bin (4.00 GB) acquired with unique ID CFX-EV-0001.',
      actionLabel: 'Go to Evidence Acquisition',
    },
    {
      number: 2,
      title: 'Fingerprint Device & Storage Format',
      tab: 'fingerprint',
      objective: 'Automatically analyze binary magic bytes and proprietary container structures.',
      forensicStandard: 'Prototype vendor signature correlation (magic bytes, sector-interleaving index).',
      keyObservation: 'Hikvision DS-7200 series detected (87% confidence, HKVS header signature).',
      actionLabel: 'Inspect Device Fingerprint',
    },
    {
      number: 3,
      title: 'Verify Evidence Health & Integrity',
      tab: 'health',
      objective: 'Generate SHA-256 cryptographic digest and execute container health checks.',
      forensicStandard: 'NIST FIPS PUB 180-4 SHA-256 standard (MD5 strictly retained as legacy reference).',
      keyObservation: '92/100 Prototype Health Assessment. Master locked with chmod 0400.',
      actionLabel: 'Check Health & Hashes',
    },
    {
      number: 4,
      title: 'Extract Video & Stream Metadata',
      tab: 'metadata',
      objective: 'Extract raw codec, FPS, duration, frame counts, and container stream headers.',
      forensicStandard: 'FFmpeg / ffprobe and OpenCV automated header parsing.',
      keyObservation: 'H.264 Main@L4.1, 1920x1080 @ 25 FPS, 201,900 frames, G.711A audio stream.',
      actionLabel: 'Examine Metadata Table',
    },
    {
      number: 5,
      title: 'Analyze Recovered Recordings',
      tab: 'recovery',
      objective: 'Reconstruct recovered video segments and identify candidate fragments vs corrupted sectors.',
      forensicStandard: 'Non-destructive sector parsing; proprietary parser proof-of-concept.',
      keyObservation: '127 recovered segments, 17 fragment candidates, 3 corrupted sectors isolated.',
      actionLabel: 'View Recovery Workspace',
    },
    {
      number: 6,
      title: 'Detect Recording Continuity Gaps',
      tab: 'gaps',
      objective: 'Locate temporal discontinuities between sequential recording chunks on all channels.',
      forensicStandard: 'Never automatically classify gap as tampering — enumerate technical causes.',
      keyObservation: 'Camera 01: 15m 25s gap (09:42:18 to 09:57:43). Marked REVIEW REQUIRED.',
      actionLabel: 'Analyze Continuity Gaps',
    },
    {
      number: 7,
      title: 'Reconstruct Multi-Camera Timeline',
      tab: 'timeline',
      objective: 'Correlate events across Camera 01, 02, 03, 04 on a unified horizontal time ruler.',
      forensicStandard: 'Cross-camera event synchronization with clock-offset reconciliation.',
      keyObservation: 'Correlated vehicle ingress, breach alert, and subject traversing during outage window.',
      actionLabel: 'Open Multi-Cam Timeline',
    },
    {
      number: 8,
      title: 'Analyze Timestamp Consistency',
      tab: 'timestamps',
      objective: 'Compare burned-in OSD text timestamps against stream metadata and file timestamps.',
      forensicStandard: 'Three-point temporal validation; clock drift vs manual alteration distinction.',
      keyObservation: '15-second differential detected on Camera 02 (OSD 10:15:32 vs Metadata 10:15:47).',
      actionLabel: 'Examine Timestamp Inconsistency',
    },
    {
      number: 9,
      title: 'AI Incident Search & Triage',
      tab: 'ai-search',
      objective: 'Execute natural language query to filter persons, vehicles, objects, and motion.',
      forensicStandard: 'Deterministic object classification (YOLO/PyTorch) bounded to forensic timestamps.',
      keyObservation: 'Query "Find vehicles between 10:00 and 11:00 near Camera 02" parsed into structured params.',
      actionLabel: 'Try AI Incident Search',
    },
    {
      number: 10,
      title: 'Review Chain of Custody Audit Log',
      tab: 'custody',
      objective: 'Inspect immutable append-only provenance log tracking all forensic operations.',
      forensicStandard: 'Cryptographic hash anchoring and non-repudiation audit trail.',
      keyObservation: 'Eight verified lifecycle milestones recorded from hardware ingestion to audit sign-off.',
      actionLabel: 'Inspect Chain of Custody',
    },
    {
      number: 11,
      title: 'Generate BSA Section 63 Evidence Package',
      tab: 'bsa-section63',
      objective: 'Draft statutory electronic record certificate under Bharatiya Sakshya Adhiniyam, 2023.',
      forensicStandard: 'Strict legal draft with mandatory disclaimer (admissibility depends on procedure & seal).',
      keyObservation: 'ReportLab PDF certificate generated with SHA-256 seal and lawful custody declaration.',
      actionLabel: 'View BSA Section 63 Package',
    },
  ];

  const step = steps[currentStep];

  const handleJump = () => {
    onNavigateTab(step.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div
        id="modal-guided-demo"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                GUIDED FORENSIC DEMONSTRATION WORKFLOW
              </h2>
              <p className="text-[11px] text-slate-400">
                11-Step Investigation Lifecycle (Smart India Hackathon 2026 Prototype)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-950/60 px-5 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            STEP <span className="text-emerald-400 font-bold">{step.number}</span> OF 11
          </span>
          <div className="flex gap-1">
            {steps.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => setCurrentStep(idx)}
                className={`w-5 h-2 rounded-xs transition-colors ${
                  idx === currentStep
                    ? 'bg-emerald-400'
                    : idx < currentStep
                    ? 'bg-slate-600'
                    : 'bg-slate-800'
                }`}
                title={`Step ${s.number}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              FORENSIC WORKFLOW MILESTONE {step.number}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-0.5">
              {step.title}
            </h3>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">
                Investigation Objective:
              </span>
              <p className="text-slate-200 font-medium mt-0.5">{step.objective}</p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">
                Forensic Standard & Methodology:
              </span>
              <p className="text-slate-300 mt-0.5">{step.forensicStandard}</p>
            </div>

            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/50">
              <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold block">
                Key Observation in Warehouse CCTV Case:
              </span>
              <p className="text-emerald-200 mt-0.5 font-mono text-[11px] leading-relaxed">
                {step.keyObservation}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREVIOUS</span>
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono disabled:opacity-40 transition-colors"
            >
              <span>NEXT STEP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleJump}
            id="btn-demo-jump-to-workspace"
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono transition-colors shadow-sm"
          >
            <span>{step.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
