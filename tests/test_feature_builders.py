import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "inference"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from feature_builders import (
    build_carrier_features,
    build_claim_features,
    build_inpatient_features,
    build_model_a_features,
    build_outpatient_features,
)
from model_a_inference import predict_fraud
from model_b_inference import predict_anomaly

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_A_SCHEMA = BASE_DIR / "models" / "model_a_supervised" / "feature_schema.json"
CARRIER_SCHEMA = BASE_DIR / "models" / "model_b_anomaly" / "carrier" / "feature_schema.json"
OUTPATIENT_SCHEMA = BASE_DIR / "models" / "model_b_anomaly" / "outpatient" / "feature_schema.json"
INPATIENT_SCHEMA = BASE_DIR / "models" / "model_b_anomaly" / "inpatient" / "feature_schema.json"


def load_schema(path):
    with open(path, "r") as f:
        return json.load(f)["features"]


@pytest.fixture
def sample_carrier_claim():
    return {
        "claim_id": "CAR123",
        "claim_type": "CARRIER",
        "claim_start_date": "2009-05-10",
        "claim_payment": 150.0,
        "allowed_charge_amt": 200.0,
        "deductible_amt": 20.0,
        "coinsurance_amt": 30.0,
        "primary_payer_payment": 0.0,
        "line_items": [
            {"hcpcs_code": "99213", "line_payment": 75.0},
            {"hcpcs_code": "99214", "line_payment": 75.0},
        ],
        "diagnosis_codes": ["4019", "25000"],
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
def sample_carrier_provider_context():
    return {
        "provider_claim_volume": 45,
        "provider_avg_claim_payment": 120.5,
    }


@pytest.fixture
def sample_outpatient_claim():
    return {
        "claim_id": "OUT123",
        "claim_type": "OUTPATIENT",
        "claim_start_date": "2008-04-01",
        "claim_end_date": "2008-04-02",
        "CLM_PMT_AMT": 300.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "diagnosis_codes": ["7802"],
        "procedure_codes": ["99201"],
        "hcpcs_codes": ["99201"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 2,
            "BENE_RACE_CD": 1,
            "BENE_ESRD_IND": 0,
            "SP_STATE_CODE": 10,
            "BENE_COUNTY_CD": 200,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }


@pytest.fixture
def sample_inpatient_claim():
    return {
        "claim_id": "INP123",
        "claim_type": "INPATIENT",
        "claim_start_date": "2010-06-01",
        "claim_end_date": "2010-06-05",
        "CLM_PMT_AMT": 4500.0,
        "NCH_PRMRY_PYR_CLM_PD_AMT": 0.0,
        "CLM_UTLZTN_DAY_CNT": 4.0,
        "diagnosis_codes": ["4280", "4019", "25000"],
        "procedure_codes": ["3893"],
        "beneficiary": {
            "BENE_SEX_IDENT_CD": 1,
            "BENE_RACE_CD": 2,
            "BENE_ESRD_IND": 1,
            "SP_STATE_CODE": 39,
            "BENE_COUNTY_CD": 110,
            "PLAN_CVRG_MOS_NUM": 12,
        },
    }


@pytest.fixture
def sample_inpatient_provider_context():
    return {
        "CLAIM_COUNT": 50,
        "UNIQUE_CLAIM_COUNT": 50,
        "TOTAL_PAYMENT": 450000.0,
        "AVG_PAYMENT": 9000.0,
        "MEDIAN_PAYMENT": 8000.0,
        "MAX_PAYMENT": 35000.0,
        "AVG_CLAIM_DURATION": 5.5,
        "MAX_CLAIM_DURATION": 20.0,
        "AVG_DIAGNOSIS_COUNT": 8.5,
        "AVG_PROCEDURE_COUNT": 1.5,
        "NEGATIVE_PAYMENT_COUNT": 0,
        "PRIMARY_PAYER_PAYMENT_COUNT": 1,
        "NEGATIVE_PAYMENT_RATE": 0.0,
        "PRIMARY_PAYER_PAYMENT_RATE": 0.02,
        "UNIQUE_BENEFICIARIES": 42,
        "CLAIMS_PER_BENEFICIARY": 1.19,
        "PAYMENT_STD": 4500.0,
        "CLAIM_DURATION_STD": 3.2,
    }


@pytest.fixture
def sample_model_a_provider_context():
    schema = load_schema(MODEL_A_SCHEMA)
    return {feat: 10.0 for feat in schema}


# ------------------------------------------------------------
# 1. Feature Count, Name & Order Validation Tests
# ------------------------------------------------------------

def test_carrier_feature_schema(sample_carrier_claim, sample_carrier_provider_context):
    df = build_carrier_features(sample_carrier_claim, sample_carrier_provider_context)
    expected = load_schema(CARRIER_SCHEMA)
    assert len(df.columns) == 53
    assert list(df.columns) == expected


def test_outpatient_feature_schema(sample_outpatient_claim):
    df = build_outpatient_features(sample_outpatient_claim)
    expected = load_schema(OUTPATIENT_SCHEMA)
    assert len(df.columns) == 51
    assert list(df.columns) == expected


def test_inpatient_feature_schema(sample_inpatient_claim, sample_inpatient_provider_context):
    df = build_inpatient_features(sample_inpatient_claim, sample_inpatient_provider_context)
    expected = load_schema(INPATIENT_SCHEMA)
    assert len(df.columns) == 62
    assert list(df.columns) == expected


# ------------------------------------------------------------
# 2. Missing Value and Infinite Value Handling Tests
# ------------------------------------------------------------

def test_missing_and_infinite_handling(sample_carrier_claim, sample_carrier_provider_context):
    # Omit beneficiary state code
    sample_carrier_claim["beneficiary"]["SP_STATE_CODE"] = None
    sample_carrier_claim["allowed_charge_amt"] = 0.0  # payment_to_allowed ratio division by 0 -> inf/nan
    df = build_carrier_features(sample_carrier_claim, sample_carrier_provider_context)

    assert df["SP_STATE_CODE_MISSING"].iloc[0] == 1
    assert not np.isinf(df["payment_to_allowed_ratio"].iloc[0])
    assert not df.isna().any().any()


# ------------------------------------------------------------
# 3. Model B Loud Failure on Missing Historical Context
# ------------------------------------------------------------

def test_carrier_missing_context_failure(sample_carrier_claim):
    with pytest.raises(ValueError, match="provider_claim_volume"):
        build_carrier_features(sample_carrier_claim, provider_context=None)


def test_inpatient_missing_context_failure(sample_inpatient_claim):
    with pytest.raises(ValueError, match="Missing required provider historical context"):
        build_inpatient_features(sample_inpatient_claim, provider_context=None)


# ------------------------------------------------------------
# 4. Model A Provider Features Tests
# ------------------------------------------------------------

def test_model_a_valid_context(sample_model_a_provider_context):
    res = build_model_a_features(sample_model_a_provider_context)
    assert res["available"] is True
    assert res["reason"] is None
    assert res["features"] is not None
    assert len(res["features"].columns) == 30
    assert list(res["features"].columns) == load_schema(MODEL_A_SCHEMA)


def test_model_a_unavailable_context():
    res = build_model_a_features(None)
    assert res["available"] is False
    assert res["features"] is None
    assert "unavailable" in res["reason"].lower()


# ------------------------------------------------------------
# 5. Single Raw Claim & Independent Feature Generation
# ------------------------------------------------------------

def test_claim_feature_builder_independence(sample_outpatient_claim, sample_model_a_provider_context):
    res = build_claim_features(
        claim_type="OUTPATIENT",
        raw_claim=sample_outpatient_claim,
        provider_context=sample_model_a_provider_context,
    )

    assert res["claim_type"] == "OUTPATIENT"
    assert res["model_a"]["available"] is True
    assert len(res["model_a"]["features"].columns) == 30
    assert len(res["model_b"]["features"].columns) == 51


# ------------------------------------------------------------
# 6. Model B & Model A Inference Compatibility Tests
# ------------------------------------------------------------

def test_model_b_inference_consumption(sample_carrier_claim, sample_carrier_provider_context):
    df_carrier = build_carrier_features(sample_carrier_claim, sample_carrier_provider_context)
    res_b = predict_anomaly("CARRIER", df_carrier)
    assert "ANOMALY_SCORE" in res_b.columns
    assert "ANOMALY_RISK_SCORE" in res_b.columns


def test_model_a_inference_consumption(sample_model_a_provider_context):
    res_a_builder = build_model_a_features(sample_model_a_provider_context)
    df_a = res_a_builder["features"]
    res_a = predict_fraud(provider="PRV_TEST", features=df_a)
    assert "FRAUD_PROBABILITY" in res_a.columns
    assert "FRAUD_RISK_SCORE" in res_a.columns
