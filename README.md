# Kainex IA

## English

### Overview

Kainex IA is an enterprise AI platform where each company has its own isolated workspace.
Companies can register, create collaborators, upload knowledge, open chat sessions, and let collaborators interact with the AI inside company context.

### Current Status

- Backend API implemented with authentication and protected routes.
- Frontend implemented with purple theme, login/register screen, company dashboard, and collaborator workspace.
- Alembic configured and migrations enabled.

### Implemented Features

- Company registration and login.
- Collaborator login.
- JWT authentication and role-based access (`company` and `collaborator`).
- Company panel:
	- create/list collaborators
	- create/list sessions
	- upload/list knowledge
- Collaborator panel:
	- list sessions
	- send/read chat messages
	- upload/list knowledge
- Knowledge chunking pipeline with embedding stub.

### Tech Stack

Backend:
- FastAPI
- SQLAlchemy
- Alembic
- SQLite (default)
- Passlib + Argon2
- JWT (`python-jose`)
- Pydantic v2

Frontend:
- React + Vite
- Tailwind CSS

### Run Locally

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

Create `backend/.env`:

```env
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
LLM_API_URL=http://localhost:11434/api/generate
LLM_MODEL=llama3
LLM_TIMEOUT_SECONDS=120
```

Local LLM requirement:

```bash
# Install and run Ollama, then pull the model
ollama pull llama3
ollama serve
```

The chat endpoint uses the local Ollama API at `http://localhost:11434/api/generate`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### API Quick Reference

Auth:
- `POST /auth/register/company`
- `POST /auth/login/company` (JSON)
- `POST /auth/login/collaborator` (JSON)
- `POST /auth/token/company` (OAuth2 form)
- `POST /auth/token/collaborator` (OAuth2 form)

Company:
- `GET /company/collaborators`
- `POST /company/collaborators`

Sessions:
- `GET /sessions/`
- `POST /sessions/`
- `GET /sessions/me`

Chat:
- `POST /chat/sessions/{session_id}/messages`
- `GET /chat/sessions/{session_id}/messages`
- `GET /chat/company/sessions/{session_id}/messages`

Knowledge:
- `POST /knowledge/company/upload`
- `POST /knowledge/collaborator/upload`
- `GET /knowledge/company`
- `GET /knowledge/collaborator`
- `GET /knowledge/{knowledge_id}/chunks`

### Auth Flow

1. Register a company.
2. Login with company or collaborator endpoint.
3. Use the returned token as `Bearer <token>`.

### Next Steps

- Integrate a real LLM provider.
- Replace embedding stub with real vector embeddings.
- Add plan limit enforcement (`max_collaborators`, storage, tokens).
- Add tests (unit + integration).
- Add Docker and CI/CD.

---

## Português

### Visão Geral

Kainex IA é uma plataforma de IA empresarial onde cada empresa possui um workspace isolado.
As empresas podem se cadastrar, criar colaboradores, subir conhecimento, abrir sessões de chat e permitir que colaboradores conversem com a IA no contexto da empresa.

### Status Atual

- API backend implementada com autenticação e rotas protegidas.
- Frontend implementado com tema roxo, tela de login/cadastro, painel da empresa e workspace do colaborador.
- Alembic configurado e migrações habilitadas.

### Funcionalidades Implementadas

- Cadastro e login de empresa.
- Login de colaborador.
- Autenticação JWT e acesso por perfil (`company` e `collaborator`).
- Painel da empresa:
	- criar/listar colaboradores
	- criar/listar sessões
	- subir/listar base de conhecimento
- Painel do colaborador:
	- listar sessões
	- enviar/ler mensagens de chat
	- subir/listar conhecimento
- Pipeline de chunking da base de conhecimento com embedding stub.

### Stack de Tecnologia

Backend:
- FastAPI
- SQLAlchemy
- Alembic
- SQLite (padrão)
- Passlib + Argon2
- JWT (`python-jose`)
- Pydantic v2

Frontend:
- React + Vite
- Tailwind CSS

### Como Rodar Localmente

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

Crie `backend/.env`:

```env
SECRET_KEY=sua_secret_key_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
LLM_API_URL=http://localhost:11434/api/generate
LLM_MODEL=llama3
LLM_TIMEOUT_SECONDS=120
```

Requisito do LLM local:

```bash
# Instale e inicie o Ollama, depois baixe o modelo
ollama pull llama3
ollama serve
```

A rota de chat usa a API local do Ollama em `http://localhost:11434/api/generate`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Referência Rápida da API

Auth:
- `POST /auth/register/company`
- `POST /auth/login/company` (JSON)
- `POST /auth/login/collaborator` (JSON)
- `POST /auth/token/company` (OAuth2 form)
- `POST /auth/token/collaborator` (OAuth2 form)

Empresa:
- `GET /company/collaborators`
- `POST /company/collaborators`

Sessões:
- `GET /sessions/`
- `POST /sessions/`
- `GET /sessions/me`

Chat:
- `POST /chat/sessions/{session_id}/messages`
- `GET /chat/sessions/{session_id}/messages`
- `GET /chat/company/sessions/{session_id}/messages`

Conhecimento:
- `POST /knowledge/company/upload`
- `POST /knowledge/collaborator/upload`
- `GET /knowledge/company`
- `GET /knowledge/collaborator`
- `GET /knowledge/{knowledge_id}/chunks`

### Fluxo de Autenticação

1. Cadastre uma empresa.
2. Faça login com endpoint de empresa ou colaborador.
3. Use o token retornado como `Bearer <token>`.

### Próximos Passos

- Integrar provedor LLM real.
- Substituir embedding stub por embeddings reais.
- Adicionar validação de limites do plano (`max_collaborators`, storage, tokens).
- Adicionar testes (unitários + integração).
- Adicionar Docker e CI/CD.