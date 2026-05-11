from __future__ import annotations

from datetime import datetime
from io import BytesIO
from pathlib import Path
import hashlib
import json
import re
from typing import List


BACKEND_ROOT = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = BACKEND_ROOT / "uploads" / "knowledge"


def normalize_text(text: str) -> str:
    return re.sub(r"\r\n?", "\n", text).strip()


def chunk_text(text: str, max_chars: int = 1200, overlap: int = 150) -> List[str]:
    clean_text = normalize_text(text)
    if not clean_text:
        return []

    chunks: List[str] = []
    start = 0
    total = len(clean_text)

    while start < total:
        end = min(total, start + max_chars)
        if end < total:
            preferred_break = clean_text.rfind("\n\n", start, end)
            if preferred_break == -1 or preferred_break <= start + (max_chars // 2):
                preferred_break = clean_text.rfind(" ", start, end)
            if preferred_break != -1 and preferred_break > start:
                end = preferred_break

        chunk = clean_text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= total:
            break

        next_start = end - overlap if overlap > 0 else end
        if next_start <= start:
            next_start = end
        start = next_start

    return chunks


def generate_embedding_stub(text: str, dimensions: int = 12) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    vector = []
    for index in range(0, dimensions * 4, 4):
        raw_value = int.from_bytes(digest[index:index + 4], "big")
        vector.append(round(raw_value / 4294967295, 6))
    return json.dumps(vector)


def safe_filename(filename: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "_", filename or "upload.txt")
    return cleaned.strip("._") or f"upload_{datetime.utcnow().timestamp():.0f}.txt"


def save_upload(company_id: int, filename: str, raw_bytes: bytes) -> str:
    company_folder = UPLOAD_ROOT / str(company_id)
    company_folder.mkdir(parents=True, exist_ok=True)

    stamped_name = f"{datetime.utcnow():%Y%m%d%H%M%S}_{safe_filename(filename)}"
    file_path = company_folder / stamped_name
    file_path.write_bytes(raw_bytes)
    return str(file_path.relative_to(BACKEND_ROOT).as_posix())


def extract_text_from_upload(filename: str, raw_bytes: bytes) -> str:
    lower_name = (filename or "").lower()
    if lower_name.endswith(".pdf"):
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise RuntimeError("PDF upload requires the 'pypdf' package") from exc

        reader = PdfReader(BytesIO(raw_bytes))
        pages = [(page.extract_text() or "") for page in reader.pages]
        return normalize_text("\n".join(pages))

    return raw_bytes.decode("utf-8", errors="ignore").strip()
