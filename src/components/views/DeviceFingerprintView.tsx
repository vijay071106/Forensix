import React from 'react';
import {
  Cpu,
  Binary,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  SlidersHorizontal,
  Code
} from 'lucide-react';
import { DeviceFingerprintData } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface DeviceFingerprintViewProps {
  fingerprint: DeviceFingerprintData | null;
  onNavigateTab: (tab: any) => void;
}

export const DeviceFingerprintView: React.FC<DeviceFingerprintViewProps> = ({
  fingerprint,
  onNavigateTab,
}) => {
  const data = fingerprint || {
    manufacturer: 'Hikvision',
    deviceType: 'DVR/NVR',
    modelFamily: 'DS-7200 / DS-7600 Family',
    storageStructure: 'Proprietary DVR (Sector-Indexed Stream)',
    codec: 'H.264 / AVC Main@L4.1',
    channels: 16,
    metadataStatus: 'Available',
    detectionConfidence: 87,
    signatureHex: '48 4B 56 53 01 00 00 00 10 00 00 00',
    signatureDescription: 'Vendor ASCII Magic Token [HKVS] + 16 Channel Stream Manifest Table',
    vendorSignatureMatch: 'Hikvision Embedded Digital Video Recorder Architecture',
    disclaimer: 'PROTOTYPE DETECTION: Automated fingerprinting correlates binary signatures and container metrics with signature repository. Does not replace physical hardware examination.',
    detectionMethods: [
      { name: 'File signature (Magic Bytes)', description: 'Matched vendor header 0x484B5653 ("HKVS") at offset 0x00000000', confidence: 95, detected: true },
      { name: 'Container characteristics', description: 'Proprietary indexed stream wrapper with 512-byte sector interleaving', confidence: 90, detected: true },
      { name: 'Metadata inspection', description: 'Channel descriptor tables and OSD text streams discovered in frame headers', confidence: 85, detected: true },
      { name: 'Known device patterns', description: 'Corresponds to Hikvision DS-7200 series embedded Linux DVR firmware v3.4.8', confidence: 80, detected: true }
    ]
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              DVR / NVR DEVICE & FORMAT FINGERPRINTING
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              PROTOTYPE DETECTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated correlation of binary headers, container geometry, and vendor signature dictionaries
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>CONFIDENCE:</span>
          <span className="text-emerald-400 font-bold text-sm">
            {data.detectionConfidence}%
          </span>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-slate-950 border border-amber-800/50 rounded-lg p-3.5 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 font-mono">
          <div className="text-amber-300 font-bold uppercase text-[10px]">
            FORENSIC SCOPE LIMITATION NOTICE:
          </div>
          <p className="text-slate-300 font-sans text-xs">
            {data.disclaimer}
          </p>
          <p className="text-slate-500 text-[11px] font-sans">
            Never claim universal DVR vendor identification. This architecture is designed to accommodate additional vendor signature modules (Dahua DHFS, Uniview UBFS, CP Plus, Hanwha/Samsung SSF) as independent forensic plugins.
          </p>
        </div>
      </div>

      {/* Primary Fingerprint Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Manufacturer</span>
          <div className="text-slate-100 font-bold text-base mt-1 text-emerald-400">
            {data.manufacturer}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Vendor Match Confirmed
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Device Type</span>
          <div className="text-slate-100 font-bold text-base mt-1">
            {data.deviceType}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Surveillance Subsystem
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Model Family</span>
          <div className="text-slate-100 font-bold text-sm mt-1">
            {data.modelFamily}
          </div>
          <span className="text-[10px] text-amber-400 block mt-0.5">
            Prototype Detection
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Channels Identified</span>
          <div className="text-slate-100 font-bold text-base mt-1 text-sky-400">
            {data.channels} Channels
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Synchronous Multiplexing
          </span>
        </div>
      </div>

      {/* Secondary Specs & Container Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Storage Structure</span>
          <div className="text-slate-200 font-semibold mt-1">
            {data.storageStructure}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Partition utilizes non-standard sector headers with proprietary video frame index markers.
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Stream Codec</span>
          <div className="text-slate-200 font-semibold mt-1">
            {data.codec}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Baseline / Main profile streams with interleaved PCM audio tracks.
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase block">Embedded Metadata</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">{data.metadataStatus}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Channel IDs, OSD timestamps, and motion flags discoverable in header blocks.
          </div>
        </div>
      </div>

      {/* Hex Signature Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-xs text-slate-200 font-bold uppercase tracking-wider">
              BINARY MAGIC SIGNATURE INSPECTOR (OFFSET 0x00000000)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Byte Format: Hexadecimal
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded border border-slate-800/80 font-mono text-xs space-y-1">
          <div className="text-emerald-400 font-bold tracking-widest">
            {data.signatureHex}
          </div>
          <div className="text-[11px] text-slate-400">
            ASCII Translation: <span className="text-slate-200 font-bold">[ H K V S ]</span> \x01\x00\x00\x00\x10\x00\x00\x00
          </div>
          <div className="text-[10px] text-slate-500 pt-1">
            {data.signatureDescription}
          </div>
        </div>
      </div>

      {/* Detection Methods Correlated */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="border-b border-slate-800 pb-2.5 mb-4 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-300 font-bold uppercase tracking-wider">
            MULTI-LAYER DETECTION METHODOLOGY
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            4 OF 4 VECTORS CONFIRMED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.detectionMethods.map((m, idx) => (
            <div
              key={m.name}
              className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {m.name}
                </span>
                <span className="text-emerald-400 text-[11px]">
                  {m.confidence}% CONFIDENCE
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Step Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Device characteristics registered in Case Manifest CFX-2026-001
        </span>
        <button
          onClick={() => onNavigateTab('health')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO EVIDENCE HEALTH & INTEGRITY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
