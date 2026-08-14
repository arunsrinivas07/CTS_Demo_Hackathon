#!/usr/bin/env python3
"""
CTS HealthGuard AI - Centralized Local SHAP Explainer Service

Provides local SHAP explanations for Isolation Forest models across Carrier,
Inpatient, and Outpatient claim types with mathematically validated directionality.

Mathematical Foundation (from reports/xai_shap_direction_validation.md):
- TreeExplainer calculates raw path length contributions φ_i
- Transformed contribution: ψ_i = -φ_i
- Direction:
    ψ_i > 0 -> increases_anomaly  (negative raw SHAP shortens path)
    ψ_i < 0 -> decreases_anomaly  (positive raw SHAP lengthens path)
"""

import os
import json
import pickle
import logging
import pandas as pd
import numpy as np
import shap
from typing import Dict, List, Any, Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Base configuration paths
BASE_DIR = r"g:\cts_trial"
CONFIG_PATH = os.path.join(BASE_DIR, "xai_rag_config.json")

def load_config() -> Dict[str, Any]:
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

CONFIG = load_config()
DATA_DIR = CONFIG.get("data_dir", os.path.join(BASE_DIR, "data"))
TRACKING_COLS = CONFIG.get("tracking_cols", ["CLM_ID", "DESYNPUF_ID"])

