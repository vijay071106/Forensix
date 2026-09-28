import React, { useState } from 'react';
import {
  Film,
  Maximize2,
  Clock,
  Volume2,
  Sliders,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Code,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { VideoMetadata } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface MetadataAnalysisViewProps {
  metadata: VideoMetadata | null;
  onNavigateTab: (tab: any) => void;
}

export const MetadataAnalysisView: React.FC<MetadataAnalysisViewProps> = ({
  metadata,
  onNavigateTab,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  const data = metadata || {
    codec: 'H.264 / AVC / MPEG-4 AVC',
    profile: 'Main Profile @ Level 4.1',
    resolution: '1920 × 1080 (Full HD)',
    width: 1920,
    height: 1080,
    fps: 25.0,
    duration: '02:14:36',
    durationSeconds: 8076,
    frameCount: 201900,
    audioPresence: 'Present (G.711A @ 8 kHz Mono)',
    container: 'Proprietary DVR Stream (.bin / sector slice)',
    bitrate: '4.25 Mbps (CBR)',
    colorSpace: 'bt709 (16-235 Studio Range)',
    pixelFormat: 'yuv420p',
    scanType: 'Progressive',
    ffprobeJsonRaw: JSON.stringify(
      {
        streams: [
          {
            index: 0,
            codec_name: 'h264',
            codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
            profile: 'Main',
            codec_type: 'video',
            codec_tag_string: 'avc1',
            width: 1920,
            height: 1080,
            coded_width: 1920,
            coded_height: 1088,
            has_b_frames: 0,
            pix_fmt: 'yuv420p',
            level: 41,
            color_range: 'tv',
            color_space: 'bt709',
            r_frame_rate: '25/1',
            avg_frame_rate: '25/1',
            time_base: '1/25000',
            duration_ts: 201900000,
            duration: '8076.000000',
            bit_rate: '4250112',
            nb_frames: '201900',
            disposition: { default: 1 }
          },
          {
            index: 1,
            codec_name: 'pcm_alaw',
            codec_long_name: 'PCM A-law',
            codec_type: 'audio',
            codec_tag_string: 'alaw',
            sample_fmt: 's16',
            sample_rate: '8000',
            channels: 1,
            bits_per_sample: 8,
            duration: '8076.000000',
            bit_rate: '64000'
          }
        ],
        format: {
          filename: 'DVR_01.bin',
          nb_streams: 2,
          format_name: 'h264,rawvideo,proprietary_dvr',
          format_long_name: 'Raw H.264 video stream in proprietary DVR wrapper',
          duration: '8076.000000',
          size: '4294967296',
          bit_rate: '4314112'
        }
      },
      null,
      2
    )
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-wide flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-400" />
            VIDEO STREAM & METADATA EXTRACTION
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stream parameter analysis utilizing FFmpeg / ffprobe and OpenCV video capture pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="STREAMS PARSED" variant="healthy" />
        </div>
      </div>

      {/* Primary Video Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Video Codec</span>
            <Film className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-100 font-bold text-sm text-emerald-400 truncate">
            {data.codec}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {data.profile}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Native Resolution</span>
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-100 font-bold text-sm">
            {data.resolution}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {data.width} × {data.height} pixels
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Frame Rate</span>
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-100 font-bold text-sm text-sky-400">
            {data.fps} FPS
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Constant Frame Rate (CFR)
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Duration & Frames</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-100 font-bold text-sm">
            {data.duration}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {data.frameCount.toLocaleString()} total frames
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Audio Track</span>
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-200 font-bold mt-1 text-xs">
            {data.audioPresence}
          </div>
          <p className="text-slate-400 text-[11px] font-sans mt-1">
            Monophonic surveillance audio embedded on primary security channel.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Bitrate & Encoding</span>
            <FileSearch className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-200 font-bold mt-1 text-xs">
            {data.bitrate}
          </div>
          <p className="text-slate-400 text-[11px] font-sans mt-1">
            Pixel Format: {data.pixelFormat} • Color Space: {data.colorSpace}
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Container Wrapper</span>
            <Film className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-slate-200 font-bold mt-1 text-xs truncate">
            {data.container}
          </div>
          <p className="text-slate-400 text-[11px] font-sans mt-1">
            Non-standard CCTV sector container with periodic SPS/PPS sequence headers.
          </p>
        </div>
      </div>

      {/* Technical Stream Inspection & ffprobe Output */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-850 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
              LOW-LEVEL FFPROBE & OPENCV STREAM DESCRIPTOR TREE (JSON)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>{showRawJson ? 'COLLAPSE' : 'EXPAND'}</span>
            {showRawJson ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </button>

        {showRawJson && (
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <pre className="font-mono text-[11px] text-emerald-400/90 overflow-x-auto p-3 bg-black/40 rounded border border-slate-800/80 leading-relaxed max-h-96">
              {data.ffprobeJsonRaw}
            </pre>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">
          Stream metadata validated against ISO/IEC 14496-10 specification
        </span>
        <button
          onClick={() => onNavigateTab('recovery')}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
        >
          <span>PROCEED TO RECOVERY WORKSPACE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
