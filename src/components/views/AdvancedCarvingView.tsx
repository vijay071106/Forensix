import React from 'react';
import {
  Sparkles,
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  FileCheck2,
  AlertOctagon,
  ShieldCheck,
  Binary,
  Database,
  SearchCheck,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface AdvancedCarvingViewProps {
  onNavigateTab: (tab: any) => void;
}

export const AdvancedCarvingView: React.FC<AdvancedCarvingViewProps> = ({
  onNavigateTab,
}) => {
  const pipelineStages = [
    { number: '01', title: 'DVR Storage Geometry', desc: 'Raw sector addressing, cluster size determination & write-blocker isolation', icon: HardDrive },
    { number: '02', title: 'Filesystem Analysis', desc: 'Proprietary volume descriptor scan (DHFS, WFS, HIKFS, FAT32/EXT)', icon: Database },
    { number: '03', title: 'Unallocated Space Extraction', desc: 'Isolate deleted block ranges and slack space between continuous partitions', icon: Layers },
    { number: '04', title: 'Video Fragment Detection', desc: 'Deep header/footer carving: H.264 NALU (0x000001) and H.265 SPS/PPS hunting', icon: Binary },
    { number: '05', title: 'Fragment Reconstruction', desc: 'Timestamp sequencing, frame-slice stitching, and GOP (Group of Pictures) repair', icon: SearchCheck },
    { number: '06', title: 'Recovered Evidence Output', desc: 'Cryptographically hashed MP4/MKV playable containers with forensic chain log', icon: FileCheck2 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              ADVANCED VIDEO CARVING ENGINE
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-purple-950/90 border border-purple-700/80 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              COMING NEXT / ADVANCED MODULE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planned low-level filesystem recovery architecture for deleted, formatted, and unallocated CCTV video streams
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('recovery')}
          className="text-xs font-mono text-slate-400 hover:text-slate-200"
        >
          ← BACK TO RECOVERY WORKSPACE
        </button>
      </div>

      {/* Forensic Transparency Notice */}
      <div className="bg-slate-900 border border-purple-800/60 rounded-lg p-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded bg-purple-950 border border-purple-700/80 flex items-center justify-center shrink-0 text-purple-300">
          <AlertOctagon className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 font-mono">
          <div className="text-purple-300 font-bold uppercase text-[11px]">
            FORENSIC ETHICS & SCIENTIFIC TRANSPARENCY PRINCIPLE:
          </div>
          <p className="text-slate-200 font-sans text-xs">
            <b>"Deep filesystem-level carving, deleted video fragment recovery, index reconstruction and vendor-specific storage analysis are planned for the advanced recovery engine."</b>
          </p>
          <p className="text-slate-400 text-[11px] font-sans">
            In compliance with strict digital forensic integrity standards, <b>CCTV FORENSIX does not fabricate simulated or synthetic deleted-file recoveries.</b> Unallocated sectors that lack verified GOP headers or have zero-fill overwrites are presented accurately as non-recoverable or partial fragment candidates.
          </p>
        </div>
      </div>

      {/* Architecture Pipeline Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider block">
              FORENSIC CARVING RECONSTRUCTION PIPELINE
            </span>
            <span className="text-[11px] text-slate-400">
              End-to-end processing model planned for CCTV deep recovery modules
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
            6-PHASE STATE MACHINE
          </span>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div
                key={stg.number}
                className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">
                      STAGE {stg.number}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-200 leading-snug">
                    {stg.title}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    {stg.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">SPECIFIED</span>
                  {idx < pipelineStages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-700 hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-slate-900 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planned Vendor Support Modules */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="border-b border-slate-800 pb-2.5">
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
            PLANNED VENDOR-SPECIFIC PARSING PLUGINS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold">HIKFS Parser Plugin</span>
            <div className="text-[10px] text-slate-500 uppercase">Hikvision DS-7000 / DS-8000</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Decodes 2MB sector maps, frame descriptors, and audio-video interleaving tables.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
            <span className="text-sky-400 font-bold">DHFS Parser Plugin</span>
            <div className="text-[10px] text-slate-500 uppercase">Dahua Technology DVR/XVR</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Parses DHFS 4.0/4.1 volume structures, superblock tables, and fragmented I-frame clusters.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold">WFS / UBFS Parser Plugin</span>
            <div className="text-[10px] text-slate-500 uppercase">Uniview / TVT / Xiongmai</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Reconstructs raw H.264/H.265 elementary streams across damaged physical indices.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold">Raw NALU Carving Core</span>
            <div className="text-[10px] text-slate-500 uppercase">Universal Bit-Stream Scanner</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Direct binary pattern recognition across completely unallocated or formatted volumes.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Advanced modules remain modular to prevent system instability during live field acquisition
        </span>
        <button
          onClick={() => onNavigateTab('gaps')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO RECORDING GAP ANALYSIS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
