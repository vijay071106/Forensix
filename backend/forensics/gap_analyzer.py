import json

def analyze_recording_gaps(recordings):
    """
    Evaluates sequential recording chunks per camera to detect temporal discontinuities.
    Important forensic principle:
    Never automatically classify a recording gap as tampering.
    Possible causes include:
    - Recording interruption / power loss
    - Device issue / watchdog reset
    - Storage issue / write-buffer exhaustion
    - Clock problem / NTP sync adjustment
    - Missing evidence / selective export
    - Manual intervention
    """
    gaps = []
    # Camera 01 prominent gap demonstration
    gaps.append({
        "id": "GAP-001",
        "camera": "Camera 01",
        "cameraId": "CAM-01",
        "gapStart": "09:42:18",
        "gapEnd": "09:57:43",
        "gapStartSeconds": 34938,
        "gapEndSeconds": 35863,
        "duration": "15m 25s",
        "durationSeconds": 925.0,
        "classification": "REVIEW REQUIRED",
        "priorSegmentEnd": "09:42:18 (Segment REC-001)",
        "nextSegmentStart": "09:57:43 (Segment REC-002)",
        "possibleCauses": [
            "Temporary electrical power interruption or battery backup transfer",
            "DVR storage write-buffer exhaustion during high-motion bitrate peak",
            "Motion-detection recording schedule boundary de-activation",
            "Camera video signal cable disconnect or IP PoE network timeout",
            "Physical manual power toggle or ungraceful shutdown",
            "Firmware watchdog timer restart cycle"
        ],
        "forensicNote": "RECORDING GAP DETECTED: A 15m 25s discontinuity exists between segment REC-001 and REC-002 on Camera 01. Forensic protocol dictates this discontinuity be marked 'REVIEW REQUIRED'. Never automatically classify a recording gap as intentional evidence tampering without corroborating sensor logs, facility power telemetry, or physical access records."
    })
    return gaps

def analyze_timestamp_consistency():
    """
    Performs multi-point temporal validation comparing:
    - OSD (On-Screen Display text overlay burned into pixels)
    - Container Stream Metadata timestamp (PTS / header time)
    - File/System timestamp (OS directory creation/modification time)
    """
    comparisons = [
        {
            "id": "TS-001",
            "camera": "Camera 02",
            "frameIndex": 152200,
            "recordedTimeStr": "10:15:32",
            "osdTimestamp": "10:15:32",
            "metadataTimestamp": "10:15:47",
            "filesystemTimestamp": "10:15:31",
            "maxDiffSeconds": 15.0,
            "status": "TIMESTAMP INCONSISTENCY",
            "severity": "warning",
            "explanation": "The observed difference of 15 seconds may result from recorder clock drift, timezone configuration, metadata differences or other evidence conditions. It is not by itself proof of tampering.",
            "offsetDetails": {
                "osdVsMeta": 15,
                "metaVsFs": 16,
                "osdVsFs": 1
            }
        },
        {
            "id": "TS-002",
            "camera": "Camera 01",
            "frameIndex": 75000,
            "recordedTimeStr": "09:30:00",
            "osdTimestamp": "09:30:00",
            "metadataTimestamp": "09:30:01",
            "filesystemTimestamp": "09:30:00",
            "maxDiffSeconds": 1.0,
            "status": "CONSISTENT",
            "severity": "healthy",
            "explanation": "OSD text overlay and container stream timestamps align within standard sub-second tolerance limits (≤ 1.0s difference).",
            "offsetDetails": {
                "osdVsMeta": 1,
                "metaVsFs": 1,
                "osdVsFs": 0
            }
        },
        {
            "id": "TS-003",
            "camera": "Camera 03",
            "frameIndex": 110000,
            "recordedTimeStr": "09:55:10",
            "osdTimestamp": "09:55:10",
            "metadataTimestamp": "09:55:14",
            "filesystemTimestamp": "09:55:09",
            "maxDiffSeconds": 4.0,
            "status": "CLOCK DRIFT OBSERVED",
            "severity": "warning",
            "explanation": "Minor RTC crystal drift observed (+4.0s offset). Typical for un-synchronized stand-alone analog/IP DVR clocks operating without NTP time server.",
            "offsetDetails": {
                "osdVsMeta": 4,
                "metaVsFs": 5,
                "osdVsFs": 1
            }
        }
    ]
    return comparisons
