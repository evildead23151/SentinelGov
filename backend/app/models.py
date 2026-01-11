from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean, Enum
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.orm import relationship
import enum

class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    ON_HOLD = "ON_HOLD"
    CLEARED = "CLEARED"
    BLOCKED = "BLOCKED"

class AlertStatus(str, enum.Enum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    ESCALATED = "ESCALATED"

class SystemState(Base):
    __tablename__ = "system_state"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="OPERATIONAL") 
    model_version = Column(String, default="v3.0.0-enforcement")
    last_retrain = Column(DateTime(timezone=True), server_default=func.now())
    secure_layer = Column(Boolean, default=True)

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    vendor_id = Column(String, unique=True, index=True)
    status = Column(String, default="ACTIVE") 
    clearance_required = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String) 
    gov_id = Column(String, unique=True, index=True) 
    email = Column(String, unique=True, index=True, nullable=True) 
    full_name = Column(String)
    role = Column(String) # DATA_OFFICER, FINANCE_OFFICER, SECTION_HEAD, INVESTIGATOR, OVERSIGHT
    rank = Column(String) 
    department = Column(String)
    organization = Column(String)
    jurisdiction = Column(String)
    clearance_level = Column(Integer, default=1) 
    status = Column(String, default="ACTIVE") 
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
    status = Column(String, default="PENDING") 
    anomaly_flags = Column(JSON, default=[])
    explanation = Column(String)
    integrity_hash = Column(String)
    tender_id = Column(String, ForeignKey("tenders.tender_id"), nullable=True)
    
    tender = relationship("Tender", back_populates="transactions")
    alert = relationship("Alert", back_populates="transaction", uselist=False)

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
    actor_govid = Column(String) 
    actor_role = Column(String) # Captured for RBAC audit
    action = Column(String) 
    note = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    integrity_hash = Column(String)

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
    status = Column(String, default="OPEN") 
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    escalation_level = Column(Integer, default=0) 
    deadline = Column(DateTime(timezone=True))
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tender_id = Column(String, ForeignKey("tenders.tender_id"), nullable=True)

    transaction = relationship("Transaction", back_populates="alert")
    tender = relationship("Tender")

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

class Tender(Base):
    __tablename__ = "tenders"
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String, unique=True, index=True)
    department = Column(String, index=True)
    estimated_budget = Column(Float)
    num_bidders = Column(Integer, default=0)
    winning_vendor_id = Column(String, ForeignKey("vendors.vendor_id"))
    winning_bid_amount = Column(Float)
    award_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="AWARDED") 
    
    bids = relationship("Bid", back_populates="tender")
    transactions = relationship("Transaction", back_populates="tender")

class Bid(Base):
    __tablename__ = "bids"
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String, ForeignKey("tenders.tender_id"))
    vendor_id = Column(String, ForeignKey("vendors.vendor_id"))
    bid_amount = Column(Float)
    rank = Column(Integer) 
    
    tender = relationship("Tender", back_populates="bids")


class InstitutionalMessage(Base):
    __tablename__ = "institutional_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_govid = Column(String)
    recipient_role = Column(String) 
    type = Column(String) 
    message = Column(String)
    context_json = Column(JSON) 
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    department = Column(String, index=True)
    vendor_name = Column(String)
    amount = Column(Float)
    status = Column(String, default="PENDING_SANCTION") # PENDING_SANCTION, SANCTIONED, REJECTED
    document_hash = Column(String, unique=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sanctioned_at = Column(DateTime(timezone=True), nullable=True)
