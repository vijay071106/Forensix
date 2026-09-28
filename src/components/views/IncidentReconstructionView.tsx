import React, { useState, useEffect, useRef } from 'react';
import {
  FolderLock,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  FileText,
  FileCheck,
  History,
  GitMerge,
  ArrowRight,
  Info,
  RefreshCw,
  Eye,
  Sliders,
  Share2,
  Download,
  Crosshair,
  User,
  Car,
  Layers,
  MapPin,
  Lock,
  Unlock,
  CornerDownRight,
  AlertCircle
} from 'lucide-react';
import {
  ActiveTab,
  IncidentReconstructionBundle,
  IncidentEvent,
  CameraModel,
  EvidenceItem,
  CrossCameraCorrelation,
  ChainOfCustodyEntry,
  EvidenceGraphNode,
  EvidenceGraphLink
} from '../../types';

interface IncidentReconstructionViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const IncidentReconstructionView: React.FC<IncidentReconstructionViewProps> = ({
  onNavigateTab
}) => {
  // Main Navigation / Mode within Reconstruction
  const [activeSubTab, setActiveSubTab] = useState<
    'timeline-replay' | 'camera-topology' | 'evidence-locker' | 'relationship-graph' | 'chain-of-custody' | 'findings-report'
  >('timeline-replay');

  // Case & Data State
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-001');
  const [dataBundle, setDataBundle] = useState<IncidentReconstructionBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Event & Multi-View Player State
  const [selectedEventId, setSelectedEventId] = useState<string>('EVT-REC-01');
  const [activeCameraId, setActiveCameraId] = useState<string>('CAM-01-GATE');
  const [filterCamera, setFilterCamera] = useState<string>('ALL');
  const [filterFactType, setFilterFactType] = useState<'ALL' | 'OBSERVED FACT' | 'AI-ASSISTED INFERENCE'>('ALL');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [isSyncPlaying, setIsSyncPlaying] = useState<boolean>(false);

  // Hash verification state
  const [verifyingHashes, setVerifyingHashes] = useState<boolean>(false);
  const [hashVerificationResult, setHashVerificationResult] = useState<{
    allVerified: boolean;
    summary: string;
    verifiedAt: string;
    items: {
      evidenceId: string;
      filename: string;
      expectedHash: string;
      computedHash: string;
      status: string;
      bitDrift: number;
      message: string;
    }[];
  } | null>(null);

  // Graph Inspection State
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string>('CASE');

  // Custody Form State
  const [isAddingCustody, setIsAddingCustody] = useState<boolean>(false);
  const [newCustodyAction, setNewCustodyAction] = useState<string>('Multi-Camera Temporal Alignment Verification');
  const [newCustodyNotes, setNewCustodyNotes] = useState<string>('Verified 96s delta between Cam 01 and Cam 02 against physical concourse layout distance.');

  // Video element refs for the 3 cameras
  const videoRefCam1 = useRef<HTMLVideoElement | null>(null);
  const videoRefCam2 = useRef<HTMLVideoElement | null>(null);
  const videoRefCam3 = useRef<HTMLVideoElement | null>(null);

  // Fetch Case Reconstruction Bundle from backend
  const fetchBundle = async (caseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cases/${caseId}/incident-reconstruction`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data: IncidentReconstructionBundle = await res.json();
      setDataBundle(data);
    } catch (err: any) {
      console.warn('Failed to load from backend, using default forensic bundle:', err);
      // Fallback to local default bundle
      loadDefaultBundle();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultBundle = () => {
    const defaultData: IncidentReconstructionBundle = {
      case: {
        id: 'CASE-2026-001',
        name: 'Suspected Vehicle Theft & Loading Dock Infiltration',
        status: 'UNDER ANALYSIS',
        created: '2026-09-11 10:10:00 UTC',
        lastUpdated: '2026-09-11 10:35:12 UTC',
        leadInvestigator: 'Insp. R. Verma / Digital Forensics Unit',
        location: 'Perimeter Sector 4 Logistics Terminal',
        description: 'Multi-camera forensic reconstruction connecting pedestrian gate access, loading bay forced entry, and vehicle egress.',
        integrityStatus: '✓ All recorded hashes verified'
      },
      metrics: {
        camerasCount: 3,
        evidenceCount: 3,
        eventsCount: 8,
        candidateSubjects: 1,
        candidateVehicles: 1,
        crossCameraLinks: 2,
        integrityStatus: '✓ All recorded hashes verified'
      },
      cameras: [
        {
          id: 'CAM-01-GATE',
          caseId: 'CASE-2026-001',
          name: 'Camera 01: Gate West',
          location: 'West Perimeter Concourse',
          direction: 'Facing Entry Access Road & Turnstile',
          videoSource: '/samples/sample_cctv_camera01_gate.mp4',
          evidenceId: 'EV-001',
          fps: 25,
          resolution: '1280x720 (720p HD)',
          nextHop: 'CAM-02-DOCK',
          distanceMeters: 95,
          nominalTransitSeconds: 75,
          orderIndex: 1
        },
        {
          id: 'CAM-02-DOCK',
          caseId: 'CASE-2026-001',
          name: 'Camera 02: Loading Dock',
          location: 'Building B Loading Corridor',
          direction: 'Interior Dock Access & Staff Egress Bay',
          videoSource: '/samples/sample_cctv_camera02_dock.mp4',
          evidenceId: 'EV-002',
          fps: 25,
          resolution: '1280x720 (720p HD)',
          nextHop: 'CAM-03-PERIMETER',
          distanceMeters: 70,
          nominalTransitSeconds: 55,
          orderIndex: 2
        },
        {
          id: 'CAM-03-PERIMETER',
          caseId: 'CASE-2026-001',
          name: 'Camera 03: Parking Exit',
          location: 'South Perimeter Parking & Dispatch Bay',
          direction: 'Vehicle Outbound Barrier & Public Road Exit',
          videoSource: '/samples/sample_cctv_camera03_perimeter.mp4',
          evidenceId: 'EV-003',
          fps: 25,
          resolution: '1280x720 (720p HD)',
          nextHop: undefined,
          distanceMeters: 0,
          nominalTransitSeconds: 0,
          orderIndex: 3
        }
      ],
      evidence: [
        {
          id: 'EV-001',
          caseId: 'CASE-2026-001',
          filename: 'sample_cctv_camera01_gate.mp4',
          fileSize: 18454912,
          fileSizeBytesFormatted: '17.60 MB',
          fileType: 'Forensic Video Container (.mp4 / AVC)',
          sourceType: 'NVR Channel 01 Direct Stream Dump',
          sha256: '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19',
          legacyMd5: '9b3f46f5c88c7d62057d0797171e5494',
          acquisitionTimestamp: '2026-09-11 10:14:15 UTC',
          deviceId: 'NVR-HIK-WEST-01',
          status: 'Verified',
          readOnly: true,
          workingCopyCreated: true,
          healthScore: 98
        },
        {
          id: 'EV-002',
          caseId: 'CASE-2026-001',
          filename: 'sample_cctv_camera02_dock.mp4',
          fileSize: 14680064,
          fileSizeBytesFormatted: '14.00 MB',
          fileType: 'Forensic Video Container (.mp4 / AVC)',
          sourceType: 'NVR Channel 02 Direct Stream Dump',
          sha256: '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a',
          legacyMd5: 'c1a79f323e20e6f669db6e5e8e8111e0',
          acquisitionTimestamp: '2026-09-11 10:16:00 UTC',
          deviceId: 'NVR-HIK-DOCK-02',
          status: 'Verified',
          readOnly: true,
          workingCopyCreated: true,
          healthScore: 95
        },
        {
          id: 'EV-003',
          caseId: 'CASE-2026-001',
          filename: 'sample_cctv_camera03_perimeter.mp4',
          fileSize: 11534336,
          fileSizeBytesFormatted: '11.00 MB',
          fileType: 'Forensic Video Container (.mp4 / AVC)',
          sourceType: 'NVR Channel 03 Direct Stream Dump',
          sha256: '492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2',
          legacyMd5: '88c1b3f9479326e13bca17c2f0d61184',
          acquisitionTimestamp: '2026-09-11 10:18:30 UTC',
          deviceId: 'NVR-HIK-GATE-03',
          status: 'Verified',
          readOnly: true,
          workingCopyCreated: true,
          healthScore: 97
        }
      ],
      events: [
        {
          id: 'EVT-REC-01',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-01-GATE',
          cameraName: 'Camera 01: Gate West',
          evidenceId: 'EV-001',
          timestamp: '2026-03-10 10:14:32 UTC',
          videoTimeSeconds: 4.5,
          frameNumber: 112,
          eventType: 'Perimeter Access / Turnstile Entry',
          detectedObject: 'Person',
          trackId: 'P-07',
          confidence: 94.2,
          boundingBox: { x: 380, y: 190, w: 90, h: 220 },
          details: 'Unknown subject enters facility perimeter through west pedestrian access way wearing dark jacket and dark trousers.',
          correlationConfidence: 94,
          correlationReasons: ['Initial visual appearance captured at gate turnstile'],
          relatedEventIds: ['EVT-REC-02', 'EVT-REC-04'],
          factType: 'OBSERVED FACT'
        },
        {
          id: 'EVT-REC-02',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-01-GATE',
          cameraName: 'Camera 01: Gate West',
          evidenceId: 'EV-001',
          timestamp: '2026-03-10 10:15:05 UTC',
          videoTimeSeconds: 14.0,
          frameNumber: 350,
          eventType: 'Trajectory Egress Eastbound',
          detectedObject: 'Person',
          trackId: 'P-07',
          confidence: 91.5,
          boundingBox: { x: 710, y: 220, w: 85, h: 210 },
          details: 'Subject P-07 exits Camera 01 field of view moving eastbound along the central concourse path heading toward Building B.',
          correlationConfidence: 91,
          correlationReasons: ['Heading matches Loading Dock connecting corridor (bearing 085°)'],
          relatedEventIds: ['EVT-REC-01', 'EVT-REC-03'],
          factType: 'OBSERVED FACT'
        },
        {
          id: 'EVT-REC-03',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-02-DOCK',
          cameraName: 'Camera 02: Loading Dock',
          evidenceId: 'EV-002',
          timestamp: '2026-03-10 10:16:08 UTC',
          videoTimeSeconds: 2.2,
          frameNumber: 55,
          eventType: 'Corridor Arrival',
          detectedObject: 'Person',
          trackId: 'P-12',
          confidence: 89.4,
          boundingBox: { x: 260, y: 160, w: 95, h: 240 },
          details: 'Subject enters Loading Dock camera field of view from west corridor entrance. 96s delta aligns with 95m physical distance.',
          correlationConfidence: 87,
          correlationReasons: [
            'Plausible transit time from Camera 01: 96s for 95m walk (0.99 m/s velocity)',
            'Matching dark clothing signature, medium height, lighter footwear profile',
            'No intervening corridors or branch pathways between Gate and Dock'
          ],
          relatedEventIds: ['EVT-REC-02', 'EVT-REC-04'],
          factType: 'AI-ASSISTED INFERENCE'
        },
        {
          id: 'EVT-REC-04',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-02-DOCK',
          cameraName: 'Camera 02: Loading Dock',
          evidenceId: 'EV-002',
          timestamp: '2026-03-10 10:16:45 UTC',
          videoTimeSeconds: 8.5,
          frameNumber: 212,
          eventType: 'Loitering Near Secured Access',
          detectedObject: 'Person',
          trackId: 'P-12',
          confidence: 93.0,
          boundingBox: { x: 420, y: 170, w: 100, h: 235 },
          details: 'Subject P-12 approaches secured bay access door, inspects door electronic latch and lock housing.',
          correlationConfidence: 93,
          correlationReasons: ['Direct continuous track from corridor arrival'],
          relatedEventIds: ['EVT-REC-03', 'EVT-REC-05'],
          factType: 'OBSERVED FACT'
        },
        {
          id: 'EVT-REC-05',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-02-DOCK',
          cameraName: 'Camera 02: Loading Dock',
          evidenceId: 'EV-002',
          timestamp: '2026-03-10 10:17:15 UTC',
          videoTimeSeconds: 15.2,
          frameNumber: 380,
          eventType: 'Forced Entry / Door Breach',
          detectedObject: 'Person & Door Mechanism',
          trackId: 'P-12',
          confidence: 96.1,
          boundingBox: { x: 480, y: 150, w: 120, h: 260 },
          details: 'Loading bay secondary door opened without electronic badge badge-in swipe. Subject enters interior warehouse.',
          correlationConfidence: 96,
          correlationReasons: ['Security log confirms zero badge reads at this timestamp'],
          relatedEventIds: ['EVT-REC-04', 'EVT-REC-06'],
          factType: 'OBSERVED FACT'
        },
        {
          id: 'EVT-REC-06',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-02-DOCK',
          cameraName: 'Camera 02: Loading Dock',
          evidenceId: 'EV-002',
          timestamp: '2026-03-10 10:17:50 UTC',
          videoTimeSeconds: 18.8,
          frameNumber: 470,
          eventType: 'Interior Egress with Cargo',
          detectedObject: 'Person with Duffle/Bag',
          trackId: 'P-12',
          confidence: 92.3,
          boundingBox: { x: 530, y: 165, w: 110, h: 245 },
          details: 'Subject exits interior door holding dark cylindrical duffle bag; accelerates south toward Parking Bay annex door.',
          correlationConfidence: 92,
          correlationReasons: ['Matches Subject P-12 profile, carrying newly acquired asset'],
          relatedEventIds: ['EVT-REC-05', 'EVT-REC-07'],
          factType: 'OBSERVED FACT'
        },
        {
          id: 'EVT-REC-07',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-03-PERIMETER',
          cameraName: 'Camera 03: Parking Exit',
          evidenceId: 'EV-003',
          timestamp: '2026-03-10 10:18:41 UTC',
          videoTimeSeconds: 3.4,
          frameNumber: 85,
          eventType: 'Vehicle Ignition & Movement',
          detectedObject: 'Vehicle (Dark Sedan)',
          trackId: 'V-03',
          confidence: 88.7,
          boundingBox: { x: 310, y: 220, w: 320, h: 180 },
          details: 'Dark sedan in parking bay bay 4 activates headlamps and pulls into exit lane. 131s after dock departure.',
          correlationConfidence: 81,
          correlationReasons: [
            'Plausible transit: 70m walk from dock south door + vehicle entry + engine ignition (131s total)',
            'No other vehicle movements detected in parking perimeter in prior 12 minutes'
          ],
          relatedEventIds: ['EVT-REC-06', 'EVT-REC-08'],
          factType: 'AI-ASSISTED INFERENCE'
        },
        {
          id: 'EVT-REC-08',
          caseId: 'CASE-2026-001',
          cameraId: 'CAM-03-PERIMETER',
          cameraName: 'Camera 03: Parking Exit',
          evidenceId: 'EV-003',
          timestamp: '2026-03-10 10:19:12 UTC',
          videoTimeSeconds: 11.0,
          frameNumber: 275,
          eventType: 'Perimeter Barrier Egress',
          detectedObject: 'Vehicle (Dark Sedan)',
          trackId: 'V-03',
          confidence: 95.8,
          boundingBox: { x: 620, y: 260, w: 360, h: 210 },
          details: 'Dark sedan accelerates past the outbound barrier onto Sector 4 service road heading South-West.',
          correlationConfidence: 95,
          correlationReasons: ['Outbound egress matches timing of asset breach'],
          relatedEventIds: ['EVT-REC-07'],
          factType: 'OBSERVED FACT'
        }
      ],
      correlations: [
        {
          id: 'CORR-01',
          caseId: 'CASE-2026-001',
          sourceCamera: 'Camera 01: Gate West',
          targetCamera: 'Camera 02: Loading Dock',
          sourceTrack: 'P-07',
          targetTrack: 'P-12',
          sourceEventId: 'EVT-REC-01',
          targetEventId: 'EVT-REC-04',
          timeDeltaSeconds: 96,
          distanceMeters: 95,
          temporalPlausibility: 'PLAUSIBLE (0.99 m/s velocity within standard 0.8 - 1.4 m/s human walking speed)',
          correlationScore: 87,
          reasons: [
            'Compatible time interval: 1m 36s delta aligns with physical 95m distance',
            'Compatible movement direction: Eastbound entry along concourse corridor',
            'Similar appearance: Dark jacket, dark trousers, lighter footwear, medium build',
            'Connected camera locations: Directly adjacent physical camera sectors'
          ],
          analystStatus: 'LIKELY SAME SUBJECT (AI-ASSISTED INFERENCE)'
        },
        {
          id: 'CORR-02',
          caseId: 'CASE-2026-001',
          sourceCamera: 'Camera 02: Loading Dock',
          targetCamera: 'Camera 03: Parking Exit',
          sourceTrack: 'P-12',
          targetTrack: 'V-03',
          sourceEventId: 'EVT-REC-05',
          targetEventId: 'EVT-REC-07',
          timeDeltaSeconds: 131,
          distanceMeters: 70,
          temporalPlausibility: 'PLAUSIBLE (Transit time compatible with 70m walk + vehicle access + ignition start)',
          correlationScore: 81,
          reasons: [
            'Compatible time interval: 2m 11s delta matches walking 70m and entering parked vehicle',
            'Compatible exit trajectory: Dock corridor south door opens directly to Parking Exit bay',
            'No alternative pedestrian egress detected on perimeter sensors during interval',
            'Vehicle V-03 initiates departure precisely 1m 26s after subject enters parking annex'
          ],
          analystStatus: 'INCIDENT SEQUENCE LINKED (AI-ASSISTED INFERENCE)'
        }
      ],
      custody: [
        {
          id: 'COC-01',
          evidenceId: 'EV-001',
          caseId: 'CASE-2026-001',
          timestamp: '2026-09-11 10:14:15 UTC',
          action: 'Physical Acquisition & Write-Blocked Bit-Stream Imaging',
          actor: 'Insp. R. Verma',
          system: 'Tableau TD2u Forensic Bridge (Host CFX-STATION-01)',
          hashReference: '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19',
          integrityVerified: true,
          notes: 'Camera 01 Gate West raw stream acquired non-destructively; working copy generated with identical SHA-256 hash.'
        },
        {
          id: 'COC-02',
          evidenceId: 'EV-002',
          caseId: 'CASE-2026-001',
          timestamp: '2026-09-11 10:16:00 UTC',
          action: 'Physical Acquisition & Write-Blocked Bit-Stream Imaging',
          actor: 'Insp. R. Verma',
          system: 'Tableau TD2u Forensic Bridge (Host CFX-STATION-01)',
          hashReference: '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a',
          integrityVerified: true,
          notes: 'Camera 02 Loading Dock stream acquired non-destructively; master hash calculated and verified.'
        },
        {
          id: 'COC-03',
          evidenceId: 'EV-003',
          caseId: 'CASE-2026-001',
          timestamp: '2026-09-11 10:18:30 UTC',
          action: 'Physical Acquisition & Write-Blocked Bit-Stream Imaging',
          actor: 'Insp. R. Verma',
          system: 'Tableau TD2u Forensic Bridge (Host CFX-STATION-01)',
          hashReference: '492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2',
          integrityVerified: true,
          notes: 'Camera 03 Parking Exit stream acquired non-destructively; master hash recorded in forensic locker.'
        },
        {
          id: 'COC-04',
          evidenceId: 'ALL-EVIDENCE',
          caseId: 'CASE-2026-001',
          timestamp: '2026-09-11 10:35:12 UTC',
          action: 'Automated Cryptographic Hash Verification Check',
          actor: 'CFX Hashing Daemon',
          system: 'CFX Cryptographic Subsystem',
          hashReference: 'SHA256-VERIFIED-ZERO-DRIFT',
          integrityVerified: true,
          notes: 'Cryptographic digest re-computation on all 3 files verified zero bit drift.'
        }
      ]
    };
    setDataBundle(defaultData);
  };

  useEffect(() => {
    fetchBundle(selectedCaseId);
  }, [selectedCaseId]);

  // Handle live verify hashes action
  const handleVerifyHashes = async () => {
    try {
      setVerifyingHashes(true);
      const res = await fetch(`/api/cases/${selectedCaseId}/verify-hashes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examiner: 'Insp. R. Verma / Digital Forensics Unit' })
      });
      if (res.ok) {
        const result = await res.json();
        setHashVerificationResult(result);
        // Refresh bundle to include the newly logged custody entry
        fetchBundle(selectedCaseId);
      }
    } catch (e) {
      console.error('Error verifying hashes:', e);
    } finally {
      setVerifyingHashes(false);
    }
  };

  // Add Custody Entry
  const handleAddCustodyEntry = async () => {
    if (!newCustodyAction.trim()) return;
    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/custody`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newCustodyAction,
          notes: newCustodyNotes,
          actor: 'Insp. R. Verma / Examiner',
          system: 'CFX Forensic Workstation 01'
        })
      });
      if (res.ok) {
        setIsAddingCustody(false);
        setNewCustodyAction('');
        setNewCustodyNotes('');
        fetchBundle(selectedCaseId);
      }
    } catch (e) {
      console.error('Failed to append custody entry:', e);
    }
  };

  // Synchronize or jump video player when an event is clicked
  const handleSelectEvent = (event: IncidentEvent) => {
    setSelectedEventId(event.id);
    setActiveCameraId(event.cameraId);

    // Seek the corresponding camera video
    const time = event.videoTimeSeconds;
    if (event.cameraId === 'CAM-01-GATE' && videoRefCam1.current) {
      videoRefCam1.current.currentTime = time;
      videoRefCam1.current.play().catch(() => {});
    } else if (event.cameraId === 'CAM-02-DOCK' && videoRefCam2.current) {
      videoRefCam2.current.currentTime = time;
      videoRefCam2.current.play().catch(() => {});
    } else if (event.cameraId === 'CAM-03-PERIMETER' && videoRefCam3.current) {
      videoRefCam3.current.currentTime = time;
      videoRefCam3.current.play().catch(() => {});
    }
  };

  // Toggle sync play across all 3 cameras
  const toggleSyncPlay = () => {
    const nextPlay = !isSyncPlaying;
    setIsSyncPlaying(nextPlay);
    const v1 = videoRefCam1.current;
    const v2 = videoRefCam2.current;
    const v3 = videoRefCam3.current;

    [v1, v2, v3].forEach((v) => {
      if (v) {
        if (nextPlay) {
          v.playbackRate = playbackSpeed;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  };

  // Reset all cameras to start
  const handleResetCameras = () => {
    setIsSyncPlaying(false);
    [videoRefCam1.current, videoRefCam2.current, videoRefCam3.current].forEach((v) => {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    });
  };

  // Step 1 frame forward or backward (+- 1/25th sec)
  const stepFrame = (forward: boolean) => {
    const delta = forward ? 1 / 25 : -1 / 25;
    const activeVideo =
      activeCameraId === 'CAM-01-GATE'
        ? videoRefCam1.current
        : activeCameraId === 'CAM-02-DOCK'
        ? videoRefCam2.current
        : videoRefCam3.current;

    if (activeVideo) {
      activeVideo.pause();
      setIsSyncPlaying(false);
      activeVideo.currentTime = Math.max(0, activeVideo.currentTime + delta);
    }
  };

  if (loading && !dataBundle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="font-mono text-xs uppercase tracking-widest">
          Synthesizing Cross-Camera Incident Topology & Cryptographic Hashes...
        </p>
      </div>
    );
  }

  const bundle = dataBundle!;
  const filteredEvents = bundle.events.filter((evt) => {
    if (filterCamera !== 'ALL' && evt.cameraId !== filterCamera) return false;
    if (filterFactType !== 'ALL' && evt.factType !== filterFactType) return false;
    return true;
  });

  const activeEvent = bundle.events.find((e) => e.id === selectedEventId) || bundle.events[0];

  return (
    <div id="cfx-incident-reconstruction-container" className="space-y-6">
      {/* 1. TOP CASE MANAGEMENT HEADER & FORENSIC METRICS SUMMARY */}
      <section
        id="reconstruction-case-header"
        className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-semibold tracking-wider">
                {bundle.case.id}
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-300 text-xs font-medium">
                {bundle.case.status}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                {bundle.case.location}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-emerald-400" />
              {bundle.case.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {bundle.case.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2 font-mono">
              <span>Lead: <strong className="text-slate-200">{bundle.case.leadInvestigator}</strong></span>
              <span>•</span>
              <span>Window: <span className="text-slate-200">10:14:00 - 10:19:30 UTC</span></span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {bundle.case.integrityStatus}
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-verify-case-hashes"
              onClick={handleVerifyHashes}
              disabled={verifyingHashes}
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-slate-950 font-semibold text-xs transition flex items-center gap-2 shadow-sm"
              title="Recalculate SHA-256 digests from master CCTV disks"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifyingHashes ? 'animate-spin' : ''}`} />
              {verifyingHashes ? 'Verifying Hashes...' : 'Verify All Case Hashes'}
            </button>
            <button
              id="btn-export-reconstruction-report"
              onClick={() => setActiveSubTab('findings-report')}
              className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-sky-400" />
              Forensic Report Preview
            </button>
          </div>
        </div>

        {/* 7 Core Forensic Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <Camera className="w-3 h-3 text-sky-400" /> Cameras
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {bundle.metrics.camerasCount} <span className="text-[10px] font-normal text-slate-400">Streams</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" /> Evidence
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {bundle.metrics.evidenceCount} <span className="text-[10px] font-normal text-slate-400">Files</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Linked Events
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {bundle.metrics.eventsCount} <span className="text-[10px] font-normal text-slate-400">Keyframes</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-purple-400" /> Candidates
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {bundle.metrics.candidateSubjects} <span className="text-[10px] font-normal text-slate-400">Subject (P-07/12)</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <Car className="w-3 h-3 text-indigo-400" /> Vehicle
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {bundle.metrics.candidateVehicles} <span className="text-[10px] font-normal text-slate-400">Sedan (V-03)</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded p-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <GitMerge className="w-3 h-3 text-sky-400" /> Cross-Cam Links
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {bundle.metrics.crossCameraLinks} <span className="text-[10px] font-normal text-slate-400">Correlations</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-emerald-800/40 rounded p-2.5 col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Hash Integrity
            </div>
            <div className="text-xs font-bold font-mono text-emerald-300 mt-1 truncate">
              ZERO DRIFT (0)
            </div>
          </div>
        </div>

        {/* Hash Verification Success Banner if just executed */}
        {hashVerificationResult && (
          <div className="mt-3 p-3 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>{hashVerificationResult.summary}</strong>: Recomputed SHA-256 on {hashVerificationResult.verifiedCount} video streams at {hashVerificationResult.verifiedAt}. All bit-streams identical to master forensic disk image.
              </span>
            </div>
            <button
              onClick={() => setHashVerificationResult(null)}
              className="text-slate-400 hover:text-slate-200 ml-3"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* 2. RECONSTRUCTION WORKFLOW TAB CONTROLS */}
      <nav
        id="reconstruction-subnav"
        className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2"
      >
        {[
          { id: 'timeline-replay', label: '1. Incident Timeline & Multi-View Replay', icon: Play },
          { id: 'camera-topology', label: '2. Camera Topology & Transit Model', icon: MapPin },
          { id: 'evidence-locker', label: '3. Case Evidence Locker (SHA-256)', icon: FolderLock },
          { id: 'relationship-graph', label: '4. Evidence Relationship Graph', icon: GitMerge },
          { id: 'chain-of-custody', label: '5. Integrated Chain of Custody', icon: History },
          { id: 'findings-report', label: '6. Unified Forensic Findings & Report', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 rounded text-xs font-medium transition flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: CHRONOLOGICAL INCIDENT TIMELINE & MULTI-VIEW REPLAY */}
      {/* ========================================================================= */}
      {activeSubTab === 'timeline-replay' && (
        <div className="space-y-6">
          {/* MULTI-VIEW SYNCHRONIZED SURVEILLANCE PLAYBACK STAGE */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Synchronized Multi-Camera Video Surveillance Matrix
                </h3>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                  REAL CCTV FOOTAGE
                </span>
              </div>

              {/* Playback Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleSyncPlay}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {isSyncPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isSyncPlaying ? 'Pause Feeds' : 'Play All Feeds'}
                </button>

                <button
                  onClick={() => stepFrame(false)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                  title="Step 1 Frame Backwards (-0.04s)"
                >
                  -1 Frame
                </button>
                <button
                  onClick={() => stepFrame(true)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                  title="Step 1 Frame Forward (+0.04s)"
                >
                  +1 Frame
                </button>

                <button
                  onClick={handleResetCameras}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  title="Reset to 00:00:00"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Speed selector */}
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono">
                  <span className="text-[10px] text-slate-500">SPD:</span>
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        [videoRefCam1.current, videoRefCam2.current, videoRefCam3.current].forEach((v) => {
                          if (v) v.playbackRate = spd;
                        });
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        playbackSpeed === spd ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Bounding Box Toggle */}
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-2 py-1 rounded text-xs border flex items-center gap-1 font-mono transition ${
                    showBoundingBoxes
                      ? 'bg-sky-950 text-sky-300 border-sky-700'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title="Toggle AI-assisted detection overlays"
                >
                  <Crosshair className="w-3 h-3" />
                  {showBoundingBoxes ? 'Boxes ON' : 'Boxes OFF'}
                </button>
              </div>
            </div>

            {/* 3 Real CCTV Video Feeds (Side-by-side surveillance grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Camera 01 Feed */}
              <div
                onClick={() => setActiveCameraId('CAM-01-GATE')}
                className={`relative rounded overflow-hidden bg-black border transition cursor-pointer ${
                  activeCameraId === 'CAM-01-GATE'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  CAM 01: GATE WEST
                </div>
                <div className="absolute top-2 right-2 z-10 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                  10:14:15 UTC
                </div>

                <div className="aspect-video relative bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRefCam1}
                    src="/samples/sample_cctv_camera01_gate.mp4"
                    controls={false}
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {showBoundingBoxes && activeCameraId === 'CAM-01-GATE' && activeEvent.boundingBox && (
                    <div
                      className="absolute border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none transition-all duration-200"
                      style={{
                        left: `${(activeEvent.boundingBox.x / 1280) * 100}%`,
                        top: `${(activeEvent.boundingBox.y / 720) * 100}%`,
                        width: `${(activeEvent.boundingBox.w / 1280) * 100}%`,
                        height: `${(activeEvent.boundingBox.h / 720) * 100}%`
                      }}
                    >
                      <span className="absolute -top-5 left-0 bg-emerald-500 text-slate-950 font-mono text-[9px] font-bold px-1 py-0.2 rounded whitespace-nowrap">
                        {activeEvent.trackId} ({activeEvent.confidence}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                  <span className="truncate">Ingress & Concourse Entry</span>
                  <span className="font-mono text-[10px] text-slate-500">EV-001</span>
                </div>
              </div>

              {/* Camera 02 Feed */}
              <div
                onClick={() => setActiveCameraId('CAM-02-DOCK')}
                className={`relative rounded overflow-hidden bg-black border transition cursor-pointer ${
                  activeCameraId === 'CAM-02-DOCK'
                    ? 'border-sky-500 ring-2 ring-sky-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  CAM 02: LOADING DOCK
                </div>
                <div className="absolute top-2 right-2 z-10 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                  10:16:00 UTC
                </div>

                <div className="aspect-video relative bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRefCam2}
                    src="/samples/sample_cctv_camera02_dock.mp4"
                    controls={false}
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {showBoundingBoxes && activeCameraId === 'CAM-02-DOCK' && activeEvent.boundingBox && (
                    <div
                      className="absolute border-2 border-sky-400 bg-sky-500/10 pointer-events-none transition-all duration-200"
                      style={{
                        left: `${(activeEvent.boundingBox.x / 1280) * 100}%`,
                        top: `${(activeEvent.boundingBox.y / 720) * 100}%`,
                        width: `${(activeEvent.boundingBox.w / 1280) * 100}%`,
                        height: `${(activeEvent.boundingBox.h / 720) * 100}%`
                      }}
                    >
                      <span className="absolute -top-5 left-0 bg-sky-500 text-slate-950 font-mono text-[9px] font-bold px-1 py-0.2 rounded whitespace-nowrap">
                        {activeEvent.trackId} ({activeEvent.confidence}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                  <span className="truncate">Dock Corridor & Forced Door</span>
                  <span className="font-mono text-[10px] text-slate-500">EV-002</span>
                </div>
              </div>

              {/* Camera 03 Feed */}
              <div
                onClick={() => setActiveCameraId('CAM-03-PERIMETER')}
                className={`relative rounded overflow-hidden bg-black border transition cursor-pointer ${
                  activeCameraId === 'CAM-03-PERIMETER'
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  CAM 03: PARKING EXIT
                </div>
                <div className="absolute top-2 right-2 z-10 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                  10:18:30 UTC
                </div>

                <div className="aspect-video relative bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRefCam3}
                    src="/samples/sample_cctv_camera03_perimeter.mp4"
                    controls={false}
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {showBoundingBoxes && activeCameraId === 'CAM-03-PERIMETER' && activeEvent.boundingBox && (
                    <div
                      className="absolute border-2 border-purple-400 bg-purple-500/10 pointer-events-none transition-all duration-200"
                      style={{
                        left: `${(activeEvent.boundingBox.x / 1280) * 100}%`,
                        top: `${(activeEvent.boundingBox.y / 720) * 100}%`,
                        width: `${(activeEvent.boundingBox.w / 1280) * 100}%`,
                        height: `${(activeEvent.boundingBox.h / 720) * 100}%`
                      }}
                    >
                      <span className="absolute -top-5 left-0 bg-purple-400 text-slate-950 font-mono text-[9px] font-bold px-1 py-0.2 rounded whitespace-nowrap">
                        {activeEvent.trackId} ({activeEvent.confidence}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                  <span className="truncate">Parking Bay & Outbound Egress</span>
                  <span className="font-mono text-[10px] text-slate-500">EV-003</span>
                </div>
              </div>
            </div>

            {/* Incident Sequence Progress Scrub Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-mono text-[11px]">
                  RECONSTRUCTED INCIDENT PROGRESSION (10:14:32 - 10:19:12 UTC)
                </span>
                <span className="text-emerald-400 font-mono font-medium text-[11px]">
                  Active: {activeEvent.cameraName} ({activeEvent.timestamp})
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800 relative">
                {bundle.events.map((evt, idx) => {
                  const isCur = evt.id === selectedEventId;
                  const color =
                    evt.cameraId === 'CAM-01-GATE'
                      ? 'bg-emerald-500'
                      : evt.cameraId === 'CAM-02-DOCK'
                      ? 'bg-sky-500'
                      : 'bg-purple-500';

                  return (
                    <div
                      key={evt.id}
                      onClick={() => handleSelectEvent(evt)}
                      className={`flex-1 h-full cursor-pointer transition-opacity border-r border-slate-900 ${color} ${
                        isCur ? 'opacity-100 ring-2 ring-white z-10' : 'opacity-40 hover:opacity-80'
                      }`}
                      title={`Step ${idx + 1}: ${evt.cameraName} - ${evt.eventType} (${evt.timestamp})`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL CROSS-CAMERA EVENT TIMELINE CARDS */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Chronological Cross-Camera Incident Events
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any event card to jump the multi-view player directly to that keyframe and timestamp.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterCamera}
                  onChange={(e) => setFilterCamera(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                >
                  <option value="ALL">All Cameras (3)</option>
                  <option value="CAM-01-GATE">Camera 01: Gate West</option>
                  <option value="CAM-02-DOCK">Camera 02: Loading Dock</option>
                  <option value="CAM-03-PERIMETER">Camera 03: Parking Exit</option>
                </select>

                <select
                  value={filterFactType}
                  onChange={(e) => setFilterFactType(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                >
                  <option value="ALL">All Forensic Designations</option>
                  <option value="OBSERVED FACT">Observed Forensic Facts Only</option>
                  <option value="AI-ASSISTED INFERENCE">AI-Assisted Inferences Only</option>
                </select>
              </div>
            </div>

            {/* Event Cards List */}
            <div className="space-y-3">
              {filteredEvents.map((evt, idx) => {
                const isSelected = evt.id === selectedEventId;
                const camBadgeColor =
                  evt.cameraId === 'CAM-01-GATE'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                    : evt.cameraId === 'CAM-02-DOCK'
                    ? 'bg-sky-950 text-sky-300 border-sky-800/60'
                    : 'bg-purple-950 text-purple-300 border-purple-800/60';

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt)}
                    className={`rounded-lg p-4 border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      {/* Left: Indicator & Main Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            STEP {idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${camBadgeColor}`}>
                            {evt.cameraName}
                          </span>
                          <span className="font-mono text-xs text-slate-300 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.timestamp}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            (Seek {evt.videoTimeSeconds}s / Frm #{evt.frameNumber})
                          </span>

                          {/* Fact Type Forensic Badge */}
                          {evt.factType === 'OBSERVED FACT' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold">
                              OBSERVED FACT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-700/60 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              AI-ASSISTED INFERENCE
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          <span>{evt.eventType}</span>
                          <span className="text-xs font-mono font-normal text-slate-400">
                            [Track: <strong className="text-slate-200">{evt.trackId}</strong> • Confidence {evt.confidence}%]
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                          {evt.details}
                        </p>

                        {/* Correlation rationale pill if present */}
                        {evt.correlationReasons && evt.correlationReasons.length > 0 && (
                          <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded p-2 text-[11px] text-slate-300 space-y-1">
                            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center gap-1">
                              <Info className="w-3 h-3 text-sky-400" />
                              Correlation Rationale ({evt.correlationConfidence}% confidence):
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {evt.correlationReasons.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right: Quick Action Button */}
                      <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEvent(evt);
                          }}
                          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
                        >
                          <Play className="w-3 h-3 text-emerald-400 fill-current" />
                          Seek & Play
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CAMERA TOPOLOGY & TRANSIT MODEL */}
      {/* ========================================================================= */}
      {activeSubTab === 'camera-topology' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-md">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Physical Layout & Inter-Camera Transit Model
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Visualizing the spatial distance, field-of-view orientations, and walking velocity plausibility between adjacent CCTV sectors.
            </p>

            {/* Spatial Stepper Diagram */}
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 relative">
              {bundle.cameras.map((cam, idx) => {
                return (
                  <React.Fragment key={cam.id}>
                    {/* Camera Node Card */}
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          SECTOR 0{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                          {cam.id}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{cam.name}</h4>
                        <div className="text-xs text-slate-400 mt-0.5">{cam.location}</div>
                      </div>

                      <div className="text-xs space-y-1 text-slate-300 font-mono bg-slate-900/60 p-2.5 rounded border border-slate-850">
                        <div>Direction: <span className="text-slate-200">{cam.direction}</span></div>
                        <div>Resolution: <span className="text-slate-200">{cam.resolution}</span></div>
                        <div>Framerate: <span className="text-slate-200">{cam.fps} fps</span></div>
                        <div>Evidence: <span className="text-emerald-400">{cam.evidenceId}</span></div>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                        <button
                          onClick={() => {
                            setActiveCameraId(cam.id);
                            setActiveSubTab('timeline-replay');
                          }}
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                        >
                          View Feed <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Transition Connector if not last */}
                    {idx < bundle.cameras.length - 1 && (
                      <div className="flex lg:flex-col items-center justify-center p-3 text-center bg-slate-900/40 rounded border border-dashed border-slate-800 min-w-[170px]">
                        <div className="font-mono text-xs font-bold text-slate-200 mb-1">
                          ~{cam.distanceMeters} METERS
                        </div>
                        <div className="text-[11px] text-slate-400 mb-2">
                          Nominal Walk: {cam.nominalTransitSeconds}s
                        </div>
                        <div className="px-2 py-1 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-mono text-[10px] font-bold">
                          ✓ VELOCITY PLAUSIBLE
                        </div>
                        <ArrowRight className="hidden lg:block w-4 h-4 text-slate-600 mt-2 rotate-90 lg:rotate-0" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Cross-Camera Correlation Analysis Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-md">
            <h4 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2 font-mono uppercase">
              <Sparkles className="w-4 h-4 text-sky-400" />
              AI-Assisted Cross-Camera Correlation Matrix
            </h4>

            <div className="space-y-4">
              {bundle.correlations.map((corr) => (
                <div
                  key={corr.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {corr.id}
                      </span>
                      <span className="text-sm font-semibold text-slate-200">
                        {corr.sourceCamera} → {corr.targetCamera}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono text-xs font-bold">
                        MATCH SCORE: {corr.correlationScore}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[10px] font-semibold">
                        {corr.analystStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 p-2.5 rounded">
                      <span className="text-slate-400">Source Track:</span>{' '}
                      <strong className="text-slate-200">{corr.sourceTrack}</strong> ({corr.sourceCamera})
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded">
                      <span className="text-slate-400">Target Track:</span>{' '}
                      <strong className="text-slate-200">{corr.targetTrack}</strong> ({corr.targetCamera})
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded">
                      <span className="text-slate-400">Elapsed Interval:</span>{' '}
                      <strong className="text-slate-200">{corr.timeDeltaSeconds}s</strong> ({corr.distanceMeters}m)
                    </div>
                  </div>

                  <div className="bg-slate-900/70 p-3 rounded text-xs space-y-1.5">
                    <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                      Forensic Rationale:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {corr.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                    <div className="mt-2 text-[11px] text-emerald-400 font-mono">
                      Velocity Assessment: {corr.temporalPlausibility}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CASE EVIDENCE LOCKER & SHA-256 INTEGRITY */}
      {/* ========================================================================= */}
      {activeSubTab === 'evidence-locker' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-emerald-400" />
                  Case-Linked Forensic Evidence Locker
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bit-stream identical working copies, hardware write-blocking verification, and SHA-256 cryptographic digests.
                </p>
              </div>

              <button
                onClick={handleVerifyHashes}
                disabled={verifyingHashes}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifyingHashes ? 'animate-spin' : ''}`} />
                {verifyingHashes ? 'Recalculating Hashes...' : 'Re-verify All Hashes'}
              </button>
            </div>

            {/* Evidence Cards */}
            <div className="space-y-4">
              {bundle.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                        {ev.id}
                      </span>
                      <span className="font-semibold text-slate-200 text-sm">
                        {ev.filename}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({ev.fileSizeBytesFormatted})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        BIT-STREAM IDENTICAL (0 DRIFT)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        LOCK: READ-ONLY
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1 bg-slate-900 p-3 rounded">
                      <div className="text-slate-400 text-[10px] uppercase">Original Master SHA-256:</div>
                      <div className="text-emerald-400 font-mono text-[11px] break-all select-all font-semibold">
                        {ev.sha256}
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-900 p-3 rounded">
                      <div className="text-slate-400 text-[10px] uppercase">Re-Verified Working Copy SHA-256:</div>
                      <div className="text-emerald-400 font-mono text-[11px] break-all select-all font-semibold">
                        {ev.sha256}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                    <span>Source: <strong className="text-slate-300">{ev.sourceType}</strong></span>
                    <span>Acquisition Time: <span className="text-slate-300">{ev.acquisitionTimestamp}</span></span>
                    <span>Device: <span className="text-slate-300">{ev.deviceId}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EVIDENCE RELATIONSHIP GRAPH */}
      {/* ========================================================================= */}
      {activeSubTab === 'relationship-graph' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-md">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-1">
              <GitMerge className="w-4 h-4 text-emerald-400" />
              Evidence & Cross-Camera Relationship Network
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click any node in the interactive relationship graph to inspect its complete forensic metadata, velocity calculation, and custody trail.
            </p>

            {/* Interactive SVG Network Graph */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
              <svg viewBox="0 0 950 420" className="w-full h-auto min-w-[750px]">
                {/* Defs / Arrows */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                  </marker>
                  <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                </defs>

                {/* Lines */}
                {/* Case to Cameras */}
                <line x1="120" y1="210" x2="320" y2="90" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="120" y1="210" x2="320" y2="210" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="120" y1="210" x2="320" y2="330" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Cameras to Tracks */}
                <line x1="320" y1="90" x2="520" y2="90" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="320" y1="210" x2="520" y2="210" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="320" y1="330" x2="520" y2="330" stroke="#334155" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Tracks to Correlations */}
                <line x1="520" y1="90" x2="720" y2="150" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-active)" />
                <line x1="520" y1="210" x2="720" y2="150" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-active)" />
                <line x1="520" y1="210" x2="720" y2="270" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-active)" />
                <line x1="520" y1="330" x2="720" y2="270" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow-active)" />

                {/* NODES */}
                {/* 1. Case Node */}
                <g onClick={() => setSelectedGraphNodeId('CASE')} className="cursor-pointer">
                  <circle cx="120" cy="210" r="42" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
                  <text x="120" y="206" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">CASE</text>
                  <text x="120" y="222" fill="#94a3b8" fontSize="9" textAnchor="middle">2026-001</text>
                </g>

                {/* 2. Cameras */}
                <g onClick={() => setSelectedGraphNodeId('CAM-01')} className="cursor-pointer">
                  <rect x="260" y="65" width="120" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="320" y="87" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">CAM 01: GATE</text>
                  <text x="320" y="103" fill="#94a3b8" fontSize="9" textAnchor="middle">EV-001 (Master)</text>
                </g>

                <g onClick={() => setSelectedGraphNodeId('CAM-02')} className="cursor-pointer">
                  <rect x="260" y="185" width="120" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="320" y="207" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">CAM 02: DOCK</text>
                  <text x="320" y="223" fill="#94a3b8" fontSize="9" textAnchor="middle">EV-002 (Master)</text>
                </g>

                <g onClick={() => setSelectedGraphNodeId('CAM-03')} className="cursor-pointer">
                  <rect x="260" y="305" width="120" height="50" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <text x="320" y="327" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">CAM 03: EXIT</text>
                  <text x="320" y="343" fill="#94a3b8" fontSize="9" textAnchor="middle">EV-003 (Master)</text>
                </g>

                {/* 3. Subjects / Tracks */}
                <g onClick={() => setSelectedGraphNodeId('TRACK-P07')} className="cursor-pointer">
                  <rect x="460" y="65" width="120" height="50" rx="6" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                  <text x="520" y="87" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">TRACK P-07</text>
                  <text x="520" y="103" fill="#c084fc" fontSize="9" textAnchor="middle">10:14:32 UTC</text>
                </g>

                <g onClick={() => setSelectedGraphNodeId('TRACK-P12')} className="cursor-pointer">
                  <rect x="460" y="185" width="120" height="50" rx="6" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                  <text x="520" y="207" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">TRACK P-12</text>
                  <text x="520" y="223" fill="#c084fc" fontSize="9" textAnchor="middle">10:16:08 UTC</text>
                </g>

                <g onClick={() => setSelectedGraphNodeId('TRACK-V03')} className="cursor-pointer">
                  <rect x="460" y="305" width="120" height="50" rx="6" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                  <text x="520" y="327" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">VEHICLE V-03</text>
                  <text x="520" y="343" fill="#c084fc" fontSize="9" textAnchor="middle">10:18:41 UTC</text>
                </g>

                {/* 4. Correlations */}
                <g onClick={() => setSelectedGraphNodeId('CORR-1')} className="cursor-pointer">
                  <rect x="660" y="125" width="140" height="52" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
                  <text x="730" y="147" fill="#f0f9ff" fontSize="10" fontWeight="bold" textAnchor="middle">CORRELATION 01</text>
                  <text x="730" y="163" fill="#7dd3fc" fontSize="9" textAnchor="middle">87% Match • 96s (0.99m/s)</text>
                </g>

                <g onClick={() => setSelectedGraphNodeId('CORR-2')} className="cursor-pointer">
                  <rect x="660" y="245" width="140" height="52" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
                  <text x="730" y="267" fill="#f0f9ff" fontSize="10" fontWeight="bold" textAnchor="middle">CORRELATION 02</text>
                  <text x="730" y="283" fill="#7dd3fc" fontSize="9" textAnchor="middle">81% Link • 131s Window</text>
                </g>
              </svg>
            </div>

            {/* Selected Node Details Panel */}
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Selected Entity Forensic Profile
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Node ID: {selectedGraphNodeId}
                </span>
              </div>

              {selectedGraphNodeId === 'CASE' && (
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Case Reference:</strong> CASE-2026-001 (Suspected Vehicle Theft)</p>
                  <p><strong>Integrity Status:</strong> SHA-256 Master Verified across all 3 source NVR files.</p>
                  <p><strong>Incident Envelope:</strong> 10:14:00 - 10:19:30 UTC at Logistics Terminal Dock 4.</p>
                </div>
              )}

              {selectedGraphNodeId.startsWith('CAM-') && (
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Camera Entity:</strong> {selectedGraphNodeId}</p>
                  <p><strong>Sensor Specs:</strong> 1280x720 Progressive Scan @ 25 FPS, H.264 High Profile</p>
                  <p><strong>Forensic Stream Dump:</strong> Physical SATA Bit-Stream acquired with Tableau TD2u</p>
                </div>
              )}

              {selectedGraphNodeId.startsWith('TRACK-') && (
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Subject/Entity Track:</strong> {selectedGraphNodeId}</p>
                  <p><strong>Forensic Status:</strong> Keyframe identified with high detection confidence</p>
                  <p><strong>Physical Description:</strong> Dark outer jacket, dark trousers, lighter footwear, medium build</p>
                </div>
              )}

              {selectedGraphNodeId.startsWith('CORR-') && (
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Analytical Link:</strong> AI-Assisted Cross-Camera Temporal Plausibility</p>
                  <p><strong>Velocity Equation:</strong> Distance / Elapsed Seconds = Velocity in Range (0.8 - 1.4 m/s human walk)</p>
                  <p><strong>Forensic Caveat:</strong> Provided as investigative inference; human examiner sign-off required.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTEGRATED CHAIN OF CUSTODY */}
      {/* ========================================================================= */}
      {activeSubTab === 'chain-of-custody' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  Case-Wide Chain of Custody Audit Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable audit trail covering physical acquisition, cryptographic verification, and investigative analysis.
                </p>
              </div>

              <button
                onClick={() => setIsAddingCustody(true)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                + Append Examiner Note
              </button>
            </div>

            {/* Custody Form Modal / Drawer */}
            {isAddingCustody && (
              <div className="mb-4 p-4 rounded-lg bg-slate-950 border border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-200 uppercase font-mono">
                  Append New Chain of Custody Log Entry
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Action Performed</label>
                  <input
                    type="text"
                    value={newCustodyAction}
                    onChange={(e) => setNewCustodyAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200"
                    placeholder="e.g. Cross-Camera Clock Alignment Verification"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Notes / Observations</label>
                  <textarea
                    value={newCustodyNotes}
                    onChange={(e) => setNewCustodyNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200"
                    placeholder="Enter factual forensic verification details..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingCustody(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustodyEntry}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded"
                  >
                    Commit to Ledger
                  </button>
                </div>
              </div>
            )}

            {/* Custody Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase bg-slate-950/60">
                    <th className="p-3">Timestamp (UTC)</th>
                    <th className="p-3">Evidence ID</th>
                    <th className="p-3">Action / Phase</th>
                    <th className="p-3">Examiner / Actor</th>
                    <th className="p-3">System / Bridge</th>
                    <th className="p-3">Hash Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {bundle.custody.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-300 font-semibold">{entry.timestamp}</td>
                      <td className="p-3 text-emerald-400">{entry.evidenceId}</td>
                      <td className="p-3 text-slate-200">
                        <div>{entry.action}</div>
                        {entry.notes && (
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5 max-w-md">
                            {entry.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">{entry.actor}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{entry.system}</td>
                      <td className="p-3">
                        {entry.integrityVerified ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                            VERIFIED (0 DRIFT)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[10px]">
                            LOGGED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: UNIFIED FORENSIC FINDINGS & REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'findings-report' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-md max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  CENTRAL FORENSIC SCIENCE LABORATORY • DIGITAL EVIDENCE DIVISION
                </div>
                <h2 className="text-lg font-bold text-slate-100 mt-1">
                  Cross-Camera Incident Reconstruction Forensic Examination Report
                </h2>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Case ID: <strong>{bundle.case.id}</strong> • Date: <strong>2026-09-11</strong> • Examiner: <strong>{bundle.case.leadInvestigator}</strong>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Print / Export PDF
              </button>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-2 text-xs text-slate-300">
              <h4 className="font-bold text-slate-100 uppercase font-mono text-[11px] text-emerald-400">
                1. Executive Summary & Incident Overview
              </h4>
              <p className="leading-relaxed">
                A multi-camera temporal and spatial reconstruction was performed on digital CCTV surveillance recordings acquired from the Perimeter Sector 4 Logistics Terminal. Forensic examination of 3 synchronized streams establishes a continuous chronological progression beginning with an unauthorized turnstile perimeter entry at Camera 01 (10:14:32 UTC), proceeding via the 95-meter connecting concourse to the Loading Dock corridor captured on Camera 02 (10:16:08 UTC), resulting in a forced door access (10:17:15 UTC), and terminating with an egress in a dark sedan on Camera 03 (10:18:41 UTC).
              </p>
            </div>

            {/* Section 2: Observed Facts vs AI Correlations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 border border-emerald-800/40 rounded p-3.5 space-y-2">
                <div className="font-bold text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OBSERVED FORENSIC FACTS (CONFIRMED)
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  <li>Camera 01 recorded subject entry at turnstile at 10:14:32 UTC (Frame #112).</li>
                  <li>Camera 02 recorded secondary bay door forced breach at 10:17:15 UTC without badge swipe.</li>
                  <li>Camera 03 recorded dark sedan egress onto public road at 10:18:41 UTC (Frame #85).</li>
                  <li>All 3 raw video streams verified bit-stream identical (SHA-256 zero drift).</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-amber-800/40 rounded p-3.5 space-y-2">
                <div className="font-bold text-amber-400 font-mono text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-ASSISTED CORRELATIONS (INVESTIGATIVE)
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                  <li>Subject P-07 (Cam 01) and P-12 (Cam 02) correlated as likely same individual (87% confidence).</li>
                  <li>96s delta between Cam 01 and Cam 02 is velocity-plausible for a 95m walk (0.99 m/s).</li>
                  <li>Vehicle V-03 correlated with warehouse door egress based on 131s transit window.</li>
                  <li>Subject appearance matches dark jacket, dark trousers, and light footwear.</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Hash Evidence Ledger */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-100 uppercase font-mono text-[11px] text-emerald-400">
                2. Cryptographic Integrity & Evidence Ledger
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
                    <tr className="border-b border-slate-800">
                      <th className="p-2">Item</th>
                      <th className="p-2">Source</th>
                      <th className="p-2">SHA-256 Digest</th>
                      <th className="p-2">Integrity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bundle.evidence.map((ev) => (
                      <tr key={ev.id}>
                        <td className="p-2 text-emerald-400 font-bold">{ev.id}</td>
                        <td className="p-2 text-slate-300">{ev.filename}</td>
                        <td className="p-2 text-slate-400 break-all select-all">{ev.sha256}</td>
                        <td className="p-2 text-emerald-400 font-semibold">VERIFIED (0 DRIFT)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Section 63 BSA Declaration */}
            <div className="bg-slate-950 border border-slate-800 rounded p-4 text-[11px] text-slate-400 space-y-2 font-mono">
              <div className="text-slate-200 font-bold uppercase">
                BSA 2023 Section 63 Admissibility Compliance Declaration
              </div>
              <p className="leading-relaxed">
                "I hereby certify that the digital video recordings and timeline correlations referenced herein were acquired and processed non-destructively on dedicated forensic workstations using write-blocked hardware interfaces. SHA-256 cryptographic digests remained constant and verified at zero bit drift throughout acquisition and reconstruction."
              </p>
              <div className="pt-2 flex justify-between items-center text-slate-300">
                <span>Examiner: <strong>{bundle.case.leadInvestigator}</strong></span>
                <span>Signature: <strong className="text-emerald-400">[CRYPTOGRAPHICALLY SEALED]</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
