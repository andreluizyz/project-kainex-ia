from pydantic import BaseModel
from typing import Optional


class ChunkBase(BaseModel):
    knowledge_id: int
    chunk_text: str
    embedding_vector: Optional[str] = None
    chunk_index: int


class ChunkCreate(ChunkBase):
    pass


class ChunkRead(ChunkBase):
    id: int

    class Config:
        from_attributes = True
