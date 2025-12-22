import os
import uuid
import warnings
import google.generativeai as genai
from typing import Dict

warnings.filterwarnings("ignore")


class ChatbotService:
    def __init__(self, api_key: str):
        """Initialiser le service chatbot avec l'API Gemini"""
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        self.sessions: Dict[str, list] = {}

    def generate_response(self, message: str, session_id: str = None) -> dict:
        """
        Générer une réponse du chatbot

        Args:
            message: Message de l'utilisateur
            session_id: ID de session pour le contexte

        Returns:
            dict: Réponse et session_id
        """
        # Créer ou récupérer la session
        if not session_id:
            session_id = str(uuid.uuid4())

        if session_id not in self.sessions:
            self.sessions[session_id] = []

        # Ajouter le message à l'historique
        self.sessions[session_id].append({"role": "user", "content": message})

        # Générer la réponse
        try:
            # Construire le contexte avec l'historique
            context = self._build_context(session_id)
            response = self.model.generate_content(context + "\n" + message)

            response_text = response.text

            # Sauvegarder la réponse dans l'historique
            self.sessions[session_id].append({
                "role": "assistant",
                "content": response_text
            })

            return {
                "text": response_text,
                "session_id": session_id
            }
        except Exception as e:
            raise Exception(f"Error generating response: {str(e)}")

    def _build_context(self, session_id: str) -> str:
        """Construire le contexte de conversation"""
        if session_id not in self.sessions or not self.sessions[session_id]:
            return ""

        # Limiter à 10 derniers messages pour le contexte
        recent_messages = self.sessions[session_id][-10:]
        context = ""
        for msg in recent_messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            context += f"{role}: {msg['content']}\n"

        return context

    def clear_session(self, session_id: str):
        """Effacer l'historique d'une session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
