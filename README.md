# Quiz App

Full-stack quiz application built with **FastAPI**, **PostgreSQL**, **React**, **TypeScript**, **Vite** and **Tailwind CSS**.

The project is structured as a monorepo with a Python backend and a React frontend. The backend exposes authentication, email verification, quiz categories, questions, answers, answer validation, user progress and billing-related endpoints. The frontend displays categories, runs a quiz flow using a question slider and supports account-based features such as login, email verification and protected user features.

---

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
- JWT authentication
- Resend for transactional emails
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
- Email delivery: Resend

---

## Project Structure

```txt
quiz-app/
  backend/
    alembic/
    app/
      auth/
        email_verification.py
      core/
        config.py
        database.py
        email.py
      domains/
        billing/
          models.py
          routes.py
          schemas.py
        quizzes/
          models.py
          routes.py
          schemas.py
        users/
          models.py
          routes.py
          schemas.py
      seed/
        data.py
        run.py
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
          AuthProvider.tsx
          QueryProvider.tsx
      features/
        quizzes/
          api.ts
          types.ts
      pages/
        CategoriesPage.tsx
        DashboardPage.tsx
        LoginPage.tsx
        PricingPage.tsx
        ProfilePage.tsx
        QuestionsPage.tsx
        RegisterPage.tsx
        VerifyEmailPage.tsx
      shared/
        api/
          client.ts
        ui/
          EmailVerificationBanner.tsx
          Header.tsx
      App.tsx
      main.tsx
      index.css
    package.json
    vite.config.ts
    vercel.json
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

Main backend areas:

```txt
- authentication
- email verification
- users
- quizzes
- billing/plans
- admin question approval
- seed data
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

RESEND_API_KEY=
EMAIL_FROM=DevPrep <onboarding@resend.dev>
FRONTEND_URL=http://localhost:5173
```

Production `DATABASE_URL` example:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/neondb?ssl=require
```

Production email variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=DevPrep <onboarding@resend.dev>
FRONTEND_URL=https://quiz-app-sand.vercel.app
```

For production with a custom verified domain, `EMAIL_FROM` can be changed to:

```env
EMAIL_FROM=DevPrep <noreply@yourdomain.com>
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
backend/app/domains/users/models.py
```

Fields:

```txt
users
- id
- email
- username
- password_hash
- role
- points
- contribution_points
- is_pro
- subscription_expires_at
- current_streak
- longest_streak
- last_activity_date
- bio
- linkedin_url
- github_url
- website_url
- is_email_verified
- email_verification_token_hash
- email_verification_sent_at
- email_verified_at
- created_at
```

The `User` model supports authentication, scoring, profile data, subscription status and email verification.

### Category

Model file:

```txt
backend/app/domains/quizzes/models.py
```

Fields:

```txt
categories
- id
- slug
- name
- description
- is_active
- created_by_user_id
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
- created_by_username
- approved_by_username
- views_count
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

### Plan

Fields:

```txt
plans
- id
- code
- name
- description
- price_amount
- currency
- billing_period
- features
- max_difficulty
- can_answer_questions
- can_view_explanations
- can_use_review
- can_submit_questions
- has_unlimited_questions
- is_active
- sort_order
- created_at
```

Current pricing model:

```txt
Free                  $0
30-Day Pass            $14.99 / 30 days, one payment
Monthly Subscription   $9.99 / month, minimum 12 months
Annual Upfront         $99 / year, paid upfront
```

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

Run migrations locally:

```bash
alembic upgrade head
```

---

## Seed Data

Seed files:

```txt
backend/app/seed/data.py
backend/app/seed/run.py
```

Seed data creates initial quiz categories, questions and plans.

Run seed locally:

```bash
python -m app.seed.run
```

The seed script is designed to be idempotent, meaning that it should not duplicate existing questions when executed multiple times.

In production, seed runs automatically from `start.sh`.

---

## Email Verification System

The application includes an email verification flow for registered users.

Flow:

```txt
1. User registers or logs in.
2. If the email is not verified, the frontend displays an email verification banner.
3. User clicks "Send verification email".
4. Backend generates a secure one-time verification token.
5. Backend stores only the SHA-256 hash of the token in the database.
6. Backend sends an email with a verification link.
7. User opens /verify-email?token=...
8. Frontend sends the token to the backend.
9. Backend validates the token and marks the email as verified.
```

Verification links are valid for:

```txt
24 hours
```

### Email Provider

Email delivery is handled by **Resend**.

Backend email helper:

```txt
backend/app/core/email.py
```

Email verification router:

```txt
backend/app/auth/email_verification.py
```

Frontend verification page:

```txt
frontend/src/pages/VerifyEmailPage.tsx
```

Frontend verification banner:

