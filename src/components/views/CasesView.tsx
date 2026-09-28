import React, { useState } from 'react';
import { Plus, FolderLock, FolderOpen, Calendar, User, MapPin, Search, ArrowRight, Shield, GitMerge } from 'lucide-react';
import { CaseItem, ActiveTab } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface CasesViewProps {
  cases: CaseItem[];
  activeCaseId: string;
  onSelectCase: (caseItem: CaseItem) => void;
  onCreateCase: (caseData: Partial<CaseItem>) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onCreateCase,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseLead, setNewCaseLead] = useState('');
  const [newCaseLoc, setNewCaseLoc] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');

  const filtered = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.leadInvestigator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseName.trim()) return;
    onCreateCase({
      name: newCaseName.trim(),
      leadInvestigator: newCaseLead.trim() || 'Forensic Analyst',
      location: newCaseLoc.trim() || 'Jurisdiction Site',
      description: newCaseDesc.trim() || 'CCTV evidence examination',
    });
    setNewCaseName('');
    setNewCaseLead('');
    setNewCaseLoc('');
    setNewCaseDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-emerald-400" />
            CASE MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically registered CCTV & DVR investigation workspaces
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-create-case-open"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ CREATE CASE</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Filter cases by ID, name, or investigator..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden font-mono"
        />
      </div>

      {/* Cases Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Case Name</th>
                <th className="py-3 px-4 text-center">Evidence</th>
                <th className="py-3 px-4 text-center">Cameras</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((c) => {
                const isSelected = c.id === activeCaseId;
                return (
                  <tr
                    key={c.id}
                    id={`case-row-${c.id}`}
                    onClick={() => onSelectCase(c)}
                    className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-800/40 border-l-2 border-l-emerald-400' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FolderLock className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{c.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-300">
                      <div>{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        <span className="truncate max-w-xs">{c.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300 font-semibold">
                      {c.evidenceCount}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300 font-semibold">
                      {c.cameraCount}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={c.status}
                        variant={c.status === 'Verified' ? 'healthy' : c.status === 'Analysis' ? 'info' : 'neutral'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {c.created.substring(0, 10)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {c.lastUpdated.substring(0, 16)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onNavigateTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCase(c);
                              onNavigateTab('incident-reconstruction');
                            }}
                            className="px-2 py-1 rounded bg-sky-950 hover:bg-sky-900 border border-sky-800/80 text-sky-300 text-xs font-mono transition-colors inline-flex items-center gap-1"
                            title="Launch Cross-Camera Incident Reconstruction"
                          >
                            <GitMerge className="w-3 h-3 text-sky-400" />
                            <span>RECONSTRUCT</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors inline-flex items-center gap-1"
                        >
                          <span>OPEN</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Case */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wide">
                + REGISTER NEW INVESTIGATION CASE
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
                  Case Title / Subject:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cargo Terminal Dock 5 Incident"
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">
                  Lead Investigator / Designation:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Insp. K. Sharma / Cyber Forensics"
                  value={newCaseLead}
                  onChange={(e) => setNewCaseLead(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">
                  Physical Location / Scene:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Container Freight Station, Nhava Sheva"
                  value={newCaseLoc}
                  onChange={(e) => setNewCaseLoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase text-[10px]">
                  Brief Summary / Scope:
                </label>
                <textarea
                  rows={3}
                  placeholder="Examination of physical DVR disk dump for perimeter breach reconstruction..."
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
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
                  INITIALIZE CASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
