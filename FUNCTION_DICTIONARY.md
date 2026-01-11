# Function Dictionary: SentinelGov Core Logic

This document provides a detailed breakdown of the critical functions and logical blocks that power the SentinelGov platform.

## 1. Backend: Detection & Intelligence (`backend/app/detection.py`)

### `AnomalyEngine.process_forensic_payload(payload)`
- **Role**: The "Scoring Pure Function". It accepts a standardized feature set and returns a locked risk result.
- **Logic**:
    - **Hard Constraint**: If `bid_rank == 1` AND `budget_ratio <= 1.0`, risk is forced to 0.
    - **Layer 1 (Rules)**: Rank penalties (+10 for R2, +25 for R3, +50 for R4+), Bid Spread penalties, and Over-Budget penalties.
    - **Layer 2 (Stats)**: Z-Score calculated for the winning bid if `num_bidders >= 5`.
    - **Layer 3 (ML Support)**: Vendor win frequency checks.
- **Output**: Dictionary with `risk_score`, `risk_band`, `primary_trigger`, and `explanation`.

### `AnomalyEngine.analyze_tender(db, tender)`
- **Role**: Orchestrator for tender analysis.
- **Logic**: Fetches all bids for a tender, computes features (Rank, Spread, Budget Ratio, Win Frequency), calculates statistical signals, and passes the payload to `process_forensic_payload`.
- **Side Effect**: Updates risk scores and explanations for all transactions linked to the tender.

## 2. Backend: API Endpoints (`backend/main.py`)

### `seed_data(db)`
- **Role**: Database initializer.
- **Logic**: Ensures mandatory SystemState, Vendors, and Users (Investigator, Treasury, Admin) exist. Now idempotent (checks for existence before insertion).
- **Demo Scenarios**: Seeds specific sanctioned procurement records for the Transparency Board.

### `get_system_status(db)`
- **Role**: "Single Source of Truth" for KPIs.
- **Logic**: Aggregates `total_transactions`, `funds_monitored`, and `risk_exposure` (sum of amounts on hold/blocked).

### `acknowledge_alert(alert_id, db, username)`
- **Role**: Investigative lifecycle start.
- **Logic**: Marks alert as `ACKNOWLEDGED`, logs it in `ActionLog`.

### `release_payment(tx_id, payload, db, username)`
- **Role**: Financial enforcement Release.
- **Logic**: Marks transaction as `CLEARED`, automatically resolves any linked alerts as `CLEARED`, and logs the action.

## 3. Frontend: State Management (`frontend/src/store/useStore.js`)

### `switchRole(role)`
- **Role**: Demo identity switcher.
- **Logic**: Performs an auto-login with hardcoded credentials (`investigator`, `treasury`) to swap permissions instantly.

### `invalidateState()`
- **Role**: Global UI synchronizer.
- **Logic**: Triggers a parallel fetch of `Status`, `Alerts`, `Cases`, and `Messages` to ensure the dashboard reflects the latest backend state after any action.

### `performSearch(query)`
- **Role**: Fuzzy entity lookup.
- **Logic**: Uses `Fuse.js` to search across combined sources (Alerts, Vendors, Tenders) locally in the browser for high-performance results.

## 4. Frontend: Components

### `SecuredErrorBoundary`
- **Role**: Safety wrapper.
- **Logic**: Catches UI crashes (like the `SECURED_LAYER_ABORT`) and displays a fallback specialized for governance tracking.
