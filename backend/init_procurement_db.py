from app.database import engine
from app.models import Base
import logging

# Set up logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

def create_procurement_tables():
    print("--- Initializing Procurement Tables ---")
    try:
        # This will create any tables defined in Base that do not exist
        # It's safer than raw SQL for full table creation
        Base.metadata.create_all(bind=engine)
        print("✅ SUCCESS: Procurement tables initialized (if not existed).")
    except Exception as e:
        print(f"❌ FAILURE: {e}")

if __name__ == "__main__":
    create_procurement_tables()
