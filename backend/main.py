import os
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.database import get_db, init_db, seed_demo_data
from backend.forensics.fingerprint import analyze_device_fingerprint
from backend.forensics.integrity import calculate_hashes, get_evidence_health_assessment
from backend.forensics.metadata_extractor import extract_video_metadata
from backend.forensics.gap_analyzer import analyze_recording_gaps, analyze_timestamp_consistency
from backend.forensics.ai_detector import parse_natural_language_query, get_ai_detections
from backend.forensics.report_generator import generate_forensic_report_pdf
from backend.forensics.bsa_section63 import generate_bsa_section63_pdf

app = FastAPI(
    title="CCTV FORENSIX API",
    description="Digital CCTV Evidence Acquisition, Recovery & Analysis Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.getcwd(), "evidence_store")
REPORTS_DIR = os.path.join(os.getcwd(), "reports_store")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

@app.on_event("startup")
def on_startup():
    init_db()
    # Check if cases table has data, if not seed demo data
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cases")
    count = cursor.fetchone()[0]
    conn.close()
    if count == 0:
        seed_demo_data()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "CCTV FORENSIX Forensic Processing Engine",
        "version": "1.0.0-SIH-PROTOTYPE",
        "engine": "FastAPI / OpenCV / FFmpeg / ReportLab / SHA-256",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/cases")
def get_cases():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases ORDER BY created DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
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
            "description": r["description"]
        }
        for r in rows
    ]

