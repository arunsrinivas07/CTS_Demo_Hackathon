# Medicare Provider Fraud Detection

An AI-based healthcare fraud detection system that analyzes Medicare provider data to identify providers with potentially suspicious claim and reimbursement patterns.

The project combines machine learning, model explainability, and a planned RAG-based investigation layer to support investigators in analyzing high-risk providers.

---

## Project Overview

Healthcare fraud can be difficult to identify using manual rules alone because suspicious behavior may involve multiple factors such as claim frequency, reimbursement amounts, beneficiary patterns, and inpatient/outpatient utilization.

This project processes Medicare healthcare data at the provider level and uses machine learning to estimate the risk that a provider belongs to the potentially fraudulent class.

### Current Pipeline

```text
Raw Medicare Data
       ↓
Data Preprocessing
       ↓
Feature Engineering
       ↓
Provider-Level Dataset
       ↓
Fraud Detection Model
       ↓
Fraud Probability
       ↓
Risk Classification
