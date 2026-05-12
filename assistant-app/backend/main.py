from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Desktop Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running"}

@app.post("/api/chat")
def chat(request: ChatRequest):
    # Basic API structure ready for OpenAI and Whisper
    return {"reply": f"Mesajınızı aldım: {request.message}"}
