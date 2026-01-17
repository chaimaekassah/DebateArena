# Communiquer avec Gemini et gérer les sessions (simulation pour tests)
import os
import uuid
import warnings
from typing import Dict, List

warnings.filterwarnings("ignore")


class ChatbotService:
    def __init__(self, api_key: str = None):
        """Initialiser le service chatbot avec simulation pour tests."""
        # --- Si tu as l'API key et veux utiliser Gemini, tu peux configurer ici ---
        self.api_key = api_key
        self.model = None  # Pas utilisé dans la simulation

        # Conversations utilisateur
        self.sessions: Dict[str, List[dict]] = {}

        # Évaluations pour le mode SCORE
        self.evaluations: Dict[str, List[dict]] = {}

        # Prompt système de base
        self.system_prompt = """
Tu es DebateMaster, un expert en argumentation et en débats.
Tu as deux modes :

--------------------------------------------------------
MODE 1 = "train"
Objectif : entraîner l'utilisateur à débattre.
- Réponds comme un expert du débat
- Propose des arguments logiques
- Contredis ou soutiens selon la discussion
- Donne des conseils si l'utilisateur fait une erreur
- Ne donne JAMAIS de score dans ce mode

--------------------------------------------------------
MODE 2 = "score"
Objectif : évaluer la qualité argumentative de l'utilisateur.

À chaque message utilisateur :
- Analyse l'idée principale
- Analyse la cohérence logique
- Analyse l'utilisation de preuves
- Analyse la force argumentative
- Analyse la clarté du style
- Génère une mini-évaluation (score 0–20 pour chaque critère)

Stocke tout cela mais NE RÉVÈLE PAS encore le score.

Quand l'utilisateur dit "fin du débat" :
- Fournis un rapport complet :
  * Score global /100
  * Forces
  * Faiblesses
  * Conseils d'amélioration
  * Exemple de meilleure réponse possible

--------------------------------------------------------
Adaptation : Tu adaptes ton comportement selon mode.
"""

    def generate_response(self, message: str, mode: str = "train", session_id: str = None) -> dict:
        """Générer une réponse du chatbot avec support des deux modes."""

        # --- Créer ou récupérer la session ---
        if not session_id:
            session_id = str(uuid.uuid4())

        if session_id not in self.sessions:
            self.sessions[session_id] = []
            self.evaluations[session_id] = []

        # --- Enregistrer le message utilisateur ---
        self.sessions[session_id].append({"role": "user", "content": message})

        # --- Mode 2 : analyser les arguments utilisateur ---
        if mode == "score" and message.lower() not in ["fin du débat", "fin", "score"]:
            analysis = self._evaluate_argument(message)
            self.evaluations[session_id].append(analysis)

        # --- Si l'utilisateur demande le score final ---
        if mode == "score" and message.lower() in ["fin du débat", "fin", "score"]:
            final_report = self._generate_final_score(session_id)
            self.sessions[session_id].append({"role": "assistant", "content": final_report})
            return {"text": final_report, "session_id": session_id}

        # --- Générer une réponse simulée pour le chatbot ---
        response_text = f"Argument enregistré : {message[:50]}..."  # simulation simple
        self.sessions[session_id].append({"role": "assistant", "content": response_text})

        return {"text": response_text, "session_id": session_id}

    def _build_context(self, session_id: str) -> str:
        """Reconstruire le contexte des derniers échanges."""
        history = self.sessions.get(session_id, [])[-10:]
        context = ""

        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            context += f"{role}: {msg['content']}\n"

        return context

    def _evaluate_argument(self, message: str) -> dict:
        """Simulation d'analyse automatique d'un argument utilisateur (mode score)."""
        # Ici on simule des notes pour chaque critère, pour tests
        return {
            "idee_principale": message[:50],  # résumé
            "logique": 15,
            "preuves": 14,
            "force_argumentative": 16,
            "structure": 15,
            "clarte_style": 16
        }

    def _generate_final_score(self, session_id: str) -> str:
        """Générer score final à partir des évaluations du débat (sécurisé)."""
        evaluations = self.evaluations.get(session_id, [])

        if not evaluations:
            return (
                "⚠️ Aucun argument n’a été fourni.\n"
                "Veuillez proposer au moins un argument avant de demander le score."
            )

        criteres = ["logique", "preuves", "force_argumentative", "structure", "clarte_style"]

        total = 0
        nb_notes = 0

        for ev in evaluations:
            if not isinstance(ev, dict):
                continue
            for c in criteres:
                valeur = ev.get(c)
                if isinstance(valeur, (int, float)):
                    total += valeur
                    nb_notes += 1

        if nb_notes == 0:
            return (
                "⚠️ Les arguments fournis n’étaient pas suffisamment exploitables "
                "pour établir une évaluation chiffrée.\nMerci de formuler des arguments plus clairs et structurés."
            )

        score_final = round((total / (nb_notes * 20)) * 100, 2)

        rapport = f"""
🎯 **Score final du débat : {score_final}/100**

✅ **Points forts**
- Arguments analysés sur plusieurs critères

❌ **Points à améliorer**
- Structure
- Preuves
- Clarté

📘 **Conseils**
- Formuler une idée claire par argument
- Justifier chaque affirmation par un exemple
- Structurer les réponses (idée → justification → exemple)
"""

        return rapport

    def clear_session(self, session_id: str):
        """Efface l'historique complet d'une session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.evaluations:
            del self.evaluations[session_id]
