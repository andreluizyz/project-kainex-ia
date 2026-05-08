from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database.database import SessionLocal
from models.company import Company
from models.collaborator import Collaborator
from schemas.company_schema import CompanyCreate, CompanyRead
from schemas.auth_schema import LoginSchema, Token
from core import security

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register/company", response_model=CompanyRead)
def register_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    existing = db.query(Company).filter(Company.email_company == payload.email_company).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    company = Company(
        name_company=payload.name_company,
        email_company=payload.email_company,
        password_hash=security.get_password_hash(payload.password),
        plan_id=payload.plan_id
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.post("/login/company", response_model=Token)
def login_company(payload: LoginSchema, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.email_company == payload.email).first()
    if not company:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not security.verify_password(payload.password, company.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = security.create_access_token({"sub": str(company.id), "role": "company"}, expires_delta=timedelta(days=7))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login/collaborator", response_model=Token)
def login_collaborator(payload: LoginSchema, db: Session = Depends(get_db)):
    collab = db.query(Collaborator).filter(Collaborator.email_collaborator == payload.email).first()
    if not collab:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not security.verify_password(payload.password, collab.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = security.create_access_token({"sub": str(collab.id), "role": "collaborator", "company_id": collab.company_id}, expires_delta=timedelta(days=7))
    return {"access_token": token, "token_type": "bearer"}
