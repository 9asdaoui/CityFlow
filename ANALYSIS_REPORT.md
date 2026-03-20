# CityFlow Sentinel Analysis Report

## 1. Observations on Current State

After analyzing the `CityFlow .pdf` specification and the current codebase (`C:\Users\oussa\OneDrive\Desktop\youcode_ai_projects\CityFlow`), the following progress has been observed:

- **Machine Learning (Phase 2):** The ML models (Random Forest, XGBoost, LightGBM) have been trained and evaluated. Artifacts are successfully saved in `cityflow_ml_lab/models`. The current implementation properly handles date, weather, and traffic data for a single primary location.
- **Backend (Phase 4 partial):** A barebones FastAPI application exists in `backend/app.py`. It successfully loads the `xgboost_model` and exposes a `/predict` endpoint. A basic `Dockerfile` and `docker-compose.yml` are present.
- **Frontend (Phase 4 partial):** A React+Vite project exists in the `frontend` directory. Basic routing (React Router) is set up for pages like `/login`, `/`, and `/assistant`, but the UI components are just placeholders.

## 2. Identified Errors & Problems

1. **Missing LLM/RAG Integration (Phase 3)**: There is zero implementation of the regulatory AI assistant. ChromaDB is not configured, the document chunking/ingestion pipeline is missing, and LangChain/LLM connectivity (OpenAI/Mistral) is completely absent.
2. **Database & Authentication Absences**: The backend lacks a connection to PostgreSQL. The required tables (`Utilisateurs`, `Prédictions`, `Logs_Requetes`) do not exist. JWT authentication and Role-Based Access Control (Admin/Operator) are not implemented.
3. **Missing MLOps & Security (Phase 5)**: There is no MLflow tracking, no drift detection script, no GitHub Actions CI/CD pipeline, and no RGPD/AI Act compliance mechanisms (e.g., anonymizing logs).
4. **Incomplete Dockerization**: The `docker-compose.yml` only provisions the FastAPI backend. It needs to include PostgreSQL, ChromaDB, and the Frontend.

*Note on Specifications:* The initial requirement for district-level (`ID_Quartier`) predictions has been officially modified. The project will now focus on predicting a single tension score for a **Main Arterial Road**. The existing `metro_traffic.csv` dataset and current trained models are perfectly suited for this approach.

## 3. Next Steps Plan

To complete the project according to the updated specifications:

### Step 1: Implement LLM/RAG Assistant (Phase 3)
- Set up **ChromaDB** in the `backend`.
- Create a Python script to ingest PDF documents (e.g., city regulations, emergency protocols), chunk them, generate embeddings using Sentence-Transformers, and store them in ChromaDB.
- Integrate **LangChain** and connect to the chosen LLM (GPT-4o-mini or Mistral) in `backend/app.py` with an endpoint like `/api/chat`.

### Step 2: Complete Backend Infrastructure (Phase 4)
- Set up **PostgreSQL** using SQLAlchemy or SQLModel.
- Implement the 3 required tables: `Utilisateurs`, `Prédictions`, `Logs_Requetes`.
- Add **JWT Authentication** endpoints (`/login`, `/register`) and enforce role checks (Admin vs Operator).

### Step 3: Develop Frontend Dashboard (Phase 4)
- Implement the Login UI.
- Build the **Prediction Dashboard** fetching data from the backend to display the 24h tension score map/charts for the Main Arterial Road.
- Build the **RAG Chat Interface** communicating with the backend's `/api/chat` endpoint and displaying source citations.

### Step 4: MLOps, Dockerization & Finalization (Phases 5 & 6)
- Integrate **MLflow** into the training script.
- Expand `docker-compose.yml` to include the Frontend, PostgreSQL, ChromaDB, and Backend.
- Add GitHub Actions CI/CD and Pytest units.
- Write the final technical documentation.
