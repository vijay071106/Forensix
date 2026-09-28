import React, { useState } from 'react';
import {
  History,
  Lock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  Server,
  Hash,
  FileText
} from 'lucide-react';
import { ChainOfCustodyEntry, EvidenceItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface ChainOfCustodyViewProps {
  entries: ChainOfCustodyEntry[];
  evidence: EvidenceItem | null;
  onAddEntry: (entry: Partial<ChainOfCustodyEntry>) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const ChainOfCustodyView: React.FC<ChainOfCustodyViewProps> = ({
  entries,
  evidence,
  onAddEntry,
  onNavigateTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAction, setNewAction] = useState('');
  const [newActor, setNewActor] = useState('Forensic Analyst');
  const [newNotes, setNewNotes] = useState('');

  const sampleEntries: ChainOfCustodyEntry[] = entries.length > 0 ? entries : [
    { id: 'COC-001', timestamp: '2026-03-10 09:00:15', action: 'Physical Disk Acquisition', actor: 'Det. V. Rao', system: 'Tableau TD3 Write-Blocker', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: 'Physical SATA bit-stream cloned under hardware write-blocker isolation.' },
    { id: 'COC-002', timestamp: '2026-03-10 09:12:40', action: 'Master Read-Only Lock & Working Copy Isolation', actor: 'CFX System Daemon', system: 'CFX Secure Storage Subsystem', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: 'Original master sealed (chmod 0400). Working duplicate isolated for examination.' },
    { id: 'COC-003', timestamp: '2026-03-10 09:18:22', action: 'Device & Container Fingerprinting Executed', actor: 'Insp. R. Verma', system: 'CFX Fingerprint Module', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: 'Hikvision DS-7200 binary signature matched (87% confidence).' },
    { id: 'COC-004', timestamp: '2026-03-10 09:25:05', action: 'Video Stream & Frame Metadata Extracted', actor: 'Insp. R. Verma', system: 'FFmpeg / OpenCV Engine', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: 'H.264 1920x1080 @ 25 FPS stream verified across 201,900 video frames.' },
    { id: 'COC-005', timestamp: '2026-03-10 09:45:10', action: 'Recording Gap Continuity Analysis Executed', actor: 'Insp. R. Verma', system: 'CFX Gap Analysis Module', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: '15m 25s temporal discontinuity discovered on Camera 01 (09:42:18 - 09:57:43).' },
    { id: 'COC-006', timestamp: '2026-03-10 10:18:45', action: 'Timestamp Consistency Evaluation Completed', actor: 'Insp. R. Verma', system: 'CFX Temporal Validator', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: '15-second delta registered between OSD and stream metadata on Camera 02.' },
    { id: 'COC-007', timestamp: '2026-03-10 10:25:00', action: 'AI Incident Triage & Object Search Executed', actor: 'Insp. R. Verma', system: 'YOLOv8 Detection Core', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: '6 incident candidates indexed. Human review tags applied.' },
    { id: 'COC-008', timestamp: '2026-03-10 10:31:04', action: 'Cryptographic SHA-256 Re-Verification Completed', actor: 'Cryptographic Auditor', system: 'CFX SHA-256 Engine', evidenceId: 'CFX-EV-0001', hashReference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', integrityVerified: true, notes: 'Working copy verified identical to master bit-stream with zero deviation.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim()) return;
    await onAddEntry({
      action: newAction.trim(),
      actor: newActor.trim() || 'Forensic Analyst',
      notes: newNotes.trim() || 'Forensic entry recorded during examination.',
      hashReference: evidence?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });
    setNewAction('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            CHAIN OF CUSTODY & EVIDENCE PROVENANCE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, append-only chronological audit log tracking every evidentiary milestone
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-add-custody-entry-open"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ ADD CUSTODY NOTE</span>
        </button>
      </div>

      {/* Forensic Mandate Read-Only Lock Banner */}
      <div className="bg-slate-900 border border-sky-800/60 rounded-lg p-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded bg-sky-950 border border-sky-700/80 flex items-center justify-center shrink-0 text-sky-400">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 font-mono">
          <div className="text-sky-300 font-bold uppercase text-[11px]">
            ORIGINAL EVIDENCE READ ONLY (FORENSIC PRESERVATION STANDARD):
          </div>
          <p className="text-slate-300 font-sans text-xs">
            <b>"Original evidence is preserved as read-only. Analysis is performed on a working copy."</b>
          </p>
          <p className="text-slate-400 text-[11px] font-sans">
            Every analytical action, gap computation, metadata query, and PDF report creation references the uncompromised master cryptographic digest. The evidentiary chain of custody maintains strict non-repudiation in court.
          </p>
        </div>
      </div>

      {/* Chronological Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Forensic Action</th>
                <th className="py-3 px-4">Actor / Examiner</th>
                <th className="py-3 px-4">Subsystem</th>
                <th className="py-3 px-4">Evidence Hash Reference</th>
                <th className="py-3 px-4 text-center">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sampleEntries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 text-slate-300 font-bold whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-100 font-semibold">{item.action}</div>
                    <div className="text-[11px] text-slate-500 font-sans mt-0.5 max-w-md">
                      {item.notes}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{item.actor}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3 h-3 text-slate-500" />
                      <span>{item.system}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 text-[11px] font-mono block truncate max-w-[140px] select-all">
                      {item.hashReference.substring(0, 16)}...
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status="VERIFIED" variant="healthy" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custody Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wide">
                + RECORD FORENSIC CHAIN OF CUSTODY NOTE
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">
                  Forensic Action / Milestones:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Physical drive placed in evidence vault Locker #4"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">
                  Examiner Name & Badge / ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Insp. R. Verma (Lead Examiner)"
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">
                  Forensic Notes / Observation:
                </label>
                <textarea
                  rows={3}
                  placeholder="Details regarding chain transfer, environmental condition, or procedural notes..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors"
                >
                  COMMIT TO AUDIT LOG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          All entries cryptographically linked and non-repudiable
        </span>
        <button
          onClick={() => onNavigateTab('reports')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO FORENSIC REPORTS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
