using IamService.Application.Abstractions;
using IamService.Domain.Entities;
using MongoDB.Driver;

namespace IamService.Infrastructure.Persistence;

public sealed class WorkspaceMemberRepository : IWorkspaceMemberRepository
{
    private readonly MongoContext _db;
    public WorkspaceMemberRepository(MongoContext db) => _db = db;

    public Task<WorkspaceMember?> FindMemberAsync(string userId, string workspaceId, CancellationToken ct = default) =>
        _db.WorkspaceMembers.Find(m =>
            m.UserId == userId && m.WorkspaceId == workspaceId && m.IsActive).FirstOrDefaultAsync(ct)!;

    public async Task<IReadOnlyList<WorkspaceMember>> FindMembersAsync(string workspaceId, CancellationToken ct = default) =>
        await _db.WorkspaceMembers.Find(m => m.WorkspaceId == workspaceId && m.IsActive).ToListAsync(ct);

    public async Task<IReadOnlyList<WorkspaceMember>> FindUserWorkspacesAsync(string userId, CancellationToken ct = default) =>
        await _db.WorkspaceMembers.Find(m => m.UserId == userId && m.IsActive).ToListAsync(ct);

    public async Task<WorkspaceMember> CreateMemberAsync(string userId, string workspaceId, string role, CancellationToken ct = default)
    {
        var member = new WorkspaceMember
        {
            UserId = userId,
            WorkspaceId = workspaceId,
            Role = role,
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        await _db.WorkspaceMembers.InsertOneAsync(member, cancellationToken: ct);
        return member;
    }

    public async Task DeactivateMemberAsync(string userId, string workspaceId, CancellationToken ct = default)
    {
        await _db.WorkspaceMembers.UpdateOneAsync(
            m => m.UserId == userId && m.WorkspaceId == workspaceId,
            Builders<WorkspaceMember>.Update.Set(m => m.IsActive, false),
            cancellationToken: ct);
    }

    public async Task<WorkspaceMember?> UpdateRoleAsync(string userId, string workspaceId, string role, CancellationToken ct = default)
    {
        var member = await FindMemberAsync(userId, workspaceId, ct);
        if (member is null) return null;
        member.Role = role;
        member.UpdatedAt = DateTime.UtcNow;
        await _db.WorkspaceMembers.ReplaceOneAsync(m => m.Id == member.Id, member, cancellationToken: ct);
        return member;
    }
}
