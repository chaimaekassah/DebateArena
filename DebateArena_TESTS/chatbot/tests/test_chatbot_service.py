import pytest
import json
from unittest.mock import MagicMock, patch
from chatbot.chatbot_service import ChatbotService


@pytest.fixture
def chatbot_service():
    # On crée une instance avec une fausse API key
    service = ChatbotService(api_key="fake-key")
    
    # On mock la méthode generate_content pour ne pas appeler Gemini
    def fake_generate_content(prompt):
        if "Analyse ce message" in prompt or "argument" in prompt.lower():
            # Retourner une réponse simulée pour les arguments
            return MagicMock(text="Réponse simulée avec analyse d'argument")
        return MagicMock(text=f"Réponse simulée pour: {prompt[:30]}...")

    service.model.generate_content = MagicMock(side_effect=fake_generate_content)
    return service


def test_generate_response_basic(chatbot_service):
    # Test génération de réponse basique
    response = chatbot_service.generate_response("Bonjour")
    assert "Réponse simulée" in response["text"]
    assert "session_id" in response
    assert response["session_id"] is not None


def test_generate_response_with_session(chatbot_service):
    # Test avec session_id fourni
    custom_session_id = "test-session-123"
    response = chatbot_service.generate_response("Ceci est un test", session_id=custom_session_id)
    assert response["session_id"] == custom_session_id
    assert "Réponse simulée" in response["text"]
    # Vérifier que la session existe
    assert custom_session_id in chatbot_service.sessions


def test_session_history(chatbot_service):
    # Test de l'historique de session
    response1 = chatbot_service.generate_response("Premier message")
    session_id = response1["session_id"]
    
    response2 = chatbot_service.generate_response("Deuxième message", session_id=session_id)
    
    # Vérifier que l'historique contient 4 entrées (2 user + 2 assistant)
    assert len(chatbot_service.sessions[session_id]) == 4
    assert chatbot_service.sessions[session_id][0]["role"] == "user"
    assert chatbot_service.sessions[session_id][1]["role"] == "assistant"


def test_context_building(chatbot_service):
    # Test de la construction du contexte
    response1 = chatbot_service.generate_response("Message 1")
    session_id = response1["session_id"]
    
    # Ajouter plusieurs messages
    for i in range(2, 6):
        chatbot_service.generate_response(f"Message {i}", session_id=session_id)
    
    # Vérifier que le contexte est construit
    context = chatbot_service._build_context(session_id)
    assert "User:" in context
    assert "Assistant:" in context


def test_clear_session(chatbot_service):
    # Test de suppression de session
    response = chatbot_service.generate_response("Hello")
    session_id = response["session_id"]
    
    # Vérifier que la session existe
    assert session_id in chatbot_service.sessions
    
    # Supprimer la session
    chatbot_service.clear_session(session_id)
    
    # Vérifier que la session n'existe plus
    assert session_id not in chatbot_service.sessions


def test_multiple_sessions(chatbot_service):
    # Test de gestion de plusieurs sessions
    response1 = chatbot_service.generate_response("Session 1")
    response2 = chatbot_service.generate_response("Session 2")
    
    session_id1 = response1["session_id"]
    session_id2 = response2["session_id"]
    
    # Vérifier que les sessions sont différentes
    assert session_id1 != session_id2
    
    # Vérifier que les deux sessions existent
    assert session_id1 in chatbot_service.sessions
    assert session_id2 in chatbot_service.sessions