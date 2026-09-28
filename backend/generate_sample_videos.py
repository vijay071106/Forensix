import os
import subprocess
import sys

def generate_videos():
    public_dir = os.path.join(os.getcwd(), "public")
    samples_dir = os.path.join(public_dir, "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    if not os.path.exists(font_path):
        font_path = "sans"

    print("[CFX Video Generator] Generating authentic CCTV sample videos for evaluators...")

    # 1. Camera 01 - Gate West (Vehicle Ingress - 24s)
    cam1_path = os.path.join(samples_dir, "sample_cctv_camera01_gate.mp4")
    print(f"Generating {cam1_path}...")
    
    vf_cam1 = (
        # Background & warehouse landscape
        "color=c=0x151b24:s=1280x720:d=24:r=25[bg];"
        # Sky/distant facility horizon
        "[bg]drawbox=x=0:y=0:w=1280:h=260:color=0x0f141c@1:t=fill[sky];"
        "[sky]drawbox=x=80:y=90:w=320:h=170:color=0x1e2733@1:t=fill,"
        "drawbox=x=440:y=60:w=480:h=200:color=0x18202b@1:t=fill,"
        "drawbox=x=960:y=110:w=260:h=150:color=0x1e2733@1:t=fill[buildings];"
        # Asphalt Ground & road markings
        "[buildings]drawbox=x=0:y=260:w=1280:h=460:color=0x222a36@1:t=fill[ground];"
        "[ground]drawbox=x=0:y=400:w=1280:h=320:color=0x181d24@1:t=fill[road];"
        "[road]drawbox=x=0:y=390:w=1280:h=12:color=0x38bdf8@0.7:t=fill[curb];"
        # Lane divider dashes
        "[curb]drawbox=x=100:y=560:w=100:h=10:color=0xf59e0b@0.8:t=fill,"
        "drawbox=x=320:y=560:w=100:h=10:color=0xf59e0b@0.8:t=fill,"
        "drawbox=x=540:y=560:w=100:h=10:color=0xf59e0b@0.8:t=fill,"
        "drawbox=x=760:y=560:w=100:h=10:color=0xf59e0b@0.8:t=fill,"
        "drawbox=x=980:y=560:w=100:h=10:color=0xf59e0b@0.8:t=fill[lanes];"
        # Security Guard Checkpoint Booth & Barrier Base
        "[lanes]drawbox=x=640:y=280:w=120:h=140:color=0x334155@1:t=fill,"
        "drawbox=x=660:y=300:w=80:h=60:color=0x0ea5e9@0.5:t=fill,"
        "drawbox=x=600:y=370:w=30:h=90:color=0xf97316@1:t=fill[booth];"
        # Barrier Gate Arm: down from t=0 to t=8, rises t=8 to t=13, open t=13 to 24
        "[booth]drawbox=x=340:y='if(lte(t,8),415,if(lte(t,13),415-(t-8)*18,325))':"
        "w=260:h=14:color=0xef4444@0.9:t=fill[gate];"
        # Moving White Delivery Truck (Truck halts t=7 to t=12 at gate, then proceeds)
        # Position: t=0-7: x=-200+t*80 (stops at ~360), t=7-12: stays at 360, t=12-24: moves 360+(t-12)*75
        "[gate]drawbox=x='if(lte(t,7),-200+t*80,if(lte(t,12),360,360+(t-12)*75))':"
        "y=430:w=260:h=130:color=0xf8fafc@1:t=fill,"
        "drawbox=x='if(lte(t,7),-200+t*80,if(lte(t,12),360,360+(t-12)*75))+230':"
        "y=460:w=80:h=100:color=0x0284c7@1:t=fill,"
        # Cab window
        "drawbox=x='if(lte(t,7),-200+t*80,if(lte(t,12),360,360+(t-12)*75))+250':"
        "y=475:w=50:h=45:color=0x0f172a@0.9:t=fill,"
        # Wheels
        "drawbox=x='if(lte(t,7),-200+t*80,if(lte(t,12),360,360+(t-12)*75))+40':"
        "y=550:w=50:h=30:color=0x090d16@1:t=fill,"
        "drawbox=x='if(lte(t,7),-200+t*80,if(lte(t,12),360,360+(t-12)*75))+240':"
        "y=550:w=50:h=30:color=0x090d16@1:t=fill[vehicle];"
        # AI Detection Bounding Box on Target Truck
        "[vehicle]drawbox=x='if(lte(t,7),-210+t*80,if(lte(t,12),350,350+(t-12)*75))':"
        "y=420:w=330:h=170:color=0x10b981@0.8:t=3,"
        "drawtext=fontfile=" + font_path + ":"
        "text='[AI] TRUCK MH-04-AX-9122 (94.2%)':"
        "x='if(lte(t,7),-210+t*80,if(lte(t,12),350,350+(t-12)*75))':"
        "y=395:fontsize=15:fontcolor=0x10b981:box=1:boxcolor=0x022c22@0.8:boxborderw=3[annotated];"
        # Burned-in Forensic CCTV OSD
        "[annotated]drawtext=fontfile=" + font_path + ":"
        "text='CAM-01 [GATE WEST]  %{pts\\:localtime\\:1773134050} UTC  FRM\\: %{eif\\:21500+n\\:d\\:6}':"
        "x=25:y=25:fontsize=20:fontcolor=0xf8fafc:box=1:boxcolor=0x000000@0.75:boxborderw=6,"
        # REC status indicator (blinking red circle)
        "drawtext=fontfile=" + font_path + ":"
        "text='REC %{eif\\:mod(t*2,2)\\:d}':"
        "x=1160:y=25:fontsize=18:fontcolor=0xef4444:box=1:boxcolor=0x000000@0.75:boxborderw=6,"
        # Forensic Bit-Stream info footer
        "drawtext=fontfile=" + font_path + ":"
        "text='CCTV FORENSIX REPLAY | EVIDENCE CFX-EV-0001 | H.264 AVC1 1080p | SHA-256 HASH VERIFIED':"
        "x=25:y=675:fontsize=15:fontcolor=0x38bdf8:box=1:boxcolor=0x000000@0.75:boxborderw=5"
    )

    cmd_cam1 = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", vf_cam1,
        "-f", "lavfi", "-i", "sine=frequency=440:duration=24",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k",
        cam1_path
    ]
    subprocess.run(cmd_cam1, check=True)
    print("Camera 01 video created!")

    # 2. Camera 02 - Loading Dock Bay 3 (+15s Clock Drift demonstration - 16s)
    cam2_path = os.path.join(samples_dir, "sample_cctv_camera02_dock.mp4")
    print(f"Generating {cam2_path}...")
    
    vf_cam2 = (
        "color=c=0x181c22:s=1280x720:d=16:r=25[bg];"
        # Loading Dock interior concrete wall & Bay 3 roll-up door
        "[bg]drawbox=x=0:y=0:w=1280:h=480:color=0x262e3b@1:t=fill[wall];"
        "[wall]drawbox=x=120:y=120:w=420:h=360:color=0x475569@1:t=fill,"
        "drawbox=x=680:y=120:w=480:h=360:color=0x334155@1:t=fill[bays];"
        # Shutter lines on Bay 3
        "[bays]drawbox=x=690:y=140:w=460:h=20:color=0x1e293b@1:t=fill,"
        "drawbox=x=690:y=180:w=460:h=20:color=0x1e293b@1:t=fill,"
        "drawbox=x=690:y=220:w=460:h=20:color=0x1e293b@1:t=fill,"
        "drawbox=x=690:y=260:w=460:h=20:color=0x1e293b@1:t=fill,"
        "drawbox=x=690:y=300:w=460:h=20:color=0x1e293b@1:t=fill[shutters];"
        # Floor with forklift tracks
        "[shutters]drawbox=x=0:y=480:w=1280:h=240:color=0x0f172a@1:t=fill[floor];"
        "[floor]drawbox=x=200:y=520:w=880:h=12:color=0xfacc15@0.8:t=fill,"
        "drawbox=x=200:y=620:w=880:h=12:color=0xfacc15@0.8:t=fill[stripes];"
        # Pallet stack
        "[stripes]drawbox=x=160:y=380:w=140:h=100:color=0xb45309@1:t=fill,"
        "drawbox=x=180:y=320:w=100:h=60:color=0xd97706@1:t=fill[pallets];"
        # Motion Activity Box near Shutter 3 (active t=5 to t=12)
        "[pallets]drawbox=x=750:y=240:w='if(between(t,5,12),280,0)':h='if(between(t,5,12),200,0)':color=0xf59e0b@0.9:t=3,"
        "drawtext=fontfile=" + font_path + ":"
        "text='[AI MOTION] ABRUPT OPTICAL FLOW SHUTTER 3 (89.1%)':"
        "x=750:y='if(between(t,5,12),215,-100)':fontsize=14:fontcolor=0xf59e0b:box=1:boxcolor=0x451a03@0.8:boxborderw=3[motion];"
        # OSD showing intentional +15.00s Clock Drift vs NTP
        "[motion]drawtext=fontfile=" + font_path + ":"
        "text='CAM-02 [LOADING DOCK BAY 3]  %{pts\\:localtime\\:1773136090} UTC  FRM\\: %{eif\\:58200+n\\:d\\:6}':"
        "x=25:y=25:fontsize=20:fontcolor=0xf8fafc:box=1:boxcolor=0x000000@0.75:boxborderw=6,"
        # Burned-in warning for evaluators
        "drawtext=fontfile=" + font_path + ":"
        "text='CLOCK STATUS\\: +15.00s INTERNAL DRIFT DETECTED (OSD DESYNC vs GPS NTP)':"
        "x=25:y=675:fontsize=15:fontcolor=0xf59e0b:box=1:boxcolor=0x000000@0.85:boxborderw=5"
    )

    cmd_cam2 = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", vf_cam2,
        "-f", "lavfi", "-i", "sine=frequency=330:duration=16",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k",
        cam2_path
    ]
    subprocess.run(cmd_cam2, check=True)
    print("Camera 02 video created!")

    # 3. Camera 03 - Perimeter Fence (Pedestrian Traversing - 16s)
    cam3_path = os.path.join(samples_dir, "sample_cctv_camera03_perimeter.mp4")
    print(f"Generating {cam3_path}...")
    
    vf_cam3 = (
        # Infrared night mode monochrome palette
        "color=c=0x111612:s=1280x720:d=16:r=25[bg];"
        # Ground and fence line
        "[bg]drawbox=x=0:y=0:w=1280:h=340:color=0x0a0d0b@1:t=fill[nightsky];"
        "[nightsky]drawbox=x=0:y=340:w=1280:h=380:color=0x1c241e@1:t=fill[gravel];"
        # Fence Posts & Mesh
        "[gravel]drawbox=x=160:y=220:w=12:h=220:color=0x64748b@1:t=fill,"
        "drawbox=x=360:y=220:w=12:h=220:color=0x64748b@1:t=fill,"
        "drawbox=x=560:y=220:w=12:h=220:color=0x64748b@1:t=fill,"
        "drawbox=x=760:y=220:w=12:h=220:color=0x64748b@1:t=fill,"
        "drawbox=x=960:y=220:w=12:h=220:color=0x64748b@1:t=fill,"
        "drawbox=x=1160:y=220:w=12:h=220:color=0x64748b@1:t=fill,"
        "drawbox=x=0:y=240:w=1280:h=6:color=0x475569@0.9:t=fill,"
        "drawbox=x=0:y=320:w=1280:h=6:color=0x475569@0.9:t=fill,"
        "drawbox=x=0:y=420:w=1280:h=6:color=0x475569@0.9:t=fill[fence];"
        # Person in dark jacket traversing from right to left: t=0-16s x=1100-t*55
        "[fence]drawbox=x='1100-t*55':y=360:w=32:h=32:color=0xf1f5f9@1:t=fill,"
        "drawbox=x='1095-t*55':y=390:w=42:h=75:color=0x1e293b@1:t=fill,"
        "drawbox=x='1100-t*55':y=465:w=14:h=60:color=0x0f172a@1:t=fill,"
        "drawbox=x='1120-t*55':y=465:w=14:h=60:color=0x0f172a@1:t=fill[person];"
        # AI Detection Bounding Box on Pedestrian
        "[person]drawbox=x='1085-t*55':y=350:w=65:h=180:color=0x38bdf8@0.9:t=2,"
        "drawtext=fontfile=" + font_path + ":"
        "text='[AI] PERSON (91.4%)':"
        "x='1085-t*55':y=325:fontsize=14:fontcolor=0x38bdf8:box=1:boxcolor=0x082f49@0.8:boxborderw=3[annotated];"
        # OSD Thermal / IR Header
        "[annotated]drawtext=fontfile=" + font_path + ":"
        "text='CAM-03 [PERIMETER FENCE] (IR-NIGHT)  %{pts\\:localtime\\:1773136290} UTC  FRM\\: %{eif\\:77200+n\\:d\\:6}':"
        "x=25:y=25:fontsize=20:fontcolor=0x86efac:box=1:boxcolor=0x000000@0.75:boxborderw=6,"
        # Footer
        "drawtext=fontfile=" + font_path + ":"
        "text='SECTOR 4 PERIMETER SENSOR ACTIVE | THERMAL ENHANCEMENT FILTER':"
        "x=25:y=675:fontsize=15:fontcolor=0x86efac:box=1:boxcolor=0x000000@0.75:boxborderw=5"
    )

    cmd_cam3 = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", vf_cam3,
        "-f", "lavfi", "-i", "sine=frequency=220:duration=16",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k",
        cam3_path
    ]
    subprocess.run(cmd_cam3, check=True)
    print("Camera 03 video created!")

    # Copy primary demo to root public for evaluator convenience
    default_demo = os.path.join(public_dir, "sample_cctv_evaluator_demo.mp4")
    subprocess.run(["cp", cam1_path, default_demo], check=True)
    print(f"Default evaluator demo copied to {default_demo}")

    print("[CFX Video Generator] All evaluator sample videos successfully prepared!")

if __name__ == "__main__":
    generate_videos()
