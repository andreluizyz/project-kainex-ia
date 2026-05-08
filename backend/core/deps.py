from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database.database import SessionLocal
from core import security
from models.company import Company
from models.collaborator import Collaborator

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token/company")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_company(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Company:
    try:
        payload = security.decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    sub = payload.get("sub")
    role = payload.get("role")
    if not sub or role != "company":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or role")

    company = db.query(Company).filter(Company.id == int(sub)).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Company not found")
    return company


def get_current_collaborator(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Collaborator:
    try:
        payload = security.decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    sub = payload.get("sub")
    role = payload.get("role")
    if not sub or role != "collaborator":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or role")

    collab = db.query(Collaborator).filter(Collaborator.id == int(sub)).first()
    if not collab:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Collaborator not found")
    return collab
