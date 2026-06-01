using Microsoft.AspNetCore.Mvc;
using ReportService.Api.Middleware;
using ReportService.Api.Patterns.Command;
using ReportService.Api.Patterns.Factory;

namespace ReportService.Api.Controllers;

[ApiController]
[Route("reports")]
public sealed class ReportsController : ControllerBase
{
    private readonly IReportCommandHandler _handler;

    public ReportsController(IReportCommandHandler handler) => _handler = handler;

    [HttpGet("workspace-summary")]
    public async Task<IActionResult> WorkspaceSummary([FromQuery] string format = "json", CancellationToken ct = default)
    {
        var ctx = (GatewayContext)HttpContext.Items["GatewayContext"]!;
        var output = await _handler.HandleAsync(new GenerateReportCommand(
            "workspace-summary", format,
            new ReportContext(ctx.UserId, ctx.WorkspaceId, ctx.Role, null)), ct);

        return File(System.Text.Encoding.UTF8.GetBytes(output.Body), output.ContentType, output.FileName);
    }

    [HttpGet("project/{projectId}/status")]
    public async Task<IActionResult> ProjectStatus(string projectId, [FromQuery] string format = "json", CancellationToken ct = default)
    {
        var ctx = (GatewayContext)HttpContext.Items["GatewayContext"]!;
        var output = await _handler.HandleAsync(new GenerateReportCommand(
            "project-status", format,
            new ReportContext(ctx.UserId, ctx.WorkspaceId, ctx.Role, projectId)), ct);

        if (format.Equals("json", StringComparison.OrdinalIgnoreCase))
            return Ok(new { success = true, message = "Report generated", data = System.Text.Json.JsonSerializer.Deserialize<object>(output.Body) });

        return File(System.Text.Encoding.UTF8.GetBytes(output.Body), output.ContentType, output.FileName);
    }
}
