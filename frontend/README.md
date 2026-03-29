
# Frontend

React + TypeScript application for ASR model evaluation.

## Setup

```bash
npm install
npm run dev
```

Runs on http://localhost:5174

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview build
- `npm run lint` - Lint code

## Structure

```
src/
├── app/
│   ├── components/  # 9 main pages + UI components
│   ├── routes.tsx   # 8 routes
│   └── App.tsx
└── styles/          # CSS and theme
```

## Pages (8 routes)

- **Evaluation Workbench** - Media selection and controls
- **Speech Training** - Waveform visualization
- **Language ID Training** - Language stats
- **Model Analytics** - Performance charts
- **Dataset Manager** - Dataset management
- **Operations Dashboard** - Batch processing
- **Model Retraining** - Training pipelines
- **Settings** - Theme and preferences

## Features

- Dark/Light theme
- CSV export
- Keyboard shortcuts
- Advanced filtering
- Analytics charts
- Bulk operations

## Tech Stack

React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, Recharts

## API

Connects to backend (http://localhost:8000):
- GET /api/asr/models
- GET /api/datasets
- GET /api/analytics/summary

Falls back to client-side mock data if backend unavailable.

## Design

https://www.figma.com/design/e4poCHeQjfPSPDxwG0jRL0/ASR-Model-Evaluation-SPA
  