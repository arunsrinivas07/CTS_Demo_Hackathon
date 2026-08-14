import pandas as pd
from pathlib import Path


FILES = {
    "CARRIER": Path(
        "data/processed/primary/carrier_ml_ready.csv"
    ),
    "OUTPATIENT": Path(
        "data/processed/primary/outpatient_ml_ready.csv"
    ),
    "INPATIENT": Path(
        "data/processed/primary/inpatient_ml_ready.csv"
    ),
    "MODEL_A": Path(
        "data/processed/features/provider_features_v2.csv"
    ),
}


print("=" * 80)
print("PRODUCTION INPUT DATASET INSPECTION")
print("=" * 80)


for name, path in FILES.items():

    print("\n" + "-" * 80)
    print(name)
    print("-" * 80)

    print("File:", path)
    print("Exists:", path.exists())

    if not path.exists():
        print("STATUS: FAIL")
        continue

    df = pd.read_csv(path, nrows=5)

    print("Column count:", len(df.columns))

    print("\nColumns:")

    for i, col in enumerate(df.columns, start=1):
        print(f"{i:03d}. {col}")


print("\n" + "=" * 80)
print("INSPECTION COMPLETE")
print("=" * 80)