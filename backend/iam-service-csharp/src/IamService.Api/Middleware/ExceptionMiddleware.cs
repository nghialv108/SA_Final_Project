using System.Net;
using System.Text.Json;
using IamService.Domain;

namespace IamService.Api.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (DomainException ex)
        {
            await WriteAsync(context, ex.StatusCode, ex.Message);
        }
        catch (Exception)
        {
            await WriteAsync(context, (int)HttpStatusCode.InternalServerError, "Internal server error");
        }
    }

    private static Task WriteAsync(HttpContext ctx, int code, string message)
    {
        ctx.Response.StatusCode = code;
        ctx.Response.ContentType = "application/json";
        var body = JsonSerializer.Serialize(new { success = false, message });
        return ctx.Response.WriteAsync(body);
    }
}
