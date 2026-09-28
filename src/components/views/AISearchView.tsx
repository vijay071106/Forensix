import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Filter,
  Camera,
  Clock,
  Car,
  User,
  Package,
  Activity,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Play,
  Film
} from 'lucide-react';
import { AIDetectionEvent } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface AISearchViewProps {
  onSearch: (query: string, filter: string, camera: string) => Promise<any>;
  onNavigateTab: (tab: any) => void;
}

export const AISearchView: React.FC<AISearchViewProps> = ({
  onSearch,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [cameraFilter, setCameraFilter] = useState('ALL CAMERAS');
  const [isSearching, setIsSearching] = useState(false);
  const [parsedParams, setParsedParams] = useState<any>(null);

  const sampleResults: AIDetectionEvent[] = [
    {
      id: 'AI-001',
      camera: 'Camera 01 (Gate West)',
      cameraId: 'CAM-01',
      timestamp: '09:14:22',
      timeSeconds: 862,
      label: 'VEHICLE',
      confidence: 94,
      details: 'Commercial delivery truck ingress through perimeter gate',
      boundingBox: { x: 120, y: 340, width: 480, height: 280 },
      thumbnailHint: 'MH-04-AX-9122 delivery truck'
    },
    {
      id: 'AI-002',
      camera: 'Camera 02 (Loading Dock)',
      cameraId: 'CAM-02',
      timestamp: '09:48:10',
      timeSeconds: 2890,
      label: 'MOVEMENT',
      confidence: 89,
      details: 'Abrupt optical flow motion detected near Bay 3 roller shutter',
      boundingBox: { x: 540, y: 180, width: 220, height: 310 },
      thumbnailHint: 'Rapid shutter shift'
    },
    {
      id: 'AI-003',
      camera: 'Camera 03 (Perimeter Fence)',
      cameraId: 'CAM-03',
      timestamp: '09:51:30',
      timeSeconds: 3090,
      label: 'PERSON',
      confidence: 91,
      details: 'Pedestrian in dark jacket traversing south fence line during Cam 01 outage',
      boundingBox: { x: 800, y: 240, width: 140, height: 380 },
      thumbnailHint: 'Subject moving west'
    },
    {
      id: 'AI-004',
      camera: 'Camera 04 (Main Office Entry)',
      cameraId: 'CAM-04',
      timestamp: '10:04:15',
      timeSeconds: 3855,
      label: 'PERSON',
      confidence: 96,
      details: 'Authorized facility manager badging into administrative wing',
      boundingBox: { x: 300, y: 150, width: 160, height: 420 },
      thumbnailHint: 'Badge swipe confirmation'
    },
    {
      id: 'AI-005',
      camera: 'Camera 01 (Gate West)',
      cameraId: 'CAM-01',
      timestamp: '10:14:32',
      timeSeconds: 4472,
      label: 'VEHICLE',
      confidence: 93,
      details: 'Dark sedan egress through main gate checkpoint',
      boundingBox: { x: 200, y: 380, width: 440, height: 260 },
      thumbnailHint: 'DL-01-BK-4081 sedan'
    },
    {
      id: 'AI-006',
      camera: 'Camera 02 (Loading Dock)',
      cameraId: 'CAM-02',
      timestamp: '10:21:07',
      timeSeconds: 4867,
      label: 'OBJECT',
      confidence: 88,
      details: 'Stationary metallic freight container placed at loading platform',
      boundingBox: { x: 620, y: 400, width: 340, height: 290 },
      thumbnailHint: 'Standard cargo crate'
    }
  ];

  const [results, setResults] = useState<AIDetectionEvent[]>(sampleResults);

  const filterButtons = [
    { label: 'ALL', icon: Filter },
    { label: 'PERSON', icon: User },
    { label: 'VEHICLE', icon: Car },
    { label: 'OBJECT', icon: Package },
    { label: 'MOVEMENT', icon: Activity },
  ];

  const exampleQueries = [
    'Find vehicles between 10:00 and 11:00',
    'Find people near Camera 02',
    'Find activity between 09:40 and 10:00',
    'Show all vehicles in Camera 01'
  ];

  const handleExecuteSearch = async (textToSearch: string, filterToUse: string = activeFilter) => {
    setIsSearching(true);
    try {
      const response = await onSearch(textToSearch, filterToUse, cameraFilter);
      if (response && response.results) {
        setResults(response.results);
        setParsedParams(response.structuredInterpretation);
      }
    } catch (e) {
      // Fallback filtering
      const filtered = sampleResults.filter((r) => {
        const matchFilter = filterToUse === 'ALL' || r.label === filterToUse;
        const matchCam = cameraFilter === 'ALL CAMERAS' || r.camera.includes(cameraFilter);
        const matchText = !textToSearch || r.details.toLowerCase().includes(textToSearch.toLowerCase()) || r.label.toLowerCase().includes(textToSearch.toLowerCase());
        return matchFilter && matchCam && matchText;
      });
      setResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              AI INCIDENT SEARCH & EVIDENCE TRIAGE
            </h1>
            <span className="px-2 py-0.5 rounded bg-sky-950/90 border border-sky-700/80 text-sky-300 font-mono text-[10px] font-bold uppercase">
              AI ANALYSIS PROTOTYPE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Natural language incident querying, object classification, and chronological forensic triage
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          DETECTION MODEL: <span className="text-emerald-400 font-bold">YOLOv8 + PyTorch</span>
        </div>
      </div>

      {/* Mandatory Scope Disclaimer */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5 font-mono">
          <div className="text-sky-300 font-bold uppercase text-[10px]">
            AI FORENSIC TRIAGE NOTICE:
          </div>
          <p className="text-slate-300 font-sans text-xs">
            <b>"AI assists triage, not final legal conclusion."</b> All classifications are bounded to verifiable frame numbers and bounding boxes for human forensic verification.
          </p>
        </div>
      </div>

      {/* Natural Language Search Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold text-slate-200 uppercase mb-2">
            What are you looking for? (Natural Language Forensic Query)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-ai-query"
                placeholder="e.g., Find vehicles between 10:00 and 11:00 near Camera 01..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(query)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => handleExecuteSearch(query)}
              id="btn-execute-ai-search"
              disabled={isSearching}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSearching ? 'PARSING...' : 'SEARCH'}</span>
            </button>
          </div>
        </div>

        {/* Quick Example Query Chips */}
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
            Quick Forensic Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  handleExecuteSearch(ex);
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {/* Object Category Filters & Camera Selector */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">
              Class Filter:
            </span>
            {filterButtons.map((btn) => {
              const Icon = btn.icon;
              const isSelected = activeFilter === btn.label;
              return (
                <button
                  key={btn.label}
                  onClick={() => {
                    setActiveFilter(btn.label);
                    handleExecuteSearch(query, btn.label);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors ${
                    isSelected
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Camera Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Camera:</span>
            <select
              value={cameraFilter}
              onChange={(e) => {
                setCameraFilter(e.target.value);
                handleExecuteSearch(query, activeFilter);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-hidden"
            >
              <option value="ALL CAMERAS">ALL CAMERAS (4)</option>
              <option value="Camera 01">Camera 01 (Gate West)</option>
              <option value="Camera 02">Camera 02 (Loading Dock)</option>
              <option value="Camera 03">Camera 03 (Perimeter Fence)</option>
              <option value="Camera 04">Camera 04 (Main Office Entry)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Natural Language Interpretation Card */}
      {parsedParams && (
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-bold">STRUCTURED QUERY INTERPRETATION:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Target: <b className="text-emerald-400">{parsedParams.parsedTarget.object}</b>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Channel: <b className="text-sky-400">{parsedParams.parsedTarget.camera}</b>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Time Range: <b className="text-amber-400">{parsedParams.parsedTarget.startTime} - {parsedParams.parsedTarget.endTime}</b>
            </span>
          </div>
        </div>
      )}

      {/* Detections Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            DETECTION INCIDENT CANDIDATES ({results.length} MATCHES)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            CHRONOLOGICALLY INDEXED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-slate-300 uppercase">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {item.confidence}% Conf.
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-semibold">
                  <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.camera}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-emerald-400 font-bold">{item.timestamp}</span>
                </div>

                <p className="text-slate-300 text-xs font-sans mt-2.5 line-clamp-2 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800/80">
                  {item.details}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <button
                  onClick={() => onNavigateTab('video-replay')}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span>REPLAY VIDEO</span>
                </button>
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline"
                >
                  <span>LOCATE ON TIMELINE</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          AI incident flags ready to incorporate into forensic documentation
        </span>
        <button
          onClick={() => onNavigateTab('custody')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO CHAIN OF CUSTODY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
