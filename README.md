# Quiz App

Full-stack quiz application built with **FastAPI**, **PostgreSQL**, **React**, **TypeScript**, **Vite** and **Tailwind CSS**.

The project is structured as a monorepo with a Python backend and a React frontend. The backend exposes quiz categories, questions, answers and answer validation endpoints. The frontend displays categories and runs a quiz flow using a question slider.

## Live Demo

### Frontend

```txt
https://quiz-app-sand.vercel.app
```

### Backend

```txt
https://quiz-app-api-gujn.onrender.com
```

### API examples

```txt
https://quiz-app-api-gujn.onrender.com/
https://quiz-app-api-gujn.onrender.com/health
https://quiz-app-api-gujn.onrender.com/quizzes/categories
```

---

## Tech Stack

### Backend

- Python
- FastAPI
- Uvicorn
- PostgreSQL
- SQLAlchemy
- Alembic
- asyncpg
- psycopg
- Pydantic Settings
- Docker Compose for local PostgreSQL

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- DOMPurify

### Deployment

- Frontend: Vercel
- Backend: Render Web Service
- Database: Neon PostgreSQL

---

## Project Structure

```txt
quiz-app/
  backend/
    alembic/
    app/
      core/
        config.py
        database.py
      quizzes/
        models.py
        routes.py
        schemas.py
      seed/
        data.py
        run.py
      users/
        models.py
      main.py
    alembic.ini
    requirements.txt
    start.sh
    .env.example

  frontend/
    scripts/
    src/
      app/
        providers/
          QueryProvider.tsx
      features/
        quizzes/
          api.ts
          types.ts
      pages/
        CategoriesPage.tsx
        QuestionsPage.tsx
        QuestionPage.tsx
      shared/
        api/
          client.ts
      App.tsx
      main.tsx
      index.css
    package.json
    vite.config.ts
    .env.example

  docker-compose.yml
  README.md
```

---

## Backend Overview

The backend is a FastAPI application.

Main application file:

```txt
backend/app/main.py
```

The application is initialized with:

```python
app = FastAPI(title=settings.app_name)
```

CORS is configured dynamically from environment variables:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Quiz routes are attached with:

```python
app.include_router(quizzes_router)
```

---

## Backend Configuration

Backend configuration is handled in:

```txt
backend/app/core/config.py
```

The app uses `pydantic-settings` to load environment variables from `.env`.

Example local `.env`:

```env
APP_NAME=Quiz API
APP_ENV=local
DATABASE_URL=postgresql+asyncpg://quiz_user:quiz_password@localhost:5432/quiz_db

CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176

JWT_SECRET_KEY=local-dev-secret-change-me
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Production `DATABASE_URL` example:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/neondb?ssl=require
```

---

## Local Database

Local PostgreSQL is handled through Docker Compose.

File:

```txt
docker-compose.yml
```

Example service:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: quiz_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: quiz_user
      POSTGRES_PASSWORD: quiz_password
      POSTGRES_DB: quiz_db
    ports:
      - "5432:5432"
    volumes:
      - quiz_postgres_data:/var/lib/postgresql/data

volumes:
  quiz_postgres_data:
```

---

## Database Models

### User

Model file:

```txt
backend/app/users/models.py
```

Fields:

```txt
users
- id
- email
- username
- password_hash
- points
- created_at
```

The `User` model is already prepared for future authentication, scoring and ranking features.

### Category

Model file:

```txt
backend/app/quizzes/models.py
```

Fields:

```txt
categories
- id
- slug
- name
- description
- is_active
- created_at
```

Example category slugs:

```txt
general-it
react
typescript
http-rest
```

### Question

Fields:

```txt
questions
- id
- category_id
- question
- difficulty
- explanation_html
- points
- is_active
- created_at
```

Each question belongs to a category and has multiple answers.

### Answer

Fields:

```txt
answers
- id
- question_id
- text
- is_correct
- position
```

Each question has multiple answers. Only one answer should be marked as correct.

---

## Alembic Migrations

Database migrations are handled with Alembic.

Files:

```txt
backend/alembic/
backend/alembic.ini
```

The backend uses the async PostgreSQL driver:

```txt
postgresql+asyncpg://
```

Alembic uses a sync driver:

```txt
postgresql+psycopg://
```

Because of that, `backend/alembic/env.py` converts the database URL before running migrations:

```python
def get_sync_database_url() -> str:
    url = settings.database_url

    url = url.replace("postgresql+asyncpg://", "postgresql+psycopg://")
    url = url.replace("ssl=require", "sslmode=require")

    return url
