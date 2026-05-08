from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_company
from core import security
from models.collaborator import Collaborator
from schemas.collaborator_schema import CollaboratorCreate, CollaboratorRead

router = APIRouter()


@router.post("/collaborators", response_model=CollaboratorRead)
def create_collaborator(payload: CollaboratorCreate, company=Depends(get_current_company), db: Session = Depends(get_db)):
	existing = db.query(Collaborator).filter(Collaborator.email_collaborator == payload.email_collaborator).first()
	if existing:
		raise HTTPException(status_code=400, detail="Collaborator email already registered")

	collab = Collaborator(
		company_id=company.id,
		name_collaborator=payload.name_collaborator,
		email_collaborator=payload.email_collaborator,
		password_hash=security.get_password_hash(payload.password),
		role=payload.role
	)
	db.add(collab)
	db.commit()
	db.refresh(collab)
	return collab


@router.get("/collaborators", response_model=list[CollaboratorRead])
def list_collaborators(company=Depends(get_current_company), db: Session = Depends(get_db)):
	cols = db.query(Collaborator).filter(Collaborator.company_id == company.id).all()
	return cols
