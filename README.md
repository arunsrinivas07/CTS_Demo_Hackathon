# Medicare Provider Fraud Detection & Investigation Platform

An AI-driven healthcare fraud detection platform designed to ingest Medicare claims data, perform automated ETL/feature engineering, evaluate risk using a hybrid modeling architecture (supervised learning and unsupervised anomaly detection), explain model decisions via SHAP (Explainable AI), and serve predictive analytics through a production-grade FastAPI service.

---

## 🚀 Key Platform Features

- **Hybrid Modeling Architecture**:
  - **Model A (Supervised)**: Identifies likelihood of provider-level fraud using Gradient Boosted classifiers.
  - **Model B (Unsupervised)**: Detects transaction/claim-level anomalies using Isolation Forests tailored for Carrier, Inpatient, and Outpatient claim types.
- **Risk Fusion Engine**: Merges predictions from both models to assign unified, actionable threat scores.
- **Explainable AI (XAI)**: Generates detailed SHAP-based feature importance plots and summary explainers for every prediction.
- **RAG-based Investigation Helper**: Structure set up to allow Retrieval-Augmented Generation context query support for fraud investigators.
- **Production API**: Secure, high-performance FastAPI service with input-validation schemas.
- **Quality Safeguards**: Automated test coverage using `pytest` and built-in Git hooks to reject commits with large dataset files.

---

## 🗺️ System Architecture

```text
                                 [ RAW DATA ]
                           (Carrier, Inpatient, etc.)
                                      │
                                      ▼
                        [ ETL & Feature Builders ]
                                      │
                                      ├────────────────────────┐
                                      ▼                        ▼
                          [ Provider Contexts ]       [ Live Claim Payload ]
                         (Model A Feature Store)               │
                                      │                        │
                                      │   ┌────────────────────┘
                                      ▼   ▼
                            [ Model Evaluation ]
                                      ├────────────────────────┐
                                      ▼                        ▼
                            [ Model A (Supervised) ]  [ Model B (Anomaly) ]
                            (Provider-level Fraud)    (Claim-level Outliers)
                                      │                        │
                                      └───────────┬────────────┘
                                                  ▼
                                         [ Risk Fusion Engine ]
                                                  │
                                                  ├────────────────────────┐
                                                  ▼                        ▼
                                         [ SHAP Explainers ]      [ FastAPI Response ]
                                         (Feature Strengths)      (Threat Level & Score)
```

---

## 📂 Project Structure

```text
├── .git/                      # Git repository tracking configuration
├── .github/                   # CI/CD Workflows (if configured)
├── .gitignore                 # Exclusion configuration (explicitly allows small CSVs)
├── README.md                  # Comprehensive workspace documentation (this file)
└── fraud_detection/           # Main codebase directory
    ├── backend/               # FastAPI application backend
    │   ├── app.py             # Main application entry point & endpoints
    │   └── schemas.py         # Request/Response Pydantic validation schemas
    ├── data/                  # Workspace datasets
    │   ├── processed/         # Engineered data (features & scores)
    │   └── raw/               # Raw medical claims datasets
    ├── docs/                  # API Specifications & pipeline documentation
    │   ├── api_contract.md    # Detail contract specifications for the REST API
    │   └── production_feature_flow.md # Details on the pipeline data flow
    ├── EDA_and_Visualizations/# Jupyter notebooks for explorative data analysis
    ├── etl/                   # Python scripts for cleaning and merging data
    ├── feature_builders/      # Feature engineering scripts
    ├── inference/             # Model predictions and scoring scripts
    │   ├── model_a_inference.py  # Model A supervised classifier inference
    │   ├── model_b_inference.py  # Model B unsupervised Isolation Forest inference
    │   └── risk_fusion.py     # Aggregates Model A + Model B outputs
    ├── model_training/        # Model training notebooks & hyperparameter tuning
    ├── models/                # Saved serialization structures (*.pkl, *.joblib)
    ├── Rag/                   # Retrieval-Augmented Generation modules for text context
    ├── tests/                 # Automated unit and integration test suite
    │   ├── test_api_claim_analysis.py
    │   └── test_end_to_end_claim_features.py
    └── xai/                   # Explainable AI (SHAP analysis files)
```

---

## 🛠️ Setup & Local Installation

### Prerequisites
- Python 3.10+
- Git

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository_url>
   cd CTS-Demo-Hackathon
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install the project requirements:
   ```bash
   pip install -r fraud_detection/requirements_backup.txt
   ```

---

## 🔌 API Usage & Endpoints

To launch the FastAPI local server:
```bash
cd fraud_detection
python -m uvicorn backend.app:app --reload
```
By default, the server runs on `http://127.0.0.1:8000`. Detailed interactive docs are available at `http://127.0.0.1:8000/docs`.

### Key REST Endpoints

#### 1. `GET /api/health`
- **Description**: Verifies that the API service and loaded models are online.
- **Response**: `{"status": "ok"}`

#### 2. `POST /api/analyze-claim`
- **Description**: Submits a claim payload for analysis. Evaluates claim anomalies, queries cached provider historical metrics, calculates a fused risk score, and generates explainability metrics.
- **Request Body Details**: See [api_contract.md](file:///c:/Users/Admin/Downloads/CTS-Demo-Hackathon/fraud_detection/docs/api_contract.md) for full JSON schema details.

---

## 🧪 Testing

To run the suite of automated integration and unit tests:
```bash
cd fraud_detection
pytest
```

---

## 🛡️ Git Workflow: Large File Safety Guards

To protect our git history and remote repository storage, **large CSV datasets are restricted from commits**. 

- **Git Hook Guard**: A custom `pre-commit` hook is installed at `.git/hooks/pre-commit`.
- **Policy**: Staged `.csv` files larger than **10MB** are rejected during `git commit`. 
- **Adding Permitted CSVs**: Small reference CSV data files can be added to tracking normally using:
  ```bash
  git add path/to/dataset.csv
  ```
