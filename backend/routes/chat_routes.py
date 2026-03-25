from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.core.rag import get_rag_pipeline, SQL_MEMORY_URI
from backend.core.auth import get_current_active_user
from langchain_community.chat_message_histories import SQLChatMessageHistory
from sqlalchemy import create_engine
from backend.models import User

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    user_id: str
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_active_user)):
    """Receives a query, runs the RAG pipeline, and returns the answer with metadata."""
    try:
        rag_pipeline = get_rag_pipeline()
        result = rag_pipeline.chat(request.user_id, request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest_endpoint(current_user: User = Depends(get_current_active_user)):
    """Admin endpoint to trigger knowledge base ingestion."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        rag_pipeline = get_rag_pipeline()
        rag_pipeline.ingest_documents()
        return {"status": "success", "message": "Knowledge base ingested successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MessageResponse(BaseModel):
    role: str
    content: str

@router.get("/history/{user_id}", response_model=List[MessageResponse])
async def get_chat_history(user_id: str, current_user: User = Depends(get_current_active_user)):
    try:
        memory = SQLChatMessageHistory(
            session_id=user_id,
            connection=create_engine(SQL_MEMORY_URI),
        )
        messages = memory.messages[-10:]
        
        return [{"role": "user" if msg.type == "human" else "assistant", "content": msg.content} for msg in messages]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
