import React, { useState } from 'react';
import {
  FileCheck,
  Download,
  ShieldAlert,
  Lock,
  Scale,
  CheckCircle2,
  Calendar,
  User,
  HardDrive,
  Cpu,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { CaseItem, EvidenceItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface BSASection63ViewProps {
  currentCase: CaseItem | null;
  evidence: EvidenceItem | null;
  onDownloadBsaPdf: (examiner: string, designation: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const BSASection63View: React.FC<BSASection63ViewProps> = ({
  currentCase,
  evidence,
  onDownloadBsaPdf,
  onNavigateTab,
}) => {
  const [examinerName, setExaminerName] = useState('Insp. R. Verma');
  const [designation, setDesignation] = useState('Digital Evidence Custodian / Senior Examiner');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await onDownloadBsaPdf(examinerName, designation);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              BSA SECTION 63 EVIDENCE CERTIFICATE DRAFT
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-mono text-[10px] font-bold uppercase">
              BHARATIYA SAKSHYA ADHINIYAM, 2023
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statutory Certificate for Admissibility of Electronic Records (formerly Section 65B of the Indian Evidence Act, 1872)
          </p>
        </div>

        <button
          onClick={handleDownload}
          id="btn-download-bsa-pdf"
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'GENERATING CERTIFICATE...' : 'DOWNLOAD BSA CERTIFICATE (PDF)'}</span>
        </button>
      </div>

      {/* Mandatory Statutory Notice Banner */}
      <div className="bg-slate-950 border-2 border-emerald-600/70 rounded-lg p-4 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 font-mono">
          <div className="text-emerald-300 font-bold uppercase text-[11px] tracking-wider">
            STATUTORY NOTICE & LEGAL DISCLAIMER:
          </div>
          <p className="text-slate-200 font-sans text-xs leading-relaxed">
            <b>"BSA Section 63-Aligned Evidence Package / Certificate Draft. This module assists in preparing documentation. Legal admissibility depends on applicable law, procedure and proper certification/signatures."</b>
          </p>
          <p className="text-slate-400 text-[11px] font-sans">
            Under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023, the certificate must be signed by the person in lawful control of the device or an authorized forensic expert. It affirms continuous normal operation, absence of unauthorized interference, and bit-stream fidelity.
          </p>
        </div>
      </div>

      {/* Signatory Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="border-b border-slate-800 pb-2.5 mb-4 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
            AUTHORIZED SIGNATORY DECLARATION PARAMETERS
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            SECTION 63(4) COMPLIANCE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1 uppercase text-[10px]">
              Certifying Officer / Examiner Name:
            </label>
            <input
              type="text"
              value={examinerName}
              onChange={(e) => setExaminerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 uppercase text-[10px]">
              Designation & Agency / Department:
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Statutory Certificate Draft Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 border border-emerald-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
              §63
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wide">
                FORM OF CERTIFICATE UNDER SECTION 63(4)
              </div>
              <div className="text-[11px] text-slate-400">
                Bharatiya Sakshya Adhiniyam, 2023 (Admissibility of Electronic Records)
              </div>
            </div>
          </div>

          <StatusBadge status="STATUTORY DRAFT" variant="info" size="sm" />
        </div>

        {/* Legal Certificate Clauses */}
        <div className="p-8 space-y-6 font-mono text-xs bg-slate-950/40 leading-relaxed text-slate-300">
          <div className="text-center pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              IN THE COURT OF COMPETENT JURISDICTION
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Case Ref: <b className="text-slate-200">{currentCase?.id || 'CFX-2026-001'}</b> — {currentCase?.name || 'Warehouse CCTV Investigation'}
            </div>
          </div>

          {/* Clause 1 */}
          <div className="space-y-1">
            <div className="font-bold text-slate-100">
              1. IDENTIFICATION OF ELECTRONIC RECORD & SOURCE SYSTEM:
            </div>
            <p className="font-sans text-xs text-slate-300 pl-4 border-l-2 border-slate-800">
              I, <b>{examinerName}</b>, holding the position of <b>{designation}</b>, do hereby solemnly state and affirm that the electronic record contained in file <b>{evidence?.filename || 'DVR_01.bin'}</b> (Size: {evidence?.fileSizeBytesFormatted || '4.00 GB'}) was acquired from surveillance recording equipment identified as <b>Hikvision DS-7200 Series Digital Video Recorder (16 Channels)</b>.
            </p>
          </div>

          {/* Clause 2 */}
          <div className="space-y-1">
            <div className="font-bold text-slate-100">
              2. LAWFUL CUSTODY & REGULAR OPERATION OF COMPUTER SYSTEM:
            </div>
            <p className="font-sans text-xs text-slate-300 pl-4 border-l-2 border-slate-800">
              The said digital video recorder and associated optical surveillance cameras were regularly operated and controlled during the material period between <b>09:00:00</b> and <b>10:45:00</b> on the material date to continuously record visual data in the ordinary course of security surveillance.
            </p>
          </div>

          {/* Clause 3 */}
          <div className="space-y-1">
            <div className="font-bold text-slate-100">
              3. CONTINUITY OF SYSTEM INTEGRITY & RECORDING HARDWARE:
            </div>
            <p className="font-sans text-xs text-slate-300 pl-4 border-l-2 border-slate-800">
              During the said period, the computer system and recording hardware were operating properly. While a single temporal gap of 15m 25s (09:42:18 to 09:57:43) was observed on Camera 01 and a 15-second clock drift was registered on Camera 02, neither of these conditions impaired the bit-level integrity or accurate preservation of the recovered electronic evidence.
            </p>
          </div>

          {/* Clause 4 */}
          <div className="space-y-1">
            <div className="font-bold text-slate-100">
              4. CRYPTOGRAPHIC HASH ANCHOR & BIT-STREAM INTEGRITY:
            </div>
            <p className="font-sans text-xs text-slate-300 pl-4 border-l-2 border-slate-800">
              The master bit-stream image was extracted via write-blocker hardware isolation and verified using standard cryptographic algorithms. The unique SHA-256 hash value computed for the master electronic record is:
            </p>
            <div className="ml-4 mt-2 p-3 bg-black/60 rounded border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
              {evidence?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
          </div>

          {/* Verification Box */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="space-y-1 text-xs">
              <div className="text-slate-400">Date of Attestation: <b>{new Date().toISOString().substring(0, 10)}</b></div>
              <div className="text-slate-400">Place: <b>{currentCase?.location || 'Cyber Forensic Station'}</b></div>
              <div className="text-emerald-400 font-bold mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Statutory Certificate Ready for Endorsement</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="w-56 border-b border-slate-600 pb-1 mb-1" />
              <div className="text-slate-200 font-bold text-xs">{examinerName}</div>
              <div className="text-[10px] text-slate-500">{designation}</div>
              <div className="text-[9px] text-slate-600">Officer having lawful control / Authorized Forensic Custodian</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Section 63 draft ready for official law-enforcement printing & digital signature
        </span>
        <button
          onClick={() => onNavigateTab('overview')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors border border-slate-700"
        >
          <span>RETURN TO OVERVIEW DASHBOARD</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