```

This allows:

```txt
FastAPI -> asyncpg
Alembic -> psycopg
```

---

## Seed Data

Seed files:

```txt
backend/app/seed/data.py
backend/app/seed/run.py
```

Seed data creates initial quiz categories and questions.

Run seed locally:

```bash
python -m app.seed.run
```

The seed script is designed to be idempotent, meaning that it should not duplicate existing questions when executed multiple times.

In production, seed runs automatically from `start.sh`.

---

## Backend API

### Root

```http
GET /
```

Response:

```json
{
  "message": "Quiz API is running"
}
```

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "app": "Quiz API",
  "env": "production"
}
```

### Database Health Check

```http
GET /health/db
```

Response:

```json
{
  "status": "ok",
  "database": 1
}
```

### Get Categories

```http
GET /quizzes/categories
```

Response example:

```json
[
  {
    "id": "uuid",
    "slug": "react",
    "name": "React",
    "description": "Pytania z Reacta, hooków, renderowania, state managementu i architektury komponentów.",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00"
  }
]
```

### Get Questions From Category

```http
GET /quizzes/categories/{slug}/questions
```

Example:

```http
GET /quizzes/categories/react/questions
```

This endpoint returns questions without answers.

### Get Question Details

```http
GET /quizzes/questions/{question_id}
```

Returns a question with answers.

The response does not expose `is_correct`, so the frontend does not know the correct answer before submitting.

### Submit Answer

```http
POST /quizzes/questions/{question_id}/answer
```

Request body:

```json
{
  "answer_id": "uuid"
}
```

Response:

```json
{
  "is_correct": true,
  "correct_answer": {
    "id": "uuid",
    "text": "GET"
  },
  "explanation_html": "<h3>Poprawna odpowiedź...</h3>"
}
```

---

## Frontend Overview

Frontend application is located in:

```txt
frontend/
```

Main files:

```txt
src/main.tsx
src/App.tsx
src/index.css
```

Main pages:

```txt
src/pages/CategoriesPage.tsx
src/pages/QuestionsPage.tsx
src/pages/QuestionPage.tsx
```

Current routes:

```txt
/                       -> categories
/categories/:slug       -> quiz slider for selected category
/questions/:questionId  -> single question view
```

The main quiz flow is implemented in:

```txt
src/pages/QuestionsPage.tsx
```

---

## Frontend API Layer

API client:

```txt
frontend/src/shared/api/client.ts
```

The base API URL is read from Vite environment variables:

```ts
const API_URL = import.meta.env.VITE_API_URL;
```

Local:

```env
VITE_API_URL=http://localhost:8000
```

Production:

```env
VITE_API_URL=https://quiz-app-api-gujn.onrender.com
```

Quiz API functions:

```txt
frontend/src/features/quizzes/api.ts
```

Available functions:

```ts
getCategories();
getCategoryQuestions(slug);
getQuestion(questionId);
submitAnswer({ questionId, answerId });
```

---

## Data Fetching

The project uses TanStack Query.

Provider:

```txt
frontend/src/app/providers/QueryProvider.tsx
```

Configuration:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

TanStack Query is used for:

```txt
- loading states
- error states
- API caching
- request retrying
- avoiding unnecessary refetching
```

---

## Quiz Slider

The slider is implemented in:

```txt
frontend/src/pages/QuestionsPage.tsx
```

Local state:

```ts
const [currentIndex, setCurrentIndex] = useState(0);
const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
```

Flow:

```txt
1. Fetch questions for selected category.
2. Get current question by currentIndex.
3. Fetch full details of current question.
4. User selects an answer.
5. Frontend sends answer_id to backend.
6. Backend returns is_correct, correct_answer and explanation_html.
7. Frontend displays result.
8. User can move to the next or previous question.
```

---

## Rendering Explanation HTML

Backend returns explanations as HTML:

```json
{
  "explanation_html": "<h3>Correct answer</h3><p>...</p>"
}
```

Frontend renders it with:

```tsx
dangerouslySetInnerHTML;
```

Before rendering, the HTML is sanitized with DOMPurify:

```ts
DOMPurify.sanitize(result.explanation_html);
```

This reduces the risk of XSS when rendering HTML content.

---

## Tailwind CSS

Tailwind CSS is integrated through the Vite plugin.

Vite config:

```txt
frontend/vite.config.ts
```

Example:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

CSS entry:

```txt
frontend/src/index.css
```

Tailwind import:

