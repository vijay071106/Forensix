// CCTV FORENSIX — Domain Types & Forensic Data Models

export type ActiveTab =
  | 'overview'
  | 'incident-reconstruction'
  | 'cases'
  | 'acquisition'
  | 'fingerprint'
  | 'health'
  | 'metadata'
  | 'recovery'
  | 'advanced-recovery'
  | 'gaps'
  | 'timeline'
  | 'timestamps'
  | 'ai-search'
  | 'video-replay'
  | 'custody'
  | 'reports'
  | 'bsa-section63';

export interface SampleVideoMeta {
  id: string;
  camera: string;
  title: string;
  incident: string;
  timestamp: string;
  duration: string;
  durationSeconds: number;
  resolution: string;
  fps: number;
  codec: string;
  sha256: string;
  url: string;
  downloadUrl: string;
  isPrimaryDemo: boolean;
  matchedEventId?: string;
}

export type ForensicStatus =
  | 'verified'
  | 'review_required'
  | 'anomaly_detected'
  | 'in_progress'
  | 'unsupported'
  | 'healthy';

export interface CaseItem {
  id: string;
  name: string;
  evidenceCount: number;
  cameraCount: number;
  status: 'Analysis' | 'Verified' | 'Acquisition' | 'Closed';
  created: string;
  lastUpdated: string;
  leadInvestigator: string;
  location: string;
  description: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  filename: string;
  fileSize: number;
  fileSizeBytesFormatted: string;
  fileType: string;
  sourceType: string;
  sha256: string;
  legacyMd5?: string;
  acquisitionTimestamp: string;
  deviceId: string;
  status: 'Acquired' | 'Verified' | 'Analyzing' | 'Reported';
  readOnly: boolean;
  workingCopyCreated: boolean;
  healthScore: number;
}

export interface DeviceFingerprintData {
  manufacturer: string;
  deviceType: string;
  modelFamily: string;
  storageStructure: string;
  codec: string;
  channels: number;
  metadataStatus: 'Available' | 'Partial' | 'Missing';
  detectionConfidence: number;
  detectionMethods: {
    name: string;
    description: string;
    confidence: number;
    detected: boolean;
  }[];
  signatureHex: string;
  signatureDescription: string;
  vendorSignatureMatch: string;
  disclaimer: string;
}

export interface VideoMetadata {
  codec: string;
  profile: string;
  resolution: string;
  width: number;
  height: number;
  fps: number;
  duration: string;
  durationSeconds: number;
  frameCount: number;
  audioPresence: 'Present' | 'None' | 'Muted';
  audioCodec?: string;
  container: string;
  bitrate: string;
  colorSpace: string;
  pixelFormat: string;
  scanType: 'Progressive' | 'Interlaced';
  creationTime?: string;
  encoder?: string;
  ffprobeJsonRaw?: string;
}

export interface HealthCheckItem {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  severity: 'healthy' | 'warning' | 'critical';
  details: string;
}

export interface HealthAssessmentData {
  score: number;
  status: 'Healthy' | 'Degraded' | 'Critical';
  writeBlockStatus: 'Active (Hardware Blocked)' | 'Software Read-Only' | 'Disabled';
  workingCopyStatus: 'Verified (SHA-256 Match)' | 'Pending Verification' | 'Not Created';
  originalHashVerified: boolean;
  checks: HealthCheckItem[];
}

export interface RecordingSegment {
  id: string;
  camera: string;
  cameraId: string;
  startTime: string;
  endTime: string;
  startSeconds: number;
  endSeconds: number;
  duration: string;
  durationSeconds: number;
  status: 'Recovered' | 'Corrupted' | 'Candidate' | 'Fragmented' | 'Fragment Candidate';
  sizeBytes: number;
  codec: string;
  hasAudio: boolean;
}

export interface RecordingGap {
  id: string;
  camera: string;
  cameraId: string;
  gapStart: string;
  gapEnd: string;
  gapStartSeconds: number;
  gapEndSeconds: number;
  duration: string;
  durationSeconds: number;
  classification: 'REVIEW REQUIRED' | 'SUSPECTED LOSS' | 'SCHEDULED OFF';
  priorSegmentEnd: string;
  nextSegmentStart: string;
  possibleCauses: string[];
  forensicNote: string;
  investigatorNotes?: string;
}

