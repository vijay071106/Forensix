import re

def parse_natural_language_query(query: str):
    """
    Parses investigator natural language requests into structured forensic query parameters:
    Examples:
    - 'Find vehicles between 10:00 and 11:00 near Camera 02'
    - 'Find people near Camera 02'
    - 'Find activity between 09:40 and 10:00'
    - 'Show all vehicles in Camera 01'
    """
    q = query.lower().strip()
    
    # Target object detection
    obj = None
    if "vehicle" in q or "car" in q or "van" in q or "truck" in q:
        obj = "VEHICLE"
    elif "person" in q or "people" in q or "man" in q or "individual" in q or "subject" in q:
        obj = "PERSON"
    elif "object" in q or "bag" in q or "box" in q or "item" in q:
        obj = "OBJECT"
    elif "motion" in q or "movement" in q or "activity" in q:
        obj = "MOVEMENT"

    # Camera detection
    camera = None
    cam_match = re.search(r"camera\s*0?(\d+)", q)
    if cam_match:
        cam_num = int(cam_match.group(1))
        camera = f"Camera {cam_num:02d}"
    elif "cam 1" in q or "cam 01" in q:
        camera = "Camera 01"
    elif "cam 2" in q or "cam 02" in q:
        camera = "Camera 02"

    # Time range detection
    start_time = None
    end_time = None
    
    # Search for patterns like 'between 10:00 and 11:00' or 'between 10 and 11'
    time_match = re.search(r"between\s+(\d{1,2}(?::\d{2})?)\s+and\s+(\d{1,2}(?::\d{2})?)", q)
    if time_match:
        t1, t2 = time_match.group(1), time_match.group(2)
        start_time = t1 if ":" in t1 else f"{int(t1):02d}:00:00"
        end_time = t2 if ":" in t2 else f"{int(t2):02d}:00:00"
    else:
        # Check single time references
        single_time = re.search(r"at\s+(\d{1,2}:\d{2})", q)
        if single_time:
            start_time = single_time.group(1)

    return {
        "rawQuery": query,
        "parsedTarget": {
            "object": obj or "ALL",
            "camera": camera or "ALL CAMERAS",
            "startTime": start_time or "09:00:00",
            "endTime": end_time or "11:00:00"
        },
        "disclaimer": "AI ANALYSIS PROTOTYPE: Query parameters derived via deterministic forensic regex tokenizer. Bounded to verified forensic time indices."
    }

def get_ai_detections(label_filter: str = None, camera_filter: str = None, start_time: str = None, end_time: str = None):
    """
    Returns AI detection events with confidence scores, bounding boxes, and camera assignments.
    """
    all_detections = [
        {
            "id": "AI-001",
            "camera": "Camera 01",
            "timestamp": "10:14:32",
            "timeSeconds": 36872,
            "label": "VEHICLE",
            "confidence": 94.0,
            "boundingBox": {"x": 120, "y": 240, "w": 480, "h": 260},
            "notes": "Commercial delivery van stationary in loading dock bay 4 with hazard lights on",
            "verifiedByAnalyst": True
        },
        {
            "id": "AI-002",
            "camera": "Camera 02",
            "timestamp": "10:21:07",
            "timeSeconds": 37267,
            "label": "PERSON",
            "confidence": 91.0,
            "boundingBox": {"x": 540, "y": 310, "w": 140, "h": 320},
            "notes": "Subject in dark jacket traversing pedestrian corridor toward administrative gate",
            "verifiedByAnalyst": True
        },
        {
            "id": "AI-003",
            "camera": "Camera 01",
            "timestamp": "09:12:30",
            "timeSeconds": 33150,
            "label": "VEHICLE",
            "confidence": 96.5,
            "boundingBox": {"x": 200, "y": 180, "w": 520, "h": 310},
            "notes": "White Cargo Van ingress at main entrance barrier gate",
            "verifiedByAnalyst": True
        },
        {
            "id": "AI-004",
            "camera": "Camera 04",
            "timestamp": "09:52:10",
            "timeSeconds": 35530,
            "label": "PERSON",
            "confidence": 92.4,
            "boundingBox": {"x": 380, "y": 290, "w": 110, "h": 280},
            "notes": "Unidentified individual traversing rear perimeter zone during Camera 01 outage window",
            "verifiedByAnalyst": False
        },
        {
            "id": "AI-005",
            "camera": "Camera 03",
            "timestamp": "09:20:15",
            "timeSeconds": 33615,
            "label": "PERSON",
            "confidence": 91.8,
            "boundingBox": {"x": 410, "y": 200, "w": 130, "h": 350},
            "notes": "Warehouse logistics personnel with high-visibility reflective vest",
            "verifiedByAnalyst": True
        },
        {
            "id": "AI-006",
            "camera": "Camera 02",
            "timestamp": "09:45:00",
            "timeSeconds": 35100,
            "label": "MOVEMENT",
            "confidence": 89.2,
            "boundingBox": {"x": 50, "y": 100, "w": 600, "h": 400},
            "notes": "Sudden dense optical-flow vector shift indicating rapid door opening",
            "verifiedByAnalyst": False
        },
        {
            "id": "AI-007",
            "camera": "Camera 01",
            "timestamp": "10:28:45",
            "timeSeconds": 37725,
            "label": "OBJECT",
            "confidence": 87.4,
            "boundingBox": {"x": 710, "y": 420, "w": 90, "h": 85},
            "notes": "Unattended dark metallic utility case deposited near structural pillar 4B",
            "verifiedByAnalyst": False
        }
    ]

    filtered = all_detections
    if label_filter and label_filter.upper() != "ALL":
        filtered = [d for d in filtered if d["label"] == label_filter.upper()]
    if camera_filter and camera_filter.upper() != "ALL CAMERAS":
        filtered = [d for d in filtered if camera_filter.lower() in d["camera"].lower()]

    return filtered
