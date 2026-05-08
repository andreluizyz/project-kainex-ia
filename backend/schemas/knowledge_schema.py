from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class KnowledgeBase(BaseModel):
    company_id: int
    collaborator_id: Optional[int] = None
    source_type: str
    title: Optional[str] = None
    content_text: Optional[str] = None
    file_url: Optional[str] = None


class KnowledgeCreate(KnowledgeBase):
    pass


class KnowledgeRead(KnowledgeBase):
    id: int
    collaborator_id: Optional[int] = None
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class KnowledgeUploadResponse(KnowledgeRead):
    chunk_count: int
