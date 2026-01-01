from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from .database import Base

class SystemState(Base):
    __tablename__ = "system_state"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="OPERATIONAL") # OPERATIONAL, DEGRADED, ALERT
    model_version = Column(String, default="v2.4.1-stable")
    last_retrain = Column(DateTime(timezone=True), server_default=func.now())

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    vendor_id = Column(String, unique=True, index=True)
    status = Column(String, default="ACTIVE") # ACTIVE, FROZEN, WATCHLIST
    clearance_required = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("vendors.vendor_id"))
    amount = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    department = Column(String)
    risk_score = Column(Float, default=0.0)
    anomaly_flags = Column(JSON, default=[]) # List of {rule: str, score: int}
    explanation = Column(String)
    integrity_hash = Column(String)

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    entity_name = Column(String)
    entity_id = Column(String)
    severity = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="OPEN") # OPEN, RESOLVED, ESCALATED
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

class Event(Base): # For the Soft Event Timeline
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    type = Column(String) # BATCH_INGESTED, PATTERN_DETECTED, CASE_ESCALATED, VENDOR_FROZEN
    message = Column(String)
    metadata_json = Column(JSON, default={})
