from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CompanyBase(BaseModel):
	name_company: str
	email_company: EmailStr
	plan_id: Optional[int] = None


class CompanyCreate(CompanyBase):
	password: str


class CompanyRead(CompanyBase):
	id: int
	status: Optional[bool]
	created_at: Optional[datetime]

	class Config:
		from_attributes = True