```txt
frontend/src/shared/ui/EmailVerificationBanner.tsx
```

### User Email Verification Fields

The `users` table contains:

```txt
users
- is_email_verified
- email_verification_token_hash
- email_verification_sent_at
- email_verified_at
```

Only the hashed token is stored in the database. The raw token is sent only in the email verification link.

### Local Email Development Mode

If `RESEND_API_KEY` is not configured, the backend does not send a real email. Instead, it prints the email HTML and verification link in the backend logs.

Example log:

```txt
EMAIL DEV MODE - RESEND_API_KEY missing
TO: user@example.com
SUBJECT: Confirm your DevPrep email
HTML:
<a href="http://localhost:5173/verify-email?token=...">Verify email</a>
```

This allows testing the full verification flow locally without using a real email provider.

### Required Email Environment Variables

Local:

```env
RESEND_API_KEY=
EMAIL_FROM=DevPrep <onboarding@resend.dev>
FRONTEND_URL=http://localhost:5173
```

Production:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=DevPrep <onboarding@resend.dev>
FRONTEND_URL=https://quiz-app-sand.vercel.app
```

For production, `EMAIL_FROM` can later be changed to a verified custom domain, for example:

```env
EMAIL_FROM=DevPrep <noreply@yourdomain.com>
```

### Email Verification API

#### Send or resend verification email

```http
POST /auth/resend-verification-email
```

Requires authentication:

```http
Authorization: Bearer <access_token>
```

Response:

```json
{
  "message": "Verification email has been sent. The link is valid for 24 hours."
}
```

If the email is already verified:

```json
{
  "message": "Email is already verified."
}
```

#### Verify email

```http
POST /auth/verify-email
```

Request body:

```json
{
  "token": "verification-token-from-email"
}
```

Response:

```json
{
  "message": "Email has been verified."
}
```

There is also a GET variant for direct browser links:

```http
GET /auth/verify-email?token=...
```

### Frontend Verification Route

The verification link points to the frontend:

```txt
/verify-email?token=...
```

The frontend route reads the token from the URL and sends it to the backend.

Because React Strict Mode can run effects twice in development, the verification page guards against sending duplicate verification requests.

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

### Register

```http
POST /auth/register
```

Creates a new user account.

### Login

```http
POST /auth/login
```

Returns an access token.

### Current User

```http
GET /auth/me
```

Requires authentication.

Response includes user profile information and email verification status:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "user",
  "role": "user",
  "points": 0,
  "contribution_points": 0,
  "is_pro": false,
  "is_email_verified": true,
  "email_verified_at": "2026-01-01T00:00:00"
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

### Billing Plans

```http
GET /billing/plans
```

Returns active pricing plans.

### Current Billing Access

```http
GET /billing/me
```

Returns current user billing access and permissions.

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
src/pages/DashboardPage.tsx
src/pages/LoginPage.tsx
src/pages/PricingPage.tsx
src/pages/ProfilePage.tsx
src/pages/QuestionsPage.tsx
src/pages/RegisterPage.tsx
src/pages/VerifyEmailPage.tsx
```

Current routes:

```txt
/                       -> marketing / home page
/dashboard              -> logged-in user dashboard
/pricing                -> pricing page
/login                  -> login page
/register               -> register page
/profile                -> user profile
/quizzes                -> quiz categories
/categories/:slug       -> quiz slider for selected category
/questions/:questionId  -> single question view
/verify-email           -> email verification page
```

The main quiz flow is implemented in:

```txt
src/pages/QuestionsPage.tsx
```

The email verification banner is implemented in:

```txt
src/shared/ui/EmailVerificationBanner.tsx
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

## Pricing Model

The app has a free plan and paid Pro plans.

### Free

```txt
Price: $0
```

Includes:

```txt
- easy level questions
- correct answer for easy questions
- community question submissions
- no full explanations
- no review mode
- no answer history
```

### 30-Day Pass

```txt
Price: $14.99
Billing: one payment
Duration: 30 days
```

Includes:

```txt
- 30 days of Pro access
- no subscription
- all difficulty levels
- full explanations
- review mode
- answer history
```

### Monthly Subscription

```txt
Price: $9.99/month
Billing: monthly
Commitment: minimum 12 months
```

Includes:

```txt
- all difficulty levels
- full explanations
- review mode
- answer history
- community question submissions
```

### Annual Upfront

```txt
Price: $99/year
Billing: paid upfront
```

Includes:

```txt
- one year of Pro access
- equivalent to $8.25/month
- all difficulty levels
- full explanations
- review mode
- answer history
- community question submissions
```

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
cd backend

python -m venv .venv
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

### Windows PowerShell example

```powershell
cd "E:\REACT CWICZENIA\quiz-app\backend"

python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt

