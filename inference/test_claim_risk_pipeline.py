import pandas as pd

from claim_risk_pipeline import analyze_claim


# ============================================================
# PATHS
# ============================================================

PROVIDER_FILE = (
    "../data/processed/features/provider_features_v2.csv"
)

CARRIER_FILE = (
    "../data/processed/primary/carrier_ml_ready.csv"
)

OUTPATIENT_FILE = (
    "../data/processed/primary/outpatient_ml_ready.csv"
)

INPATIENT_FILE = (
    "../data/processed/primary/inpatient_ml_ready.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

providers = pd.read_csv(PROVIDER_FILE)

carrier = pd.read_csv(CARRIER_FILE, nrows=1)
outpatient = pd.read_csv(OUTPATIENT_FILE, nrows=1)
inpatient = pd.read_csv(INPATIENT_FILE, nrows=1)


# ============================================================
# MODEL A FEATURES
# ============================================================

MODEL_A_FEATURES = [
    "Unique_Beneficiaries",
    "Avg_Patient_Age",
    "Avg_Chronic_Conditions",
    "IP_Claim_Count",
    "IP_Unique_Beneficiaries",
    "IP_Total_Reimbursement",
    "IP_Avg_Reimbursement",
    "IP_Max_Reimbursement",
    "IP_Total_Deductible",
    "IP_Avg_Deductible",
    "IP_Avg_Claim_Duration",
    "IP_Max_Claim_Duration",
    "IP_Unique_Diagnosis_Codes",
    "IP_Unique_Procedure_Codes",
    "OP_Claim_Count",
    "OP_Unique_Beneficiaries",
    "OP_Total_Reimbursement",
    "OP_Avg_Reimbursement",
    "OP_Max_Reimbursement",
    "OP_Total_Deductible",
    "OP_Avg_Deductible",
    "Total_Claims",
    "Total_Reimbursement",
    "Total_Deductible",
    "Claims_Per_Beneficiary",
    "Reimbursement_Per_Beneficiary",
    "IP_Claim_Share",
    "OP_Claim_Share",
    "IP_Reimbursement_Range",
    "OP_Reimbursement_Range",
]


# ============================================================
# MODEL B FEATURE SCHEMAS
# ============================================================

import json
from pathlib import Path


MODEL_B_DIR = Path("../models/model_b_anomaly")


def load_model_b_features(claim_type):

    schema_file = (
        MODEL_B_DIR
        / claim_type.lower()
        / "feature_schema.json"
    )

    with open(schema_file, "r") as f:
        schema = json.load(f)

    return schema["features"]


# ============================================================
# PREPARE ONE CLAIM
# ============================================================

def prepare_claim(
    claim_df,
    claim_type
):

    claim = claim_df.iloc[0]

    # --------------------------------------------------------
    # Provider
    # --------------------------------------------------------

    # Carrier has provider information directly.
    # Outpatient/inpatient may require a different mapping.
    provider = None

    for column in [
        "Provider",
        "provider",
        "PROVIDER",
        "PRVDR_NUM",
        "PROVIDER_ID"
    ]:

        if column in claim_df.columns:
            provider = claim[column]
            break

    # --------------------------------------------------------
    # Claim ID
    # --------------------------------------------------------

    claim_id = None

    for column in [
        "CLM_ID",
        "CLAIM_KEY"
    ]:

        if column in claim_df.columns:
            claim_id = claim[column]
            break

    if claim_id is None:
        raise ValueError(
            f"No claim ID found for {claim_type}"
        )

    # --------------------------------------------------------
    # Model B features
    # --------------------------------------------------------

    feature_names = load_model_b_features(
        claim_type
    )

    missing = [
        col
        for col in feature_names
        if col not in claim_df.columns
    ]

    if missing:
        raise ValueError(
            f"{claim_type}: missing Model B features:\n"
            + "\n".join(missing)
        )

    claim_features = (
        claim_df[feature_names]
        .copy()
    )

    return (
        provider,
        claim_id,
        claim_features
    )


# ============================================================
# TEST ONE CLAIM
# ============================================================

def run_test(
    claim_df,
    claim_type
):

    print("\n")
    print("=" * 80)
    print(f"{claim_type} REAL CLAIM TEST")
    print("=" * 80)

    provider, claim_id, claim_features = (
        prepare_claim(
            claim_df,
            claim_type
        )
    )

    print("Claim ID:", claim_id)
    print("Provider:", provider)

    # --------------------------------------------------------
    # IMPORTANT
    # --------------------------------------------------------
    # For this first integration test we need to locate the
    # provider's Model A feature row.
    # --------------------------------------------------------

    if provider is None:
        raise ValueError(
            f"{claim_type}: provider could not be identified "
            "from the production claim dataset."
        )

    provider = str(provider)

    provider_rows = providers[
        providers["Provider"].astype(str)
        == provider
    ]

    if provider_rows.empty:
        raise ValueError(
            f"Provider {provider} not found in Model A dataset."
        )

    provider_features = (
        provider_rows[
            MODEL_A_FEATURES
        ]
        .copy()
    )

    # --------------------------------------------------------
    # RUN COMPLETE PIPELINE
    # --------------------------------------------------------

    result = analyze_claim(
        provider=provider,
        claim_id=claim_id,
        claim_type=claim_type,
        provider_features=provider_features,
        claim_features=claim_features
    )

    print("\nFINAL RESULT:")
    print(result.to_string(index=False))

    return result


# ============================================================
# RUN TESTS
# ============================================================

run_test(
    carrier,
    "CARRIER"
)

run_test(
    outpatient,
    "OUTPATIENT"
)

run_test(
    inpatient,
    "INPATIENT"
)

print("\n")
print("=" * 80)
print("CLAIM RISK PIPELINE TEST COMPLETE")
print("=" * 80)