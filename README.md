# 🛡️ SentinelGov: Procedural Intelligence & Enforcement Node

[![Version](https://img.shields.io/badge/Version-3.1.0-blue)](https://github.com/evildead23151/SentinelGov)
[![Status](https://img.shields.io/badge/Status-OPERATIONAL-success)](https://github.com/evildead23151/SentinelGov)
[![Mandate](https://img.shields.io/badge/Mandate-Strict%20Enforcement-red)](https://github.com/evildead23151/SentinelGov)

SentinelGov (PROJ-SENTINEL) is an advanced **Procedural Intelligence Node** engineered to safeguard government procurement through real-time, automated monitoring and enforcement. Unlike conventional reporting tools, SentinelGov acts as an active gatekeeper, identifying and freezing irregular financial flows before they can be realized.

---

## 🚀 1. The Core Philosophy
Traditional procurement monitoring systems are reactive. SentinelGov adopts a **"Enforcement First"** approach:
- **Graph Reasoning**: Understands the relationship between specific Tenders, Bids, Vendors, and resulting Transactions.
- **Economic Integrity**: Enforces strict GFR-2017 compliant rules mixed with statistical anomaly detection.
- **Secure Handling**: Every action is cryptographically tracked to ensure an immutable paper trail of who suppressed or cleared an alert.

---

## 🛠️ 2. Technology Stack

### Backend Core
- **API Engine**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.9+)
- **ORM & Data**: [SQLAlchemy](https://www.sqlalchemy.org/) with [SQLite](https://www.sqlite.org/index.html)
- **Analytics**: [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/) for rapid feature extraction
- **Anomaly Engine**: [Scikit-Learn](https://scikit-learn.org/) (IsolationForest for behavioral analysis)

### Frontend Surface
- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Simplified Global Store)
- **Visualization**: [Recharts](https://recharts.org/) & [Lucide-React](https://lucide.dev/) Icons
- **Responsiveness**: [Tailwind CSS v3](https://tailwindcss.com/)

---

## 🛰️ 3. Key Features in Detail

### A. Tender-Centric Intelligence
Instead of monitoring single invoices, SentinelGov analyzes the **Economic Root**:
- **Rank Violation**: Automatically flags awards to Rank 2, 3, or higher bidders.
- **Spread Detection**: Measures the "Bid Spread" (Winning Price vs Lowest Price). Spreads >15% trigger critical reviews.
- **Z-Score Mapping**: Statistically compares the winning bid against the cluster of all bids to find outliers.

### B. "Secured Layer" Enforcement
The system includes a dedicated enforcement layer:
- **Transaction Freeze**: One-click escalation to `ON_HOLD` state. This instantly locks the funds in the backend database.
- **Audit-Safe Explanations**: The AI generator translates complex math into non-accusatory, auditor-safe language (e.g., "Deviation from competitive norms" vs "Fraud").

### C. Transparency Board
A public-facing portal that discloses all **Sanctioned** procurements. This ensures public trust by showing only verified, cleared expenditures with cryptographic hashes for integrity.

---

## 🔧 4. Deployment & Setup

### Backend (The Intelligence Node)
1. **Initialize Environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
2. **Seed the Simulation Universe**:
   ```bash
   # This generates the Tenders, Bids, and Transactions for the demo
   python seed_tenders.py
   ```
3. **Launch API**:
   ```bash
   python main.py
   ```

### Frontend (The Control Surface)
1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```

---

## 🧪 5. Testing the Delhi Police Scenario
1. **Log in** as Investigator (Default auto-login).
2. **Visit Detection Center**: Look for the **9MM Ammunition** tender.
3. **Analyze**: You will see it is Rank 3 and 10% Over-Budget.
4. **Action**: Click **FREEZE**.
5. **Verify**: Check the **Dashboard**; "Payments on Hold" should reflect the 55Cr value.

---

## 📜 6. Compliance & Ethics
Built for the **Hack4Delhi Governance Track**, this system prioritizes the "Instrument, Not Advisor" principle. All AI-generated text includes mandatory disclaimers, and human oversight is required for final resolution.

*SentinelGov: Watching the Wealth of the Nation.*
