import sqlite3
import os
import json
from datetime import datetime

DB_FILE = os.environ.get("DB_FILE", "forensix.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        evidence_count INTEGER DEFAULT 0,
        camera_count INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        created TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        lead_investigator TEXT,
        location TEXT,
        description TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_size_formatted TEXT,
        file_type TEXT NOT NULL,
        source_type TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        legacy_md5 TEXT,
        acquisition_timestamp TEXT NOT NULL,
        device_id TEXT,
        status TEXT NOT NULL,
        read_only INTEGER DEFAULT 1,
        working_copy_created INTEGER DEFAULT 1,
        health_score INTEGER DEFAULT 92,
        FOREIGN KEY (case_id) REFERENCES cases(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        manufacturer TEXT NOT NULL,
        device_type TEXT NOT NULL,
        model_family TEXT NOT NULL,
        storage_structure TEXT NOT NULL,
        codec TEXT NOT NULL,
        channels INTEGER DEFAULT 16,
        metadata_status TEXT NOT NULL,
        detection_confidence INTEGER NOT NULL,
        signature_hex TEXT,
        signature_description TEXT,
        vendor_match TEXT,
        detection_methods_json TEXT,
        disclaimer TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS video_metadata (
        evidence_id TEXT PRIMARY KEY,
        codec TEXT,
        profile TEXT,
        resolution TEXT,
        width INTEGER,
        height INTEGER,
        fps REAL,
        duration TEXT,
        duration_seconds REAL,
        frame_count INTEGER,
        audio_presence TEXT,
        container TEXT,
        bitrate TEXT,
        color_space TEXT,
        pixel_format TEXT,
        scan_type TEXT,
        raw_json TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recordings (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        camera_name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        start_seconds REAL,
        end_seconds REAL,
        duration TEXT NOT NULL,
        duration_seconds REAL,
        status TEXT NOT NULL,
        size_bytes INTEGER,
        codec TEXT,
        has_audio INTEGER DEFAULT 0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recording_gaps (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        camera_name TEXT NOT NULL,
        gap_start TEXT NOT NULL,
        gap_end TEXT NOT NULL,
        gap_start_seconds REAL,
        gap_end_seconds REAL,
        duration TEXT NOT NULL,
        duration_seconds REAL,
        classification TEXT NOT NULL,
        prior_segment_end TEXT,
        next_segment_start TEXT,
        possible_causes_json TEXT,
        forensic_note TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS timestamp_checks (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        camera_name TEXT NOT NULL,
        frame_index INTEGER,
        recorded_time_str TEXT,
        osd_timestamp TEXT NOT NULL,
        metadata_timestamp TEXT NOT NULL,
        filesystem_timestamp TEXT NOT NULL,
        max_diff_seconds REAL,
        status TEXT NOT NULL,
        severity TEXT NOT NULL,
        explanation TEXT,
        offset_details_json TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS timeline_events (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        camera_name TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        time_seconds REAL,
        event_type TEXT NOT NULL,
        confidence REAL,
        details TEXT,
        source TEXT,
        severity TEXT DEFAULT 'normal'
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_detections (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        camera TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        time_seconds REAL,
        label TEXT NOT NULL,
        confidence REAL,
        bounding_box_json TEXT,
        notes TEXT,
        verified_by_analyst INTEGER DEFAULT 0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chain_of_custody (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        case_id TEXT DEFAULT 'CASE-2026-001',
        timestamp TEXT NOT NULL,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        system TEXT NOT NULL,
        hash_reference TEXT,
        integrity_verified INTEGER DEFAULT 1,
        notes TEXT
    );
    """)

    # Migration for existing DB
    try:
        cursor.execute("ALTER TABLE chain_of_custody ADD COLUMN case_id TEXT DEFAULT 'CASE-2026-001'")
    except Exception:
        pass

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        direction TEXT NOT NULL,
        video_source TEXT NOT NULL,
        evidence_id TEXT NOT NULL,
        fps REAL DEFAULT 25.0,
        resolution TEXT DEFAULT '1280x720',
        next_hop TEXT,
        distance_meters REAL,
        nominal_transit_seconds REAL,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (case_id) REFERENCES cases(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incident_events (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        camera_id TEXT NOT NULL,
        camera_name TEXT NOT NULL,
        evidence_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        video_time_seconds REAL NOT NULL,
        frame_number INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        detected_object TEXT NOT NULL,
        track_id TEXT NOT NULL,
        confidence REAL NOT NULL,
        bounding_box_json TEXT,
        details TEXT NOT NULL,
        correlation_confidence REAL,
        correlation_reasons_json TEXT,
        related_event_ids_json TEXT,
        fact_type TEXT NOT NULL DEFAULT 'OBSERVED FACT',
        FOREIGN KEY (case_id) REFERENCES cases(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cross_camera_correlations (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        source_camera TEXT NOT NULL,
        target_camera TEXT NOT NULL,
        source_track TEXT NOT NULL,
        target_track TEXT NOT NULL,
        source_event_id TEXT NOT NULL,
        target_event_id TEXT NOT NULL,
        time_delta_seconds REAL NOT NULL,
        distance_meters REAL NOT NULL,
        temporal_plausibility TEXT NOT NULL,
        correlation_score REAL NOT NULL,
        reasons_json TEXT NOT NULL,
        analyst_status TEXT NOT NULL DEFAULT 'POTENTIAL MATCH (AI INFERENCE)',
        FOREIGN KEY (case_id) REFERENCES cases(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        evidence_id TEXT NOT NULL,
        report_type TEXT NOT NULL,
        title TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        examiner TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        pdf_path TEXT,
        status TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

def seed_demo_data():
    conn = get_db()
    cursor = conn.cursor()

    # Clear existing tables
    tables = [
        "cases", "evidence", "devices", "video_metadata", "recordings",
        "recording_gaps", "timestamp_checks", "timeline_events",
        "ai_detections", "chain_of_custody", "reports",
        "cameras", "incident_events", "cross_camera_correlations"
    ]
    for table in tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
        except Exception:
            pass

    # 1. Cases (CASE-2026-001 is the primary demonstration case)
    cursor.execute("""
    INSERT INTO cases (id, name, evidence_count, camera_count, status, created, last_updated, lead_investigator, location, description)
    VALUES 
    ('CASE-2026-001', 'Suspected Vehicle Theft', 3, 3, 'UNDER ANALYSIS', '2026-09-11 10:10:00', '2026-09-11 10:35:12', 'Insp. R. Verma / Digital Forensics Unit', 'Perimeter Sector 4 Logistics Terminal', 'Multi-camera cross-correlation and incident reconstruction of unauthorized ingress, loading dock traversal, and vehicle departure.'),
    ('CFX-2026-001', 'Warehouse CCTV Investigation', 3, 16, 'Analysis', '2026-09-08 08:30:00', '2026-09-11 10:31:04', 'Insp. R. Verma / Forensic Analyst', 'Central Logistics Hub, Sector 4, New Delhi', 'Comprehensive digital forensic triage of multi-channel DVR recording units following perimeter security breach.'),
    ('CFX-2026-002', 'Retail Incident', 5, 24, 'Verified', '2026-09-04 14:15:00', '2026-09-10 16:45:00', 'Tech. Officer K. Sundaram', 'Metro Plaza Retail Mall, Bengaluru', 'Archived footage extraction and timeline reconciliation for store entry anomaly.'),
    ('CFX-2026-003', 'Transit Terminal Gate 4', 2, 8, 'Acquisition', '2026-09-11 06:00:00', '2026-09-11 07:15:00', 'Analyst S. Mukherjee', 'Terminal 2 Departure Bay, Mumbai', 'Physical flash memory dump from ruggedized outdoor NVR container.');
    """)

    # 2. Evidence items for CASE-2026-001 and CFX-EV-0001
    cursor.execute("""
    INSERT INTO evidence (id, case_id, filename, file_size, file_size_formatted, file_type, source_type, sha256, legacy_md5, acquisition_timestamp, device_id, status, read_only, working_copy_created, health_score)
    VALUES 
    (
        'EV-001',
        'CASE-2026-001',
        'sample_cctv_camera01_gate.mp4',
        1333678,
        '1.27 MB',
        'MP4 (H.264 / AVC Progressive)',
        'Physical Write-Blocker Ingestion (Port 1)',
        '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19',
        'a8f91c72b4e823f994018281ef77c901',
        '2026-09-11 10:14:00',
        'CAM-01-GATE',
        'Verified',
        1,
        1,
        98
    ),
    (
        'EV-002',
        'CASE-2026-001',
        'sample_cctv_camera02_dock.mp4',
        1923538,
        '1.83 MB',
        'MP4 (H.264 / AVC Progressive)',
        'Physical Write-Blocker Ingestion (Port 2)',
        '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a',
        'b91c81d8302fbc44e1837190fa72810a',
        '2026-09-11 10:15:45',
        'CAM-02-DOCK',
        'Verified',
        1,
        1,
        96
    ),
    (
        'EV-003',
        'CASE-2026-001',
        'sample_cctv_camera03_perimeter.mp4',
        4132045,
        '3.94 MB',
        'MP4 (H.264 / AVC Progressive)',
        'Physical Write-Blocker Ingestion (Port 3)',
        '492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2',
        'c82e70d44019283fa880291ba63910ef',
        '2026-09-11 10:18:20',
        'CAM-03-PERIMETER',
        'Verified',
        1,
        1,
        99
    ),
    (
        'CFX-EV-0001',
        'CFX-2026-001',
        'DVR_01.bin',
        4294967296,
        '4.00 GB',
        'BIN (Proprietary Container)',
        'Physical SATA Disk Dump (Write-Blocker Hardware)',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'd41d8cd98f00b204e9800998ecf8427e',
        '2026-09-08 09:14:22',
        'DEV-HIK-8804',
        'Analyzing',
        1,
        1,
        92
    );
    """)

    # 3. Cameras for CASE-2026-001
    cursor.execute("""
    INSERT INTO cameras (id, case_id, name, location, direction, video_source, evidence_id, fps, resolution, next_hop, distance_meters, nominal_transit_seconds, order_index)
    VALUES
    (
        'CAM-01-GATE',
        'CASE-2026-001',
        'Camera 01 - Gate West',
        'Main Gate Access & Foreground Vehicle Lane',
        'Inbound / Eastward',
        '/samples/sample_cctv_camera01_gate.mp4',
        'EV-001',
        30.0,
        '1280x720',
        'CAM-02-DOCK',
        95.0,
        95.0,
        1
    ),
    (
        'CAM-02-DOCK',
        'CASE-2026-001',
        'Camera 02 - Loading Dock',
        'Dock Corridor & Cargo Bay 3 Access',
        'Eastbound Concourse toward Parking Annex',
        '/samples/sample_cctv_camera02_dock.mp4',
        'EV-002',
        25.0,
        '1280x720',
        'CAM-03-PERIMETER',
        70.0,
        70.0,
        2
    ),
    (
        'CAM-03-PERIMETER',
        'CASE-2026-001',
        'Camera 03 - Parking Exit',
        'South Perimeter Fence & Vehicle Exit Gate',
        'Outbound Roadway / Southward',
        '/samples/sample_cctv_camera03_perimeter.mp4',
        'EV-003',
        25.0,
        '1280x720',
        NULL,
        0.0,
        0.0,
        3
    );
    """)

    # 4. Incident Events for CASE-2026-001
    incident_events_data = [
        (
            'EVT-REC-01',
            'CASE-2026-001',
            'CAM-01-GATE',
            'Camera 01 - Gate West',
            'EV-001',
            '10:14:32 UTC',
            6.0,
            180,
            'Perimeter Ingress',
            'Person',
            'P-07',
            96.2,
            json.dumps({"x": 54, "y": 38, "width": 14, "height": 42}),
            'OBSERVED: Person detected entering gate access perimeter moving eastward.',
            None,
            None,
            json.dumps(['EVT-REC-02', 'EVT-REC-03']),
            'OBSERVED FACT'
        ),
        (
            'EVT-REC-02',
            'CASE-2026-001',
            'CAM-01-GATE',
            'Camera 01 - Gate West',
            'EV-001',
            '10:14:48 UTC',
            14.0,
            420,
            'Gate Perimeter Transit',
            'Person',
            'P-07',
            94.8,
            json.dumps({"x": 62, "y": 34, "width": 12, "height": 38}),
            'OBSERVED: Track P-07 continues eastward past vehicle barrier toward dock access path.',
            None,
            None,
            json.dumps(['EVT-REC-01', 'EVT-REC-03']),
            'OBSERVED FACT'
        ),
        (
            'EVT-REC-03',
            'CASE-2026-001',
            'CAM-01-GATE',
            'Topology Path (CAM-01 → CAM-02)',
            'EV-001',
            '10:15:20 UTC',
            20.0,
            600,
            'Spatial Transition',
            'Subject Movement',
            'P-07 → P-12 Candidate',
            92.0,
            json.dumps({"x": 70, "y": 32, "width": 10, "height": 34}),
            'AI-ASSISTED INFERENCE: Transit between Gate West and Loading Dock (95m). Velocity: 0.99 m/s. Status: Temporally and spatially compatible.',
            87.0,
            json.dumps(['Compatible 1m 36s transit time over 95m nominal walking path', 'Consistent directional vector moving eastward along concourse']),
            json.dumps(['EVT-REC-02', 'EVT-REC-04']),
            'AI-ASSISTED INFERENCE'
        ),
        (
            'EVT-REC-04',
            'CASE-2026-001',
            'CAM-02-DOCK',
            'Camera 02 - Loading Dock',
            'EV-002',
            '10:16:08 UTC',
            5.5,
            138,
            'Corridor Ingress',
            'Person',
            'P-12',
            91.4,
            json.dumps({"x": 44, "y": 36, "width": 15, "height": 46}),
            'OBSERVED: Person detected in dock corridor concourse. INFERENCE: 87% correlation match with Track P-07.',
            87.0,
            json.dumps([
                'Compatible time interval (1m 36s delta aligns with physical 95m distance)',
                'Compatible movement direction (Eastbound traversal along concourse corridor)',
                'Similar appearance (Dark jacket, dark trousers, lighter footwear, medium build)',
                'Connected camera locations (Directly adjacent camera sectors: Gate West → Loading Dock)'
            ]),
            json.dumps(['EVT-REC-01', 'EVT-REC-05']),
            'OBSERVED FACT (Detection) + AI INFERENCE (Correlation)'
        ),
        (
            'EVT-REC-05',
            'CASE-2026-001',
            'CAM-02-DOCK',
            'Camera 02 - Loading Dock',
            'EV-002',
            '10:16:30 UTC',
            12.0,
            300,
            'Dock Traversal',
            'Person',
            'P-12',
            89.5,
            json.dumps({"x": 52, "y": 38, "width": 14, "height": 44}),
            'OBSERVED: Track P-12 traverses dock concourse towards parking annex access door.',
            None,
            None,
            json.dumps(['EVT-REC-04', 'EVT-REC-06']),
            'OBSERVED FACT'
        ),
        (
            'EVT-REC-06',
            'CASE-2026-001',
            'CAM-02-DOCK',
            'Topology Path (CAM-02 → CAM-03)',
            'EV-002',
            '10:17:15 UTC',
            17.5,
            438,
            'Spatial Transition',
            'Annex Transition',
            'P-12 → V-03 Candidate',
            84.5,
            json.dumps({"x": 60, "y": 40, "width": 12, "height": 40}),
            'AI-ASSISTED INFERENCE: Transition from Loading Dock to Parking Exit (70m + vehicle boarding interval). Elapsed: 2m 33s.',
            81.0,
            json.dumps(['Compatible walking distance to parked vehicle area', 'Temporal window accommodates door entry, ignition, and initial vehicle maneuvering']),
            json.dumps(['EVT-REC-05', 'EVT-REC-07']),
            'AI-ASSISTED INFERENCE'
        ),
        (
            'EVT-REC-07',
            'CASE-2026-001',
            'CAM-03-PERIMETER',
            'Camera 03 - Parking Exit',
            'EV-003',
            '10:18:41 UTC',
            4.5,
            113,
            'Vehicle Maneuver',
            'Vehicle',
            'V-03',
            94.6,
            json.dumps({"x": 38, "y": 42, "width": 28, "height": 35}),
            'OBSERVED: Vehicle detected traversing parking lane towards perimeter exit barrier.',
            None,
            None,
            json.dumps(['EVT-REC-04', 'EVT-REC-08']),
            'OBSERVED FACT'
        ),
        (
            'EVT-REC-08',
            'CASE-2026-001',
            'CAM-03-PERIMETER',
            'Camera 03 - Parking Exit',
            'EV-003',
            '10:19:02 UTC',
            9.0,
            225,
            'Perimeter Exit',
            'Vehicle',
            'V-03',
            97.1,
            json.dumps({"x": 50, "y": 40, "width": 26, "height": 32}),
            'OBSERVED: Vehicle V-03 exits camera field of view through south perimeter boundary gate.',
            None,
            None,
            json.dumps(['EVT-REC-07']),
            'OBSERVED FACT'
        )
    ]
    cursor.executemany("""
    INSERT INTO incident_events (id, case_id, camera_id, camera_name, evidence_id, timestamp, video_time_seconds, frame_number, event_type, detected_object, track_id, confidence, bounding_box_json, details, correlation_confidence, correlation_reasons_json, related_event_ids_json, fact_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, incident_events_data)

    # 5. Cross-Camera Correlation
    corr_data = [
        (
            'CORR-01',
            'CASE-2026-001',
            'Camera 01 - Gate West',
            'Camera 02 - Loading Dock',
            'P-07',
            'P-12',
            'EVT-REC-01',
            'EVT-REC-04',
            96.0,
            95.0,
            'PLAUSIBLE (0.99 m/s velocity within standard 0.8 - 1.4 m/s human walking speed)',
            87.0,
            json.dumps([
                'Compatible time interval: 1m 36s delta aligns with physical 95m distance',
                'Compatible movement direction: Eastbound entry along concourse corridor',
                'Similar appearance: Dark jacket, dark trousers, lighter footwear, medium build',
                'Connected camera locations: Directly adjacent physical camera sectors'
            ]),
            'LIKELY SAME SUBJECT (AI-ASSISTED INFERENCE)'
        ),
        (
            'CORR-02',
            'CASE-2026-001',
            'Camera 02 - Loading Dock',
            'Camera 03 - Parking Exit',
            'P-12',
            'V-03',
            'EVT-REC-05',
            'EVT-REC-07',
            131.0,
            70.0,
            'PLAUSIBLE (Transit time compatible with 70m walk + vehicle access + ignition start)',
            81.0,
            json.dumps([
                'Compatible time interval: 2m 11s delta matches walking 70m and entering parked vehicle',
                'Compatible exit trajectory: Dock corridor south door opens directly to Parking Exit bay',
                'No alternative pedestrian egress detected on perimeter sensors during interval',
                'Vehicle V-03 initiates departure precisely 1m 26s after subject enters parking annex'
            ]),
            'INCIDENT SEQUENCE LINKED (AI-ASSISTED INFERENCE)'
        )
    ]
    cursor.executemany("""
    INSERT INTO cross_camera_correlations (id, case_id, source_camera, target_camera, source_track, target_track, source_event_id, target_event_id, time_delta_seconds, distance_meters, temporal_plausibility, correlation_score, reasons_json, analyst_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, corr_data)

    # 6. Chain of Custody for CASE-2026-001 and CFX-EV-0001
    custody_entries = [
        ('COC-CASE-001', 'EV-001', 'CASE-2026-001', '2026-09-11 10:14:00', 'Evidence Acquired (Hardware Write-Blocker)', 'Insp. R. Verma', 'CFX Ingestion Station 01', '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19', 1, 'Camera 01 footage acquired under hardware write-block protection. Master original locked read-only.'),
        ('COC-CASE-002', 'EV-001', 'CASE-2026-001', '2026-09-11 10:14:02', 'SHA-256 Calculated & Anchored', 'Automated Integrity Daemon', 'CFX Hashing Engine', '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19', 1, 'Cryptographic digest computed: 499f1b43... Bit-stream preserved.'),
        ('COC-CASE-003', 'EV-001', 'CASE-2026-001', '2026-09-11 10:14:05', 'Working Forensic Copy Created', 'Insp. R. Verma', 'CFX Analysis Node 02', '499f1b4372a1d851eb0935480c1b12e90d5a9608d76f93c4706a027f03c91a19', 1, 'Isolated working copy generated. Master remains untouched in immutable vault.'),
        ('COC-CASE-004', 'EV-002', 'CASE-2026-001', '2026-09-11 10:15:45', 'Evidence Acquired (Hardware Write-Blocker)', 'Insp. R. Verma', 'CFX Ingestion Station 01', '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a', 1, 'Camera 02 footage acquired. Physical disk write-blocked.'),
        ('COC-CASE-005', 'EV-002', 'CASE-2026-001', '2026-09-11 10:15:47', 'SHA-256 Calculated & Anchored', 'Automated Integrity Daemon', 'CFX Hashing Engine', '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a', 1, 'Cryptographic digest computed: 12262a6d... Master locked read-only.'),
        ('COC-CASE-006', 'EV-002', 'CASE-2026-001', '2026-09-11 10:15:50', 'Working Forensic Copy Created', 'Insp. R. Verma', 'CFX Analysis Node 02', '12262a6dfaf2c6d935ffea6d39fd7c47b6233151e58eb07c8f1f815f47f4814a', 1, 'Working copy initialized. Bit-stream verified.'),
        ('COC-CASE-007', 'EV-003', 'CASE-2026-001', '2026-09-11 10:18:20', 'Evidence Acquired (Hardware Write-Blocker)', 'Insp. R. Verma', 'CFX Ingestion Station 01', '492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2', 1, 'Camera 03 perimeter footage acquired under physical seal.'),
        ('COC-CASE-008', 'EV-003', 'CASE-2026-001', '2026-09-11 10:18:22', 'SHA-256 Calculated & Anchored', 'Automated Integrity Daemon', 'CFX Hashing Engine', '492bff1ae9632990e878bc024ede4f2e1d13728d623610c0dda0e6fa2e5983d2', 1, 'Cryptographic digest computed: 492bff1a... Working copy generated.'),
        ('COC-CASE-009', 'CASE-2026-001', 'CASE-2026-001', '2026-09-11 10:20:00', 'Cross-Camera Incident Reconstruction Initialized', 'Forensic Reconstruction Engine', 'CFX Multi-Cam Pipeline', 'RECON-CASE-2026-001', 1, 'Multi-camera spatial alignment established for Gate West, Loading Dock, and Parking Exit.'),
        ('COC-CASE-010', 'CASE-2026-001', 'CASE-2026-001', '2026-09-11 10:22:15', 'Cross-Camera Correlation Computed (P-07 → P-12)', 'AI Correlator (Non-Destructive)', 'CFX Feature Extractor', 'CORR-01-87PCT', 1, 'Correlation 87% registered. Kinematic transit verified at 0.99 m/s. Classified as Potential Match (AI-Assisted Inference).'),
        ('COC-CASE-011', 'CASE-2026-001', 'CASE-2026-001', '2026-09-11 10:25:30', 'Vehicle Exit Linked (V-03)', 'AI Correlator (Non-Destructive)', 'CFX Trajectory Analyzer', 'CORR-02-81PCT', 1, 'Vehicle V-03 linked to dock departure sequence. Plausibility verified.'),
        ('COC-CASE-012', 'CASE-2026-001', 'CASE-2026-001', '2026-09-11 10:35:12', 'Comprehensive Hash Verification Performed', 'Automated Continuous Auditor', 'CFX Verification Daemon', 'ALL-HASHES-VERIFIED', 1, 'All 3 evidence working copies re-hashed and verified against original master records. 0 bit drift.'),
        ('COC-001', 'CFX-EV-0001', 'CFX-2026-001', '2026-09-08 09:14:22', 'Physical Evidence Received & Sealed in Anti-Static Bag', 'Officer M. K. Rathore (Special Cell)', 'Evidence Vault Desk #3', 'SEAL-DL-2026-9921', 1, 'Physical 2TB Seagate Surveillance HDD received under seal. Chain intact.'),
        ('COC-002', 'CFX-EV-0001', 'CFX-2026-001', '2026-09-08 10:02:14', 'Evidence Acquired via Hardware Write-Blocker (Tableau T8u)', 'Forensic Analyst R. Verma', 'CFX Forensic Ingestion Node 01', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, 'Bit-stream image created. Target disk locked in read-only write-blocker mode.'),
        ('COC-003', 'CFX-EV-0001', 'CFX-2026-001', '2026-09-08 10:02:18', 'Primary SHA-256 Hash Generated & Cryptographically Anchored', 'Automated Integrity Engine', 'CFX Hashing Service', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, 'SHA-256 calculated over entire 4,294,967,296 bytes. Legacy MD5 also computed for court registry.'),
        ('COC-004', 'CFX-EV-0001', 'CFX-2026-001', '2026-09-08 10:03:05', 'Working Forensic Copy Generated — Master Image Preserved Read-Only', 'Forensic Analyst R. Verma', 'CFX Workstation #4', 'COPY-HASH-VERIFIED-OK', 1, 'Master raw image marked chmod 0400. All subsequent operations performed on isolated working clone.')
    ]
    cursor.executemany("""
    INSERT INTO chain_of_custody (id, evidence_id, case_id, timestamp, action, actor, system, hash_reference, integrity_verified, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, custody_entries)

    # 3. Device Fingerprint
    methods = [
        {"name": "File signature (Magic Bytes)", "description": "Matched vendor header 0x484B5653 ('HKVS') at offset 0x00000000", "confidence": 95, "detected": True},
        {"name": "Container characteristics", "description": "Proprietary indexed stream wrapper with 512-byte sector interleaving", "confidence": 90, "detected": True},
        {"name": "Metadata inspection", "description": "Channel descriptor tables and OSD text streams discovered in frame headers", "confidence": 85, "detected": True},
        {"name": "Known device patterns", "description": "Corresponds to Hikvision DS-7200 series embedded Linux DVR firmware v3.4.8", "confidence": 80, "detected": True}
    ]
    cursor.execute("""
    INSERT INTO devices (id, evidence_id, manufacturer, device_type, model_family, storage_structure, codec, channels, metadata_status, detection_confidence, signature_hex, signature_description, vendor_match, detection_methods_json, disclaimer)
    VALUES (
        'DEV-HIK-8804',
        'CFX-EV-0001',
        'Hikvision',
        'DVR/NVR',
        'DS-7200 / DS-7600 Family',
        'Proprietary DVR (Sector-Indexed Stream)',
        'H.264 / AVC Main@L4.1',
        16,
        'Available',
        87,
        '48 4B 56 53 01 00 00 00 10 00 00 00',
        'Vendor ASCII Magic Token [HKVS] + 16 Channel Stream Manifest Table',
        'Hikvision Embedded Digital Video Recorder Architecture',
        ?,
        'PROTOTYPE DETECTION: Automated fingerprinting correlates binary signatures and container metrics with signature repository. Does not replace physical hardware examination.'
    );
    """, (json.dumps(methods),))

    # 4. Video Metadata
    raw_meta = {
        "format": {
            "filename": "DVR_01.bin (Working Copy)",
            "nb_streams": 2,
            "nb_programs": 0,
            "format_name": "h264/raw_stream",
            "format_long_name": "raw H.264 video",
            "start_time": "09:00:00.000000",
            "duration": "02:14:36.000000",
            "size": "4294967296",
            "bit_rate": "4251820"
        },
        "streams": [
            {
                "index": 0,
                "codec_name": "h264",
                "codec_long_name": "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
                "profile": "Main",
                "codec_type": "video",
                "width": 1920,
                "height": 1080,
                "r_frame_rate": "25/1",
                "avg_frame_rate": "25/1",
                "nb_frames": "201900",
                "pix_fmt": "yuv420p"
            },
            {
                "index": 1,
                "codec_name": "g711a",
                "codec_long_name": "PCM A-law",
                "codec_type": "audio",
                "sample_rate": "8000",
                "channels": 1
            }
        ]
    }
    cursor.execute("""
    INSERT INTO video_metadata (evidence_id, codec, profile, resolution, width, height, fps, duration, duration_seconds, frame_count, audio_presence, container, bitrate, color_space, pixel_format, scan_type, raw_json)
    VALUES (
        'CFX-EV-0001',
        'H.264',
        'Main@L4.1',
        '1920 × 1080',
        1920,
        1080,
        25.0,
        '02:14:36',
        8076.0,
        201900,
        'Present',
        'Proprietary DVR Stream Container (.bin / raw slice)',
        '4.25 Mbps',
        'bt709',
        'yuv420p',
        'Progressive',
        ?
    );
    """, (json.dumps(raw_meta),))

    # 5. Recordings
    recordings_data = [
        ('REC-001', 'CFX-EV-0001', 'CAM-01', 'Camera 01', '09:00:00', '09:42:18', 32400, 34938, '42m 18s', 2538, 'Recovered', 134580000, 'H.264', 1),
        ('REC-002', 'CFX-EV-0001', 'CAM-01', 'Camera 01', '09:57:43', '10:31:20', 35863, 37880, '33m 37s', 2017, 'Recovered', 106800000, 'H.264', 1),
        ('REC-003', 'CFX-EV-0001', 'CAM-02', 'Camera 02', '09:05:12', '10:35:21', 32712, 38121, '1h 30m', 5409, 'Recovered', 286500000, 'H.264', 1),
        ('REC-004', 'CFX-EV-0001', 'CAM-03', 'Camera 03', '09:00:00', '10:30:00', 32400, 37800, '1h 30m', 5400, 'Recovered', 270000000, 'H.264', 0),
        ('REC-005', 'CFX-EV-0001', 'CAM-04', 'Camera 04', '09:10:00', '10:32:00', 33000, 37920, '1h 22m', 4920, 'Recovered', 246000000, 'H.264', 1),
        ('REC-006', 'CFX-EV-0001', 'CAM-01', 'Camera 01', '10:32:00', '10:35:10', 37920, 38110, '3m 10s', 190, 'Corrupted', 9500000, 'H.264', 0),
        ('REC-007', 'CFX-EV-0001', 'CAM-05', 'Camera 05', '09:15:00', '09:18:22', 33300, 33502, '3m 22s', 202, 'Corrupted', 10100000, 'H.264', 0),
        ('REC-008', 'CFX-EV-0001', 'CAM-08', 'Camera 08', '09:40:00', '09:41:30', 34800, 34890, '1m 30s', 90, 'Corrupted', 4500000, 'H.264', 0),
    ]
    cursor.executemany("""
    INSERT INTO recordings (id, evidence_id, camera_id, camera_name, start_time, end_time, start_seconds, end_seconds, duration, duration_seconds, status, size_bytes, codec, has_audio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, recordings_data)

    # 6. Recording Gaps
    gap_causes = [
        "Recorder power interruption or ungraceful shutdown",
        "Storage medium write buffer saturation or bad sector skip",
        "Motion-detection schedule boundary transition",
        "Camera video signal loss / IP network disconnection",
        "Manual intervention / physical tamper with camera line or DVR unit",
        "Firmware watchdog reset cycle"
    ]
    cursor.execute("""
    INSERT INTO recording_gaps (id, evidence_id, camera_id, camera_name, gap_start, gap_end, gap_start_seconds, gap_end_seconds, duration, duration_seconds, classification, prior_segment_end, next_segment_start, possible_causes_json, forensic_note)
    VALUES (
        'GAP-001',
        'CFX-EV-0001',
        'CAM-01',
        'Camera 01',
        '09:42:18',
        '09:57:43',
        34938,
        35863,
        '15m 25s',
        925.0,
        'REVIEW REQUIRED',
        '09:42:18 (Segment REC-001)',
        '09:57:43 (Segment REC-002)',
        ?,
        'FORENSIC ASSESSMENT: A 15m 25s discontinuity was detected between sequential recording blocks on Camera 01 (Warehouse Main Loading Dock). Never automatically classify a recording gap as intentional evidence tampering without corroborating sensor, system power log, or audit records. Review requires correlation with facility electrical logs and physical access telemetry.'
    );
    """, (json.dumps(gap_causes),))

    # 7. Timestamp Checks
    offsets = {"osdVsMeta": 15, "metaVsFs": 16, "osdVsFs": 1}
    cursor.execute("""
    INSERT INTO timestamp_checks (id, evidence_id, camera_name, frame_index, recorded_time_str, osd_timestamp, metadata_timestamp, filesystem_timestamp, max_diff_seconds, status, severity, explanation, offset_details_json)
    VALUES 
    (
        'TS-001',
        'CFX-EV-0001',
        'Camera 02',
        152200,
        '10:15:32',
        '10:15:32',
        '10:15:47',
        '10:15:31',
        15.0,
        'TIMESTAMP INCONSISTENCY',
        'warning',
        'The observed difference may result from recorder clock drift, timezone configuration, metadata differences or other evidence conditions. It is not by itself proof of tampering.',
        ?
    ),
    (
        'TS-002',
        'CFX-EV-0001',
        'Camera 01',
        75000,
        '09:30:00',
        '09:30:00',
        '09:30:01',
        '09:30:00',
        1.0,
        'CONSISTENT',
        'healthy',
        'OSD text overlay and container stream timestamps align within standard sub-second tolerance limits.',
        '{"osdVsMeta": 1, "metaVsFs": 0, "osdVsFs": 1}'
    ),
    (
        'TS-003',
        'CFX-EV-0001',
        'Camera 03',
        110000,
        '09:55:10',
        '09:55:10',
        '09:55:14',
        '09:55:09',
        4.0,
        'CLOCK DRIFT OBSERVED',
        'warning',
        'Mild internal RTC crystal clock drift detected over 4-hour continuous surveillance window.',
        '{"osdVsMeta": 4, "metaVsFs": 5, "osdVsFs": 1}'
    );
    """, (json.dumps(offsets),))

    # 8. Timeline Events
    events_data = [
        ('EVT-101', 'CFX-EV-0001', 'Camera 01', 'CAM-01', '09:12:30', 33150, 'Vehicle', 94.2, 'White Delivery Van (License KA-04-E-2190) entered loading bay gate', 'AI (YOLO/PyTorch)', 'normal'),
        ('EVT-102', 'CFX-EV-0001', 'Camera 03', 'CAM-03', '09:20:15', 33615, 'Person', 91.8, 'Individual in blue overalls carrying shipping manifest clipboard', 'AI (YOLO/PyTorch)', 'normal'),
        ('EVT-103', 'CFX-EV-0001', 'Camera 01', 'CAM-01', '09:42:18', 34938, 'Recording Gap', 100.0, 'DISCONTINUITY START: Stream abruptly halted at 09:42:18 (Duration: 15m 25s)', 'Forensic Continuity Engine', 'warning'),
        ('EVT-104', 'CFX-EV-0001', 'Camera 02', 'CAM-02', '09:45:00', 35100, 'Door Breach', 88.5, 'Secondary emergency exit rear sensor contact alert logged', 'Sensor Log', 'anomaly'),
        ('EVT-105', 'CFX-EV-0001', 'Camera 04', 'CAM-04', '09:52:10', 35530, 'Person', 92.4, 'Unidentified individual traversing rear corridor toward electrical junction', 'AI (YOLO/PyTorch)', 'warning'),
        ('EVT-106', 'CFX-EV-0001', 'Camera 01', 'CAM-01', '09:57:43', 35863, 'Recording Gap', 100.0, 'DISCONTINUITY END: Video feed resumed at 09:57:43 (New segment REC-002)', 'Forensic Continuity Engine', 'normal'),
        ('EVT-107', 'CFX-EV-0001', 'Camera 02', 'CAM-02', '10:14:32', 36872, 'Vehicle', 94.0, 'Dark sedan idling in visitor holding lane', 'AI (YOLO/PyTorch)', 'normal'),
        ('EVT-108', 'CFX-EV-0001', 'Camera 02', 'CAM-02', '10:15:32', 36932, 'Timestamp Anomaly', 96.0, 'Discrepancy of 15s between OSD (10:15:32) and container metadata (10:15:47)', 'Metadata Parser', 'warning'),
        ('EVT-109', 'CFX-EV-0001', 'Camera 02', 'CAM-02', '10:21:07', 37267, 'Person', 91.0, 'Two individuals meeting near dock staircase 3', 'AI (YOLO/PyTorch)', 'normal')
    ]
    cursor.executemany("""
    INSERT INTO timeline_events (id, evidence_id, camera_name, camera_id, timestamp, time_seconds, event_type, confidence, details, source, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, events_data)

    # 9. AI Detections
    ai_data = [
        ('AI-001', 'CFX-EV-0001', 'Camera 01', '10:14:32', 36872, 'VEHICLE', 94.0, '{"x": 120, "y": 240, "w": 480, "h": 260}', 'Commercial delivery vehicle stationary in bay 4', 1),
        ('AI-002', 'CFX-EV-0001', 'Camera 02', '10:21:07', 37267, 'PERSON', 91.0, '{"x": 540, "y": 310, "w": 140, "h": 320}', 'Subject detected entering pedestrian gate', 1),
        ('AI-003', 'CFX-EV-0001', 'Camera 01', '09:12:30', 33150, 'VEHICLE', 96.5, '{"x": 200, "y": 180, "w": 520, "h": 310}', 'White Cargo Van ingress at main checkpoint', 1),
        ('AI-004', 'CFX-EV-0001', 'Camera 04', '09:52:10', 35530, 'PERSON', 92.4, '{"x": 380, "y": 290, "w": 110, "h": 280}', 'Subject moving across rear perimeter zone', 0),
        ('AI-005', 'CFX-EV-0001', 'Camera 03', '09:20:15', 33615, 'PERSON', 91.8, '{"x": 410, "y": 200, "w": 130, "h": 350}', 'Warehouse staff member with safety helmet', 1),
        ('AI-006', 'CFX-EV-0001', 'Camera 02', '09:45:00', 35100, 'MOVEMENT', 89.2, '{"x": 50, "y": 100, "w": 600, "h": 400}', 'Sudden optical flow differential at emergency doorway', 0),
        ('AI-007', 'CFX-EV-0001', 'Camera 01', '10:28:45', 37725, 'OBJECT', 87.4, '{"x": 710, "y": 420, "w": 90, "h": 85}', 'Unattended luggage / toolbox near bay pillar', 0)
    ]
    cursor.executemany("""
    INSERT INTO ai_detections (id, evidence_id, camera, timestamp, time_seconds, label, confidence, bounding_box_json, notes, verified_by_analyst)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, ai_data)

    conn.commit()
    conn.close()
    print("DEMO DATA SEEDED SUCCESSFULLY")

if __name__ == "__main__":
    init_db()
    seed_demo_data()
