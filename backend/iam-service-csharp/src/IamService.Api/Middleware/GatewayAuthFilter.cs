using IamService.Application.Patterns.Factory;
using Microsoft.AspNetCore.Mvc.Filters;

namespace IamService.Api.Middleware;

public sealed class GatewayAuthFilter : IAsyncActionFilter
{
    private readonly ITokenFactory _tokens;

    public GatewayAuthFilter(ITokenFactory tokens) => _tokens = tokens;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var req = context.HttpContext.Request;
        if (req.Headers.TryGetValue("x-user-id", out var userId) && !string.IsNullOrWhiteSpace(userId))
        {
            context.HttpContext.Items["UserId"] = userId.ToString();
            await next();
            return;
        }

        var auth = req.Headers.Authorization.ToString();
        if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = auth["Bearer ".Length..].Trim();
            var payload = _tokens.TryValidateAccessToken(token);
            if (payload is not null)
            {
                context.HttpContext.Items["UserId"] = payload.Value.UserId;
                await next();
                return;
            }
        }

        context.Result = new Microsoft.AspNetCore.Mvc.ObjectResult(new { success = false, message = "Unauthorized: Missing token" })
        {
            StatusCode = 401,
        };
    }
}
