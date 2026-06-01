namespace ReportService.Api.Middleware;

public sealed class GatewayContext
{
    public string UserId { get; init; } = "";
    public string WorkspaceId { get; init; } = "";
    public string Role { get; init; } = "member";
}

public sealed class GatewayContextMiddleware(RequestDelegate next, IConfiguration config)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await next(context);
            return;
        }

        var expected = config["INTERNAL_SECRET"] ?? "dev_internal_secret";
        if (!context.Request.Headers.TryGetValue("x-internal-secret", out var secret) || secret != expected)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { success = false, message = "Forbidden" });
            return;
        }

        if (!context.Request.Headers.TryGetValue("x-user-id", out var userId) || string.IsNullOrWhiteSpace(userId))
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { success = false, message = "Missing user context" });
            return;
        }

        if (!context.Request.Headers.TryGetValue("x-workspace-id", out var workspaceId) ||
            string.IsNullOrWhiteSpace(workspaceId))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { success = false, message = "x-workspace-id header is required" });
            return;
        }

        context.Items["GatewayContext"] = new GatewayContext
        {
            UserId = userId.ToString(),
            WorkspaceId = workspaceId.ToString(),
            Role = context.Request.Headers["x-user-role"].ToString() is { Length: > 0 } r ? r : "member",
        };

        await next(context);
    }
}
