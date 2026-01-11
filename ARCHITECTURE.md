# Technical Architecture: SentinelGov v3.1.1

## 1. System Vision
SentinelGov is built on the principle of **Procedural Integrity**. SentinelGov operates as a **state-driven enforcement system**, not a notification engine. No transaction can reach disbursement without passing through this state machine.

## 2. Multi-Layered Intelligence Engine (Support Layers)
The brain of the system is the `AnomalyEngine` in `backend/app/detection.py`. It operates in three distinct layers to ensure accuracy and reduce false positives.

### Layer 1: Deterministic Rules (0-50 pts)
- **Rank Violation**: Implements a strict penalty for awarding to non-L1 bidders.
  - Rank 2: +10 pts
  - Rank 3: +25 pts
  - Rank 4+: +50 pts (Immediate Review Required)
- **Spread Analysis**:
  - `Spread = (Winning - Lowest) / Lowest`
  - >15%: +25 pts
  - >30%: +50 pts
- **Budget Compliance**:
  - >10% over: +10 pts
  - >20% over: +20 pts

### Layer 2: Statistical Support Layer (0-50 pts)
- **Condition**: Only triggers if `num_bidders >= 5` to ensure statistical significance.
- **Statistical Z-Score**: Calculates the absolute Z-score of the winning bid relative to the bid cluster. A Z-score > 1.5 provides non-authoritative anomaly indicators.

### Layer 3: ML-Assisted Behavioral Signals (0-20 pts)
- **Vendor Velocity**: Monitors how frequently a vendor wins tenders across the entire system.
- **Trigger**: Win frequency > 40% adds +10 pts as a supporting signal of potential vendor-lock.

---

## 3. The "Secured Layer" Workflow (State Machine)
The system enforces a strict administrative state machine for all financial transactions:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Ingestion
    PENDING --> ON_HOLD: Risk Score >= 50
    PENDING --> CLEARED: Risk Score < 50
    ON_HOLD --> CLEARED: Investigator Resolve
    ON_HOLD --> BLOCKED: Administrative Dismissal
    CLEARED --> [*]: Disbursement Authorization
```

### Data Flow Path
1. **Ingest**: `main.py` receives CSV/JSON data.
2. **Features**: `detection.py` computes the graph features (Rank, Spread, etc.).
3. **Score**: The Locked Scoring Formula computes the `final_risk_score`.
4. **Guard**: If Score > 50, the transaction sets transaction state to `ON_HOLD`, preventing authorization for disbursement.
5. **Enforcement**: Dashboard updates the **Risk Exposure** and **Payments on Hold** KPIs.

---

## 4. Frontend Resilience Architecture
The React frontend is designed for high-availability governance:
- **Zustand Store**: The `useStore.js` acts as a local cache of the backend's "Single Source of Truth".
- **Validation Engine**: The `invalidateState()` function ensures that any change in the backend (e.g., a "Hold" action) is immediately reflected across all KPI cards.

---

## 5. Security & Administrative Audit
- **Identity Mocking**: Header-based RBAC simulating a government intranet.
- **Action Logging**: Every action creates an `ActionLog` entry with a unique SHA-256 integrity hash, preventing log tampering.
- **Transparency**: The public endpoint allows external auditors to verify hashes without accessing internal data.

*Drafted for Governance and Technical Review.*
