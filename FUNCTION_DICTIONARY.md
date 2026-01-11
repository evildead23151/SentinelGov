# Function Dictionary: SentinelGov Core Logic (v3.1.1)

This document provides a detailed breakdown of the critical functions and logical blocks that power the SentinelGov platform.

## 1. Backend: Detection & Intelligence (`backend/app/detection.py`)

### `AnomalyEngine.process_forensic_payload(payload)`
- **Role**: The "Scoring Pure Function". It accepts a standardized feature set and returns a risk-weighted result.
- **Logic**:
    - **Hard Constraint**: If `bid_rank == 1` AND `budget_ratio <= 1.0`, risk is forced to 0.
    - **Layer 1 (Rules)**: Rank penalties, Bid Spread penalties, and Over-Budget penalties.
    - **Layer 2 (Statistical Support)**: Z-Score calculated if `num_bidders >= 5`.
    - **Layer 3 (ML-Assisted Signals)**: Vendor win frequency checks as supporting behavioral indicators.

### `AnomalyEngine.analyze_tender(db, tender)`
- **Role**: Orchestrator for tender analysis.
- **Logic**: Fetches bids, computes features (Rank, Spread, etc.), and triggers the scoring pure function.

## 2. Backend: API Endpoints (`backend/main.py`)

### `seed_data(db)`
- **Role**: Database initializer. Now idempotent to prevent startup inconsistencies.

### `get_system_status(db)`
- **Role**: "Single Source of Truth" for KPIs. Includes funds monitored and risk exposure.

### `release_payment(tx_id, payload, db, username)`
- **Role**: Treasury Authorization gate. 
- **Logic**: Resolves administrative holds, allowing for disbursement authorization.

## 3. Frontend: Logic

### `invalidateState()`
- **Role**: Global UI synchronizer. Ensures investigators and finance leads see consistent state after any hold or release action.

### `performSearch(query)`
- **Role**: Fuzzy entity lookup for rapid discovery of vendors and tenders.

## 4. Safety Components

### `SecuredErrorBoundary`
- **Role**: Governance-aware safety wrapper. Catches UI crashes while preserving the "Secure Link" status for auditing stability.
