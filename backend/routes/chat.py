from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_collaborator, get_current_company
from models.chat import Chat as ChatModel
from models.session import Session as SessionModel
from schemas.chat_schema import ChatCreate, ChatRead

router = APIRouter()


@router.post("/sessions/{session_id}/messages", response_model=ChatRead)
def post_message(session_id: int, payload: ChatCreate, collaborator=Depends(get_current_collaborator), db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess or sess.company_id != collaborator.company_id:
        raise HTTPException(status_code=404, detail="Session not found")

    chat = ChatModel(session_id=session_id, role=payload.role, message=payload.message)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/sessions/{session_id}/messages", response_model=list[ChatRead])
def get_messages_session_as_collaborator(session_id: int, collaborator=Depends(get_current_collaborator), db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess or sess.company_id != collaborator.company_id:
        raise HTTPException(status_code=404, detail="Session not found")
    msgs = db.query(ChatModel).filter(ChatModel.session_id == session_id).order_by(ChatModel.created_at.asc()).all()
    return msgs


@router.get("/company/sessions/{session_id}/messages", response_model=list[ChatRead])
def get_messages_session_as_company(session_id: int, company=Depends(get_current_company), db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id, SessionModel.company_id == company.id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    msgs = db.query(ChatModel).filter(ChatModel.session_id == session_id).order_by(ChatModel.created_at.asc()).all()
    return msgs
