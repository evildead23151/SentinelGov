import hashlib
import json
from datetime import datetime, time
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from . import models

class AnomalyEngine:
    THRESHOLD_STRUCTURING = 10000.0
    
    @staticmethod
    def calculate_risk(
        db: Session,
        vendor: models.Vendor,
        amount: float,
        timestamp: datetime,
        department: str
    ) -> Dict:
        score = 0
        flags = []
        explanation_parts = []
        
        # 1. Duplicate Invoice (Search for same amount and same vendor in last 24h)
        # For simplicity in this mock, we'll check all transactions for that vendor
        duplicates = db.query(models.Transaction).filter(
            models.Transaction.vendor_id == vendor.vendor_id,
            models.Transaction.amount == amount
        ).count()
        if duplicates > 0:
            score += 25
            flags.append({"rule": "DUPLICATE_INVOICE", "impact": 25})
            explanation_parts.append("Potential duplicate invoice detected.")

        # 2. Structuring (Payment just below threshold)
        if 9000 <= amount < AnomalyEngine.THRESHOLD_STRUCTURING:
            score += 20
            flags.append({"rule": "STRUCTURING", "impact": 20})
            explanation_parts.append("Transaction amount is suspiciously close to reporting threshold.")

        # 3. New Vendor (< 30 days old)
        days_since_creation = (datetime.now() - vendor.created_at).days
        if days_since_creation < 30:
            score += 15
            flags.append({"rule": "NEW_VENDOR", "impact": 15})
            explanation_parts.append(f"Vendor registered recently ({days_since_creation} days ago).")

        # 4. Off-hours Transaction (10 PM - 5 AM)
        tx_hour = timestamp.hour
        if tx_hour >= 22 or tx_hour < 5:
            score += 10
            flags.append({"rule": "OFF_HOURS", "impact": 10})
            explanation_parts.append("Transaction processed during non-operational hours.")

        # 5. Vendor Recurrence across Departments
        other_depts = db.query(models.Transaction.department).filter(
            models.Transaction.vendor_id == vendor.vendor_id,
            models.Transaction.department != department
        ).distinct().count()
        if other_depts > 0:
            score += 20
            flags.append({"rule": "CROSS_DEPT_RECURRENCE", "impact": 20})
            explanation_parts.append(f"Vendor active across {other_depts + 1} different departments.")

        # Normalize score to 100
        final_score = min(score, 100)
        
        return {
            "risk_score": final_score,
            "anomaly_flags": flags,
            "explanation": " ".join(explanation_parts) if explanation_parts else "No immediate anomalies detected."
        }

def generate_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def log_event(db: Session, type: str, message: str, severity: str = "INFO", metadata: Dict = {}):
    event = models.Event(
        type=type,
        message=message,
        severity=severity,
        metadata_json=metadata
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
