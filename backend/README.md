# Backend Architecture

This directory contains **two separate servers** that serve different purposes.

## Servers

### 1. FastAPI Server (`main.py`) — Production Backend
- **Language**: Python (FastAPI + Uvicorn)
- **Port**: `8000`
- **Start command**: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- **Purpose**: The real, production-intended REST API. Uses Pydantic schemas for validation. Full CRUD for datasets, ASR jobs, analytics, and operations.
- **Status**: Currently serves mock data from `app/services/mock_data.py`. Replace with real database/ML pipeline calls for production.

### 2. Express Mock Server (`server.js`) — Development Mock
- **Language**: Node.js (Express)
- **Port**: `8000` (**NOTE**: same port as FastAPI — only one can run at a time)
- **Start command**: `node server.js`
- **Purpose**: Rapid-iteration mock server used during early development. Supports the `/api/training/trigger` endpoint for simulating model optimization.
- **Status**: Dev-only. **Do not deploy.** Should be run on port `3001` if you need it alongside FastAPI.
- **`node_modules/`**: The `node_modules/` directory in this folder belongs to this Node.js server, not the Python FastAPI server.

## Recommended Setup

Run **only FastAPI** for development:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

If you need the Node.js mock server simultaneously (e.g. for legacy comparison), update `server.js` to use port `3001`:
```js
const PORT = process.env.PORT || 3001;
```

## Production Notes

Before deploying:
1. Restrict CORS origins in `main.py` (remove `allow_origins=["*"]`)
2. Implement real authentication (OAuth2 / JWT / MSAL) — the current login is a UI placeholder
3. Connect routers to a real database (PostgreSQL, SQLite, etc.)
4. Remove `server.js` from the deployment bundle
