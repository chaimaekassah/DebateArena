# chatbot/app.py
# API REST

import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .chatbot_service import ChatbotService

app = FastAPI(title="DebatArena Chatbot API", version="1.0.0")

# Configuration CORS pour React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Dependency Injection (PRO)
# ----------------------------


def get_chatbot_service() -> ChatbotService:
    api_key = os.getenv("GOOGLE_API_KEY")
    return ChatbotService(api_key=api_key)

# ----------------------------
# Modèles
# ----------------------------


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str

# ----------------------------
# Routes
# ----------------------------


@app.get("/")
def root():
    return {"message": "DebatArena Chatbot API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "chatbot"}


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chatbot_service: ChatbotService = Depends(get_chatbot_service)
):
    """
    Endpoint pour envoyer un message au chatbot
    """
    try:
        response = chatbot_service.generate_response(
            message=request.message,
            session_id=request.session_id
        )
        return ChatResponse(
            response=response["text"],
            session_id=response["session_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/chat/{session_id}")
async def clear_session(
    session_id: str,
    chatbot_service: ChatbotService = Depends(get_chatbot_service)
):
    """
    Endpoint pour effacer l'historique d'une session
    """
    chatbot_service.clear_session(session_id)
    return {"message": "Session cleared", "session_id": session_id}

# ----------------------------
# Lancement local
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
