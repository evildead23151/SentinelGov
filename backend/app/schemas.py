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
    email: Optional[str] = None
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
    email: Optional[str] = None
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
    status: str
    explanation: str

    class Config:
        from_attributes = True

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
    tender_id: Optional[str] = None

    class Config:
        from_attributes = True

class AlertResolveRequest(BaseModel):
    note: str
    outcome: str # CLEARED, FRAUD_CONFIRMED, UNDER_INVESTIGATION

class TransactionReleaseRequest(BaseModel):
    note: Optional[str] = "Treasury Authorization"

class CaseCreate(BaseModel):
    title: str
    department: str
    initial_alert_ids: List[int]
    description: Optional[str] = None

class InvestigatorAction(BaseModel):
    action: str # ACKNOWLEDGE, ESCALATE, ASSIGN_COMMITTEE, CLOSE
    note: Optional[str] = None
    committee_members: Optional[List[int]] = None

# --- FORENSIC INTELLIGENCE SCHEMAS ---
class ForensicFeatures(BaseModel):
    bid_rank: int
    spread_ratio: float
    num_bidders: int
    tender_budget_ratio: float
    vendor_win_frequency: float

class StatSignals(BaseModel):
    z_tender: Optional[float] = None
    insufficient_depth: bool = False

class ForensicPayload(BaseModel):
    tender_id: str
    winning_vendor_id: str
    winning_bid_amount: float
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

# --- TENDER SCHEMAS ---
class BidBase(BaseModel):
    vendor_id: str
    bid_amount: float
    rank: int

class TenderBase(BaseModel):
    tender_id: str
    department: str
    estimated_budget: float
    num_bidders: int
    winning_vendor_id: str
    winning_bid_amount: float
    award_timestamp: datetime
    status: str

class TenderCreate(TenderBase):
    bids: List[BidBase]

class Tender(TenderBase):
    id: int
    bids: List[BidBase]
    class Config:
        from_attributes = True

# --- AI CHAT SCHEMAS ---
class AIChatRequest(BaseModel):
    actor_gov_id: str
    role: str
    context_scope: Optional[str] = "GENERAL"
    message: str


class AIChatResponse(BaseModel):
    reply: str
    disclaimer: str
    trace_id: str

# --- PROCUREMENT SCHEMAS ---
class ProcurementRequestBase(BaseModel):
    title: str
    description: str
    department: str
    vendor_name: str
    amount: float

class ProcurementRequestCreate(ProcurementRequestBase):
    pass

class ProcurementRequest(ProcurementRequestBase):
    id: int
    status: str
    document_hash: str
    created_at: datetime
    sanctioned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SanctionAction(BaseModel):
    action: str # SANCTIONED, REJECTED
    note: Optional[str] = None