```css
@import "tailwindcss";
```

---

## Local Development

### Requirements

- Node.js
- npm
- Python 3
- Docker, OrbStack or Docker Desktop
- Git

---

## Run Locally

### 1. Start PostgreSQL

From project root:

```bash
cd "/Users/bart/Desktop/HERO CODE/quiz-app"

docker compose up -d
```

Check running containers:

```bash
docker ps
```

You should see:

```txt
quiz_postgres
```

---

### 2. Start Backend

```bash
cd "/Users/bart/Desktop/HERO CODE/quiz-app/backend"

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

alembic upgrade head
python -m app.seed.run

uvicorn app.main:app --reload
```

Backend will be available at:

```txt
http://localhost:8000
```

Check:

```txt
http://localhost:8000/health
http://localhost:8000/quizzes/categories
```

---

### 3. Start Frontend

Open a second terminal:

```bash
cd "/Users/bart/Desktop/HERO CODE/quiz-app/frontend"

npm install
cp .env.example .env

npm run dev
```

Frontend will usually start at:

```txt
http://localhost:5173
```

If the port is busy, Vite may use:

```txt
http://localhost:5174
http://localhost:5175
http://localhost:5176
```

---

## Deployment

### Backend Deployment

Backend is deployed on Render.

Render configuration:

```txt
Root Directory:
backend

Build Command:
pip install -r requirements.txt

Start Command:
./start.sh
```

Render environment variables:

```env
APP_NAME=Quiz API
APP_ENV=production
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/neondb?ssl=require
CORS_ORIGINS=http://localhost:5173,http://localhost:5176,https://quiz-app-sand.vercel.app
JWT_SECRET_KEY=production-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Production start script:

```txt
backend/start.sh
```

Content:

```bash
#!/usr/bin/env bash

set -e

alembic upgrade head
python -m app.seed.run
uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
```

---

### Frontend Deployment

Frontend is deployed on Vercel.

Vercel configuration:

```txt
Root Directory:
frontend

Framework:
Vite

Build Command:
npm run build

Output Directory:
dist
```

Vercel environment variable:

```env
VITE_API_URL=https://quiz-app-api-gujn.onrender.com
```

After changing Vercel environment variables, redeploy the project.

---

## Common Issues

### `Address already in use`

Port `8000` is already occupied.

Find the process:

```bash
lsof -i :8000
```

Kill it:

```bash
kill -9 PID
```

Restart backend:

```bash
uvicorn app.main:app --reload
```

---

### `Failed to fetch`

Usually caused by CORS or incorrect API URL.

Check frontend env:

```env
VITE_API_URL=https://quiz-app-api-gujn.onrender.com
```

Check backend env:

```env
CORS_ORIGINS=https://quiz-app-sand.vercel.app
```

If frontend is deployed at:

```txt
https://quiz-app-sand.vercel.app
```

then this domain must be present in backend `CORS_ORIGINS`.

---

### `invalid connection option "ssl"`

This is related to Alembic using `psycopg`.

Fix in:

```txt
backend/alembic/env.py
```

Required conversion:

```python
url = url.replace("ssl=require", "sslmode=require")
```

---

### `ModuleNotFoundError: No module named 'sqlalchemy'`

Dependencies are missing from the Python virtual environment.

Fix:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

---

### Vite uses a different port

If `5173` is busy, Vite may use another port.

Force port 5173:

```bash
npm run dev -- --port 5173
```

---

## Current Features

Implemented:

```txt
- monorepo structure
- FastAPI backend
- PostgreSQL local database through Docker
- Neon PostgreSQL production database
- SQLAlchemy models
- Alembic migrations
- seed data
- quiz categories
- quiz questions
- quiz answers
- answer validation
- explanation_html
- React frontend
- Vite
- TypeScript
- Tailwind CSS
- quiz slider
- Render backend deployment
- Vercel frontend deployment
```

Planned:

```txt
- registration
- login
- JWT authentication
- user points
- wrong answer tracking
- reminders / revision mode
- public ranking
- admin panel for adding questions
- filtering questions by difficulty
- user statistics
```

---

## Useful Commands

### Local database

```bash
docker compose up -d
```

### Local backend

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
python -m app.seed.run
uvicorn app.main:app --reload
```

### Local frontend

```bash
cd frontend
npm install
npm run dev
```

### Push changes

```bash
git add .
git commit -m "Your commit message"
git push
```

### Production backend

Render deploys automatically from GitHub.

### Production frontend

Vercel deploys automatically from GitHub.

```

```
