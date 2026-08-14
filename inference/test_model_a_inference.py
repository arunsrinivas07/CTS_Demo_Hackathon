import sys
from pathlib import Path

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(PROJECT_ROOT)
)

from inference.model_a_inference import (
    load_model_a_artifacts,
    predict_fraud
)


# ============================================================
# LOAD
# ============================================================

print("=" * 80)
print("MODEL A PRODUCTION INFERENCE TEST")
print("=" * 80)

model, preprocessor, schema = (
    load_model_a_artifacts()
)

print(
    "Model:",
    type(model).__name__
)

print(
    "Preprocessor:",
    type(preprocessor).__name__
)

print(
    "Feature count:",
    len(schema["features"])
)


# ============================================================
# CREATE PIPELINE TEST INPUT
# ============================================================

features = {
    feature: 0.0
    for feature in schema["features"]
}


# ============================================================
# RUN
# ============================================================

result = predict_fraud(
    provider="TEST_PROVIDER",
    features=features
)


print("\nPrediction:")
print(
    result.to_string(
        index=False
    )
)


# ============================================================
# VALIDATION
# ============================================================

probability = result[
    "FRAUD_PROBABILITY"
].iloc[0]

risk = result[
    "FRAUD_RISK_SCORE"
].iloc[0]

level = result[
    "FRAUD_LEVEL"
].iloc[0]


assert np.isfinite(
    probability
)

assert np.isfinite(
    risk
)

assert 0 <= probability <= 1

assert 0 <= risk <= 100

assert level in [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL"
]


print("\n" + "=" * 80)
print("MODEL A INFERENCE TEST: PASS")
print("=" * 80)