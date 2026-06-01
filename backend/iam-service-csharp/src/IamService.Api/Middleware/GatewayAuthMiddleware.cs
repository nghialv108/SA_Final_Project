using IamService.Application.Patterns.Factory;
using IamService.Infrastructure.Config;

namespace IamService.Api.Middleware;

/// <summary>Matches Node IAM: trust x-user-id from gateway or verify Bearer token.</summary>
public sealed class GatewayAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ITokenFactory tokens)
    {
        if (context.Request.Headers.TryGetValue("x-user-id", out var userId) && !string.IsNullOrWhiteSpace(userId))
        {
            context.Items["UserId"] = userId.ToString();
            await next(context);
            return;
        }

        var auth = context.Request.Headers.Authorization.ToString();
        if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = auth["Bearer ".Length..].Trim();
            var payload = tokens.TryValidateAccessToken(token);
            if (payload is not null)
            {
                context.Items["UserId"] = payload.Value.UserId;
                await next(context);
                return;
            }
        }

        context.Response.StatusCode = 401;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Unauthorized: Missing token" });
    }
}

public static class GatewayAuthExtensions
{
    public static IApplicationBuilder UseGatewayAuth(this IApplicationBuilder app) =>
        app.UseMiddleware<GatewayAuthMiddleware>();
}
