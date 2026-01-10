from app.database import engine
from sqlalchemy import inspect
import logging

# Set up logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

def verify_users_table():
    print("--- Verifying 'users' Table Schema ---")
    inspector = inspect(engine)
    columns = inspector.get_columns('users')
    
    found_email = False
    print(f"Columns found in 'users':")
    for col in columns:
        print(f" - {col['name']} ({col['type']})")
        if col['name'] == 'email':
            found_email = True
            
    print("-" * 30)
    if found_email:
        print("✅ SUCCESS: 'email' column exists.")
    else:
        print("❌ FAILURE: 'email' column is MISSING.")

if __name__ == "__main__":
    verify_users_table()