class LocalSHAPExplainer:
    """
    Authoritative Centralized Local SHAP Explainer Service for CTS HealthGuard AI.
    Supports Carrier, Inpatient, and Outpatient claim types.
    """

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = data_dir or DATA_DIR
        self.models: Dict[str, Any] = {}
        self.explainers: Dict[str, shap.TreeExplainer] = {}
        self.feature_names: Dict[str, List[str]] = {}
        self._initialize_models()

    def _initialize_models(self):
        """Loads trained Isolation Forest models and initializes SHAP TreeExplainers."""
        claim_types = ["Carrier", "Inpatient", "Outpatient"]
        models_config = CONFIG.get("models", {
            "Carrier": {
                "model_pkl": "carrier_isolation_forest.pkl",
                "features_csv": "Carrier_IF_Features.csv"
            },
            "Inpatient": {
                "model_pkl": "inpatient_isolation_forest.pkl",
                "features_csv": "Inpatient_IF_Features.csv"
            },
            "Outpatient": {
                "model_pkl": "outpatient_isolation_forest.pkl",
                "features_csv": "Outpatient_IF_Features.csv"
            }
        })

        for claim_type in claim_types:
            info = models_config.get(claim_type, {})
            model_file = info.get("model_pkl", f"{claim_type.lower()}_isolation_forest.pkl")
            features_file = info.get("features_csv", f"{claim_type}_IF_Features.csv")

            model_path = os.path.join(self.data_dir, model_file)
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    clf = pickle.load(f)
                self.models[claim_type] = clf
                self.explainers[claim_type] = shap.TreeExplainer(clf)
                logger.info(f"Loaded Isolation Forest model and TreeExplainer for {claim_type}")
            else:
                logger.warning(f"Model file not found for {claim_type} at {model_path}")

            feat_csv_path = os.path.join(self.data_dir, features_file)
            if os.path.exists(feat_csv_path):
                df_head = pd.read_csv(feat_csv_path, nrows=2)
                ml_cols = [c for c in df_head.columns if c not in TRACKING_COLS]
                self.feature_names[claim_type] = ml_cols
                logger.info(f"Loaded {len(ml_cols)} ML features for {claim_type} (tracking keys excluded)")
            else:
                logger.warning(f"Features file not found for {claim_type} at {feat_csv_path}")

    def get_claim_feature_row(self, claim_id: str, claim_type: str) -> Optional[pd.DataFrame]:
        """Locates specific claim row in feature matrix CSV while ensuring tracking keys are preserved."""
        if claim_type not in ["Carrier", "Inpatient", "Outpatient"]:
            raise ValueError(f"Invalid claim_type: {claim_type}. Must be Carrier, Inpatient, or Outpatient.")

        models_config = CONFIG.get("models", {})
        features_file = models_config.get(claim_type, {}).get("features_csv", f"{claim_type}_IF_Features.csv")
        feat_csv_path = os.path.join(self.data_dir, features_file)

        if not os.path.exists(feat_csv_path):
            logger.error(f"Feature CSV missing: {feat_csv_path}")
            return None

        chunk_size = 50000
        with pd.read_csv(feat_csv_path, chunksize=chunk_size, low_memory=False) as reader:
            for chunk in reader:
                matches = chunk[chunk['CLM_ID'].astype(str) == str(claim_id)]
                if not matches.empty:
                    return matches.iloc[0:1].copy()
        return None

    def explain_claim_features(self, feat_row: pd.DataFrame, claim_type: str) -> Dict[str, Any]:
        """
        Calculates raw SHAP values and applies validated transformation ψ_i = -φ_i.
        
        Mathematical relationship:
        - decision_function = 0.5 - 2^(-h(x)/c(n))
        - anomaly_score = -decision_function = 2^(-h(x)/c(n)) - 0.5
        - Raw SHAP φ_i explains leaf path length h(x)
        - Transformed contribution ψ_i = -φ_i
        - ψ_i > 0 -> increases_anomaly
        - ψ_i < 0 -> decreases_anomaly
        """
        if claim_type not in self.models:
            raise RuntimeError(f"Model for claim_type '{claim_type}' is not loaded.")

        clf = self.models[claim_type]
        explainer = self.explainers[claim_type]
        ml_cols = self.feature_names[claim_type]

        # EXPLICIT IDENTIFIER SAFETY: Strictly extract only non-tracking ML features
        X_df = feat_row[ml_cols]
        X = X_df.values.astype(np.float64)

        # Sanity check: Ensure CLM_ID and DESYNPUF_ID are NOT in input matrix X
        for tracking_col in TRACKING_COLS:
            if tracking_col in X_df.columns:
                raise ValueError(f"Tracking column {tracking_col} leaked into SHAP feature matrix!")

        dec_func = clf.decision_function(X)[0]
        anomaly_score = -dec_func  # higher = more anomalous

        # Raw SHAP values φ_i (leaf path length deltas)
        raw_shap_values = explainer.shap_values(X)[0]

        if isinstance(explainer.expected_value, (list, np.ndarray)):
            base_path_val = float(explainer.expected_value[0])
        else:
            base_path_val = float(explainer.expected_value)

        # Transformed anomaly contribution: ψ_i = -φ_i
        transformed_contribs = -raw_shap_values

        feature_contributions = []
        for feat_name, raw_val, raw_phi, psi in zip(ml_cols, X[0], raw_shap_values, transformed_contribs):
            val_float = float(raw_val) if not np.isnan(raw_val) else 0.0
            direction = "increases_anomaly" if psi > 0 else "decreases_anomaly"
            
            feature_contributions.append({
                "feature": feat_name,
                "value": val_float,
                "raw_shap_value": float(raw_phi),
                "raw_shap_path_delta": float(raw_phi),  # backward compatibility alias
                "contribution": float(psi),
                "shap_value": float(psi),               # backward compatibility alias
                "direction": direction
            })

        # Rank all features by absolute contribution magnitude |ψ_i|
        feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)

        for rank_idx, feat_item in enumerate(feature_contributions, start=1):
            feat_item['rank'] = rank_idx

        # Filter top drivers specifically increasing anomaly risk
        top_drivers = [f for f in feature_contributions if f['direction'] == 'increases_anomaly'][:5]

        return {
            "claim_id": str(feat_row['CLM_ID'].iloc[0]) if 'CLM_ID' in feat_row.columns else None,
            "claim_type": claim_type,
            "anomaly_score": float(anomaly_score),
            "decision_function": float(dec_func),
            "base_path_length": base_path_val,
            "sample_path_length": float(base_path_val + raw_shap_values.sum()),
            "top_drivers": top_drivers,
            "all_feature_contributions": feature_contributions
        }

    def explain_claim(self, claim_id: str, claim_type: str) -> Dict[str, Any]:
        """
        Public API method to explain a claim by ID and claim_type.
        Returns structured dictionary compliant with project specification.
        """
        feat_row = self.get_claim_feature_row(claim_id, claim_type)
        if feat_row is None:
            return {
                "error": f"Claim ID '{claim_id}' not found in {claim_type} dataset.",
                "claim_id": str(claim_id),
                "claim_type": claim_type
            }

        return self.explain_claim_features(feat_row, claim_type)

# Singleton helper instance
_explainer_instance: Optional[LocalSHAPExplainer] = None

def get_local_shap_explainer() -> LocalSHAPExplainer:
    global _explainer_instance
    if _explainer_instance is None:
        _explainer_instance = LocalSHAPExplainer()
    return _explainer_instance
