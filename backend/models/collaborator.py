from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey

from sqlalchemy.orm import relationship

from datetime import datetime

from database.database import Base


class Collaborator(Base):
    __tablename__ = "collaborators"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer,
        ForeignKey("companies.id")
    )

    name_collaborator = Column(
        String,
        nullable=False
    )

    email_collaborator = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="viewer"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    company = relationship("Company")