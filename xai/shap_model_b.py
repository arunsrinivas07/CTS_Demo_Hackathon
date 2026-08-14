import json
import logging
from pathlib import Path
from typing import Any, Dict, List
import joblib
import numpy as np
import pandas as pd
import shap

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_B_DIR = PROJECT_ROOT / "models" / "model_b_anomaly"

_CACHE_B: Dict[str, Dict[str, Any]] = {}
_IDENTIFIERS = {"provider_id", "Provider", "CLM_ID", "CLAIM_ID", "CLAIM_KEY", "DESYNPUF_ID"}


def _load_model_b_cache(claim_type_clean: str):
    if claim_type_clean not in _CACHE_B:
        sub_dir = MODEL_B_DIR / claim_type_clean.lower()
        model_path = sub_dir / "isolation_forest.joblib"
        scaler_path = sub_dir / "scaler.joblib"
        schema_path = sub_dir / "feature_schema.json"

        if not model_path.exists():
            raise FileNotFoundError(f"Model B artifact missing at {model_path}")
        if not scaler_path.exists():
            raise FileNotFoundError(f"Model B scaler missing at {scaler_path}")
        if not schema_path.exists():
            raise FileNotFoundError(f"Model B schema missing at {schema_path}")

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_data = json.load(f)
            feature_names = schema_data["features"]

        explainer = shap.TreeExplainer(model)

        _CACHE_B[claim_type_clean] = {
            "model": model,
            "scaler": scaler,
            "feature_names": feature_names,
            "explainer": explainer,
        }

    return _CACHE_B[claim_type_clean]


def explain_anomaly(claim_type: str, features: pd.DataFrame, detail: bool = False) -> Dict[str, Any]:
    """
    Generates local SHAP explanation for Model B (Isolation Forest).
    Uses the transformed anomaly contribution psi_i = -phi_i.
    psi_i > 0 -> increases_anomaly
    psi_i < 0 -> decreases_anomaly
    """
    try:
        claim_type_clean = str(claim_type).upper()
        if claim_type_clean not in ["CARRIER", "OUTPATIENT", "INPATIENT"]:
            return {
                "available": False,
                "top_drivers": [],
                "error": f"Invalid claim_type '{claim_type}'. Must be CARRIER, OUTPATIENT, or INPATIENT.",
            }

        if features is None or features.empty:
            return {"available": False, "top_drivers": [], "error": "Features DataFrame is empty or None"}

        cached = _load_model_b_cache(claim_type_clean)
        scaler = cached["scaler"]
        feature_names = cached["feature_names"]
        explainer = cached["explainer"]

        # Identifier Safety: Drop any identifier columns if present
        clean_features = features.copy()
        for col in _IDENTIFIERS:
            if col in clean_features.columns:
                clean_features = clean_features.drop(columns=[col])

        # Align features to exact feature schema order
        missing_cols = [c for c in feature_names if c not in clean_features.columns]
        if missing_cols:
            return {
                "available": False,
                "top_drivers": [],
                "error": f"Missing required Model B {claim_type_clean} features: {missing_cols}",
            }

        X_df = clean_features[feature_names]

        # Scale features using production scaler artifact
        X_scaled = scaler.transform(X_df)

        # Compute raw SHAP values phi (leaf path length deltas)
        raw_shap = explainer.shap_values(X_scaled)

        if isinstance(raw_shap, list):
            phi_vals = raw_shap[0][0]
        elif isinstance(raw_shap, np.ndarray):
            if raw_shap.ndim == 2:
                phi_vals = raw_shap[0]
            else:
                phi_vals = raw_shap.ravel()
        else:
            phi_vals = np.array(raw_shap).ravel()

        # Transformed anomaly contribution: psi = -phi
        psi_vals = -phi_vals

        feature_contributions: List[Dict[str, Any]] = []
        row_vals = X_df.iloc[0]

        for feat_name, psi in zip(feature_names, psi_vals):
            feat_val = float(row_vals[feat_name])
            contrib = float(psi)
            direction = "increases_anomaly" if contrib > 0 else "decreases_anomaly"

            feature_contributions.append({
                "feature": feat_name,
                "value": feat_val,
                "contribution": contrib,
                "direction": direction,
            })

        # Rank all feature contributions by abs(contribution) descending
        feature_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        for rank_idx, item in enumerate(feature_contributions, start=1):
            item["rank"] = rank_idx

        # Extract top drivers increasing anomaly (max 5)
        increasing_features = [
            f for f in feature_contributions if f["direction"] == "increases_anomaly"
        ]
        increasing_features.sort(key=lambda x: x["contribution"], reverse=True)
        top_drivers = increasing_features[:5]

        res = {
            "available": True,
            "top_drivers": top_drivers,
        }
        if detail:
            res["all_feature_contributions"] = feature_contributions

        return res

    except Exception as e:
        logger.error(f"Model B SHAP explanation failed for {claim_type}: {e}", exc_info=True)
        return {
            "available": False,
            "error": str(e),
        }
