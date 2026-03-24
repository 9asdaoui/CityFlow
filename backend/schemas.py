from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .models import UserRole

# --- User Schemas --- #
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.operator

class UserResponse(UserBase):
    id: int
    role: UserRole
    model_config = ConfigDict(from_attributes=True)

# --- Auth Schemas --- #
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Prediction Schema Additions --- #
# We already have PredictionInput and PredictionOutput in app.py,
# but we might want DB-related schemas later if we persist predictions.
class PredictionCreate(BaseModel):
    predicted_score: float

class PredictionResponse(PredictionCreate):
    id: int
    timestamp: datetime
    actual_score: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

# --- ChatLog Schemas --- #
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
