import pandas as pd

from .carrier_features import build_carrier_features
from .inpatient_features import build_inpatient_features
from .model_a_features import build_model_a_features
from .outpatient_features import build_outpatient_features


def build_claim_features(claim_type: str, raw_claim: dict, provider_context: dict | None = None) -> dict:
    """
    Unified feature building entry point that converts a raw claim + optional provider historical context
    into independent Model B claim features and Model A provider features.

    Parameters
    ----------
    claim_type : str
        Type of claim: 'CARRIER', 'OUTPATIENT', or 'INPATIENT'.
    raw_claim : dict
        Raw claim representation.
    provider_context : dict, optional
        Explicitly supplied provider historical statistics.

    Returns
    -------
    dict
        Structured output containing:
        {
            "claim_type": str,
            "model_a": {
                "available": bool,
                "reason": str or None,
                "features": pd.DataFrame or None
            },
            "model_b": {
                "features": pd.DataFrame
            }
        }
    """
    claim_type_clean = str(claim_type).upper()

    # Route Model B feature building
    if claim_type_clean == "CARRIER":
        model_b_features = build_carrier_features(raw_claim, provider_context)
    elif claim_type_clean == "OUTPATIENT":
        model_b_features = build_outpatient_features(raw_claim, provider_context)
    elif claim_type_clean == "INPATIENT":
        model_b_features = build_inpatient_features(raw_claim, provider_context)
    else:
        raise ValueError(f"Invalid claim_type '{claim_type}'. Must be one of CARRIER, OUTPATIENT, or INPATIENT.")

    # Model A feature building (from explicit provider_context)
    # Check if provider_context is in raw_claim if not passed directly
    if provider_context is None:
        provider_context = raw_claim.get("provider_context") or raw_claim.get("provider_history")

    model_a_res = build_model_a_features(provider_context)

    return {
        "claim_type": claim_type_clean,
        "model_a": model_a_res,
        "model_b": {
            "features": model_b_features
        },
    }
