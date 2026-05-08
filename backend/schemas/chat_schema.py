from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatBase(BaseModel):
    session_id: int
    role: str
    message: str


class ChatCreate(ChatBase):
    pass


class ChatRead(ChatBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
