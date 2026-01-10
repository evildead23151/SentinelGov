import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.detection import engine_ai

def test_engine():
    print("--- SentinelGov Intelligence Engine Verification ---")
    
    # Payload 1: High Risk (Rules + Stats)
    payload_critical = {
        "transaction_id": "TX_CRIT_001",
        "features": {
            "log_amount": 11.5,
            "vendor_txn_count_30d": 20,
            "unique_departments_30d": 5,
            "time_distance_noon": 2.5
        },
        "rule_hits": ["STRUCTURING", "DUPLICATE_INVOICE"],
        "stat_signals": {
            "amount_z_score": 4.2
        }
    }
    
    # Payload 2: ML-Only (Should be low/medium risk, ML trigger)
    payload_ml_only = {
        "transaction_id": "TX_ML_002",
        "features": {
            "log_amount": 9.8,
            "vendor_txn_count_30d": 3,
            "unique_departments_30d": 1,
            "time_distance_noon": 1.0
        },
        "rule_hits": [],
        "stat_signals": {
            "amount_z_score": 0.5
        }
    }

    print("\n[Test 1] Critical Risk Payload (Rules + Stats)")
    res1 = engine_ai.process_forensic_payload(payload_critical)
    print(json.dumps(res1, indent=2))
    assert res1['risk']['risk_band'] == "CRITICAL"
    assert res1['risk']['primary_trigger'] == "RULE"
    assert "DUPLICATE_INVOICE" in res1['explanation']

    print("\n[Test 2] ML-Only Payload")
    # We need a trained model for ML score > 0
    # For this test, we'll verify it doesn't crash and returns expected trigger
    res2 = engine_ai.process_forensic_payload(payload_ml_only)
    print(json.dumps(res2, indent=2))
    # ML alone should never be CRITICAL
    assert res2['risk']['risk_band'] != "CRITICAL"
    
    print("\n--- Verification Successful ---")

if __name__ == "__main__":
    try:
        test_engine()
    except Exception as e:
        print(f"\nVerification Failed: {e}")
        sys.exit(1)
