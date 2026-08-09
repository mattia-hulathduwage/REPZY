FitApp is a fitness/nutrition tracking app split into two projects:

- [`frontend/`](frontend/) — Expo / React Native app ([Expo Router](https://docs.expo.dev/router/introduction/)). See [frontend/README.md](frontend/README.md).
- [`backend/`](backend/) — FastAPI + Neon Postgres API. See [backend/README.md](backend/README.md).

## Getting started

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
uvicorn app.main:app --reload

# frontend (separate terminal)
cd frontend
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `frontend/.env` to point at the backend — use your machine's LAN IP (not `localhost`) when testing on a physical device.
