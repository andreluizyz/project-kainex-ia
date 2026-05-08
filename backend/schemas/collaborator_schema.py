from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CollaboratorBase(BaseModel):
    name_collaborator: str
    email_collaborator: EmailStr
    role: Optional[str] = "viewer"


class CollaboratorCreate(CollaboratorBase):
    password: str


class CollaboratorRead(CollaboratorBase):
    id: int
    company_id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
