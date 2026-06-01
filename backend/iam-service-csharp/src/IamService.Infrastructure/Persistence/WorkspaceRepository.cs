using IamService.Application.Abstractions;
using IamService.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace IamService.Infrastructure.Persistence;

public sealed class WorkspaceRepository : IWorkspaceRepository
{
    private readonly MongoContext _db;
    public WorkspaceRepository(MongoContext db) => _db = db;

    public Task<Workspace?> FindByIdAsync(string id, CancellationToken ct = default) =>
        _db.Workspaces.Find(w => w.Id == id).FirstOrDefaultAsync(ct)!;

    public Task<Workspace?> FindBySlugAsync(string slug, CancellationToken ct = default) =>
        _db.Workspaces.Find(w => w.Slug == slug.ToLower()).FirstOrDefaultAsync(ct)!;

    public async Task<Workspace> CreateAsync(Workspace workspace, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(workspace.Id))
            workspace.Id = ObjectId.GenerateNewId().ToString();
        workspace.CreatedAt = workspace.UpdatedAt = DateTime.UtcNow;
        await _db.Workspaces.InsertOneAsync(workspace, cancellationToken: ct);
        return workspace;
    }

    public async Task<Workspace?> UpdateAsync(string id, Action<Workspace> update, CancellationToken ct = default)
    {
        var ws = await FindByIdAsync(id, ct);
        if (ws is null) return null;
        update(ws);
        ws.UpdatedAt = DateTime.UtcNow;
        await _db.Workspaces.ReplaceOneAsync(w => w.Id == id, ws, cancellationToken: ct);
        return ws;
    }
}
