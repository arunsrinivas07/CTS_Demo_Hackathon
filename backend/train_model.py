import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
import joblib
import os

def generate_synthetic_data(n_samples=5410, n_fraud=506, seed=42):
    np.random.seed(seed)
    n_normal = n_samples - n_fraud
    
    # Provider IDs
    providers = [f"PRV{51001 + i}" for i in range(n_samples)]
    
    # Normal providers
    norm_benes = np.random.randint(10, 300, n_normal)
    norm_age = np.random.uniform(62.0, 78.0, n_normal)
    norm_chronic = np.random.uniform(1.2, 3.8, n_normal)
    
    norm_ip_claims = np.random.randint(0, 40, n_normal)
    norm_ip_benes = np.clip((norm_ip_claims * np.random.uniform(0.6, 0.95, n_normal)).astype(int), 0, norm_benes)
    norm_ip_reimb = norm_ip_claims * np.random.uniform(1500, 4500, n_normal)
    norm_ip_avg_reimb = np.where(norm_ip_claims > 0, norm_ip_reimb / np.maximum(norm_ip_claims, 1), 0)
    norm_ip_max_reimb = norm_ip_avg_reimb * np.random.uniform(1.1, 2.5, n_normal)
    norm_ip_ded = norm_ip_claims * np.random.uniform(100, 500, n_normal)
    norm_ip_avg_ded = np.where(norm_ip_claims > 0, norm_ip_ded / np.maximum(norm_ip_claims, 1), 0)
    norm_ip_dur = np.random.uniform(1.5, 6.0, n_normal)
    norm_ip_max_dur = norm_ip_dur * np.random.uniform(1.2, 2.8, n_normal)
    norm_ip_diag = np.random.randint(1, 15, n_normal)
    norm_ip_proc = np.random.randint(0, 8, n_normal)
    
    norm_op_claims = np.random.randint(5, 200, n_normal)
    norm_op_benes = np.clip((norm_op_claims * np.random.uniform(0.5, 0.9, n_normal)).astype(int), 1, norm_benes)
    norm_op_reimb = norm_op_claims * np.random.uniform(200, 900, n_normal)
    norm_op_avg_reimb = np.where(norm_op_claims > 0, norm_op_reimb / np.maximum(norm_op_claims, 1), 0)
    norm_op_max_reimb = norm_op_avg_reimb * np.random.uniform(1.2, 3.0, n_normal)
    norm_op_ded = norm_op_claims * np.random.uniform(20, 150, n_normal)
    norm_op_avg_ded = np.where(norm_op_claims > 0, norm_op_ded / np.maximum(norm_op_claims, 1), 0)

    # Fraudulent providers
    fraud_benes = np.random.randint(15, 450, n_fraud)
    fraud_age = np.random.uniform(60.0, 80.0, n_fraud)
    fraud_chronic = np.random.uniform(2.5, 5.5, n_fraud)
    
    fraud_ip_claims = np.random.randint(15, 120, n_fraud)
    fraud_ip_benes = np.clip((fraud_ip_claims * np.random.uniform(0.7, 0.98, n_fraud)).astype(int), 1, fraud_benes)
    fraud_ip_reimb = fraud_ip_claims * np.random.uniform(6000, 18000, n_fraud)
    fraud_ip_avg_reimb = fraud_ip_reimb / np.maximum(fraud_ip_claims, 1)
    fraud_ip_max_reimb = fraud_ip_avg_reimb * np.random.uniform(1.5, 4.0, n_fraud)
    fraud_ip_ded = fraud_ip_claims * np.random.uniform(400, 1200, n_fraud)
    fraud_ip_avg_ded = fraud_ip_ded / np.maximum(fraud_ip_claims, 1)
    fraud_ip_dur = np.random.uniform(4.5, 14.0, n_fraud)
    fraud_ip_max_dur = fraud_ip_dur * np.random.uniform(1.5, 3.5, n_fraud)
    fraud_ip_diag = np.random.randint(5, 30, n_fraud)
    fraud_ip_proc = np.random.randint(2, 20, n_fraud)
    
    fraud_op_claims = np.random.randint(30, 450, n_fraud)
    fraud_op_benes = np.clip((fraud_op_claims * np.random.uniform(0.6, 0.95, n_fraud)).astype(int), 1, fraud_benes)
    fraud_op_reimb = fraud_op_claims * np.random.uniform(800, 3200, n_fraud)
    fraud_op_avg_reimb = fraud_op_reimb / np.maximum(fraud_op_claims, 1)
    fraud_op_max_reimb = fraud_op_avg_reimb * np.random.uniform(2.0, 5.0, n_fraud)
    fraud_op_ded = fraud_op_claims * np.random.uniform(100, 450, n_fraud)
    fraud_op_avg_ded = fraud_op_ded / np.maximum(fraud_op_claims, 1)

    # Combine arrays
    benes = np.concatenate([norm_benes, fraud_benes])
    age = np.concatenate([norm_age, fraud_age])
    chronic = np.concatenate([norm_chronic, fraud_chronic])
    
    ip_claims = np.concatenate([norm_ip_claims, fraud_ip_claims])
    ip_benes = np.concatenate([norm_ip_benes, fraud_ip_benes])
    ip_reimb = np.concatenate([norm_ip_reimb, fraud_ip_reimb])
    ip_avg_reimb = np.concatenate([norm_ip_avg_reimb, fraud_ip_avg_reimb])
    ip_max_reimb = np.concatenate([norm_ip_max_reimb, fraud_ip_max_reimb])
    ip_ded = np.concatenate([norm_ip_ded, fraud_ip_ded])
    ip_avg_ded = np.concatenate([norm_ip_avg_ded, fraud_ip_avg_ded])
    ip_dur = np.concatenate([norm_ip_dur, fraud_ip_dur])
    ip_max_dur = np.concatenate([norm_ip_max_dur, fraud_ip_max_dur])
    ip_diag = np.concatenate([norm_ip_diag, fraud_ip_diag])
    ip_proc = np.concatenate([norm_ip_proc, fraud_ip_proc])
    
    op_claims = np.concatenate([norm_op_claims, fraud_op_claims])
    op_benes = np.concatenate([norm_op_benes, fraud_op_benes])
    op_reimb = np.concatenate([norm_op_reimb, fraud_op_reimb])
    op_avg_reimb = np.concatenate([norm_op_avg_reimb, fraud_op_avg_reimb])
    op_max_reimb = np.concatenate([norm_op_max_reimb, fraud_op_max_reimb])
    op_ded = np.concatenate([norm_op_ded, fraud_op_ded])
    op_avg_ded = np.concatenate([norm_op_avg_ded, fraud_op_avg_ded])
    
    targets = np.concatenate([np.zeros(n_normal, dtype=int), np.ones(n_fraud, dtype=int)])
    
    # Derived features
    total_claims = ip_claims + op_claims
    total_reimb = ip_reimb + op_reimb
    total_ded = ip_ded + op_ded
    
    claims_per_bene = np.where(benes > 0, total_claims / benes, 0)
    reimb_per_bene = np.where(benes > 0, total_reimb / benes, 0)
    
    ip_claim_share = np.where(total_claims > 0, ip_claims / total_claims, 0)
    op_claim_share = np.where(total_claims > 0, op_claims / total_claims, 0)
    
    ip_reimb_range = ip_max_reimb - ip_avg_reimb
    op_reimb_range = op_max_reimb - op_avg_reimb

    # Shuffle dataset
    indices = np.arange(n_samples)
    np.random.shuffle(indices)

    df = pd.DataFrame({
        "Provider": np.array(providers)[indices],
        "Unique_Beneficiaries": benes[indices],
        "Avg_Patient_Age": age[indices],
        "Avg_Chronic_Conditions": chronic[indices],
        "IP_Claim_Count": ip_claims[indices],
        "IP_Unique_Beneficiaries": ip_benes[indices],
        "IP_Total_Reimbursement": ip_reimb[indices],
        "IP_Avg_Reimbursement": ip_avg_reimb[indices],
        "IP_Max_Reimbursement": ip_max_reimb[indices],
        "IP_Total_Deductible": ip_ded[indices],
        "IP_Avg_Deductible": ip_avg_ded[indices],
        "IP_Avg_Claim_Duration": ip_dur[indices],
        "IP_Max_Claim_Duration": ip_max_dur[indices],
        "IP_Unique_Diagnosis_Codes": ip_diag[indices],
        "IP_Unique_Procedure_Codes": ip_proc[indices],
        "OP_Claim_Count": op_claims[indices],
        "OP_Unique_Beneficiaries": op_benes[indices],
        "OP_Total_Reimbursement": op_reimb[indices],
        "OP_Avg_Reimbursement": op_avg_reimb[indices],
        "OP_Max_Reimbursement": op_max_reimb[indices],
        "OP_Total_Deductible": op_ded[indices],
        "OP_Avg_Deductible": op_avg_ded[indices],
        "Total_Claims": total_claims[indices],
        "Total_Reimbursement": total_reimb[indices],
        "Total_Deductible": total_ded[indices],
        "Claims_Per_Beneficiary": claims_per_bene[indices],
        "Reimbursement_Per_Beneficiary": reimb_per_bene[indices],
        "IP_Claim_Share": ip_claim_share[indices],
        "OP_Claim_Share": op_claim_share[indices],
        "IP_Reimbursement_Range": ip_reimb_range[indices],
        "OP_Reimbursement_Range": op_reimb_range[indices],
        "PotentialFraud": ["Yes" if t == 1 else "No" for t in targets[indices]]
    })
    
    return df

def train_and_save():
    df = generate_synthetic_data()
    
    # Save CSV
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/provider_features_v2.csv", index=False)
    print(f"Generated dataset saved to data/provider_features_v2.csv ({len(df)} rows)")
    
    # Extract features & target
    feature_cols = [c for c in df.columns if c not in ["Provider", "PotentialFraud"]]
    X = df[feature_cols]
    y = (df["PotentialFraud"] == "Yes").astype(int)
    
    # Fit HistGradientBoostingClassifier
    clf = HistGradientBoostingClassifier(random_state=42, max_iter=100)
    clf.fit(X, y)
    
    # Save model artifact
    os.makedirs("models", exist_ok=True)
    joblib.dump(clf, "models/fraud_model_gb.pkl")
    print("Model HistGradientBoostingClassifier fitted and saved to models/fraud_model_gb.pkl")

if __name__ == "__main__":
    train_and_save()
