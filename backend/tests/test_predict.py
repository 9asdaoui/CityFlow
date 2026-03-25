import importlib

import numpy as np


def test_predict_returns_raw_high_value(client, make_auth_headers, monkeypatch):
    app_module = importlib.import_module("backend.app")

    class HighModel:
        def predict(self, X):
            return np.array([200.0])

    monkeypatch.setattr(app_module, "model", HighModel())

    headers = make_auth_headers(username="predict_upper", password="predict_upper")
    response = client.post(
        "/predict",
        json={
            "date_time": "2024-01-01 08:00:00",
            "temp": 286.15,
            "rain_1h": 0.0,
            "snow_1h": 0.0,
            "lat": 33.5731,
            "lng": -7.5898,
        },
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["tension_score"] == 200.0
    assert response.json()["model"] == "xgboost"


def test_predict_returns_raw_low_value(client, make_auth_headers, monkeypatch):
    app_module = importlib.import_module("backend.app")

    class LowModel:
        def predict(self, X):
            return np.array([-100.0])

    monkeypatch.setattr(app_module, "model", LowModel())

    headers = make_auth_headers(username="predict_lower", password="predict_lower")
    response = client.post(
        "/predict",
        json={
            "date_time": "2024-01-01 08:00:00",
            "temp": 286.15,
            "rain_1h": 0.0,
            "snow_1h": 0.0,
            "lat": 34.0000,
            "lng": -7.0000,
        },
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["tension_score"] == -100.0
    assert response.json()["model"] == "xgboost"


def test_predict_same_output_for_same_inputs_with_different_coordinates(client, make_auth_headers, monkeypatch):
    app_module = importlib.import_module("backend.app")

    class FixedModel:
        def predict(self, X):
            return np.array([74.0])

    monkeypatch.setattr(app_module, "model", FixedModel())

    headers = make_auth_headers(username="predict_coords", password="predict_coords")

    payload = {
        "date_time": "2024-01-01 08:00:00",
        "temp": 286.15,
        "rain_1h": 0.0,
        "snow_1h": 0.0,
    }

    r_center = client.post(
        "/predict",
        json={**payload, "lat": 33.5731, "lng": -7.5898},
        headers=headers,
    )
    r_far = client.post(
        "/predict",
        json={**payload, "lat": 35.7595, "lng": -5.8340},
        headers=headers,
    )

    assert r_center.status_code == 200
    assert r_far.status_code == 200
    assert r_center.json()["tension_score"] == r_far.json()["tension_score"] == 74.0
