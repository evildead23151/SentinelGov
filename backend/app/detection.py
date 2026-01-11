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
        self.model_version = "sentinelgov_procurement_v3.0-STRICT"
    
    def process_forensic_payload(self, payload: dict) -> dict:
        """
        PROCUREMENT-CENTRIC PURE FUNCTION MODEL CONTRACT
        """
        features = payload.get("features", {})
        stat_signals = payload.get("stat_signals", {})
        
        # --- HARD CONSTRAINT: L1 ELIGIBILITY ---
        # If awarded to lowest bidder within budget, system MUST NOT raise alert.
        is_lowest_bid = features.get("bid_rank", 1) == 1
        is_under_budget = features.get("tender_budget_ratio", 1.0) <= 1.0
        
        if is_lowest_bid and is_under_budget:
            return self._format_result(0, 0, 0, "LOW", "NONE", 
                                     "Tender awarded to lowest bidder within budget. Compliance confirmed.")

        # --- LAYER 1: PROCUREMENT RULES (Max 50) ---
        rule_score = 0
        
        # Rule 1: Bid Rank Violation (DOMINANT)
        rank = features.get("bid_rank", 1)
        if rank == 2: rule_score += 10
        elif rank == 3: rule_score += 25
        elif rank >= 4: rule_score += 50
        
        # Rule 2: Bid Spread Ratio
        spread = features.get("spread_ratio", 0.0)
        spread_pct = spread * 100
        if spread_pct > 30: rule_score += 50
        elif spread_pct > 15: rule_score += 25
        elif spread_pct > 5: rule_score += 10
        
        # Rule 3: Over-Budget Award
        budget_ratio = features.get("tender_budget_ratio", 1.0)
        if budget_ratio > 1.2: rule_score += 20
        elif budget_ratio > 1.1: rule_score += 10 # Modified to match scenario
        elif budget_ratio > 1.0: rule_score += 5
        
        rule_score = min(50, rule_score)

        # --- LAYER 2: STATISTICAL LAYER (Max 50) ---
        stat_score = 0
        # STRICT: Only if sufficient bidders
        if not stat_signals.get("insufficient_depth", True):
            z_tender = stat_signals.get("z_tender", 0.0)
            if z_tender > 1.5:
                stat_score = min(50, int(z_tender * 15))
        
        # --- LAYER 3: ML LAYER (Max 20) ---
        ml_score = 0 
        # Support only
        if features.get("vendor_win_frequency", 0) > 0.4:
            ml_score += 10
        
        ml_score = min(20, ml_score)
        
        # FINAL SCORE
        final_risk_score = min(100, rule_score + stat_score + ml_score)
        
        # Signal Hierarchy: RULE > STAT > ML
        primary_trigger = "ML"
        if rule_score > 0: primary_trigger = "RULE"
        elif stat_score > 0: primary_trigger = "STAT"
        elif final_risk_score == 0: primary_trigger = "NONE"

        risk_band = "LOW"
        if final_risk_score >= 80: risk_band = "CRITICAL"
        elif final_risk_score >= 50: risk_band = "HIGH"
        elif final_risk_score >= 20: risk_band = "MEDIUM"

        explanation = self._generate_explanation(features, final_risk_score)

        return self._format_result(rule_score, stat_score, ml_score, risk_band, primary_trigger, explanation)

    def _format_result(self, rule, stat, ml, band, trigger, explanation):
        return {
            "risk": {
                "rule_score": int(rule),
                "stat_score": int(stat),
                "ml_anomaly_score": int(ml),
                "final_risk_score": int(min(100, rule + stat + ml)),
                "risk_band": band,
                "primary_trigger": trigger
            },
            "explanation": explanation,
            "model_info": {
                "model_version": self.model_version,
                "scoring_version": "v3.0-strict"
            }
        }

    def _generate_explanation(self, features, score) -> str:
        if score == 0:
            return "Procedural integrity check completed. Tender award aligns with competitive economic norms."
        
        rank = features.get("bid_rank", 1)
        spread_pct = features.get("spread_ratio", 0.0) * 100
        budget_ratio = features.get("tender_budget_ratio", 1.0)
        
        parts = []
        if rank > 1:
            parts.append(f"Tender awarded to a higher-ranked bid (Rank {rank}) despite lower-cost submissions.")
        
        if spread_pct > 5:
            parts.append(f"The awarded amount exceeds the lowest bid by {spread_pct:.1f}%.")
            
        if budget_ratio > 1.0:
            parts.append(f"Award value exceeds the allocated budget by {((budget_ratio-1)*100):.1f}%.")

        body = " ".join(parts)
        footer = "This deviation from competitive procurement norms warrants procedural review and does not imply wrongdoing."
        return f"{body} {footer}".strip()

    def analyze_tender(self, db: Session, tender: models.Tender):
        """
        Orchestrates Tender-Centric Analysis.
        """
        # 1. Fetch Bids
        bids = db.query(models.Bid).filter(models.Bid.tender_id == tender.tender_id).all()
        bid_amounts = [b.bid_amount for b in bids]
        
        if not bid_amounts:
            return {'risk': {'final_risk_score': 0, 'risk_band': 'LOW', 'primary_trigger': 'NONE'}, 'explanation': 'No bids.'}

        lowest_bid = min(bid_amounts)
        winning_bid = tender.winning_bid_amount
        win_bid_obj = db.query(models.Bid).filter(
            models.Bid.tender_id == tender.tender_id,
            models.Bid.vendor_id == tender.winning_vendor_id
        ).first()
        
        if not win_bid_obj:
            print(f"ERROR: Winning bid not found for tender {tender.tender_id}")
            rank = 1 # Fallback
        else:
            rank = win_bid_obj.rank
        
        # 2. Feature Computation
        num_bidders = len(bids)
        spread_ratio = (winning_bid - lowest_bid) / lowest_bid if lowest_bid > 0 else 0
        budget_ratio = winning_bid / tender.estimated_budget if tender.estimated_budget > 0 else 1.0
        
        # Vendor capturing context
        win_count = db.query(models.Tender).filter(models.Tender.winning_vendor_id == tender.winning_vendor_id).count()
        total_tenders = db.query(models.Tender).count() or 1
        win_freq = win_count / total_tenders

        # Stat signals (Z-Score)
        z_tender = 0.0
        insufficient = num_bidders < 5 # STRICT RULE
        if not insufficient:
            mean = np.mean(bid_amounts)
            std = np.std(bid_amounts)
            if std > 0.01:
                z_tender = abs((winning_bid - mean) / std)

        payload = {
            "features": {
                "bid_rank": rank,
                "spread_ratio": spread_ratio,
                "num_bidders": num_bidders,
                "tender_budget_ratio": budget_ratio,
                "vendor_win_frequency": win_freq
            },
            "stat_signals": {
                "z_tender": z_tender,
                "insufficient_depth": insufficient
            }
        }

        # 3. Pure Function Call
        result = self.process_forensic_payload(payload)

        # 4. Persistence implies updating related Transaction if exists
        # In this architecture, we rely on the main app logic to use the result, 
        # but we can optionally tag transactions here too.
        if tender.transactions:
             for tx in tender.transactions:
                 tx.risk_score = result['risk']['final_risk_score']
                 tx.explanation = result['explanation']
                 db.add(tx)
             db.commit()

        return result

engine_ai = AnomalyEngine()
