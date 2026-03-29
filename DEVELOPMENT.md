# Development Guide

## Setup

Both services watch for file changes automatically.

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Project Structure

```
frontend/src/app/
├── components/      # React components
├── routes.tsx       # Route definitions
└── App.tsx

backend/
├── server.js        # Express server
├── data/
│   └── mockData.js  # Mock data
└── package.json
```

## Adding a Frontend Component

1. Create file in `frontend/src/app/components/MyComponent.tsx`:
```typescript
export const MyComponent = () => {
  return <div className="p-4">My Component</div>;
};
```

2. Add route in `frontend/src/app/routes.tsx`:
```typescript
import { MyComponent } from './components/MyComponent';

// Add to routes array
{ path: '/my-component', element: <MyComponent />, label: 'My Component' }
```

3. Update sidebar in `Layout.tsx` to include the new route link.

## Adding a Backend Endpoint

In `backend/server.js`:
```javascript
app.get('/api/my-endpoint', (req, res) => {
  try {
    res.json({ data: 'response' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

Call from frontend:
```typescript
fetch('http://localhost:8000/api/my-endpoint')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error);
```

## Styling

Use Tailwind CSS classes:
```typescript
<div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
  <h2 className="text-lg font-semibold">Title</h2>
</div>
```

Dark mode is automatic via `next-themes`.

## Using Shadcn Components

```typescript
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export const MyCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      <Button>Click Me</Button>
    </CardContent>
  </Card>
);
```

## Data Fetching

```typescript
import { useState, useEffect } from 'react';

export const DataList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/endpoint')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
};
```

## Testing

**Frontend:** Use browser DevTools
- Console for errors
- Network tab to inspect API calls
- React DevTools extension

**Backend:** Use curl
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/asr/models
curl -X POST http://localhost:8000/api/asr/models \
  -H "Content-Type: application/json" \
  -d '{"name":"model"}'
```

## Build for Production

Frontend:
```bash
cd frontend
npm run build
# Creates frontend/dist/
```

Backend is ready to deploy as-is.

## Commits

```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
refactor: Refactor code
```

Example:
```bash
git add .
git commit -m "feat: Add new analytics page"
git push origin main
```

## Troubleshooting

**Module not found:**
```bash
rm -r node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend won't rebuild:**
- Save file again
- Restart dev server

**API calls failing:**
- Verify backend is running
- Check DevTools Network tab
- Look for CORS errors in console
