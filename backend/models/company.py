from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey

from sqlalchemy.orm import relationship

from datetime import datetime

from database.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    name_company = Column(String, nullable=False)

    email_company = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(String, nullable=False)

    plan_id = Column(
        Integer,
        ForeignKey("plans.id")
    )

    status = Column(Boolean, default=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    plan = relationship("Plan")