export interface TimestampCheck {
  id: string;
  camera: string;
  frameIndex: number;
  recordedTimeStr: string;
  osdTimestamp: string;
  metadataTimestamp: string;
  filesystemTimestamp: string;
  maxDiffSeconds: number;
  status: string;
  severity: 'warning' | 'healthy' | 'critical' | 'info';
  explanation: string;
  offsetDetails: {
    osdVsMetadataDelta?: string;
    osdVsFilesystemDelta?: string;
    metadataVsFilesystemDelta?: string;
    osdVsMeta?: number;
    metaVsFs?: number;
    osdVsFs?: number;
  };
}

export interface TimestampComparisonItem extends TimestampCheck {}

export interface TimelineEvent {
  id: string;
  camera: string;
  cameraId: string;
  timestamp: string;
  timeSeconds: number;
  eventType: string;
  confidence: number;
  details: string;
  source: string;
  severity: 'normal' | 'warning' | 'anomaly' | 'alert' | 'info';
}

export interface AIDetectionEvent {
  id: string;
  camera: string;
  cameraId?: string;
  timestamp: string;
  timeSeconds: number;
  label: 'PERSON' | 'VEHICLE' | 'OBJECT' | 'MOVEMENT' | string;
  confidence: number;
  details: string;
  boundingBox: { x: number; y: number; width?: number; height?: number; w?: number; h?: number };
  thumbnailHint?: string;
}

export interface AIDetectionItem extends AIDetectionEvent {}

export interface ChainOfCustodyEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  system: string;
  evidenceId: string;
  hashReference: string;
  integrityVerified: boolean;
  notes: string;
}

export interface BSASection63Certificate {
  certificateId: string;
  caseId: string;
  caseName: string;
  evidenceId: string;
  examinerName: string;
  designation: string;
  forensicLab: string;
  deviceMakeModel: string;
  serialNumber: string;
  storageMedium: string;
  acquisitionDate: string;
  sha256Hash: string;
  legacyMd5Hash: string;
  operatingSystemTools: string;
  digitalRecordDescription: string;
  safekeepingConditions: string;
  integrityDeclaration: string;
  admissibilityDisclaimer: string;
}

export interface CameraModel {
  id: string;
  caseId: string;
  name: string;
  location: string;
  direction: string;
  videoSource: string;
  evidenceId: string;
  fps: number;
  resolution: string;
  nextHop?: string;
  distanceMeters?: number;
  nominalTransitSeconds?: number;
  orderIndex: number;
}

export interface IncidentEvent {
  id: string;
  caseId: string;
  cameraId: string;
  cameraName: string;
  evidenceId: string;
  timestamp: string;
  videoTimeSeconds: number;
  frameNumber: number;
  eventType: string;
  detectedObject: string;
  trackId: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  details: string;
  correlationConfidence?: number;
  correlationReasons?: string[];
  relatedEventIds?: string[];
  factType: 'OBSERVED FACT' | 'AI-ASSISTED INFERENCE';
}

export interface CrossCameraCorrelation {
  id: string;
  caseId: string;
  sourceCamera: string;
  targetCamera: string;
  sourceTrack: string;
  targetTrack: string;
  sourceEventId: string;
  targetEventId: string;
  timeDeltaSeconds: number;
  distanceMeters: number;
  temporalPlausibility: string;
  correlationScore: number;
  reasons: string[];
  analystStatus: string;
}

export interface IncidentReconstructionBundle {
  case: {
    id: string;
    name: string;
    status: string;
    created: string;
    lastUpdated: string;
    leadInvestigator: string;
    location: string;
    description: string;
    integrityStatus: string;
  };
  metrics: {
    camerasCount: number;
    evidenceCount: number;
    eventsCount: number;
    candidateSubjects: number;
    candidateVehicles: number;
    crossCameraLinks: number;
    integrityStatus: string;
  };
  cameras: CameraModel[];
  evidence: EvidenceItem[];
  events: IncidentEvent[];
  correlations: CrossCameraCorrelation[];
  custody: ChainOfCustodyEntry[];
}

export interface EvidenceGraphNode {
  id: string;
  type: 'case' | 'camera' | 'evidence' | 'subject' | 'vehicle' | 'correlation';
  label: string;
  location?: string;
  evidenceId?: string;
  sourceCamera?: string;
  time?: string;
  confidence?: number;
  status?: string;
}

export interface EvidenceGraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface EvidenceGraphData {
  nodes: EvidenceGraphNode[];
  links: EvidenceGraphLink[];
}

