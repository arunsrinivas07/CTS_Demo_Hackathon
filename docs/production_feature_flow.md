# Production Feature-Building Layer Documentation

This document explains the architecture and operational flow of the **Production Feature-Building Layer** in the `fraud_detection` project.

---

## 1. Overview & Architecture

The feature-building layer acts as the production adapter between incoming raw claims (from frontend / API payloads) and the inference engines for **Model A** (Provider Fraud Detection) and **Model B** (Claim Anomaly Detection).

```
                            RAW USER CLAIM PAYLOAD
                                      |
       +------------------------------+------------------------------+
       |                                                             |
       v                                                             v
Model B Claim Feature Builder                         Model A Provider Context Builder
(carrier_features / outpatient_features / inpatient_features)  (model_a_features)
       |                                                             |
       v                                                             v
Claim Feature Vector (53 / 51 / 62)                           Provider Feature Vector (30)
       |                                                             |
       v                                                             v
Model B Anomaly Model (predict_anomaly)                       Model A Fraud Model (predict_fraud)
       |                                                             |
       v                                                             v
Anomaly Risk Score & Level                                    Fraud Probability & Risk Score
       |                                                             |
       +------------------------------+------------------------------+
                                      |
                                      v
                             Risk Fusion (fuse_risk)
                                      |
                                      v
                            Overall Unified Risk Score
```

---

## 2. API Contract & Payload Formats

### Frontend / Raw Claim Input Structure
The system expects a raw claim dictionary representing a single claim submission:

```json
{
  "claim_id": "CLM_9982341",
  "claim_type": "CARRIER",
  "provider_id": "PRV51001",
  "beneficiary_id": "BENE10023",
  "claim_start_date": "2009-06-15",
  "claim_end_date": "2009-06-15",
  "claim_payment": 250.0,
  "allowed_charge_amt": 300.0,
  "deductible_amt": 20.0,
  "coinsurance_amt": 30.0,
  "primary_payer_payment": 0.0,
  "diagnosis_codes": ["4019", "25000"],
  "procedure_codes": ["99213"],
  "hcpcs_codes": ["99213"],
  "line_items": [
    { "hcpcs_code": "99213", "line_payment": 250.0 }
  ],
  "beneficiary": {
    "BENE_SEX_IDENT_CD": 1,
    "BENE_RACE_CD": 1,
    "BENE_ESRD_IND": 0,
    "SP_STATE_CODE": 26,
    "BENE_COUNTY_CD": 950,
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
    "MEDREIMB_OP": 0.0,
    "BENRES_OP": 0.0,
    "PPPYMT_OP": 0.0,
    "MEDREIMB_CAR": 250.0,
    "BENRES_CAR": 50.0,
    "PPPYMT_CAR": 0.0
  }
}
```

### Provider Context Input (`provider_context`)
When provider historical data is available from an upstream provider database or history service, it is explicitly passed as `provider_context`:

```json
{
  "Unique_Beneficiaries": 45,
  "Avg_Patient_Age": 71.2,
  "Avg_Chronic_Conditions": 4.1,
  "IP_Claim_Count": 10,
  "IP_Unique_Beneficiaries": 8,
  "IP_Total_Reimbursement": 85000.0,
  "IP_Avg_Reimbursement": 8500.0,
  "IP_Max_Reimbursement": 25000.0,
  "IP_Total_Deductible": 10500.0,
  "IP_Avg_Deductible": 1050.0,
  "IP_Avg_Claim_Duration": 5.2,
  "IP_Max_Claim_Duration": 15.0,
  "IP_Unique_Diagnosis_Codes": 24,
  "IP_Unique_Procedure_Codes": 8,
  "OP_Claim_Count": 35,
  "OP_Unique_Beneficiaries": 30,
  "OP_Total_Reimbursement": 15000.0,
  "OP_Avg_Reimbursement": 428.5,
  "OP_Max_Reimbursement": 1200.0,
  "OP_Total_Deductible": 3500.0,
  "OP_Avg_Deductible": 100.0,
  "Total_Claims": 45,
  "Total_Reimbursement": 100000.0,
  "Total_Deductible": 14000.0,
  "Claims_Per_Beneficiary": 1.0,
  "Reimbursement_Per_Beneficiary": 2222.2,
  "IP_Claim_Share": 0.222,
  "OP_Claim_Share": 0.778,
  "IP_Reimbursement_Range": 25000.0,
  "OP_Reimbursement_Range": 1200.0,
  "provider_claim_volume": 45,
  "provider_avg_claim_payment": 2222.2
}
```

---

## 3. Model Feature Specifications

| Model | Target Scope | Feature Count | Scaler | Feature Schema Source |
| :--- | :--- | :--- | :--- | :--- |
| **Model A** | Provider Fraud Risk | **30** | None (HistGradientBoosting) | `models/model_a_supervised/feature_schema.json` |
| **Model B (Carrier)** | Carrier Claim Anomaly | **53** | RobustScaler | `models/model_b_anomaly/carrier/feature_schema.json` |
| **Model B (Outpatient)** | Outpatient Claim Anomaly | **51** | RobustScaler | `models/model_b_anomaly/outpatient/feature_schema.json` |
| **Model B (Inpatient)** | Inpatient Claim Anomaly | **62** | StandardScaler | `models/model_b_anomaly/inpatient/feature_schema.json` |

---

## 4. Key Design Directives

### 1. No Cross-Dataset Provider ID Mapping
- The feature builder does **NOT** attempt to map provider IDs across datasets (e.g. Model A provider IDs to primary dataset NPIs or provider numbers).
- Datasets are independent; provider context is passed explicitly.

### 2. No Fabrication of Historical Provider Statistics
- A single claim cannot determine multi-claim statistics (such as `Total_Claims` or `provider_claim_volume`).
- Historical statistics are extracted from `provider_context`.
- If required provider historical statistics for Model B are missing, the builder raises a clear `ValueError`.

### 3. Graceful Handling of Missing Model A Context
- If `provider_context` is `None` or omitted, Model A feature extraction returns `{"available": False, "reason": "Provider historical context unavailable", "features": None}`.
- Model B anomaly detection proceeds independently from claim-level data.

### 4. Target & Output Isolation
- `PotentialFraud` (Model A training label) is never included in inference feature vectors.
- Output risk scores (`FRAUD_PROBABILITY`, `ANOMALY_RISK_SCORE`, etc.) are never fed back into feature vectors; they are combined solely by `fuse_risk()`.
