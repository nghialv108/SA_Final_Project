using SearchService.Api.Middleware;
using SearchService.Api.Patterns.Adapter;
using SearchService.Api.Patterns.Facade;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<ISearchDataSource, MongoCoreSearchAdapter>();
builder.Services.AddScoped<ISearchFacade, SearchFacade>();
builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/health", () => Results.Json(new { success = true, service = "search-service", status = "UP" }));
app.UseMiddleware<GatewayContextMiddleware>();
app.MapControllers();

app.Run();
