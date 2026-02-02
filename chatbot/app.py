# chatbot/app.py
import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from chatbot_service import ChatbotService

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


def get_chatbot_service():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY non configurée"
        )

    return ChatbotService(api_key=api_key)


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
        return {"message": f"Session {session_id} cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
