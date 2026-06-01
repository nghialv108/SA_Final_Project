using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace IamService.Api.Middleware;

public sealed class InternalSecretFilter : IAsyncActionFilter
{
    private readonly IConfiguration _config;

    public InternalSecretFilter(IConfiguration config) => _config = config;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var expected = _config["INTERNAL_SECRET"] ?? "dev_internal_secret";
        if (!context.HttpContext.Request.Headers.TryGetValue("x-internal-secret", out var secret) ||
            secret != expected)
        {
            context.Result = new ObjectResult(new { success = false, message = "Forbidden" }) { StatusCode = 403 };
            return;
        }
        await next();
    }
}
