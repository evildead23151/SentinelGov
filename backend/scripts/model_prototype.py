"""
SentinelGov Intelligence Engine - Prototype Logic (v2.0)
This script demonstrates the "Hybrid Stack" approach defined in the architecture doc.
It creates a synthetic dataset, engineering features, and calculates the composite Risk Score.

Dependencies: pandas, numpy, sklearn
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# 1. Synthetic Data Generation (Advanced)
def generate_advanced_data(n=1000):
    np.random.seed(42)
    data = []
    
    # Normal traffic
    for _ in range(950):
        data.append({
            "amount": np.random.normal(5000, 1000), # Normal amount
            "hour": np.random.choice([9, 10, 11, 13, 14, 15, 16]), # Business hours
            "dept_id": np.random.randint(1, 5),
            "vendor_id": f"V-{np.random.randint(1, 50)}",
            "is_fraud": 0
        })
        
    # Anomaly: Weekend/Night Bulk (ML Signal)
    for _ in range(20):
        data.append({
            "amount": np.random.normal(5000, 1000),
            "hour": np.random.choice([1, 2, 3, 23]), # Night time
            "dept_id": np.random.randint(1, 5),
            "vendor_id": "V-BAD-1",
            "is_fraud": 1
        })
        
    # Anomaly: Structuring (Rule Signal)
    for _ in range(30):
        data.append({
            "amount": np.random.uniform(9800, 9999), # Structuring
            "hour": 10,
            "dept_id": 1,
            "vendor_id": "V-BAD-2",
            "is_fraud": 1
        })
        
    return pd.DataFrame(data)

# 2. Feature Engineering
def engineer_features(df):
    # Log Amount (Scale invariance)
    df['log_amount'] = np.log1p(df['amount'])
    
    # Time deviation (Distance from noon)
    df['time_risk'] = abs(df['hour'] - 12) 
    
    # Department Entropy (Velocity proxy for prototype)
    # real impl would use rolling windows
    return df

# 3. Hybrid Scoring Engine
def calculate_risk_score(df):
    # --- Layer 1: Rules (Alpha = 50) ---
    df['rule_score'] = 0
    # Rule: Structuring (9000-10000)
    df.loc[(df['amount'] >= 9000) & (df['amount'] < 10000), 'rule_score'] = 50
    
    # --- Layer 2: Statistics (Beta = 10 per sigma) ---
    # Z-Score of amount
    mean = df['amount'].mean()
    std = df['amount'].std()
    df['z_score'] = abs((df['amount'] - mean) / std)
    df['stat_score'] = df['z_score'].clip(upper=5) * 10
    
    # --- Layer 3: ML (Gamma = 20) ---
    # ML Score is supporting signal only (Max 20 points)
    features = ['log_amount', 'time_risk']
    iso = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly_pred'] = iso.fit_predict(df[features]) # -1 is anomaly
    
    # Invert decision function to get 0-1 normalized score roughly
    df['raw_ml_score'] = -iso.decision_function(df[features]) 
    df['ml_risk'] = 0
    df.loc[df['anomaly_pred'] == -1, 'ml_risk'] = 20 # Simple binary cap for prototype safety
    
    # --- Final Composition ---
    # Risk = Min(100, Rule + Stat + ML)
    df['final_risk_score'] = df[['rule_score', 'stat_score', 'ml_risk']].sum(axis=1)
    df['final_risk_score'] = df['final_risk_score'].clip(upper=100)
    
    return df

# Main Execution
if __name__ == "__main__":
    print("Initializing SentinelGov Prototype Engine...")
    df = generate_advanced_data()
    print(f"Generated {len(df)} transactions.")
    
    df = engineer_features(df)
    df = calculate_risk_score(df)
    
    print("\n--- Top Risky Transactions ---")
    print(df.sort_values('final_risk_score', ascending=False).head(5)[['vendor_id', 'amount', 'rule_score', 'stat_score', 'ml_risk', 'final_risk_score']])
    
    print("\n--- Validation Stats ---")
    fraud_caught = df[df['is_fraud'] == 1]['final_risk_score'].mean()
    normal_score = df[df['is_fraud'] == 0]['final_risk_score'].mean()
    print(f"Avg Score (Fraud): {fraud_caught:.1f}")
    print(f"Avg Score (Normal): {normal_score:.1f}")
    print(f"Separation Delta: {fraud_caught - normal_score:.1f}")
