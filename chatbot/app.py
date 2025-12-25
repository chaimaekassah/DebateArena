# chatbot/app.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from .chatbot_service import ChatbotService

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
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY manquante dans le fichier .env")

chatbot = ChatbotService(api_key=GEMINI_API_KEY)


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
    return {"message": "DebatArena API is running"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
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
async def clear_session(session_id: str):
    try:
        chatbot.clear_session(session_id)
        return {"message": f"Session {session_id} cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))