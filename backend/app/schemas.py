from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SystemState(BaseModel):
    status: str
    model_version: str
    last_retrain: datetime
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    gov_id: str
    full_name: str
    email: Optional[str] = None # Added Email
    role: str
    rank: str
    department: str
    organization: str
    jurisdiction: str
    clearance_level: int
    status: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    gov_id: Optional[str] = None
    email: Optional[str] = None # Added Email
    full_name: str
    role: str
    rank: str
    department: str
    organization: str
    jurisdiction: str
    clearance_level: int

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class LoginRequest(BaseModel):
    username: str
    password: str

class Transaction(BaseModel):
    id: int
    vendor_id: str
    amount: float
    timestamp: datetime
    department: str
    risk_score: float
    payment_status: str
    explanation: str

class EventBase(BaseModel):
    type: str
    message: str
    timestamp: datetime

# --- INGESTION SCHEMAS ---
class TransactionIngest(BaseModel):
    vendor_id: str
    amount: float
    timestamp: datetime
    department: str
    description: Optional[str] = "Procurement Service"
    invoice_id: Optional[str] = None

class BatchIngest(BaseModel):
    source: str
    transactions: List[TransactionIngest]

# --- ALERT SCHEMAS ---
class Alert(BaseModel):
    id: int
    transaction_id: int
    vendor_id: str
    invoice_id: Optional[str]
    amount: float
    department: str
    risk_score: float
    risk_band: str
    primary_trigger: str
    explanation: str
    status: str
    assigned_to: Optional[int] = None
    escalation_level: int
    deadline: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    case_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CaseCreate(BaseModel):
    title: str
    department: str
    initial_alert_ids: List[int]
    description: Optional[str] = None

class InvestigatorAction(BaseModel):
    action: str # ACKNOWLEDGE, ESCALATE, ASSIGN_COMMITTEE, CLOSE
    note: Optional[str] = None
    committee_members: Optional[List[int]] = None

class InvestigationResult(BaseModel):
    findings: str
    resolution: str # CLEARED, RECTIFIED, PENALIZED

# --- FORENSIC INTELLIGENCE SCHEMAS (Cloud-Grade Spec) ---
class ForensicFeatures(BaseModel):
    log_amount: float
    amount_z_vendor: float
    vendor_txn_count_7d: int
    vendor_txn_count_30d: int
    unique_departments_30d: int
    time_distance_noon: float

class StatSignals(BaseModel):
    amount_z_vendor: float

class ForensicPayload(BaseModel):
    transaction_id: str
    features: ForensicFeatures
    rule_hits: List[str]
    stat_signals: StatSignals

class RiskResult(BaseModel):
    rule_score: int
    stat_score: int
    ml_anomaly_score: int
    final_risk_score: int
    risk_band: str
    primary_trigger: str

class ModelInfo(BaseModel):
    model_version: str
    scoring_version: str

class ForensicResult(BaseModel):
    transaction_id: str
    risk: RiskResult
    explanation: str
    model_info: ModelInfo

# --- PROCUREMENT SCHEMAS ---
class ProcurementCreate(BaseModel):
    title: str
    department: str
    vendor_name: str
    amount: float
    description: Optional[str] = None

class ProcurementResponse(BaseModel):
    id: int
    title: str
    department: str
    amount: float
    status: str
    requestor: str
    vendor_name: str
    description: Optional[str]
    document_hash: str
    created_at: datetime
    sanctioned_at: Optional[datetime]
    sanctioner: Optional[str]

    class Config:
        from_attributes = True

class SanctionAction(BaseModel):
    action: str # SANCTION, REJECT
    comment: Optional[str] = None
