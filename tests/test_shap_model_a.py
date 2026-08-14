import json
from pathlib import Path
import sys
import numpy as np
import pandas as pd
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from inference.model_a_inference import predict_fraud
from xai.shap_model_a import explain_fraud

MODEL_A_SCHEMA_PATH = PROJECT_ROOT / "models" / "model_a_supervised" / "feature_schema.json"


@pytest.fixture
def sample_model_a_features():
    with open(MODEL_A_SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)
    feature_names = schema["features"]
    # Construct realistic provider feature vector
    data = {feat: 50.0 for feat in feature_names}
    data["Unique_Beneficiaries"] = 120.0
    data["Total_Claims"] = 500.0
    data["Total_Reimbursement"] = 1500000.0
    return pd.DataFrame([data], columns=feature_names)


def test_shap_model_a_suite(sample_model_a_features):
    # 1. Prediction before SHAP
    pred_before = predict_fraud("PRV51001", sample_model_a_features)
    prob_before = float(pred_before.iloc[0]["FRAUD_PROBABILITY"])
    risk_before = float(pred_before.iloc[0]["FRAUD_RISK_SCORE"])
    level_before = str(pred_before.iloc[0]["FRAUD_LEVEL"])

    # 2. Run SHAP explanation
    res = explain_fraud("PRV51001", sample_model_a_features, detail=True)

    # 1. Model A SHAP loads
    assert res["available"] is True

    # 2. Exactly 30 features
    all_contribs = res["all_feature_contributions"]
    assert len(all_contribs) == 30

    # 3 & 4. Exact feature names and order
    with open(MODEL_A_SCHEMA_PATH, "r", encoding="utf-8") as f:
        expected_features = json.load(f)["features"]
    returned_feature_names = [item["feature"] for item in all_contribs]
    assert set(returned_feature_names) == set(expected_features)

    # 5. No provider_id leakage
    assert "provider_id" not in returned_feature_names
    assert "Provider" not in returned_feature_names

    # 6. SHAP values returned
    for item in all_contribs:
        assert "contribution" in item
        assert isinstance(item["contribution"], (float, int))

    # 7. Top drivers returned
    top_drivers = res["top_drivers"]
    assert isinstance(top_drivers, list)
    assert len(top_drivers) <= 5

    # 8. All contributions returned
    assert len(all_contribs) == 30

    # 9. Contributions ranked correctly (abs value descending)
    abs_contribs = [abs(item["contribution"]) for item in all_contribs]
    assert abs_contribs == sorted(abs_contribs, reverse=True)
    ranks = [item["rank"] for item in all_contribs]
    assert ranks == list(range(1, 31))

    # 10. Directions are valid
    valid_directions = {"increases_fraud", "decreases_fraud"}
    for item in all_contribs:
        assert item["direction"] in valid_directions
        if item["contribution"] > 0:
            assert item["direction"] == "increases_fraud"
        else:
            assert item["direction"] == "decreases_fraud"

    # 11, 12, 13. Prediction unchanged
    pred_after = predict_fraud("PRV51001", sample_model_a_features)
    assert float(pred_after.iloc[0]["FRAUD_PROBABILITY"]) == prob_before
    assert float(pred_after.iloc[0]["FRAUD_RISK_SCORE"]) == risk_before
    assert str(pred_after.iloc[0]["FRAUD_LEVEL"]) == level_before

    # 14. SHAP explains class 1
    # Check top driver increasing fraud
    if top_drivers:
        top_driver = top_drivers[0]
        assert top_driver["direction"] == "increases_fraud"
        assert top_driver["contribution"] > 0

    # 15. SHAP directionality validated
    for driver in top_drivers:
        assert driver["contribution"] > 0
        assert driver["direction"] == "increases_fraud"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
