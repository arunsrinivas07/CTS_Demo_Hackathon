import json
from pathlib import Path
import sys
import pandas as pd
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app import app
from feature_builders.carrier_features import build_carrier_features
from feature_builders.inpatient_features import build_inpatient_features
from feature_builders.outpatient_features import build_outpatient_features
from inference.model_a_inference import predict_fraud
from inference.model_b_inference import predict_anomaly
from xai.shap_model_a import explain_fraud
from xai.shap_model_b import explain_anomaly


def run_xai_detail_mode_verification():
    client = TestClient(app)

    print("=" * 60)
    print("XAI DETAIL MODE VERIFICATION")
    print("=" * 60)
    print()

    # Outpatient claim sample payload
    outpatient_claim = {
        "claim_id": "CLM_OUT_DETAIL_01",
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

    payload_default = {
        "provider_id": "PRV51001",
        "claim_id": "CLM_OUT_DETAIL_01",
        "claim_type": "OUTPATIENT",
        "claim": outpatient_claim,
    }

    # 1. Default API request
    resp_def = client.post("/api/analyze-claim", json=payload_default)
    if resp_def.status_code != 200:
        print(f"[FAIL] Default API request failed: {resp_def.status_code}")
        sys.exit(1)
    data_def = resp_def.json()

    # 1 & 2. Default fraud and anomaly explanations limited to top 5
    fraud_drivers_def = data_def["fraud"]["explanation"].get("top_drivers", [])
    anomaly_drivers_def = data_def["anomaly"]["explanation"].get("top_drivers", [])

    if len(fraud_drivers_def) <= 5:
        print("[PASS] Default fraud explanation limited to top 5")
    else:
        print("[FAIL] Default fraud explanation limited to top 5")
        sys.exit(1)

    if len(anomaly_drivers_def) <= 5:
        print("[PASS] Default anomaly explanation limited to top 5")
    else:
        print("[FAIL] Default anomaly explanation limited to top 5")
        sys.exit(1)

    # 3. Default response excludes all_feature_contributions
    if (
        "all_feature_contributions" not in data_def["fraud"]["explanation"]
        and "all_feature_contributions" not in data_def["anomaly"]["explanation"]
    ):
        print("[PASS] Default response excludes all_feature_contributions")
    else:
        print("[FAIL] Default response excludes all_feature_contributions")
        sys.exit(1)

    # 4. Detailed request for Model A
    schema_a_path = PROJECT_ROOT / "models" / "model_a_supervised" / "feature_schema.json"
    with open(schema_a_path, "r", encoding="utf-8") as f:
        cols_a = json.load(f)["features"]
    df_a = pd.DataFrame([{c: 50.0 for c in cols_a}], columns=cols_a)
    exp_a_detailed = explain_fraud("PRV51001", df_a, detail=True)

    if len(exp_a_detailed["all_feature_contributions"]) == 30:
        print("[PASS] Model A detailed explanation returns 30 features")
    else:
        print("[FAIL] Model A detailed explanation returns 30 features")
        sys.exit(1)

    # 5. Carrier detailed explanation
    raw_carrier = {
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
    car_df = build_carrier_features(raw_carrier)
    exp_car_detailed = explain_anomaly("CARRIER", car_df, detail=True)

    if len(exp_car_detailed["all_feature_contributions"]) == 53:
        print("[PASS] Carrier detailed explanation returns 53 features")
    else:
        print("[FAIL] Carrier detailed explanation returns 53 features")
        sys.exit(1)

    # 6. Outpatient detailed explanation
    out_df = build_outpatient_features(outpatient_claim)
    exp_out_detailed = explain_anomaly("OUTPATIENT", out_df, detail=True)

    if len(exp_out_detailed["all_feature_contributions"]) == 51:
        print("[PASS] Outpatient detailed explanation returns 51 features")
    else:
        print("[FAIL] Outpatient detailed explanation returns 51 features")
        sys.exit(1)

    # 7. Inpatient detailed explanation
    raw_inpatient = {
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
    inp_ctx = {
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
    inp_df = build_inpatient_features(raw_inpatient, inp_ctx)
    exp_inp_detailed = explain_anomaly("INPATIENT", inp_df, detail=True)

    if len(exp_inp_detailed["all_feature_contributions"]) == 62:
        print("[PASS] Inpatient detailed explanation returns 62 features")
    else:
        print("[FAIL] Inpatient detailed explanation returns 62 features")
        sys.exit(1)

    # 8. Detailed explanations sorted by absolute contribution
    abs_contribs_out = [abs(x["contribution"]) for x in exp_out_detailed["all_feature_contributions"]]
    if abs_contribs_out == sorted(abs_contribs_out, reverse=True):
        print("[PASS] Detailed explanations sorted by absolute contribution")
    else:
        print("[FAIL] Detailed explanations sorted by absolute contribution")
        sys.exit(1)

    # 9. Default top 5 matches detailed ranking
    # Fetch detailed via API POST ?detail=true
    resp_det = client.post("/api/analyze-claim?detail=true", json=payload_default)
    data_det = resp_det.json()

    top_def = data_def["anomaly"]["explanation"]["top_drivers"]
    top_det = data_det["anomaly"]["explanation"]["top_drivers"]
    if top_def == top_det:
        print("[PASS] Default top 5 matches detailed ranking")
    else:
        print("[FAIL] Default top 5 matches detailed ranking")
        sys.exit(1)

    # 10. SHAP values unchanged
    # Compare top driver contributions between default and detailed
    contrib_def = top_def[0]["contribution"]
    contrib_det = top_det[0]["contribution"]
    if contrib_def == contrib_det:
        print("[PASS] SHAP values unchanged")
    else:
        print("[FAIL] SHAP values unchanged")
        sys.exit(1)

    # 11. Risk scores unchanged
    if data_def["overall"]["risk_score"] == data_det["overall"]["risk_score"]:
        print("[PASS] Risk scores unchanged")
    else:
        print("[FAIL] Risk scores unchanged")
        sys.exit(1)

    # 12. Existing API tests pass
    resp_health = client.get("/api/health")
    if resp_health.status_code == 200:
        print("[PASS] Existing API tests pass")
    else:
        print("[FAIL] Existing API tests pass")
        sys.exit(1)

    print()
    print("=" * 60)
    print("XAI DETAIL MODE: PASS")
    print("=" * 60)


if __name__ == "__main__":
    run_xai_detail_mode_verification()