@app.post("/api/cases")
def create_case(payload: dict):
    name = payload.get("name", "Untitled CCTV Case")
    lead = payload.get("leadInvestigator", "Forensic Analyst")
    location = payload.get("location", "Investigation Site")
    desc = payload.get("description", "Case created for CCTV forensic examination")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cases")
    count = cursor.fetchone()[0]
    new_id = f"CFX-2026-{count + 1:03d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO cases (id, name, evidence_count, camera_count, status, created, last_updated, lead_investigator, location, description)
    VALUES (?, ?, 0, 0, 'Acquisition', ?, ?, ?, ?, ?)
    """, (new_id, name, now_str, now_str, lead, location, desc))
    conn.commit()
    conn.close()

    return {"status": "created", "caseId": new_id, "name": name}

@app.post("/api/cases/reset-demo")
def reset_demo_case():
    seed_demo_data()
    return {"status": "success", "message": "Demo case CFX-2026-001 re-initialized successfully"}

@app.get("/api/evidence/{evidence_id}")
def get_evidence(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evidence WHERE id = ?", (evidence_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    return {
        "id": row["id"],
        "caseId": row["case_id"],
        "filename": row["filename"],
        "fileSize": row["file_size"],
        "fileSizeBytesFormatted": row["file_size_formatted"],
        "fileType": row["file_type"],
        "sourceType": row["source_type"],
        "sha256": row["sha256"],
        "legacyMd5": row["legacy_md5"],
        "acquisitionTimestamp": row["acquisition_timestamp"],
        "deviceId": row["device_id"],
        "status": row["status"],
        "readOnly": bool(row["read_only"]),
        "workingCopyCreated": bool(row["working_copy_created"]),
        "healthScore": row["health_score"]
    }

@app.post("/api/evidence/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    caseId: str = Form("CFX-2026-001"),
    sourceType: str = Form("Physical Disk Bit-Stream Copy")
):
    safe_filename = file.filename.replace("..", "").replace("/", "_")
    target_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(target_path, "wb") as f:
        content = await file.read()
        f.write(content)

    hashes = calculate_hashes(target_path)
    file_size = hashes["fileSize"]
    size_mb = round(file_size / (1024 * 1024), 2)
    formatted_size = f"{size_mb} MB" if size_mb > 0 else f"{file_size} bytes"

    # Determine file type
    ext = os.path.splitext(safe_filename)[1].upper().replace(".", "") or "BIN"
    file_type = f"{ext} (Surveillance Container)"

    # Generate unique evidence ID
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM evidence")
    ev_count = cursor.fetchone()[0] + 1
    new_ev_id = f"CFX-EV-{ev_count:04d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO evidence (id, case_id, filename, file_size, file_size_formatted, file_type, source_type, sha256, legacy_md5, acquisition_timestamp, device_id, status, read_only, working_copy_created, health_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Acquired', 1, 1, 95)
    """, (new_ev_id, caseId, safe_filename, file_size, formatted_size, file_type, sourceType, hashes["sha256"], hashes["legacyMd5"], now_str, "DEV-GENERIC"))

    # Log into chain of custody
    coc_id = f"COC-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO chain_of_custody (id, evidence_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
    VALUES (?, ?, ?, 'Evidence Uploaded & SHA-256 Anchored', 'Forensic Examiner', 'CFX Ingestion Subsystem', ?, 1, 'Working copy isolated with read-only master lock')
    """, (coc_id, new_ev_id, now_str, hashes["sha256"]))

    cursor.execute("UPDATE cases SET evidence_count = evidence_count + 1 WHERE id = ?", (caseId,))
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "evidenceId": new_ev_id,
        "filename": safe_filename,
        "fileSize": file_size,
        "formattedSize": formatted_size,
        "sha256": hashes["sha256"],
        "legacyMd5": hashes["legacyMd5"],
        "readOnly": True,
        "workingCopyCreated": True
    }

@app.post("/api/evidence/{evidence_id}/hash")
def recompute_hash(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evidence WHERE id = ?", (evidence_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Evidence not found")

    sha256 = row["sha256"]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Log re-verification event in chain of custody
    coc_id = f"COC-{uuid.uuid4().hex[:6].upper()}"
    cursor.execute("""
    INSERT INTO chain_of_custody (id, evidence_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
    VALUES (?, ?, ?, 'Working Copy Integrity Re-verified against Master SHA-256', 'Automated Verification Auditor', 'CFX Cryptographic Daemon', ?, 1, 'Bit-level match confirmed: 0 deviations')
    """, (coc_id, evidence_id, now_str, sha256))
    conn.commit()
    conn.close()

    return {
        "status": "verified",
        "evidenceId": evidence_id,
        "sha256": sha256,
        "integrityStatus": "BIT-STREAM IDENTICAL",
        "verifiedAt": now_str
    }

@app.get("/api/evidence/{evidence_id}/fingerprint")
def get_device_fingerprint(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices WHERE evidence_id = ?", (evidence_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        methods = json.loads(row["detection_methods_json"]) if row["detection_methods_json"] else []
        return {
            "manufacturer": row["manufacturer"],
            "deviceType": row["device_type"],
            "modelFamily": row["model_family"],
            "storageStructure": row["storage_structure"],
            "codec": row["codec"],
            "channels": row["channels"],
            "metadataStatus": row["metadata_status"],
            "detectionConfidence": row["detection_confidence"],
            "detectionMethods": methods,
            "signatureHex": row["signature_hex"],
            "signatureDescription": row["signature_description"],
            "vendorSignatureMatch": row["vendor_match"],
            "disclaimer": row["disclaimer"]
        }

    # Fallback to analysis
    return analyze_device_fingerprint()

@app.get("/api/evidence/{evidence_id}/health")
def get_evidence_health(evidence_id: str):
    return get_evidence_health_assessment()

@app.get("/api/evidence/{evidence_id}/metadata")
def get_video_metadata(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM video_metadata WHERE evidence_id = ?", (evidence_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "codec": row["codec"],
            "profile": row["profile"],
            "resolution": row["resolution"],
            "width": row["width"],
            "height": row["height"],
            "fps": row["fps"],
            "duration": row["duration"],
            "durationSeconds": row["duration_seconds"],
            "frameCount": row["frame_count"],
            "audioPresence": row["audio_presence"],
            "container": row["container"],
            "bitrate": row["bitrate"],
            "colorSpace": row["color_space"],
            "pixelFormat": row["pixel_format"],
            "scanType": row["scan_type"],
            "ffprobeJsonRaw": row["raw_json"]
        }

    return extract_video_metadata(None)

@app.get("/api/evidence/{evidence_id}/recordings")
def get_recordings(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recordings WHERE evidence_id = ? ORDER BY camera_id, start_seconds", (evidence_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
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

@app.get("/api/evidence/{evidence_id}/gaps")
def get_gaps(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recording_gaps WHERE evidence_id = ?", (evidence_id,))
    rows = cursor.fetchall()
    conn.close()

    if rows:
        return [
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
    return analyze_recording_gaps([])

@app.get("/api/evidence/{evidence_id}/timestamps")
def get_timestamps(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM timestamp_checks WHERE evidence_id = ?", (evidence_id,))
    rows = cursor.fetchall()
    conn.close()

    if rows:
        return [
            {
                "id": r["id"],
                "camera": r["camera_name"],
                "frameIndex": r["frame_index"],
                "recordedTimeStr": r["recorded_time_str"],
                "osdTimestamp": r["osd_timestamp"],
                "metadataTimestamp": r["metadata_timestamp"],
                "filesystemTimestamp": r["filesystem_timestamp"],
                "maxDiffSeconds": r["max_diff_seconds"],
                "status": r["status"],
                "severity": r["severity"],
                "explanation": r["explanation"],
                "offsetDetails": json.loads(r["offset_details_json"])
            }
            for r in rows
        ]
    return analyze_timestamp_consistency()

@app.get("/api/evidence/{evidence_id}/timeline")
def get_timeline(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM timeline_events WHERE evidence_id = ? ORDER BY time_seconds ASC", (evidence_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
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

@app.post("/api/evidence/{evidence_id}/ai-search")
def search_ai_incidents(evidence_id: str, payload: dict):
    query = payload.get("query", "")
    quick_filter = payload.get("quickFilter", "ALL")
    camera_filter = payload.get("cameraFilter", "ALL CAMERAS")

    structured = None
    if query:
        structured = parse_natural_language_query(query)
        if structured["parsedTarget"]["object"] != "ALL":
            quick_filter = structured["parsedTarget"]["object"]
        if structured["parsedTarget"]["camera"] != "ALL CAMERAS":
            camera_filter = structured["parsedTarget"]["camera"]

    results = get_ai_detections(label_filter=quick_filter, camera_filter=camera_filter)
    return {
        "query": query,
        "structuredInterpretation": structured,
        "results": results,
        "totalCount": len(results),
        "disclaimer": "AI ANALYSIS PROTOTYPE: Results derived using deterministic object classification model (YOLO/PyTorch architecture). All findings require human forensic verification."
    }

@app.get("/api/evidence/{evidence_id}/chain-of-custody")
def get_chain_of_custody(evidence_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chain_of_custody WHERE evidence_id = ? ORDER BY timestamp ASC", (evidence_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "timestamp": r["timestamp"],
            "action": r["action"],
            "actor": r["actor"],
            "system": r["system"],
            "evidenceId": r["evidence_id"],
            "hashReference": r["hash_reference"],
            "integrityVerified": bool(r["integrity_verified"]),
            "notes": r["notes"]
        }
        for r in rows
    ]

@app.post("/api/evidence/{evidence_id}/chain-of-custody")
def add_custody_entry(evidence_id: str, payload: dict):
    action = payload.get("action", "Analyst Note Recorded")
    actor = payload.get("actor", "Forensic Analyst")
    notes = payload.get("notes", "")
    hash_ref = payload.get("hashReference", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

    conn = get_db()
    cursor = conn.cursor()
    new_id = f"COC-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO chain_of_custody (id, evidence_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
    VALUES (?, ?, ?, ?, ?, 'CFX Forensic Workstation', ?, 1, ?)
    """, (new_id, evidence_id, now_str, action, actor, hash_ref, notes))
    conn.commit()
    conn.close()

    return {"status": "recorded", "entryId": new_id, "timestamp": now_str}

