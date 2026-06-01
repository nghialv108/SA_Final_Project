namespace IamService.Api.Middleware;

public sealed class InternalSecretMiddleware(RequestDelegate next, IConfiguration config)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var expected = config["INTERNAL_SECRET"] ?? "dev_internal_secret";
        if (!context.Request.Headers.TryGetValue("x-internal-secret", out var secret) ||
            secret != expected)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { success = false, message = "Forbidden" });
            return;
        }
        await next(context);
    }
}
