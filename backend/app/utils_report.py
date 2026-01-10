from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from datetime import datetime
import os

def generate_audit_pdf(alerts, output_path):
    """
    Generates a government-grade audit report PDF.
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph("SentinelGov: National Procurement Integrity Shield", styles['Title']))
    elements.append(Paragraph(f"Official Audit Report - Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Heading2']))
    elements.append(Spacer(1, 12))

    # Disclaimer
    disclaimer_style = styles['Italic']
    disclaimer_text = "<b>LEGAL DISCLAIMER:</b> This report indicates elevated review priority and does not imply wrongdoing. It is an observational intelligence product designed for forensic audit support."
    elements.append(Paragraph(disclaimer_text, disclaimer_style))
    elements.append(Spacer(1, 24))

    # Alert Table
    data = [["ID", "Vendor", "Dept", "Amount", "Risk", "Trigger"]]
    for alert in alerts:
        data.append([
            str(alert.id),
            alert.vendor_id,
            alert.department or "N/A",
            f"${alert.amount:,.2f}" if alert.amount else "N/A",
            f"{alert.risk_score} ({alert.risk_band})",
            alert.primary_trigger
        ])

    t = Table(data, colWidths=[30, 80, 80, 80, 80, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e2530")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    elements.append(t)
    
    # Explanations
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Detailed Explanations", styles['Heading3']))
    for alert in alerts:
        elements.append(Paragraph(f"<b>Alert {alert.id} ({alert.vendor_id}):</b> {alert.explanation}", styles['BodyText']))
        elements.append(Spacer(1, 6))

    doc.build(elements)
    return output_path

def generate_alert_brief_pdf(alert, output_path):
    """
    Generates a tactical brief for a single alert.
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph(f"TACTICAL ALERT BRIEF: TX-{alert.transaction_id}", styles['Title']))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Heading2']))
    elements.append(Spacer(1, 12))

    # Key Data
    data = [
        ["Field", "Value"],
        ["Vendor", f"{alert.vendor_id}"],
        ["Department", f"{alert.department}"],
        ["Amount", f"${alert.amount:,.2f}"],
        ["Risk Score", f"{alert.risk_score}"],
        ["Status", f"{alert.status}"]
    ]
    
    t = Table(data, colWidths=[100, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))

    # Explanation
    elements.append(Paragraph("Forensic Summary", styles['Heading3']))
    elements.append(Paragraph(alert.explanation or "No summary available.", styles['BodyText']))
    
    # Disclaimer
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("<b>CONFIDENTIAL:</b> For official use only. Unauthorized distribution is a punishable offense.", styles['Italic']))

    doc.build(elements)
    return output_path
