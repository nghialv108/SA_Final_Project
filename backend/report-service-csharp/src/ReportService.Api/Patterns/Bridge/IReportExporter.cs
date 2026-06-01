using System.Text;
using System.Text.Json;

namespace ReportService.Api.Patterns.Bridge;

/// <summary>SP — Bridge: separate report data from export format.</summary>
public interface IReportExporter
{
    string ContentType { get; }
    string Export(object data);
}

public sealed class JsonReportExporter : IReportExporter
{
    public string ContentType => "application/json";
    public string Export(object data) =>
        JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
}

public sealed class CsvReportExporter : IReportExporter
{
    public string ContentType => "text/csv";

    public string Export(object data)
    {
        if (data is not IEnumerable<Dictionary<string, object>> rows)
            return "key,value\nmessage,no tabular data\n";

        var sb = new StringBuilder();
        var list = rows.ToList();
        if (list.Count == 0) return "empty\n";

        var keys = list[0].Keys.ToList();
        sb.AppendLine(string.Join(',', keys));
        foreach (var row in list)
            sb.AppendLine(string.Join(',', keys.Select(k => Escape(row.TryGetValue(k, out var v) ? v?.ToString() : ""))));
        return sb.ToString();
    }

    private static string Escape(string? v)
    {
        var s = v ?? "";
        return s.Contains(',') || s.Contains('"') ? $"\"{s.Replace("\"", "\"\"")}\"" : s;
    }
}
