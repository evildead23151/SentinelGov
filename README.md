# 🛡️ SentinelGov: Procedural Intelligence & Enforcement Node

[![Version](https://img.shields.io/badge/Version-3.1.1-blue)](https://github.com/evildead23151/SentinelGov)
[![Status](https://img.shields.io/badge/Status-OPERATIONAL-success)](https://github.com/evildead23151/SentinelGov)
[![Mandate](https://img.shields.io/badge/Mandate-Strict%20Enforcement-red)](https://github.com/evildead23151/SentinelGov)

*Documentation hardened for governance review.*

## SentinelGov at a Glance (Control Plane Summary)

SentinelGov is a **pre-disbursement enforcement node** for government procurement.
It intercepts suspicious procurements *before funds are released*, places them on
administrative hold, and requires authorized human clearance — leaving a full,
immutable audit trail.

### What Problem It Stops
- Payments cleared despite non-L1 awards
- Inflated bid spreads masked as valid procurement
- Over-budget tenders approved without justification
- Risks discovered only *after* funds are disbursed

### What SentinelGov Does
- Analyzes **tenders**, not just invoices
- Scores procurement risk before disbursement
- Automatically places high-risk transactions in `ON_HOLD`
- Requires role-authorized human release
- Logs every action with cryptographic integrity

### What SentinelGov Never Does
- Never cancels payments autonomously
- Never labels actions as "fraud"
- Never overrides treasury authority
- Never releases funds without clearance

### Why This Is Safe for Government Use
- Enforcement logic anchored to GFR-style rules
- Statistical checks only when data is sufficient
- Deterministic, explainable scoring
- Fully reversible decisions
- Complete audit visibility

---

## 🚀 1. The Core Philosophy
Traditional procurement monitoring systems are reactive. SentinelGov adopts an **"Administrative Hold"** approach:
- **Graph Reasoning**: Understands the relationship between specific Tenders, Bids, Vendors, and resulting Transactions.
- **Economic Integrity**: Enforces strict GFR-2017 compliant rules mixed with statistical support layers.
- **Secure Handling**: Every action is cryptographically tracked to ensure an immutable paper trail of who suppressed or sets transaction state to `ON_HOLD`, preventing authorization for disbursement.

---

## 🛡️ 2. Operational Guarantees

- **Investigators** can place any high-risk transaction into `ON_HOLD` with a single action, introducing an administrative hold prior to release.
- **Finance Officers** can release funds only after investigative clearance and mandatory justification.
- **Public Users** can verify sanctioned procurements via immutable, hash-verified records.
- **All actions** are logged with actor identity, timestamp, and integrity hash.

---

## 🛰️ 3. Key High-Level Features

### A. Tender-Centric Intelligence
Instead of monitoring single invoices, SentinelGov analyzes the **Economic Root**:
- **Rank Violation**: Automatically flags awards to Rank 2, 3, or higher bidders.
- **Spread Detection**: Measures the "Bid Spread" (Winning Price vs Lowest Price). Spreads >15% trigger critical reviews.
- **Z-Score Mapping**: Statistically compares the winning bid against the cluster of all bids to find outliers.

### B. "Secured Layer" Governance
The system includes a dedicated enforcement layer:
- **Transaction Hold**: One-click escalation to `ON_HOLD` state. This sets transaction state to `ON_HOLD`, preventing authorization for disbursement in the backend database.
- **Audit-Safe Explanations**: The system translates complex math into non-accusatory, auditor-safe language (e.g., "Deviation from competitive norms").

---

## 📜 4. Compliance & Ethics
Built for the **Hack4Delhi Governance Track**, this system prioritizes the "Instrument, Not Advisor" principle. All system-generated text includes mandatory disclaimers, and human oversight is required for final resolution.

### Explicit Non-Goals
- Real-time bank integration
- Autonomous sanctioning
- Criminal attribution or accusation
- Replacement of existing treasury systems

---

## 🔧 5. Quick Start Guide

### Installation & Run
1. **Backend**: `cd backend && python seed_tenders.py && python main.py`
2. **Frontend**: `cd frontend && npm install && npm run dev`

---

# Appendix: Technical & Audit Detail (For Reviewers)

---

## 🏛️ A1. Technical Architecture
SentinelGov operates as a **state-driven enforcement system**, not a notification engine.
No transaction can reach disbursement without passing through this state machine.

```mermaid
graph TD
    User[Investigator] -->|Enforcement| UI[React Frontend]
    UI -->|API Calls| API[FastAPI Backend]
    
    subgraph "Intelligence Core"
        API -->|Ingest| Engine[AnomalyEngine (detection.py)]
        Engine -->|Rules & ML Support| Model[Scoring Logic]
        Engine -->|Write| DB[(SQLite Database)]
    end
```

### Core Components
- **Backend**: FastAPI (Python), SQLAlchemy, Scikit-Learn (**ML-assisted behavioral signals**).
- **Frontend**: React + Vite + Tailwind CSS, Zustand.
- **Logic**: Pure scoring logic in `detection.py` with **statistical support layer**.

---

## 📖 A2. Detailed User Persona Flows (SOPs)

### Investigator Flow (Audit & Hold)
1. **Identification**: Dashboard signals a spike in "Risk Exposure".
2. **Deep Dive**: Forensic signals show "Rank 3 Awarded".
3. **Action**: Click **HOLD**. This sets transaction state to `ON_HOLD`, preventing authorization for disbursement.

### Finance Flow (Justified Release)
1. **Review**: Locate a transaction that has been "Cleared".
2. **Release**: Click **Confirm Disbursement** with mandatory justification. This resolves administrative holds.

---

## 📑 A3. API & Data Mapping
- `GET /system/status`: KPI Single Source of Truth.
- `POST /alerts/{id}/hold`: Introduces an administrative hold prior to release.
- `POST /transactions/{id}/release`: Treasury-level disbursement clearance.

*SentinelGov: Watching the Wealth of the Nation.*
