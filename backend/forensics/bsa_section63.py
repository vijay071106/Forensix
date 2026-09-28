import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_bsa_section63_pdf(output_path: str, case_info: dict, evidence_info: dict, device_info: dict, examiner_name: str = "Forensic Specialist R. Verma", designation: str = "Digital Evidence Custodian / Senior Examiner"):
    """
    Generates a formal Bharatiya Sakshya Adhiniyam (BSA), 2023 - Section 63
    Electronic Record Admissibility Certificate Draft using ReportLab.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'BSATitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        alignment=1, # Center
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=2
    )
    legal_subtitle_style = ParagraphStyle(
        'BSASubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        alignment=1, # Center
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=10
    )
    section_heading = ParagraphStyle(
        'BSAHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BSABody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    disclaimer_box = ParagraphStyle(
        'BSADisclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#991B1B')
    )

    story = []

    # Legal Title
    story.append(Paragraph("SCHEDULE / CERTIFICATE UNDER SECTION 63", title_style))
    story.append(Paragraph("OF THE BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023", legal_subtitle_style))
    story.append(Paragraph("<i>(Corresponding to Section 65B of the repealed Indian Evidence Act, 1872)</i>", ParagraphStyle('subsub', parent=styles['Normal'], fontSize=8.5, alignment=1, textColor=colors.HexColor('#475569'), spaceAfter=8)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F172A'), spaceBefore=2, spaceAfter=8))

    # Prominent Admissibility Disclaimer Box
    disclaimer_text = (
        "<b>MANDATORY STATUTORY NOTICE & LEGAL DISCLAIMER:</b><br/>"
        "This document is generated as a <b>BSA Section 63-Aligned Evidence Package / Certificate Draft</b>. "
        "The software assists investigators in gathering and preparing technical forensic documentation. "
        "This certificate draft does <b>NOT</b> constitute automatic judicial admissibility. Legal admissibility "
        "depends on applicable laws of evidence, proper procedural compliance, physical custody seals, and execution "
        "by the authorized person occupying an official position in relation to the relevant device."
    )
    t_disc = Table([[Paragraph(disclaimer_text, disclaimer_box)]], colWidths=[530])
    t_disc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#DC2626')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_disc)
    story.append(Spacer(1, 8))

    # Part A: Identification of Electronic Record
    story.append(Paragraph("PART A — IDENTIFICATION OF THE ELECTRONIC RECORD & COMPUTER SYSTEM", section_heading))
    part_a_data = [
        [Paragraph("<b>1. Case Identifier:</b>", body_style), Paragraph(f"{case_info.get('id', 'CFX-2026-001')} — {case_info.get('name', 'Warehouse CCTV Investigation')}", body_style)],
        [Paragraph("<b>2. Evidence Record ID:</b>", body_style), Paragraph(f"{evidence_info.get('id', 'CFX-EV-0001')} ({evidence_info.get('filename', 'DVR_01.bin')})", body_style)],
        [Paragraph("<b>3. Description of Device:</b>", body_style), Paragraph(f"16-Channel Standalone Surveillance System ({device_info.get('manufacturer', 'Hikvision')} {device_info.get('modelFamily', 'DS-7200 Series')})", body_style)],
        [Paragraph("<b>4. Device Serial / UUID:</b>", body_style), Paragraph(device_info.get("id", "DEV-HIK-8804-SN90218"), body_style)],
        [Paragraph("<b>5. Storage Medium:</b>", body_style), Paragraph("SATA Hard Disk Drive (Physical Master Raw Disk Bit-Stream Dump)", body_style)],
        [Paragraph("<b>6. Acquisition Timestamp:</b>", body_style), Paragraph(evidence_info.get("acquisitionTimestamp", "2026-09-08 09:14:22 UTC"), body_style)]
    ]
    t_part_a = Table(part_a_data, colWidths=[160, 370])
    t_part_a.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_part_a)
    story.append(Spacer(1, 8))

    # Part B: Conditions Specified under Section 63(2) of BSA, 2023
    story.append(Paragraph("PART B — STATUTORY CONDITIONS UNDER SECTION 63(2)", section_heading))
    statutory_text = (
        "1. The electronic record containing the CCTV surveillance footage was produced by the computer system / DVR unit "
        "during the period over which the computer was used regularly to store and process digital video recordings for the "
        "purposes of ongoing security activities regularly carried on by the management.<br/>"
        "2. During the said period, information of the kind contained in the electronic record was regularly fed into the "
        "computer system in the ordinary course of the said activities.<br/>"
        "3. Throughout the material part of the said period, the computer / DVR system was operating properly; or, if not, "
        "any respect in which it was not operating properly or was out of operation during that part of the period was not such "
        "as to affect the electronic record or the accuracy of its contents.<br/>"
        "4. The information contained in the electronic record reproduces or is derived from such information fed into the "
        "computer in the ordinary course of the said activities."
    )
    story.append(Paragraph(statutory_text, body_style))
    story.append(Spacer(1, 8))

    # Part C: Hash Integrity & Cryptographic Seal
    story.append(Paragraph("PART C — HASH INTEGRITY & CRYPTOGRAPHIC SEAL", section_heading))
    hash_data = [
        [Paragraph("<b>Primary Algorithm:</b>", body_style), Paragraph("<b>SHA-256 (NIST FIPS PUB 180-4 Standard)</b>", body_style)],
        [Paragraph("<b>SHA-256 Hash Digest:</b>", body_style), Paragraph(f"<b>{evidence_info.get('sha256', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}</b>", ParagraphStyle('CodeSmall', parent=styles['Normal'], fontName='Courier', fontSize=7.5))],
        [Paragraph("<b>Legacy Compatibility Hash:</b>", body_style), Paragraph(f"MD5: {evidence_info.get('legacyMd5', 'd41d8cd98f00b204e9800998ecf8427e')} <i>(Maintained for legacy registry reference only)</i>", body_style)],
        [Paragraph("<b>Forensic Safeguard:</b>", body_style), Paragraph("Hardware write-blocker utilized during raw sector imaging. Master image marked immutable. Analysis performed strictly on working clone.", body_style)]
    ]
    t_hash = Table(hash_data, colWidths=[160, 370])
    t_hash.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_hash)
    story.append(Spacer(1, 8))

    # Part D: Signatory Verification & Attestation
    story.append(Paragraph("PART D — DECLARATION & ATTESTATION BY RESPONSIBLE OFFICER", section_heading))
    declaration_text = (
        f"I, <b>{examiner_name}</b>, holding the official position of <b>{designation}</b>, do hereby solemnly declare "
        "and affirm that the contents of this Certificate are true and correct to the best of my knowledge and belief, based upon "
        "the computerized records and forensic examination performed using recognized digital-forensics procedures."
    )
    story.append(Paragraph(declaration_text, body_style))
    story.append(Spacer(1, 10))

    sig_data = [
        [
            Paragraph("<b>OFFICIAL SEAL / STAMP:</b><br/><br/><br/>[ DIGITAL FORENSICS UNIT STAMP ]", body_style),
            Paragraph(f"<b>SIGNATURE OF RESPONSIBLE OFFICER:</b><br/><br/>____________________________________<br/>Name: {examiner_name}<br/>Designation: {designation}<br/>Date: {datetime.now().strftime('%d-%b-%Y')}", body_style)
        ]
    ]
    t_sig = Table(sig_data, colWidths=[240, 290])
    t_sig.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sig)

    doc.build(story)
    return output_path
