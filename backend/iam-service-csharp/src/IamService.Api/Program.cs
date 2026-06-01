using IamService.Api.Middleware;
using IamService.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<GatewayAuthFilter>();
builder.Services.AddScoped<InternalSecretFilter>();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.MapControllers();
app.MapGet("/health", () => Results.Json(new { success = true, service = "iam-service", status = "UP" }));

app.Run();
