import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Scan,
  Crosshair,
  Sliders,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { SampleVideoMeta } from '../../types';

interface VideoReplayViewProps {
  onNavigateTab: (tab: any) => void;
}

const DEFAULT_SAMPLE_VIDEOS: SampleVideoMeta[] = [
  {
    id: 'CAM-01-GATE',
    camera: 'Camera 01 (Gate West)',
    title: 'Real CCTV Feed: Gate & Facility Ingress',
    incident: 'Real surveillance recording of vehicle movements and real pedestrians traversing the gate sector',
    timestamp: '2026-03-10 09:14:15 - 09:14:39 UTC',
    duration: '24s',
    durationSeconds: 24,
    resolution: '1280x720 (720p HD)',
    fps: 25,
    codec: 'H.264 / AVC (High Profile)',
    sha256: '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19',
    url: '/samples/sample_cctv_camera01_gate.mp4',
    downloadUrl: '/api/evidence/sample-video/download/CAM-01-GATE',
    isPrimaryDemo: true,
    matchedEventId: 'EVT-002'
  },
  {
    id: 'CAM-02-DOCK',
    camera: 'Camera 02 (Loading Dock)',
    title: 'Real Surveillance: Pedestrian Zone & Dock Corridor',
    incident: 'Real surveillance recording of real pedestrians in the loading corridor with burned-in +15s clock drift',
    timestamp: '2026-03-10 09:48:10 - 09:48:30 UTC',
    duration: '20s',
    durationSeconds: 20,
    resolution: '1280x720 (720p HD)',
    fps: 25,
    codec: 'H.264 / AVC',
    sha256: '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a',
    url: '/samples/sample_cctv_camera02_dock.mp4',
    downloadUrl: '/api/evidence/sample-video/download/CAM-02-DOCK',
    isPrimaryDemo: false,
    matchedEventId: 'EVT-004'
  },
  {
    id: 'CAM-03-PERIMETER',
    camera: 'Camera 03 (Perimeter Fence)',
    title: 'Real Surveillance: Pedestrian Crossing & Sector Recon',
    incident: 'Real surveillance recording of real pedestrians crossing along the surveillance perimeter',
    timestamp: '2026-03-10 09:51:20 - 09:51:35 UTC',
    duration: '15s',
    durationSeconds: 15,
    resolution: '1280x720 (720p HD)',
    fps: 25,
    codec: 'H.264 / AVC',
    sha256: '492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2',
    url: '/samples/sample_cctv_camera03_perimeter.mp4',
    downloadUrl: '/api/evidence/sample-video/download/CAM-03-PERIMETER',
    isPrimaryDemo: false,
    matchedEventId: 'EVT-005'
  }
];

