import json
from pathlib import Path
import numpy as np
import pandas as pd

# Path to schema
SCHEMA_PATH = Path(__file__).resolve().parent.parent / "models" / "model_b_anomaly" / "carrier" / "feature_schema.json"


def load_carrier_schema():
    with open(SCHEMA_PATH, "r") as f:
        schema = json.load(f)
    return schema["features"]


def build_carrier_features(raw_claim: dict, provider_context: dict | None = None) -> pd.DataFrame:
    """
    Converts a raw CARRIER claim + provider historical context into a single-row DataFrame
    matching the Carrier Model B feature schema (exactly 53 features).

    Parameters
    ----------
    raw_claim : dict
        Raw claim data containing claim details and beneficiary information.
    provider_context : dict, optional
        Historical provider statistics (must include provider_claim_volume and provider_avg_claim_payment).

    Returns
    -------
    pd.DataFrame
        Single-row DataFrame with 53 features in exact schema order.
    """
    expected_features = load_carrier_schema()

    # Extract provider context from explicit parameter or raw_claim nested dictionary
    if provider_context is None:
        provider_context = raw_claim.get("provider_context") or raw_claim.get("provider_history") or {}

    # Validate required provider historical features
    provider_claim_volume = provider_context.get("provider_claim_volume")
    provider_avg_claim_payment = provider_context.get("provider_avg_claim_payment")

    # Allow fallback if flat keys are in raw_claim explicitly provided as historical context
    if provider_claim_volume is None:
        provider_claim_volume = raw_claim.get("provider_claim_volume")
    if provider_avg_claim_payment is None:
        provider_avg_claim_payment = raw_claim.get("provider_avg_claim_payment")

    if provider_claim_volume is None or provider_avg_claim_payment is None:
        raise ValueError(
            "Missing required provider historical context for Carrier Model B features: "
            "'provider_claim_volume' and 'provider_avg_claim_payment' must be explicitly provided in provider_context."
        )

    # Beneficiary dictionary or flat claim keys
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

    # Financial / Line level details
    line_items = raw_claim.get("line_items", [])
    claim_payment = float(raw_claim.get("total_claim_payment_amt", raw_claim.get("claim_payment", raw_claim.get("CLM_PMT_AMT", 0.0))))
    allowed_charge = float(raw_claim.get("total_allowed_charge_amt", raw_claim.get("allowed_charge_amt", 0.0)))
    deductible = float(raw_claim.get("total_deductible_amt", raw_claim.get("deductible_amt", 0.0)))
    coinsurance = float(raw_claim.get("total_coinsurance_amt", raw_claim.get("coinsurance_amt", 0.0)))
    primary_payer = float(raw_claim.get("total_primary_payer_paid_amt", raw_claim.get("primary_payer_payment", raw_claim.get("NCH_PRMRY_PYR_CLM_PD_AMT", 0.0))))

    if line_items:
        line_count = len(line_items)
        line_payments = [float(item.get("line_payment", 0.0)) for item in line_items]
        max_line_payment = max(line_payments) if line_payments else claim_payment
        hcpcs_list = [item.get("hcpcs_code") for item in line_items if item.get("hcpcs_code")]
        unique_hcpcs_count = len(set(hcpcs_list)) if hcpcs_list else 1
    else:
        line_count = float(raw_claim.get("line_count", 1))
        max_line_payment = float(raw_claim.get("max_line_payment", claim_payment))
        unique_hcpcs_count = float(raw_claim.get("unique_hcpcs_count", raw_claim.get("hcpcs_count", 1)))

    avg_payment_per_line = claim_payment / line_count if line_count > 0 else 0.0
    payment_to_allowed_ratio = claim_payment / allowed_charge if allowed_charge > 0 else 0.0

    # Diagnosis & Provider counts
    diag_codes = raw_claim.get("diagnosis_codes", [])
    if isinstance(diag_codes, list) and diag_codes:
        diag_count = len(diag_codes)
        uniq_diag_count = len(set(diag_codes))
    else:
        diag_count = float(raw_claim.get("diagnosis_count", 0))
        uniq_diag_count = float(raw_claim.get("unique_diagnosis_count", diag_count))

    distinct_provider_count = float(raw_claim.get("distinct_provider_count_on_claim", 1))

    # Dates
    claim_date_str = raw_claim.get("claim_start_date") or raw_claim.get("claim_date") or "2009-01-01"
    try:
        dt = pd.to_datetime(claim_date_str)
        claim_year = float(dt.year)
        claim_month = float(dt.month)
        claim_day_of_week = float(dt.dayofweek)
    except Exception:
        claim_year = float(raw_claim.get("claim_year", 2009))
        claim_month = float(raw_claim.get("claim_month", 1))
        claim_day_of_week = float(raw_claim.get("claim_day_of_week", 0))

    # Construct feature mapping
    features_dict = {
        "total_claim_payment_amt": claim_payment,
        "total_allowed_charge_amt": allowed_charge,
        "total_deductible_amt": deductible,
        "total_coinsurance_amt": coinsurance,
        "total_primary_payer_paid_amt": primary_payer,
        "avg_payment_per_line": avg_payment_per_line,
        "payment_to_allowed_ratio": payment_to_allowed_ratio,
        "line_count": line_count,
        "unique_hcpcs_count": unique_hcpcs_count,
        "max_line_payment": max_line_payment,
        "diagnosis_count": diag_count,
        "unique_diagnosis_count": uniq_diag_count,
        "distinct_provider_count_on_claim": distinct_provider_count,
        "provider_claim_volume": float(provider_claim_volume),
        "provider_avg_claim_payment": float(provider_avg_claim_payment),
        "claim_year": claim_year,
        "claim_month": claim_month,
        "claim_day_of_week": claim_day_of_week,
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

    # Replace infinite values and fill NaNs
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0.0)

    # Reorder and validate against schema
    df = df[expected_features]

    if len(df.columns) != len(expected_features):
        raise ValueError(f"Carrier feature count mismatch: expected {len(expected_features)}, got {len(df.columns)}")

    if list(df.columns) != expected_features:
        raise ValueError("Carrier feature order/name mismatch against schema.")

    return df
