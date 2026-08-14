import json
from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app

client = TestClient(app)


def test_api_xai_integration():
    outpatient_claim = {
        "claim_id": "CLM_OUT_API_XAI_01",
        "provider_id": "PRV51001",
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

    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_API_XAI_01",
        "claim_type": "OUTPATIENT",
        "claim": outpatient_claim,
    }

    # Default request (compact explanation)
    response_def = client.post("/api/analyze-claim", json=payload)
    assert response_def.status_code == 200
    data_def = response_def.json()

    assert data_def["success"] is True
    assert "all_feature_contributions" not in data_def["fraud"]["explanation"]
    assert "all_feature_contributions" not in data_def["anomaly"]["explanation"]
    assert len(data_def["fraud"]["explanation"]["top_drivers"]) <= 5
    assert len(data_def["anomaly"]["explanation"]["top_drivers"]) <= 5

    # Detailed request
    response = client.post("/api/analyze-claim?detail=true", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. provider_id accepted
    assert data["success"] is True
    assert data["provider_id"] == "PRV51001"

    # 2. Model A prediction
    assert data["fraud"]["available"] is True
    assert isinstance(data["fraud"]["probability"], float)
    assert isinstance(data["fraud"]["risk_score"], float)
    assert data["fraud"]["level"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

    # 3. Model A SHAP & fraud explanation present
    fraud_exp = data["fraud"]["explanation"]
    assert fraud_exp["available"] is True
    assert "top_drivers" in fraud_exp
    assert "all_feature_contributions" in fraud_exp

    # 4. Model B prediction
    assert data["anomaly"]["available"] is True
    assert isinstance(data["anomaly"]["raw_score"], float)
    assert isinstance(data["anomaly"]["risk_score"], float)
    assert data["anomaly"]["level"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

    # 5. Model B SHAP & anomaly explanation present
    anomaly_exp = data["anomaly"]["explanation"]
    assert anomaly_exp["available"] is True
    assert "top_drivers" in anomaly_exp
    assert "all_feature_contributions" in anomaly_exp

    # 6. No identifier leakage in explanations
    for contrib in fraud_exp["all_feature_contributions"]:
        assert contrib["feature"] not in {"provider_id", "Provider", "CLM_ID", "CLAIM_ID"}

    for contrib in anomaly_exp["all_feature_contributions"]:
        assert contrib["feature"] not in {"provider_id", "Provider", "CLM_ID", "CLAIM_ID"}

    # 7. Model A has 30 features
    assert len(fraud_exp["all_feature_contributions"]) == 30

    # 8. Model B has correct feature count (51 for OUTPATIENT)
    assert len(anomaly_exp["all_feature_contributions"]) == 51

    # 9. Fraud score unchanged / valid
    fraud_risk = data["fraud"]["risk_score"]
    assert 0.0 <= fraud_risk <= 100.0

    # 10. Anomaly score unchanged / valid
    anomaly_risk = data["anomaly"]["risk_score"]
    assert 0.0 <= anomaly_risk <= 100.0

    # 11. Overall score unchanged / valid
    overall_risk = data["overall"]["risk_score"]
    assert 0.0 <= overall_risk <= 100.0

    # 12. Risk fusion unchanged (0.6 * fraud_risk + 0.4 * anomaly_risk)
    expected_overall = 0.6 * fraud_risk + 0.4 * anomaly_risk
    assert abs(overall_risk - expected_overall) < 1e-4


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
