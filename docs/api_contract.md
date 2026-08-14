# Fraud & Anomaly Detection API Contract (Updated)

This document defines the production backend API contract for the `fraud_detection` project.

---

## 1. Overview & Key Principles

- **Independent Feature Vectors**: Model A (Provider Fraud Detection) and Model B (Claim Anomaly Detection) consume completely independent feature vectors.
- **Zero Cross-Dataset Provider ID Mapping**: The API does **NOT** perform any mapping between primary and secondary provider IDs, NPIs, or dataset identifiers.
- **Mandatory Provider ID**: `provider_id` is a required API input parameter in the request payload.
- **Internal Provider Context Lookup**: The backend uses the supplied `provider_id` to query the Model A provider-context dataset. If not found, Model A is gracefully marked as unavailable (`"available": false`), allowing Model B claim-level anomaly detection to proceed independently.
- **Strict Historical Context Validation**: If required Model B historical provider features (e.g. `provider_claim_volume` for Carrier or provider summary metrics for Inpatient) are missing, the API returns a structured HTTP 422 error rather than fabricating statistics.

---

## 2. Endpoints

### 2.1 Health Check Endpoint

- **Path**: `/api/health`
- **Method**: `GET`
- **Description**: Verifies that the API service is online and functional.

#### Response (200 OK)
```json
{
  "status": "ok"
}
```

---

### 2.2 Claim Analysis Endpoint

- **Path**: `/api/analyze-claim`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Description**: Accepts a raw claim payload, provider ID, and claim ID, performs provider context lookup, executes Model B anomaly detection and (if provider exists) Model A fraud detection, and returns fused risk scores.

---

## 3. Request Payload Format

```json
{
  "provider_id": "PRV51001",
  "claim_id": "CLM_OUT_88210",
  "claim_type": "OUTPATIENT",
  "claim": {
    "claim_id": "CLM_OUT_88210",
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
      "PPPYMT_CAR": 0.0
    }
  }
}
```

---

## 4. Response Payload Formats

### 4.1 Success Response (Model A Available + Model B Available) - 200 OK

```json
{
  "success": true,
  "provider_id": "PRV51001",
  "claim_id": "CLM_OUT_88210",
  "claim_type": "OUTPATIENT",
  "fraud": {
    "available": true,
    "probability": 0.9954,
    "risk_score": 99.54,
    "level": "CRITICAL",
    "reason": null
  },
  "anomaly": {
    "available": true,
    "raw_score": -0.1184,
    "risk_score": 1.61,
    "level": "LOW"
  },
  "overall": {
    "risk_score": 60.37,
    "risk_level": "HIGH"
  }
}
```

### 4.2 Success Response (Model A Unavailable / Provider ID Not Found) - 200 OK

```json
{
  "success": true,
  "provider_id": "PRV99999",
  "claim_id": "CLM_OUT_88210",
  "claim_type": "OUTPATIENT",
  "fraud": {
    "available": false,
    "probability": null,
    "risk_score": null,
    "level": null,
    "reason": "Provider ID not found in Model A provider-context dataset"
  },
  "anomaly": {
    "available": true,
    "raw_score": -0.1184,
    "risk_score": 1.61,
    "level": "LOW"
  },
  "overall": {
    "risk_score": 1.61,
    "risk_level": "LOW"
  }
}
```

---

## 5. Error Responses

All error responses return structured JSON without Python stack traces.

### 5.1 Missing Required Field (HTTP 422)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "Payload validation failed: body->provider_id: field required"
  }
}
```

### 5.2 Missing Required Historical Context (HTTP 422)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CLAIM_DATA",
    "message": "Missing required provider historical context for Carrier Model B features: 'provider_claim_volume' and 'provider_avg_claim_payment' must be explicitly provided."
  }
}
```
