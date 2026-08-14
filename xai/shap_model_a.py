import json
import logging
import pickle
from pathlib import Path
from typing import Any, Dict, List
import numpy as np
import pandas as pd
import shap

logger = logging.getLogger(__name__)

# Derive paths relative to project root
PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_A_DIR = PROJECT_ROOT / "models" / "model_a_supervised"
MODEL_A_PATH = MODEL_A_DIR / "fraud_model_gb.pkl"
SCHEMA_A_PATH = MODEL_A_DIR / "feature_schema.json"

_MODEL_A = None
_EXPLAINER_A = None
_FEATURE_NAMES_A = None
_IDENTIFIERS = {"provider_id", "Provider", "CLM_ID", "CLAIM_ID", "CLAIM_KEY", "DESYNPUF_ID"}


def _load_model_a_and_explainer():
    global _MODEL_A, _EXPLAINER_A, _FEATURE_NAMES_A
    if _MODEL_A is None:
        if not MODEL_A_PATH.exists():
            raise FileNotFoundError(f"Model A artifact not found at {MODEL_A_PATH}")
        if not SCHEMA_A_PATH.exists():
            raise FileNotFoundError(f"Model A schema not found at {SCHEMA_A_PATH}")

        with open(MODEL_A_PATH, "rb") as f:
            _MODEL_A = pickle.load(f)

        with open(SCHEMA_A_PATH, "r", encoding="utf-8") as f:
            schema_data = json.load(f)
            _FEATURE_NAMES_A = schema_data["features"]

        _EXPLAINER_A = shap.TreeExplainer(_MODEL_A)


def explain_fraud(provider: Any, features: pd.DataFrame, detail: bool = False) -> Dict[str, Any]:
    """
    Generates local SHAP explanation for Model A (HistGradientBoostingClassifier).
    Explains the contribution of each of the 30 provider-context features toward
    the probability of fraud (Class 1).
    """
    try:
        _load_model_a_and_explainer()

        if features is None or features.empty:
            return {"available": False, "top_drivers": [], "error": "Features DataFrame is empty or None"}

        # Identifier Safety: Drop any identifier columns if present
        clean_features = features.copy()
        for col in _IDENTIFIERS:
            if col in clean_features.columns:
                clean_features = clean_features.drop(columns=[col])

        # Align features to exact 30-feature schema order
        missing_cols = [c for c in _FEATURE_NAMES_A if c not in clean_features.columns]
        if missing_cols:
            return {
                "available": False,
                "top_drivers": [],
                "error": f"Missing required Model A features: {missing_cols}",
            }

        X_df = clean_features[_FEATURE_NAMES_A]

        # Calculate SHAP values
        raw_shap = _EXPLAINER_A.shap_values(X_df)

        if isinstance(raw_shap, list):
            # Binary classification list format -> Class 1
            phi_vals = raw_shap[1][0]
        elif isinstance(raw_shap, np.ndarray):
            if raw_shap.ndim == 2:
                phi_vals = raw_shap[0]
            elif raw_shap.ndim == 3:
                phi_vals = raw_shap[0, :, 1]
            else:
                phi_vals = raw_shap.ravel()
        else:
            phi_vals = np.array(raw_shap).ravel()

        feature_contributions: List[Dict[str, Any]] = []
        row_vals = X_df.iloc[0]

        for feat_name, phi in zip(_FEATURE_NAMES_A, phi_vals):
            feat_val = float(row_vals[feat_name])
            contrib = float(phi)
            direction = "increases_fraud" if contrib > 0 else "decreases_fraud"

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

        # Extract top drivers increasing fraud (max 5)
        increasing_features = [
            f for f in feature_contributions if f["direction"] == "increases_fraud"
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
        logger.error(f"Model A SHAP explanation failed: {e}", exc_info=True)
        return {
            "available": False,
            "error": str(e),
        }
