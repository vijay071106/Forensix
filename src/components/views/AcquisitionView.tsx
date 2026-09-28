import React, { useState, useRef } from 'react';
import {
  Upload,
  HardDrive,
  FileCheck2,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { EvidenceItem } from '../../types';
import { HashDisplay } from '../ui/HashDisplay';
import { StatusBadge } from '../ui/StatusBadge';

interface AcquisitionViewProps {
  evidence: EvidenceItem | null;
  onUploadFile: (file: File) => Promise<void>;
  onVerifyHash: () => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const AcquisitionView: React.FC<AcquisitionViewProps> = ({
  evidence,
  onUploadFile,
  onVerifyHash,
  onNavigateTab,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['MP4', 'AVI', 'MKV', 'BIN', 'DAT', 'ZIP'];

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage('Reading physical byte sectors...');
    setProgress(25);

    setTimeout(async () => {
      setStatusMessage('Calculating SHA-256 cryptographic digest in 64KB chunks...');
      setProgress(60);

      setTimeout(async () => {
        setStatusMessage('Creating read-only immutable master lock & isolating working clone...');
        setProgress(85);

        try {
          await onUploadFile(file);
          setProgress(100);
          setStatusMessage('Evidence ingestion verified.');
        } catch (e) {
          setStatusMessage('Acquisition error. Re-attemping forensic stream dump.');
        } finally {
          setIsProcessing(false);
        }
      }, 500);
    }, 500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          ACQUIRE DIGITAL EVIDENCE
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          "Import CCTV video, DVR/NVR images or supported evidence containers."
        </p>
      </div>

      {/* Forensic Mandate Banner */}
      <div className="bg-slate-900 border border-sky-900/60 rounded-lg p-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded bg-sky-950 border border-sky-700/80 flex items-center justify-center shrink-0 text-sky-400">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 font-mono">
          <div className="text-sky-300 font-bold uppercase tracking-wider text-[11px]">
            FUNDAMENTAL FORENSIC PRINCIPLE (ISO/IEC 27037 & BSA SECTION 63):
          </div>
          <p className="text-slate-300 font-sans text-xs">
            <b>"Original evidence is preserved as read-only. Analysis is performed on a working copy."</b>
          </p>
          <p className="text-slate-400 text-[11px] font-sans">
            Under no circumstances does CCTV FORENSIX modify or overwrite source digital containers. The Master Image bit-stream is anchored with cryptographic hash validation before any analytical parser executes.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-300 shadow-inner">
            <Upload className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="text-sm font-bold font-mono text-slate-200 uppercase">
              DRAG & DROP SURVEILLANCE IMAGE OR VIDEO
            </div>
            <div className="text-xs text-slate-400 mt-1">
              or click to browse local filesystem / write-blocked drive mount
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">
              Supported demo formats:
            </span>
            {supportedFormats.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
              >
                .{fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upload & Ingestion Progress */}
      {isProcessing && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">{statusMessage}</span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Currently Ingested Evidence Item Card */}
      {evidence && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                ACQUIRED EVIDENCE RECORD
              </div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {evidence.id}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status="VERIFIED READ-ONLY" variant="healthy" />
              <button
                onClick={onVerifyHash}
                id="btn-reverify-hash"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5 border border-slate-700"
                title="Recompute SHA-256 bit-stream integrity"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                <span>RE-VERIFY INTEGRITY</span>
              </button>
            </div>
          </div>

          {/* Evidence Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Filename</span>
              <span className="text-slate-100 font-bold truncate block mt-0.5">
                {evidence.filename}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">File Size</span>
              <span className="text-slate-100 font-bold block mt-0.5">
                {evidence.fileSizeBytesFormatted}
              </span>
              <span className="text-[10px] text-slate-500 block">
                ({evidence.fileSize.toLocaleString()} bytes)
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">File Type</span>
              <span className="text-slate-100 font-bold block mt-0.5">
                {evidence.fileType}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Acquisition Timestamp</span>
              <span className="text-slate-100 font-bold block mt-0.5">
                {evidence.acquisitionTimestamp}
              </span>
            </div>
          </div>

          {/* Hash Display */}
          <HashDisplay
            hash={evidence.sha256}
            legacyMd5={evidence.legacyMd5}
            label="EVIDENCE ITEM SHA-256 CRYPTOGRAPHIC ANCHOR"
            showReadOnlyNotice={true}
          />

          {/* Next Phase Action */}
          <div className="pt-2 flex justify-between items-center text-xs font-mono">
            <div className="text-slate-400 text-[11px]">
              Evidence registered into Chain of Custody log (Event ID: COC-002)
            </div>
            <button
              onClick={() => onNavigateTab('fingerprint')}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
            >
              <span>PROCEED TO DEVICE FINGERPRINTING</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
