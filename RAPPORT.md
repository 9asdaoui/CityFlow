# CityFlow Sentinel — Project Progress Report

> **Date:** March 2026  
> **Reference document:** *Cahier des Charges – CityFlow Sentinel*

---

## 1. Executive Summary

CityFlow Sentinel is defined in the specification as a three-pillar platform:

| Pillar | Description |
|---|---|
| **ML Prediction** | Traffic Tension Score (0-100) per district per hour |
| **LLM / RAG Assistant** | Natural-language Q&A on urban regulations |
| **Full-Stack Dashboard** | React + FastAPI unified interface |

The current codebase covers **Pillar 1 only (ML Prediction)**. All work is contained in the `cityflow_ml_lab/` directory and represents the completion of **Phase 2** of the 6-phase roadmap. Phases 1 and 3–6 are either pending or not yet started.

---

## 2. What Has Been Done ✅

### 2.1 Phase 2 — Data & ML (Roadmap Weeks 3-4) — **COMPLETE**

#### Dataset
- Raw dataset loaded: **48,204 hourly records** (Oct 2012 – Sep 2018) from `metro_traffic.csv`.
- Preprocessed dataset persisted to [`metro_traffic_cleaned.csv`](cityflow_ml_lab/data/metro_traffic_cleaned.csv).

#### Preprocessing Pipeline ([`preprocess.ipynb`](cityflow_ml_lab/notebooks/preprocess.ipynb), [`train.py`](cityflow_ml_lab/src/train.py))
| Step | Detail |
|---|---|
| Datetime parsing | `date_time` → `hour`, `day_of_week`, `is_weekend` |
| Temperature conversion | Kelvin → Celsius |
| Cyclical time encoding | `hour_sin`, `hour_cos` (sin/cos of 2π·h/24) |
| Outlier capping | IQR ×3 for temperature; 50 mm/h cap for rain & snow |
| Feature scaling | `StandardScaler` on continuous features |
| Target creation | `traffic_volume` → `tension_score` (MinMaxScaler 0–100) |

**Dropped feature:** `holiday` column removed (99.8% missing values).

**Final feature set:** `hour_sin`, `hour_cos`, `day_of_week`, `is_weekend`, `temp_celsius`, `rain_1h`, `snow_1h`

#### Model Training ([`train.py`](cityflow_ml_lab/src/train.py))
Three regressors trained on an 80/20 train-test split (random_state=42):

| Model | RMSE | MAE | R² |
|---|---|---|---|
| **XGBoost** *(best)* | **6.53** | **3.79** | **0.9428** |
| Random Forest | 6.57 | 3.75 | 0.9422 |
| LightGBM | 6.57 | 3.81 | 0.9420 |

All three models exceed R² = 0.94, which is excellent for a tension-score regression task.  
Results logged to [`training_results.csv`](cityflow_ml_lab/models/training_results.csv).

#### Artifacts Saved
- `random_forest_model.joblib`
- `xgboost_model.joblib`
- `lightgbm_model.joblib`
- `preprocessor.joblib` (scalers + feature column list)

#### Exploratory Data Analysis
- Full EDA notebook available: [`exploration.ipynb`](cityflow_ml_lab/notebooks/exploration.ipynb) (523 KB — contains graphs, correlation matrices, and distribution plots).
- Evaluation metrics notebook: [`evaluation.ipynb`](cityflow_ml_lab/notebooks/evaluation.ipynb).

---

## 3. What Still Needs to Be Done ❌

### 3.1 Phase 1 — Conception (Roadmap Weeks 1-2)
> **Status: Not found in codebase**

- [ ] UML diagrams (use-case, sequence, class diagrams)
- [ ] MCD / MPD (Conceptual and Physical Data Models) for the 3 tables:  
  `Utilisateurs`, `Prédictions`, `Logs_Requetes`
- [ ] User Stories documented on Trello (or equivalent)

---

### 3.2 Phase 3 — LLM & RAG (Roadmap Weeks 5-6)
> **Status: Not started**

- [ ] Set up **ChromaDB** vector database
- [ ] Implement document ingestion pipeline:
  - PDF/text chunking
  - Embedding via **Sentence-Transformers**
  - Storage into ChromaDB
- [ ] Integrate **LangChain** with **OpenAI GPT-4o-mini** or **Mistral AI**
- [ ] Implement similarity search (retrieval step)
- [ ] Ensure LLM responses always cite the source document
- [ ] Load urban regulation documents (e.g., "Code de la route local", emergency protocols)

---

### 3.3 Phase 4 — Full-Stack Development (Roadmap Weeks 7-8)
> **Status: Not started**