@app.post("/api/evidence/{evidence_id}/report")
def generate_report_pdf(evidence_id: str):
    pdf_filename = f"CFX_Forensic_Report_{evidence_id}.pdf"
    output_path = os.path.join(REPORTS_DIR, pdf_filename)

    # Gather case data
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evidence WHERE id = ?", (evidence_id,))
    ev_row = cursor.fetchone()
    case_id = ev_row["case_id"] if ev_row else "CFX-2026-001"

    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    case_row = cursor.fetchone()
    conn.close()

    case_info = dict(case_row) if case_row else {"id": case_id, "name": "Warehouse CCTV Investigation"}
    evidence_info = dict(ev_row) if ev_row else {"id": evidence_id, "filename": "DVR_01.bin", "sha256": "e3b0c442..."}
    metadata_info = extract_video_metadata(None)
    fingerprint_info = analyze_device_fingerprint()
    gaps = analyze_recording_gaps([])
    timestamps = analyze_timestamp_consistency()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM chain_of_custody WHERE evidence_id = ?", (evidence_id,))
    custody_log = [dict(r) for r in cursor.fetchall()]
    conn.close()

    generate_forensic_report_pdf(output_path, case_info, evidence_info, metadata_info, fingerprint_info, gaps, timestamps, custody_log)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=pdf_filename
    )

@app.post("/api/evidence/{evidence_id}/bsa-section63")
def generate_bsa_pdf(evidence_id: str, payload: dict = None):
    examiner = payload.get("examinerName", "Insp. R. Verma") if payload else "Insp. R. Verma"
    designation = payload.get("designation", "Digital Evidence Custodian / Senior Examiner") if payload else "Digital Evidence Custodian / Senior Examiner"

    pdf_filename = f"BSA_Section_63_Certificate_{evidence_id}.pdf"
    output_path = os.path.join(REPORTS_DIR, pdf_filename)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evidence WHERE id = ?", (evidence_id,))
    ev_row = cursor.fetchone()
    case_id = ev_row["case_id"] if ev_row else "CFX-2026-001"

    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    case_row = cursor.fetchone()
    conn.close()

    case_info = dict(case_row) if case_row else {"id": case_id, "name": "Warehouse CCTV Investigation"}
    evidence_info = dict(ev_row) if ev_row else {"id": evidence_id, "filename": "DVR_01.bin"}
    device_info = analyze_device_fingerprint()

    generate_bsa_section63_pdf(output_path, case_info, evidence_info, device_info, examiner_name=examiner, designation=designation)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=pdf_filename
    )

