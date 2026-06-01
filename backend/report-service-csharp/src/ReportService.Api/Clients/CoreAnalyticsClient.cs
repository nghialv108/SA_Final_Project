using System.Net.Http.Headers;
using System.Text.Json;

namespace ReportService.Api.Clients;

public sealed class CoreAnalyticsClient
{
    private readonly HttpClient _http;
    private readonly string _secret;

    public CoreAnalyticsClient(HttpClient http, IConfiguration config)
    {
        _http = http;
        _http.BaseAddress = new Uri(config["CORE_SERVICE_URL"] ?? "http://localhost:3002");
        _secret = config["INTERNAL_SECRET"] ?? "dev_internal_secret";
    }

    public async Task<JsonElement> GetTasksByStatusAsync(
        string userId, string workspaceId, string role, string projectId, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get,
            $"/core/analytics/tasks/by-status?projectId={Uri.EscapeDataString(projectId)}");
        AddHeaders(req, userId, workspaceId, role);
        var res = await _http.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();
        using var doc = await JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        return doc.RootElement.GetProperty("data").Clone();
    }

    public async Task<JsonElement> GetOverdueTasksAsync(
        string userId, string workspaceId, string role, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, "/core/analytics/tasks/overdue");
        AddHeaders(req, userId, workspaceId, role);
        var res = await _http.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();
        using var doc = await JsonDocument.ParseAsync(await res.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        return doc.RootElement.GetProperty("data").Clone();
    }

    private void AddHeaders(HttpRequestMessage req, string userId, string workspaceId, string role)
    {
        req.Headers.Add("x-internal-secret", _secret);
        req.Headers.Add("x-user-id", userId);
        req.Headers.Add("x-workspace-id", workspaceId);
        req.Headers.Add("x-user-role", role);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }
}
