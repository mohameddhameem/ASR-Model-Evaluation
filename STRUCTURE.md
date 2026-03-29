# Repository Structure

## Layout

```
Asrmodelevaluationspa/
├── frontend/           # React + TypeScript SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── routes.tsx
│   │   │   └── App.tsx
│   │   ├── styles/
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── backend/            # Express.js REST API
│   ├── server.js
│   ├── data/
│   │   └── mockData.js
│   ├── package.json
│   └── README.md
│
├── guidelines/
│   └── Guidelines.md
│
├── README.md
├── QUICKSTART.md
├── DEVELOPMENT.md
├── CONTRIBUTING.md
└── .gitignore
```

## Quick Start

**Backend (Terminal 1):**
```bash
cd backend
npm install
npm start
# http://localhost:8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
# http://localhost:5174
```

## Project Stats

- 8 routes/pages
- 11 API endpoints
- 9 React components
- 30+ UI components
- 3 mock models, 3 datasets, 3 evaluations

## API Endpoints

**Models:** GET/POST/PUT/DELETE /api/asr/models
**Datasets:** GET/POST/PUT/DELETE /api/datasets
**Analytics:** GET /api/analytics/summary, /evaluations, /evaluations/model/{id}

## Frontend Structure

- Components in `src/app/components/`
- Routes defined in `src/app/routes.tsx`
- Styles in `src/styles/`
- Shadcn/ui components in `src/app/components/ui/`

## Backend Structure

- Express server in `server.js`
- Mock data in `data/mockData.js`
- 11 endpoints for CRUD operations

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - 5 minute setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Dev guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [frontend/README.md](./frontend/README.md) - Frontend docs
- [backend/README.md](./backend/README.md) - Backend docs

## Port Reference

- Frontend: 5174
- Backend: 8000
