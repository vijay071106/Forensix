import React, { useState } from 'react';
import {
  ArchiveRestore,
  Search,
  Filter,
  Camera,
  Clock,
  HardDrive,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  Info,
  Sparkles,
  Layers,
  Play,
  Film
} from 'lucide-react';
import { RecordingSegment } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { StatCard } from '../ui/StatCard';

interface RecoveryViewProps {
  recordings: RecordingSegment[];
  onNavigateTab: (tab: any) => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({
  recordings,
  onNavigateTab,
}) => {
  const [cameraFilter, setCameraFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const sampleRecordings: RecordingSegment[] = recordings.length > 0 ? recordings : [
    { id: 'REC-001', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', startTime: '09:00:00', endTime: '09:42:18', startSeconds: 0, endSeconds: 2538, duration: '42m 18s', durationSeconds: 2538, status: 'Recovered', sizeBytes: 1350000000, codec: 'H.264', hasAudio: true },
    { id: 'REC-002', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', startTime: '09:57:43', endTime: '10:31:20', startSeconds: 3463, endSeconds: 5480, duration: '33m 37s', durationSeconds: 2017, status: 'Recovered', sizeBytes: 1070000000, codec: 'H.264', hasAudio: true },
    { id: 'REC-003', camera: 'Camera 02 (Loading Dock)', cameraId: 'CAM-02', startTime: '09:05:12', endTime: '10:35:21', startSeconds: 312, endSeconds: 5721, duration: '1h 30m 09s', durationSeconds: 5409, status: 'Recovered', sizeBytes: 2880000000, codec: 'H.264', hasAudio: false },
    { id: 'REC-004', camera: 'Camera 03 (Perimeter Fence)', cameraId: 'CAM-03', startTime: '09:12:00', endTime: '10:28:45', startSeconds: 720, endSeconds: 5325, duration: '1h 16m 45s', durationSeconds: 4605, status: 'Recovered', sizeBytes: 2450000000, codec: 'H.264', hasAudio: false },
    { id: 'REC-005', camera: 'Camera 04 (Main Office Entry)', cameraId: 'CAM-04', startTime: '09:00:00', endTime: '10:40:00', startSeconds: 0, endSeconds: 6000, duration: '1h 40m 00s', durationSeconds: 6000, status: 'Recovered', sizeBytes: 3200000000, codec: 'H.264', hasAudio: true },
    { id: 'REC-006', camera: 'Camera 01 (Gate West)', cameraId: 'CAM-01', startTime: '09:42:19', endTime: '09:42:25', startSeconds: 2539, endSeconds: 2545, duration: '6s (Partial)', durationSeconds: 6, status: 'Fragment Candidate', sizeBytes: 3200000, codec: 'H.264 (Truncated)', hasAudio: false },
    { id: 'REC-007', camera: 'Camera 02 (Loading Dock)', cameraId: 'CAM-02', startTime: '10:15:30', endTime: '10:15:45', startSeconds: 4530, endSeconds: 4545, duration: '15s (Offset)', durationSeconds: 15, status: 'Timestamp Drift', sizeBytes: 8000000, codec: 'H.264', hasAudio: false },
    { id: 'REC-008', camera: 'Camera 03 (Perimeter Fence)', cameraId: 'CAM-03', startTime: '09:51:00', endTime: '09:52:10', startSeconds: 3060, endSeconds: 3130, duration: '1m 10s', durationSeconds: 70, status: 'Corrupted Sector', sizeBytes: 5600000, codec: 'Missing Header', hasAudio: false },
  ];

  const filtered = sampleRecordings.filter((r) => {
    const matchCam = cameraFilter === 'ALL' || r.cameraId === cameraFilter;
    const matchSearch =
      r.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.startTime.includes(searchTerm);
    return matchCam && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <ArchiveRestore className="w-5 h-5 text-emerald-400" />
              RECORDING RECOVERY WORKSPACE
            </h1>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/80 text-sky-300 font-mono text-[10px] font-bold uppercase">
              PROTOTYPE PARSER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sector-level extraction and reconstruction of active surveillance tracks, candidate fragments, and unallocated video streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('video-replay')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>PLAY SAMPLE VIDEO →</span>
          </button>

          <button
            onClick={() => onNavigateTab('advanced-recovery')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-950/80 border border-purple-700/80 hover:bg-purple-900/80 text-purple-300 text-xs font-mono font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ADVANCED CARVING ENGINE (PLANNED) →</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          id="stat-rec-available"
          title="AVAILABLE RECORDINGS"
          value="127"
          subtext="Indexed video chunks"
          icon={HardDrive}
          variant="success"
        />
        <StatCard
          id="stat-rec-metadata"
          title="RECOVERABLE METADATA"
          value="18"
          subtext="Channel manifest tables"
          icon={FileCheck2}
        />
        <StatCard
          id="stat-rec-fragments"
          title="FRAGMENT CANDIDATES"
          value="17"
          subtext="Contiguous unlinked slices"
          icon={Layers}
          variant="alert"
        />
        <StatCard
          id="stat-rec-corrupted"
          title="CORRUPTED SEGMENTS"
          value="03"
          subtext="Bad parity / truncated I-frames"
          icon={AlertTriangle}
          variant="alert"
        />
      </div>

      {/* Proprietary Recovery Engine Status Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-start gap-3.5">
        <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-sky-400">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-bold uppercase text-[11px]">
              PROPRIETARY RECOVERY ENGINE STATUS:
            </span>
            <span className="px-2 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300 font-bold text-[10px]">
              PROTOTYPE / LIMITED SUPPORT
            </span>
          </div>
          <p className="text-slate-300 font-sans text-xs">
            <b>"Vendor-specific parsers can be added as independent forensic modules."</b>
          </p>
          <p className="text-slate-400 text-[11px] font-sans">
            The active engine extracts and re-indexes continuous stream chunks directly from sector tables. Advanced carving (deep unallocated carving, deleted file resuscitation, and proprietary DHFS/WFS/HIKFS volume rebuilding) is isolated in the advanced recovery preview.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by camera, timestamp, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-mono uppercase text-slate-400">Camera Filter:</span>
          <select
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-hidden"
          >
            <option value="ALL">ALL CAMERAS (4)</option>
            <option value="CAM-01">Camera 01 (Gate West)</option>
            <option value="CAM-02">Camera 02 (Loading Dock)</option>
            <option value="CAM-03">Camera 03 (Perimeter Fence)</option>
            <option value="CAM-04">Camera 04 (Main Office Entry)</option>
          </select>
        </div>
      </div>

      {/* Recovered Recordings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Camera Channel</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Stream Codec</th>
                <th className="py-3 px-4">Audio</th>
                <th className="py-3 px-4">Forensic Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{r.camera}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{r.startTime}</td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{r.endTime}</td>
                  <td className="py-3 px-4 text-slate-400">{r.duration}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{r.codec}</td>
                  <td className="py-3 px-4">
                    {r.hasAudio ? (
                      <span className="text-emerald-400 text-[11px] font-semibold">G.711A</span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={r.status}
                      variant={
                        r.status === 'Recovered'
                          ? 'healthy'
                          : r.status === 'Fragment Candidate' || r.status.includes('Drift')
                          ? 'warning'
                          : 'critical'
                      }
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onNavigateTab('video-replay')}
                        className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-mono transition-colors inline-flex items-center gap-1 font-semibold"
                        title="Replay video in forensic player"
                      >
                        <Play className="w-3 h-3 fill-emerald-400" />
                        <span>REPLAY</span>
                      </button>
                      <button
                        onClick={() => onNavigateTab('timeline')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors inline-flex items-center gap-1"
                      >
                        <span>TIMELINE</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Showing {filtered.length} of {sampleRecordings.length} recovered segments
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
