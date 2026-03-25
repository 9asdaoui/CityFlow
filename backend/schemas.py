from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .models import UserRole

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.operator

class UserResponse(UserBase):
    id: int
    role: UserRole
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PredictionCreate(BaseModel):
    predicted_score: float

class PredictionResponse(PredictionCreate):
    id: int
    timestamp: datetime
    actual_score: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class ChatLogBase(BaseModel):
    question: str

class ChatLogCreate(ChatLogBase):
    pass

class ChatLogResponse(ChatLogBase):
    id: int
    user_id: int
    llm_answer: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
