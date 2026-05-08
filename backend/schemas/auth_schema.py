from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
	access_token: str
	token_type: str


class TokenData(BaseModel):
	sub: Optional[str] = None
	role: Optional[str] = None


class LoginSchema(BaseModel):
	email: EmailStr
	password: str


