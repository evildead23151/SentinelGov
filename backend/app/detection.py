from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app import models
from sklearn.ensemble import IsolationForest
import pandas as pd
import numpy as np
import pickle
import os

class AnomalyEngine:
    def __init__(self):
        self.model = None
        self.model_path = "model_iso_forest.pkl"
        self.model_version = "sentinelgov_iforest_v1"
        self.load_model()
    
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
            except:
                print("Failed to load model, will need retraining")

    def process_forensic_payload(self, payload: dict) -> dict:
        """
        MANDATORY PURE FUNCTION MODEL CONTRACT (Cloud-Grade)
        Hardened for statistical reliability and privacy.
        """
        # 1. Schema & Value Validation (Strict Order)
        required_features = [
            "log_amount", "amount_z_vendor", "vendor_txn_count_7d",
            "vendor_txn_count_30d", "unique_departments_30d", "time_distance_noon"
        ]
        features = payload.get("features", {})
        
        # Reject if features missing (Contract Violation)
        for feat in required_features:
            if feat not in features:
                raise ValueError(f"SECURITY_VIOLATION: Missing feature {feat}")
        
        # Guard against non-numeric payloads
        try:
            for feat in required_features:
                val = float(features[feat])
                if np.isnan(val) or np.isinf(val):
                    features[feat] = 0.0
        except (ValueError, TypeError):
            raise ValueError("SECURITY_VIOLATION: Non-numeric feature detected")

        # 2. Mathematical Safety Boundaries
        rule_hits = payload.get("rule_hits", [])
        z_score = features.get("amount_z_vendor", 0)
        
        # Layer 1: Rules (Max 50)
        rule_score = min(50, len(rule_hits) * 50)

        # Layer 2: Stats (Max 50) - Guards for cold-start insufficiency
        stat_score = 0
        is_sufficient = features.get("vendor_txn_count_30d", 0) >= 5
        if is_sufficient and z_score > 1.0:
            stat_score = min(50, int(z_score * 10))

        # Layer 3: ML Anomaly Detection (Max 20)
        ml_anomaly_score = 0
        if self.model and is_sufficient:
            try:
                score = self.model.decision_function([[features['log_amount']]])[0]
                if score < 0:
                    ml_anomaly_score = 20
            except:
                ml_anomaly_score = 0 # Silent fail for ML on edge cases

        final_risk_score = min(100, int(rule_score + stat_score + ml_anomaly_score))
        
        # 3. Deterministic Explanation (Auditor-Safe)
        explanation = self._generate_explanation(rule_hits, z_score, ml_anomaly_score, is_sufficient)

        # Signal Hierarchy: RULE > STAT > ML
        primary_trigger = "ML"
        if rule_score > 0: primary_trigger = "RULE"
        elif stat_score > 0: primary_trigger = "STAT"

        risk_band = "LOW"
        if final_risk_score >= 80: risk_band = "CRITICAL"
        elif final_risk_score >= 50: risk_band = "HIGH"
        elif final_risk_score >= 20: risk_band = "MEDIUM"

        return {
            "transaction_id": payload.get("transaction_id"),
            "risk": {
                "rule_score": int(rule_score),
                "stat_score": int(stat_score),
                "ml_anomaly_score": int(ml_anomaly_score),
                "final_risk_score": final_risk_score,
                "risk_band": risk_band,
                "primary_trigger": primary_trigger
            },
            "explanation": explanation,
            "model_info": {
                "model_version": "iforest_v1.0",
                "scoring_version": "risk_formula_v1.1_stable"
            }
        }

    def _generate_explanation(self, rule_hits, z_score, ml_score, sufficient) -> str:
        parts = []
        if rule_hits:
            parts.append(f"Matched predefined audit rules: {', '.join(rule_hits)}.")
        
        if not sufficient:
            parts.append("Insufficient historical data to assess statistical deviation.")
        elif z_score > 2.0:
            parts.append(f"Transaction amount deviates from peer norms by {z_score:.1f} standard deviations.")
        
        if ml_score > 0 and sufficient:
            parts.append("Machine learning logic identified subtle pattern variations.")
        
        header = parts[0] if parts else "Observational analysis complete."
        body = " ".join(parts[1:])
        footer = "This alert indicates elevated review priority and does not imply wrongdoing."
        return f"{header} {body} {footer}".strip()

    def analyze_transaction(self, db: Session, tx: models.Transaction):
        """
        Hardened Wrapper: Handles SQL Nulls and zero-variance.
        """
        # 1. Feature Extraction (Guarded SQL Aggregates)
        stats = db.query(
            func.count(models.Transaction.id),
            func.avg(models.Transaction.amount)
        ).filter(models.Transaction.vendor_id == tx.vendor_id).first()

        z_val = 0.0
        count = stats[0] if stats else 0
        if count >= 5: # Cold-Start Threshold (N=5)
            mean = stats[1] or 0
            sum_sq = db.query(func.sum(models.Transaction.amount * models.Transaction.amount))\
                       .filter(models.Transaction.vendor_id == tx.vendor_id).scalar() or 0
            
            # Variance calculation with Zero-Variance protection
            var = (sum_sq / count) - (mean ** 2)
            std = np.sqrt(max(0, var))
            if std > 0.01: # Zero-Variance Guardrail
                z_val = abs((tx.amount - mean) / std)
        
        from datetime import time, timedelta
        tx_time = tx.timestamp
        noon = datetime.combine(tx_time.date(), time(12, 0))
        time_dist = abs((tx_time - noon).total_seconds() / 3600.0)

        # Contextual Features (Guarded)
        txn_7d = db.query(models.Transaction).filter(
            models.Transaction.vendor_id == tx.vendor_id,
            models.Transaction.timestamp >= tx.timestamp - timedelta(days=7)
        ).count()
        
        txn_30d = db.query(models.Transaction).filter(
            models.Transaction.vendor_id == tx.vendor_id,
            models.Transaction.timestamp >= tx.timestamp - timedelta(days=30)
        ).count()

        unique_depts = db.query(func.count(models.Transaction.department.distinct())).filter(
            models.Transaction.vendor_id == tx.vendor_id,
            models.Transaction.timestamp >= tx.timestamp - timedelta(days=30)
        ).scalar() or 1

        # 2. Rule Execution
        rule_hits = []
        if 9000 <= tx.amount < 10000: rule_hits.append("STRUCTURING")
        
        dupes = db.query(models.Transaction).filter(
            models.Transaction.vendor_id == tx.vendor_id,
            models.Transaction.amount == tx.amount,
            models.Transaction.id != tx.id,
            models.Transaction.timestamp >= tx.timestamp - timedelta(hours=24)
        ).count()
        if dupes > 0: rule_hits.append("DUPLICATE_INVOICE")

        if txn_7d > 5 and unique_depts > 2:
            rule_hits.append("HIGH_VELOCITY")

        # 3. Contract-Ready Payload
        payload = {
            "transaction_id": str(tx.id),
            "features": {
                "log_amount": float(np.log1p(tx.amount)),
                "amount_z_vendor": float(z_val),
                "vendor_txn_count_7d": int(txn_7d),
                "vendor_txn_count_30d": int(txn_30d),
                "unique_departments_30d": int(unique_depts),
                "time_distance_noon": float(time_dist)
            },
            "rule_hits": rule_hits,
            "stat_signals": {
                "amount_z_vendor": float(z_val)
            }
        }

        # 4. Mandatory Pure Function Model Call
        result = self.process_forensic_payload(payload)

        # Update DB Record
        tx.risk_score = result['risk']['final_risk_score']
        tx.explanation = result['explanation']
        db.add(tx)
        return result

engine_ai = AnomalyEngine()
