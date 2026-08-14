import pandas as pd

from model_a_inference import predict_fraud
from model_b_inference import predict_anomaly
from risk_fusion import fuse_risk


def analyze_claim(
    provider,
    claim_id,
    claim_type,
    provider_features,
    claim_features
):
    """
    End-to-end risk analysis.

    Model A:
        Provider-level fraud probability/risk.

    Model B:
        Claim-level anomaly/risk.

    Fusion:
        Combines Model A and Model B into overall risk.
    """

    claim_type = str(claim_type).upper()

    # ========================================================
    # 1. MODEL A — PROVIDER FRAUD
    # ========================================================

    fraud_result = predict_fraud(
        provider=provider,
        features=provider_features
    )

    # ========================================================
    # 2. MODEL B — CLAIM ANOMALY
    # ========================================================

    anomaly_result = predict_anomaly(
        claim_type=claim_type,
        features=claim_features
    )

    # ========================================================
    # 3. EXTRACT MODEL RESULTS
    # ========================================================

    fraud_row = fraud_result.iloc[0]
    anomaly_row = anomaly_result.iloc[0]

    fraud_probability = float(
        fraud_row["FRAUD_PROBABILITY"]
    )

    fraud_risk_score = float(
        fraud_row["FRAUD_RISK_SCORE"]
    )

    anomaly_score = float(
        anomaly_row["ANOMALY_SCORE"]
    )

    anomaly_risk_score = float(
        anomaly_row["ANOMALY_RISK_SCORE"]
    )

    anomaly_level = str(
        anomaly_row["ANOMALY_LEVEL"]
    )

    # ========================================================
    # 4. MODEL A + MODEL B FUSION
    # ========================================================

    final_result = fuse_risk(
        provider=str(provider),
        claim_id=str(claim_id),
        claim_type=claim_type,
        fraud_probability=fraud_probability,
        fraud_risk_score=fraud_risk_score,
        anomaly_score=anomaly_score,
        anomaly_risk_score=anomaly_risk_score,
        anomaly_level=anomaly_level
    )

    # ========================================================
    # 5. RETURN FINAL RESULT
    # ========================================================

    return final_result