import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils_report import generate_audit_pdf, generate_alert_brief_pdf

class MockAlert:
    def __init__(self, id, risk_score):
        self.id = id
        self.vendor_id = "V-TEST-001"
        self.department = "Police"
        self.amount = 5000000.00
        self.risk_score = risk_score
        self.risk_band = "CRITICAL" if risk_score > 90 else "HIGH"
        self.primary_trigger = "RANK_MISMATCH"
        self.explanation = "Test explanation for forensic audit purposes."
        self.transaction_id = f"TX-{id}"
        self.status = "OPEN"

def test_generation():
    print("Testing PDF Generation...")
    
    # Test 1: Full Audit Report
    alerts = [MockAlert(1, 95), MockAlert(2, 78), MockAlert(3, 45)]
    try:
        generate_audit_pdf(alerts, "test_audit_report.pdf")
        print("✓ Audit Report Generated Successfully")
    except Exception as e:
        print(f"✗ Audit Report Failed: {e}")
        import traceback
        traceback.print_exc()

    # Test 2: Tactical Brief
    try:
        generate_alert_brief_pdf(alerts[0], "test_alert_brief.pdf")
        print("✓ Tactical Brief Generated Successfully")
    except Exception as e:
        print(f"✗ Tactical Brief Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_generation()
