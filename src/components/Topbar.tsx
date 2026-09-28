import React, { useState } from 'react';
import {
  Shield,
  RotateCcw,
  PlayCircle,
  ChevronDown,
  User,
  HardDrive,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { CaseItem } from '../types';

interface TopbarProps {
  currentCase: CaseItem | null;
  cases: CaseItem[];
  onSelectCase: (caseItem: CaseItem) => void;
  onResetDemo: () => void;
  onStartGuidedDemo: () => void;
  isResetting: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentCase,
  cases,
  onSelectCase,
  onResetDemo,
  onStartGuidedDemo,
  isResetting,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      id="cfx-topbar"
      className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 select-none z-20 backdrop-blur-sm"
    >
      {/* Left: Case Info & Switcher */}
      <div className="flex items-center gap-4">
        {/* Case Picker */}
        <div className="relative">
          <button
            id="btn-case-selector"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-colors text-xs font-mono text-left"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">
                CURRENT CASE:
              </div>
              <div className="text-slate-100 font-bold tracking-wide mt-0.5">
                {currentCase?.id || 'CFX-2026-001'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div
              id="case-dropdown-menu"
              className="absolute left-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 font-mono text-xs"
            >
              <div className="px-3 py-1.5 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Select Active Investigation
              </div>
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-800 transition-colors flex items-center justify-between ${
                    currentCase?.id === c.id ? 'bg-slate-800/80 text-emerald-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{c.id}</div>
                    <div className="text-[11px] text-slate-400 font-sans truncate max-w-[180px]">
                      {c.name}
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {c.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Case Title */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">CASE:</span>
          <span className="text-slate-200 font-medium tracking-wide">
            {currentCase?.name || 'Warehouse CCTV Investigation'}
          </span>
        </div>
      </div>

      {/* Right: Actions, System Status & User Profile */}
      <div className="flex items-center gap-3">
        {/* Guided Demo Button */}
        <button
          id="btn-guided-demo"
          onClick={onStartGuidedDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/70 border border-emerald-700/80 hover:bg-emerald-900/80 text-emerald-300 text-xs font-mono font-medium transition-all shadow-xs cursor-pointer"
          title="Launch Guided Forensic Demonstration Workflow (2-3 min)"
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>GUIDED DEMO</span>
        </button>

        {/* Reset Demo Button */}
        <button
          id="btn-reset-demo"
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono transition-colors disabled:opacity-50"
          title="Reset sample case CFX-2026-001 back to initial state"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">RESET DEMO</span>
        </button>

        {/* System Status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="text-slate-400">STATUS:</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ONLINE
          </span>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase leading-none">
              USER
            </div>
            <div className="text-slate-200 text-xs font-medium">
              Forensic Analyst
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
