from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from database.database import Base


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)

    knowledge_id = Column(Integer, ForeignKey("knowledges.id"), nullable=False)

    chunk_text = Column(Text, nullable=False)

    embedding_vector = Column(Text, nullable=True)  # store as JSON/text serialised vector

    chunk_index = Column(Integer, nullable=False)

    knowledge = relationship("Knowledge")
