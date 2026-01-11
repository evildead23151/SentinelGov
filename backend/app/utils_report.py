from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageTemplate, BaseDocTemplate, Frame
from datetime import datetime
import os

def header_footer(canvas, doc):
    """
    Draws the header and footer on every page.
    """
    canvas.saveState()
    
    # Header
    canvas.setFillColor(colors.HexColor("#0f172a"))
    canvas.rect(0, 750, letter[0], 50, fill=1, stroke=0)
    
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(30, 765, "SentinelGov: National Procurement Integrity Shield")
    
    canvas.setFont("Helvetica", 9)
    canvas.drawString(30, 755, "OFFICIAL FORENSIC AUDIT RECORD")
    
    # Footer
    canvas.setFillColor(colors.HexColor("#f8fafc"))
    canvas.rect(0, 0, letter[0], 40, fill=1, stroke=0)
    canvas.setFillColor(colors.black)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(30, 15, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Confidential | Page {doc.page}")
    
    # Watermark
    canvas.saveState()
    canvas.translate(300, 400)
    canvas.rotate(45)
    canvas.setFillColor(colors.lightgrey)
    canvas.setFillAlpha(0.1)
    canvas.setFont("Helvetica-Bold", 60)
    canvas.drawCentredString(0, 0, "OFFICIAL USE ONLY")
    canvas.restoreState()
    
    canvas.restoreState()

def generate_audit_pdf(alerts, output_path):
    """
    Generates a government-grade audit report PDF with professional styling.
    """
    doc = BaseDocTemplate(output_path, pagesize=letter)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height - 50, id='normal')
    template = PageTemplate(id='base', frames=frame, onPage=header_footer)
    doc.addPageTemplates([template])
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='RiskCritical', parent=styles['Normal'], textColor=colors.red))
    styles.add(ParagraphStyle(name='RiskHigh', parent=styles['Normal'], textColor=colors.orange))
    
    elements = []
    elements.append(Spacer(1, 30))
    
    # Disclaimer
    elements.append(Paragraph("LEGAL DISCLAIMER", styles['Heading4']))
    disclaimer_text = "This report indicates elevated review priority based on probabilistic forensic models (v3.0.0). It DOES NOT constitute a final judgment of guilt. All findings must be verified by a sworn Human Investigator."
    elements.append(Paragraph(disclaimer_text, styles['Italic']))
    elements.append(Spacer(1, 20))

    # Alert Table
    data = [["ID", "Vendor", "Dept", "Amount", "Risk", "Trigger"]]
    for alert in alerts:
        risk_style = styles['Normal']
        if alert.risk_score >= 90: risk_style = styles['RiskCritical']
        elif alert.risk_score >= 75: risk_style = styles['RiskHigh']
        
        data.append([
            str(alert.id),
            Paragraph(str(alert.vendor_id), styles['Normal']),
            alert.department or "N/A",
            f"${alert.amount:,.2f}" if alert.amount else "N/A",
            Paragraph(f"{alert.risk_score} ({alert.risk_band})", risk_style),
            Paragraph(alert.primary_trigger, styles['Normal'])
        ])

    t = Table(data, colWidths=[30, 120, 60, 80, 80, 140])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e2530")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('WORDWRAP', (0, 0), (-1, -1), True),
    ]))
    elements.append(t)
    
    # Explanations
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Detailed Forensic Analysis", styles['Heading3']))
    for alert in alerts:
        elements.append(Paragraph(f"<b>Alert {alert.id} ({alert.vendor_id})</b>", styles['Heading4']))
        elements.append(Paragraph(alert.explanation or "No explanation generated.", styles['BodyText']))
        elements.append(Spacer(1, 10))

    doc.build(elements)
    return output_path

def generate_alert_brief_pdf(alert, output_path):
    """
    Generates a tactical brief for a single alert with enhanced styling.
    """
    doc = BaseDocTemplate(output_path, pagesize=letter)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height - 50, id='normal')
    template = PageTemplate(id='base', frames=frame, onPage=header_footer)
    doc.addPageTemplates([template])
    
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Spacer(1, 30))
    
    elements.append(Paragraph(f"TACTICAL ALERT BRIEF: TX-{alert.transaction_id}", styles['Title']))
    elements.append(Spacer(1, 12))

    # Key Data Table
    data = [
        ["Field", "Value"],
        ["Vendor ID", f"{alert.vendor_id}"],
        ["Department", f"{alert.department}"],
        ["Transaction Amount", f"${alert.amount:,.2f}"],
        ["Risk Score", f"{alert.risk_score} / 100"],
        ["Risk Band", f"{alert.risk_band}"],
        ["Current Status", f"{alert.status}"]
    ]
    
    t = Table(data, colWidths=[150, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#334155")),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Pattern Analysis
    elements.append(Paragraph("Pattern Analysis", styles['Heading3']))
    elements.append(Paragraph(f"Primary Trigger: <b>{alert.primary_trigger}</b>", styles['BodyText']))
    elements.append(Spacer(1, 5))
    elements.append(Paragraph(alert.explanation or "No detailed analysis available.", styles['BodyText']))
    
    # Recommendation Box
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Protocol Recommendation", styles['Heading3']))
    
    rec_text = "Proceed with CAUTION. Verify beneficiary ownership structure and cross-reference with blacklisted entities."
    if alert.risk_score > 90:
        rec_text = "CRITICAL STOP. Immediate freeze required. Initiate Level 3 forensic audit."
    
    t_rec = Table([[rec_text]], colWidths=[450])
    t_rec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fee2e2") if alert.risk_score > 80 else colors.HexColor("#fef3c7")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#991b1b") if alert.risk_score > 80 else colors.HexColor("#92400e")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#b91c1c") if alert.risk_score > 80 else colors.HexColor("#d97706")),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(t_rec)

    doc.build(elements)
    return output_path
