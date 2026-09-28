import React, { useState } from 'react';
import {
  GitMerge,
  Camera,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  ChevronRight,
  CheckCircle2,
  Car,
  User,
  ShieldAlert,
  Play,
  Film
} from 'lucide-react';
import { TimelineEvent } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface TimelineReconstructionViewProps {
  events: TimelineEvent[];
  onNavigateTab: (tab: any) => void;
}

export const TimelineReconstructionView: React.FC<TimelineReconstructionViewProps> = ({
  events,
  onNavigateTab,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = useState('ALL');

  const cameras = [
    { id: 'CAM-01', name: 'Camera 01 (Gate West)', clockOffset: '0.00s (Master Reference)' },
    { id: 'CAM-02', name: 'Camera 02 (Loading Dock)', clockOffset: '+15.00s (Clock Drift Offset)' },
    { id: 'CAM-03', name: 'Camera 03 (Perimeter Fence)', clockOffset: '-1.20s (Minor Drift)' },
    { id: 'CAM-04', name: 'Camera 04 (Main Office Entry)', clockOffset: '+0.50s (Synchronous)' },
  ];

  const sampleEvents: TimelineEvent[] = events.length > 0 ? events : [
    { id: 'EVT-001', camera: 'Camera 04 (Main Office Entry)', cameraId: 'CAM-04', timestamp: '09:00:00', timeSeconds: 0, eventType: 'Shift Start', confidence: 100, details: 'Security shift change logged. Camera system online.', source: 'System Audit Log', severity: 'info' },
    { id: 'EVT-002', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', timestamp: '09:14:22', timeSeconds: 862, eventType: 'Vehicle Ingress', confidence: 94, details: 'White delivery truck (Plate: MH-04-AX-9122) enters perimeter.', source: 'Video Frame 21550', severity: 'info' },
    { id: 'EVT-003', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', timestamp: '09:42:18', timeSeconds: 2538, eventType: 'Recording Gap Start', confidence: 99, details: 'Channel 1 video stream abruptly drops. 15m 25s temporal outage begins.', source: 'Stream Packet Loss', severity: 'alert' },
    { id: 'EVT-004', camera: 'Camera 02 (Loading Dock)', cameraId: 'CAM-02', timestamp: '09:48:10', timeSeconds: 2890, eventType: 'Movement Detected', confidence: 89, details: 'Motion detected near Cargo Bay 3 during Camera 01 outage.', source: 'YOLO Detection Block', severity: 'warning' },
    { id: 'EVT-005', camera: 'Camera 03 (Perimeter Fence)', cameraId: 'CAM-03', timestamp: '09:51:30', timeSeconds: 3090, eventType: 'Person Traversing', confidence: 91, details: 'Individual wearing dark jacket observed moving along south perimeter fence.', source: 'Video Frame 77250', severity: 'warning' },
    { id: 'EVT-006', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', timestamp: '09:57:43', timeSeconds: 3463, eventType: 'Recording Restored', confidence: 99, details: 'Channel 1 stream resumes with continuous H.264 I-frame sequence.', source: 'Stream Re-acquisition', severity: 'info' },
    { id: 'EVT-007', camera: 'Camera 02 (Loading Dock)', cameraId: 'CAM-02', timestamp: '10:15:32', timeSeconds: 4532, eventType: 'Timestamp Inconsistency', confidence: 95, details: '15-second differential detected between burned-in OSD text and frame metadata.', source: 'Timestamp Validator', severity: 'warning' },
    { id: 'EVT-008', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', timestamp: '10:31:04', timeSeconds: 5464, eventType: 'Integrity Check', confidence: 100, details: 'Scheduled cryptographic SHA-256 hash match verified on working copy.', source: 'Forensic Engine', severity: 'info' },
  ];

  const filteredEvents = sampleEvents.filter(
    (e) => filterType === 'ALL' || e.severity === filterType.toLowerCase()
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-emerald-400" />
              MULTI-CAMERA TIMELINE RECONSTRUCTION
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-mono text-[10px] font-bold uppercase">
              4 CHANNELS SYNCHRONIZED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Temporal alignment across concurrent surveillance channels, recording gaps, and incident markers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('video-replay')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>PLAY SAMPLE VIDEO</span>
          </button>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-hidden"
          >
            <option value="ALL">ALL EVENTS ({sampleEvents.length})</option>
            <option value="WARNING">ANOMALIES & WARNINGS</option>
            <option value="ALERT">OUTAGES & GAPS</option>
            <option value="INFO">STANDARD RECON</option>
          </select>
        </div>
      </div>

      {/* Clock Offset Information Note */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-start gap-3">
        <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-slate-300 space-y-0.5">
          <div className="text-sky-300 font-bold uppercase text-[10px]">
            CLOCK OFFSET RECONCILIATION NOTICE:
          </div>
          <p className="text-slate-400 text-[11px] font-sans">
            Timelines are calibrated against Camera 01 master clock reference. Camera 02 exhibits a known <b>+15.00s internal clock drift</b> which is mathematically compensated on the unified time ruler.
          </p>
        </div>
      </div>

      {/* Multi-Camera Visual Track Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
            SYNCHRONIZED CAMERA TRACKS (09:00:00 — 10:45:00)
          </span>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" /> Active Video
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 animate-pulse" /> Recording Gap
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" /> Clock Drift (15s)
            </span>
          </div>
        </div>

        {/* Time Scale Ruler */}
        <div className="pl-44 pr-4 flex justify-between text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-1">
          <span>09:00</span>
          <span>09:15</span>
          <span>09:30</span>
          <span>09:45</span>
          <span>10:00</span>
          <span>10:15</span>
          <span>10:30</span>
          <span>10:45</span>
        </div>

        {/* Camera Tracks */}
        <div className="space-y-3 font-mono text-xs">
          {/* Camera 01 Track */}
          <div className="flex items-center gap-3">
            <div className="w-40 shrink-0">
              <div className="font-bold text-slate-200 truncate text-[11px]">Camera 01 (Gate West)</div>
              <div className="text-[9px] text-slate-500">Ref: 0.00s</div>
            </div>
            <div className="flex-1 h-8 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center">
              {/* Active segment 1: 09:00 - 09:42:18 (approx 42% of 105 mins) */}
              <div
                className="h-full bg-emerald-900/80 border-r border-slate-800 flex items-center justify-center text-[10px] text-emerald-300 font-bold px-1 truncate"
                style={{ width: '40%' }}
                title="Camera 01: 09:00:00 - 09:42:18"
              >
                09:00:00 ➔ 09:42:18
              </div>
              {/* Gap: 09:42:18 - 09:57:43 (approx 15% width) */}
              <div
                className="h-full bg-amber-950/90 border-x border-amber-600/80 flex items-center justify-center text-[10px] text-amber-300 font-bold px-1 animate-pulse"
                style={{ width: '15%' }}
                title="Camera 01 GAP: 15m 25s (09:42:18 - 09:57:43)"
              >
                ⚠ 15m 25s GAP
              </div>
              {/* Active segment 2: 09:57:43 - 10:31:20 (approx 32% width) */}
              <div
                className="h-full bg-emerald-900/80 border-l border-slate-800 flex items-center justify-center text-[10px] text-emerald-300 font-bold px-1 truncate"
                style={{ width: '32%' }}
                title="Camera 01: 09:57:43 - 10:31:20"
              >
                09:57:43 ➔ 10:31:20
              </div>
            </div>
          </div>

          {/* Camera 02 Track */}
          <div className="flex items-center gap-3">
            <div className="w-40 shrink-0">
              <div className="font-bold text-slate-200 truncate text-[11px]">Camera 02 (Loading Dock)</div>
              <div className="text-[9px] text-amber-400">Offset: +15.00s</div>
            </div>
            <div className="flex-1 h-8 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center">
              <div
                className="h-full bg-emerald-900/80 flex items-center justify-between text-[10px] text-emerald-300 font-bold px-2 truncate"
                style={{ width: '85%' }}
                title="Camera 02: Continuous coverage from 09:05:12 to 10:35:21"
              >
                <span>Continuous Recording (09:05:12 - 10:35:21)</span>
                {/* 15s Timestamp drift marker at 10:15:32 (around 70%) */}
                <span className="bg-sky-900 border border-sky-500 text-sky-200 px-1.5 py-0.5 rounded text-[9px]">
                  Δ 15s Drift
                </span>
              </div>
            </div>
          </div>

          {/* Camera 03 Track */}
          <div className="flex items-center gap-3">
            <div className="w-40 shrink-0">
              <div className="font-bold text-slate-200 truncate text-[11px]">Camera 03 (Perimeter)</div>
              <div className="text-[9px] text-slate-500">Ref: -1.20s</div>
            </div>
            <div className="flex-1 h-8 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center">
              <div
                className="h-full bg-emerald-900/80 flex items-center justify-between text-[10px] text-emerald-300 font-bold px-2 truncate"
                style={{ width: '75%' }}
                title="Camera 03: 09:12:00 - 10:28:45"
              >
                <span>Active Coverage (09:12:00 - 10:28:45)</span>
                <span className="bg-amber-950 border border-amber-600 text-amber-300 px-1.5 py-0.5 rounded text-[9px]">
                  09:51 Person
                </span>
              </div>
            </div>
          </div>

          {/* Camera 04 Track */}
          <div className="flex items-center gap-3">
            <div className="w-40 shrink-0">
              <div className="font-bold text-slate-200 truncate text-[11px]">Camera 04 (Main Office)</div>
              <div className="text-[9px] text-slate-500">Ref: +0.50s</div>
            </div>
            <div className="flex-1 h-8 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-center">
              <div
                className="h-full bg-emerald-900/80 flex items-center justify-start text-[10px] text-emerald-300 font-bold px-2 truncate"
                style={{ width: '95%' }}
                title="Camera 04: Full shift continuous 09:00:00 - 10:40:00"
              >
                Continuous Coverage (09:00:00 - 10:40:00)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Incidents Drawer / Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              SYNCHRONIZED MULTI-CAMERA INCIDENT TIMELINE
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {filteredEvents.length} KEY EVENTS
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 font-mono text-xs">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`py-3 px-2 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/60 cursor-pointer transition-colors ${
                  selectedEvent?.id === evt.id ? 'bg-slate-800/80 border-l-2 border-l-emerald-400' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-slate-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs shrink-0">
                    {evt.timestamp}
                  </span>
                  <div>
                    <div className="text-slate-100 font-bold flex items-center gap-2">
                      <span>{evt.eventType}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        ({evt.camera.split('(')[0]})
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-sans mt-0.5 line-clamp-1">
                      {evt.details}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500">
                    {evt.confidence}% Conf.
                  </span>
                  <StatusBadge
                    status={evt.severity.toUpperCase()}
                    variant={evt.severity === 'alert' ? 'critical' : evt.severity === 'warning' ? 'warning' : 'info'}
                    size="sm"
                  />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Event Details Drawer */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="border-b border-slate-800 pb-2.5">
            <span className="text-slate-300 font-bold uppercase text-[11px] tracking-wider">
              INCIDENT EVENT INSPECTOR
            </span>
          </div>

          {selectedEvent ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Event ID:</span>
                <span className="text-slate-100 font-bold">{selectedEvent.id}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Camera Source:</span>
                <span className="text-slate-200">{selectedEvent.camera}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Synchronized Timestamp:</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedEvent.timestamp}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Event Category:</span>
                <span className="text-slate-200">{selectedEvent.eventType}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Detection Confidence:</span>
                <span className="text-sky-300 font-bold">{selectedEvent.confidence}%</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Evidence Origin:</span>
                <span className="text-slate-400">{selectedEvent.source}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Forensic Note:</span>
                <p className="text-slate-300 font-sans text-xs mt-0.5 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800">
                  {selectedEvent.details}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('video-replay')}
                className="w-full py-2 px-3 rounded bg-emerald-950/80 border border-emerald-700/80 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400" />
                <span>REPLAY IN FORENSIC VIDEO PLAYER →</span>
              </button>
            </div>
          ) : (
            <div className="text-slate-500 text-xs text-center py-10 font-sans">
              Select any event from the synchronized timeline to view forensic origin and correlated frame coordinates.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Timeline timestamps verified with clock drift compensation
        </span>
        <button
          onClick={() => onNavigateTab('timestamps')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO TIMESTAMP CONSISTENCY ANALYSIS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
