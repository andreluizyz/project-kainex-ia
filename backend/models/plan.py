from sqlalchemy import Column, Integer, String, Float

from database.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)

    name_plan = Column(String, nullable=False)

    max_collaborators = Column(Integer)

    max_storage_mb = Column(Integer)

    max_tokens_per_month = Column(Integer)

    price = Column(Float)