def test_login_returns_jwt_token(client, make_auth_headers):
    headers = make_auth_headers(username="auth_user", password="auth_pass", role="operator")
    assert headers["Authorization"].startswith("Bearer ")


def test_login_rejects_invalid_password(client, make_auth_headers):
    make_auth_headers(username="bad_pass_user", password="correct_pass")

    response = client.post(
        "/auth/login",
        data={"username": "bad_pass_user", "password": "wrong_pass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_stress_multiple_attempts(client, make_auth_headers):
    make_auth_headers(username="stress_user", password="stress_pass")

    for _ in range(10):
        response = client.post(
            "/auth/login",
            data={"username": "stress_user", "password": "stress_pass"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
