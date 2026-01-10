from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from .database import Base

class SystemState(Base):
    __tablename__ = "system_state"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="OPERATIONAL") # OPERATIONAL, DEGRADED, ALERT
    model_version = Column(String, default="v2.4.1-stable")
    last_retrain = Column(DateTime(timezone=True), server_default=func.now())
    secure_layer = Column(Boolean, default=True) # Spec v2.0 requirement

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    vendor_id = Column(String, unique=True, index=True)
    status = Column(String, default="ACTIVE") # ACTIVE, FROZEN, WATCHLIST
    clearance_required = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String) # For Argon2id
    gov_id = Column(String, unique=True, index=True) # DP-DEL-SSP-L4-8821
    email = Column(String, unique=True, index=True, nullable=True) # Official Email
    full_name = Column(String)
    role = Column(String) # DATA_OFFICER, FINANCE_OFFICER, SECTION_HEAD, INVESTIGATOR, OVERSIGHT
    rank = Column(String) # Inspector, SSP, DIG, etc.
    department = Column(String)
    organization = Column(String)
    jurisdiction = Column(String)
    clearance_level = Column(Integer, default=1) # L1-L5
    status = Column(String, default="ACTIVE") # ACTIVE, SUSPENDED, REVOKED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("vendors.vendor_id"))
    invoice_id = Column(String, index=True)
    amount = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    department = Column(String)
    description = Column(String)
    risk_score = Column(Float, default=0.0)
    payment_status = Column(String, default="PROCESSED") # PROCESSED, ON_HOLD, BLOCKED
    status = Column(String, default="OPEN") # Legacy status
    anomaly_flags = Column(JSON, default=[])
    explanation = Column(String)
    integrity_hash = Column(String)

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    entity_name = Column(String)
    entity_id = Column(String)
    severity = Column(String, default="LOW")
    status = Column(String, default="OPEN")
    assigned_committee_id = Column(Integer, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    actor = Column(String)
    action = Column(String)
    details = Column(String)
    integrity_hash = Column(String)

class ActionLog(Base):
    __tablename__ = "action_logs"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    actor_id = Column(Integer, ForeignKey("users.id"))
    actor_govid = Column(String) # Captured at time of action
    action = Column(String) # ACKNOWLEDGED, ASSIGNED, ESCALATED, CLOSED
    note = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    integrity_hash = Column(String) # SHA-256 of action metadata

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    type = Column(String)
    message = Column(String)
    severity = Column(String, default="INFO")
    metadata_json = Column(JSON, default={})

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    vendor_id = Column(String, ForeignKey("vendors.vendor_id"))
    invoice_id = Column(String)
    amount = Column(Float)
    department = Column(String)
    timestamp = Column(DateTime(timezone=True))
    risk_score = Column(Float)
    risk_band = Column(String)
    primary_trigger = Column(String)
    explanation = Column(String)
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, ESCALATED, CLOSED
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    escalation_level = Column(Integer, default=0) # 0: Alert, 1: Reminder, 2: Senior, 3: Oversight
    deadline = Column(DateTime(timezone=True))
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    committee_members = Column(JSON) # List of User IDs
    findings = Column(String)
    document_hashes = Column(JSON)
    status = Column(String, default="ACTIVE") # ACTIVE, COMPLETED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
