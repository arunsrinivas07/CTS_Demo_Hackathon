from enum import Enum


class ClaimType(str, Enum):
    CARRIER = "Carrier"
    INPATIENT = "Inpatient"
    OUTPATIENT = "Outpatient"


class ModelType(str, Enum):
    ISOLATION_FOREST = "IsolationForest"
    SUPERVISED_FRAUD = "supervised fraud model"


class ModelStatus(str, Enum):
    DRAFT = "DRAFT"
    VALIDATED = "VALIDATED"
    ACTIVE = "ACTIVE"
    RETIRED = "RETIRED"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskDecision(str, Enum):
    NO_ACTION = "NO_ACTION"
    REVIEW = "REVIEW"
    ESCALATE = "ESCALATE"


class AlertType(str, Enum):
    ANOMALY = "ANOMALY"
    FRAUD_RISK = "FRAUD_RISK"
    COMBINED_RISK = "COMBINED_RISK"


class AlertSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, Enum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class InvestigationStatus(str, Enum):
    NEW = "NEW"
    UNDER_REVIEW = "UNDER_REVIEW"
    CLEARED = "CLEARED"
    ESCALATED = "ESCALATED"
    CONFIRMED_FRAUD = "CONFIRMED_FRAUD"


class InvestigationPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    AUDITOR = "AUDITOR"
    VIEWER = "VIEWER"