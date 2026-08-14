from pathlib import Path
import sys
from fastapi import APIRouter, HTTPException

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.schemas import ClaimAnalysisRequest, ClaimAnalysisResponse
from feature_builders.claim_feature_builder import build_claim_features
from inference.model_a_inference import predict_fraud
from inference.model_b_inference import predict_anomaly
from inference.risk_fusion import fuse_risk, get_overall_risk_level
from xai.shap_service import explain_fraud, explain_anomaly

import pandas as pd
import numpy as np

# Load provider context datasets
MODEL_A_PROVIDER_FILE = PROJECT_ROOT / "data" / "processed" / "features" / "provider_features_v2.csv"
if MODEL_A_PROVIDER_FILE.exists():
    try:
        provider_df = pd.read_csv(MODEL_A_PROVIDER_FILE)
        MODEL_A_PROVIDER_LOOKUP = provider_df.set_index("Provider").to_dict(orient="index")
    except Exception as e:
        print(f"Error loading Model A provider context: {e}")
        MODEL_A_PROVIDER_LOOKUP = {}
else:
    MODEL_A_PROVIDER_LOOKUP = {}

MODEL_B_INPATIENT_PROVIDER_FILE = PROJECT_ROOT / "data" / "processed" / "primary" / "inpatient_provider_features.csv"
if MODEL_B_INPATIENT_PROVIDER_FILE.exists():
    try:
        inpatient_provider_df = pd.read_csv(MODEL_B_INPATIENT_PROVIDER_FILE)
        INPATIENT_PROVIDER_LOOKUP = inpatient_provider_df.set_index("PRVDR_NUM").to_dict(orient="index")
    except Exception as e:
        print(f"Error loading Model B inpatient provider context: {e}")
        INPATIENT_PROVIDER_LOOKUP = {}
else:
    INPATIENT_PROVIDER_LOOKUP = {}


router = APIRouter(prefix="/api", tags=["Claim Analysis"])


@router.get("/health")
def health_check():
    """
    Health check endpoint for the fraud detection API.
    """
    return {"status": "ok"}


@router.post("/analyze-claim", response_model=ClaimAnalysisResponse)
def analyze_claim_endpoint(request: ClaimAnalysisRequest, detail: bool = False):
    """
    Production endpoint to analyze a raw claim for fraud (Model A) and anomaly (Model B).
    Pass ?detail=true to receive full all_feature_contributions lists.
    """
    provider_id = request.provider_id
    claim_id = request.claim_id
    claim_type_clean = str(request.claim_type).upper()
    raw_claim = request.claim

    if not provider_id or not provider_id.strip():
        raise HTTPException(
            status_code=422,
            detail="provider_id must be a non-empty string.",
        )

    if not claim_id or not claim_id.strip():
        raise HTTPException(
            status_code=422,
            detail="claim_id must be a non-empty string.",
        )

    if claim_type_clean not in ["CARRIER", "OUTPATIENT", "INPATIENT"]:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid claim_type '{request.claim_type}'. Must be one of CARRIER, OUTPATIENT, or INPATIENT.",
        )

    if not raw_claim or not isinstance(raw_claim, dict):
        raise HTTPException(
            status_code=422,
            detail="'claim' payload must be a non-empty dictionary.",
        )

    # 1. Provider Context Lookup
    model_a_ctx = MODEL_A_PROVIDER_LOOKUP.get(provider_id)

    # Look up Model B inpatient provider features if applicable
    model_b_inpatient_ctx = {}
    if claim_type_clean == "INPATIENT":
        prvdr_num = raw_claim.get("PRVDR_NUM") or raw_claim.get("provider_id") or provider_id
        if prvdr_num in INPATIENT_PROVIDER_LOOKUP:
            model_b_inpatient_ctx = INPATIENT_PROVIDER_LOOKUP[prvdr_num]
        elif str(prvdr_num) in INPATIENT_PROVIDER_LOOKUP:
            model_b_inpatient_ctx = INPATIENT_PROVIDER_LOOKUP[str(prvdr_num)]

    # Combine context
    combined_context = {}
    if model_a_ctx:
        combined_context.update(model_a_ctx)
    if model_b_inpatient_ctx:
        combined_context.update(model_b_inpatient_ctx)

    # 2. Feature Building Layer
    try:
        built = build_claim_features(
            claim_type=claim_type_clean,
            raw_claim=raw_claim,
            provider_context=combined_context if combined_context else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error building features: {str(e)}",
        )

    # 3. Model B Inference (Claim Anomaly)
    df_b = built["model_b"]["features"]
    
    # Ensure provider_id is excluded from features
    if "provider_id" in df_b.columns:
        df_b = df_b.drop(columns=["provider_id"])
    if "Provider" in df_b.columns:
        df_b = df_b.drop(columns=["Provider"])

    anomaly_df = predict_anomaly(claim_type_clean, df_b)
    anomaly_row = anomaly_df.iloc[0]

    anomaly_raw_score = float(anomaly_row["ANOMALY_SCORE"])
    anomaly_risk_score = float(anomaly_row["ANOMALY_RISK_SCORE"])
    anomaly_level = str(anomaly_row["ANOMALY_LEVEL"])

    anomaly_res = {
        "available": True,
        "raw_score": anomaly_raw_score,
        "risk_score": anomaly_risk_score,
        "level": anomaly_level,
        "explanation": explain_anomaly(claim_type_clean, df_b, detail=detail),
    }

    # 4. Model A Inference (Provider Fraud) & Fusion
    if model_a_ctx is not None:
        df_a = built["model_a"]["features"]
        
        # Ensure provider_id is excluded from features
        if "provider_id" in df_a.columns:
            df_a = df_a.drop(columns=["provider_id"])
        if "Provider" in df_a.columns:
            df_a = df_a.drop(columns=["Provider"])

        fraud_df = predict_fraud(provider=provider_id, features=df_a)
        fraud_row = fraud_df.iloc[0]

        fraud_prob = float(fraud_row["FRAUD_PROBABILITY"])
        fraud_risk = float(fraud_row["FRAUD_RISK_SCORE"])
        fraud_level = (
            "CRITICAL"
            if fraud_risk >= 75
            else ("HIGH" if fraud_risk >= 50 else ("MEDIUM" if fraud_risk >= 25 else "LOW"))
        )

        fraud_res = {
            "available": True,
            "probability": fraud_prob,
            "risk_score": fraud_risk,
            "level": fraud_level,
            "reason": None,
            "explanation": explain_fraud(provider_id, df_a, detail=detail),
        }

        # Fuse Model A and Model B
        fused = fuse_risk(
            provider=provider_id,
            claim_id=claim_id,
            claim_type=claim_type_clean,
            fraud_probability=fraud_prob,
            fraud_risk_score=fraud_risk,
            anomaly_score=anomaly_raw_score,
            anomaly_risk_score=anomaly_risk_score,
            anomaly_level=anomaly_level,
        )

        overall_res = {
            "risk_score": float(fused["OVERALL_RISK_SCORE"]),
            "risk_level": str(fused["OVERALL_RISK_LEVEL"]),
        }

    else:
        # Model A context unavailable
        fraud_res = {
            "available": False,
            "probability": None,
            "risk_score": None,
            "level": None,
            "reason": "Provider ID not found in Model A provider-context dataset",
            "explanation": {
                "available": False,
                "top_drivers": [],
                "error": "Provider ID not found in Model A provider-context dataset",
            },
        }

        overall_res = {
            "risk_score": anomaly_risk_score,
            "risk_level": anomaly_level,
        }

    return {
        "success": True,
        "provider_id": provider_id,
        "claim_id": claim_id,
        "claim_type": claim_type_clean,
        "fraud": fraud_res,
        "anomaly": anomaly_res,
        "overall": overall_res,
    }


