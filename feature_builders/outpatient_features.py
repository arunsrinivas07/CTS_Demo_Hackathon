import json
from pathlib import Path
import numpy as np
import pandas as pd

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "models" / "model_b_anomaly" / "outpatient" / "feature_schema.json"


def load_outpatient_schema():
    with open(SCHEMA_PATH, "r") as f:
        schema = json.load(f)
    return schema["features"]


def build_outpatient_features(raw_claim: dict, provider_context: dict | None = None) -> pd.DataFrame:
    """
    Converts a raw OUTPATIENT claim into a single-row DataFrame matching the Outpatient Model B feature schema
    (exactly 51 features).

    Parameters
    ----------
    raw_claim : dict
        Raw claim data containing claim details and beneficiary information.
    provider_context : dict, optional
        Optional context (Outpatient Model B is claim-level focused).

    Returns
    -------
    pd.DataFrame
        Single-row DataFrame with 51 features in exact schema order.
    """
    expected_features = load_outpatient_schema()

    bene = raw_claim.get("beneficiary", {})
    if not isinstance(bene, dict):
        bene = {}

    def get_bene_val(key, default=0.0):
        val = bene.get(key, raw_claim.get(key))
        if val is None or pd.isna(val):
            return default
        return float(val)

    def get_bene_missing(key):
        val = bene.get(key, raw_claim.get(key))
        return 1 if (val is None or pd.isna(val)) else 0

    # Financial / Claim Metrics
    clm_pmt_amt = float(raw_claim.get("CLM_PMT_AMT", raw_claim.get("claim_payment", raw_claim.get("total_claim_payment_amt", 0.0))))
    primary_payer_amt = float(raw_claim.get("NCH_PRMRY_PYR_CLM_PD_AMT", raw_claim.get("primary_payer_payment", 0.0)))
    total_reimbursement = float(raw_claim.get("TOTAL_REIMBURSEMENT", clm_pmt_amt + primary_payer_amt))

    # Duration and Dates
    claim_start = raw_claim.get("claim_start_date") or raw_claim.get("CLM_FROM_DT") or "2008-01-01"
    claim_end = raw_claim.get("claim_end_date") or raw_claim.get("CLM_THRU_DT") or claim_start

    try:
        dt_start = pd.to_datetime(claim_start)
        dt_end = pd.to_datetime(claim_end)
        duration_days = max(1.0, float((dt_end - dt_start).days + 1))
        claim_year = float(dt_start.year)
        claim_month = float(dt_start.month)
    except Exception:
        duration_days = float(raw_claim.get("CLAIM_DURATION_DAYS", 1.0))
        claim_year = float(raw_claim.get("CLAIM_YEAR", 2008.0))
        claim_month = float(raw_claim.get("CLAIM_MONTH", 1.0))

    # Diagnosis, Procedure, HCPCS counts
    diag_codes = raw_claim.get("diagnosis_codes", [])
    proc_codes = raw_claim.get("procedure_codes", [])
    hcpcs_codes = raw_claim.get("hcpcs_codes", [])

    diag_count = len(diag_codes) if isinstance(diag_codes, list) and diag_codes else float(raw_claim.get("DIAGNOSIS_COUNT", 0))
    proc_count = len(proc_codes) if isinstance(proc_codes, list) and proc_codes else float(raw_claim.get("PROCEDURE_COUNT", 0))
    hcpcs_count = len(hcpcs_codes) if isinstance(hcpcs_codes, list) and hcpcs_codes else float(raw_claim.get("HCPCS_COUNT", 0))

    has_diag = 1.0 if diag_count > 0 else 0.0
    has_proc = 1.0 if proc_count > 0 else 0.0
    has_hcpcs = 1.0 if hcpcs_count > 0 else 0.0
    has_neg_payment = 1.0 if clm_pmt_amt < 0 else 0.0
    has_primary_payer = 1.0 if primary_payer_amt > 0 else 0.0

    is_segment_2 = float(1.0 if raw_claim.get("IS_SEGMENT_2", False) else 0.0)
    has_segment_1_match = float(1.0 if raw_claim.get("HAS_SEGMENT_1_MATCH", True) else 0.0)

    features_dict = {
        "CLM_PMT_AMT": clm_pmt_amt,
        "NCH_PRMRY_PYR_CLM_PD_AMT": primary_payer_amt,
        "TOTAL_REIMBURSEMENT": total_reimbursement,
        "CLAIM_DURATION_DAYS": duration_days,
        "CLAIM_YEAR": claim_year,
        "CLAIM_MONTH": claim_month,
        "DIAGNOSIS_COUNT": diag_count,
        "PROCEDURE_COUNT": proc_count,
        "HCPCS_COUNT": hcpcs_count,
        "HAS_DIAGNOSIS": has_diag,
        "HAS_PROCEDURE": has_proc,
        "HAS_HCPCS": has_hcpcs,
        "HAS_NEGATIVE_PAYMENT": has_neg_payment,
        "HAS_PRIMARY_PAYER_PAYMENT": has_primary_payer,
        "IS_SEGMENT_2": is_segment_2,
        "HAS_SEGMENT_1_MATCH": has_segment_1_match,
        "BENE_SEX_IDENT_CD": get_bene_val("BENE_SEX_IDENT_CD", 1.0),
        "BENE_RACE_CD": get_bene_val("BENE_RACE_CD", 1.0),
        "BENE_ESRD_IND": get_bene_val("BENE_ESRD_IND", 0.0),
        "SP_STATE_CODE": get_bene_val("SP_STATE_CODE", 0.0),
        "BENE_COUNTY_CD": get_bene_val("BENE_COUNTY_CD", 0.0),
        "BENE_HI_CVRAGE_TOT_MONS": get_bene_val("BENE_HI_CVRAGE_TOT_MONS", 12.0),
        "BENE_SMI_CVRAGE_TOT_MONS": get_bene_val("BENE_SMI_CVRAGE_TOT_MONS", 12.0),
        "BENE_HMO_CVRAGE_TOT_MONS": get_bene_val("BENE_HMO_CVRAGE_TOT_MONS", 0.0),
        "PLAN_CVRG_MOS_NUM": get_bene_val("PLAN_CVRG_MOS_NUM", 12.0),
        "SP_ALZHDMTA": get_bene_val("SP_ALZHDMTA", 2.0),
        "SP_CHF": get_bene_val("SP_CHF", 2.0),
        "SP_CHRNKIDN": get_bene_val("SP_CHRNKIDN", 2.0),
        "SP_CNCR": get_bene_val("SP_CNCR", 2.0),
        "SP_COPD": get_bene_val("SP_COPD", 2.0),
        "SP_DEPRESSN": get_bene_val("SP_DEPRESSN", 2.0),
        "SP_DIABETES": get_bene_val("SP_DIABETES", 2.0),
        "SP_ISCHMCHT": get_bene_val("SP_ISCHMCHT", 2.0),
        "SP_OSTEOPRS": get_bene_val("SP_OSTEOPRS", 2.0),
        "SP_RA_OA": get_bene_val("SP_RA_OA", 2.0),
        "SP_STRKETIA": get_bene_val("SP_STRKETIA", 2.0),
        "MEDREIMB_IP": get_bene_val("MEDREIMB_IP", 0.0),
        "BENRES_IP": get_bene_val("BENRES_IP", 0.0),
        "PPPYMT_IP": get_bene_val("PPPYMT_IP", 0.0),
        "MEDREIMB_OP": get_bene_val("MEDREIMB_OP", 0.0),
        "BENRES_OP": get_bene_val("BENRES_OP", 0.0),
        "PPPYMT_OP": get_bene_val("PPPYMT_OP", 0.0),
        "MEDREIMB_CAR": get_bene_val("MEDREIMB_CAR", 0.0),
        "BENRES_CAR": get_bene_val("BENRES_CAR", 0.0),
        "PPPYMT_CAR": get_bene_val("PPPYMT_CAR", 0.0),
        "BENE_SEX_IDENT_CD_MISSING": get_bene_missing("BENE_SEX_IDENT_CD"),
        "BENE_RACE_CD_MISSING": get_bene_missing("BENE_RACE_CD"),
        "BENE_ESRD_IND_MISSING": get_bene_missing("BENE_ESRD_IND"),
        "SP_STATE_CODE_MISSING": get_bene_missing("SP_STATE_CODE"),
        "BENE_COUNTY_CD_MISSING": get_bene_missing("BENE_COUNTY_CD"),
        "PLAN_CVRG_MOS_NUM_MISSING": get_bene_missing("PLAN_CVRG_MOS_NUM"),
    }

    df = pd.DataFrame([features_dict])
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0.0)
    df = df[expected_features]

    if len(df.columns) != len(expected_features):
        raise ValueError(f"Outpatient feature count mismatch: expected {len(expected_features)}, got {len(df.columns)}")

    if list(df.columns) != expected_features:
        raise ValueError("Outpatient feature order/name mismatch against schema.")

    return df
