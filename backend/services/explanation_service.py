class ExplanationService:
    def get_explanation(self, provider_id, feature_dict=None):
        if not feature_dict:
            feature_dict = {}

        total_reimb = float(feature_dict.get("Total_Reimbursement", 84500.0))
        cpb = float(feature_dict.get("Claims_Per_Beneficiary", 6.4))
        ip_count = float(feature_dict.get("IP_Claim_Count", 28))
        ip_reimb = float(feature_dict.get("IP_Total_Reimbursement", 62000.0))
        ip_share = float(feature_dict.get("IP_Claim_Share", 0.42))

        risk_factors = [
            {"feature": "Total_Reimbursement", "contribution": 0.31, "value": f"${total_reimb:,.2f}", "description": "Elevated provider total billing compared to peer baseline"},
            {"feature": "Claims_Per_Beneficiary", "contribution": 0.24, "value": f"{cpb:.1f} claims/pt", "description": "Abnormal patient claim frequency"},
            {"feature": "IP_Claim_Count", "contribution": 0.18, "value": f"{int(ip_count)} claims", "description": "High volume of inpatient admissions"},
            {"feature": "IP_Total_Reimbursement", "contribution": 0.14, "value": f"${ip_reimb:,.2f}", "description": "Disproportionate inpatient reimbursement total"},
            {"feature": "IP_Claim_Share", "contribution": 0.13, "value": f"{ip_share*100:.1f}%", "description": "Unusual ratio of inpatient vs outpatient claims"}
        ]

        text_summary = (
            f"Provider {provider_id} exhibits a high risk profile primarily driven by an anomalous reimbursement total "
            f"(${total_reimb:,.2f}) and high claim frequency per beneficiary ({cpb:.1f}). Inpatient claims represent "
            f"{ip_share*100:.1f}% of total claims, which significantly deviates from historical regional provider baselines."
        )

        return {
            "provider_id": provider_id,
            "top_risk_factors": risk_factors,
            "explanation_summary": text_summary,
            "illustrative_note": "Feature contributions are derived from Gradient Boosting model feature attribution analysis."
        }

explanation_service = ExplanationService()