@router.get("/claims/{claim_id}/explanation")
def get_claim_explanation_endpoint(
    claim_id: str,
    claim_type: str,
    provider_id: str,
    detail: bool = True,
):
    """
    Detailed SHAP explanation endpoint returning all feature contributions for Model A and Model B.
    """
    claim_type_clean = str(claim_type).upper()
    if claim_type_clean not in ["CARRIER", "OUTPATIENT", "INPATIENT"]:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid claim_type '{claim_type}'. Must be CARRIER, OUTPATIENT, or INPATIENT.",
        )

    model_a_ctx = MODEL_A_PROVIDER_LOOKUP.get(provider_id)
    model_b_inpatient_ctx = {}
    if claim_type_clean == "INPATIENT":
        if provider_id in INPATIENT_PROVIDER_LOOKUP:
            model_b_inpatient_ctx = INPATIENT_PROVIDER_LOOKUP[provider_id]
        elif str(provider_id) in INPATIENT_PROVIDER_LOOKUP:
            model_b_inpatient_ctx = INPATIENT_PROVIDER_LOOKUP[str(provider_id)]

    combined_context = {}
    if model_a_ctx:
        combined_context.update(model_a_ctx)
    if model_b_inpatient_ctx:
        combined_context.update(model_b_inpatient_ctx)

    raw_claim = {
        "claim_id": claim_id,
        "provider_id": provider_id,
        "claim_start_date": "2008-01-01",
        "claim_end_date": "2008-01-01",
        "CLM_PMT_AMT": 0.0,
        "TOTAL_REIMBURSEMENT": 0.0,
    }

    try:
        built = build_claim_features(
            claim_type=claim_type_clean,
            raw_claim=raw_claim,
            provider_context=combined_context if combined_context else None,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error building features for explanation: {str(e)}")

    df_b = built["model_b"]["features"]
    if "provider_id" in df_b.columns:
        df_b = df_b.drop(columns=["provider_id"])
    if "Provider" in df_b.columns:
        df_b = df_b.drop(columns=["Provider"])

    anomaly_exp = explain_anomaly(claim_type_clean, df_b, detail=detail)

    if model_a_ctx is not None:
        df_a = built["model_a"]["features"]
        if "provider_id" in df_a.columns:
            df_a = df_a.drop(columns=["provider_id"])
        if "Provider" in df_a.columns:
            df_a = df_a.drop(columns=["Provider"])
        fraud_exp = explain_fraud(provider_id, df_a, detail=detail)
    else:
        fraud_exp = {
            "available": False,
            "top_drivers": [],
            "error": "Provider ID not found in Model A provider-context dataset",
        }

    return {
        "success": True,
        "claim_id": claim_id,
        "claim_type": claim_type_clean,
        "fraud": fraud_exp,
        "anomaly": anomaly_exp,
    }
