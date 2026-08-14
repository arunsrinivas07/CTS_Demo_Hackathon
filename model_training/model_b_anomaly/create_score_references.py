from pathlib import Path
import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

UNIFIED_SCORE_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "primary"
    / "unified_anomaly_scores_v2.csv"
)

MODEL_B_DIR = (
    PROJECT_ROOT
    / "models"
    / "model_b_anomaly"
)

CHUNK_SIZE = 250_000


# ============================================================
# CONFIGURATION
# ============================================================

CLAIM_TYPES = [
    "CARRIER",
    "OUTPATIENT",
    "INPATIENT"
]


# ============================================================
# CHECK INPUT
# ============================================================

print("=" * 80)
print("CREATING MODEL B SCORE REFERENCES")
print("=" * 80)

print("\nProject root:")
print(PROJECT_ROOT)

print("\nUnified anomaly score file:")
print(UNIFIED_SCORE_FILE)

if not UNIFIED_SCORE_FILE.exists():
    raise FileNotFoundError(
        f"Unified anomaly score file not found:\n"
        f"{UNIFIED_SCORE_FILE}"
    )


# ============================================================
# FIRST PASS
# COLLECT SCORE VALUES BY CLAIM TYPE
# ============================================================

scores = {
    claim_type: []
    for claim_type in CLAIM_TYPES
}

total_rows = 0

print("\n" + "=" * 80)
print("READING UNIFIED ANOMALY SCORES")
print("=" * 80)

for chunk_number, chunk in enumerate(
    pd.read_csv(
        UNIFIED_SCORE_FILE,
        usecols=[
            "CLAIM_TYPE",
            "ANOMALY_SCORE"
        ],
        chunksize=CHUNK_SIZE,
        low_memory=False
    ),
    start=1
):

    total_rows += len(chunk)

    # --------------------------------------------------------
    # Validate score values
    # --------------------------------------------------------

    if chunk["ANOMALY_SCORE"].isna().any():
        raise ValueError(
            f"Missing anomaly scores found in chunk "
            f"{chunk_number}"
        )

    if np.isinf(
        chunk["ANOMALY_SCORE"].to_numpy()
    ).any():
        raise ValueError(
            f"Infinite anomaly scores found in chunk "
            f"{chunk_number}"
        )

    # --------------------------------------------------------
    # Separate by claim type
    # --------------------------------------------------------

    for claim_type in CLAIM_TYPES:

        values = chunk.loc[
            chunk["CLAIM_TYPE"] == claim_type,
            "ANOMALY_SCORE"
        ].to_numpy(
            dtype=np.float64
        )

        if len(values) > 0:
            scores[claim_type].append(values)

    print(
        f"Processed chunk {chunk_number}: "
        f"{total_rows:,} rows"
    )


# ============================================================
# BUILD REFERENCE ARTIFACTS
# ============================================================

print("\n" + "=" * 80)
print("BUILDING SCORE REFERENCES")
print("=" * 80)

reference_summary = []

for claim_type in CLAIM_TYPES:

    print("\n" + "-" * 80)
    print(claim_type)
    print("-" * 80)

    # --------------------------------------------------------
    # Combine chunks
    # --------------------------------------------------------

    if not scores[claim_type]:
        raise ValueError(
            f"No scores found for {claim_type}"
        )

    all_scores = np.concatenate(
        scores[claim_type]
    )

    print(
        "Scores:",
        f"{len(all_scores):,}"
    )

    # --------------------------------------------------------
    # Sort scores
    #
    # Higher anomaly score = more anomalous
    # --------------------------------------------------------

    sorted_scores = np.sort(
        all_scores
    )

    # --------------------------------------------------------
    # Create reference object
    # --------------------------------------------------------

    reference = {
        "claim_type": claim_type,
        "method": "empirical_percentile",
        "direction": "higher_score_more_anomalous",

        "count": int(len(sorted_scores)),

        "min_score": float(
            sorted_scores[0]
        ),

        "max_score": float(
            sorted_scores[-1]
        ),

        "mean_score": float(
            np.mean(sorted_scores)
        ),

        "median_score": float(
            np.median(sorted_scores)
        ),

        "percentiles": {
            "0.1": float(
                np.percentile(sorted_scores, 0.1)
            ),
            "1": float(
                np.percentile(sorted_scores, 1)
            ),
            "5": float(
                np.percentile(sorted_scores, 5)
            ),
            "10": float(
                np.percentile(sorted_scores, 10)
            ),
            "25": float(
                np.percentile(sorted_scores, 25)
            ),
            "50": float(
                np.percentile(sorted_scores, 50)
            ),
            "75": float(
                np.percentile(sorted_scores, 75)
            ),
            "90": float(
                np.percentile(sorted_scores, 90)
            ),
            "95": float(
                np.percentile(sorted_scores, 95)
            ),
            "99": float(
                np.percentile(sorted_scores, 99)
            ),
            "99.9": float(
                np.percentile(sorted_scores, 99.9)
            )
        },

        # This is the actual reference distribution
        # used during production inference.
        "sorted_scores": sorted_scores
    }

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_dir = (
        MODEL_B_DIR
        / claim_type.lower()
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = (
        output_dir
        / "score_reference.joblib"
    )

    joblib.dump(
        reference,
        output_file
    )

    print(
        "Saved:",
        output_file
    )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print(
        "Minimum:",
        reference["min_score"]
    )

    print(
        "Median:",
        reference["median_score"]
    )

    print(
        "Maximum:",
        reference["max_score"]
    )

    reference_summary.append({
        "CLAIM_TYPE": claim_type,
        "COUNT": len(sorted_scores),
        "MIN": reference["min_score"],
        "MEDIAN": reference["median_score"],
        "MAX": reference["max_score"]
    })


# ============================================================
# VALIDATION
# ============================================================

summary_df = pd.DataFrame(
    reference_summary
)

print("\n" + "=" * 80)
print("SCORE REFERENCE SUMMARY")
print("=" * 80)

print(
    summary_df.to_string(
        index=False
    )
)


# ============================================================
# EXPECTED ROW COUNTS
# ============================================================

expected_counts = {
    "CARRIER": 4_741_335,
    "OUTPATIENT": 790_790,
    "INPATIENT": 66_773
}

print("\n" + "=" * 80)
print("REFERENCE COUNT VALIDATION")
print("=" * 80)

all_passed = True

for claim_type in CLAIM_TYPES:

    actual = int(
        summary_df.loc[
            summary_df["CLAIM_TYPE"] == claim_type,
            "COUNT"
        ].iloc[0]
    )

    expected = expected_counts[
        claim_type
    ]

    passed = actual == expected

    print(
        f"{claim_type:12s} "
        f"Actual={actual:,} "
        f"Expected={expected:,} "
        f"PASS={passed}"
    )

    if not passed:
        all_passed = False


# ============================================================
# FINAL STATUS
# ============================================================

print("\n" + "=" * 80)

if all_passed:
    print(
        "MODEL B SCORE REFERENCES: PASS"
    )
else:
    print(
        "MODEL B SCORE REFERENCES: REVIEW REQUIRED"
    )

print("=" * 80)