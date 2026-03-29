# ASR Model Evaluation SPA

Full-stack application for evaluating ASR models.

## Setup

Requirements: Node.js v24.14.0+, npm v10.0+

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```
Runs on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5174

## Verify It's Working

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/asr/models
```

Then visit http://localhost:5174 in your browser.

## API Endpoints

**ASR Models**
- `GET /api/asr/models`
- `POST /api/asr/models`
- `PUT /api/asr/models/{model_id}`
- `DELETE /api/asr/models/{model_id}`

**Datasets**
- `GET /api/datasets`
- `POST /api/datasets`
- `PUT /api/datasets/{dataset_id}`
- `DELETE /api/datasets/{dataset_id}`

**Analytics**
- `GET /api/analytics/evaluations`
- `GET /api/analytics/summary`
- `POST /api/analytics/evaluations`

## Features

**Frontend (8 routes)**
- Evaluation Workbench
- Speech Training
- Language ID Training
- Model Analytics
- Dataset Manager
- Operations Dashboard
- Model Retraining
- Settings

Included: Dark/light theme, CSV export, keyboard shortcuts, analytics charts, advanced filtering.

**Backend**
- 3 mock ASR models
- 3 mock datasets
- 3 evaluations with metrics
- CORS enabled

## Development

```bash
# Frontend
cd frontend
npm run dev       # local dev
npm run build     # production build
npm run lint      # check code

# Backend
cd backend
npm start         # run server
```

**Frontend Structure**
- `src/app/components/` - React components
- `src/app/routes.tsx` - Routes
- `src/styles/` - CSS

**Backend Structure**
- `server.js` - Express app
- `data/mockData.js` - Mock data

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, Recharts
**Backend:** Express.js, Node.js

## Docs

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing guidelines

## Troubleshooting

**Frontend won't start:**
```bash
cd frontend && rm -r node_modules package-lock.json && npm install && npm run dev
```

**Backend won't start:**
```bash
cd backend && rm -r node_modules package-lock.json && npm install && npm start
```

**Port already in use:**
```bash
# On Windows, find what's using the port
netstat -ano | findstr :5174
netsstat -ano | findstr :8000
```
3. Review the guidelines in `/guidelines`

## 📄 License

This project is part of the ASR Model Evaluation initiative.

---

**Last Updated**: March 29, 2026  
**Frontend Status**: ✅ Running  
**Backend Status**: ✅ Running  
**Version**: 1.0.0
