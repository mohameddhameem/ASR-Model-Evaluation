# ASR Model Evaluation Platform

A full-stack workbench for the orchestration, validation, and analytics of Global Speech Recognition (ASR) models. This platform provides a technical environment for researchers and operational teams to evaluate model performance across different languages and datasets.

## Getting Started

### Backend Services
The platform supports a dual-server architecture for different stages of development:
- **FastAPI (Recommended)**: The primary REST API for production-like workflows.
- **Express (Mock)**: A legacy mock server used for early-stage UI and frontend iteration.

```bash
# Start FastAPI Service
cd backend
# (Ensure your Python environment is active)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Application
```bash
cd frontend
npm install
npm run dev
```
The application will be available at: `http://localhost:5173`

---

## Core System Architecture

### Environment Isolation
The system enforces strict boundaries between Live and Demo environments:
- **Session-Based Selection**: Users specify their environment (Live or Demo) during the authentication process.
- **Persistence**: To ensure data integrity, the environment context is maintained for the duration of the session. Switching environments requires a full sign-out and re-authentication.

### Design and Governance
- **Institutional UI**: Implemented a design system based on a 2px geometry and a premium color palette (Charcoal/Primary) for a consistent, professional interface.
- **AI Governance**: A global AI System Disclaimer is integrated into the dashboard to remind users of the nature of AI-generated transcriptions and the necessity of human verification.
- **Standardized Tokens**: Styling is managed through a central set of CSS variables and design tokens, replacing ad-hoc utility classes.

### Technical Foundation
- **Type Safety**: The frontend is built on a refactored TypeScript foundation using discriminated unions for reliable data handling.
- **Centralized Data Management**: All mock data and system constants are managed through a single source of truth to avoid duplication across the platform.

---

## Technical Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI, Lucide, Sonner.
- **Backend (API)**: FastAPI (Python 3.12+), Pydantic, Uvicorn.
- **Backend (Mock)**: Node.js, Express.js.

---

## Documentation
- [Backend Development](./backend/README.md) - Details on service architecture and port assignments.
- [Frontend Development](./frontend/README.md) - Information on component structure and design patterns.
- [Quickstart Guide](./QUICKSTART.md) - A simplified 5-minute setup sequence.
