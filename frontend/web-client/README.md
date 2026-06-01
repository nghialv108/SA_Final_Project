# TaskFlow Web Client

Minimal **React + Vite** UI for the project management platform.

## Run

```bash
cd frontend/web-client
npm install
npm run dev
```

Open http://localhost:5173 — API calls proxy to gateway at http://localhost:3000.

## Flow

1. **Register / Login** → IAM via `/api/iam/auth/*`
2. **Select workspace** → `/api/iam/workspaces/mine`
3. **Dashboard / Projects** → BFF aggregators
4. **Search** → C# search service `/api/search`
5. **Reports** → C# report service `/api/reports`

## Prerequisites

- api-gateway `:3000`
- iam-service (C# or Node) `:3001`
- core-service `:3002`
- bff-service `:3003`
- search-service `:3004`
- report-service `:3005`
- MongoDB
