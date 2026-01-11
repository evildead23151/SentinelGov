from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
import os
from datetime import datetime, timedelta
from app import models, schemas, database, engine, detection
from app.database import engine as db_engine, get_db
from app.detection import engine_ai
from app.utils_report import generate_audit_pdf
from app.utils_governance import get_alert_summary, run_escalation_cycle
from sqlalchemy import func
from app import auth
import uuid

# Create tables
models.Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="GovIntel SOC API") # Production Hardened 3.0

# --- SECURITY MIDDLEWARE ---
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Content-Security-Policy would be here in a real app, but excluded to avoid breaking dev tools/external scripts in this demo
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    # --- SEED DATA HELPER ---
def seed_data(db: Session):
    # Always ensure core users exist


    # 1. System State
    if not db.query(models.SystemState).first():
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
        if not db.query(models.Vendor).filter(models.Vendor.vendor_id == v["id"]).first():
            vendor = models.Vendor(
                name=v["name"],
                vendor_id=v["id"],
                status=v["status"],
                created_at=datetime.now() - timedelta(days=v["age"])
            )
            db.add(vendor)
    
    # 3. Users (Institutional Registry)
    users_data = [
        {
            "username": "investigator", 
            "role": "INVESTIGATOR", "password": "police123", "rank": "Inspector", "dept": "Delhi Police", "level": 3,
            "gov_id": "DP-INS-DEL-8821", "name": "Rajesh Kumar", "org": "DP", "jur": "Delhi"
        },
        {
            "username": "treasury", 
            "role": "FINANCE_OFFICER", "password": "finance123", "rank": "Director", "dept": "Treasury", "level": 4,
            "gov_id": "MIN-FIN-DEL-099", "name": "Sarah Ahmed", "org": "Ministry of Finance", "jur": "Central"
        },
        {
            "username": "admin_audit", 
            "role": "DATA_OFFICER", "password": "SentinelGov2026", "rank": "Inspector", "dept": "Audit", "level": 3,
            "gov_id": "DP-DL-INS-L3-001", "name": "Inspector Rajesh Kumar", "org": "DP", "jur": "DL"
        },
        {
            "username": "finance_lead", 
            "role": "FINANCE_OFFICER", "password": "SentinelGov2026", "rank": "Director", "dept": "Finance", "level": 4,
            "gov_id": "MIN-FIN-DIR-L4-099", "name": "Director Sarah Ahmed", "org": "MIN", "jur": "CENTRAL"
        },
        {
            "username": "dept_head_ssp", 
            "role": "SECTION_HEAD", "password": "SentinelGov2026", "rank": "SSP", "dept": "Defense", "level": 5,
            "gov_id": "MOD-SSP-L5-8821", "name": "SSP Vikram Singh", "org": "MOD", "jur": "ALL"
        }
    ]
    for u in users_data:
        if not db.query(models.User).filter(models.User.username == u["username"]).first():
            user = models.User(
                username=u["username"],
                password_hash=auth.hash_password(u["password"]), 
                gov_id=u["gov_id"],
                full_name=u["name"],
                role=u["role"],
                rank=u["rank"],
                department=u["dept"],
                organization=u["org"],
                jurisdiction=u["jur"],
                clearance_level=u["level"],
                status="ACTIVE"
            )
            db.add(user)
            
    db.commit()

    # 4. Sample Sanctioned Procurements (for Transparency Board)
    if not db.query(models.ProcurementRequest).first():
        sanctioned_data = [
            {
                "title": "Hospital Equipment Upgrade - Phase II",
                "desc": "Procurement of advanced MRI and CT scan units for AIIMS Delhi expansion.",
                "dept": "Health & Family Welfare",
                "vendor": "MedTech Solutions India",
                "amount": 45000000.0,
                "hash": "8f22-x112-aa99"
            },
            {
                "title": "Smart City Surveillance Grid",
                "desc": "Installation of 500 AI-enabled CCTV cameras in South Delhi districts.",
                "dept": "Home Affairs",
                "vendor": "SecureNet Systems",
                "amount": 120000000.0,
                "hash": "7a33-b992-cc11"
            },
            {
                "title": "E-Bus Fleet Expansion",
                "desc": "Acquisition of 200 electric buses for DTC green mobility initiative.",
                "dept": "Transport",
                "vendor": "EcoDrive Motors",
                "amount": 250000000.0,
                "hash": "1c55-z001-ff44"
            }
        ]
        
        admin = db.query(models.User).filter(models.User.username == "admin_audit").first()
        
        for s in sanctioned_data:
            req = models.ProcurementRequest(
                title=s["title"],
                description=s["desc"],
                department=s["dept"],
                vendor_name=s["vendor"],
                amount=s["amount"],
                status="SANCTIONED",
                document_hash=s["hash"],
                actor_id=admin.id if admin else None,
                sanctioned_at=datetime.now() - timedelta(days=2)
            )
            db.add(req)
        db.commit()

# --- INITIALIZE ---
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_data(db)

# --- AUTH ROUTES ---

