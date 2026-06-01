# TaskFlow — Project & Task Management

Microservices platform with **C# IAM / Search / Report**, Node **Core / BFF / Gateway**, and a **React** web UI.

## Quick start (one command)

**Requirements:** Docker Desktop (or Docker Engine + Compose v2)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and run everything
docker compose up --build
```

Open the app: **http://localhost:8080**

| Service | Internal port | Notes |
|---------|---------------|--------|
| **web** | 8080 (public) | Nginx + React, proxies `/api` → gateway |
| api-gateway | 3000 | Not exposed; use via web |
| iam-service (C#) | 3001 | Replaces Node `iam-service` |
| core-service | 3002 | Projects & tasks |
| bff-service | 3003 | Aggregated views |
| search-service (C#) | 3004 | Full-text style search |
| report-service (C#) | 3005 | Analytics reports |
| mongodb | 27017 | `iam_service` + `core_service` DBs |
| redis | 6379 | Gateway membership cache |

Stop: `docker compose down`  
Reset data: `docker compose down -v`

## First-time usage

1. Open http://localhost:8080  
2. **Register** a new account  
3. **Workspaces** → **Create workspace** (name + slug)  
4. Use **Dashboard**, **Projects**, **Search**, **Reports**

## Local development (without Docker)

See per-service READMEs under `backend/` and `frontend/web-client/README.md`.

Run **iam-service-csharp** instead of Node `iam-service` (same port 3001).

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Troubleshooting

- **401 / Forbidden:** Ensure `.env` secrets match across services (`JWT_SECRET`, `INTERNAL_SECRET`).
- **Reports empty:** Create projects/tasks in core DB first; analytics uses task snapshots (events from core).
- **Slow first start:** First `docker compose up --build` compiles C# images; wait until all healthchecks pass.
