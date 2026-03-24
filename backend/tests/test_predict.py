import importlib

import numpy as np


def test_predict_caps_upper_bound_with_spatial_bias(client, make_auth_headers, monkeypatch):
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
    assert 0.0 <= response.json()["tension_score"] <= 100.0


def test_predict_caps_lower_bound_with_spatial_bias(client, make_auth_headers, monkeypatch):
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
    assert 0.0 <= response.json()["tension_score"] <= 100.0
