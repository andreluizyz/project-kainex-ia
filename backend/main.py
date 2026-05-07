from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Kainex IA Backend Online 🚀"
    }