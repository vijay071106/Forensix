import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  HardDrive,
  Cpu,
  Split,
  GitMerge,
  ArrowRight,
  FileCheck2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { CaseItem, EvidenceItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface ReportsViewProps {
  currentCase: CaseItem | null;
  evidence: EvidenceItem | null;
  onDownloadReport: () => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentCase,
  evidence,
  onDownloadReport,
  onNavigateTab,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await onDownloadReport();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            COMPREHENSIVE FORENSIC EVIDENCE REPORT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated legal-grade examination report generation via Python ReportLab rendering engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            id="btn-download-forensic-report"
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'RENDERING PDF...' : 'DOWNLOAD FORENSIC REPORT (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Forensic Report Document Preview Frame */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Document Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
              CFX
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wide">
                DIGITAL FORENSIC EXAMINATION REPORT
              </div>
              <div className="text-[11px] text-slate-400">
                Official Law Enforcement & Judicial Evidence Package
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">REF:</span>
            <span className="text-slate-200 font-bold">{currentCase?.id || 'CFX-2026-001'}-REP</span>
            <StatusBadge status="EXAMINATION COMPLETE" variant="healthy" size="sm" />
          </div>
        </div>

        {/* Report Content Sections (Styled like actual legal document) */}
        <div className="p-8 space-y-6 font-mono text-xs bg-slate-950/40">
          {/* Section 1: Case & Agency Metadata */}
          <div className="p-5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                1. CASE & JURISDICTION SUMMARY
              </span>
              <span className="text-slate-500 text-[10px]">ISO/IEC 27037 COMPLIANT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Case Number</span>
                <span className="text-slate-100 font-bold">{currentCase?.id || 'CFX-2026-001'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Case Title</span>
                <span className="text-slate-200">{currentCase?.name || 'Warehouse CCTV Investigation'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Lead Examiner</span>
                <span className="text-slate-200">{currentCase?.leadInvestigator || 'Insp. R. Verma'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Examination Site</span>
                <span className="text-slate-200">{currentCase?.location || 'Central Cyber Forensic Lab'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Item & Cryptographic Signatures */}
          <div className="p-5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                2. EVIDENCE ITEM & HASH INTEGRITY ANCHOR
              </span>
              <span className="text-slate-500 text-[10px]">READ-ONLY BIT-STREAM CLONE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Evidence ID</span>
                <span className="text-slate-100 font-bold">{evidence?.id || 'CFX-EV-0001'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Filename</span>
                <span className="text-slate-200">{evidence?.filename || 'DVR_01.bin'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Acquisition Size</span>
                <span className="text-slate-200">{evidence?.fileSizeBytesFormatted || '4.00 GB'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Master Write-Block</span>
                <span className="text-sky-300 font-bold">Enabled (chmod 0400)</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Verified SHA-256 Master Hash Digest:
              </span>
              <div className="p-2.5 rounded bg-black/50 border border-slate-800 text-emerald-400 text-[11px] break-all select-all">
                {evidence?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>
          </div>

          {/* Section 3: Device Fingerprint & Stream Specs */}
          <div className="p-5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                3. DEVICE FINGERPRINTING & STREAM SPECIFICATIONS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Detected Manufacturer</span>
                <span className="text-slate-200 font-bold">Hikvision (DS-7200)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Video Codec</span>
                <span className="text-slate-200">H.264 Main@L4.1</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Resolution / FPS</span>
                <span className="text-slate-200">1920×1080 @ 25 FPS</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Channels / Audio</span>
                <span className="text-slate-200">16 Ch / G.711A Mono</span>
              </div>
            </div>
          </div>

          {/* Section 4: Forensic Findings (Gaps & Timestamps) */}
          <div className="p-5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                4. ANOMALY EVALUATIONS & TECHNICAL FINDINGS
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">Recording Continuity Gap on Camera 01</span>
                  <span className="text-amber-400">15m 25s OUTAGE (09:42:18 — 09:57:43)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Forensic Observation: Missing video data confirmed between 09:42:18 and 09:57:43. Objective technical hypotheses include electrical outage on circuit B-4 or DVR write-buffer retry. Does not solely prove tampering.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">Timestamp Inconsistency on Camera 02</span>
                  <span className="text-amber-400">15-SECOND OFFSET (AT 10:15:32)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Forensic Observation: OSD text timestamp (10:15:32) lags video stream metadata timestamp (10:15:47) by exactly 15 seconds. Classified as recorder clock drift.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Legal Declarations & Signatures */}
          <div className="p-5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider">
                5. FORENSIC EXAMINER CERTIFICATION
              </span>
            </div>

            <p className="text-slate-400 text-xs font-sans leading-relaxed">
              I hereby certify that the digital evidence items described herein were examined in accordance with recognized digital forensic standards. All hash values were computed using standard NIST FIPS PUB 180-4 algorithms on bit-stream master images preserved without alteration.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-end gap-4">
              <div>
                <div className="text-xs text-slate-300 font-bold">INSPECTOR R. VERMA</div>
                <div className="text-[10px] text-slate-500">Digital Evidence Custodian / Senior Examiner</div>
                <div className="text-[10px] text-slate-500">Central Cyber Forensic Investigation Division</div>
              </div>

              <div className="border-t border-slate-700 pt-1 w-48 text-center text-[10px] text-slate-500">
                Official Digital Signature & Seal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Generated via ReportLab 4.4.1 (Clean vector PDF generation)
        </span>
        <button
          onClick={() => onNavigateTab('bsa-section63')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO BSA SECTION 63 PACKAGE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
