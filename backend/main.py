from fastapi import FastAPI

from database.database import engine
from database.database import Base

from models.plan import Plan
from models.company import Company
from models.collaborator import Collaborator

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Kainex IA API 🚀"
    }