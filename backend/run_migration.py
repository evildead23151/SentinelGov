from app.database import engine
from sqlalchemy import text

def add_email_column():
    print("Running migration: Adding 'email' column to 'users' table...")
    with engine.connect() as conn:
        try:
            # Attempt to add column. Will fail if exists, which is fine.
            # Syntax works for both SQLite and PostgreSQL
            conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255)"))
            print("✅ Migration Successful: 'email' column added.")
        except Exception as e:
            print(f"ℹ️ Migration Note: {e}")
            print("Column likely already exists or table structure differs.")

if __name__ == "__main__":
    add_email_column()
