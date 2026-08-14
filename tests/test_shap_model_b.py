import json
from pathlib import Path
import sys
import pandas as pd
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from feature_builders.carrier_features import build_carrier_features
from feature_builders.inpatient_features import build_inpatient_features
from feature_builders.outpatient_features import build_outpatient_features
from inference.model_b_inference import predict_anomaly
from xai.shap_model_b import explain_anomaly

MODEL_B_DIR = PROJECT_ROOT / "models" / "model_b_anomaly"


@pytest.fixture
def carrier_sample_features():
    raw_claim = {
        "claim_id": "CLM_CAR_01",
        "provider_id": "PRV_01",
        "claim_start_date": "2009-07-10",
        "claim_payment": 180.0,
        "allowed_charge_amt": 200.0,
        "deductible_amt": 20.0,
        "coinsurance_amt": 0.0,
        "primary_payer_payment": 0.0,
        "diagnosis_codes": ["4019"],
        "line_items": [{"hcpcs_code": "99213", "line_payment": 180.0}],
        "provider_claim_volume": 40,
        "provider_avg_claim_payment": 150.0,
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 26,
            "BENE_COUNTY_CD": 950,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }
    return build_carrier_features(raw_claim)


@pytest.fixture
def outpatient_sample_features():
    raw_claim = {
        "claim_id": "CLM_OUT_01",
        "provider_id": "PRV_01",
        "claim_start_date": "2008-06-01",
        "claim_end_date": "2008-06-01",
        "CLM_PMT_AMT": 400.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "TOTAL_REIMBURSEMENT": 400.0,
        "diagnosis_codes": ["7802"],
        "procedure_codes": ["99201"],
        "hcpcs_codes": ["99201"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 26,
            "BENE_COUNTY_CD": 950,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }
    return build_outpatient_features(raw_claim)


@pytest.fixture
def inpatient_sample_features():
    raw_claim = {
        "claim_id": "CLM_INP_01",
        "provider_id": "PRV_01",
        "claim_start_date": "2010-04-01",
        "claim_end_date": "2010-04-05",
        "CLM_PMT_AMT": 6000.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "CLM_UTLZTN_DAY_CNT": 4.0,
        "diagnosis_codes": ["41001", "4019"],
        "procedure_codes": ["3615"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 26,
            "BENE_COUNTY_CD": 950,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }
    inpatient_ctx = {
        "CLAIM_COUNT": 60,
        "UNIQUE_CLAIM_COUNT": 60,
        "TOTAL_PAYMENT": 600000.0,
        "AVG_PAYMENT": 10000.0,
        "MEDIAN_PAYMENT": 9000.0,
        "MAX_PAYMENT": 40000.0,
        "AVG_CLAIM_DURATION": 5.0,
        "MAX_CLAIM_DURATION": 25.0,
        "AVG_DIAGNOSIS_COUNT": 8.0,
        "AVG_PROCEDURE_COUNT": 1.5,
        "NEGATIVE_PAYMENT_COUNT": 0,
        "PRIMARY_PAYER_PAYMENT_COUNT": 1,
        "NEGATIVE_PAYMENT_RATE": 0.0,
        "PRIMARY_PAYER_PAYMENT_RATE": 0.016,
        "UNIQUE_BENEFICIARIES": 50,
        "CLAIMS_PER_BENEFICIARY": 1.2,
        "PAYMENT_STD": 5000.0,
        "CLAIM_DURATION_STD": 3.0,
    }
    return build_inpatient_features(raw_claim, inpatient_ctx)


@pytest.mark.parametrize(
    "claim_type, expected_feat_count, fixture_name",
    [
        ("CARRIER", 53, "carrier_sample_features"),
        ("OUTPATIENT", 51, "outpatient_sample_features"),
        ("INPATIENT", 62, "inpatient_sample_features"),
    ],
)
def test_shap_model_b_suite(claim_type, expected_feat_count, fixture_name, request):
    features = request.getfixturevalue(fixture_name)

    # 1. Prediction before SHAP
    pred_before = predict_anomaly(claim_type, features)
    score_before = float(pred_before.iloc[0]["ANOMALY_SCORE"])
    risk_before = float(pred_before.iloc[0]["ANOMALY_RISK_SCORE"])
    level_before = str(pred_before.iloc[0]["ANOMALY_LEVEL"])

    # 2. Run SHAP explanation
    res = explain_anomaly(claim_type, features, detail=True)

    # 1, 2, 3. Correct model, scaler, schema load
    assert res["available"] is True

    # 4. Feature count check
    all_contribs = res["all_feature_contributions"]
    assert len(all_contribs) == expected_feat_count

    # 5 & 6. Exact feature names and order check
    schema_path = MODEL_B_DIR / claim_type.lower() / "feature_schema.json"
    with open(schema_path, "r", encoding="utf-8") as f:
        expected_features = json.load(f)["features"]

    returned_feature_names = [item["feature"] for item in all_contribs]
    assert set(returned_feature_names) == set(expected_features)

    # 7. No identifier leakage
    assert "provider_id" not in returned_feature_names
    assert "Provider" not in returned_feature_names
    assert "CLM_ID" not in returned_feature_names

    # 8. SHAP values returned
    for item in all_contribs:
        assert "contribution" in item
        assert isinstance(item["contribution"], (float, int))

    # 9. Top drivers returned
    top_drivers = res["top_drivers"]
    assert isinstance(top_drivers, list)
    assert len(top_drivers) <= 5

    # 10. All contributions returned
    assert len(all_contribs) == expected_feat_count

    # 11. Ranking correct (abs value descending)
    abs_contribs = [abs(item["contribution"]) for item in all_contribs]
    assert abs_contribs == sorted(abs_contribs, reverse=True)
    ranks = [item["rank"] for item in all_contribs]
    assert ranks == list(range(1, expected_feat_count + 1))

    # 12. Directionality validated (psi_i > 0 -> increases_anomaly)
    valid_directions = {"increases_anomaly", "decreases_anomaly"}
    for item in all_contribs:
        assert item["direction"] in valid_directions
        if item["contribution"] > 0:
            assert item["direction"] == "increases_anomaly"
        else:
            assert item["direction"] == "decreases_anomaly"

    # 13, 14, 15. Prediction unchanged
    pred_after = predict_anomaly(claim_type, features)
    assert float(pred_after.iloc[0]["ANOMALY_SCORE"]) == score_before
    assert float(pred_after.iloc[0]["ANOMALY_RISK_SCORE"]) == risk_before
    assert str(pred_after.iloc[0]["ANOMALY_LEVEL"]) == level_before


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