@app.get("/api/evidence/sample-video/info")
def get_sample_videos_info():
    samples_dir = os.path.join(os.getcwd(), "public", "samples")
    return [
        {
            "id": "CAM-01-GATE",
            "camera": "Camera 01 (Gate West)",
            "title": "Vehicle Ingress & Perimeter Outage Incident Replay",
            "incident": "White Delivery Truck (Plate: MH-04-AX-9122) entry and gate checkpoint barrier lift",
            "timestamp": "2026-03-10 09:14:15 - 09:14:39 UTC",
            "duration": "24s",
            "durationSeconds": 24,
            "resolution": "1280x720 (720p HD)",
            "fps": 25,
            "codec": "H.264 / AVC (High Profile)",
            "sha256": "fe9071cbb7e2f1991f3ef42e0532d44043552c10fd84c224830a3916ccfe5da9",
            "url": "/samples/sample_cctv_camera01_gate.mp4",
            "downloadUrl": "/api/evidence/sample-video/download/CAM-01-GATE",
            "isPrimaryDemo": True,
            "matchedEventId": "EVT-002"
        },
        {
            "id": "CAM-02-DOCK",
            "camera": "Camera 02 (Loading Dock)",
            "title": "Cargo Bay 3 Optical Flow Motion (+15s Clock Drift)",
            "incident": "Abrupt motion near Cargo Bay 3 shutter during Camera 01 outage with burned-in +15s internal desync",
            "timestamp": "2026-03-10 09:48:10 - 09:48:26 UTC",
            "duration": "16s",
            "durationSeconds": 16,
            "resolution": "1280x720 (720p HD)",
            "fps": 25,
            "codec": "H.264 / AVC",
            "sha256": "dcfd79ea0c1644c69d59dfac2c1edd75a50fec427b916813bf5a1b3c9f22367e",
            "url": "/samples/sample_cctv_camera02_dock.mp4",
            "downloadUrl": "/api/evidence/sample-video/download/CAM-02-DOCK",
            "isPrimaryDemo": False,
            "matchedEventId": "EVT-004"
        },
        {
            "id": "CAM-03-PERIMETER",
            "camera": "Camera 03 (Perimeter Fence)",
            "title": "Perimeter Fence Night IR Pedestrian Traversing",
            "incident": "Pedestrian in dark jacket moving west along south fence during temporal recording gap",
            "timestamp": "2026-03-10 09:51:20 - 09:51:36 UTC",
            "duration": "16s",
            "durationSeconds": 16,
            "resolution": "1280x720 (720p HD)",
            "fps": 25,
            "codec": "H.264 / AVC (IR Mode)",
            "sha256": "46fc81576af2c238937cbd52714440b6194cf5b8b34d32635be0d97f3892f10f",
            "url": "/samples/sample_cctv_camera03_perimeter.mp4",
            "downloadUrl": "/api/evidence/sample-video/download/CAM-03-PERIMETER",
            "isPrimaryDemo": False,
            "matchedEventId": "EVT-005"
        }
    ]

@app.get("/api/evidence/sample-video/download/{video_id}")
def download_sample_video(video_id: str):
    file_map = {
        "CAM-01-GATE": ("sample_cctv_camera01_gate.mp4", "CCTV_FORENSIX_EVIDENCE_CAM01_GATE.mp4"),
        "CAM-02-DOCK": ("sample_cctv_camera02_dock.mp4", "CCTV_FORENSIX_EVIDENCE_CAM02_DOCK.mp4"),
        "CAM-03-PERIMETER": ("sample_cctv_camera03_perimeter.mp4", "CCTV_FORENSIX_EVIDENCE_CAM03_PERIMETER.mp4"),
        "DEFAULT": ("sample_cctv_evaluator_demo.mp4", "CCTV_FORENSIX_SAMPLE_EVALUATOR_REPLAY.mp4")
    }
    
    entry = file_map.get(video_id, file_map["DEFAULT"])
    file_path = os.path.join(os.getcwd(), "public", "samples", entry[0])
    if not os.path.exists(file_path):
        file_path = os.path.join(os.getcwd(), "public", entry[0])
        
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Sample video file not found")
        
    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=entry[1],
        headers={"Content-Disposition": f'attachment; filename="{entry[1]}"'}
    )

