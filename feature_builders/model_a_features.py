import json
from pathlib import Path
import numpy as np
import pandas as pd

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "models" / "model_a_supervised" / "feature_schema.json"


def load_model_a_schema():
    with open(SCHEMA_PATH, "r") as f:
        schema = json.load(f)
    return schema["features"]


def build_model_a_features(provider_context: dict | pd.Series | pd.DataFrame | None) -> dict:
    """
    Converts explicitly supplied provider historical context into Model A feature vector (30 features).

    Parameters
    ----------
    provider_context : dict, pd.Series, pd.DataFrame, or None
        Provider historical context containing the 30 aggregate features.

    Returns
    -------
    dict
        Structured status result:
        {
            "available": bool,
            "reason": str or None,
            "features": pd.DataFrame or None
        }
    """
    expected_features = load_model_a_schema()

    if provider_context is None:
        return {
            "available": False,
            "reason": "Provider historical context unavailable",
            "features": None,
        }

    # If pandas DataFrame or Series, convert to dictionary
    if isinstance(provider_context, pd.DataFrame):
        if provider_context.empty:
            return {
                "available": False,
                "reason": "Provider historical context unavailable",
                "features": None,
            }
        ctx_dict = provider_context.iloc[0].to_dict()
    elif isinstance(provider_context, pd.Series):
        ctx_dict = provider_context.to_dict()
    elif isinstance(provider_context, dict):
        ctx_dict = provider_context
    else:
        return {
            "available": False,
            "reason": "Invalid provider_context data type",
            "features": None,
        }

    # Check if essential features are present in ctx_dict
    missing_keys = [feat for feat in expected_features if feat not in ctx_dict]
    if missing_keys:
        return {
            "available": False,
            "reason": f"Provider historical context incomplete (missing: {missing_keys[:3]}...)",
            "features": None,
        }

    row_dict = {}
    for feat in expected_features:
        val = ctx_dict[feat]
        if val is None or pd.isna(val):
            row_dict[feat] = np.nan
        else:
            row_dict[feat] = float(val)

    df = pd.DataFrame([row_dict])
    # Replace inf with nan
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df[expected_features]

    if len(df.columns) != len(expected_features):
        return {
            "available": False,
            "reason": f"Feature count mismatch: expected {len(expected_features)}, got {len(df.columns)}",
            "features": None,
        }

    return {
        "available": True,
        "reason": None,
        "features": df,
    }
