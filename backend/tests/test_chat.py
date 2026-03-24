import importlib

from langchain_community.chat_message_histories import SQLChatMessageHistory


def test_chat_history_returns_last_10_messages(client, make_auth_headers, tmp_path, monkeypatch):
    chat_routes = importlib.import_module("backend.routes.chat_routes")
    memory_uri = f"sqlite:///{tmp_path / 'history.db'}"
    monkeypatch.setattr(chat_routes, "SQL_MEMORY_URI", memory_uri)

    user_id = "history-user"
    memory = SQLChatMessageHistory(session_id=user_id, connection_string=memory_uri)

    for i in range(6):
        memory.add_user_message(f"user-{i}")
        memory.add_ai_message(f"assistant-{i}")

    headers = make_auth_headers(username="chat_user", password="chat_pass")
    response = client.get(f"/chat/history/{user_id}", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 10
    assert payload[0]["content"] == "user-1"
    assert payload[-1]["content"] == "assistant-5"
