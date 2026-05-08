from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_company, get_current_collaborator
from models.knowledge import Knowledge as KnowledgeModel
from models.chunk import Chunk as ChunkModel
from schemas.knowledge_schema import KnowledgeRead, KnowledgeUploadResponse
from schemas.chunk_schema import ChunkRead
from services.knowledge_service import chunk_text, extract_text_from_upload, generate_embedding_stub, save_upload

router = APIRouter()


def _store_knowledge(
    *,
    db: Session,
    company_id: int,
    collaborator_id: int | None,
    source_type: str,
    title: str | None,
    content_text: str,
    file_url: str | None,
):
    knowledge = KnowledgeModel(
        company_id=company_id,
        collaborator_id=collaborator_id,
        source_type=source_type,
        title=title,
        content_text=content_text,
        file_url=file_url,
    )
    db.add(knowledge)
    db.flush()

    chunks = chunk_text(content_text)
    for chunk_index, chunk_text_value in enumerate(chunks):
        db.add(
            ChunkModel(
                knowledge_id=knowledge.id,
                chunk_text=chunk_text_value,
                embedding_vector=generate_embedding_stub(chunk_text_value),
                chunk_index=chunk_index,
            )
        )

    db.commit()
    db.refresh(knowledge)
    return knowledge, len(chunks)


@router.post("/company/upload", response_model=KnowledgeUploadResponse)
async def upload_knowledge_as_company(
    company=Depends(get_current_company),
    db: Session = Depends(get_db),
    title: str | None = Form(default=None),
    source_type: str = Form(default="text"),
    content_text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    raw_content = content_text
    file_url = None

    if file is not None:
        raw_bytes = await file.read()
        raw_content = extract_text_from_upload(file.filename or "upload.txt", raw_bytes)
        file_url = save_upload(company.id, file.filename or "upload.txt", raw_bytes)
        if source_type == "text":
            source_type = (file.filename or "upload.txt").rsplit(".", 1)[-1].lower()

    if not raw_content or not raw_content.strip():
        raise HTTPException(status_code=400, detail="Provide file or content_text")

    knowledge, chunk_count = _store_knowledge(
        db=db,
        company_id=company.id,
        collaborator_id=None,
        source_type=source_type,
        title=title,
        content_text=raw_content,
        file_url=file_url,
    )
    return {**knowledge.__dict__, "chunk_count": chunk_count}


@router.post("/collaborator/upload", response_model=KnowledgeUploadResponse)
async def upload_knowledge_as_collaborator(
    collaborator=Depends(get_current_collaborator),
    db: Session = Depends(get_db),
    title: str | None = Form(default=None),
    source_type: str = Form(default="text"),
    content_text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    raw_content = content_text
    file_url = None

    if file is not None:
        raw_bytes = await file.read()
        raw_content = extract_text_from_upload(file.filename or "upload.txt", raw_bytes)
        file_url = save_upload(collaborator.company_id, file.filename or "upload.txt", raw_bytes)
        if source_type == "text":
            source_type = (file.filename or "upload.txt").rsplit(".", 1)[-1].lower()

    if not raw_content or not raw_content.strip():
        raise HTTPException(status_code=400, detail="Provide file or content_text")

    knowledge, chunk_count = _store_knowledge(
        db=db,
        company_id=collaborator.company_id,
        collaborator_id=collaborator.id,
        source_type=source_type,
        title=title,
        content_text=raw_content,
        file_url=file_url,
    )
    return {**knowledge.__dict__, "chunk_count": chunk_count}


@router.get("/company", response_model=list[KnowledgeRead])
def list_company_knowledge(company=Depends(get_current_company), db: Session = Depends(get_db)):
    return db.query(KnowledgeModel).filter(KnowledgeModel.company_id == company.id).order_by(KnowledgeModel.created_at.desc()).all()


@router.get("/collaborator", response_model=list[KnowledgeRead])
def list_collaborator_knowledge(collaborator=Depends(get_current_collaborator), db: Session = Depends(get_db)):
    return db.query(KnowledgeModel).filter(KnowledgeModel.company_id == collaborator.company_id).order_by(KnowledgeModel.created_at.desc()).all()


@router.get("/{knowledge_id}/chunks", response_model=list[ChunkRead])
def list_knowledge_chunks(
    knowledge_id: int,
    company=Depends(get_current_company),
    db: Session = Depends(get_db),
):
    knowledge = db.query(KnowledgeModel).filter(KnowledgeModel.id == knowledge_id, KnowledgeModel.company_id == company.id).first()
    if not knowledge:
        raise HTTPException(status_code=404, detail="Knowledge not found")

    return db.query(ChunkModel).filter(ChunkModel.knowledge_id == knowledge_id).order_by(ChunkModel.chunk_index.asc()).all()
