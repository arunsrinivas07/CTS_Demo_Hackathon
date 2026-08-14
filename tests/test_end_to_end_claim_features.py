import json
from pathlib import Path
import sys
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "inference"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from feature_builders import build_claim_features
from fraud_detection.inference.model_a_inference import predict_fraud
from fraud_detection.inference.model_b_inference import predict_anomaly
from fraud_detection.inference.risk_fusion import fuse_risk

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_A_SCHEMA = BASE_DIR / "models" / "model_a_supervised" / "feature_schema.json"


def load_model_a_schema():
    with open(MODEL_A_SCHEMA, "r") as f:
        return json.load(f)["features"]


@pytest.fixture
def sample_provider_context():
    features = load_model_a_schema()
    ctx = {feat: 5.0 for feat in features}
    ctx["Unique_Beneficiaries"] = 25
    ctx["Total_Claims"] = 100
    ctx["Total_Reimbursement"] = 50000.0
    return ctx


def test_e2e_carrier(sample_provider_context):
    raw_carrier = {
        "claim_id": "CARRIER_E2E_001",
        "claim_type": "CARRIER",
        "claim_start_date": "2009-08-15",
        "claim_payment": 220.0,
        "allowed_charge_amt": 250.0,
        "deductible_amt": 10.0,
        "coinsurance_amt": 20.0,
        "primary_payer_payment": 0.0,
        "diagnosis_codes": ["4019"],
        "line_items": [{"hcpcs_code": "99213", "line_payment": 220.0}],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 26,
            "BENE_COUNTY_CD": 950,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }
    carrier_provider_ctx = {
        "provider_claim_volume": 30,
        "provider_avg_claim_payment": 200.0,
    }

    built = build_claim_features("CARRIER", raw_carrier, {**sample_provider_context, **carrier_provider_ctx})

    # Model B Inference
    mb_features = built["model_b"]["features"]
    res_b = predict_anomaly("CARRIER", mb_features)
    anomaly_row = res_b.iloc[0]

    # Model A Inference
    ma_features = built["model_a"]["features"]
    res_a = predict_fraud("PRV_CARRIER_01", ma_features)
    fraud_row = res_a.iloc[0]

    # Risk Fusion
    fused = fuse_risk(
        provider="PRV_CARRIER_01",
        claim_id="CARRIER_E2E_001",
        claim_type="CARRIER",
        fraud_probability=float(fraud_row["FRAUD_PROBABILITY"]),
        fraud_risk_score=float(fraud_row["FRAUD_RISK_SCORE"]),
        anomaly_score=float(anomaly_row["ANOMALY_SCORE"]),
        anomaly_risk_score=float(anomaly_row["ANOMALY_RISK_SCORE"]),
        anomaly_level=str(anomaly_row["ANOMALY_LEVEL"]),
    )

    assert "OVERALL_RISK_SCORE" in fused
    assert "OVERALL_RISK_LEVEL" in fused


def test_e2e_outpatient(sample_provider_context):
    raw_outpatient = {
        "claim_id": "OUTPATIENT_E2E_001",
        "claim_type": "OUTPATIENT",
        "claim_start_date": "2008-11-01",
        "claim_end_date": "2008-11-01",
        "CLM_PMT_AMT": 450.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "diagnosis_codes": ["25000"],
        "procedure_codes": [],
        "hcpcs_codes": ["G0008"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 2,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 15,
            "BENE_COUNTY_CD": 100,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }

    built = build_claim_features("OUTPATIENT", raw_outpatient, sample_provider_context)

    # Model B Inference
    mb_features = built["model_b"]["features"]
    res_b = predict_anomaly("OUTPATIENT", mb_features)
    anomaly_row = res_b.iloc[0]

    # Model A Inference
    ma_features = built["model_a"]["features"]
    res_a = predict_fraud("PRV_OUTPATIENT_01", ma_features)
    fraud_row = res_a.iloc[0]

    # Risk Fusion
    fused = fuse_risk(
        provider="PRV_OUTPATIENT_01",
        claim_id="OUTPATIENT_E2E_001",
        claim_type="OUTPATIENT",
        fraud_probability=float(fraud_row["FRAUD_PROBABILITY"]),
        fraud_risk_score=float(fraud_row["FRAUD_RISK_SCORE"]),
        anomaly_score=float(anomaly_row["ANOMALY_SCORE"]),
        anomaly_risk_score=float(anomaly_row["ANOMALY_RISK_SCORE"]),
        anomaly_level=str(anomaly_row["ANOMALY_LEVEL"]),
    )

    assert "OVERALL_RISK_SCORE" in fused


def test_e2e_inpatient(sample_provider_context):
    raw_inpatient = {
        "claim_id": "INPATIENT_E2E_001",
        "claim_type": "INPATIENT",
        "claim_start_date": "2010-03-01",
        "claim_end_date": "2010-03-06",
        "CLM_PMT_AMT": 8500.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "CLM_UTLZTN_DAY_CNT": 5.0,
        "diagnosis_codes": ["41001", "4019", "2724"],
        "procedure_codes": ["3615", "3722"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 39,
            "BENE_COUNTY_CD": 230,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }
    inpatient_provider_ctx = {
        "CLAIM_COUNT": 120,
        "UNIQUE_CLAIM_COUNT": 120,
        "TOTAL_PAYMENT": 1200000.0,
        "AVG_PAYMENT": 10000.0,
        "MEDIAN_PAYMENT": 9000.0,
        "MAX_PAYMENT": 50000.0,
        "AVG_CLAIM_DURATION": 6.0,
        "MAX_CLAIM_DURATION": 30.0,
        "AVG_DIAGNOSIS_COUNT": 9.0,
        "AVG_PROCEDURE_COUNT": 1.8,
        "NEGATIVE_PAYMENT_COUNT": 0,
        "PRIMARY_PAYER_PAYMENT_COUNT": 2,
        "NEGATIVE_PAYMENT_RATE": 0.0,
        "PRIMARY_PAYER_PAYMENT_RATE": 0.016,
        "UNIQUE_BENEFICIARIES": 95,
        "CLAIMS_PER_BENEFICIARY": 1.26,
        "PAYMENT_STD": 8000.0,
        "CLAIM_DURATION_STD": 4.5,
    }

    built = build_claim_features("INPATIENT", raw_inpatient, {**sample_provider_context, **inpatient_provider_ctx})

    # Model B Inference
    mb_features = built["model_b"]["features"]
    res_b = predict_anomaly("INPATIENT", mb_features)
    anomaly_row = res_b.iloc[0]

    # Model A Inference
    ma_features = built["model_a"]["features"]
    res_a = predict_fraud("PRV_INPATIENT_01", ma_features)
    fraud_row = res_a.iloc[0]

    # Risk Fusion
    fused = fuse_risk(
        provider="PRV_INPATIENT_01",
        claim_id="INPATIENT_E2E_001",
        claim_type="INPATIENT",
        fraud_probability=float(fraud_row["FRAUD_PROBABILITY"]),
        fraud_risk_score=float(fraud_row["FRAUD_RISK_SCORE"]),
        anomaly_score=float(anomaly_row["ANOMALY_SCORE"]),
        anomaly_risk_score=float(anomaly_row["ANOMALY_RISK_SCORE"]),
        anomaly_level=str(anomaly_row["ANOMALY_LEVEL"]),
    )

    assert "OVERALL_RISK_SCORE" in fused