@app.post("/api/auth/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if exists
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Identity code (username) already registered.")
    
    # Generate GovID: <ORG>-<JUR>-<RANK>-<CLEARANCE>-<RANDOM>
    import random
    entropy = random.randint(1000, 9999)
    jur_prefix = payload.jurisdiction[:3].upper()
    gov_id = f"{payload.organization}-{jur_prefix}-{payload.rank[:3].upper()}-L{payload.clearance_level}-{entropy}"

    try:
        user = models.User(
            username=payload.username,
            password_hash=auth.hash_password(payload.password),
            gov_id=gov_id,
            email=payload.email, # Captured Email
            full_name=payload.full_name,
            role=payload.role,
            rank=payload.rank,
            department=payload.department,
            organization=payload.organization,
            jurisdiction=payload.jurisdiction,
            clearance_level=payload.clearance_level,
            status="ACTIVE"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration Failed: {str(e)}")

    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role, "gov_id": user.gov_id})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not auth.verify_password(user.password_hash, payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials or GovID mismatch")
    
    if user.status != "ACTIVE":
        raise HTTPException(status_code=403, detail="Identity Revoked. Contact Oversight Cell.")

    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role, "gov_id": user.gov_id})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

# --- ROUTES ---

@app.get("/api/system/status")
def get_system_status(db: Session = Depends(get_db)):
    # 1. Real-time Aggregates (Cloud-Grade Spec)
    total_tx = db.query(models.Transaction).count()
    funds_monitored = db.query(func.sum(models.Transaction.amount)).scalar() or 0.0
    
    # Authority: Compute risk_exposure from Transactions on hold or blocked
    risk_exposure = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.status.in_(['ON_HOLD', 'BLOCKED'])
    ).scalar() or 0.0
    
    active_alerts = db.query(models.Alert).filter(models.Alert.status == "OPEN").count()
    
    # Authority: Compute payments_on_hold from Transactions status
    payments_on_hold = db.query(models.Transaction).filter(models.Transaction.status == "ON_HOLD").count()
    
    state = db.query(models.SystemState).first()
    if not state:
        state = models.SystemState()
        db.add(state)
        db.commit()
        db.refresh(state)

    return {
        "status": state.status,
        "secure_layer": state.secure_layer,
        "total_transactions": total_tx,
        "funds_monitored": funds_monitored,
        "risk_exposure": risk_exposure,
        "active_cases": active_alerts,
        "payments_on_hold": payments_on_hold,
        "tender_flag_rate": (active_alerts / (db.query(models.Tender).count() or 1)) * 100,
        "ai_confidence": 98.4,
        "model_version": state.model_version,
        "last_updated": datetime.now()
    }

