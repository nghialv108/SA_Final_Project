# Search Service (C#)

Port **3004**. Patterns: **Adapter**, **Facade**, **Iterator**.

## Endpoints (via gateway)

`GET /api/search?q=keyword&type=all|projects|tasks`

Requires: `Authorization`, `x-workspace-id` (gateway injects `x-internal-secret`).

## Run

```bash
dotnet run --project src/SearchService.Api
```

Uses `CORE_MONGO_URI` (same DB as core-service).
