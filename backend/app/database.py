import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
INSTANCE_CONNECTION_NAME = os.getenv("INSTANCE_CONNECTION_NAME")

def get_db_engine():
    """
    Returns a SQLAlchemy engine.
    - If INSTANCE_CONNECTION_NAME is set, connects to Google Cloud AlloyDB.
    - Otherwise, falls back to local SQLite.
    """
    if INSTANCE_CONNECTION_NAME and DB_USER and DB_PASS and DB_NAME:
        try:
            from google.cloud.alloydb.connector import Connector
            import pg8000
            
            print(f"🚀 [DATABASE] Connecting to AlloyDB: {INSTANCE_CONNECTION_NAME}")
            
            # Initialize Connector
            connector = Connector()

            def getconn():
                conn = connector.connect(
                    INSTANCE_CONNECTION_NAME,
                    "pg8000",
                    user=DB_USER,
                    password=DB_PASS,
                    db=DB_NAME,
                )
                return conn

            # Create connection pool
            engine = create_engine(
                "postgresql+pg8000://",
                creator=getconn,
            )
            return engine
        except ImportError as e:
            print(f"⚠️ [DATABASE] AlloyDB libraries missing or failed to import: {e}")
            print("Falling back to local SQLite.")
        except Exception as e:
             print(f"⚠️ [DATABASE] AlloyDB Connection Failed: {e}")
             print("Falling back to local SQLite.")
    
    # Fallback / Default
    print("ℹ️ [DATABASE] Using Local SQLite (app.db)")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
    return create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

# Initialize Global Engine
engine = get_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
