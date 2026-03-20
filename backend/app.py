from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.database import engine, Base
from backend.routes.auth_routes import router as auth_router
from backend.core.auth import get_current_active_user
from backend.models import User
from fastapi import Depends

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CityFlow Traffic Tension API")
app.include_router(auth_router)

# Allow local frontend development to call this backend
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

# Load preprocessing and model objects (paths resolved relative to this file)
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR.joinpath("models").resolve()

PREPROCESSOR_PATH = MODELS_DIR.joinpath("preprocessor.joblib")
MODEL_PATH = MODELS_DIR.joinpath("xgboost_model.joblib")

preprocessor = joblib.load(PREPROCESSOR_PATH)
model = joblib.load(MODEL_PATH)

# These match the training pipeline feature order
FEATURE_COLS = preprocessor["feature_cols"]
SCALER_FEATURES = preprocessor["scaler_features"]
SCALER_TARGET = preprocessor["scaler_target"]


class PredictionInput(BaseModel):
    date_time: str = Field(..., example="2018-09-27 00:00:00")
    temp: float = Field(..., example=286.15)
    rain_1h: float = Field(..., example=0.0)
    snow_1h: float = Field(..., example=0.0)


class PredictionOutput(BaseModel):
    tension_score: float
    model: str


def preprocess_single(record: PredictionInput) -> np.ndarray:
    """Convert a single record into the model input vector."""
    df = pd.DataFrame([record.dict()])
    df["date_time"] = pd.to_datetime(df["date_time"])

    df["hour"] = df["date_time"].dt.hour
    df["day_of_week"] = df["date_time"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    df["temp_celsius"] = df["temp"] - 273.15
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

    # Cap rain/snow in the same way training did
    df["rain_1h"] = df["rain_1h"].clip(upper=50)
    df["snow_1h"] = df["snow_1h"].clip(upper=50)

    feature_values = df[["temp_celsius", "rain_1h", "snow_1h"]].values
    feature_values = SCALER_FEATURES.transform(feature_values)

    # Replace scaled values in dataframe
    df[["temp_celsius", "rain_1h", "snow_1h"]] = feature_values

    return df[FEATURE_COLS].values


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionOutput)
def predict(input: PredictionInput, current_user: User = Depends(get_current_active_user)):
    X = preprocess_single(input)
    pred = model.predict(X)
    # In training, we stored tension_score scaled 0-100 already
    return PredictionOutput(tension_score=float(pred[0]), model="xgboost")
