import uuid

class ChatbotService:
    """
    ChatbotService en mode simulation manuelle pour démo vidéo.
    Ne fait aucune requête externe, toutes les réponses sont simulées.
    """

    def __init__(self):
        self.sessions = {}  # garder l’historique des sessions

    def generate_response(self, message: str, mode: str = "train", session_id: str = None) -> dict:
        """
        Retourne une réponse simulée pour la vidéo.
        """
        if not session_id:
            session_id = str(uuid.uuid4())

        if session_id not in self.sessions:
            self.sessions[session_id] = []

        # Ajouter le message utilisateur à l’historique
        self.sessions[session_id].append({"role": "user", "content": message})

        # Réponses simulées
        response_text = self._get_demo_response(message, mode)

        # Ajouter réponse chatbot à l’historique
        self.sessions[session_id].append({"role": "assistant", "content": response_text})

        return {"text": response_text, "session_id": session_id}

    def _get_demo_response(self, message: str, mode: str) -> str:
        """
        Définir des réponses manuelles selon le message.
        """
        message_lower = message.lower()

        # Fin du débat : score final
        if message_lower in ["fin du débat", "fin", "score"]:
            return """
🎯 Score final du débat : 85/100

✅ Points forts
- Arguments cohérents et logiques
- Utilisation correcte de preuves

❌ Points à améliorer
- Structure
- Clarté

📘 Conseils
- Formuler une idée claire par argument
- Justifier chaque affirmation
- Structurer réponses : idée → justification → exemple
"""

        # Réponses simples simulées
        if "bonjour" in message_lower:
            return "Bonjour ! Prête à débattre sur le sujet ?"
        if "ia" in message_lower or "intelligence artificielle" in message_lower:
            return "L'IA transforme rapidement le monde de l'art. Quels arguments peux-tu proposer ?"
        if "mais" in message_lower:
            return "Intéressant point de vue ! Peux-tu détailler ton argument ?"
        if "oui" in message_lower:
            return "Argument enregistré : " + message

        # Réponse par défaut
        return f"Réponse simulée à : {message}"

    def clear_session(self, session_id: str):
        """Efface l'historique complet d'une session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
