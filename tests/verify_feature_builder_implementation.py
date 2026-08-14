from pathlib import Path
import json
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

ROOT = PROJECT_ROOT

print("=" * 80)
print("FEATURE BUILDER IMPLEMENTATION VERIFICATION")
print("=" * 80)

failures = []


def check(condition, message):
    if condition:
        print(f"[PASS] {message}")
    else:
        print(f"[FAIL] {message}")
        failures.append(message)


# ============================================================
# 1. REQUIRED FILES
# ============================================================

required_files = [
    "feature_builders/__init__.py",
    "feature_builders/carrier_features.py",
    "feature_builders/outpatient_features.py",
    "feature_builders/inpatient_features.py",
    "feature_builders/model_a_features.py",
    "feature_builders/claim_feature_builder.py",
    "tests/test_feature_builders.py",
    "tests/test_end_to_end_claim_features.py",
    "docs/production_feature_flow.md",
]

print("\n" + "=" * 80)
print("REQUIRED FILES")
print("=" * 80)

for file in required_files:
    check(
        (ROOT / file).exists(),
        file
    )


# ============================================================
# 2. LOAD MODEL SCHEMAS
# ============================================================

print("\n" + "=" * 80)
print("MODEL B SCHEMA VALIDATION")
print("=" * 80)

expected_model_b = {
    "carrier": 53,
    "outpatient": 51,
    "inpatient": 62,
}

for claim_type, expected_count in expected_model_b.items():

    schema_path = (
        ROOT
        / "models"
        / "model_b_anomaly"
        / claim_type
        / "feature_schema.json"
    )

    if not schema_path.exists():
        check(False, f"{claim_type}: schema exists")
        continue

    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    features = schema["features"]

    check(
        len(features) == expected_count,
        f"{claim_type}: schema has {expected_count} features"
    )


# ============================================================
# 3. MODEL A SCHEMA
# ============================================================

print("\n" + "=" * 80)
print("MODEL A SCHEMA VALIDATION")
print("=" * 80)

model_a_schema_candidates = [
    ROOT / "models" / "model_a_supervised" / "feature_schema.json",
    ROOT / "models" / "model_a" / "feature_schema.json",
]

model_a_schema = None

for path in model_a_schema_candidates:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            model_a_schema = json.load(f)
        break

check(
    model_a_schema is not None,
    "Model A feature schema exists"
)

if model_a_schema is not None:

    model_a_features = model_a_schema.get("features", [])

    check(
        len(model_a_features) == 30,
        "Model A schema contains exactly 30 features"
    )

    check(
        "PotentialFraud" not in model_a_features,
        "PotentialFraud is not a Model A inference feature"
    )


# ============================================================
# 4. IMPORT FEATURE BUILDERS
# ============================================================

print("\n" + "=" * 80)
print("IMPORT VALIDATION")
print("=" * 80)

try:

    from feature_builders.carrier_features import (
        build_carrier_features
    )

    check(
        callable(build_carrier_features),
        "build_carrier_features exists"
    )

except Exception as e:

    check(
        False,
        f"build_carrier_features import: {e}"
    )


try:

    from feature_builders.outpatient_features import (
        build_outpatient_features
    )

    check(
        callable(build_outpatient_features),
        "build_outpatient_features exists"
    )

except Exception as e:

    check(
        False,
        f"build_outpatient_features import: {e}"
    )


try:

    from feature_builders.inpatient_features import (
        build_inpatient_features
    )

    check(
        callable(build_inpatient_features),
        "build_inpatient_features exists"
    )

except Exception as e:

    check(
        False,
        f"build_inpatient_features import: {e}"
    )


try:

    from feature_builders.model_a_features import (
        build_model_a_features
    )

    check(
        callable(build_model_a_features),
        "build_model_a_features exists"
    )

except Exception as e:

    check(
        False,
        f"build_model_a_features import: {e}"
    )


try:

    from feature_builders.claim_feature_builder import (
        build_claim_features
    )

    check(
        callable(build_claim_features),
        "build_claim_features exists"
    )

except Exception as e:

    check(
        False,
        f"build_claim_features import: {e}"
    )


# ============================================================
# 5. CHECK EXISTING INFERENCE FUNCTIONS
# ============================================================

print("\n" + "=" * 80)
print("EXISTING INFERENCE COMPATIBILITY")
print("=" * 80)

try:

    from inference.model_a_inference import predict_fraud

    check(
        callable(predict_fraud),
        "Model A predict_fraud exists"
    )

except Exception as e:

    check(
        False,
        f"Model A inference import: {e}"
    )


try:

    from inference.model_b_inference import predict_anomaly

    check(
        callable(predict_anomaly),
        "Model B predict_anomaly exists"
    )

except Exception as e:

    check(
        False,
        f"Model B inference import: {e}"
    )


# ============================================================
# 6. CHECK SOURCE FOR BAD ARCHITECTURE
# ============================================================

print("\n" + "=" * 80)
print("ARCHITECTURE SANITY CHECK")
print("=" * 80)

source_files = []

for directory in [
    ROOT / "feature_builders",
]:
    if directory.exists():
        source_files.extend(directory.glob("*.py"))

combined_source = ""

for path in source_files:
    try:
        combined_source += path.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception:
        pass

# These are warning-level architectural checks.
# We don't automatically fail everything because implementations
# may legitimately mention these names in documentation/comments.

check(
    "PotentialFraud" not in combined_source
    or "target" in combined_source.lower(),
    "Feature builders do not obviously use PotentialFraud as a feature"
)

check(
    "FRAUD_RISK_SCORE" not in combined_source
    and "ANOMALY_RISK_SCORE" not in combined_source,
    "Feature builders do not use model scores as input features"
)


# ============================================================
# 7. RUN PROJECT TESTS
# ============================================================

print("\n" + "=" * 80)
print("RUNNING FEATURE BUILDER TEST SUITE")
print("=" * 80)

import subprocess

test_commands = [
    [
        sys.executable,
        "-m",
        "pytest",
        "tests/test_feature_builders.py",
        "-v",
    ],
    [
        sys.executable,
        "-m",
        "pytest",
        "tests/test_end_to_end_claim_features.py",
        "-v",
    ],
]

for command in test_commands:

    print("\nRunning:")
    print(" ".join(command))

    result = subprocess.run(
        command,
        cwd=ROOT
    )

    check(
        result.returncode == 0,
        f"Test command passed: {' '.join(command[3:])}"
    )


# ============================================================
# FINAL RESULT
# ============================================================

print("\n" + "=" * 80)
print("VERIFICATION RESULT")
print("=" * 80)

if failures:

    print("STATUS: FAIL")

    print("\nFailures:")

    for failure in failures:
        print(" -", failure)

    sys.exit(1)

else:

    print("STATUS: PASS")
    print()
    print("The feature-building implementation passed the")
    print("structural verification checks.")

    sys.exit(0)