python -m alembic upgrade head
python -m app.seed.run

python -m uvicorn app.main:app --reload
```

---

### 3. Start Frontend

Open a second terminal:

```bash
cd frontend

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

### Windows PowerShell example

```powershell
cd "E:\REACT CWICZENIA\quiz-app\frontend"

npm install
npm run dev
```

---

## Local Email Testing

Without a Resend API key, email verification works in development mode.

Start backend normally:

```powershell
cd "E:\REACT CWICZENIA\quiz-app\backend"
python -m uvicorn app.main:app --reload
```

Then click:

```txt
Send verification email
```

The backend will print the verification link in the logs.

To test real email delivery locally, set environment variables before starting the backend:

```powershell
cd "E:\REACT CWICZENIA\quiz-app\backend"

$env:RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
$env:EMAIL_FROM="DevPrep <onboarding@resend.dev>"
$env:FRONTEND_URL="http://localhost:5173"

python -m uvicorn app.main:app --reload
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

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=DevPrep <onboarding@resend.dev>
FRONTEND_URL=https://quiz-app-sand.vercel.app
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

### Vercel SPA Routing

Because the frontend uses React Router, Vercel needs a SPA fallback rewrite.

File:

```txt
frontend/vercel.json
```

Required configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Without this file, direct links such as these may return `404: NOT_FOUND` on Vercel:

```txt
/verify-email?token=...
/dashboard
/pricing
/quizzes
```

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

On Windows, you can also start the backend on another port:

```powershell
python -m uvicorn app.main:app --reload --port 8001
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

### Email verification email is not received

If the request succeeds but no email is delivered, check backend logs.

If logs contain:

```txt
EMAIL DEV MODE - RESEND_API_KEY missing
```

then the backend is running without a Resend API key.

Add the following environment variables to Render:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=DevPrep <onboarding@resend.dev>
FRONTEND_URL=https://quiz-app-sand.vercel.app
```

After changing environment variables on Render, redeploy the backend.

---

### Email verification link returns `Invalid verification token`

Possible reasons:

```txt
- the link was already used
- the link expired after 24 hours
- a newer verification link was generated and replaced the previous token
- React Strict Mode sent duplicate verification requests in development
```

Fix:

```txt
1. Go back to the app.
2. Click "Send verification email" again.
3. Use the newest link from the email or backend logs.
```

---

### Vercel returns `404: NOT_FOUND` after refreshing a route

This happens when a React Router route is opened directly, for example:

```txt
/verify-email?token=...
/dashboard
/pricing
```

Fix by adding SPA rewrites in:

```txt
frontend/vercel.json
```

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

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

On Windows:

```powershell
.venv\Scripts\activate
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

### JWT secret key warning

If you see:

```txt
InsecureKeyLengthWarning
```

then the JWT secret key is too short.

Use a longer secret in production:

```env
JWT_SECRET_KEY=replace-with-a-long-random-secret-at-least-32-characters
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
- registration
- login
- JWT authentication
- email verification flow
- email verification banner
- email verification page
- transactional email integration with Resend
- quiz categories
- quiz questions
- quiz answers
- answer validation
- explanation_html
- question metadata
- answer history
- wrong answer tracking
- review mode
- user points
- contribution points
- public ranking
- pricing page
- billing plans
- free/pro access rules
- React frontend
- Vite
- TypeScript
- Tailwind CSS
- quiz slider
- Render backend deployment
- Vercel frontend deployment
- Vercel SPA routing fallback
```

Planned:

```txt
- full payment provider integration
- Stripe checkout
- admin analytics
- richer user statistics
- filtering questions by difficulty
- reminders / revision notifications
- custom verified email domain
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

### Local backend on Windows

```powershell
cd "E:\REACT CWICZENIA\quiz-app\backend"
.venv\Scripts\activate
python -m alembic upgrade head
python -m app.seed.run
python -m uvicorn app.main:app --reload
```

### Local frontend

```bash
cd frontend
npm install
npm run dev
```

### Local frontend on Windows

```powershell
cd "E:\REACT CWICZENIA\quiz-app\frontend"
npm install
npm run dev
```

### Check backend routes

```powershell
Invoke-RestMethod http://localhost:8000/openapi.json |
  Select-Object -ExpandProperty paths |
  Get-Member -MemberType NoteProperty |
  Select-Object -ExpandProperty Name
```

### Check production backend routes

```powershell
Invoke-RestMethod https://quiz-app-api-gujn.onrender.com/openapi.json |
  Select-Object -ExpandProperty paths |
  Get-Member -MemberType NoteProperty |
  Select-Object -ExpandProperty Name
```

### Check production plans

```powershell
Invoke-RestMethod https://quiz-app-api-gujn.onrender.com/billing/plans
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
