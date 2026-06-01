using SearchService.Api.Models;
using SearchService.Api.Patterns.Adapter;
using SearchService.Api.Patterns.Iterator;

namespace SearchService.Api.Patterns.Facade;

/// <summary>SP — Facade: single entry for project + task search.</summary>
public interface ISearchFacade
{
    Task<SearchResponse> SearchAsync(string workspaceId, string query, string type, CancellationToken ct);
}

public sealed record SearchResponse(string Query, int Total, IReadOnlyList<SearchHit> Results);

public sealed class SearchFacade : ISearchFacade
{
    private readonly ISearchDataSource _source;

    public SearchFacade(ISearchDataSource source) => _source = source;

    public async Task<SearchResponse> SearchAsync(string workspaceId, string query, string type, CancellationToken ct)
    {
        var q = query.Trim().ToLowerInvariant();
        var hits = new List<SearchHit>();

        if (type is "all" or "projects")
        {
            var projects = await _source.GetProjectsAsync(workspaceId, ct);
            hits.AddRange(projects
                .Where(p => Matches(q, p.Name, p.Description))
                .Select(p => new SearchHit
                {
                    Type = "project",
                    Id = p.Id,
                    Title = p.Name,
                    Subtitle = p.Description,
                    Meta = new { p.WorkspaceId },
                }));
        }

        if (type is "all" or "tasks")
        {
            var tasks = await _source.GetTasksAsync(workspaceId, ct);
            hits.AddRange(tasks
                .Where(t => Matches(q, t.Title, t.Description))
                .Select(t => new SearchHit
                {
                    Type = "task",
                    Id = t.Id,
                    Title = t.Title,
                    Subtitle = t.Status,
                    Meta = new { t.ProjectId, t.Status, t.Priority },
                }));
        }

        var iterator = new SearchResultIterator(hits.OrderBy(h => h.Type).ThenBy(h => h.Title));
        var ordered = new List<SearchHit>();
        while (iterator.HasNext) ordered.Add(iterator.Next());

        return new SearchResponse(query, ordered.Count, ordered);
    }

    private static bool Matches(string q, params string[] fields)
    {
        if (string.IsNullOrEmpty(q)) return true;
        return fields.Any(f => (f ?? "").ToLowerInvariant().Contains(q));
    }
}
