from __future__ import annotations

from collections import Counter
from datetime import datetime
import json
from typing import Iterable
from urllib import error, request

from sqlalchemy.orm import Session

from core.config import LLM_API_URL, LLM_MAX_CONTEXT_CHUNKS, LLM_MAX_HISTORY_MESSAGES, LLM_MODEL, LLM_TIMEOUT_SECONDS
from models.chat import Chat as ChatModel
from models.chunk import Chunk as ChunkModel
from models.company import Company as CompanyModel
from models.knowledge import Knowledge as KnowledgeModel
from models.session import Session as SessionModel


SYSTEM_PROMPT = (
    "You are Kainex IA, an enterprise assistant. "
    "Answer only with information related to the company context, products, support, and training content provided. "
    "If the answer is not in the context, say that you do not have enough information and suggest asking the company team."
)


def _tokenize(text: str) -> set[str]:
    return {word.strip(".,:;!?()[]{}\"'`).-_").lower() for word in text.split() if len(word.strip()) > 2}


def _score_chunk(query_text: str, chunk_text: str) -> int:
    query_tokens = _tokenize(query_text)
    if not query_tokens:
        return 0
    chunk_tokens = _tokenize(chunk_text)
    if not chunk_tokens:
        return 0
    return len(query_tokens & chunk_tokens)


def get_recent_history(db: Session, session_id: int, limit: int = LLM_MAX_HISTORY_MESSAGES) -> list[ChatModel]:
    return (
        db.query(ChatModel)
        .filter(ChatModel.session_id == session_id)
        .order_by(ChatModel.created_at.desc())
        .limit(limit)
        .all()[::-1]
    )


def get_relevant_chunks(db: Session, company_id: int, query_text: str, limit: int = LLM_MAX_CONTEXT_CHUNKS) -> list[tuple[str, str]]:
    rows = (
        db.query(KnowledgeModel.title, ChunkModel.chunk_text)
        .join(ChunkModel, ChunkModel.knowledge_id == KnowledgeModel.id)
        .filter(KnowledgeModel.company_id == company_id)
        .all()
    )

    scored_rows: list[tuple[int, str, str]] = []
    for title, chunk_text in rows:
        score = _score_chunk(query_text, chunk_text)
        if score > 0:
            scored_rows.append((score, title or "Untitled", chunk_text))

    scored_rows.sort(key=lambda item: item[0], reverse=True)
    return [(title, chunk_text) for _, title, chunk_text in scored_rows[:limit]]


def build_prompt(*, company_name: str, user_message: str, history: Iterable[ChatModel], relevant_chunks: list[tuple[str, str]]) -> str:
    history_lines = []
    for chat in history:
        role = "User" if chat.role.lower().startswith("collaborator") else "Assistant"
        history_lines.append(f"{role}: {chat.message}")

    knowledge_lines = []
    for title, chunk_text in relevant_chunks:
        knowledge_lines.append(f"[{title}] {chunk_text}")

    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"Company: {company_name}\n\n"
        f"Relevant knowledge snippets:\n{chr(10).join(knowledge_lines) if knowledge_lines else 'No knowledge snippets matched the current message.'}\n\n"
        f"Recent conversation:\n{chr(10).join(history_lines) if history_lines else 'No previous messages.'}\n\n"
        f"User message: {user_message}\n\n"
        "Write a concise, helpful response in the same language as the user."
    )


def generate_reply(*, prompt: str) -> str:
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        LLM_API_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=LLM_TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8")
        result = json.loads(body)
        reply = (result.get("response") or "").strip()
        if reply:
            return reply
    except (error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
        pass

    return (
        "I could not reach the local LLM service at the moment. "
        "Make sure Ollama is running and the model is available."
    )


def create_ai_response(db: Session, session: SessionModel, user_message: str) -> ChatModel:
    company = db.query(CompanyModel).filter(CompanyModel.id == session.company_id).first()
    company_name = company.name_company if company else f"Company #{session.company_id}"
    history = get_recent_history(db, session.id)
    relevant_chunks = get_relevant_chunks(db, session.company_id, user_message)
    prompt = build_prompt(
        company_name=company_name,
        user_message=user_message,
        history=history,
        relevant_chunks=relevant_chunks,
    )
    reply_text = generate_reply(prompt=prompt)

    ai_chat = ChatModel(
        session_id=session.id,
        role="Kainex",
        message=reply_text,
        created_at=datetime.utcnow(),
    )
    db.add(ai_chat)
    db.commit()
    db.refresh(ai_chat)
    return ai_chat
