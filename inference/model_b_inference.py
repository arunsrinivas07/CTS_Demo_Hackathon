from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

MODEL_B_DIR = (
    PROJECT_ROOT
    / "models"
    / "model_b_anomaly"
)


# ============================================================
# CLAIM TYPE CONFIGURATION
# ============================================================

MODEL_CONFIG = {
    "CARRIER": {
        "directory": MODEL_B_DIR / "carrier",
    },
    "OUTPATIENT": {
        "directory": MODEL_B_DIR / "outpatient",
    },
    "INPATIENT": {
        "directory": MODEL_B_DIR / "inpatient",
    },
}


# ============================================================
# LOAD MODEL ARTIFACTS
# ============================================================

def load_artifacts(claim_type):
    """
    Load the Isolation Forest, scaler and feature schema
    for a specific claim type.
    """

    claim_type = claim_type.upper()

    if claim_type not in MODEL_CONFIG:
        raise ValueError(
            f"Unsupported claim type: {claim_type}. "
            f"Expected one of: {list(MODEL_CONFIG.keys())}"
        )

    directory = MODEL_CONFIG[claim_type]["directory"]

    model_file = directory / "isolation_forest.joblib"
    scaler_file = directory / "scaler.joblib"
    schema_file = directory / "feature_schema.json"

    if not model_file.exists():
        raise FileNotFoundError(model_file)

    if not scaler_file.exists():
        raise FileNotFoundError(scaler_file)

    if not schema_file.exists():
        raise FileNotFoundError(schema_file)

    model = joblib.load(model_file)
    scaler = joblib.load(scaler_file)

    with open(schema_file, "r", encoding="utf-8") as f:
        schema = json.load(f)

    return model, scaler, schema


# ============================================================
# FEATURE EXTRACTION / VALIDATION
# ============================================================

def prepare_features(features, schema):
    """
    Validate and prepare claim features according to
    the saved Model B feature schema.
    """

    if isinstance(features, pd.Series):
        X = features.to_frame().T.copy()

    elif isinstance(features, pd.DataFrame):
        X = features.copy()

    elif isinstance(features, dict):
        X = pd.DataFrame([features])

    else:
        raise TypeError(
            "features must be a dict, pandas Series, "
            "or pandas DataFrame."
        )

    expected_features = schema.get("features")

    if expected_features is None:
        raise ValueError(
            "Feature schema does not contain 'features'."
        )

    missing = [
        col for col in expected_features
        if col not in X.columns
    ]

    extra = [
        col for col in X.columns
        if col not in expected_features
    ]

    if missing:
        raise ValueError(
            "Missing Model B features:\n"
            + "\n".join(missing)
        )

    # Extra columns are ignored.
    X = X[expected_features].copy()

    # Convert to numeric.
    for col in expected_features:
        X[col] = pd.to_numeric(
            X[col],
            errors="coerce"
        )

    # Replace infinities.
    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )

    # Isolation Forest training data should not contain
    # unresolved missing values.
    if X.isna().any().any():
        missing_columns = (
            X.columns[X.isna().any()]
            .tolist()
        )

        raise ValueError(
            "Missing/non-numeric values found in "
            f"Model B features: {missing_columns}"
        )

    return X


# ============================================================
# ANOMALY SCORE
# ============================================================

def calculate_anomaly_score(model, X_scaled):
    """
    Calculate the Isolation Forest anomaly score.

    We use decision_function because this is the score
    produced by the trained Isolation Forest models.
    """

    return model.decision_function(X_scaled)


# ============================================================
# SCORE → ANOMALY RISK
# ============================================================

def anomaly_score_to_risk(anomaly_scores, reference):
    """
    Convert raw Isolation Forest scores into a
    claim-type-specific empirical percentile.

    Higher raw Isolation Forest decision_function score
    = more anomalous in our trained Model B setup.

    Returns:
        numpy array in the range 0-100.
    """

    anomaly_scores = np.asarray(
        anomaly_scores,
        dtype=np.float64
    )

    sorted_scores = np.asarray(
        reference["sorted_scores"],
        dtype=np.float64
    )

    if sorted_scores.size == 0:
        raise ValueError(
            "Score reference contains no scores."
        )

    # --------------------------------------------------------
    # Empirical percentile
    # --------------------------------------------------------
    #
    # searchsorted gives the position where each new score
    # would be inserted in the sorted reference distribution.
    #
    # Higher position = higher anomaly percentile.
    #

    positions = np.searchsorted(
        sorted_scores,
        anomaly_scores,
        side="right"
    )

    risk_scores = (
        positions / len(sorted_scores)
    ) * 100.0

    # Keep strictly inside valid range.
    risk_scores = np.clip(
        risk_scores,
        0.0,
        100.0
    )

    return risk_scores

