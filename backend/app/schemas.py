from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SystemState(BaseModel):
    status: str
    model_version: str
    last_retrain: datetime
    class Config:
        from_attributes = True

class VendorBase(BaseModel):
    name: str
    vendor_id: str
    status: str
    clearance_required: int

class TransactionBase(BaseModel):
    vendor_id: str
    amount: float
    timestamp: datetime
    department: str
    risk_score: float
    explanation: str

class EventBase(BaseModel):
    type: str
    message: str
    timestamp: datetime
