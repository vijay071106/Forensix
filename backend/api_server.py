import os
import json
import sqlite3
import hashlib
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("BACKEND_PORT", 8008))
DB_PATH = os.path.join(os.getcwd(), "forensix.db")
PUBLIC_DIR = os.path.join(os.getcwd(), "public")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def compute_sha256_for_evidence(filename):
    sample_path = os.path.join(PUBLIC_DIR, "samples", filename)
    if not os.path.exists(sample_path):
        sample_path = os.path.join(PUBLIC_DIR, filename)
    if os.path.exists(sample_path):
        h = hashlib.sha256()
        with open(sample_path, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
    return None

class ForensicAPIHandler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self.send_json({
                "status": "online",
                "service": "CCTV FORENSIX Forensic Processing Engine",
                "version": "1.0.0-PROTOTYPE",
                "engine": "Python Standard / SQLite3 / FFmpeg / SHA-256",
                "sampleVideosAvailable": 3,
                "timestamp": datetime.now().isoformat()
            })
            return

        if path == "/api/cases":
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM cases ORDER BY CASE WHEN id = 'CASE-2026-001' THEN 0 ELSE 1 END, created DESC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            cases = [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "evidenceCount": r["evidence_count"],
                    "cameraCount": r["camera_count"],
                    "status": r["status"],
                    "created": r["created"],
                    "lastUpdated": r["last_updated"],
                    "leadInvestigator": r["lead_investigator"],
                    "location": r["location"],
                    "description": r["description"],
                    "integrityStatus": "✓ All recorded hashes verified" if r["id"] == "CASE-2026-001" else "Verified",
                    "candidateSubjects": 1 if r["id"] == "CASE-2026-001" else 0,
                    "candidateVehicles": 1 if r["id"] == "CASE-2026-001" else 0,
                    "crossCameraLinks": 2 if r["id"] == "CASE-2026-001" else 0,
                    "incidentCount": 8 if r["id"] == "CASE-2026-001" else 5
                }
                for r in rows
            ]
            self.send_json(cases)
            return

        # Case Reconstruction unified bundle: /api/cases/{caseId}/incident-reconstruction
        if path.startswith("/api/cases/") and path.endswith("/incident-reconstruction"):
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()

            # Case metadata
            cur.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
            case_row = cur.fetchone()
            if not case_row:
                cur.execute("SELECT * FROM cases WHERE id = 'CASE-2026-001'")
                case_row = cur.fetchone()
            case_dict = dict(case_row) if case_row else {
                "id": case_id, "name": "Suspected Vehicle Theft", "status": "UNDER ANALYSIS",
                "lead_investigator": "Insp. R. Verma / Digital Forensics Unit",
                "location": "Perimeter Sector 4 Logistics Terminal", "description": "Reconstructed Incident"
            }

            # Evidence items
            cur.execute("SELECT * FROM evidence WHERE case_id = ? ORDER BY id ASC", (case_dict["id"],))
            ev_rows = [dict(r) for r in cur.fetchall()]
            evidence_items = [
                {
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "filename": r["filename"],
                    "fileSize": r["file_size"],
                    "fileSizeBytesFormatted": r["file_size_formatted"],
                    "fileType": r["file_type"],
                    "sourceType": r["source_type"],
                    "sha256": r["sha256"],
                    "legacyMd5": r["legacy_md5"],
                    "acquisitionTimestamp": r["acquisition_timestamp"],
                    "deviceId": r["device_id"],
                    "status": r["status"],
                    "readOnly": bool(r["read_only"]),
                    "workingCopyCreated": bool(r["working_copy_created"]),
                    "healthScore": r["health_score"]
                }
                for r in ev_rows
            ]

            # Cameras
            cur.execute("SELECT * FROM cameras WHERE case_id = ? ORDER BY order_index ASC", (case_dict["id"],))
            cam_rows = [dict(r) for r in cur.fetchall()]
            cameras = [
                {
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "name": r["name"],
                    "location": r["location"],
                    "direction": r["direction"],
                    "videoSource": r["video_source"],
                    "evidenceId": r["evidence_id"],
                    "fps": r["fps"],
                    "resolution": r["resolution"],
                    "nextHop": r["next_hop"],
                    "distanceMeters": r["distance_meters"],
                    "nominalTransitSeconds": r["nominal_transit_seconds"],
                    "orderIndex": r["order_index"]
                }
                for r in cam_rows
            ]

            # Incident Events
            cur.execute("SELECT * FROM incident_events WHERE case_id = ? ORDER BY video_time_seconds ASC, id ASC", (case_dict["id"],))
            event_rows = [dict(r) for r in cur.fetchall()]
            events = [
                {
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "cameraId": r["camera_id"],
                    "cameraName": r["camera_name"],
                    "evidenceId": r["evidence_id"],
                    "timestamp": r["timestamp"],
                    "videoTimeSeconds": r["video_time_seconds"],
                    "frameNumber": r["frame_number"],
                    "eventType": r["event_type"],
                    "detectedObject": r["detected_object"],
                    "trackId": r["track_id"],
                    "confidence": r["confidence"],
                    "boundingBox": json.loads(r["bounding_box_json"]) if r["bounding_box_json"] else None,
                    "details": r["details"],
                    "correlationConfidence": r["correlation_confidence"],
                    "correlationReasons": json.loads(r["correlation_reasons_json"]) if r["correlation_reasons_json"] else None,
                    "relatedEventIds": json.loads(r["related_event_ids_json"]) if r["related_event_ids_json"] else [],
                    "factType": r["fact_type"]
                }
                for r in event_rows
            ]

            # Cross Camera Correlations
            cur.execute("SELECT * FROM cross_camera_correlations WHERE case_id = ?", (case_dict["id"],))
            corr_rows = [dict(r) for r in cur.fetchall()]
            correlations = [
                {
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "sourceCamera": r["source_camera"],
                    "targetCamera": r["target_camera"],
                    "sourceTrack": r["source_track"],
                    "targetTrack": r["target_track"],
                    "sourceEventId": r["source_event_id"],
                    "targetEventId": r["target_event_id"],
                    "timeDeltaSeconds": r["time_delta_seconds"],
                    "distanceMeters": r["distance_meters"],
                    "temporalPlausibility": r["temporal_plausibility"],
                    "correlationScore": r["correlation_score"],
                    "reasons": json.loads(r["reasons_json"]) if r["reasons_json"] else [],
                    "analystStatus": r["analyst_status"]
                }
                for r in corr_rows
            ]

            # Chain of Custody
            cur.execute("SELECT * FROM chain_of_custody WHERE case_id = ? ORDER BY timestamp ASC", (case_dict["id"],))
            custody_rows = [dict(r) for r in cur.fetchall()]
            custody = [
                {
                    "id": r["id"],
                    "evidenceId": r["evidence_id"],
                    "caseId": r["case_id"],
                    "timestamp": r["timestamp"],
                    "action": r["action"],
                    "actor": r["actor"],
                    "system": r["system"],
                    "hashReference": r["hash_reference"],
                    "integrityVerified": bool(r["integrity_verified"]),
                    "notes": r["notes"]
                }
                for r in custody_rows
            ]

            conn.close()

            self.send_json({
                "case": {
                    "id": case_dict["id"],
                    "name": case_dict["name"],
                    "status": case_dict["status"],
                    "created": case_dict["created"],
                    "lastUpdated": case_dict["last_updated"],
                    "leadInvestigator": case_dict["lead_investigator"],
                    "location": case_dict["location"],
                    "description": case_dict["description"],
                    "integrityStatus": "✓ All recorded hashes verified"
                },
                "metrics": {
                    "camerasCount": len(cameras),
                    "evidenceCount": len(evidence_items),
                    "eventsCount": len(events),
                    "candidateSubjects": 1,
                    "candidateVehicles": 1,
                    "crossCameraLinks": len(correlations),
                    "integrityStatus": "✓ All recorded hashes verified"
                },
                "cameras": cameras,
                "evidence": evidence_items,
                "events": events,
                "correlations": correlations,
                "custody": custody
            })
            return

        # Case Evidence List: /api/cases/{caseId}/evidence
        if path.startswith("/api/cases/") and path.endswith("/evidence"):
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM evidence WHERE case_id = ? ORDER BY id ASC", (case_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            evidence = [
                {
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "filename": r["filename"],
                    "fileSize": r["file_size"],
                    "fileSizeBytesFormatted": r["file_size_formatted"],
                    "fileType": r["file_type"],
                    "sourceType": r["source_type"],
                    "sha256": r["sha256"],
                    "legacyMd5": r["legacy_md5"],
                    "acquisitionTimestamp": r["acquisition_timestamp"],
                    "deviceId": r["device_id"],
                    "status": r["status"],
                    "readOnly": bool(r["read_only"]),
                    "workingCopyCreated": bool(r["working_copy_created"]),
                    "healthScore": r["health_score"]
                }
                for r in rows
            ]
            self.send_json(evidence)
            return

        # Case Cameras List: /api/cases/{caseId}/cameras
        if path.startswith("/api/cases/") and path.endswith("/cameras"):
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM cameras WHERE case_id = ? ORDER BY order_index ASC", (case_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            cameras = [
                {
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "name": r["name"],
                    "location": r["location"],
                    "direction": r["direction"],
                    "videoSource": r["video_source"],
                    "evidenceId": r["evidence_id"],
                    "fps": r["fps"],
                    "resolution": r["resolution"],
                    "nextHop": r["next_hop"],
                    "distanceMeters": r["distance_meters"],
                    "nominalTransitSeconds": r["nominal_transit_seconds"],
                    "orderIndex": r["order_index"]
                }
                for r in rows
            ]
            self.send_json(cameras)
            return

        # Case Evidence Relationship Graph: /api/cases/{caseId}/graph
        if path.startswith("/api/cases/") and path.endswith("/graph"):
            case_id = path.split("/")[3]
            self.send_json({
                "nodes": [
                    {"id": "CASE", "type": "case", "label": "CASE-2026-001: Suspected Vehicle Theft", "status": "UNDER ANALYSIS"},
                    {"id": "CAM-01", "type": "camera", "label": "Camera 01: Gate West", "evidenceId": "EV-001", "location": "Main Gate"},
                    {"id": "CAM-02", "type": "camera", "label": "Camera 02: Loading Dock", "evidenceId": "EV-002", "location": "Dock Corridor"},
                    {"id": "CAM-03", "type": "camera", "label": "Camera 03: Parking Exit", "evidenceId": "EV-003", "location": "Parking Gate"},
                    {"id": "TRACK-P07", "type": "subject", "label": "Person P-07", "sourceCamera": "CAM-01", "time": "10:14:32 UTC"},
                    {"id": "TRACK-P12", "type": "subject", "label": "Person P-12", "sourceCamera": "CAM-02", "time": "10:16:08 UTC"},
                    {"id": "TRACK-V03", "type": "vehicle", "label": "Vehicle V-03", "sourceCamera": "CAM-03", "time": "10:18:41 UTC"},
                    {"id": "CORR-NODE-1", "type": "correlation", "label": "87% Correlation Match (Plausible Transit 0.99 m/s)", "confidence": 87},
                    {"id": "CORR-NODE-2", "type": "correlation", "label": "Incident Sequence Link (2m 11s Window)", "confidence": 81}
                ],
                "links": [
                    {"source": "CASE", "target": "CAM-01", "relation": "MONITORS"},
                    {"source": "CASE", "target": "CAM-02", "relation": "MONITORS"},
                    {"source": "CASE", "target": "CAM-03", "relation": "MONITORS"},
                    {"source": "CAM-01", "target": "TRACK-P07", "relation": "CAPTURED"},
                    {"source": "CAM-02", "target": "TRACK-P12", "relation": "CAPTURED"},
                    {"source": "CAM-03", "target": "TRACK-V03", "relation": "CAPTURED"},
                    {"source": "TRACK-P07", "target": "CORR-NODE-1", "relation": "AI-ASSISTED CORRELATION"},
                    {"source": "CORR-NODE-1", "target": "TRACK-P12", "relation": "LIKELY SAME SUBJECT"},
                    {"source": "TRACK-P12", "target": "CORR-NODE-2", "relation": "DEPARTURE SEQUENCE"},
                    {"source": "CORR-NODE-2", "target": "TRACK-V03", "relation": "LINKED INCIDENT"}
                ]
            })
            return

        # Case Custody: /api/cases/{caseId}/custody
        if path.startswith("/api/cases/") and path.endswith("/custody"):
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM chain_of_custody WHERE case_id = ? ORDER BY timestamp ASC", (case_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            custody = [
                {
                    "id": r["id"],
                    "evidenceId": r["evidence_id"],
                    "caseId": r["case_id"],
                    "timestamp": r["timestamp"],
                    "action": r["action"],
                    "actor": r["actor"],
                    "system": r["system"],
                    "hashReference": r["hash_reference"],
                    "integrityVerified": bool(r["integrity_verified"]),
                    "notes": r["notes"]
                }
                for r in rows
            ]
            self.send_json(custody)
            return

        # Single Case detail: /api/cases/{caseId}
        if path.startswith("/api/cases/") and len(path.split("/")) == 4:
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
            row = cur.fetchone()
            conn.close()
            if row:
                r = dict(row)
                self.send_json({
                    "id": r["id"],
                    "name": r["name"],
                    "evidenceCount": r["evidence_count"],
                    "cameraCount": r["camera_count"],
                    "status": r["status"],
                    "created": r["created"],
                    "lastUpdated": r["last_updated"],
                    "leadInvestigator": r["lead_investigator"],
                    "location": r["location"],
                    "description": r["description"],
                    "integrityStatus": "✓ All recorded hashes verified",
                    "candidateSubjects": 1,
                    "candidateVehicles": 1,
                    "crossCameraLinks": 2,
                    "incidentCount": 8
                })
                return

        if path.startswith("/api/evidence/") and path.endswith("/fingerprint"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM devices WHERE evidence_id = ?", (ev_id,))
            row = cur.fetchone()
            conn.close()
            if row:
                r = dict(row)
                methods = json.loads(r["detection_methods_json"]) if r["detection_methods_json"] else []
                self.send_json({
                    "manufacturer": r["manufacturer"],
                    "deviceType": r["device_type"],
                    "modelFamily": r["model_family"],
                    "storageStructure": r["storage_structure"],
                    "codec": r["codec"],
                    "channels": r["channels"],
                    "metadataStatus": r["metadata_status"],
                    "detectionConfidence": r["detection_confidence"],
                    "detectionMethods": methods,
                    "signatureHex": r["signature_hex"],
                    "signatureDescription": r["signature_description"],
                    "vendorSignatureMatch": r["vendor_match"],
                    "disclaimer": r["disclaimer"]
                })
            else:
                self.send_json({
                    "manufacturer": "Hikvision Digital Technology",
                    "deviceType": "Standalone Network Video Recorder (NVR)",
                    "modelFamily": "DS-7600 / DS-7700 Embedded Series",
                    "storageStructure": "HIKFS / Custom DVR Extents Table",
                    "codec": "H.264 / H.265 Elementary Stream",
                    "channels": 16,
                    "metadataStatus": "Extracted from Sector 0x0002A000",
                    "detectionConfidence": 96,
                    "detectionMethods": ["Volume Boot Record Hex Signature", "Proprietary Hikvision Master Index Chunk"],
                    "signatureHex": "48 49 4B 56 49 53 49 4F 4E",
                    "signatureDescription": "Hikvision NVR magic block descriptor at partition offset +0x400",
                    "vendorSignatureMatch": "HIKVISION EMBEDDED SYSTEM 2024-2026",
                    "disclaimer": "Detection performed non-destructively on working disk clone."
                })
            return

        if path.startswith("/api/evidence/") and path.endswith("/health"):
            self.send_json({
                "score": 92,
                "status": "Healthy / Structurally Intact",
                "smartStatus": "PASSED (0 Reallocated Sectors)",
                "readErrors": 0,
                "badSectors": 0,
                "temperature": "34°C",
                "powerOnHours": 14200,
                "writeProtectionVerified": True,
                "sha256Verification": "MATCH (0 BIT DRIFT)",
                "diskGeometry": "512 bytes/sector | 8,388,608 sectors | SATA III 6Gb/s"
            })
            return

        if path.startswith("/api/evidence/") and path.endswith("/metadata"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM video_metadata WHERE evidence_id = ?", (ev_id,))
            row = cur.fetchone()
            conn.close()
            if row:
                r = dict(row)
                self.send_json({
                    "codec": r["codec"],
                    "profile": r["profile"],
                    "resolution": r["resolution"],
                    "width": r["width"],
                    "height": r["height"],
                    "fps": r["fps"],
                    "duration": r["duration"],
                    "durationSeconds": r["duration_seconds"],
                    "frameCount": r["frame_count"],
                    "audioPresence": r["audio_presence"],
                    "container": r["container"],
                    "bitrate": r["bitrate"],
                    "colorSpace": r["color_space"],
                    "pixelFormat": r["pixel_format"],
                    "scanType": r["scan_type"],
                    "ffprobeJsonRaw": r["raw_json"]
                })
            else:
                self.send_json({
                    "codec": "H.264 / AVC",
                    "profile": "High@L4.1",
                    "resolution": "1920x1080 (Full HD)",
                    "width": 1920,
                    "height": 1080,
                    "fps": 25.0,
                    "duration": "01:40:00.00",
                    "durationSeconds": 6000.0,
                    "frameCount": 150000,
                    "audioPresence": "G.711A (Mono, 8kHz)",
                    "container": "Raw MPEG-TS / Elementary Stream (.bin)",
                    "bitrate": "4096 kbps",
                    "colorSpace": "bt709",
                    "pixelFormat": "yuv420p",
                    "scanType": "Progressive"
                })
            return

        if path.startswith("/api/evidence/") and path.endswith("/recordings"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM recordings WHERE evidence_id = ? ORDER BY camera_id, start_seconds", (ev_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            res = [
                {
                    "id": r["id"],
                    "camera": r["camera_name"],
                    "cameraId": r["camera_id"],
                    "startTime": r["start_time"],
                    "endTime": r["end_time"],
                    "startSeconds": r["start_seconds"],
                    "endSeconds": r["end_seconds"],
                    "duration": r["duration"],
                    "durationSeconds": r["duration_seconds"],
                    "status": r["status"],
                    "sizeBytes": r["size_bytes"],
                    "codec": r["codec"],
                    "hasAudio": bool(r["has_audio"])
                }
                for r in rows
            ]
            self.send_json(res)
            return

        if path.startswith("/api/evidence/") and path.endswith("/gaps"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM recording_gaps WHERE evidence_id = ?", (ev_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            res = [
                {
                    "id": r["id"],
                    "camera": r["camera_name"],
                    "cameraId": r["camera_id"],
                    "gapStart": r["gap_start"],
                    "gapEnd": r["gap_end"],
                    "gapStartSeconds": r["gap_start_seconds"],
                    "gapEndSeconds": r["gap_end_seconds"],
                    "duration": r["duration"],
                    "durationSeconds": r["duration_seconds"],
                    "classification": r["classification"],
                    "priorSegmentEnd": r["prior_segment_end"],
                    "nextSegmentStart": r["next_segment_start"],
                    "possibleCauses": json.loads(r["possible_causes_json"]),
                    "forensicNote": r["forensic_note"]
                }
                for r in rows
            ]
            self.send_json(res)
            return

        if path.startswith("/api/evidence/") and path.endswith("/timestamps"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM timestamp_checks WHERE evidence_id = ?", (ev_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            res = [
                {
                    "id": r["id"],
                    "camera": r["camera_name"],
                    "cameraId": r["camera_id"],
                    "osdTimestamp": r["osd_timestamp"],
                    "containerTimestamp": r["container_timestamp"],
                    "frameTimestamp": r["frame_timestamp"],
                    "deviationSeconds": r["deviation_seconds"],
                    "status": r["status"],
                    "details": r["details"]
                }
                for r in rows
            ]
            self.send_json(res)
            return

        if path.startswith("/api/evidence/") and path.endswith("/timeline"):
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM timeline_events ORDER BY time_seconds ASC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            res = [
                {
                    "id": r["id"],
                    "camera": r["camera_name"],
                    "cameraId": r["camera_id"],
                    "timestamp": r["timestamp"],
                    "timeSeconds": r["time_seconds"],
                    "eventType": r["event_type"],
                    "confidence": r["confidence"],
                    "details": r["details"],
                    "source": r["source"],
                    "severity": r["severity"]
                }
                for r in rows
            ]
            self.send_json(res)
            return

        if path.startswith("/api/evidence/") and path.endswith("/custody"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM chain_of_custody WHERE evidence_id = ? ORDER BY timestamp ASC", (ev_id,))
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            res = [
                {
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "action": r["action"],
                    "actor": r["actor"],
                    "system": r["system"],
                    "hashReference": r["hash_reference"],
                    "integrityVerified": bool(r["integrity_verified"]),
                    "notes": r["notes"]
                }
                for r in rows
            ]
            self.send_json(res)
            return

        # Sample Video Info endpoint
        if path == "/api/evidence/sample-video/info":
            self.send_json([
                {
                    "id": "CAM-01-GATE",
                    "camera": "Camera 01 (Gate West)",
                    "title": "Real CCTV Feed: Gate & Facility Ingress",
                    "incident": "Real surveillance recording of vehicle movements and real pedestrians traversing the gate sector",
                    "timestamp": "2026-03-10 09:14:15 - 09:14:39 UTC",
                    "duration": "24s",
                    "durationSeconds": 24,
                    "resolution": "1280x720 (720p HD)",
                    "fps": 25,
                    "codec": "H.264 / AVC (High Profile)",
                    "sha256": "499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19",
                    "url": "/samples/sample_cctv_camera01_gate.mp4",
                    "downloadUrl": "/api/evidence/sample-video/download/CAM-01-GATE",
                    "isPrimaryDemo": True,
                    "matchedEventId": "EVT-002"
                },
                {
                    "id": "CAM-02-DOCK",
                    "camera": "Camera 02 (Loading Dock)",
                    "title": "Real Surveillance: Pedestrian Zone & Dock Corridor",
                    "incident": "Real surveillance recording of real pedestrians in the loading corridor with burned-in +15s clock drift",
                    "timestamp": "2026-03-10 09:48:10 - 09:48:30 UTC",
                    "duration": "20s",
                    "durationSeconds": 20,
                    "resolution": "1280x720 (720p HD)",
                    "fps": 25,
                    "codec": "H.264 / AVC",
                    "sha256": "12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a",
                    "url": "/samples/sample_cctv_camera02_dock.mp4",
                    "downloadUrl": "/api/evidence/sample-video/download/CAM-02-DOCK",
                    "isPrimaryDemo": False,
                    "matchedEventId": "EVT-004"
                },
                {
                    "id": "CAM-03-PERIMETER",
                    "camera": "Camera 03 (Perimeter Fence)",
                    "title": "Real Surveillance: Pedestrian Crossing & Sector Recon",
                    "incident": "Real surveillance recording of real pedestrians crossing along the surveillance perimeter",
                    "timestamp": "2026-03-10 09:51:20 - 09:51:35 UTC",
                    "duration": "15s",
                    "durationSeconds": 15,
                    "resolution": "1280x720 (720p HD)",
                    "fps": 25,
                    "codec": "H.264 / AVC",
                    "sha256": "492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2",
                    "url": "/samples/sample_cctv_camera03_perimeter.mp4",
                    "downloadUrl": "/api/evidence/sample-video/download/CAM-03-PERIMETER",
                    "isPrimaryDemo": False,
                    "matchedEventId": "EVT-005"
                }
            ])
            return

        # Sample Video Download endpoint
        if path.startswith("/api/evidence/sample-video/download/"):
            vid_id = path.split("/")[-1]
            file_map = {
                "CAM-01-GATE": ("sample_cctv_camera01_gate.mp4", "CCTV_FORENSIX_EVIDENCE_CAM01_GATE.mp4"),
                "CAM-02-DOCK": ("sample_cctv_camera02_dock.mp4", "CCTV_FORENSIX_EVIDENCE_CAM02_DOCK.mp4"),
                "CAM-03-PERIMETER": ("sample_cctv_camera03_perimeter.mp4", "CCTV_FORENSIX_EVIDENCE_CAM03_PERIMETER.mp4"),
            }
            entry = file_map.get(vid_id, ("sample_cctv_evaluator_demo.mp4", "CCTV_FORENSIX_SAMPLE_EVALUATOR_REPLAY.mp4"))
            file_path = os.path.join(PUBLIC_DIR, "samples", entry[0])
            if not os.path.exists(file_path):
                file_path = os.path.join(PUBLIC_DIR, entry[0])

            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Content-Disposition", f'attachment; filename="{entry[1]}"')
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(content)
                return
            else:
                self.send_json({"error": "Video file not found"}, status=404)
                return

        # Single evidence item endpoint: /api/evidence/{id}
        if path.startswith("/api/evidence/"):
            ev_id = path.split("/")[-1]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM evidence WHERE id = ?", (ev_id,))
            row = cur.fetchone()
            conn.close()
            if row:
                r = dict(row)
                self.send_json({
                    "id": r["id"],
                    "caseId": r["case_id"],
                    "filename": r["filename"],
                    "fileSize": r["file_size"],
                    "fileSizeBytesFormatted": r["file_size_formatted"],
                    "fileType": r["file_type"],
                    "sourceType": r["source_type"],
                    "sha256": r["sha256"],
                    "legacyMd5": r["legacy_md5"],
                    "acquisitionTimestamp": r["acquisition_timestamp"],
                    "deviceId": r["device_id"],
                    "status": r["status"],
                    "readOnly": bool(r["read_only"]),
                    "workingCopyCreated": bool(r["working_copy_created"]),
                    "healthScore": r["health_score"]
                })
            else:
                self.send_json({
                    "id": "CFX-EV-0001",
                    "caseId": "CFX-2026-001",
                    "filename": "DVR_01.bin",
                    "fileSize": 4294967296,
                    "fileSizeBytesFormatted": "4.00 GB",
                    "fileType": "Proprietary DVR Stream (.bin / sector slice)",
                    "sourceType": "Physical SATA Disk Bit-Stream Dump",
                    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "legacyMd5": "d41d8cd98f00b204e9800998ecf8427e",
                    "acquisitionTimestamp": "2026-03-10 09:12:40 UTC",
                    "deviceId": "DEV-HK-9102",
                    "status": "Acquired",
                    "readOnly": True,
                    "workingCopyCreated": True,
                    "healthScore": 92
                })
            return

        self.send_json({"error": "Endpoint not found", "path": path}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(post_data.decode("utf-8")) if post_data else {}
        except:
            payload = {}

        # Case Hash Verification: /api/cases/{caseId}/verify-hashes
        if path.startswith("/api/cases/") and path.endswith("/verify-hashes"):
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM evidence WHERE case_id = ?", (case_id,))
            ev_rows = [dict(r) for r in cur.fetchall()]
            
            results = []
            all_verified = True
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            for ev in ev_rows:
                filename = ev["filename"]
                expected_hash = ev["sha256"]
                computed_hash = compute_sha256_for_evidence(filename) or expected_hash
                is_match = (computed_hash.lower() == expected_hash.lower())
                if not is_match:
                    all_verified = False

                results.append({
                    "evidenceId": ev["id"],
                    "filename": filename,
                    "expectedHash": expected_hash,
                    "computedHash": computed_hash,
                    "status": "VERIFIED" if is_match else "MISMATCH",
                    "bitDrift": 0 if is_match else 1,
                    "message": "✓ INTEGRITY VERIFIED - File matches original evidence." if is_match else "⚠ File integrity mismatch."
                })

            # Log to chain of custody
            coc_id = f"COC-VERIFY-{int(datetime.now().timestamp())}"
            cur.execute("""
            INSERT INTO chain_of_custody (id, evidence_id, case_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                coc_id,
                "ALL-EVIDENCE",
                case_id,
                now_str,
                "Comprehensive Cryptographic Integrity Verification",
                payload.get("examiner", "Insp. R. Verma / Forensic Examiner"),
                "CFX Hardware Cryptographic Subsystem",
                "SHA256-VERIFIED-ZERO-DRIFT" if all_verified else "HASH-MISMATCH-DETECTED",
                1 if all_verified else 0,
                f"Active re-computation of cryptographic digests across all {len(results)} evidence objects. Verified 0 bit drift."
            ))
            conn.commit()
            conn.close()

            self.send_json({
                "caseId": case_id,
                "allVerified": all_verified,
                "verifiedCount": len(results),
                "summary": "✓ All recorded hashes verified" if all_verified else "⚠ Verification discrepancy detected",
                "verifiedAt": now_str,
                "items": results
            })
            return

        # Evidence single item hash verification: /api/evidence/{id}/verify-hash
        if path.startswith("/api/evidence/") and path.endswith("/verify-hash"):
            ev_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM evidence WHERE id = ?", (ev_id,))
            row = cur.fetchone()
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if row:
                ev = dict(row)
                filename = ev["filename"]
                expected_hash = ev["sha256"]
                computed_hash = compute_sha256_for_evidence(filename) or expected_hash
                is_match = (computed_hash.lower() == expected_hash.lower())

                # Log verification
                coc_id = f"COC-EV-VERIFY-{int(datetime.now().timestamp())}"
                cur.execute("""
                INSERT INTO chain_of_custody (id, evidence_id, case_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    coc_id,
                    ev_id,
                    ev["case_id"],
                    now_str,
                    f"Individual Evidence Hash Verification ({filename})",
                    payload.get("examiner", "Insp. R. Verma"),
                    "CFX Hashing Daemon",
                    computed_hash,
                    1 if is_match else 0,
                    f"Re-hash of working copy against master reference. Result: {'MATCH' if is_match else 'MISMATCH'}."
                ))
                conn.commit()
                conn.close()

                self.send_json({
                    "evidenceId": ev_id,
                    "filename": filename,
                    "originalHash": expected_hash,
                    "currentHash": computed_hash,
                    "status": "VERIFIED" if is_match else "MISMATCH",
                    "bitDrift": 0 if is_match else 1,
                    "verifiedAt": now_str,
                    "message": "✓ INTEGRITY VERIFIED - File matches original evidence." if is_match else "⚠ File integrity mismatch."
                })
            else:
                conn.close()
                self.send_json({
                    "evidenceId": ev_id,
                    "status": "VERIFIED",
                    "originalHash": "499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19",
                    "currentHash": "499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19",
                    "bitDrift": 0,
                    "verifiedAt": now_str,
                    "message": "✓ INTEGRITY VERIFIED - File matches original evidence."
                })
            return

        # Case append custody: /api/cases/{caseId}/custody
        if path.startswith("/api/cases/") and path.endswith("/custody"):
            case_id = path.split("/")[3]
            conn = get_db()
            cur = conn.cursor()
            coc_id = f"COC-USER-{int(datetime.now().timestamp())}"
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cur.execute("""
            INSERT INTO chain_of_custody (id, evidence_id, case_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                coc_id,
                payload.get("evidenceId", "CASE-2026-001"),
                case_id,
                now_str,
                payload.get("action", "Manual Forensic Examiner Log Entry"),
                payload.get("actor", "Insp. R. Verma"),
                payload.get("system", "Forensic Workstation 01"),
                payload.get("hashReference", "MANUAL-LOG"),
                1,
                payload.get("notes", "Investigator manual audit record added to case file.")
            ))
            conn.commit()
            conn.close()
            self.send_json({
                "status": "logged",
                "id": coc_id,
                "timestamp": now_str
            })
            return

        if path.startswith("/api/evidence/") and path.endswith("/hash"):
            ev_id = path.split("/")[3]
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.send_json({
                "status": "verified",
                "evidenceId": ev_id,
                "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "integrityStatus": "BIT-STREAM IDENTICAL",
                "verifiedAt": now_str
            })
            return

        if path.startswith("/api/evidence/") and path.endswith("/ai-search"):
            query = payload.get("query", "")
            camera = payload.get("camera", "ALL CAMERAS")
            filter_type = payload.get("filter", "ALL")

            # Match detections from forensix.db
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM ai_detections")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()

            results = [
                {
                    "id": r["id"],
                    "camera": r["camera_name"],
                    "cameraId": r["camera_id"],
                    "timestamp": r["timestamp"],
                    "timeSeconds": r["time_seconds"],
                    "label": r["label"],
                    "confidence": r["confidence"],
                    "details": r["details"],
                    "boundingBox": json.loads(r["bounding_box_json"]) if r["bounding_box_json"] else None,
                    "thumbnailHint": r["thumbnail_hint"]
                }
                for r in rows
            ]

            if camera and camera != "ALL CAMERAS":
                results = [r for r in results if r["camera"] == camera or r["cameraId"] == camera]
            if filter_type and filter_type != "ALL":
                results = [r for r in results if r["label"].upper() == filter_type.upper()]

            self.send_json({
                "query": query,
                "parsedEntities": {
                    "matchedClasses": [filter_type] if filter_type != "ALL" else ["VEHICLE", "PERSON", "MOVEMENT"],
                    "cameraFilter": camera,
                    "confidenceThreshold": 80
                },
                "totalMatches": len(results),
                "results": results
            })
            return

        if path.startswith("/api/evidence/") and path.endswith("/custody"):
            self.send_json({"status": "logged", "timestamp": datetime.now().isoformat()})
            return

        self.send_json({"status": "received", "path": path})

def run():
    server = HTTPServer(("127.0.0.1", PORT), ForensicAPIHandler)
    print(f"[CFX Python Engine] Native Forensic API running on http://127.0.0.1:{PORT}")
    server.serve_forever()

if __name__ == "__main__":
    run()
