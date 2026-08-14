"""
CTS HealthGuard AI - Explainable AI (XAI) Package
Provides SHAP-based local explanations for Model A (Fraud Detection) and Model B (Anomaly Detection).
"""

from xai.shap_service import explain_fraud, explain_anomaly, explain_claim

__all__ = ["explain_fraud", "explain_anomaly", "explain_claim"]
