using ReportService.Api.Patterns.Bridge;
using ReportService.Api.Patterns.Factory;

namespace ReportService.Api.Patterns.Command;

/// <summary>BP — Command: encapsulate report generation request.</summary>
public sealed record GenerateReportCommand(
    string ReportType,
    string Format,
    ReportContext Context);

public interface IReportCommandHandler
{
    Task<ReportOutput> HandleAsync(GenerateReportCommand command, CancellationToken ct);
}

public sealed record ReportOutput(string ContentType, string Body, string FileName);

public sealed class GenerateReportCommandHandler : IReportCommandHandler
{
    private readonly IReportFactory _factory;
    private readonly IEnumerable<IReportExporter> _exporters;

    public GenerateReportCommandHandler(IReportFactory factory, IEnumerable<IReportExporter> exporters)
    {
        _factory = factory;
        _exporters = exporters;
    }

    public async Task<ReportOutput> HandleAsync(GenerateReportCommand command, CancellationToken ct)
    {
        var builder = _factory.Create(command.ReportType);
        var data = await builder.BuildAsync(command.Context, ct);

        IReportExporter exporter = command.Format.ToLowerInvariant() switch
        {
            "csv" => _exporters.OfType<CsvReportExporter>().First(),
            _ => _exporters.OfType<JsonReportExporter>().First(),
        };

        var body = exporter.Export(data);
        var ext = exporter is CsvReportExporter ? "csv" : "json";
        return new ReportOutput(exporter.ContentType, body, $"{command.ReportType}.{ext}");
    }
}
