import os
import logging
import math
from typing import Optional

import joblib
import mlflow
import numpy as np
import pandas as pd
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel, Field
from pathlib import Path

from backend.database import engine, Base
from backend.routes.auth_routes import router as auth_router
from backend.routes.chat_routes import router as chat_router
from backend.core.auth import get_current_active_user
from backend.models import User

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CityFlow Traffic Tension API")
app.include_router(auth_router)
app.include_router(chat_router)

METRICS_BEARER_TOKEN = os.getenv(
    "METRICS_BEARER_TOKEN",
    "cityflow-internal-metrics-token",
)
DISABLE_MLFLOW = os.getenv("DISABLE_MLFLOW", "false").lower() == "true"

@app.middleware("http")
async def restrict_metrics_endpoint(request: Request, call_next):
    if request.url.path == "/metrics":
        auth_header = request.headers.get("authorization", "")
        expected = f"Bearer {METRICS_BEARER_TOKEN}"
        if auth_header != expected:
            return JSONResponse(status_code=403, content={"detail": "Forbidden"})
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=False,
    excluded_handlers=["/health", "/metrics"],
).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

BASE_DIR = Path(__file__).resolve().parent
container_models_dir = BASE_DIR.joinpath("models").resolve()
local_models_dir = BASE_DIR.joinpath("..", "cityflow_ml_lab", "models").resolve()
MODELS_DIR = container_models_dir if container_models_dir.exists() else local_models_dir

PREPROCESSOR_PATH = MODELS_DIR.joinpath("preprocessor.joblib")
MODEL_PATH = MODELS_DIR.joinpath("xgboost_model.joblib")


class _IdentityScaler:
    def transform(self, values):
        return values


class _DummyModel:
    def predict(self, X):
        return np.array([50.0 for _ in range(len(X))])


if PREPROCESSOR_PATH.exists() and MODEL_PATH.exists():
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    model = joblib.load(MODEL_PATH)
else:
    if os.getenv("TESTING", "0") in {"1", "true", "True"}:
        preprocessor = {
            "feature_cols": [
                "hour_sin",
                "hour_cos",
                "day_of_week",
                "is_weekend",
                "temp_celsius",
                "rain_1h",
                "snow_1h",
            ],
            "scaler_features": _IdentityScaler(),
            "scaler_target": _IdentityScaler(),
        }
        model = _DummyModel()
    else:
        raise FileNotFoundError(
            f"Model artifacts missing: {PREPROCESSOR_PATH} and/or {MODEL_PATH}"
        )

FEATURE_COLS = preprocessor["feature_cols"]
SCALER_FEATURES = preprocessor["scaler_features"]
SCALER_TARGET = preprocessor["scaler_target"]


class PredictionInput(BaseModel):
    date_time: str = Field(..., json_schema_extra={"example": "2018-09-27 00:00:00"})
    temp: float = Field(..., json_schema_extra={"example": 286.15})
    rain_1h: float = Field(..., json_schema_extra={"example": 0.0})
    snow_1h: float = Field(..., json_schema_extra={"example": 0.0})
    lat: Optional[float] = None
    lng: Optional[float] = None


class PredictionOutput(BaseModel):
    tension_score: float
    model: str


def apply_spatial_bias(base_score: float, lat: float, lng: float) -> float:
    """Simulates localized traffic variation based on distance from city center."""
    if lat is None or lng is None:
        return base_score

    center_lat, center_lng = 33.5731, -7.5898
    distance = math.sqrt((lat - center_lat)**2 + (lng - center_lng)**2)

    if distance < 0.03:
        bias = 15.0
    elif distance < 0.08:
        bias = 0.0
    else:
        bias = -20.0

    noise = (math.sin(lat * 5000) + math.cos(lng * 5000)) * 6.0

    final_score = base_score + bias + noise
    return max(0.0, min(100.0, final_score))


def preprocess_single(record: PredictionInput) -> np.ndarray:
    """Convert a single record into the model input vector."""
    df = pd.DataFrame([record.model_dump()])
    df["date_time"] = pd.to_datetime(df["date_time"])

    df["hour"] = df["date_time"].dt.hour
    df["day_of_week"] = df["date_time"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    df["temp_celsius"] = df["temp"] - 273.15
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

    df["rain_1h"] = df["rain_1h"].clip(upper=50)
    df["snow_1h"] = df["snow_1h"].clip(upper=50)

    feature_values = df[["temp_celsius", "rain_1h", "snow_1h"]].values
    feature_values = SCALER_FEATURES.transform(feature_values)

    df[["temp_celsius", "rain_1h", "snow_1h"]] = feature_values

    return df[FEATURE_COLS].values


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionOutput)
def predict(input: PredictionInput, current_user: User = Depends(get_current_active_user)):
    X = preprocess_single(input)
    pred = model.predict(X)
    base_score = float(pred[0])

    if input.lat is not None and input.lng is not None:
        final_score = apply_spatial_bias(base_score, float(input.lat), float(input.lng))
    else:
        final_score = base_score

    if not DISABLE_MLFLOW:
        try:
            mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000"))
            mlflow.set_experiment("cityflow_predict_inference")
            with mlflow.start_run(run_name="predict_request"):
                mlflow.log_params(
                    {
                        "date_time": input.date_time,
                        "temp": float(input.temp),
                        "rain_1h": float(input.rain_1h),
                        "snow_1h": float(input.snow_1h),
                        "lat": float(input.lat) if input.lat is not None else None,
                        "lng": float(input.lng) if input.lng is not None else None,
                        "user": current_user.username,
                        "model": "xgboost_spatial",
                    }
                )
                mlflow.log_metric("tension_score", float(final_score))
        except Exception as exc:
            logger.warning("MLflow predict logging failed: %s", exc)

    return PredictionOutput(tension_score=final_score, model="xgboost_spatial")
