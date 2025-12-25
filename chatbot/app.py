# chatbot/app.py
import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from chatbot.chatbot_service import ChatbotService


# Charger les variables d'environnement
load_dotenv()

app = FastAPI(title="DebatArena API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser le service avec l'API key depuis les variables d'environnement
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_chatbot_service():
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY manquante")
    return ChatbotService(GEMINI_API_KEY)


# Modèles Pydantic
class ChatRequest(BaseModel):
    message: str
    mode: str = "train"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    text: str
    session_id: str


@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, chatbot: ChatbotService = Depends(get_chatbot_service)):
    try:
        response = chatbot.generate_response(
            message=request.message,
            mode=request.mode,
            session_id=request.session_id
        )
        return ChatResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/session/{session_id}")
async def clear_session(session_id: str, chatbot: ChatbotService = Depends(get_chatbot_service)):
    try:
        chatbot.clear_session(session_id)
        return {"message": "Session cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))