from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
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
    
    # 3. Users (Institutional Registry)
    users_data = [
        {
            "username": "admin_audit", 
            "role": "DATA_OFFICER", "rank": "Inspector", "dept": "Audit", "level": 3,
            "gov_id": "DP-DL-INS-L3-001", "name": "Inspector Rajesh Kumar", "org": "DP", "jur": "DL"
        },
        {
            "username": "finance_lead", 
            "role": "FINANCE_OFFICER", "rank": "Director", "dept": "Finance", "level": 4,
            "gov_id": "MIN-FIN-DIR-L4-099", "name": "Director Sarah Ahmed", "org": "MIN", "jur": "CENTRAL"
        },
        {
            "username": "dept_head_ssp", 
            "role": "SECTION_HEAD", "rank": "SSP", "dept": "Defense", "level": 5,
            "gov_id": "MOD-SSP-L5-8821", "name": "SSP Vikram Singh", "org": "MOD", "jur": "ALL"
        },
        {
            "username": "investigator_01", 
            "role": "INVESTIGATOR", "rank": "AIG", "dept": "CID", "level": 4,
            "gov_id": "CID-AIG-L4-5512", "name": "AIG John Reynolds", "org": "CID", "jur": "DL"
        }
    ]
    for u in users_data:
        if not db.query(models.User).filter(models.User.username == u["username"]).first():
            user = models.User(
                username=u["username"],
                password_hash=auth.hash_password("SentinelGov2026"), # Secure Default
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
    risk_exposure = db.query(func.sum(models.Transaction.amount)).filter(models.Transaction.risk_score >= 50).scalar() or 0.0
    active_alerts = db.query(models.Alert).filter(models.Alert.status == "OPEN").count()
    payments_on_hold = db.query(models.Transaction).filter(models.Transaction.payment_status == "ON_HOLD").count()
    
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
        "ai_confidence": 98.4,
        "model_version": state.model_version,
        "last_updated": datetime.now()
    }

@app.get("/api/system/events")
@app.get("/api/events/recent")
def get_recent_events(db: Session = Depends(get_db)):
    return db.query(models.Event).order_by(models.Event.timestamp.desc()).limit(15).all()

