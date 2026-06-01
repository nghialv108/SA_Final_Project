# Report Service (C#)

Port **3005**. Patterns: **Factory Method**, **Bridge**, **Command**.

## Endpoints (via gateway)

| Route | Description |
|-------|-------------|
| `GET /api/reports/workspace-summary?format=json` | Overdue tasks in workspace |
| `GET /api/reports/project/{id}/status?format=json\|csv` | Tasks grouped by status |

## Run

```bash
dotnet run --project src/ReportService.Api
```

Requires **core-service** running. Set `CORE_SERVICE_URL` and `INTERNAL_SECRET` to match gateway/core.
