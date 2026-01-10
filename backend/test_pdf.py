import sys
import os
# Add backend to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.utils_report import generate_alert_brief_pdf
    print("Successfully imported generate_alert_brief_pdf")
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

class MockAlert:
    id = 123
    transaction_id = "TX-999"
    vendor_id = "V-TEST"
    department = "Dept of Testing"
    amount = 50000.00
    risk_score = 85.5
    status = "OPEN"
    explanation = "This is a test summary."

try:
    output_path = "test_brief.pdf"
    generate_alert_brief_pdf(MockAlert(), output_path)
    print(f"PDF generated successfully at {output_path}")
    if os.path.exists(output_path):
        print("File exists on disk.")
    else:
        print("File not found on disk after generation.")
except Exception as e:
    print(f"PDF Generation Failed: {e}")
    import traceback
    traceback.print_exc()
