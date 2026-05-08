from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionBase(BaseModel):
    company_id: int
    collaborator_id: Optional[int] = None
    title: Optional[str] = None


class SessionCreate(SessionBase):
    pass


class SessionRead(SessionBase):
    id: int
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
