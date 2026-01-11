import os
import sys
from datetime import datetime, timedelta
import random
import traceback

# Add parent dir to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models, detection, auth

def seed_everything():
    print("DEBUG: Establishing Database [SENTINEL 3.0]...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("DEBUG: Pruning old data...")
        db.query(models.AuditLog).delete()
        db.query(models.ActionLog).delete()
        db.query(models.InstitutionalMessage).delete()
        db.query(models.Event).delete()
        db.query(models.Bid).delete()
        db.query(models.Tender).delete()
        db.query(models.Alert).delete()
        db.query(models.Transaction).delete()
        db.query(models.Vendor).delete()
        db.query(models.User).delete()
        db.query(models.SystemState).delete()
        db.commit()

        print("DEBUG: Seeding System State...")
        db.add(models.SystemState(status="OPERATIONAL", model_version="v3.0.0-enforcement"))

        print("DEBUG: Seeding Actors (RBAC Ruleset)...")
        # Investigator: Can resolve alerts
        db.add(models.User(
            username="investigator",
            password_hash=auth.hash_password("police123"),
            gov_id="DP-INS-DEL-8821",
            full_name="Rajesh Kumar",
            role="INVESTIGATOR",
            rank="Inspector",
            department="Delhi Police",
            organization="DP",
            jurisdiction="Delhi",
            clearance_level=3
        ))
        # Finance Officer: Can release funds only after resolution
        db.add(models.User(
            username="treasury",
            password_hash=auth.hash_password("finance123"),
            gov_id="MIN-FIN-DEL-099",
            full_name="Sarah Ahmed",
            role="FINANCE_OFFICER",
            rank="Director",
            department="Treasury",
            organization="Ministry of Finance",
            jurisdiction="Central",
            clearance_level=4
        ))
        db.commit()

        print("DEBUG: Seeding Vendors...")
        vendor_data = [
            ("Standard Supplies Inc", "V-GOOD-01"),
            ("City Power Corp", "V-GOOD-02"),
            ("Global Tech Solutions", "V-GOOD-03"),
            ("Agni Arms & Ammunition", "V-ARMS-01"),
            ("Ballistic Defense Corp", "V-ARMS-02"),
            ("Covert Tactical Systems", "V-ARMS-03"),
        ]
        vendors = {}
        for name, vid in vendor_data:
            v = models.Vendor(name=name, vendor_id=vid, status="ACTIVE")
            db.add(v)
            vendors[vid] = v
        db.commit()

        # SCENARIO: DELHI POLICE AMMUNITION (The Judge-Ready Demo)
        print("DEBUG: Seeding DELHI POLICE AMMUNITION scenario...")
        t_id_sim = "TND-DP-9MM-2026"
        budget_sim = 500000000.0 # 50 Cr
        
        tender_sim = models.Tender(
            tender_id=t_id_sim,
            department="Police",
            estimated_budget=budget_sim,
            num_bidders=3,
            winning_vendor_id="V-ARMS-03",
            winning_bid_amount=550000000.0, # 10% Over budget
            award_timestamp=datetime.now() - timedelta(hours=2),
            status="AWARDED"
        )
        db.add(tender_sim)
        db.flush()
        
        # Bids: Winner C is Rank 3 (Critical Indicator)
        db.add(models.Bid(tender_id=t_id_sim, vendor_id="V-ARMS-01", bid_amount=482000000.0, rank=1))
        db.add(models.Bid(tender_id=t_id_sim, vendor_id="V-ARMS-02", bid_amount=485000000.0, rank=2))
        db.add(models.Bid(tender_id=t_id_sim, vendor_id="V-ARMS-03", bid_amount=550000000.0, rank=3)) 
        
        # Create Transaction: Starts as ON_HOLD due to procedural rule
        tx_sim = models.Transaction(
            vendor_id="V-ARMS-03",
            invoice_id=f"INV-{t_id_sim}-A1",
            amount=550000000.0,
            timestamp=datetime.now() - timedelta(minutes=45),
            department="Police",
            description="9mm Ammunition Supply - Batch 1",
            status="ON_HOLD",
            risk_score=92.5,
            tender_id=t_id_sim,
            explanation="Critical Forensic Alert: Tender awarded to Rank 3 bidder with 14.1% cost spread vs L1. AUTOMATIC PAYROLL FREEZE APPLIED."
        )
        db.add(tx_sim)
        db.flush()

        # Create Corresponding Alert
        alert_sim = models.Alert(
            transaction_id=tx_sim.id,
            vendor_id="V-ARMS-03",
            invoice_id=f"INV-{t_id_sim}-A1",
            amount=550000000.0,
            department="Police",
            timestamp=datetime.now() - timedelta(minutes=45),
            risk_score=92.5,
            risk_band="CRITICAL",
            primary_trigger="RANK_MISMATCH_L3_WIN",
            explanation="Winner is Rank 3. Spread vs L1 is 14.1% ($68M). Budget overrun: 10%.",
            status="OPEN",
            tender_id=t_id_sim
        )
        db.add(alert_sim)
        
        # Log Event
        db.add(models.Event(
            type="ENFORCEMENT",
            message=f"Automatic Freeze activated for TX-{tx_sim.id} (Delhi Police). Reason: Forensic anomaly detected.",
            severity="CRITICAL",
            metadata_json={"alert_id": "OPEN", "tender_id": t_id_sim}
        ))

        db.commit()
        print("DEBUG: Seed complete. SentinelGov 3.0 Operational.")

    except Exception:
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_everything()
