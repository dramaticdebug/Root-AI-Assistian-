from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger
import time

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    stream: bool = False

class ChatResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    timestamp: float

@router.get("/health")
async def health_check():
    logger.debug("Health check requested")
    return {
        "status": "online",
        "timestamp": time.time(),
        "version": "0.1.0"
    }

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Chat request received: {request.message[:50]}...")
    
    # Mock response for now
    # This is where OpenAI or Local LLM integration will go
    response_content = f"I received your message: '{request.message}'. I am your Root AI assistant."
    
    return ChatResponse(
        id=str(int(time.time())),
        content=response_content,
        timestamp=time.time()
    )