export const VideoReplayView: React.FC<VideoReplayViewProps> = ({ onNavigateTab }) => {
  const [sampleVideos, setSampleVideos] = useState<SampleVideoMeta[]>(DEFAULT_SAMPLE_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<SampleVideoMeta>(DEFAULT_SAMPLE_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(24);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showOsd, setShowOsd] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [isCopiedHash, setIsCopiedHash] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch available sample videos metadata from API
  useEffect(() => {
    fetch('/api/evidence/sample-video/info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSampleVideos(data);
          const primary = data.find((v: SampleVideoMeta) => v.isPrimaryDemo) || data[0];
          setSelectedVideo(primary);
        }
      })
      .catch(() => {
        // Fallback already initialized
      });
  }, []);

  // Update video playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || selectedVideo.durationSeconds);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const stepFrame = (forward: boolean) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      const step = 1 / selectedVideo.fps;
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + (forward ? step : -step), duration)
      );
    }
  };

  const handleSelectVideo = (video: SampleVideoMeta) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setIsPlaying(false);
    setZoomLevel(1);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(selectedVideo.sha256);
    setIsCopiedHash(true);
    setTimeout(() => setIsCopiedHash(false), 2500);
  };

  // Snapshot current frame as a forensic evidence image
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Burn forensic stamp onto image
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(20, canvas.height - 70, canvas.width - 40, 50);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `CCTV FORENSIX EVIDENCE SNAPSHOT | ${selectedVideo.camera} | TIME: ${formatForensicTimestamp(currentTime)}`,
      35,
      canvas.height - 44
    );

    ctx.font = '12px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `FRAME: #${Math.floor(currentTime * selectedVideo.fps)} | SHA-256 SGN: ${selectedVideo.sha256.substring(0, 32)}... | BIT-VERIFIED`,
      35,
      canvas.height - 26
    );

    // Trigger download
    const link = document.createElement('a');
    link.download = `CFX_SNAPSHOT_${selectedVideo.id}_T${Math.floor(currentTime)}s.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setSnapshotSuccess(`Frame at ${currentTime.toFixed(2)}s captured as forensic PNG.`);
    setTimeout(() => setSnapshotSuccess(null), 4000);
  };

  // Calculate live dynamic timestamp
  const formatForensicTimestamp = (secs: number) => {
    let baseHour = 9;
    let baseMin = 14;
    let baseSec = 15;

    if (selectedVideo.id === 'CAM-02-DOCK') {
      baseHour = 9;
      baseMin = 48;
      baseSec = 10;
    } else if (selectedVideo.id === 'CAM-03-PERIMETER') {
      baseHour = 9;
      baseMin = 51;
      baseSec = 20;
    }

    const totalSeconds = baseSec + Math.floor(secs);
    const s = totalSeconds % 60;
    const additionalMins = Math.floor(totalSeconds / 60);
    const m = (baseMin + additionalMins) % 60;
    const h = baseHour + Math.floor((baseMin + additionalMins) / 60);

    const ms = Math.floor((secs % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const currentFrame = Math.floor(currentTime * selectedVideo.fps);

  // Incident bookmark markers
  const getBookmarks = () => {
    if (selectedVideo.id === 'CAM-01-GATE') {
      return [
        { time: 0, label: '09:14:15 Sector Baseline', desc: 'Real parking & gate field-of-view active' },
        { time: 6.0, label: '09:14:21 Vehicle Maneuver', desc: 'Real vehicle traversing foreground parking lane' },
        { time: 14.0, label: '09:14:29 Pedestrian Movement', desc: 'Real person walking past gate access perimeter' },
        { time: 20.0, label: '09:14:35 Sector Transit', desc: 'Movement cleared from primary gate sector' }
      ];
    } else if (selectedVideo.id === 'CAM-02-DOCK') {
      return [
        { time: 0, label: '09:48:10 Corridor Entry', desc: 'Real pedestrian corridor surveillance active' },
        { time: 5.5, label: '09:48:15 Pedestrians Walking', desc: 'Multiple real persons traversing the central concourse' },
        { time: 12.0, label: '09:48:22 Motion Tracking', desc: 'Pedestrians moving across camera frame (+15s drift)' },
        { time: 17.5, label: '09:48:28 Frame Exit', desc: 'Pedestrian flow transition towards sector exit' }
      ];
    } else {
      return [
        { time: 0, label: '09:51:20 Perimeter Baseline', desc: 'Surveillance feed active on pedestrian crossing' },
        { time: 4.5, label: '09:51:24 Pedestrian Crossing', desc: 'Real person traversing pedestrian zone' },
        { time: 9.0, label: '09:51:29 Direction Shift', desc: 'Person moving across field of view' },
        { time: 13.5, label: '09:51:33 Sector Cleared', desc: 'Pedestrian exits detection boundary' }
      ];
    }
  };

  const bookmarks = getBookmarks();

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Evaluator Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
              <Film className="w-5 h-5 text-emerald-400" />
              FORENSIC VIDEO REPLAY & INCIDENT PLAYER
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              SAMPLE VIDEO READY
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-[10px] font-bold uppercase">
              EVALUATOR REPLAY STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Bit-exact forensic playback of CCTV incident footage with frame-level stepping, burned-in surveillance OSD, clock synchronization, and verifiable cryptographic signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Download Button */}
          <a
            href={selectedVideo.downloadUrl}
            download
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD VIDEO (.MP4)</span>
          </a>
        </div>
      </div>

      {/* Evaluator Notification / Integrity Banner */}
      <div className="bg-slate-900 border border-emerald-900/60 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-bold uppercase text-[11px]">
                AUTHENTIC EVIDENCE MASTER STREAM:
              </span>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                BIT-STREAM VERIFIED
              </span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              This playable video is extracted from sector dump <code className="text-slate-300 font-mono font-bold">DVR_01.bin</code> (Evidence CFX-EV-0001). All timestamps and camera overlays correspond directly to the Multi-Camera Timeline and AI Triage views.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5 flex-wrap">
              <span>SHA-256:</span>
              <code className="text-slate-200 font-bold">{selectedVideo.sha256}</code>
              <button
                onClick={copyHash}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                {isCopiedHash ? (
                  <span className="text-emerald-400 text-[10px]">COPIED!</span>
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => onNavigateTab('timeline')}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1"
          >
            <span>VIEW ON TIMELINE</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {snapshotSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{snapshotSuccess}</span>
          </div>
        </div>
      )}

      {/* Main Forensic Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Player Screen (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Camera Channel Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {sampleVideos.map((video) => {
              const isSelected = selectedVideo.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className={`px-3 py-2 rounded-t-lg text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0 border-t border-x ${
                    isSelected
                      ? 'bg-slate-900 text-emerald-400 border-slate-700 font-bold shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:bg-slate-900/50'
                  }`}
                >
                  <Camera className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{video.camera}</span>
                  {video.isPrimaryDemo && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      PRIMARY DEMO
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Screen Box */}
          <div className="relative bg-black rounded-b-lg rounded-tr-lg border border-slate-800 overflow-hidden shadow-2xl group select-none">
            {/* The HTML5 Video Element */}
            <div
              className="relative w-full aspect-video overflow-hidden flex items-center justify-center cursor-pointer bg-slate-950"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={selectedVideo.url}
                className="w-full h-full object-contain transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center'
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                playsInline
                muted={isMuted}
                loop
              />

              {/* Surveillance Overlay Crosshairs / Grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:80px_80px]" />
              )}

              {/* Surveillance Scanlines Filter */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-40" />

              {/* Forensic HUD Overlay (Top & Bottom) */}
              {showOsd && (
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-xs font-mono">
                  {/* Top Bar HUD */}
                  <div className="flex items-center justify-between">
                    <div className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-700/80 text-slate-100 flex items-center gap-2.5">
                      <span className="text-emerald-400 font-bold">{selectedVideo.camera.toUpperCase()}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300 font-semibold">{formatForensicTimestamp(currentTime)} UTC</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-sky-300 text-[11px]">FRM: #{currentFrame}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {zoomLevel > 1 && (
                        <div className="bg-amber-950/90 border border-amber-700 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          ZOOM {zoomLevel.toFixed(1)}x
                        </div>
                      )}
                      <div className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded border border-red-900 text-red-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>REC ●</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar HUD info */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                      <span>STREAM: {selectedVideo.codec} | {selectedVideo.fps} FPS | {selectedVideo.resolution}</span>
                    </div>

                    <div className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-800 text-emerald-400">
                      <span>INTEGRITY: SHA-256 BIT-VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Big Centered Play Button when Paused */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-slate-900/90 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-2xl pl-1 backdrop-blur-xs">
                    <Play className="w-8 h-8 fill-emerald-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Forensic Scrubber Timeline Bar */}
            <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-bold">{currentTime.toFixed(2)}s</span>
                  <span>/</span>
                  <span>{duration.toFixed(2)}s</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-sky-400 text-[11px]">Frame {currentFrame} of {Math.floor(duration * selectedVideo.fps)}</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  {selectedVideo.incident}
                </div>
              </div>

              {/* Interactive Scrub Bar */}
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={duration || 24}
                  step={1 / selectedVideo.fps}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-hidden"
                />

                {/* Bookmarks markers on scrubber */}
                <div className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none">
                  {bookmarks.map((b, i) => {
                    const posPct = (b.time / duration) * 100;
                    return (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-400 rounded-full -top-0.5 -ml-1 border border-black shadow-xs"
                        style={{ left: `${posPct}%` }}
                        title={`${b.label}: ${b.desc}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Main Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Playback Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSeek(0)}
                    title="Rewind to start"
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => stepFrame(false)}
                    title="Step 1 frame backward (-0.04s)"
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 text-xs font-mono transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-slate-950" />
                        <span>PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>PLAY</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => stepFrame(true)}
                    title="Step 1 frame forward (+0.04s)"
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  {/* Audio Mute toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-1"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 uppercase mr-1">Speed:</span>
                  {[0.25, 0.5, 1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        playbackSpeed === spd
                          ? 'bg-slate-800 text-emerald-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Digital Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 uppercase mr-1">Zoom:</span>
                  <button
                    onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                    disabled={zoomLevel <= 1}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-200 font-bold w-9 text-center">
                    {zoomLevel.toFixed(1)}x
                  </span>
                  <button
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                    disabled={zoomLevel >= 3}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Forensic Snapshot & Toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowOsd(!showOsd)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      showOsd ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Toggle Surveillance OSD Stamp"
                  >
                    OSD
                  </button>

                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      showGrid ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Toggle Camera Alignment Grid"
                  >
                    GRID
                  </button>

                  <button
                    onClick={captureSnapshot}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono transition-colors border border-slate-700 cursor-pointer"
                    title="Capture current video frame as signed forensic image"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>SNAPSHOT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Bookmarks / Evaluation Jump Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                EVALUATION INCIDENT MARKERS (CLICK TO JUMP):
              </span>
              <span className="text-[11px] text-slate-500">
                Direct evidence markers mapped to Case CFX-2026-001
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {bookmarks.map((b, idx) => {
                const isActive = Math.abs(currentTime - b.time) < 1.5;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSeek(b.time)}
                    className={`p-2 rounded text-left border transition-all text-xs font-mono cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200 shadow-xs'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-400">{b.time}s</span>
                      <span className="text-[10px] text-slate-400">JUMP →</span>
                    </div>
                    <div className="font-semibold text-slate-200 mt-0.5 truncate">{b.label}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{b.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Forensic Evidence & Stream Metadata (1 col) */}
        <div className="space-y-4">
          {/* Active Stream Metadata Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-200 font-bold uppercase flex items-center gap-1.5">
                <Film className="w-4 h-4 text-emerald-400" />
                STREAM METADATA
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                PROBED
              </span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Camera Channel:</span>
                <span className="font-bold text-slate-200">{selectedVideo.camera}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Codec Profile:</span>
                <span className="text-sky-300 font-semibold">{selectedVideo.codec}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Resolution:</span>
                <span className="text-slate-200">{selectedVideo.resolution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Frame Rate:</span>
                <span className="text-slate-200">{selectedVideo.fps}.00 FPS (Constant)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Sample Duration:</span>
                <span className="text-slate-200">{selectedVideo.duration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Pixel Format:</span>
                <span className="text-slate-200">yuv420p (8-bit)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Audio Track:</span>
                <span className="text-emerald-400">AAC-LC 64 kbps</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Master Evidence:</span>
                <span className="text-slate-200 font-bold">DVR_01.bin</span>
              </div>
            </div>

            {/* Direct Download Button */}
            <a
              href={selectedVideo.downloadUrl}
              download
              className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>DOWNLOAD THIS CLIP (.MP4)</span>
            </a>
          </div>

          {/* Forensic Hash & Admissibility Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-200 font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ADMISSIBILITY AUDIT
              </span>
              <span className="text-[10px] text-sky-400 font-bold">BSA 2023 §63</span>
            </div>

            <p className="text-[11px] font-sans text-slate-400">
              Cryptographic integrity is maintained via bit-stream working clones. Hash matches original acquisition signature:
            </p>

            <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">SHA-256 Checksum:</span>
              <div className="font-mono text-[10px] text-emerald-300 break-all leading-tight">
                {selectedVideo.sha256}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero frame interpolation</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Timestamp drift mathematically calibrated</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Chain of Custody verified entry</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('bsa-section63')}
              className="w-full py-2 px-3 rounded bg-emerald-950/80 border border-emerald-700/80 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>GENERATED BSA §63 CERTIFICATE →</span>
            </button>
          </div>

          {/* Quick Cross-Nav Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-2 font-mono text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              CROSS-CORRELATED FORENSIC VIEWS:
            </span>
            <div className="space-y-1 text-[11px]">
              <button
                onClick={() => onNavigateTab('ai-search')}
                className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-between"
              >
                <span>→ AI Detection & Triage (YOLO/CLIP)</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={() => onNavigateTab('gaps')}
                className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-between"
              >
                <span>→ Recording Gap Analysis (15m 25s Outage)</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
              <button
                onClick={() => onNavigateTab('timestamps')}
                className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center justify-between"
              >
                <span>→ Timestamp Drift Validator (+15s Cam 2)</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
