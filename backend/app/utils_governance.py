import requests
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import models

OLLAMA_URL = "http://localhost:11434/api/generate"

def get_alert_summary(alert_details: str):
    """
    Calls local Ollama to generate a non-accusatory summary.
    """
    prompt = f"""
    Analyze the following transaction anomaly details and provide a neutral, 
    non-accusatory, institutional summary for a government auditor.
    Do not use language implying intent or guilt. Focus on procedural discrepancies.
    
    DETAILS: {alert_details}
    
    REQUIRED FOOTER: "This summary indicates procedural review priority and does not imply wrongdoing."
    """
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": "llama3", # Defaulting to llama3, change if needed
            "prompt": prompt,
            "stream": False
        }, timeout=5)
        if response.status_code == 200:
            return response.json().get('response', 'Summary generation pending institutional review.').strip()
    except Exception:
        return "Manual forensic review recommended based on statistical flags. No wrongdoing implied."
    return "Procedural audit review initiated."

def run_escalation_cycle(db: Session):
    """
    Checks for alerts that have passed their deadlines and auto-escalates.
    """
    now = datetime.now()
    
    # 1. Reminders (Day 7)
    reminders = db.query(models.Alert).filter(
        models.Alert.status == "OPEN",
        models.Alert.escalation_level == 0,
        models.Alert.created_at <= now - timedelta(days=7)
    ).all()
    
    for alert in reminders:
        alert.escalation_level = 1
        log_escalation(db, alert, "Automatic reminder sent to assigned officer.")
        
    # 2. Auto-escalate to next senior (Day 15)
    seniors = db.query(models.Alert).filter(
        models.Alert.status.in_(["OPEN", "UNDER_REVIEW"]),
        models.Alert.escalation_level == 1,
        models.Alert.created_at <= now - timedelta(days=15)
    ).all()
    
    for alert in seniors:
        alert.escalation_level = 2
        alert.status = "ESCALATED"
        log_escalation(db, alert, "Auto-escalated to Department Section Head due to inactivity.")
        
    # 3. Oversight (Day 30)
    oversight = db.query(models.Alert).filter(
        models.Alert.status == "ESCALATED",
        models.Alert.escalation_level == 2,
        models.Alert.created_at <= now - timedelta(days=30)
    ).all()
    
    for alert in oversight:
        alert.escalation_level = 3
        log_escalation(db, alert, "CRITICAL: Escalated to Oversight Cell (CAG/DGP) for immediate intervention.")
        
    db.commit()

def log_escalation(db: Session, alert: models.Alert, message: str):
    from app.engine import log_event
    log_event(
        db,
        "SYSTEM_ESCALATION",
        message,
        severity="CRITICAL" if alert.escalation_level >= 2 else "ANOMALY",
        metadata={"alert_id": alert.id, "level": alert.escalation_level}
    )
    
    action = models.ActionLog(
        alert_id=alert.id,
        action="SYSTEM_ESCALATED",
        note=message
    )
    db.add(action)
