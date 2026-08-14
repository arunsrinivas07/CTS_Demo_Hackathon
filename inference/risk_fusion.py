from pathlib import Path
import pandas as pd


# ============================================================
# RISK FUSION CONFIGURATION
# ============================================================

# Model A = provider-level fraud detection
FRAUD_WEIGHT = 0.60

# Model B = claim-level anomaly detection
ANOMALY_WEIGHT = 0.40


# ============================================================
# VALIDATE WEIGHTS
# ============================================================

if abs((FRAUD_WEIGHT + ANOMALY_WEIGHT) - 1.0) > 1e-9:
    raise ValueError(
        "Fraud and anomaly weights must sum to 1.0"
    )


# ============================================================
# OVERALL RISK LEVEL
# ============================================================

def get_overall_risk_level(score):

    if score >= 75:
        return "CRITICAL"

    elif score >= 50:
        return "HIGH"

    elif score >= 25:
        return "MEDIUM"

    else:
        return "LOW"


# ============================================================
# FUSE MODEL A + MODEL B
# ============================================================

def calculate_overall_risk(
    fraud_risk_score,
    anomaly_risk_score
):

    fraud_risk_score = float(
        fraud_risk_score
    )

    anomaly_risk_score = float(
        anomaly_risk_score
    )

    # --------------------------------------------------------
    # Validate input ranges
    # --------------------------------------------------------

    if not 0 <= fraud_risk_score <= 100:

        raise ValueError(
            f"Fraud risk score must be "
            f"between 0 and 100. "
            f"Received: {fraud_risk_score}"
        )

    if not 0 <= anomaly_risk_score <= 100:

        raise ValueError(
            f"Anomaly risk score must be "
            f"between 0 and 100. "
            f"Received: {anomaly_risk_score}"
        )

    # --------------------------------------------------------
    # Weighted fusion
    # --------------------------------------------------------

    overall_score = (
        FRAUD_WEIGHT * fraud_risk_score
        +
        ANOMALY_WEIGHT * anomaly_risk_score
    )

    overall_score = max(
        0.0,
        min(100.0, overall_score)
    )

    risk_level = get_overall_risk_level(
        overall_score
    )

    return {
        "FRAUD_RISK_SCORE": fraud_risk_score,
        "ANOMALY_RISK_SCORE": anomaly_risk_score,
        "OVERALL_RISK_SCORE": overall_score,
        "OVERALL_RISK_LEVEL": risk_level
    }


# ============================================================
# FUSE COMPLETE MODEL OUTPUTS
# ============================================================

def fuse_risk(
    provider,
    claim_id,
    claim_type,
    fraud_probability,
    fraud_risk_score,
    anomaly_score,
    anomaly_risk_score,
    anomaly_level
):

    result = calculate_overall_risk(
        fraud_risk_score=fraud_risk_score,
        anomaly_risk_score=anomaly_risk_score
    )

    return {
        "Provider": str(provider),
        "CLM_ID": str(claim_id),
        "CLAIM_TYPE": str(claim_type),

        "FRAUD_PROBABILITY": float(
            fraud_probability
        ),

        "FRAUD_RISK_SCORE": result[
            "FRAUD_RISK_SCORE"
        ],

        "ANOMALY_SCORE": float(
            anomaly_score
        ),

        "ANOMALY_RISK_SCORE": result[
            "ANOMALY_RISK_SCORE"
        ],

        "ANOMALY_LEVEL": str(
            anomaly_level
        ),

        "OVERALL_RISK_SCORE": result[
            "OVERALL_RISK_SCORE"
        ],

        "OVERALL_RISK_LEVEL": result[
            "OVERALL_RISK_LEVEL"
        ]
    }