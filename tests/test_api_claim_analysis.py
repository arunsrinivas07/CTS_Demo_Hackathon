import json
from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app

client = TestClient(app)

MODEL_A_SCHEMA_PATH = PROJECT_ROOT / "models" / "model_a_supervised" / "feature_schema.json"


def load_model_a_features():
    with open(MODEL_A_SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)["features"]


@pytest.fixture
def valid_outpatient_claim():
    return {
        "claim_id": "CLM_OUT_API_01",
        "provider_id": "PRV_OUT_API",
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


@pytest.fixture
def valid_carrier_claim():
    return {
        "claim_id": "CLM_CAR_API_01",
        "provider_id": "PRV_CAR_API",
        "claim_start_date": "2009-07-10",
        "claim_payment": 180.0,
        "allowed_charge_amt": 200.0,
        "deductible_amt": 20.0,
        "coinsurance_amt": 0.0,
        "primary_payer_payment": 0.0,
        "diagnosis_codes": ["4019"],
        "line_items": [{"hcpcs_code": "99213", "line_payment": 180.0}],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 26,
            "BENE_COUNTY_CD": 950,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }


@pytest.fixture
def valid_inpatient_claim():
    return {
        "claim_id": "CLM_INP_API_01",
        "provider_id": "PRV_INP_API",
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


# ------------------------------------------------------------
# 1. Health Endpoint Test
# ------------------------------------------------------------

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ------------------------------------------------------------
# 2. POST OUTPATIENT Claim Test
# ------------------------------------------------------------

def test_analyze_outpatient_claim(valid_outpatient_claim):
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
        "claim": valid_outpatient_claim,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["claim_type"] == "OUTPATIENT"
    assert data["fraud"]["available"] is True
    assert "reason" not in data["fraud"]
    assert data["anomaly"]["available"] is True


# ------------------------------------------------------------
# 3. POST CARRIER Claim Test
# ------------------------------------------------------------

def test_analyze_carrier_claim(valid_carrier_claim):
    # Add carrier model B provider stats directly in the claim payload
    claim_payload = {
        **valid_carrier_claim,
        "provider_claim_volume": 40,
        "provider_avg_claim_payment": 150.0,
    }
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_CAR_API_01",
        "claim_type": "CARRIER",
        "claim": claim_payload,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["claim_type"] == "CARRIER"
    assert data["fraud"]["available"] is True
    assert "reason" not in data["fraud"]
    assert data["anomaly"]["available"] is True


# ------------------------------------------------------------
# 4. POST INPATIENT Claim Test
# ------------------------------------------------------------

def test_analyze_inpatient_claim(valid_inpatient_claim):
    # We will use PRVDR_NUM = 01006H for inpatient provider lookup
    claim_payload = {
        **valid_inpatient_claim,
        "PRVDR_NUM": "01006H",
    }
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_INP_API_01",
        "claim_type": "INPATIENT",
        "claim": claim_payload,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["claim_type"] == "INPATIENT"
    assert data["fraud"]["available"] is True
    assert "reason" not in data["fraud"]
    assert data["anomaly"]["available"] is True


# ------------------------------------------------------------
# 5. Invalid Claim Type Test
# ------------------------------------------------------------

def test_invalid_claim_type(valid_outpatient_claim):
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "INVALID_TYPE",
        "claim": valid_outpatient_claim,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "code" in data["error"]


# ------------------------------------------------------------
# 6. Missing Claim Payload Test
# ------------------------------------------------------------

def test_missing_claim_payload():
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


# ------------------------------------------------------------
# 7. Missing Required Model B Historical Context Test
# ------------------------------------------------------------

def test_missing_carrier_historical_context(valid_carrier_claim):
    # Omit provider_claim_volume & provider_avg_claim_payment
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_CAR_API_01",
        "claim_type": "CARRIER",
        "claim": valid_carrier_claim,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "error" in data


# ------------------------------------------------------------
# 8. Model A Unavailable Context Test
# ------------------------------------------------------------

def test_model_a_unavailable_context(valid_outpatient_claim):
    # Use provider_id that doesn't exist
    payload = {
        "provider_id": "PRV99999",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
        "claim": valid_outpatient_claim,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["fraud"]["available"] is False
    assert "not found in Model A provider-context dataset" in data["fraud"]["reason"]
    assert data["anomaly"]["available"] is True


# ------------------------------------------------------------
# 9 & 10. Valid Fused Response & Numeric Bounded Scores Test
# ------------------------------------------------------------

def test_valid_fused_response_and_numeric_bounds(valid_outpatient_claim):
    payload = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
        "claim": valid_outpatient_claim,
    }
    response = client.post("/api/analyze-claim", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert "provider_id" in data
    assert "claim_id" in data
    assert "claim_type" in data
    assert "fraud" in data
    assert "anomaly" in data
    assert "overall" in data

    # Check numeric bounds (0.0 to 100.0)
    fraud_risk = data["fraud"]["risk_score"]
    anomaly_risk = data["anomaly"]["risk_score"]
    overall_risk = data["overall"]["risk_score"]

    assert isinstance(fraud_risk, (int, float)) and 0.0 <= fraud_risk <= 100.0
    assert isinstance(anomaly_risk, (int, float)) and 0.0 <= anomaly_risk <= 100.0
    assert isinstance(overall_risk, (int, float)) and 0.0 <= overall_risk <= 100.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
