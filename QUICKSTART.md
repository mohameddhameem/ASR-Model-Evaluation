# Quick Start

Get running in 2 minutes.

## Requirements

Node.js v24.14.0+ and npm v10.0+

## Backend (Terminal 1)

```bash
cd backend
npm install
npm start
```

Runs on http://localhost:8000

## Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5174

## Test

```bash
curl http://localhost:8000/health
```

Then open http://localhost:5174 in your browser.

## Troubleshooting

**npm: command not found**
Install Node.js from https://nodejs.org/

**Port already in use**
```bash
netstat -ano | findstr :5174
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F
```

**npm install fails**
```bash
rm -r node_modules package-lock.json
npm cache clean --force
npm install
```

**Frontend can't reach backend**
- Run `curl http://localhost:8000/health` to verify backend is running
- Check browser console for errors

## Next Steps

- [README.md](./README.md) - full docs
- [DEVELOPMENT.md](./DEVELOPMENT.md) - development info
- [CONTRIBUTING.md](./CONTRIBUTING.md) - code guidelines