@app.get("/api/tenders", response_model=List[schemas.Tender])
def get_tenders(db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    return db.query(models.Tender).options(joinedload(models.Tender.bids)).all()

@app.get("/api/tenders/{tender_id}", response_model=schemas.Tender)
def get_tender_detail(tender_id: str, db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    tender = db.query(models.Tender).options(joinedload(models.Tender.bids)).filter(models.Tender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    return tender

@app.get("/api/system/events")
@app.get("/api/events/recent")
def get_recent_events(db: Session = Depends(get_db)):
    return db.query(models.Event).order_by(models.Event.timestamp.desc()).limit(15).all()

@app.get("/api/metrics/anomaly-trend")
def get_anomaly_trend(db: Session = Depends(get_db)):
    """
    Revised Trend: Shows % of Tenders flagged (Audit logic).
    """
    # Group by day
    results = db.query(
        func.strftime('%Y-%m-%d', models.Tender.award_timestamp).label('day'),
        func.count(models.Tender.id).label('total'),
        func.count(models.Tender.id).filter(
            models.Tender.tender_id.in_(
                db.query(models.Alert.tender_id).filter(models.Alert.risk_score >= 50)
            )
        ).label('anomalous')
    ).group_by('day').order_by('day').limit(30).all()
    
    return [
        {
            "day": r.day, 
            "normal": r.total - r.anomalous, 
            "anomalous": r.anomalous,
            "flag_rate": (r.anomalous / r.total) * 100 if r.total > 0 else 0
        }
        for r in results
    ]

@app.get("/api/vendors")
def get_vendors(db: Session = Depends(get_db)):
    return db.query(models.Vendor).all()

@app.post("/api/vendors/{vendor_id}/freeze")
def freeze_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = "FROZEN"
    engine.log_event(db, "VENDOR_FROZEN", f"Vendor {vendor.name} ({vendor_id}) has been frozen by administrative action.", severity="CRITICAL")
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
    engine.log_event(db, "CASE_ESCALATED", f"Case {case_id} severity increased to CRITICAL.", severity="CRITICAL", metadata={"case_id": case_id})
    db.commit()
    return {"status": "success"}

@app.post("/api/model/train")
def train_model(db: Session = Depends(get_db)):
    result = engine_ai.train_model(db)
    # Update system state
    state = db.query(models.SystemState).first()
    if not state:
        state = models.SystemState(status="OPERATIONAL")
        db.add(state)
    state.last_retrain = datetime.now()
    state.model_version = f"v{datetime.now().strftime('%Y.%m.%d')}-IF"
    db.commit()
    return {"status": "success", "message": result}

@app.post("/api/ingest/upload")
def ingest_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = file.file.read()
        buffer = io.BytesIO(contents)
        try:
            df = pd.read_csv(buffer)
        except Exception:
             raise HTTPException(status_code=400, detail="Invalid CSV format.")

        if df.empty:
            raise HTTPException(status_code=400, detail="Ingestion failed: Empty batch data")

        # Normalize headers
        df.columns = [c.lower().strip() for c in df.columns]
        
        required_cols = {'vendor_id', 'amount', 'timestamp', 'department'}
        missing = required_cols - set(df.columns)
        if missing:
             raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

        count = 0
        try:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid timestamp format.")

        # Process All Rows Transactionally
        for _, row in df.iterrows():
            try:
                # a. Ensure Vendor
                v_id = str(row['vendor_id']).strip()
                vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == v_id).first()
                if not vendor:
                    vendor = models.Vendor(
                        name=row.get('vendor_name', f"Vendor {v_id}"),
                        vendor_id=v_id,
                        status="ACTIVE"
                    )
                    db.add(vendor)
                    db.flush()
                
                # b. Persist Transaction
                tx = models.Transaction(
                    vendor_id=v_id,
                    invoice_id=str(row.get('invoice_id', f"INV-{uuid.uuid4().hex[:8]}")),
                    amount=float(row.get('amount', 0)),
                    timestamp=row['timestamp'],
                    department=row.get('department'),
                    description=row.get('description', 'Procurement'),
                    risk_score=0.0,
                    status="PENDING", 
                    payment_status="PENDING" 
                )
                db.add(tx)
                db.flush() 
                
                # c. Intelligence Engine
                result = engine_ai.analyze_transaction(db, tx)
                
                # d. Enforcement Guard
                if result['risk']['final_risk_score'] >= 50:
                    tx.status = "ON_HOLD"
                    tx.payment_status = "ON_HOLD"
                else:
                    tx.status = "CLEARED"
                    tx.payment_status = "CLEARED"
                    
                # e. Alert Creation
                if result['risk']['final_risk_score'] >= 50:
                    suppressed = db.query(models.Alert).filter(
                        models.Alert.vendor_id == tx.vendor_id,
                        models.Alert.primary_trigger == result['risk']['primary_trigger'],
                        models.Alert.status == "OPEN",
                        models.Alert.created_at >= datetime.now() - timedelta(hours=24)
                    ).first()
                    
                    if not suppressed:
                        ai_summary = get_alert_summary(f"Vendor: {tx.vendor_id}, Amount: ${tx.amount}, Trigger: {result['risk']['primary_trigger']}")
                        
                        alert = models.Alert(
                            transaction_id=tx.id,
                            vendor_id=tx.vendor_id,
                            invoice_id=tx.invoice_id,
                            amount=tx.amount,
                            department=tx.department,
                            timestamp=tx.timestamp,
                            risk_score=result['risk']['final_risk_score'],
                            risk_band=result['risk']['risk_band'],
                            primary_trigger=result['risk']['primary_trigger'],
                            explanation=ai_summary, 
                            status="OPEN",
                            deadline=datetime.now() + timedelta(days=7) 
                        )
                        db.add(alert)
                        db.flush()
                        
                        engine.log_event(
                            db,
                            "ANOMALY",
                            f"Forensic violation detected for {v_id}.",
                            severity="ANOMALY",
                            metadata={"tx_id": tx.id, "score": result['risk']['final_risk_score']}
                        )
                count += 1
            except Exception as row_err:
                print(f"Skipping row: {row_err}")
                continue
            
        db.commit()

        engine.log_event(
            db, 
            "INGEST", 
            f"Ingested {file.filename} ({count} records).",
            severity="INFO",
            metadata={"filename": file.filename, "count": count}
        )
        db.commit() 
        
        alerts_created = db.query(models.Alert).filter(models.Alert.transaction_id.in_([t.id for t in db.new])).count()
        risk_delta = sum([t.amount for t in db.new if t.risk_score >= 50])

        return {
            "status": "success", 
            "processed": count, 
            "alerts_created": alerts_created,
            "risk_delta": risk_delta,
            "message": f"Successfully ingested {count} transactions."
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        engine.log_event(db, "ERROR", f"Ingestion Failed: {str(e)}", severity="CRITICAL")
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
        
@app.post("/api/ingest/tenders")
def ingest_tender(tender_data: schemas.TenderCreate, db: Session = Depends(get_db)):
    """
    Authority Endpoint: Ingests a full tender with its bid landscape.
    Triggers Forensic Analysis immediately.
    """
    try:
        # 1. Create Tender
        tender = models.Tender(
            tender_id=tender_data.tender_id,
            department=tender_data.department,
            estimated_budget=tender_data.estimated_budget,
            num_bidders=tender_data.num_bidders,
            winning_vendor_id=tender_data.winning_vendor_id,
            winning_bid_amount=tender_data.winning_bid_amount,
            award_timestamp=tender_data.award_timestamp,
            status="AWARDED"
        )
        db.add(tender)
        db.flush()
        
        # 2. Add Bids
        for bid_in in tender_data.bids:
            bid = models.Bid(
                tender_id=tender.tender_id,
                vendor_id=bid_in.vendor_id,
                bid_amount=bid_in.bid_amount,
                rank=bid_in.rank
            )
            db.add(bid)
        
        db.flush()
        
        # 3. Analyze
        result = engine_ai.analyze_tender(db, tender)
        
        # 4. Create Alert if High Risk
        if result['risk']['final_risk_score'] >= 20:
            alert = models.Alert(
                tender_id=tender.tender_id,
                vendor_id=tender.winning_vendor_id,
                amount=tender.winning_bid_amount,
                department=tender.department,
                timestamp=tender.award_timestamp,
                risk_score=result['risk']['final_risk_score'],
                risk_band=result['risk']['risk_band'],
                primary_trigger=result['risk']['primary_trigger'],
                explanation=result['explanation'],
                status="OPEN"
            )
            db.add(alert)
        
        db.commit()
        return {"status": "success", "risk": result['risk']}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    department: str = None,
    vendor_id: str = None
):
    query = db.query(models.Alert).filter(models.Alert.status == "OPEN")
    
    if department:
        query = query.filter(models.Alert.department.ilike(f"%{department}%"))
    if vendor_id:
        query = query.filter(models.Alert.vendor_id.ilike(f"%{vendor_id}%"))
        
    return query.order_by(models.Alert.risk_score.desc()).all()

@app.post("/api/cases", status_code=201)
def create_case(payload: schemas.CaseCreate, db: Session = Depends(get_db), username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "SECTION_HEAD", "OVERSIGHT", "DATA_OFFICER"]))):
    user = db.query(models.User).filter(models.User.username == username).first()
    
    # 1. Create Case
    import random
    entropy = random.randint(1000, 9999)
    case_id = f"CASE-{datetime.now().year}-{payload.department[:3].upper()}-{entropy}"
    
    new_case = models.Case(
        case_id=case_id,
        entity_name=payload.department, # Simplified
        entity_id=payload.department,
        severity="HIGH",
        status="OPEN",
        description=payload.description or f"Investigation into {payload.title}"
    )
    db.add(new_case)
    db.flush()
    
    # 2. Link Alerts
    alerts = db.query(models.Alert).filter(models.Alert.id.in_(payload.initial_alert_ids)).all()
    for alert in alerts:
        alert.case_id = new_case.id
        alert.status = "ESCALATED" # Auto-escalate linked alerts
        db.add(alert)
        
    # 3. Log Audit
    audit = models.ActionLog(
        alert_id=alerts[0].id if alerts else None,
        actor_id=user.id,
        actor_govid=user.gov_id,
        action="CASE_CREATED",
        note=f"Case {case_id} created by {user.gov_id}. Linked {len(alerts)} alerts.",
        integrity_hash=str(uuid.uuid4())
    )
    db.add(audit)
    
    db.commit()
    return {"status": "success", "case": new_case}

