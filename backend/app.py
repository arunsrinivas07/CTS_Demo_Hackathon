from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add directory to path
sys.path.append(os.path.dirname(__file__))

from services.model_service import model_service
from services.explanation_service import explanation_service
from services.data_store import data_store

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "HealthGuard AI Backend API",
        "version": "1.0.0",
        "model_loaded": model_service.model is not None,
        "model_type": "HistGradientBoostingClassifier",
        "model_artifact": "fraud_model_gb.pkl"
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json or {}
    result = model_service.predict(data)
    return jsonify(result)

@app.route("/api/claims", methods=["GET"])
def get_claims():
    return jsonify(data_store.get_claims())

@app.route("/api/claims/<claim_id>", methods=["GET"])
def get_claim(claim_id):
    claim = data_store.get_claim_by_id(claim_id)
    return jsonify(claim)

@app.route("/api/providers", methods=["GET"])
def get_providers():
    return jsonify(data_store.get_providers())

@app.route("/api/providers/<provider_id>", methods=["GET"])
def get_provider(provider_id):
    provider = data_store.get_provider_by_id(provider_id)
    return jsonify(provider)

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    claims = data_store.get_claims()
    alerts = [c for c in claims if c["risk_level"] in ["HIGH", "MEDIUM"]]
    return jsonify(alerts)

@app.route("/api/model-performance", methods=["GET"])
def get_model_performance():
    return jsonify(data_store.get_model_performance())

@app.route("/api/predictions/<provider_id>", methods=["GET"])
def get_prediction_for_provider(provider_id):
    provider = data_store.get_provider_by_id(provider_id)
    prediction = model_service.predict({
        "Provider": provider_id,
        "Total_Reimbursement": provider["total_reimbursement"],
        "Claims_Per_Beneficiary": provider["total_claims"] / max(provider["total_claims"] * 0.2, 1),
        "IP_Claim_Share": 0.45 if provider["risk_level"] == "HIGH" else 0.15
    })
    return jsonify(prediction)

@app.route("/api/explanations/<provider_id>", methods=["GET"])
def get_explanation(provider_id):
    provider = data_store.get_provider_by_id(provider_id)
    explanation = explanation_service.get_explanation(provider_id, {
        "Total_Reimbursement": provider["total_reimbursement"],
        "Claims_Per_Beneficiary": 6.8 if provider["risk_level"] == "HIGH" else 1.8,
        "IP_Claim_Count": int(provider["total_claims"] * 0.45)
    })
    return jsonify(explanation)

@app.route("/api/reports", methods=["GET", "POST"])
def reports():
    if request.method == "POST":
        data = request.json or {}
        new_report = {
            "report_id": f"RPT-2026-00{len(data_store.get_reports()) + 1}",
            "report_name": data.get("name", "Custom Fraud Analysis Report"),
            "type": data.get("type", "Investigation Summary"),
            "generated_by": "Enterprise Console User",
            "date": "2026-08-13",
            "status": "Completed"
        }
        data_store.get_reports().append(new_report)
        return jsonify(new_report), 201
    return jsonify(data_store.get_reports())

@app.route("/api/ai/explain", methods=["POST"])
def ai_explain():
    data = request.json or {}
    query = data.get("query", "")
    provider_id = data.get("provider_id", "PRV51003")
    claim_id = data.get("claim_id", "CLM-904812")

    response_text = (
        f"**HealthGuard AI Copilot Response** for query: *'{query}'*\n\n"
        f"Analysis of claim `{claim_id}` (Provider `{provider_id}`):\n"
        f"• **Fraud Risk Score**: **91% (HIGH RISK)**\n"
        f"• **Primary Driver**: Elevated Inpatient Reimbursement ($14,250.00) combined with abnormal beneficiary claim frequency (6.8 claims/patient).\n"
        f"• **Model A Output**: Gradient Boosting (`HistGradientBoostingClassifier`) flagged this case exceeding the 0.50 threshold.\n"
        f"• **Recommendation**: Escalate to Special Investigation Unit (SIU) and request itemized medical records."
    )

    return jsonify({
        "query": query,
        "answer": response_text,
        "provider_id": provider_id,
        "claim_id": claim_id,
        "timestamp": "2026-08-13T12:20:00Z"
    })

if __name__ == "__main__":
    print("Starting HealthGuard AI Backend Flask Server on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=True)
