from risk_fusion import (
    calculate_overall_risk,
    fuse_risk,
    FRAUD_WEIGHT,
    ANOMALY_WEIGHT
)


print("=" * 80)
print("RISK FUSION ENGINE TEST")
print("=" * 80)


# ============================================================
# WEIGHT VALIDATION
# ============================================================

print("\nWeights:")
print("Fraud weight:", FRAUD_WEIGHT)
print("Anomaly weight:", ANOMALY_WEIGHT)

assert (
    FRAUD_WEIGHT + ANOMALY_WEIGHT
) == 1.0


# ============================================================
# TEST 1 — LOW RISK
# ============================================================

result = calculate_overall_risk(
    fraud_risk_score=10,
    anomaly_risk_score=15
)

print("\nTEST 1 — LOW")
print(result)

assert result["OVERALL_RISK_SCORE"] == 12.0
assert result["OVERALL_RISK_LEVEL"] == "LOW"


# ============================================================
# TEST 2 — MEDIUM RISK
# ============================================================

result = calculate_overall_risk(
    fraud_risk_score=40,
    anomaly_risk_score=45
)

print("\nTEST 2 — MEDIUM")
print(result)

assert result["OVERALL_RISK_SCORE"] == 42.0
assert result["OVERALL_RISK_LEVEL"] == "MEDIUM"


# ============================================================
# TEST 3 — HIGH RISK
# ============================================================

result = calculate_overall_risk(
    fraud_risk_score=70,
    anomaly_risk_score=65
)

print("\nTEST 3 — HIGH")
print(result)

assert result["OVERALL_RISK_SCORE"] == 68.0
assert result["OVERALL_RISK_LEVEL"] == "HIGH"


# ============================================================
# TEST 4 — CRITICAL
# ============================================================

result = calculate_overall_risk(
    fraud_risk_score=95,
    anomaly_risk_score=90
)

print("\nTEST 4 — CRITICAL")
print(result)

assert result["OVERALL_RISK_SCORE"] == 93.0
assert result["OVERALL_RISK_LEVEL"] == "CRITICAL"


# ============================================================
# TEST 5 — COMPLETE CLAIM RESULT
# ============================================================

result = fuse_risk(
    provider="TEST_PROVIDER",
    claim_id="TEST_CLAIM_001",
    claim_type="OUTPATIENT",

    fraud_probability=0.85,
    fraud_risk_score=85,

    anomaly_score=0.15,
    anomaly_risk_score=90,

    anomaly_level="CRITICAL"
)

print("\nTEST 5 — COMPLETE FUSION")
print("=" * 80)

for key, value in result.items():
    print(f"{key}: {value}")


assert result["Provider"] == "TEST_PROVIDER"
assert result["CLM_ID"] == "TEST_CLAIM_001"
assert result["CLAIM_TYPE"] == "OUTPATIENT"

assert result["FRAUD_RISK_SCORE"] == 85
assert result["ANOMALY_RISK_SCORE"] == 90

assert result["OVERALL_RISK_SCORE"] == 87.0
assert result["OVERALL_RISK_LEVEL"] == "CRITICAL"


print("\n" + "=" * 80)
print("RISK FUSION ENGINE TEST: PASS")
print("=" * 80)