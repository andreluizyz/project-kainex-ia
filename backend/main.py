from fastapi import FastAPI

from database.database import engine
from database.database import Base

from models.plan import Plan
from models.company import Company
from models.collaborator import Collaborator
from models.session import Session
from models.chat import Chat
from models.knowledge import Knowledge
from models.chunk import Chunk
from routes import auth as auth_routes
from routes import company as company_routes
from routes import session as session_routes
from routes import chat as chat_routes
from routes import knowledge as knowledge_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(company_routes.router, prefix="/company", tags=["company"])
app.include_router(session_routes.router, prefix="/sessions", tags=["sessions"])
app.include_router(chat_routes.router, prefix="/chat", tags=["chat"])
app.include_router(knowledge_routes.router, prefix="/knowledge", tags=["knowledge"])


@app.get("/")
def home():
    return {"message": "Kainex IA API 🚀"}