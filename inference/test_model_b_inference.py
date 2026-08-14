import sys
from pathlib import Path

import joblib
import pandas as pd
import numpy as np


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(PROJECT_ROOT)
)

from inference.model_b_inference import (
    load_artifacts,
    predict_anomaly,
    MODEL_B_DIR
)


# ============================================================
# TEST EACH MODEL ARTIFACT
# ============================================================

CLAIM_TYPES = [
    "CARRIER",
    "OUTPATIENT",
    "INPATIENT"
]


print("=" * 80)
print("MODEL B PRODUCTION INFERENCE TEST")
print("=" * 80)


for claim_type in CLAIM_TYPES:

    print("\n" + "-" * 80)
    print(claim_type)
    print("-" * 80)

    # --------------------------------------------------------
    # Load artifacts
    # --------------------------------------------------------

    model, scaler, schema = load_artifacts(
        claim_type
    )

    reference_file = (
        MODEL_B_DIR
        / claim_type.lower()
        / "score_reference.joblib"
    )

    reference = joblib.load(
        reference_file
    )

    features = schema["features"]

    print(
        "Model:",
        type(model).__name__
    )

    print(
        "Scaler:",
        type(scaler).__name__
    )

    print(
        "Feature count:",
        len(features)
    )

    print(
        "Reference scores:",
        f"{len(reference['sorted_scores']):,}"
    )

    # --------------------------------------------------------
    # Create a synthetic valid feature row
    #
    # This is ONLY a pipeline test.
    # It is not a real claim.
    # --------------------------------------------------------

    test_features = {
        feature: 0.0
        for feature in features
    }

    result = predict_anomaly(
        claim_type,
        test_features
    )

    print("\nPrediction:")
    print(result.to_string(index=False))

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    score = result[
        "ANOMALY_SCORE"
    ].iloc[0]

    risk = result[
        "ANOMALY_RISK_SCORE"
    ].iloc[0]

    level = result[
        "ANOMALY_LEVEL"
    ].iloc[0]

    assert np.isfinite(score), (
        "Anomaly score is not finite."
    )

    assert np.isfinite(risk), (
        "Anomaly risk is not finite."
    )

    assert 0 <= risk <= 100, (
        "Anomaly risk outside 0-100."
    )

    assert level in [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ]

    print("\nSTATUS: PASS")


print("\n" + "=" * 80)
print("MODEL B INFERENCE TEST COMPLETE")
print("=" * 80)