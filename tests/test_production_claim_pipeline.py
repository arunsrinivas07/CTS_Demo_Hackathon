import json
from pathlib import Path
import sys
import numpy as np
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from feature_builders.claim_feature_builder import build_claim_features
from inference.model_a_inference import predict_fraud
from inference.model_b_inference import predict_anomaly
from inference.risk_fusion import fuse_risk

MODEL_A_SCHEMA_PATH = PROJECT_ROOT / "models" / "model_a_supervised" / "feature_schema.json"
MODEL_B_OUTPATIENT_SCHEMA_PATH = PROJECT_ROOT / "models" / "model_b_anomaly" / "outpatient" / "feature_schema.json"


def load_schema_features(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["features"]


def test_production_claim_pipeline():
    failures = []

    def check(condition, message):
        if condition:
            print(f"[PASS] {message}")
        else:
            print(f"[FAIL] {message}")
            failures.append(message)

    print("=" * 80)
    print("TEST PRODUCTION CLAIM PIPELINE VERIFICATION")
    print("=" * 80)

    # 1. Construct synthetic OUTPATIENT raw claim
    raw_claim = {
        "claim_id": "CLM_OUT_88210",
        "claim_type": "OUTPATIENT",
        "provider_id": "PRV51001",
        "beneficiary_id": "BENE9010",
        "claim_start_date": "2008-05-10",
        "claim_end_date": "2008-05-10",
        "CLM_PMT_AMT": 350.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "TOTAL_REIMBURSEMENT": 350.0,
        "diagnosis_codes": ["7802", "4019"],
        "procedure_codes": ["99201"],
        "hcpcs_codes": ["99201"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 26,
            "BENE_COUNTY_CD": 950,
            "BENE_HI_CVRAGE_TOT_MONS": 12,
            "BENE_SMI_CVRAGE_TOT_MONS": 12,
            "BENE_HMO_CVRAGE_TOT_MONS": 0,
            "PLAN_CVRG_MOS_NUM": 12,
            "SP_ALZHDMTA": 2,
            "SP_CHF": 2,
            "SP_CHRNKIDN": 2,
            "SP_CNCR": 2,
            "SP_COPD": 2,
            "SP_DEPRESSN": 2,
            "SP_DIABETES": 1,
            "SP_ISCHMCHT": 1,
            "SP_OSTEOPRS": 2,
            "SP_RA_OA": 2,
            "SP_STRKETIA": 2,
            "MEDREIMB_IP": 0.0,
            "BENRES_IP": 0.0,
            "PPPYMT_IP": 0.0,
            "MEDREIMB_OP": 350.0,
            "BENRES_OP": 50.0,
            "PPPYMT_OP": 0.0,
            "MEDREIMB_CAR": 0.0,
            "BENRES_CAR": 0.0,
            "PPPYMT_CAR": 0.0,
        },
    }

    # 2. Construct valid provider_context containing the 30 Model A features
    provider_context = {
        "Unique_Beneficiaries": 30,
        "Avg_Patient_Age": 68.5,
        "Avg_Chronic_Conditions": 3.2,
        "IP_Claim_Count": 5,
        "IP_Unique_Beneficiaries": 4,
        "IP_Total_Reimbursement": 35000.0,
        "IP_Avg_Reimbursement": 7000.0,
        "IP_Max_Reimbursement": 15000.0,
        "IP_Total_Deductible": 4000.0,
        "IP_Avg_Deductible": 800.0,
        "IP_Avg_Claim_Duration": 4.5,
        "IP_Max_Claim_Duration": 10.0,
        "IP_Unique_Diagnosis_Codes": 12,
        "IP_Unique_Procedure_Codes": 4,
        "OP_Claim_Count": 40,
        "OP_Unique_Beneficiaries": 28,
        "OP_Total_Reimbursement": 14000.0,
        "OP_Avg_Reimbursement": 350.0,
        "OP_Max_Reimbursement": 1200.0,
        "OP_Total_Deductible": 2000.0,
        "OP_Avg_Deductible": 50.0,
        "Total_Claims": 45,
        "Total_Reimbursement": 49000.0,
        "Total_Deductible": 6000.0,
        "Claims_Per_Beneficiary": 1.5,
        "Reimbursement_Per_Beneficiary": 1633.33,
        "IP_Claim_Share": 0.111,
        "OP_Claim_Share": 0.889,
        "IP_Reimbursement_Range": 15000.0,
        "OP_Reimbursement_Range": 1200.0,
    }

    # 3. Call build_claim_features
    built = build_claim_features(
        claim_type="OUTPATIENT",
        raw_claim=raw_claim,
        provider_context=provider_context,
    )

    model_b_features = built["model_b"]["features"]
    model_a_features = built["model_a"]["features"]

    # 4. Verify Model B output has exactly 51 features
    expected_b_features = load_schema_features(MODEL_B_OUTPATIENT_SCHEMA_PATH)
    check(
        len(model_b_features.columns) == 51,
        f"Model B output has exactly 51 features (got {len(model_b_features.columns)})",
    )
    check(
        list(model_b_features.columns) == expected_b_features,
        "Model B feature names and order exactly match outpatient schema",
    )

    # 5. Verify Model A output has exactly 30 features
    expected_a_features = load_schema_features(MODEL_A_SCHEMA_PATH)
    check(
        model_a_features is not None and len(model_a_features.columns) == 30,
        f"Model A output has exactly 30 features (got {len(model_a_features.columns) if model_a_features is not None else 0})",
    )
    check(
        list(model_a_features.columns) == expected_a_features,
        "Model A feature names and order exactly match Model A schema",
    )

    # 12 & 13. Independence checks: No Model A feature in Model B and vice versa
    # Model A features are provider aggregates, Model B features are claim metrics
    mb_cols = set(model_b_features.columns)
    ma_cols = set(model_a_features.columns)

    check(
        len(ma_cols.intersection(mb_cols)) == 0,
        "Zero overlap between Model A features and Model B features",
    )

    # 6. Pass Model B features into predict_anomaly
    anomaly_res = predict_anomaly("OUTPATIENT", model_b_features)
    anomaly_row = anomaly_res.iloc[0]

    # 7. Pass Model A features into predict_fraud
    fraud_res = predict_fraud("PRV51001", model_a_features)
    fraud_row = fraud_res.iloc[0]

    # 8. Pass both outputs into fuse_risk
    fused_res = fuse_risk(
        provider="PRV51001",
        claim_id=raw_claim["claim_id"],
        claim_type=raw_claim["claim_type"],
        fraud_probability=float(fraud_row["FRAUD_PROBABILITY"]),
        fraud_risk_score=float(fraud_row["FRAUD_RISK_SCORE"]),
        anomaly_score=float(anomaly_row["ANOMALY_SCORE"]),
        anomaly_risk_score=float(anomaly_row["ANOMALY_RISK_SCORE"]),
        anomaly_level=str(anomaly_row["ANOMALY_LEVEL"]),
    )

    # 9. Verify final result contains required fields
    required_keys = [
        ("Provider", "PRV51001"),
        ("CLM_ID", raw_claim["claim_id"]),
        ("CLAIM_TYPE", "OUTPATIENT"),
        ("FRAUD_PROBABILITY", None),
        ("FRAUD_RISK_SCORE", None),
        ("ANOMALY_SCORE", None),
        ("ANOMALY_RISK_SCORE", None),
        ("OVERALL_RISK_SCORE", None),
        ("OVERALL_RISK_LEVEL", None),
    ]

    for key, expected_val in required_keys:
        has_key = key in fused_res
        check(has_key, f"Fused output contains '{key}'")
        if has_key and expected_val is not None:
            check(str(fused_res[key]) == str(expected_val), f"Fused output '{key}' matches expected '{expected_val}'")

    # 10. Verify all numeric scores
    numeric_keys = [
        "FRAUD_PROBABILITY",
        "FRAUD_RISK_SCORE",
        "ANOMALY_SCORE",
        "ANOMALY_RISK_SCORE",
        "OVERALL_RISK_SCORE",
    ]

    for key in numeric_keys:
        val = fused_res.get(key)
        is_num = isinstance(val, (int, float, np.number)) and not np.isnan(val)
        check(is_num, f"Score '{key}' is valid numeric (got {val})")

    # 11. Verify all risk scores are between 0 and 100
    risk_score_keys = ["FRAUD_RISK_SCORE", "ANOMALY_RISK_SCORE", "OVERALL_RISK_SCORE"]
    for key in risk_score_keys:
        val = fused_res.get(key)
        is_valid_range = isinstance(val, (int, float, np.number)) and (0.0 <= float(val) <= 100.0)
        check(is_valid_range, f"Risk score '{key}' is between 0 and 100 (got {val})")

    print("\n" + "=" * 80)
    print("VERIFICATION SUMMARY")
    print("=" * 80)

    if failures:
        print("STATUS: FAIL")
        print("\nFailures:")
        for failure in failures:
            print(" -", failure)
        assert False, f"Production claim pipeline test failed with {len(failures)} failures."
    else:
        print("STATUS: PASS")
        print("\nAll production claim pipeline assertions passed cleanly.")


if __name__ == "__main__":
    test_production_claim_pipeline()
