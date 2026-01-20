import pytest
from chatbot.chatbot_service import ChatbotService


@pytest.fixture
def chatbot_service():
    return ChatbotService(api_key="fake-key")


def test_generate_response_basic(chatbot_service):
    response = chatbot_service.generate_response("Bonjour")
    assert "Argument enregistré" in response["text"]
    assert "session_id" in response


def test_generate_response_with_session(chatbot_service):
    session_id = "test-session-123"
    response = chatbot_service.generate_response(
        "Ceci est un test", session_id=session_id
    )
    assert response["session_id"] == session_id
    assert session_id in chatbot_service.sessions


def test_session_history(chatbot_service):
    r1 = chatbot_service.generate_response("Premier message")
    session_id = r1["session_id"]

    chatbot_service.generate_response(
        "Deuxième message", session_id=session_id)

    assert len(chatbot_service.sessions[session_id]) == 4


def test_context_building(chatbot_service):
    r = chatbot_service.generate_response("Message 1")
    session_id = r["session_id"]

    for i in range(2, 6):
        chatbot_service.generate_response(
            f"Message {i}", session_id=session_id)

    context = chatbot_service._build_context(session_id)
    assert "User:" in context
    assert "Assistant:" in context


def test_clear_session(chatbot_service):
    r = chatbot_service.generate_response("Hello")
    session_id = r["session_id"]

    chatbot_service.clear_session(session_id)
    assert session_id not in chatbot_service.sessions


def test_multiple_sessions(chatbot_service):
    r1 = chatbot_service.generate_response("Session 1")
    r2 = chatbot_service.generate_response("Session 2")

    assert r1["session_id"] != r2["session_id"]