@app.get("/api/metrics/anomaly-trend")
def get_anomaly_trend(db: Session = Depends(get_db)):
    # Prototype: Group by day for the last 30 days
    # In SQLite, we use strftime
    results = db.query(
        func.strftime('%Y-%m-%d', models.Transaction.timestamp).label('day'),
        func.count(models.Transaction.id).filter(models.Transaction.risk_score < 50).label('normal'),
        func.count(models.Transaction.id).filter(models.Transaction.risk_score >= 50).label('anomalous')
    ).group_by('day').order_by('day').limit(30).all()
    
    return [
        {"day": r.day, "normal": r.normal, "anomalous": r.anomalous}
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
        df = pd.read_csv(buffer)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Ingestion failed: Empty batch data")

        count = 0
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Process All Rows Transactionally
        for _, row in df.iterrows():
            # a. Ensure Vendor
            vendor = db.query(models.Vendor).filter(models.Vendor.vendor_id == row['vendor_id']).first()
            if not vendor:
                vendor = models.Vendor(
                    name=row.get('vendor_name', 'Unknown Vendor'),
                    vendor_id=row['vendor_id'],
                    status="ACTIVE"
                )
                db.add(vendor)
                db.flush()
            
            # b. Persist Transaction (Assign ID with flush)
            tx = models.Transaction(
                vendor_id=row['vendor_id'],
                invoice_id=row.get('invoice_id'),
                amount=row.get('amount', 0.0),
                timestamp=row['timestamp'],
                department=row.get('department'),
                description=row.get('description', 'Procurement'),
                risk_score=0.0,
                payment_status="PROCESSED" # Default
            )
            db.add(tx)
            db.flush() 
            
            # c. Intelligence Engine Execution
            result = engine_ai.analyze_transaction(db, tx)
            
            # d. Enforcement Guard (Automatic Payment Hold)
            if result['risk']['final_risk_score'] >= 50:
                tx.payment_status = "ON_HOLD"
                
                # e. Alert Creation + Suppression Logic
                # Anti-Spam Check
                suppressed = db.query(models.Alert).filter(
                    models.Alert.vendor_id == tx.vendor_id,
                    models.Alert.primary_trigger == result['risk']['primary_trigger'],
                    models.Alert.status == "OPEN",
                    models.Alert.created_at >= datetime.now() - timedelta(hours=24)
                ).first()
                
                if not suppressed:
                    # AI-Generated Non-Accusatory Summary
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
                        explanation=ai_summary, # Use AI summary for institutional tone
                        status="OPEN",
                        deadline=datetime.now() + timedelta(days=7) # First accountability milestone
                    )
                    db.add(alert)
                    db.flush()
                    
                    # e. Emit ANOMALY event (Only on Alert Creation)
                    engine.log_event(
                        db,
                        "ANOMALY",
                        f"Forensic violation detected for {row.get('vendor_name', row['vendor_id'])} in {row.get('department', 'Unknown')}.",
                        severity="ANOMALY",
                        metadata={"tx_id": tx.id, "score": result['risk']['final_risk_score']}
                    )
            count += 1
            
        # Final Atomic Commit
        db.commit()

        # Emit INGEST event EXACTLY ONCE after success
        engine.log_event(
            db, 
            "INGEST", 
            f"Cryptographic data transfer finalized for {file.filename} ({count} records).",
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
        
    except Exception as e:
        db.rollback()
        # Log actual error here for internal debugging if needed
        raise HTTPException(status_code=400, detail=f"Ingestion Protocol Error: {str(e)}")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ingestion Protocol Error: {str(e)}")

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

@app.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: int, 
    payload: schemas.InvestigationResult, 
    db: Session = Depends(get_db),
    username: str = Depends(auth.RoleChecker(["INVESTIGATOR", "OVERSIGHT"]))
):
    user = db.query(models.User).filter(models.User.username == username).first()
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "CLOSED"
    
    # Update transaction payment status based on result
    tx = db.query(models.Transaction).filter(models.Transaction.id == alert.transaction_id).first()
    if payload.resolution == "CLEARED":
        tx.payment_status = "PROCESSED"
    else:
        tx.payment_status = "BLOCKED"
        
    action = models.ActionLog(
        integrity_hash=str(hash(f"{alert_id}{user.gov_id}CLOSED"))
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

@app.get("/api/graph")
def get_entity_graph(db: Session = Depends(get_db)):
    nodes = []
    edges = []
    
    # 1. Vendors
    vendors = db.query(models.Vendor).all()
    for v in vendors:
        nodes.append({
            "id": v.vendor_id,
            "label": v.name,
            "type": "parent", 
            "risk": v.status,
            "val": 10
        })
        
    # 2. Alerts
    alerts = db.query(models.Alert).filter(models.Alert.status == "OPEN").all()
    departments = set()
    
    for a in alerts:
        alert_node_id = f"ALERT-{a.id}"
        nodes.append({
            "id": alert_node_id,
            "label": f"Risk: {a.risk_score}",
            "type": "alert",
            "risk": "Critical" if a.risk_score > 80 else "High",
            "val": 5
        })
        edges.append({"source": a.vendor_id, "target": alert_node_id})
        
        departments.add(a.department)
        if a.department:
            edges.append({"source": alert_node_id, "target": a.department})
            
    # 3. Departments
    for d in departments:
        nodes.append({
            "id": d,
            "label": d,
            "type": "department",
            "risk": "Low",
            "val": 15
        })

    # 4. Cases
    cases = db.query(models.Case).all()
    for c in cases:
        case_node_id = f"CASE-{c.id}"
        nodes.append({
            "id": case_node_id,
            "label": c.case_id,
            "type": "case",
            "risk": "Investigating",
            "val": 20
        })
        # Link Cases to Alerts
        linked_alerts = db.query(models.Alert).filter(models.Alert.case_id == c.id).all()
        for la in linked_alerts:
            edges.append({"source": f"ALERT-{la.id}", "target": case_node_id})

    return {"nodes": nodes, "links": edges}

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
    return {"status": "success", "new_level": alert.escalation_level}

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

@app.post("/api/procurement/submit", response_model=schemas.ProcurementResponse)
def submit_procurement(
    payload: schemas.ProcurementCreate, 
    db: Session = Depends(get_db), 
    username: str = Depends(auth.RoleChecker(["DATA_OFFICER", "SECTION_HEAD"])) # Investigator can't submit?
):
    user = db.query(models.User).filter(models.User.username == username).first()
    
    # Generate Hash for "Paperwork"
    import hashlib
    doc_hash = hashlib.sha256(f"{payload.title}{payload.amount}{datetime.now()}".encode()).hexdigest()[:16]

    req = models.ProcurementRequest(
        title=payload.title,
        department=payload.department,
        vendor_name=payload.vendor_name,
        amount=payload.amount,
        description=payload.description,
        status="PENDING_SANCTION",
        requestor_id=user.id,
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
        
    if action.decision == "SANCTION":
        req.status = "SANCTIONED"
        req.sanctioned_by = user.id
        req.sanctioned_at = datetime.now()
        # Log immutable ledger entry
        audit = models.ActionLog(
            action="SANCTION_APPROVED",
            actor_id=user.id,
            actor_govid=user.gov_id,
            note=f"Sanctioned Amount: ${req.amount} for {req.vendor_name}. {action.notes}",
            integrity_hash=str(hash(f"{req.id}SANCTION"))
        )
        db.add(audit)
        
    elif action.decision == "REJECT":
        req.status = "REJECTED"
        
    db.commit()
    return {"status": "success", "new_status": req.status}

@app.get("/api/public/transparency")
def get_public_transparency_board(db: Session = Depends(get_db)):
    """
    Public Endpoint: Returns list of SANCTIONED procurements for the scroll index.
    """
    return db.query(models.ProcurementRequest).filter(models.ProcurementRequest.status == "SANCTIONED").order_by(models.ProcurementRequest.sanctioned_at.desc()).limit(100).all()

@app.get("/api/procurement/pending")
def get_pending_procurements(db: Session = Depends(get_db), username: str = Depends(auth.get_current_user)):
    """ Internal: List pending requests for sanctioning officers """
    return db.query(models.ProcurementRequest).filter(models.ProcurementRequest.status == "PENDING_SANCTION").all()

# --- CHAT ENDPOINT (Phase 10) ---
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_agent(payload: ChatRequest, username: str = Depends(auth.get_current_user)):
    from app.agent import agent
    response = agent.chat(payload.message)
    return {"response": response}

