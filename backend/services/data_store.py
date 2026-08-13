import json

CLAIMS_DATA = [
  {
    "claim_id": "CLM-904812",
    "provider_id": "PRV51003",
    "provider_name": "Metro General Health System",
    "beneficiary_id": "BEN-88219",
    "claim_date": "2026-08-10",
    "amount": 14250.00,
    "fraud_probability": 0.91,
    "fraud_percentage": 91.0,
    "risk_level": "HIGH",
    "status": "Escalated",
    "procedure_code": "CPT-99214",
    "claim_type": "Inpatient",
    "diagnosis_code": "ICD-10-E11.9",
    "model": "Gradient Boosting",
    "threshold": 0.50
  },
  {
    "claim_id": "CLM-904813",
    "provider_id": "PRV51012",
    "provider_name": "Apex Surgical Specialists",
    "beneficiary_id": "BEN-44120",
    "claim_date": "2026-08-11",
    "amount": 8900.00,
    "fraud_probability": 0.78,
    "fraud_percentage": 78.0,
    "risk_level": "HIGH",
    "status": "Under Review",
    "procedure_code": "CPT-27447",
    "claim_type": "Inpatient",
    "diagnosis_code": "ICD-10-M17.11",
    "model": "Gradient Boosting",
    "threshold": 0.50
  },
  {
    "claim_id": "CLM-904814",
    "provider_id": "PRV51045",
    "provider_name": "Valley Care Outpatient Clinic",
    "beneficiary_id": "BEN-10932",
    "claim_date": "2026-08-11",
    "amount": 3450.00,
    "fraud_probability": 0.58,
    "fraud_percentage": 58.0,
    "risk_level": "MEDIUM",
    "status": "Open",
    "procedure_code": "CPT-99203",
    "claim_type": "Outpatient",
    "diagnosis_code": "ICD-10-I10",
    "model": "Gradient Boosting",
    "threshold": 0.50
  },
  {
    "claim_id": "CLM-904815",
    "provider_id": "PRV51088",
    "provider_name": "Horizon Diagnostic Imaging",
    "beneficiary_id": "BEN-77621",
    "claim_date": "2026-08-12",
    "amount": 1200.00,
    "fraud_probability": 0.24,
    "fraud_percentage": 24.0,
    "risk_level": "LOW",
    "status": "Resolved",
    "procedure_code": "CPT-71046",
    "claim_type": "Outpatient",
    "diagnosis_code": "ICD-10-R05",
    "model": "Gradient Boosting",
    "threshold": 0.50
  },
  {
    "claim_id": "CLM-904816",
    "provider_id": "PRV51102",
    "provider_name": "Sunrise Rehabilitation Center",
    "beneficiary_id": "BEN-33901",
    "claim_date": "2026-08-12",
    "amount": 18900.00,
    "fraud_probability": 0.94,
    "fraud_percentage": 94.0,
    "risk_level": "HIGH",
    "status": "Escalated",
    "procedure_code": "CPT-97110",
    "claim_type": "Inpatient",
    "diagnosis_code": "ICD-10-Z96.651",
    "model": "Gradient Boosting",
    "threshold": 0.50
  },
  {
    "claim_id": "CLM-904817",
    "provider_id": "PRV51150",
    "provider_name": "Pinnacle Cardiology Associates",
    "beneficiary_id": "BEN-55204",
    "claim_date": "2026-08-13",
    "amount": 4200.00,
    "fraud_probability": 0.45,
    "fraud_percentage": 45.0,
    "risk_level": "MEDIUM",
    "status": "Open",
    "procedure_code": "CPT-93000",
    "claim_type": "Outpatient",
    "diagnosis_code": "ICD-10-I25.10",
    "model": "Gradient Boosting",
    "threshold": 0.50
  }
]

