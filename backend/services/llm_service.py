from __future__ import annotations

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
    "Answer only with information explicitly present in the provided company context, knowledge snippets, and recent conversation. "
    "Do not use outside knowledge about the company name, brand names, bands, products, portals, or services unless they appear in the prompt context. "
    "Never invent portals, products, support channels, websites, policies, or materials. "
    "If the user asks for suggestions, improvements, rewrites, naming ideas, or other assistance that can be inferred from the context, be proactive and provide helpful options instead of refusing. "
    "For requests about company names, branding, improvements, slogans, or brainstorming, give concrete alternatives directly, not a generic disclaimer. "
    "Avoid repeating the same idea in different words. Prefer short, useful answers with 3 to 7 distinct options or actions. "
    "If you give suggestions, make each one meaningfully different. "
    "Clearly separate facts from suggestions: facts must come only from the provided context, while suggestions may be framed as recommendations based on the company's positioning or the user's request. "
    "If the answer is not explicitly supported by the context and no useful suggestion can be made, say that you do not have enough information and ask the user to provide more company data."
)

PORTUGUESE_HINT_WORDS = {
    "nao",
    "não",
    "sim",
    "qual",
    "quais",
    "que",
    "proposito",
    "propósito",
    "missao",
    "missão",
    "obrigado",
    "obrigada",
    "empresa",
    "colaborador",
    "colaboradora",
    "sessao",
    "sessão",
    "mensagem",
    "resposta",
    "ajuda",
    "como",
    "quero",
    "preciso",
    "voce",
    "você",
    "por",
    "favor",
    "de",
    "para",
}

ENGLISH_HINT_WORDS = {
    "yes",
    "no",
    "what",
    "which",
    "purpose",
    "mission",
    "thanks",
    "thank",
    "company",
    "collaborator",
    "session",
    "message",
    "reply",
    "help",
    "how",
    "need",
    "want",
    "please",
    "for",
    "with",
    "from",
    "about",
}


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


def detect_message_language(text: str, fallback_language: str = "en") -> str:
    lowered = text.lower()
    # Portuguese commonly carries diacritics that are strong language hints.
    if any(char in lowered for char in "ãáàâéêíóôõúç"):
        return "pt-BR"

    tokens = _tokenize(text)
    if not tokens:
        return fallback_language

    pt_score = len(tokens & PORTUGUESE_HINT_WORDS)
    en_score = len(tokens & ENGLISH_HINT_WORDS)

    if pt_score > en_score:
        return "pt-BR"
    if en_score > pt_score:
        return "en"
    return fallback_language


def get_last_collaborator_language(history: Iterable[ChatModel]) -> str | None:
    for chat in reversed(list(history)):
        if chat.role.lower().startswith("collaborator") and chat.message:
            detected = detect_message_language(chat.message, fallback_language="")
            if detected:
                return detected
    return None


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


def build_prompt(
    *,
    company_name: str,
    user_message: str,
    history: Iterable[ChatModel],
    relevant_chunks: list[tuple[str, str]],
    response_language: str,
) -> str:
    history_lines = []
    for chat in history:
        role = "User" if chat.role.lower().startswith("collaborator") else "Assistant"
        history_lines.append(f"{role}: {chat.message}")

    knowledge_lines = []
    for title, chunk_text in relevant_chunks:
        knowledge_lines.append(f"[{title}] {chunk_text}")

    return (
        f"{SYSTEM_PROMPT}\n\n"
        "The conversation may contain multiple languages; always interpret all history and knowledge regardless of language. "
        "When the user asks for suggestions or improvements, do not refuse just because the company context is limited; provide the best practical help you can from the available information. "
        "For naming or improvement requests, answer in a chatty but concise style, like a helpful consultant, and do not mention limitations unless they truly block any useful answer. "
        "Never repeat the same sentence or the same excuse twice in one response. "
        "When suggesting company names or improvements, format the response in clear topics with a short heading and bullet points. "
        "Use a pattern like: 'Sugestões de nome:' followed by a list of distinct options, each on its own line. "
        "If helpful, add a short reason after each option. "
        f"Your response must be written only in: {response_language}.\n\n"
        f"Company: {company_name}\n\n"
        f"Relevant knowledge snippets:\n{chr(10).join(knowledge_lines) if knowledge_lines else 'No knowledge snippets matched the current message.'}\n\n"
        f"Recent conversation:\n{chr(10).join(history_lines) if history_lines else 'No previous messages.'}\n\n"
        f"User message: {user_message}\n\n"
        "Write a concise, helpful response in the target response language defined above. "
        "If the user asked for naming ideas, improvements, or brainstorming, return a short list of distinct suggestions grouped in topics with bullets. "
        "If the context does not support a direct answer and no suggestion is possible, respond that you do not have enough information."
    )


def generate_reply(*, prompt: str, response_language: str) -> str:
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

    if response_language == "pt-BR":
        return (
            "Nao consegui acessar o servico local de LLM agora. "
            "Verifique se o Ollama esta em execucao e se o modelo esta disponivel."
        )

    return (
        "I could not reach the local LLM service at the moment. "
        "Make sure Ollama is running and the model is available."
    )


def create_ai_response(db: Session, session: SessionModel, user_message: str) -> ChatModel:
    company = db.query(CompanyModel).filter(CompanyModel.id == session.company_id).first()
    company_name = company.name_company if company else f"Company #{session.company_id}"
    history = get_recent_history(db, session.id)
    fallback_language = get_last_collaborator_language(history) or "pt-BR"
    response_language = detect_message_language(user_message, fallback_language=fallback_language)
    relevant_chunks = get_relevant_chunks(db, session.company_id, user_message)
    prompt = build_prompt(
        company_name=company_name,
        user_message=user_message,
        history=history,
        relevant_chunks=relevant_chunks,
        response_language=response_language,
    )
    reply_text = generate_reply(prompt=prompt, response_language=response_language)

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
