from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import uuid
from typing import List, Optional

from app import models, database, engine, schemas
from app.database import engine as db_engine, get_db

# Create tables
models.Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="GovIntel SOC API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SEED DATA HELPER ---
def seed_data(db: Session):
    if db.query(models.SystemState).first():
        return

    # 1. System State
    state = models.SystemState()
    db.add(state)

    # 2. Vendors
    vendors_data = [
        {"name": "Vertex Holdings", "id": "V-8821-X", "status": "ACTIVE", "age": 45},
        {"name": "NorthStar Ltd", "id": "V-1044-B", "status": "WATCHLIST", "age": 120},
        {"name": "Global Supplies Corp", "id": "V-9920-L", "status": "ACTIVE", "age": 10}, # NEW
        {"name": "Omega Construction", "id": "V-4412-M", "status": "FROZEN", "age": 200},
    ]
    
    for v in vendors_data:
        vendor = models.Vendor(
            name=v["name"],
            vendor_id=v["id"],
            status=v["status"],
            created_at=datetime.now() - timedelta(days=v["age"])
        )
        db.add(vendor)
    
    db.commit()

# --- INITIALIZE ---
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_data(db)

# --- ROUTES ---

@app.get("/api/system/status")
def get_system_status(db: Session = Depends(get_db)):
    state = db.query(models.SystemState).first()
    return state

@app.get("/api/system/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).order_by(models.Event.timestamp.desc()).limit(50).all()

@app.get("/api/vendors")
def get_vendors(db: Session = Depends(get_db)):
    return db.query(models.Vendor).all()

@app.post("/api/vendors/{vendor_id}/freeze")
def freeze_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = "FROZEN"
    engine.log_event(db, "VENDOR_FROZEN", f"Vendor {vendor.name} ({vendor_id}) has been frozen by administrative action.")
    db.commit()
    return {"status": "success"}

@app.get("/api/transactions")
def get_transactions(db: Session = Depends(get_db), anomaly_only: bool = False):
    query = db.query(models.Transaction)
    if anomaly_only:
        query = query.filter(models.Transaction.risk_score > 0)
    return query.order_by(models.Transaction.timestamp.desc()).all()

@app.post("/api/ingest/simulate")
def ingest_simulate(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # This would normally be a long process. We'll simulate it.
    engine.log_event(db, "BATCH_INGEST_START", "Manual data ingestion protocol initiated.")
    # More logic here for simulation...
    return {"status": "processing", "batch_id": str(uuid.uuid4())}

@app.get("/api/cases")
def get_cases(db: Session = Depends(get_db)):
    return db.query(models.Case).all()

@app.post("/api/cases/{case_id}/escalate")
def escalate_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.severity = "CRITICAL"
    case.status = "ESCALATED"
    engine.log_event(db, "CASE_ESCALATED", f"Case {case_id} severity increased to CRITICAL.", {"case_id": case_id})
    db.commit()
    return {"status": "success"}

@app.get("/api/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()
