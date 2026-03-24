import importlib
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


@pytest.fixture(scope="session")
def test_db_url(tmp_path_factory):
    db_file = tmp_path_factory.mktemp("db") / "test.db"
    return f"sqlite:///{db_file}"


@pytest.fixture(scope="session")
def client(test_db_url):
    os.environ["DATABASE_URL"] = test_db_url
    os.environ["SECRET_KEY"] = "test-secret-key"
    os.environ["TESTING"] = "1"

    for module_name in [
        "backend.app",
        "backend.database",
        "backend.models",
        "backend.routes.auth_routes",
        "backend.routes.chat_routes",
    ]:
        if module_name in sys.modules:
            del sys.modules[module_name]

    app_module = importlib.import_module("backend.app")

    with TestClient(app_module.app) as test_client:
        yield test_client


@pytest.fixture
def make_auth_headers(client):
    def _make(username="test_user", password="test_password", role="admin"):
        register_payload = {"username": username, "password": password, "role": role}
        register_response = client.post("/auth/register", json=register_payload)
        assert register_response.status_code in (200, 400)

        login_response = client.post(
            "/auth/login",
            data={"username": username, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _make
