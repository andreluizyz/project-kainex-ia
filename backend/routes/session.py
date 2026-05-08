from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_company, get_current_collaborator
from models.session import Session as SessionModel
from schemas.session_schema import SessionCreate, SessionRead

router = APIRouter()


@router.post("/", response_model=SessionRead)
def create_session(payload: SessionCreate, company=Depends(get_current_company), db: Session = Depends(get_db)):
    session = SessionModel(
        company_id=company.id,
        collaborator_id=payload.collaborator_id,
        title=payload.title
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=list[SessionRead])
def list_sessions(company=Depends(get_current_company), db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).filter(SessionModel.company_id == company.id).all()
    return sessions


@router.get("/me", response_model=list[SessionRead])
def list_my_sessions(collaborator=Depends(get_current_collaborator), db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).filter(SessionModel.company_id == collaborator.company_id).all()
    return sessions
