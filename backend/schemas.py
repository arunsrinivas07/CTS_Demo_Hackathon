from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_serializer


class ClaimAnalysisRequest(BaseModel):
    provider_id: str = Field(..., description="Provider lookup key")
    claim_id: str = Field(..., description="Claim identifier")
    claim_type: str = Field(..., description="Type of claim: CARRIER, OUTPATIENT, or INPATIENT")
    claim: Dict[str, Any] = Field(..., description="Raw claim data payload")


class ExplanationResult(BaseModel):
    available: bool
    top_drivers: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    all_feature_contributions: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

    @model_serializer(mode="wrap")
    def serialize(self, handler):
        result = handler(self)
        if result.get("all_feature_contributions") is None:
            result.pop("all_feature_contributions", None)
        if result.get("error") is None:
            result.pop("error", None)
        return result


class FraudResult(BaseModel):
    available: bool
    probability: Optional[float] = None
    risk_score: Optional[float] = None
    level: Optional[str] = None
    reason: Optional[str] = None
    explanation: Optional[ExplanationResult] = None

    @model_serializer(mode="wrap")
    def serialize(self, handler):
        result = handler(self)
        if result.get("available") is True and "reason" in result:
            del result["reason"]
        return result


class AnomalyResult(BaseModel):
    available: bool = True
    raw_score: Optional[float] = None
    risk_score: Optional[float] = None
    level: Optional[str] = None
    explanation: Optional[ExplanationResult] = None


class OverallResult(BaseModel):
    risk_score: float
    risk_level: str


class ClaimAnalysisResponse(BaseModel):
    success: bool = True
    provider_id: str
    claim_id: str
    claim_type: str
    fraud: FraudResult
    anomaly: AnomalyResult
    overall: OverallResult


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
