import sqlite3
import os

def patch():
    db_path = '../app.db'
    if not os.path.exists(db_path):
        print("DB not found at", db_path)
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Columns to add based on recent changes
    columns = [
        ("invoice_id", "VARCHAR"),
        ("status", "VARCHAR DEFAULT 'OPEN'"),
        ("integrity_hash", "VARCHAR"),
        ("description", "VARCHAR"),
        ("risk_score", "FLOAT"), # Just in case
        ("explanation", "VARCHAR"),
        ("anomaly_flags", "JSON")
    ]
    
    print(f"Patching {db_path}...")
    for col, dtype in columns:
        try:
            cursor.execute(f"ALTER TABLE transactions ADD COLUMN {col} {dtype}")
            print(f"Added column: {col}")
        except Exception as e:
            # Likely "duplicate column name" if it exists
            print(f"Message for {col}: {e}")
            
    conn.commit()
    conn.close()
    print("Patch complete.")

if __name__ == "__main__":
    patch()
