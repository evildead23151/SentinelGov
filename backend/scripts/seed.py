import requests
import os

BASE_URL = "http://127.0.0.1:8000/api"
DATA_FILE = "backend/data/synthetic_procurement_data.csv"

def seed():
    print(f"Loading data from {DATA_FILE}...")
    if not os.path.exists(DATA_FILE):
        print("Data file not found!")
        return

    # 1. Ingest
    with open(DATA_FILE, "rb") as f:
        files = {"file": ("synthetic_data.csv", f, "text/csv")}
        print("Uploading to /ingest/upload...")
        try:
            r = requests.post(f"{BASE_URL}/ingest/upload", files=files)
            print("Ingest Response:", r.status_code, r.json())
        except Exception as e:
            print("Ingest Failed:", e)
            return

    # 2. Train
    print("Triggering Model Training...")
    try:
        r = requests.post(f"{BASE_URL}/model/train")
        print("Train Response:", r.status_code, r.json())
    except Exception as e:
        print("Train Failed:", e)

    # 3. Check Transactions
    try:
        r = requests.get(f"{BASE_URL}/transactions")
        print(f"Total Transactions in DB: {len(r.json())}")
    except:
        pass

if __name__ == "__main__":
    seed()
