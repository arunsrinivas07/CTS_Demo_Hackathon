from typing import Any, Dict, Optional
import pandas as pd
from xai.shap_model_a import explain_fraud as explain_fraud_impl
from xai.shap_model_b import explain_anomaly as explain_anomaly_impl


def explain_fraud(provider: Any, features: pd.DataFrame, detail: bool = False) -> Dict[str, Any]:
    """
    Exposes Model A fraud SHAP explanation.
    """
    return explain_fraud_impl(provider, features, detail=detail)


def explain_anomaly(claim_type: str, features: pd.DataFrame, detail: bool = False) -> Dict[str, Any]:
    """
    Exposes Model B anomaly SHAP explanation.
    """
    return explain_anomaly_impl(claim_type, features, detail=detail)


def explain_claim(
    provider: Any,
    claim_type: str,
    model_a_features: Optional[pd.DataFrame] = None,
    model_b_features: Optional[pd.DataFrame] = None,
    detail: bool = False,
) -> Dict[str, Any]:
    """
    Generates SHAP explanations for both Model A and Model B predictions.
    """
    fraud_explanation = (
        explain_fraud_impl(provider, model_a_features, detail=detail)
        if model_a_features is not None
        else {"available": False, "top_drivers": [], "error": "Model A features not provided"}
    )

    anomaly_explanation = (
        explain_anomaly_impl(claim_type, model_b_features, detail=detail)
        if model_b_features is not None
        else {"available": False, "top_drivers": [], "error": "Model B features not provided"}
    )

    return {
        "fraud": fraud_explanation,
        "anomaly": anomaly_explanation,
    }
