# Contributing

## Setup

Start with [QUICKSTART.md](./QUICKSTART.md) and [DEVELOPMENT.md](./DEVELOPMENT.md).

## Workflow

**Create a branch:**
```bash
git checkout -b feature/name
# or
git checkout -b fix/name
```

**Keep services running:**
```bash
cd backend && npm start        # Terminal 1
cd frontend && npm run dev     # Terminal 2
```

**Make changes, test locally, then commit:**
```bash
git add .
git commit -m "feat(name): description"
git push origin feature/name
```

Then create a pull request on GitHub.

## Code Standards

**Frontend Components (TypeScript/React)**
- Files: PascalCase names (MyComponent.tsx)
- Use Tailwind CSS
- Check dark mode works
- Responsive on mobile

```typescript
export const MyComponent = ({ title }) => {
  return <div className="p-4">{title}</div>;
};
```

**Backend Endpoints (JavaScript/Express)**
- Files: camelCase (server.js)
- Use proper HTTP status codes
- Handle errors with try/catch
- Return JSON

```javascript
app.get('/api/resource/:id', (req, res) => {
  try {
    const item = findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

## Commits

Use conventional format:
```
feat(ModelAnalytics): add export feature
fix(SpeechTraining): correct display
docs: update README
refactor(backend): optimize queries
```

## Testing

Before pushing:
- No console errors
- Works on desktop and mobile
- Dark/light theme works
- API calls succeed

Test commands:
```bash
# Frontend
cd frontend && npm run lint && npm run build

# Backend
curl http://localhost:8000/health
curl http://localhost:8000/api/endpoint
```

## Bugs & Features

Create an issue with:
- Description of the problem/idea
- Steps to reproduce (if bug)
- Expected behavior
- Current behavior
- Screenshots if relevant

## PR Process

1. Push your branch
2. Create pull request with description
3. Address review feedback
4. Maintainer merges when approved

## Questions?

- Read README.md
- Check existing issues
- Ask in the PR comments
