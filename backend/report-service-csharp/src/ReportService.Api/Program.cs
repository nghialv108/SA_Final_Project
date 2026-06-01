using ReportService.Api.Clients;
using ReportService.Api.Middleware;
using ReportService.Api.Patterns.Bridge;
using ReportService.Api.Patterns.Command;
using ReportService.Api.Patterns.Factory;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<CoreAnalyticsClient>();
builder.Services.AddSingleton<IReportFactory, ReportFactory>();
builder.Services.AddScoped<WorkspaceSummaryReportBuilder>();
builder.Services.AddScoped<ProjectStatusReportBuilder>();
builder.Services.AddSingleton<IReportExporter, JsonReportExporter>();
builder.Services.AddSingleton<IReportExporter, CsvReportExporter>();
builder.Services.AddScoped<IReportCommandHandler, GenerateReportCommandHandler>();
builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/health", () => Results.Json(new { success = true, service = "report-service", status = "UP" }));
app.UseMiddleware<GatewayContextMiddleware>();
app.MapControllers();

app.Run();
