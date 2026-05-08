from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from database.database import Base


class Knowledge(Base):
    __tablename__ = "knowledges"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    collaborator_id = Column(Integer, ForeignKey("collaborators.id"), nullable=True)

    source_type = Column(String, nullable=False)  # pdf, excel, word, chat, etc.

    title = Column(String, nullable=True)

    content_text = Column(Text, nullable=True)

    file_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    collaborator = relationship("Collaborator")
