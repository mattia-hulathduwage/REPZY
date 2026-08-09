# Fitapp backend (FastAPI + Neon Postgres)

Email/password auth API issuing JWT access tokens.

## Endpoints

- `POST /auth/signup` — `{email, password, name}` -> `{access_token, token_type, user}`
- `POST /auth/login` — `{email, password}` -> `{access_token, token_type, user}`
- `GET /auth/me` — `Authorization: Bearer <token>` -> current user
- `GET /health` — liveness check

## Local dev

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL from Neon, and a random JWT_SECRET
uvicorn app.main:app --reload
```

Tables are created automatically on startup (`Base.metadata.create_all`) — fine for a
project this size; switch to Alembic migrations if the schema grows.

## Neon Postgres setup

1. Create a free project at https://console.neon.tech.
2. Copy the connection string it gives you (looks like
   `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require`).
3. Rewrite it for this app's async driver — swap `postgresql://` for
   `postgresql+asyncpg://` and drop the `?sslmode=require` query param (SSL is
   already forced in `app/database.py` via `connect_args={"ssl": True}`):
   `postgresql+asyncpg://user:pass@ep-xxxx.region.aws.neon.tech/dbname`
4. Put that in `DATABASE_URL`.

## Deploy to Google Cloud Run (free tier)

Prerequisites: `gcloud` CLI installed and authenticated, a GCP project selected.

```bash
cd backend
gcloud run deploy fitapp-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxxx.region.aws.neon.tech/dbname" \
  --set-env-vars "JWT_SECRET=$(openssl rand -hex 32)" \
  --set-env-vars "CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000"
```

`--source .` builds the Dockerfile in this folder via Cloud Build and deploys it —
no manual image push needed. Cloud Run's free tier covers a small always-on hobby
app comfortably as long as it scales to zero when idle (default behavior).

After deploy, `gcloud run services describe fitapp-api --region us-central1 --format 'value(status.url)'`
gives you the backend URL — put it in the frontend's `NEXT_PUBLIC_API_URL`.

Secrets note: prefer `--set-secrets` with Secret Manager over `--set-env-vars` for
`DATABASE_URL`/`JWT_SECRET` in a real deployment; env vars above are the quick path.
