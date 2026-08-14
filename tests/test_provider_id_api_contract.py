import json
from pathlib import Path
import sys
from fastapi.testclient import TestClient

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app
from feature_builders.claim_feature_builder import build_claim_features
from inference.model_a_inference import predict_fraud
from inference.model_b_inference import predict_anomaly

client = TestClient(app)

MODEL_A_SCHEMA_PATH = PROJECT_ROOT / "models" / "model_a_supervised" / "feature_schema.json"


def load_model_a_features():
    with open(MODEL_A_SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)["features"]


def run_tests():
    # Setup sample payloads
    valid_outpatient_claim = {
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

    valid_carrier_claim = {
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

    valid_inpatient_claim = {
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

    # ============================================================
    # EXECUTE CHECKS
    # ============================================================
    print("=" * 60)
    print("PROVIDER ID API CONTRACT TEST")
    print("=" * 60)
    print()

    # 1. provider_id required
    payload_no_provider = {
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
        "claim": valid_outpatient_claim,
    }
    resp = client.post("/api/analyze-claim", json=payload_no_provider)
    if resp.status_code == 422:
        print("[PASS] provider_id required")
    else:
        print("[FAIL] provider_id required")
        sys.exit(1)

    # 2. valid provider lookup
    payload_valid = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
        "claim": valid_outpatient_claim,
    }
    resp = client.post("/api/analyze-claim", json=payload_valid)
    data = resp.json()
    if resp.status_code == 200 and data["fraud"]["available"] is True and "reason" not in data["fraud"]:
        print("[PASS] valid provider lookup")
    else:
        print(f"[FAIL] valid provider lookup: {resp.status_code} - {data}")
        sys.exit(1)

    # 3. Model A receives 30 features
    # Retrieve the Model A features using the internal feature builder directly to verify features
    from backend.routes.claim_analysis import MODEL_A_PROVIDER_LOOKUP
    model_a_ctx = MODEL_A_PROVIDER_LOOKUP.get("PRV51001")
    built = build_claim_features("OUTPATIENT", valid_outpatient_claim, model_a_ctx)
    df_a = built["model_a"]["features"]
    if len(df_a.columns) == 30:
        print("[PASS] Model A receives 30 features")
    else:
        print(f"[FAIL] Model A receives 30 features (got {len(df_a.columns)})")
        sys.exit(1)

    # 4. provider_id excluded from Model A features
    if "provider_id" not in df_a.columns and "Provider" not in df_a.columns:
        print("[PASS] provider_id excluded from Model A features")
    else:
        print("[FAIL] provider_id excluded from Model A features")
        sys.exit(1)

    # 5. provider_id excluded from Model B features
    df_b = built["model_b"]["features"]
    if "provider_id" not in df_b.columns and "Provider" not in df_b.columns:
        print("[PASS] provider_id excluded from Model B features")
    else:
        print("[FAIL] provider_id excluded from Model B features")
        sys.exit(1)

    # 6. unknown provider handled safely
    payload_unknown = {
        "provider_id": "PRV99999",
        "claim_id": "CLM_OUT_API_01",
        "claim_type": "OUTPATIENT",
        "claim": valid_outpatient_claim,
    }
    resp = client.post("/api/analyze-claim", json=payload_unknown)
    data_unknown = resp.json()
    if (
        resp.status_code == 200
        and data_unknown["fraud"]["available"] is False
        and "not found in Model A provider-context" in data_unknown["fraud"]["reason"]
    ):
        print("[PASS] unknown provider handled safely")
    else:
        print(f"[FAIL] unknown provider handled safely: {data_unknown}")
        sys.exit(1)

    # 7. OUTPATIENT pipeline
    # Verified by the response above
    if data["anomaly"]["risk_score"] is not None and data["overall"]["risk_score"] is not None:
        print("[PASS] OUTPATIENT pipeline")
    else:
        print("[FAIL] OUTPATIENT pipeline")
        sys.exit(1)

    # 8. CARRIER pipeline
    carrier_claim_payload = {
        **valid_carrier_claim,
        "provider_claim_volume": 40,
        "provider_avg_claim_payment": 150.0,
    }
    payload_carrier = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_CAR_API_01",
        "claim_type": "CARRIER",
        "claim": carrier_claim_payload,
    }
    resp = client.post("/api/analyze-claim", json=payload_carrier)
    data_carrier = resp.json()
    if resp.status_code == 200 and data_carrier["success"] is True:
        print("[PASS] CARRIER pipeline")
    else:
        print(f"[FAIL] CARRIER pipeline: {data_carrier}")
        sys.exit(1)

    # 9. INPATIENT pipeline
    inpatient_claim_payload = {
        **valid_inpatient_claim,
        "PRVDR_NUM": "01006H",
    }
    payload_inpatient = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_INP_API_01",
        "claim_type": "INPATIENT",
        "claim": inpatient_claim_payload,
    }
    resp = client.post("/api/analyze-claim", json=payload_inpatient)
    data_inpatient = resp.json()
    if resp.status_code == 200 and data_inpatient["success"] is True:
        print("[PASS] INPATIENT pipeline")
    else:
        print(f"[FAIL] INPATIENT pipeline: {data_inpatient}")
        sys.exit(1)

    # 10. no cross-dataset provider mapping
    # Assert that supplying an arbitrary provider_id (PRV99999) doesn't mapped to PRV51001 automatically
    # and results in missing context
    if data_unknown["fraud"]["available"] is False:
        print("[PASS] no cross-dataset provider mapping")
    else:
        print("[FAIL] no cross-dataset provider mapping")
        sys.exit(1)

    # 11. risk fusion
    # Assert that overall risk score matches weighted sum: 0.6 * fraud_risk_score + 0.4 * anomaly_risk_score
    fraud_risk = data["fraud"]["risk_score"]
    anomaly_risk = data["anomaly"]["risk_score"]
    overall_risk = data["overall"]["risk_score"]
    expected_overall = 0.6 * fraud_risk + 0.4 * anomaly_risk
    if abs(overall_risk - expected_overall) < 1e-4:
        print("[PASS] risk fusion")
    else:
        print(f"[FAIL] risk fusion (got {overall_risk}, expected {expected_overall})")
        sys.exit(1)

    # 12. existing inference compatibility
    # Call directly ML models with built features
    res_b = predict_anomaly("OUTPATIENT", df_b)
    res_a = predict_fraud("PRV51001", df_a)
    if "ANOMALY_SCORE" in res_b.columns and "FRAUD_PROBABILITY" in res_a.columns:
        print("[PASS] existing inference compatibility")
    else:
        print("[FAIL] existing inference compatibility")
        sys.exit(1)

    print()
    print("=" * 60)
    print("PROVIDER ID API CONTRACT: PASS")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
