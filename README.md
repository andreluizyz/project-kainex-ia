# Kainex IA 🚀

## English

### Project Overview

**Kainex IA** is an enterprise AI system that enables companies to train and deploy custom AI models focused on their specific products, services, and internal processes. The platform allows companies to manage collaborators, maintain a knowledge base, and enable AI-powered chat sessions where the AI learns from company-specific data.

### Key Features

✅ **Multi-tenant Architecture** — Isolated data per company  
✅ **Authentication & Authorization** — JWT-based auth for companies and collaborators  
✅ **Knowledge Base Management** — Upload documents (PDF, TXT, DOCX) and auto-chunking  
✅ **AI Chat Sessions** — Collaborators chat with AI trained on company data  
✅ **Collaborator Management** — Create and manage team members with role-based access  
✅ **Plan/Subscription Model** — Tiers with limits (collaborators, storage, tokens)  
✅ **Session History** — Track all chat interactions and learning sessions  
✅ **Embedding & Chunking** — Automatic document processing and vector storage stubs  

### Tech Stack

**Backend:**
- FastAPI (Python 3.10+)
- SQLAlchemy ORM
- SQLite (development) / PostgreSQL (production-ready)
- Alembic (migrations)
- JWT (security)
- Pydantic v2 (validation)

**Frontend:**
- React 18+
- Vite
- TypeScript (ready)
- CSS/Tailwind (extensible)

### Database Schema

**Plans** — Subscription tiers  
**Companies** — Tenant organizations  
**Collaborators** — Team members  
**Sessions** — Chat sessions  
**Chats** — Messages in sessions  
**Knowledges** — Documents/data  
**Chunks** — Text segments with embeddings  

### Setup & Installation

#### Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "SECRET_KEY=your_generated_secret_key_here" > .env
echo "ALGORITHM=HS256" >> .env
echo "ACCESS_TOKEN_EXPIRE_MINUTES=10080" >> .env

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

API runs at `http://127.0.0.1:8000`

#### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

### API Endpoints (Quick Reference)

**Auth:** POST /auth/token/company | /auth/token/collaborator  
**Company:** GET/POST /company/collaborators  
**Sessions:** GET/POST /sessions/  
**Chat:** POST/GET /chat/sessions/{id}/messages  
**Knowledge:** POST /knowledge/company/upload | GET /knowledge/company  

### Authentication Flow

1. Register: `POST /auth/register/company`
2. Login: `POST /auth/token/company` (username: email, password: pwd)
3. Use token: `Authorization: Bearer <token>`

### Future Enhancements

- [ ] Frontend UI (login, dashboard, chat)
- [ ] Real AI model integration
- [ ] WebSocket for real-time chat
- [ ] Document parsing (PDF, DOCX, XLSX)
- [ ] Vector database integration
- [ ] RBAC & audit logging
- [ ] Docker & CI/CD

---

## Português

### Visão Geral do Projeto

**Kainex IA** é um sistema de IA empresarial que permite que empresas treinem e implantem modelos de IA personalizados focados em seus produtos, serviços e processos internos. A plataforma permite que empresas gerenciem colaboradores, mantenham uma base de conhecimento e habilitam sessões de chat alimentadas por IA onde o modelo aprende com dados específicos da empresa.

### Recursos Principais

✅ **Arquitetura Multi-tenant** — Dados isolados por empresa  
✅ **Autenticação e Autorização** — Auth baseado em JWT para empresas e colaboradores  
✅ **Gestão de Base de Conhecimento** — Upload de documentos (PDF, TXT, DOCX) com chunking automático  
✅ **Sessões de Chat com IA** — Colaboradores conversam com IA treinada em dados da empresa  
✅ **Gestão de Colaboradores** — Criar e gerenciar membros da equipe com controle de acesso  
✅ **Modelo de Plano/Assinatura** — Camadas com limites (colaboradores, armazenamento, tokens)  
✅ **Histórico de Sessões** — Rastreie todas as interações e sessões de aprendizado  
✅ **Embedding e Chunking** — Processamento automático de documentos e armazenamento de vetores  

### Stack de Tecnologia

**Backend:**
- FastAPI (Python 3.10+)
- SQLAlchemy ORM
- SQLite (desenvolvimento) / PostgreSQL (pronto para produção)
- Alembic (migrações)
- JWT (segurança)
- Pydantic v2 (validação)

**Frontend:**
- React 18+
- Vite
- TypeScript (pronto)
- CSS/Tailwind (extensível)

### Schema do Banco de Dados

**Planos** — Camadas de assinatura  
**Empresas** — Organizações tenants  
**Colaboradores** — Membros da equipe  
**Sessões** — Sessões de chat  
**Chats** — Mensagens nas sessões  
**Conhecimentos** — Documentos/dados  
**Chunks** — Segmentos de texto com embeddings  

### Configuração e Instalação

#### Backend

```bash
# Navegue até backend
cd backend

# Crie ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instale dependências
pip install -r requirements.txt

# Crie arquivo .env
echo "SECRET_KEY=sua_chave_secreta_aqui" > .env
echo "ALGORITHM=HS256" >> .env
echo "ACCESS_TOKEN_EXPIRE_MINUTES=10080" >> .env

# Execute migrações
alembic upgrade head

# Inicie o servidor
uvicorn main:app --reload
```

API executa em `http://127.0.0.1:8000`

#### Frontend

```bash
# Navegue até frontend
cd frontend

# Instale dependências
npm install

# Inicie servidor de desenvolvimento
npm run dev
```

Frontend executa em `http://localhost:5173`

### Endpoints da API (Referência Rápida)

**Auth:** POST /auth/token/company | /auth/token/collaborator  
**Empresa:** GET/POST /company/collaborators  
**Sessões:** GET/POST /sessions/  
**Chat:** POST/GET /chat/sessions/{id}/messages  
**Conhecimento:** POST /knowledge/company/upload | GET /knowledge/company  

### Fluxo de Autenticação

1. Registrar: `POST /auth/register/company`
2. Login: `POST /auth/token/company` (username: email, password: pwd)
3. Use token: `Authorization: Bearer <token>`

### Próximas Melhorias

- [ ] UI do frontend (login, painel, chat)
- [ ] Integração com modelo de IA real
- [ ] WebSocket para chat em tempo real
- [ ] Parser de documentos (PDF, DOCX, XLSX)
- [ ] Integração com banco de dados vetorial
- [ ] RBAC & log de auditoria
- [ ] Docker & CI/CD