#### Backend (FastAPI)
- [ ] Create FastAPI project structure
- [ ] Implement JWT authentication (OAuth2/JWT)
- [ ] Define user roles: `Administrator` (full access) and `Operator` (read-only)
- [ ] Build prediction endpoint: accepts `quartier`, `heure`, `météo` → returns `tension_score`
- [ ] Build RAG chat endpoint: accepts user question → returns LLM answer + source citation
- [ ] Set up **PostgreSQL** database with 3 tables (`Utilisateurs`, `Prédictions`, `Logs_Requetes`)
- [ ] Auto-generated Swagger/OpenAPI docs via FastAPI

#### Frontend (React.js + Tailwind CSS)
- [ ] Login page with JWT authentication
- [ ] Prediction dashboard:
  - Interactive map or chart showing 24h tension score forecast
  - Filters: District, Day of week, Time slot
  - Historical comparison view (predicted vs. actual)
- [ ] RAG chat interface:
  - Chat window for natural-language questions
  - Displays source document citation per answer
- [ ] Unified dashboard layout

---

### 3.4 Phase 5 — MLOps & Security (Roadmap Weeks 9-10)
> **Status: Not started**

- [ ] **MLflow** integration: log model parameters, metrics, and versions
- [ ] Drift detection script: alert if prediction error exceeds **20%** threshold
- [ ] **Dockerize** ML service, backend API, frontend, PostgreSQL, and ChromaDB
- [ ] Write **Docker Compose** file to orchestrate all services
- [ ] Set up **GitHub Actions** CI/CD pipeline
- [ ] Implement RGPD compliance:
  - Anonymize user logs
  - Implement right-to-erasure endpoint
- [ ] AI Act compliance:
  - Transparency documentation for the ML model
  - Human oversight enforcement for suggested decisions
- [ ] Write **Pytest** tests for backend logic
- [ ] Optional: Apache Airflow pipeline for data orchestration

---

### 3.5 Phase 6 — Finalization (Roadmap Week 11)
> **Status: Not started**

- [ ] Technical report / final documentation
- [ ] End-to-end integration tests
- [ ] Presentation support materials

---

### 3.6 Extension — Traffic Congestion & Pollution Peaks
> **Status: Not started** (bonus scope defined in Section 9 of the spec)

- [ ] Congestion zone detection features
- [ ] Pollution Index prediction (NO₂, PM10, PM2.5) per district per hour
- [ ] Automated threshold breach detection and alert generation
- [ ] RAG integration for pollution-related regulation queries

---

## 4. Gap Analysis vs. Specification

| Specification Requirement | Status |
|---|---|
| Traffic Tension Score ML model (0-100) | ✅ Done |
| Dataset: CSV traffic + weather features | ✅ Done |
| Features: hour, day, weather, holiday | ✅ (holiday dropped — 99.8% missing) |
| Evaluation with MAE and RMSE | ✅ Done |
| Random Forest model | ✅ Done |
| XGBoost / LightGBM (bonus) | ✅ Done |
| Quartier (district) as feature | ❌ Missing — dataset has no district ID |
| LLM / RAG assistant | ❌ Not started |
| ChromaDB + LangChain integration | ❌ Not started |
| FastAPI backend | ❌ Not started |
| React + Tailwind dashboard | ❌ Not started |
| PostgreSQL database | ❌ Not started |
| JWT authentication & roles | ❌ Not started |
| MLflow model tracking | ❌ Not started |
| Drift detection (>20% error alert) | ❌ Not started |
| Docker & Docker Compose | ❌ Not started |
| GitHub Actions CI/CD | ❌ Not started |
| Pytest backend tests | ❌ Not started |
| RGPD & AI Act compliance | ❌ Not started |

---

## 5. Key Technical Note

The current dataset (`metro_traffic.csv`) does **not contain a district/quartier column** (`ID_Quartier`). The specification requires predictions *per quartier*. Before moving to Phase 4, either:

1. Source a multi-district dataset, or
2. Extend the data model to simulate or ingest district-level data.

This is a critical dependency for the prediction dashboard and should be resolved before building the API prediction endpoint.

---

## 6. Summary

```
Phase 1 — Conception        [ ] Pending
Phase 2 — Data & ML         [x] COMPLETE
Phase 3 — LLM & RAG         [ ] Not started
Phase 4 — Full-Stack Dev    [ ] Not started
Phase 5 — MLOps & Security  [ ] Not started
Phase 6 — Finalization      [ ] Not started
Extension — Pollution        [ ] Not started
```

The project has a solid and well-performing ML foundation (R² ≈ 0.943). The next critical step is **Phase 3 (LLM/RAG)** and **Phase 4 (FastAPI + React)** to turn the trained model into a usable platform.
