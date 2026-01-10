import os
import random
import uuid
import json
from datetime import datetime, timedelta
import pandas as pd

# CONFIG
# Get absolute path to backend/data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(DATA_DIR, "synthetic_procurement_data.csv")

START_DATE = datetime.now() - timedelta(days=180)
END_DATE = datetime.now()
DEPARTMENTS = ["Defense", "Education", "Healthcare", "Infrastructure", "Transport"]

# VENDORS (Mix of Good and Bad)
VENDORS = [
    {"id": "V-GOOD-01", "name": "Standard Supplies Inc", "type": "GOOD"},
    {"id": "V-GOOD-02", "name": "City Power Corp", "type": "GOOD"},
    {"id": "V-GOOD-03", "name": "Global Tech Solutions", "type": "GOOD"},
    {"id": "V-SMURF-01", "name": "Vertex Holdings (Structurer)", "type": "BAD_SMURF"},
    {"id": "V-DUPE-01", "name": "NorthStar Ltd (Duplicator)", "type": "BAD_DUPE"},
    {"id": "V-SHELL-01", "name": "Omega Construction (Shell)", "type": "BAD_SHELL"},
]

transactions = []

def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

# 1. Generate Normal Background Noise
for _ in range(800):
    vendor = random.choice([v for v in VENDORS if v["type"] == "GOOD"])
    amount = round(random.uniform(500, 50000), 2)
    tx = {
        "invoice_id": f"INV-{uuid.uuid4().hex[:8].upper()}",
        "vendor_id": vendor["id"],
        "vendor_name": vendor["name"],
        "department": random.choice(DEPARTMENTS),
        "amount": amount,
        "timestamp": random_date(START_DATE, END_DATE).isoformat(),
        "description": "Routine procurement"
    }
    transactions.append(tx)

# 2. Inject "Smurfing" (Structuring) - Just under $10k limit
# Multiple transactions of $9,900 - $9,990 on the same day
smurf_date = random_date(END_DATE - timedelta(days=5), END_DATE)
for i in range(5):
    tx = {
        "invoice_id": f"INV-SMURF-{i}",
        "vendor_id": "V-SMURF-01",
        "vendor_name": "Vertex Holdings",
        "department": "Infrastructure",
        "amount": round(random.uniform(9900, 9995), 2),
        "timestamp": smurf_date.isoformat(),
        "description": "Split procurement payment"
    }
    transactions.append(tx)

# 3. Inject "Duplicates"
# Exact same amount, different Invoice ID, across different departments
dupe_amount = 45250.00
dupe_date = random_date(END_DATE - timedelta(days=10), END_DATE)
for i, dept in enumerate(["Education", "Transport", "Healthcare"]):
    tx = {
        "invoice_id": f"INV-DUPE-{i}",
        "vendor_id": "V-DUPE-01",
        "vendor_name": "NorthStar Ltd",
        "department": dept,
        "amount": dupe_amount,
        "timestamp": dupe_date.isoformat(),
        "description": "Consulting Services"
    }
    transactions.append(tx)

# 4. Inject "Shell Company" (Velocity)
# Brand new vendor draining funds
shell_date = END_DATE - timedelta(days=2)
for i in range(3):
    tx = {
        "invoice_id": f"INV-SHELL-{i}",
        "vendor_id": "V-SHELL-01",
        "vendor_name": "Omega Construction",
        "department": "Defense",
        "amount": 150000.00, # Large amount
        "timestamp": (shell_date + timedelta(hours=i)).isoformat(),
        "description": "Emergency construction services"
    }
    transactions.append(tx)

# Save
df = pd.DataFrame(transactions)
df.to_csv(OUTPUT_FILE, index=False)
print(f"Generated {len(transactions)} synthetic transactions at {OUTPUT_FILE}")
