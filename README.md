# Kainex IA

Kainex IA is an enterprise AI platform built around isolated workspaces for each company. The goal of the project was to create a system where a company can register collaborators, manage sessions, upload its own knowledge base, and talk to an AI that stays inside the context of that business.

The backend is built with FastAPI and SQLAlchemy, while the frontend uses React and Vite. The chat runs through a local Ollama model, so the experience does not depend on a third-party AI provider.

## What the project does

- company registration and login
- collaborator login
- JWT authentication
- role-protected routes
- company dashboard for:
  - creating and listing collaborators
  - creating and listing sessions
  - uploading and listing knowledge
- collaborator workspace for:
  - browsing available sessions
  - chatting with the AI
  - uploading knowledge
- file uploads, including PDF files
- knowledge chunking to help the AI answer with better context
- light/dark theme switch
- PT-BR and English interface switch
- loading feedback in the chat so it does not feel frozen

## Project structure

### Backend

The backend is responsible for:

- authentication and authorization
- company and collaborator management
- session management
- chat history storage
- knowledge upload and text extraction
- knowledge chunk generation
- local LLM integration through Ollama

Main stack:

- FastAPI
- SQLAlchemy
- Alembic
- SQLite as the default database
- Passlib + Argon2 for password hashing
- JWT with `python-jose`
- Pydantic v2

### Frontend

The frontend is responsible for:

- login and registration screens
- company dashboard
- collaborator workspace
- chat UI
- language toggle
- theme toggle
- loading states and small interaction details

Main stack:

- React
- Vite
- Tailwind-style utility classes and custom CSS

## Local setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### 2. Backend environment variables

Create `backend/.env` with values like these:

```env
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
LLM_API_URL=http://localhost:11434/api/generate
LLM_MODEL=llama3
LLM_TIMEOUT_SECONDS=120
```

### 3. Local LLM

The project expects Ollama to be running locally.

```bash
ollama pull llama3
ollama serve
```

The chat endpoint sends requests to:

```text
http://localhost:11434/api/generate
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Main features in detail

### Authentication

The app supports both company and collaborator authentication.

- company registration
- company login
- collaborator login
- JWT tokens for protected access
- OAuth-compatible token endpoints for Swagger and form-based login flows

### Company workspace

The company area allows the admin side to:

- create collaborators
- list collaborators
- create sessions
- view sessions
- upload company knowledge
- inspect stored chunks

### Collaborator workspace

The collaborator area allows the user to:

- choose an available session
- send messages to the AI
- read the AI answers inside the company context
- upload knowledge for the company workspace

### Knowledge handling

Uploaded content is stored and processed so the AI can use it later.

- plain text is accepted directly
- PDF uploads are supported
- files are stored inside the backend project folder
- uploaded text is split into chunks
- chunks are used as searchable context for chat replies

### Chat behavior

The chat is designed to feel like a real assistant instead of a static form.

- messages appear in the conversation history
- the chat shows a loading indicator while the AI is thinking
- responses follow the user language when possible
- the prompt keeps the assistant grounded in the company context
- creative requests such as naming or improvement suggestions are answered in a more conversational way

## API reference

### Authentication

- `POST /auth/register/company`
- `POST /auth/login/company`
- `POST /auth/login/collaborator`
- `POST /auth/token/company`
- `POST /auth/token/collaborator`

### Company

- `GET /company/collaborators`
- `POST /company/collaborators`

### Sessions

- `GET /sessions/`
- `POST /sessions/`
- `GET /sessions/me`

### Chat

- `POST /chat/sessions/{session_id}/messages`
- `GET /chat/sessions/{session_id}/messages`
- `GET /chat/company/sessions/{session_id}/messages`

### Knowledge

- `POST /knowledge/company/upload`
- `POST /knowledge/collaborator/upload`
- `GET /knowledge/company`
- `GET /knowledge/collaborator`
- `GET /knowledge/{knowledge_id}/chunks`

## What I learned while building this

- splitting the app by roles makes the whole system easier to understand and safer to protect
- JWT plus protected routes becomes much more useful once the app has more than one type of user
- chat with AI is not just “send text and wait”; context, history, and prompt quality matter a lot
- good prompting reduces generic replies and makes the assistant less likely to invent information
- file upload is more than storing bytes, because it also involves file paths, extraction, and storage decisions
- chunking knowledge helps the AI answer in a more relevant way
- the interface matters as much as the backend: loading feedback, theme, and language control change how polished the app feels
- keeping the architecture organized from the start saves time later and makes debugging easier

## Notes

- The project uses a local Ollama instance for chat.
- The backend expects the API at `http://localhost:11434/api/generate`.
- The repository is focused on a practical enterprise workflow, not on a generic demo chatbot.
