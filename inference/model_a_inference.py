from pathlib import Path
import json
import pickle

import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

MODEL_A_DIR = (
    PROJECT_ROOT
    / "models"
    / "model_a_supervised"
)

MODEL_FILE = MODEL_A_DIR / "fraud_model_gb.pkl"
PREPROCESSOR_FILE = MODEL_A_DIR / "fraud_model_preprocessor.pkl"
SCHEMA_FILE = MODEL_A_DIR / "feature_schema.json"


# ============================================================
# LOAD ARTIFACTS
# ============================================================

def load_model_a_artifacts():

    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Model not found:\n{MODEL_FILE}"
        )

    if not PREPROCESSOR_FILE.exists():
        raise FileNotFoundError(
            f"Preprocessor not found:\n{PREPROCESSOR_FILE}"
        )

    if not SCHEMA_FILE.exists():
        raise FileNotFoundError(
            f"Schema not found:\n{SCHEMA_FILE}"
        )

    with open(MODEL_FILE, "rb") as f:
        model = pickle.load(f)

    with open(PREPROCESSOR_FILE, "rb") as f:
        preprocessor = pickle.load(f)

    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        schema = json.load(f)

    return model, preprocessor, schema


# ============================================================
# PREPROCESS MODEL A INPUT
# ============================================================

def prepare_model_a_features(features, schema, preprocessor):

    if isinstance(features, dict):

        X = pd.DataFrame([features])

    elif isinstance(features, pd.Series):

        X = features.to_frame().T.copy()

    elif isinstance(features, pd.DataFrame):

        X = features.copy()

    else:

        raise TypeError(
            "features must be dict, Series, or DataFrame."
        )

    expected_features = schema["features"]

    # --------------------------------------------------------
    # Check missing columns
    # --------------------------------------------------------

    missing = [
        col
        for col in expected_features
        if col not in X.columns
    ]

    if missing:

        raise ValueError(
            "Missing Model A features:\n"
            + "\n".join(missing)
        )

    # --------------------------------------------------------
    # Keep exact training feature order
    # --------------------------------------------------------

    X = X[expected_features].copy()

    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    for col in expected_features:

        X[col] = pd.to_numeric(
            X[col],
            errors="coerce"
        )

    # --------------------------------------------------------
    # Replace infinite values
    # --------------------------------------------------------

    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )

    # ========================================================
    # PRODUCTION PREPROCESSOR
    # ========================================================

    if not isinstance(preprocessor, dict):

        raise TypeError(
            "Expected Model A production preprocessor "
            f"to be a dict, got {type(preprocessor)}"
        )

    # --------------------------------------------------------
    # Zero-fill features
    # --------------------------------------------------------

    zero_fill_features = preprocessor.get(
        "zero_fill_features",
        []
    )

    for col in zero_fill_features:

        if col in X.columns:

            X[col] = X[col].fillna(0)

    # --------------------------------------------------------
    # Median values
    # --------------------------------------------------------

    median_values = preprocessor.get(
        "median_values",
        {}
    )

    for col, value in median_values.items():

        if col in X.columns:

            X[col] = X[col].fillna(value)

    # --------------------------------------------------------
    # Fallback for remaining missing values
    # --------------------------------------------------------
    #
    # This should normally NOT be needed if the production
    # preprocessor was saved correctly.
    #
    # We deliberately do not calculate new medians here.
    # Production inference must use training-time values.
    # --------------------------------------------------------

    remaining_missing = X.isna().sum()

    remaining_missing = (
        remaining_missing[
            remaining_missing > 0
        ]
    )

    if len(remaining_missing) > 0:

        raise ValueError(
            "Model A preprocessing left missing values "
            "in production input:\n"
            + remaining_missing.to_string()
        )

    return X


# ============================================================
# FRAUD RISK LEVEL
# ============================================================

def get_fraud_level(score):

    if score >= 90:

        return "CRITICAL"

    elif score >= 75:

        return "HIGH"

    elif score >= 50:

        return "MEDIUM"

    else:

        return "LOW"


# ============================================================
# MODEL A INFERENCE
# ============================================================

def predict_fraud(
    provider,
    features
):

    # --------------------------------------------------------
    # Load artifacts
    # --------------------------------------------------------

    model, preprocessor, schema = (
        load_model_a_artifacts()
    )

    # --------------------------------------------------------
    # Prepare input
    # --------------------------------------------------------

    X = prepare_model_a_features(
        features,
        schema,
        preprocessor
    )

    # --------------------------------------------------------
    # Verify feature count
    # --------------------------------------------------------

    if X.shape[1] != model.n_features_in_:

        raise ValueError(
            f"Feature count mismatch. "
            f"Expected {model.n_features_in_}, "
            f"got {X.shape[1]}"
        )

    # --------------------------------------------------------
    # Verify feature names
    # --------------------------------------------------------

    if hasattr(model, "feature_names_in_"):

        if list(X.columns) != list(
            model.feature_names_in_
        ):

            raise ValueError(
                "Feature names/order do not match "
                "Model A training schema."
            )

    # --------------------------------------------------------
    # Fraud class
    # --------------------------------------------------------

    classes = list(
        model.classes_
    )

    if 1 not in classes:

        raise ValueError(
            "Fraud class 1 not found in Model A."
        )

    fraud_class_index = classes.index(1)

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    fraud_probability = (
        model.predict_proba(X)
        [:, fraud_class_index]
    )

    fraud_risk_score = (
        fraud_probability * 100
    )

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    result = pd.DataFrame({

        "Provider": [
            str(provider)
        ] * len(X),

        "FRAUD_PROBABILITY":
            fraud_probability,

        "FRAUD_RISK_SCORE":
            fraud_risk_score

    })

    result["FRAUD_LEVEL"] = (
        result["FRAUD_RISK_SCORE"]
        .apply(get_fraud_level)
    )

    return result