# ============================================================
# RISK LEVEL
# ============================================================

def get_anomaly_level(risk_score):

    if risk_score >= 90:
        return "CRITICAL"

    elif risk_score >= 75:
        return "HIGH"

    elif risk_score >= 50:
        return "MEDIUM"

    return "LOW"


# ============================================================
# MAIN PREDICTION FUNCTION
# ============================================================

def predict_anomaly(
    claim_type,
    features
):
    """
    Run Model B anomaly detection for one or more claims.

    Returns:
        CLAIM_TYPE
        ANOMALY_SCORE
        ANOMALY_RISK_SCORE
        ANOMALY_LEVEL
    """

    claim_type = claim_type.upper()

    # ========================================================
    # 1. LOAD MODEL, SCALER AND SCHEMA
    # ========================================================

    model, scaler, schema = load_artifacts(
        claim_type
    )

    # ========================================================
    # 2. LOAD SCORE REFERENCE
    # ========================================================

    reference_file = (
        MODEL_B_DIR
        / claim_type.lower()
        / "score_reference.joblib"
    )

    if not reference_file.exists():
        raise FileNotFoundError(
            f"Score reference not found:\n"
            f"{reference_file}"
        )

    reference = joblib.load(
        reference_file
    )

    # ========================================================
    # 3. PREPARE FEATURES
    # ========================================================

    X = prepare_features(
        features,
        schema
    )

    # ========================================================
    # 4. SCALE FEATURES
    # ========================================================

    X_scaled = scaler.transform(X)

    # ========================================================
    # 5. GENERATE RAW ANOMALY SCORE
    # ========================================================

    raw_scores = model.decision_function(
        X_scaled
    )

    # ========================================================
    # 6. CONVERT RAW SCORE → 0-100 RISK
    # ========================================================

    anomaly_risk = anomaly_score_to_risk(
        raw_scores,
        reference
    )

    # ========================================================
    # 7. BUILD RESULT
    # ========================================================

    result = pd.DataFrame({
        "CLAIM_TYPE": claim_type,
        "ANOMALY_SCORE": raw_scores,
        "ANOMALY_RISK_SCORE": anomaly_risk
    })

    # ========================================================
    # 8. RISK LEVEL
    # ========================================================

    result["ANOMALY_LEVEL"] = (
        result["ANOMALY_RISK_SCORE"]
        .apply(get_anomaly_level)
    )

    return result
# ============================================================
# ARTIFACT CHECK
# ============================================================

def validate_model_b_artifacts():

    print("=" * 80)
    print("MODEL B ARTIFACT VALIDATION")
    print("=" * 80)

    for claim_type, config in MODEL_CONFIG.items():

        directory = config["directory"]

        model_file = directory / "isolation_forest.joblib"
        scaler_file = directory / "scaler.joblib"
        schema_file = directory / "feature_schema.json"

        print(f"\n{claim_type}")

        print(
            "Model:",
            model_file.exists()
        )

        print(
            "Scaler:",
            scaler_file.exists()
        )

        print(
            "Schema:",
            schema_file.exists()
        )

        if not (
            model_file.exists()
            and scaler_file.exists()
            and schema_file.exists()
        ):
            print("STATUS: FAIL")
            continue

        model, scaler, schema = load_artifacts(
            claim_type
        )

        # Load claim-type-specific score reference
        reference_file = (
            MODEL_B_DIR
            / claim_type.lower()
            / "score_reference.joblib"
        )

        if not reference_file.exists():
            raise FileNotFoundError(
                f"Score reference not found:\n"
                f"{reference_file}"
            )

        reference = joblib.load(
            reference_file
        )

        print(
            "Loaded model:",
            type(model).__name__
        )

        print(
            "Loaded scaler:",
            type(scaler).__name__
        )

        print(
            "Feature count:",
            len(schema.get("features", []))
        )

        print("STATUS: PASS")


if __name__ == "__main__":
    validate_model_b_artifacts()