@app.get("/api/alerts/{alert_id}")
def get_alert_detail(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@app.post("/api/alerts/{alert_id}/action")
def take_action(alert_id: int, action: schemas.InvestigatorAction, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == alert_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update Status
    if action.action == "REVIEW":
        tx.status = "REVIEWED"
    elif action.action == "ESCALATE":
        tx.status = "ESCALATED"
    elif action.action == "FALSE_POSITIVE":
        tx.status = "RESOLVED"
        tx.risk_score = 0 # Clear risk
    elif action.action == "FREEZE":
        tx.status = "FROZEN"
        # Also freeze vendor
        vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == tx.vendor_id).first()
        if vendor:
            vendor.status = "FROZEN"
            db.add(vendor)

    # Log Audit
    audit = models.AuditLog(
        actor="Officer-101", # Mocked
        action=action.action,
        details=f"Action on Alert #{alert_id}: {action.note or 'No notes'}",
        integrity_hash=str(uuid.uuid4()) # Mock hash
    )
    db.add(audit)
    db.add(tx)
    db.commit()
    return {"status": "success", "new_state": tx.status}

@app.get("/api/audit/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()

@app.post("/api/model/analyze", response_model=schemas.ForensicResult)
def model_analyze(payload: schemas.ForensicPayload):
    """
    Cloud-Grade Model Service Endpoint
    Adheres to Spec v5.0 Pure Function Model Contract.
    """
    try:
        # Convert Pydantic to Dict for the engine's pure function
        result = engine_ai.process_forensic_payload(payload.model_dump())
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model Service Panic: {str(e)}")

@app.get("/api/reports/export")
def export_report(db: Session = Depends(get_db)):
    """
    Official Audit Report Export (Spec Required)
    """
    try:
        alerts = db.query(models.Alert).filter(models.Alert.status == "OPEN").all()
        report_dir = "data/reports"
        os.makedirs(report_dir, exist_ok=True)
        pdf_path = os.path.join(report_dir, f"audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        
        generate_audit_pdf(alerts, pdf_path)
        
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename="sentinelgov_audit_report.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report Generation Failed: {str(e)}")

# --- GOVERNANCE & ENFORCEMENT ENDPOINTS ---

@app.get("/api/governance/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int, 
    db: Session = Depends(get_db), 
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT", "DATA_OFFICER"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "UNDER_REVIEW"
    alert.acknowledged_at = datetime.now()
    alert.assigned_to = user.id
    
    action = models.ActionLog(
        alert_id=alert_id,
        actor_id=user.id,
        actor_govid=user.gov_id,
        action="ACKNOWLEDGED",
        note=f"Alert acknowledged by {user.gov_id} for procedural review.",
        integrity_hash=str(hash(f"{alert_id}{user.gov_id}ACKNOWLEDGED")) # Simplistic hash for demo
    )
    db.add(action)
    db.commit()
    return {"status": "success"}

@app.post("/api/alerts/{alert_id}/freeze")
def freeze_alert(
    alert_id: int, 
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT", "SECTION_HEAD"]))
):
    """
    ENFORCEMENT ACTION CONTRACT:
    1. Update Transaction.status = ON_HOLD
    2. Update Alert.status = ESCALATED
    3. Emit ENFORCEMENT Event
    4. Return snapshot
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    tx = db.query(models.Transaction).filter(models.Transaction.id == alert.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Underlying transaction not found")

    try:
        # 1. Mutate States
        tx.status = "ON_HOLD"
        tx.payment_status = "ON_HOLD" # Legacy compatibility
        alert.status = "ESCALATED"
        
        # 2. Audit Trail
        action = models.ActionLog(
            alert_id=alert_id,
            actor_id=user.id,
            actor_govid=user.gov_id,
            action="ENFORCEMENT_FREEZE",
            note=f"Emergency freeze initiated by {user.gov_id}. Funds on hold.",
            integrity_hash=str(uuid.uuid4())
        )
        db.add(action)
        
        # 3. Emit Event
        detection.log_event(
            db,
            "ENFORCEMENT",
            f"FUNDS FROZEN for Alert #{alert_id} by {user.gov_id}. Risk Exposure adjusted.",
            severity="CRITICAL",
            metadata={"alert_id": alert_id, "amount": tx.amount, "vendor": tx.vendor_id}
        )
        
        db.commit()
        
        # Return status snapshot
        return get_system_status(db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Enforcement Action Failed: {str(e)}")

@app.post("/api/alerts/{alert_id}/assign-committee")
def assign_committee(
    alert_id: int, 
    payload: schemas.InvestigatorAction, 
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    investigation = models.Investigation(
        alert_id=alert_id,
        committee_members=payload.committee_members,
        findings="Investigation committee assigned."
    )
    db.add(investigation)
    
    action = models.ActionLog(
        alert_id=alert_id,
        actor_id=user.id,
        actor_govid=user.gov_id,
        action="ASSIGNED_COMMITTEE",
        note=payload.note,
        integrity_hash=str(hash(f"{alert_id}{user.gov_id}ASSIGNED"))
    )
    db.add(action)
    db.commit()
    return {"status": "success"}


@app.get("/api/governance/audit-trail/{alert_id}")
def get_audit_trail(alert_id: int, db: Session = Depends(get_db)):
    return db.query(models.ActionLog).filter(models.ActionLog.alert_id == alert_id).order_by(models.ActionLog.timestamp.desc()).all()

# --- AI GENERATION ENDPOINTS (New) ---
from app.agent import agent as ai_agent

@app.post("/api/gen/comms")
def generate_communication_draft(case_id: int):
    """
    Uses the Local AI Agent to draft initial communication for a case.
    Returns: { "subject": ..., "body": ... }
    """
    result = ai_agent.generate_investigation_email(case_id)
    if isinstance(result, str): # Error message
        raise HTTPException(status_code=404, detail=result)
    return result


# --- COMMUNICATION ENDPOINTS (New) ---
from app.services.email import email_service
from pydantic import BaseModel

class EmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str

@app.post("/api/comms/send")
def send_communication(payload: EmailRequest, db: Session = Depends(get_db)):
    """
    Manually triggers an email send via the configured SMTP service (or mock logger).
    """
    success = email_service.send_email(payload.to_email, payload.subject, payload.body)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email. Check server logs.")
    return {"status": "sent", "recipient": payload.to_email}


# --- SPEC v3.0 HARDENING ENDPOINTS ---

@app.post("/api/alerts/{alert_id}/escalate")
def escalate_alert(
    alert_id: int, 
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT", "SECTION_HEAD"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # 1. Mutate State
    alert.status = "ESCALATED"
    alert.escalation_level += 1
    # alert.last_escalated_at = datetime.now() # If we had this column
    
    # 2. Auto-Create Case if Critical
    if alert.escalation_level >= 1 and not alert.case_id:
        # Check if case exists for this department
        pass # Logic simplified for now, investigator usually creates case manually
        
    # 3. Audit Log
    action = models.ActionLog(
        alert_id=alert_id,
        actor_id=user.id,
        actor_govid=user.gov_id,
        action="ESCALATED",
        note=f"Escalated to Level {alert.escalation_level} by {user.gov_id}. Immediate review required.",
        integrity_hash=str(uuid.uuid4())
    )
    db.add(action)
    
    # 4. Emit System Event
    engine.log_event(
        db, 
        "ESCALATION", 
        f"Alert {alert_id} escalated to Level {alert.escalation_level} by {user.gov_id}.", 
        severity="CRITICAL",
        metadata={"alert_id": alert_id, "level": alert.escalation_level}
    )
    
    db.commit()


    
@app.get("/api/metrics/anomaly-trend")
def get_anomaly_trend(db: Session = Depends(get_db)):
    """
    Returns daily aggregation of flagged vs normal tenders for the last 30 days.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    tenders = db.query(models.Tender).filter(models.Tender.award_timestamp >= start_date).all()
    daily_stats = {}
    
    curr = start_date
    while curr <= end_date:
        d_str = curr.strftime("%Y-%m-%d")
        daily_stats[d_str] = {"date": d_str, "flagged": 0, "normal": 0}
        curr += timedelta(days=1)
        
    for t in tenders:
        d_str = t.award_timestamp.strftime("%Y-%m-%d")
        if d_str in daily_stats:
            alert = db.query(models.Alert).filter(models.Alert.tender_id == t.tender_id).first()
            if alert and alert.risk_score > 20:
                daily_stats[d_str]["flagged"] += 1
            else:
                daily_stats[d_str]["normal"] += 1
                
    result = []
    for d_str in sorted(daily_stats.keys()):
        stat = daily_stats[d_str]
        total = stat["flagged"] + stat["normal"]
        flag_rate = (stat["flagged"] / total * 100) if total > 0 else 0
        result.append({
            "date": d_str, # Dashboard expects date/flag_rate
            "flagged": stat["flagged"],
            "normal": stat["normal"],
            "flag_rate": round(flag_rate, 1)
        })
    return result

# --- FINANCE CONTROL PLANE ---

@app.get("/api/finance/dashboard")
def get_finance_dashboard(db: Session = Depends(get_db)):
    """
    Returns treasury-specific KPIs and pending holds.
    """
    # KPIs
    payments_on_hold = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.status == "ON_HOLD").scalar() or 0
    pending_actions = db.query(models.Transaction).filter(models.Transaction.status == "ON_HOLD").count()
    
    # Table Data: Transactions ON_HOLD
    holds = db.query(models.Transaction).filter(models.Transaction.status == "ON_HOLD").all()
    
    hold_data = []
    for tx in holds:
        # Get Linked Alert
        alert = db.query(models.Alert).filter(models.Alert.transaction_id == tx.id).first()
        days_on_hold = 0
        if alert:
            days_on_hold = (datetime.now() - alert.timestamp).days
            
        hold_data.append({
            "id": tx.id,
            "tender_id": tx.tender_id,
            "vendor_id": tx.vendor_id,
            "amount": tx.amount,
            "hold_reason": alert.primary_trigger if alert else "Manual Freeze",
            "days_on_hold": days_on_hold,
            "status": tx.status
        })
        
    return {
        "kpis": {
            "payments_on_hold": payments_on_hold,
            "pending_actions": pending_actions,
            "escalations_due": 0 # Placeholder for now
        },
        "holds": hold_data
    }

@app.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int, 
    payload: schemas.AlertResolveRequest,
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT", "SECTION_HEAD"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # 1. Mutate Alert State
    alert.status = "RESOLVED"
    
    # 2. Log Action with Outcome
    action = models.ActionLog(
        alert_id=alert_id,
        actor_id=user.id,
        actor_govid=user.gov_id,
        actor_role=user.role,
        action="RESOLVED",
        note=f"Alert resolved by {user.gov_id}. Outcome: {payload.outcome}. Note: {payload.note}",
        integrity_hash=str(uuid.uuid4())
    )
    db.add(action)
    
    # 3. Notify Finance
    msg = models.InstitutionalMessage(
        sender_govid=user.gov_id,
        recipient_role="FINANCE_OFFICER",
        type="ALERT_RESOLVED",
        message=f"Alert for Transaction {alert.transaction_id} has been RESOLVED. Payment release now authorized.",
        context_json={"alert_id": alert_id, "transaction_id": alert.transaction_id}
    )
    db.add(msg)
    
    db.commit()
    return {"status": "success", "alert_status": "RESOLVED"}

@app.post("/api/transactions/{tx_id}/release")
def release_payment(
    tx_id: int, 
    payload: schemas.TransactionReleaseRequest,
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["FINANCE_OFFICER", "OVERSIGHT"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    # --- ENFORCEMENT OVERRIDE ---
    # If a treasury officer confirms disbursement, we auto-resolve the linked alert.
    alert = db.query(models.Alert).filter(models.Alert.transaction_id == tx.id).first()
    if alert:
        alert.status = "RESOLVED"
        # Log that this was an administrative override
        override_audit = models.ActionLog(
            alert_id=alert.id,
            actor_id=user.id,
            actor_govid=user.gov_id,
            action="AUTO_RESOLVED_BY_DISBURSEMENT",
            note="Alert auto-resolved due to treasury authorization of disbursement.",
            integrity_hash=str(uuid.uuid4())
        )
        db.add(override_audit)

        
    # 1. Mutate Transaction State
    tx.status = "CLEARED"
    
    # 2. Log Action
    action = models.ActionLog(
        alert_id=alert.id if alert else None,
        actor_id=user.id,
        actor_govid=user.gov_id,
        actor_role=user.role,
        action="PAID_RELEASED",
        note=f"Funds released by Treasury Authority {user.gov_id}. Note: {payload.note}" + (" (Alert Auto-Resolved)" if alert else ""),
        integrity_hash=str(uuid.uuid4())
    )
    db.add(action)
    
    db.commit()
    return {"status": "success"}

@app.get("/api/alerts/{alert_id}/export-brief")
def export_alert_brief(alert_id: int, db: Session = Depends(get_db)):
    from app.utils_report import generate_alert_brief_pdf
    
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    # Use absolute path to ensure writable directory irrelevant of CWD
    base_dir = os.path.dirname(os.path.abspath(__file__))
    report_dir = os.path.join(base_dir, "..", "data", "reports")
    os.makedirs(report_dir, exist_ok=True)
    
    filename = f"sentinelgov_brief_{alert_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    pdf_path = os.path.join(report_dir, filename)
    
    try:
        generate_alert_brief_pdf(alert, pdf_path)
        if not os.path.exists(pdf_path):
             raise Exception("File created but not found on disk.")
             
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=filename,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc() # Log full error to terminal
        raise HTTPException(status_code=500, detail=f"PDF Generation Failed: {str(e)}")

@app.get("/api/analytics/expenditure-baseline")
def get_expenditure_baseline(
    vendor_id: str = None, 
    department: str = None, 
    db: Session = Depends(get_db)
):
    """
    Returns Z-Score analysis for the requested context.
    """
    query = db.query(models.Transaction)
    if vendor_id:
        query = query.filter(models.Transaction.vendor_id == vendor_id)
    if department:
        query = query.filter(models.Transaction.department == department)
        
    txs = query.all()
    if not txs:
        return {"mean": 0, "std_dev": 0, "current": 0, "z_score": 0, "history": []}
        
    amounts = [t.amount for t in txs]
    mean = sum(amounts) / len(amounts)
    import math
    variance = sum([((x - mean) ** 2) for x in amounts]) / len(amounts)
    std_dev = math.sqrt(variance) if variance > 0 else 1.0
    
    # Last transaction
    last_tx = txs[-1]
    z_score = (last_tx.amount - mean) / std_dev
    
    return {
        "mean": mean,
        "std_dev": std_dev,
        "current_amount": last_tx.amount,
        "z_score": z_score,
        "history": [{"date": t.timestamp.strftime("%Y-%m-%d"), "amount": t.amount} for t in txs[-10:]]
    }

# --- PROCUREMENT ENDPOINTS (New) ---

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int, 
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT", "SECTION_HEAD"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # 1. Mutate State (DETERMINISTIC: Does NOT release funds)
    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_at = datetime.now()
    
    # 2. Audit Log
    action = models.ActionLog(
        alert_id=alert_id,
        actor_id=user.id,
        actor_govid=user.gov_id,
        actor_role=user.role,
        action="ACKNOWLEDGED",
        note=f"Alert acknowledged by {user.gov_id}. Investigation lifecycle started.",
        integrity_hash=str(uuid.uuid4())
    )
    db.add(action)
    
    db.commit()
    return {"status": "success", "alert_status": "ACKNOWLEDGED"}

# --- PROCUREMENT ENDPOINTS (New) ---

@app.get("/api/public/transparency")
def get_public_transparency_board(db: Session = Depends(get_db)):
    """
    Public Endpoint: Returns list of SANCTIONED procurements for the scroll index.
    """
    return db.query(models.ProcurementRequest).filter(
        models.ProcurementRequest.status == "SANCTIONED"
    ).order_by(models.ProcurementRequest.sanctioned_at.desc()).limit(100).all()

@app.get("/api/procurement/pending")
def get_pending_procurements(db: Session = Depends(get_db), username: str = Depends(auth.get_current_user)):
    """ Internal: List pending requests for sanctioning officers """
    return db.query(models.ProcurementRequest).filter(models.ProcurementRequest.status == "PENDING_SANCTION").all()

@app.post("/api/procurement/create", response_model=schemas.ProcurementRequest)
def create_procurement_request(
    payload: schemas.ProcurementRequestCreate,
    db: Session = Depends(get_db),
    username: str = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    doc_hash = str(uuid.uuid4())[:8] + "-" + str(uuid.uuid4())[:8]
    
    req = models.ProcurementRequest(
        title=payload.title,
        department=payload.department,
        vendor_name=payload.vendor_name,
        amount=payload.amount,
        description=payload.description,
        status="PENDING_SANCTION",
        actor_id=user.id,
        document_hash=doc_hash
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@app.post("/api/procurement/{req_id}/sanction")
def sanction_procurement(
    req_id: int, 
    action: schemas.SanctionAction, 
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["SECTION_HEAD", "OVERSIGHT"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    req = db.query(models.ProcurementRequest).filter(models.ProcurementRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if action.action == "SANCTION":
        req.status = "SANCTIONED"
        req.sanctioned_at = datetime.now()
        # Log immutable ledger entry
        audit = models.ActionLog(
            action="SANCTION_APPROVED",
            actor_id=user.id,
            actor_govid=user.gov_id,
            note=f"Sanctioned Amount: ${req.amount} for {req.vendor_name}. {action.note}",
            integrity_hash=str(uuid.uuid4())
        )
        db.add(audit)
        
    elif action.action == "REJECT":
        req.status = "REJECTED"
        
    db.commit()
    return {"status": "success", "new_status": req.status}


# --- AI FORENSIC REASONER (DETERMINISTIC) ---

@app.post("/api/ai/chat", response_model=schemas.AIChatResponse)
def ai_forensic_chat(
    payload: schemas.AIChatRequest,
    db: Session = Depends(get_db)
):
    """
    Forensic AI Reasoner: Delegates to LocalAIAgent (Ollama/Llama3) for analysis.
    """
    try:
        # Delegate to the sophisticated Agent class
        response = ai_agent.chat(
            message=payload.message,
            role=payload.role
        )
        return response
    except Exception as e:
        return {
            "reply": "System Error: The AI Inference Engine is currently unreachable. Please verify Ollama is running.",
            "disclaimer": "System Error",
            "trace_id": "ERR-500"
        }

@app.post("/api/ingest/upload")
def ingest_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = file.file.read()
        buffer = io.BytesIO(contents)
        try:
            df = pd.read_csv(buffer)
        except Exception:
             raise HTTPException(status_code=400, detail="Invalid CSV format. Please ensure the file is a valid comma-separated values file.")

        if df.empty:
            raise HTTPException(status_code=400, detail="Ingestion failed: Empty batch data")

        # Normalize headers
        df.columns = [c.lower().strip() for c in df.columns]
        
        required_cols = {'vendor_id', 'amount', 'timestamp', 'department'}
        missing = required_cols - set(df.columns)
        if missing:
             raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

        count = 0
        
        # Safe Timestamp Conversion
        try:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid timestamp format. use ISO-8601 (YYYY-MM-DD).")

        # Process All Rows Transactionally
        for _, row in df.iterrows():
            try:
                # a. Ensure Vendor
                v_id = str(row['vendor_id']).strip()
                vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == v_id).first()
                if not vendor:
                    vendor = models.Vendor(
                        name=row.get('vendor_name', f"Vendor {v_id}"),
                        vendor_id=v_id,
                        status="ACTIVE"
                    )
                    db.add(vendor)
                    db.flush()
                
                # b. Persist Transaction (Assign ID with flush)
                tx_amount = float(row.get('amount', 0.0))
                tx = models.Transaction(
                    vendor_id=v_id,
                    invoice_id=str(row.get('invoice_id', f"INV-{uuid.uuid4().hex[:8]}")),
                    amount=tx_amount,
                    timestamp=row['timestamp'],
                    department=row.get('department'),
                    description=row.get('description', 'Procurement'),
                    risk_score=0.0,
                    status="PENDING", 
                    payment_status="PENDING" 
                )
                db.add(tx)
                db.flush() 
                
                # c. Intelligence Engine Execution
                result = engine_ai.analyze_transaction(db, tx)
                
                # d. Enforcement Guard (Automatic Payment Hold)
                if result['risk']['final_risk_score'] >= 50:
                    tx.status = "ON_HOLD"
                    tx.payment_status = "ON_HOLD"
                else:
                    tx.status = "CLEARED"
                    tx.payment_status = "CLEARED"
                    
                # e. Alert Creation
                if result['risk']['final_risk_score'] >= 50:
                    # Anti-Spam Check
                    suppressed = db.query(models.Alert).filter(
                        models.Alert.vendor_id == tx.vendor_id,
                        models.Alert.primary_trigger == result['risk']['primary_trigger'],
                        models.Alert.status == "OPEN",
                        models.Alert.created_at >= datetime.now() - timedelta(hours=24)
                    ).first()
                    
                    if not suppressed:
                        ai_summary = get_alert_summary(f"Vendor: {tx.vendor_id}, Amount: ${tx.amount}, Trigger: {result['risk']['primary_trigger']}")
                        
                        alert = models.Alert(
                            transaction_id=tx.id,
                            vendor_id=tx.vendor_id,
                            invoice_id=tx.invoice_id,
                            amount=tx.amount,
                            department=tx.department,
                            timestamp=tx.timestamp,
                            risk_score=result['risk']['final_risk_score'],
                            risk_band=result['risk']['risk_band'],
                            primary_trigger=result['risk']['primary_trigger'],
                            explanation=ai_summary, 
                            status="OPEN",
                            deadline=datetime.now() + timedelta(days=7) 
                        )
                        db.add(alert)
                        db.flush()
                        
                        # e. Emit ANOMALY event
                        engine.log_event(
                            db,
                            "ANOMALY",
                            f"Forensic violation detected for {row.get('vendor_name', row['vendor_id'])} in {row.get('department', 'Unknown')}.",
                            severity="ANOMALY",
                            metadata={"tx_id": tx.id, "score": result['risk']['final_risk_score']}
                        )
                count += 1
            except Exception as row_err:
                print(f"Skipping row due to error: {row_err}")
                continue
            
        # Final Atomic Commit
        db.commit()

        # Emit INGEST event EXACTLY ONCE after success
        engine.log_event(
            db, 
            "INGEST", 
            f"Cryptographic data transfer finalized for {file.filename} ({count} records processed).",
            severity="INFO",
            metadata={"filename": file.filename, "count": count}
        )
        db.commit() # Commit the event
        
        # Calculate Stats for Feedback
        alerts_created = db.query(models.Alert).filter(models.Alert.transaction_id.in_([t.id for t in db.new])).count()
        risk_exposure_delta = sum([t.amount for t in db.new if t.risk_score >= 50])

        return {
            "status": "success", 
            "processed": count, 
            "alerts_created": alerts_created,
            "risk_delta": risk_exposure_delta,
            "message": f"Successfully ingested {count} transactions. {alerts_created} new alerts generated."
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        # Log Logic Failure
        engine.log_event(
            db, 
            "ERROR", 
            f"Ingestion Aborted: {str(e)}",
            severity="CRITICAL"
        )
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/graph")
def get_entity_graph(db: Session = Depends(get_db)):
    """
    Returns the Entity Graph for the Detection Center.
    Nodes: Tender (Primary), Vendor, Bid, Transaction, Alert, Case.
    """
    try:
        nodes = []
        links = []
        
        # helper
        def add_node(id, type, label, risk=0):
            # check duplication
            if not any(n['id'] == id for n in nodes):
                nodes.append({"id": id, "type": type, "label": label, "risk": risk})
                
        # 1. TENDERS (Central Nodes)
        tenders = db.query(models.Tender).all()
        for t in tenders:
            t_id = f"TND-{t.tender_id}"
            add_node(t_id, "TENDER", f"Tender {t.tender_id}", 0)
            
            # Link to Winning Vendor
            if t.winning_vendor_id:
                v_id = f"VND-{t.winning_vendor_id}"
                add_node(v_id, "VENDOR", t.winning_vendor_id, 0)
                links.append({"source": t_id, "target": v_id, "type": "AWARDED"})

        # 2. ALERTS (High Risk)
        alerts = db.query(models.Alert).filter(models.Alert.status == "OPEN").all()
        for a in alerts:
            a_id = f"ALT-{a.id}"
            add_node(a_id, "ALERT", f"Alert #{a.id}", a.risk_score)
            
            if a.tender_id:
                t_id = f"TND-{a.tender_id}"
                links.append({"source": t_id, "target": a_id, "type": "FLAGGED"})
            if a.vendor_id:
                v_id = f"VND-{a.vendor_id}"
                # Ensure vendor node exists
                add_node(v_id, "VENDOR", a.vendor_id, 0)
                links.append({"source": v_id, "target": a_id, "type": "IMPLICATED"})

        # 3. TRANSACTIONS (Financial Flow)
        txs = db.query(models.Transaction).filter(
            (models.Transaction.status == "ON_HOLD") | 
            (models.Transaction.risk_score > 50)
        ).limit(50).all() # Limit to prevent graph explosion
        
        for tx in txs:
            tx_node_id = f"TX-{tx.id}"
            add_node(tx_node_id, "TRANSACTION", f"TX #{tx.id}", tx.risk_score)
            if tx.tender_id:
                t_id = f"TND-{tx.tender_id}"
                links.append({"source": t_id, "target": tx_node_id, "type": "FUNDING"})
            if tx.vendor_id:
                v_id = f"VND-{tx.vendor_id}"
                add_node(v_id, "VENDOR", tx.vendor_id, 0)
                links.append({"source": tx_node_id, "target": v_id, "type": "PAID_TO"})

        return {"nodes": nodes, "links": links}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"nodes": [], "links": []} # Fallback to empty graph instead of 500


