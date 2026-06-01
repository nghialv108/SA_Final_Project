using MongoDB.Driver;
using SearchService.Api.Models;

namespace SearchService.Api.Patterns.Adapter;

/// <summary>SP — Adapter: unify project/task sources behind one interface.</summary>
public interface ISearchDataSource
{
    Task<IReadOnlyList<ProjectDoc>> GetProjectsAsync(string workspaceId, CancellationToken ct);
    Task<IReadOnlyList<TaskDoc>> GetTasksAsync(string workspaceId, CancellationToken ct);
}

public sealed class MongoCoreSearchAdapter : ISearchDataSource
{
    private readonly IMongoDatabase _db;

    public MongoCoreSearchAdapter(IConfiguration config)
    {
        var uri = config["CORE_MONGO_URI"] ?? "mongodb://localhost:27017/core_service";
        var client = new MongoClient(uri);
        var dbName = MongoUrl.Create(uri).DatabaseName ?? "core_service";
        _db = client.GetDatabase(dbName);
    }

    public async Task<IReadOnlyList<ProjectDoc>> GetProjectsAsync(string workspaceId, CancellationToken ct) =>
        await _db.GetCollection<ProjectDoc>("projects")
            .Find(p => p.WorkspaceId == workspaceId && !p.IsArchived)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<TaskDoc>> GetTasksAsync(string workspaceId, CancellationToken ct) =>
        await _db.GetCollection<TaskDoc>("tasks")
            .Find(t => t.WorkspaceId == workspaceId && !t.IsArchived)
            .ToListAsync(ct);
}
