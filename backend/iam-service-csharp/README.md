# IAM Service (C# / ASP.NET Core)

Identity & Access Management microservice — **drop-in replacement** for `backend/iam-service` (Node.js).

## Run

```bash
cd backend/iam-service-csharp
dotnet run --project src/IamService.Api
```

Default URL: `http://localhost:3001` (same as Node IAM).

## Environment

Copy values from your Node `.env` into `appsettings.json` or environment variables:

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | Same database as Node IAM |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Must match gateway |
| `INTERNAL_SECRET` | Gateway internal calls |

## Architecture

Clean Architecture (4 layers). Design patterns are documented in [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

## Switch gateway to C# IAM

Set `IAM_SERVICE_URL=http://localhost:3001` in api-gateway and bff-service — no route changes required.
