# Communiquer avec Gemini et gérer les sessions.
import os
import uuid
import warnings
import google.generativeai as genai
from typing import Dict, List

warnings.filterwarnings("ignore")


class ChatbotService:
    def __init__(self, api_key: str):
        """Initialiser le service chatbot avec l'API Gemini"""
        if not api_key:
            raise ValueError("API key manquante pour Gemini !")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        
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
        
        # --- Générer la réponse du chatbot (débat normal ou score analytiques) ---
        try:
            context = self._build_context(session_id)
            full_prompt = f"{self.system_prompt}\n\nMODE ACTUEL : {mode}\n\n{context}\nUtilisateur : {message}"
            
            response = self.model.generate_content(full_prompt)
            response_text = response.text
            
            # Sauvegarder réponse IA
            self.sessions[session_id].append({
                "role": "assistant",
                "content": response_text
            })
            
            return {"text": response_text, "session_id": session_id}
        
        except Exception as e:
            raise Exception(f"Erreur génération IA : {str(e)}")

    def _build_context(self, session_id: str) -> str:
        """Reconstruire le contexte des derniers échanges."""
        history = self.sessions.get(session_id, [])[-10:]
        context = ""
        
        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            context += f"{role}: {msg['content']}\n"
        
        return context

    def _evaluate_argument(self, message: str) -> dict:
        """Analyse automatique d'un argument utilisateur (mode score)."""
        prompt = f"""
Analyse ce message d'utilisateur pour un débat :

Message : "{message}"

Donne une analyse sous forme de JSON avec :
- idee_principale (texte)
- logique (score 0-20)
- preuves (score 0-20)
- force_argumentative (score 0-20)
- structure (score 0-20)
- clarte_style (score 0-20)
"""
        
        response = self.model.generate_content(prompt)
        
        # Gemini répond souvent en JSON directement
        try:
            import json
            return json.loads(response.text)
        except:
            return {"raw": response.text}

    def _generate_final_score(self, session_id: str) -> str:
        """Générer score final à partir des évaluations du débat."""
        evaluations = self.evaluations.get(session_id, [])
        
        if not evaluations:
            return "Aucun argument à évaluer."
        
        # Calcul du score global
        total_score = 0
        criteres = ["logique", "preuves", "force_argumentative", "structure", "clarte_style"]
        count = 0
        
        for ev in evaluations:
            for c in criteres:
                if c in ev:
                    total_score += ev[c]
                    count += 1
        
        final_score = round((total_score / (count * 20)) * 100, 2)  # pourcentage
        
        # Construction d'un rapport clair
        rapport = f"""
🎯 **Score final du débat : {final_score}/100**

✅ **Points forts**
- Analyse basée sur les arguments fournis

❌ **Points à améliorer**
- Cohérence
- Structure
- Preuves

📘 **Conseils :**
- Utilise des exemples concrets
- Structure tes arguments en 3 étapes (idée, justification, preuve)
- Améliore la clarté et la logique interne
"""
        
        return rapport

    def clear_session(self, session_id: str):
        """Efface l'historique complet d'une session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.evaluations:
            del self.evaluations[session_id]