PROVIDERS_DATA = [
  {
    "provider_id": "PRV51003",
    "provider_name": "Metro General Health System",
    "npi": "1942083921",
    "total_claims": 248,
    "avg_claim_amount": 5745.96,
    "total_reimbursement": 1425000.00,
    "anomaly_rate": 0.185,
    "risk_score": 91,
    "risk_level": "HIGH",
    "fraud_probability": 0.91,
    "status": "Escalated"
  },
  {
    "provider_id": "PRV51012",
    "provider_name": "Apex Surgical Specialists",
    "npi": "1482910394",
    "total_claims": 142,
    "avg_claim_amount": 6267.60,
    "total_reimbursement": 890000.00,
    "anomaly_rate": 0.142,
    "risk_score": 78,
    "risk_level": "HIGH",
    "fraud_probability": 0.78,
    "status": "Under Review"
  },
  {
    "provider_id": "PRV51045",
    "provider_name": "Valley Care Outpatient Clinic",
    "npi": "1029384756",
    "total_claims": 310,
    "avg_claim_amount": 1112.90,
    "total_reimbursement": 345000.00,
    "anomaly_rate": 0.065,
    "risk_score": 58,
    "risk_level": "MEDIUM",
    "fraud_probability": 0.58,
    "status": "Open"
  },
  {
    "provider_id": "PRV51088",
    "provider_name": "Horizon Diagnostic Imaging",
    "npi": "1293847561",
    "total_claims": 520,
    "avg_claim_amount": 230.76,
    "total_reimbursement": 120000.00,
    "anomaly_rate": 0.012,
    "risk_score": 24,
    "risk_level": "LOW",
    "fraud_probability": 0.24,
    "status": "Resolved"
  },
  {
    "provider_id": "PRV51102",
    "provider_name": "Sunrise Rehabilitation Center",
    "npi": "1839201948",
    "total_claims": 98,
    "avg_claim_amount": 19285.71,
    "total_reimbursement": 1890000.00,
    "anomaly_rate": 0.224,
    "risk_score": 94,
    "risk_level": "HIGH",
    "fraud_probability": 0.94,
    "status": "Escalated"
  }
]

REPORTS_DATA = [
  {
    "report_id": "RPT-2026-001",
    "report_name": "Q3 Medicare Inpatient Fraud Anomaly Audit",
    "type": "Investigation Summary",
    "generated_by": "Dr. Sarah Jenkins (Lead Auditor)",
    "date": "2026-08-10",
    "status": "Completed"
  },
  {
    "report_id": "RPT-2026-002",
    "report_name": "High-Risk Provider Behavior Analysis",
    "type": "Provider Risk",
    "generated_by": "System Automated Batch",
    "date": "2026-08-11",
    "status": "Completed"
  },
  {
    "report_id": "RPT-2026-003",
    "report_name": "Beneficiary Claims Clustering Report",
    "type": "Anomaly",
    "generated_by": "Alex Morgan (Senior Investigator)",
    "date": "2026-08-12",
    "status": "Processing"
  }
]

MODEL_PERFORMANCE_DATA = {
  "final_model": "Gradient Boosting",
  "implementation": "HistGradientBoostingClassifier",
  "model_file": "fraud_model_gb.pkl",
  "threshold": 0.50,
  "dataset_rows": 5410,
  "fraud_count": 506,
  "non_fraud_count": 4904,
  "fraud_percentage": 9.35,
  "metrics": {
    "gradient_boosting": {
      "name": "Gradient Boosting (Final Model A)",
      "accuracy": 95.56,
      "precision": 81.93,
      "recall": 67.33,
      "f1_score": 73.91,
      "roc_auc": 97.08,
      "pr_auc": 81.42,
      "is_final": True
    },
    "random_forest": {
      "name": "Random Forest",
      "accuracy": 92.42,
      "precision": 56.38,
      "recall": 83.17,
      "f1_score": 67.20,
      "roc_auc": 96.98,
      "pr_auc": 78.76,
      "is_final": False
    },
    "logistic_regression": {
      "name": "Logistic Regression",
      "accuracy": 90.20,
      "precision": 48.68,
      "recall": 91.09,
      "f1_score": 63.45,
      "roc_auc": 97.24,
      "pr_auc": 79.75,
      "is_final": False
    }
  },
  "confusion_matrix": {
    "tn": 4812,
    "fp": 92,
    "fn": 165,
    "tp": 341
  }
}

class DataStore:
    def get_claims(self):
        return CLAIMS_DATA

    def get_claim_by_id(self, claim_id):
        for c in CLAIMS_DATA:
            if c["claim_id"] == claim_id:
                return c
        return CLAIMS_DATA[0]

    def get_providers(self):
        return PROVIDERS_DATA

    def get_provider_by_id(self, provider_id):
        for p in PROVIDERS_DATA:
            if p["provider_id"] == provider_id:
                return p
        return PROVIDERS_DATA[0]

    def get_reports(self):
        return REPORTS_DATA

    def get_model_performance(self):
        return MODEL_PERFORMANCE_DATA

data_store = DataStore()
