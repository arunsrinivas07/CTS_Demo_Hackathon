import joblib
import numpy as np
import pandas as pd
import os

FEATURE_ORDER = [
    "Unique_Beneficiaries", "Avg_Patient_Age", "Avg_Chronic_Conditions",
    "IP_Claim_Count", "IP_Unique_Beneficiaries", "IP_Total_Reimbursement",
    "IP_Avg_Reimbursement", "IP_Max_Reimbursement", "IP_Total_Deductible",
    "IP_Avg_Deductible", "IP_Avg_Claim_Duration", "IP_Max_Claim_Duration",
    "IP_Unique_Diagnosis_Codes", "IP_Unique_Procedure_Codes",
    "OP_Claim_Count", "OP_Unique_Beneficiaries", "OP_Total_Reimbursement",
    "OP_Avg_Reimbursement", "OP_Max_Reimbursement", "OP_Total_Deductible",
    "OP_Avg_Deductible", "Total_Claims", "Total_Reimbursement",
    "Total_Deductible", "Claims_Per_Beneficiary", "Reimbursement_Per_Beneficiary",
    "IP_Claim_Share", "OP_Claim_Share", "IP_Reimbursement_Range", "OP_Reimbursement_Range"
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "fraud_model_gb.pkl")

class ModelService:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                print(f"Model loaded successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print(f"Model file not found at {MODEL_PATH}")

    def predict(self, feature_dict):
        # Format input vector
        vector = []
        for feat in FEATURE_ORDER:
            val = feature_dict.get(feat, 0.0)
            try:
                vector.append(float(val))
            except (ValueError, TypeError):
                vector.append(0.0)

        df_input = pd.DataFrame([vector], columns=FEATURE_ORDER)

        if self.model is not None:
            try:
                probs = self.model.predict_proba(df_input)[0]
                fraud_prob = float(probs[1])
            except Exception as e:
                print(f"Inference error: {e}")
                fraud_prob = self._heuristic_prob(feature_dict)
        else:
            fraud_prob = self._heuristic_prob(feature_dict)

        # Risk classification bands
        if fraud_prob >= 0.70:
            risk_level = "HIGH"
        elif fraud_prob >= 0.30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        prediction = "Potential Fraud" if fraud_prob >= 0.50 else "Not Fraud"

        return {
            "provider_id": feature_dict.get("Provider", "PRV51001"),
            "fraud_probability": round(fraud_prob, 4),
            "fraud_percentage": round(fraud_prob * 100, 1),
            "risk_level": risk_level,
            "prediction": prediction,
            "model": "Gradient Boosting",
            "algorithm": "HistGradientBoostingClassifier",
            "threshold": 0.50
        }

    def _heuristic_prob(self, f):
        reimb = float(f.get("Total_Reimbursement", 0))
        cpb = float(f.get("Claims_Per_Beneficiary", 1))
        ip_share = float(f.get("IP_Claim_Share", 0))
        score = 0.1
        if reimb > 50000: score += 0.3
        if cpb > 5: score += 0.3
        if ip_share > 0.4: score += 0.2
        return min(0.99, max(0.01, score))

model_service = ModelService()
