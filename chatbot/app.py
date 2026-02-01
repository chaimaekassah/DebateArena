from fastapi import FastAPI
from pydantic import BaseModel
from chatbot_service import ChatbotService

app = FastAPI()
chatbot = ChatbotService()

class ChatRequest(BaseModel):
    message: str
    session_id: str = None

@app.post("/chat")
def chat(req: ChatRequest):
    response = chatbot.generate_response(req.message, session_id=req.session_id)
    return response
