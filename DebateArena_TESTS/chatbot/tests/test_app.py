from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from chatbot.app import app, get_chatbot_service

# ---------------------------
# Mock du ChatbotService
# ---------------------------
mock_service = MagicMock()

mock_service.generate_response.side_effect = (
    lambda message, mode="train", session_id=None: {
        "text": (
            f"Réponse simulée: {message}"
            if "fin du débat" not in message.lower()
            else "Score final: 85/100"
        ),
        "session_id": session_id or "session123"
    }
)

mock_service.clear_session.return_value = None


def override_chatbot_service():
    return mock_service


# ---------------------------
# Override de la dépendance
# ---------------------------
app.dependency_overrides[get_chatbot_service] = override_chatbot_service

client = TestClient(app)

# ---------------------------
# Tests
# ---------------------------

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_chat_basic():
    response = client.post(
        "/chat",
        json={"message": "Bonjour"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "Réponse simulée" in data["response"]
    assert "session_id" in data


def test_chat_with_session():
    response = client.post(
        "/chat",
        json={"message": "Bonjour", "session_id": "sessionABC"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "sessionABC"


def test_chat_final_score():
    response = client.post(
        "/chat",
        json={"message": "fin du débat", "session_id": "session123"}
    )
    assert response.status_code == 200
    assert "Score final" in response.json()["response"]


def test_clear_session():
    response = client.delete("/session/session123")
    assert response.status_code == 200
    assert response.json()["message"] == "Session cleared"
