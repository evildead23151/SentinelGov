# National Procurement Integrity Shield (SentinelGov)

## 1. Product Overview
SentinelGov is an enterprise-grade intelligence platform designed for government-scale oversight of public spending and procurement. The platform serves as a "Command Center" for auditors, investigators, and compliance officers, providing a centralized interface to monitor, detect, and investigate financial anomalies with forensic precision.

## 2. Platform Architecture (Integrated)

SentinelGov is a full-stack intelligence platform bridging forensic data pipelines with military-grade visualization.

- **Frontend Core:** **React + Vite** for zero-latency UI.
- **Backend API:** **FastAPI (Python)** serving high-concurrency intelligence endpoints.
- **Database:** **SQLAlchemy** (PostgreSQL/SQLite) for immutable transaction storage.
- **Detection Core (Cortex):**
    - **Logic Layer:** Deterministic rule-checks (Structuring, Velocity, Duplicates).
    - **Statistical Layer:** Multi-sigma Z-Score outlier detection.
    - **ML Layer:** Isolation Forest (Scikit-Learn) for unsupervised pattern recognition.
- **Search Logic:** **Fuse.js** client-side fuzzy indexing for sub-millisecond entity discovery.

## 3. Detection Engine (Cortex)

SentinelGov's intelligence is built on a **50/50/20 Risk Matrix**:
1. **Rule Violation (Max 50 pts):** Direct hits on pre-defined procurement red flags.
2. **Statistical Outlier (Max 50 pts):** Based on Z-score deviation from historical expenditure baseline.
3. **ML Anomaly (Max 20 pts):** Unsupervised Isolation Forest detection of multi-dimensional feature variance.

## 4. Key Integrated Features

*   **Integrated Intelligence Dashboard**: Real-time stats and alerts synchronized with the FastAPI backend.
*   **Cryptographic Data Ingestion**: Secure CSV upload protocol that triggers instant forensic analysis using the Anomaly Engine.
*   **Advanced Fuzzy Search**: Fuse.js powered command palette searching across Vendors, Cases, and Alerts.
*   **Signal Notifications**: Polling-based live notification system for critical system events.
*   **Auditor-Safe Explanations**: Automated generation of non-accusatory, evidence-based risk reports.

## 5. Page-by-Page Documentation

### Secure Entry / Authentication Page
- **Purpose:** Controls system access and establishes clearance level (L1-L5).
- **Security:** PIN-based entry simulation (**Default: 1234**).

### System Overview Dashboard
- **Key Actions:** Monitor real-time risk exposure and view the live intelligence feed.
- **Data Shown:** Real-time metrics fetched from `/api/system/status`.

### Data Ingestion Protocol
- **Workflow:** Drag & drop CSV files to initiate batch verification.
- **Endpoint:** Communicates with `/api/ingest/upload` for real-time analysis.

### Detection & Case Management
- Full lifecycle management of high-risk entities with automated Intelligence Briefs.

## 6. Tech Stack

| Technology | Role |
| :--- | :--- |
| **React (Vite)** | Core UI Framework |
| **FastAPI** | Intelligence API Layer |
| **Zustand** | Async State Management |
| **Fuse.js** | Advanced Fuzzy Search |
| **Recharts** | Forensic Data Vis |
| **Scikit-Learn** | Anomaly Detection (AI) |

## 7. Current Status & Roadmap
- **Phase 1 ✅:** Interactive Frontend Prototype & Aesthetic 3.0.
- **Phase 2 ✅:** Backend API Integration, Real-time Ingestion, and Fuzzy Search.
- **Phase 3 (Next):** High-availability Graph Database (Neo4j) for Conflict-of-Interest (CoI) analysis.
- **Phase 4:** Production deployment with Kubernetes and military-grade RBAC.

## 8. Usage Instructions

### Local Setup
1. **Backend**: `cd backend && pip install -r requirements.txt && python main.py`
2. **Frontend**: `cd frontend && npm install && npm run dev`

### Navigating the Demo
1. **Login**: Use PIN **1234**.
2. **Ingest**: Upload a `.csv` in the Ingestion page to see the Anomaly Engine in action.
3. **Search**: Use the top search bar to find vendors or alerts using fuzzy logic.
4. **Dashboard**: Observe real-time metric updates as data flows into the system.

---
*Disclaimer: SentinelGov is a prototype/educational system. All data and personas are simulations.*
