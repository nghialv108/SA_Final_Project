using ReportService.Api.Patterns.Bridge;

namespace ReportService.Api.Patterns.Factory;

/// <summary>CP — Factory Method: create report builders by type.</summary>
public interface IReportFactory
{
    IReportBuilder Create(string reportType);
}

public interface IReportBuilder
{
    string ReportType { get; }
    Task<object> BuildAsync(ReportContext ctx, CancellationToken ct);
}

public sealed record ReportContext(
    string UserId,
    string WorkspaceId,
    string Role,
    string? ProjectId);

public sealed class ReportFactory : IReportFactory
{
    private readonly IServiceProvider _sp;

    public ReportFactory(IServiceProvider sp) => _sp = sp;

    public IReportBuilder Create(string reportType) =>
        reportType.ToLowerInvariant() switch
        {
            "workspace-summary" => _sp.GetRequiredService<WorkspaceSummaryReportBuilder>(),
            "project-status"    => _sp.GetRequiredService<ProjectStatusReportBuilder>(),
            _ => throw new ArgumentException($"Unknown report type: {reportType}"),
        };
}

public sealed class WorkspaceSummaryReportBuilder : IReportBuilder
{
    private readonly Clients.CoreAnalyticsClient _core;
    public string ReportType => "workspace-summary";
    public WorkspaceSummaryReportBuilder(Clients.CoreAnalyticsClient core) => _core = core;

    public async Task<object> BuildAsync(ReportContext ctx, CancellationToken ct)
    {
        var overdue = await _core.GetOverdueTasksAsync(ctx.UserId, ctx.WorkspaceId, ctx.Role, ct);
        return new
        {
            ctx.WorkspaceId,
            generatedAt = DateTime.UtcNow,
            overdueTasks = overdue,
        };
    }
}

public sealed class ProjectStatusReportBuilder : IReportBuilder
{
    private readonly Clients.CoreAnalyticsClient _core;
    public string ReportType => "project-status";
    public ProjectStatusReportBuilder(Clients.CoreAnalyticsClient core) => _core = core;

    public async Task<object> BuildAsync(ReportContext ctx, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(ctx.ProjectId))
            throw new ArgumentException("projectId is required for project-status report");

        var byStatus = await _core.GetTasksByStatusAsync(
            ctx.UserId, ctx.WorkspaceId, ctx.Role, ctx.ProjectId, ct);

        var rows = new List<Dictionary<string, object>>();
        if (byStatus.ValueKind == System.Text.Json.JsonValueKind.Array)
        {
            foreach (var item in byStatus.EnumerateArray())
            {
                rows.Add(new Dictionary<string, object>
                {
                    ["status"] = item.GetProperty("_id").GetString() ?? "",
                    ["count"] = item.GetProperty("count").GetInt32(),
                });
            }
        }

        return new { ctx.ProjectId, generatedAt = DateTime.UtcNow, byStatus = rows };
    }
}
