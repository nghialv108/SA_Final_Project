using IamService.Application.Abstractions;
using IamService.Application.Dtos;
using IamService.Application.Patterns.Composite;
using IamService.Application.Patterns.Iterator;
using IamService.Domain;
using IamService.Domain.Entities;
namespace IamService.Application.Services;

public interface IWorkspaceAppService
{
    Task<object> CreateAsync(string ownerId, string name, string slug, string description, CancellationToken ct = default);
    Task<object> GetByIdAsync(string requesterId, string workspaceId, CancellationToken ct = default);
    Task<IReadOnlyList<object>> GetMineAsync(string userId, CancellationToken ct = default);
    Task<MemberContextDto?> GetMemberContextAsync(string userId, string workspaceId, CancellationToken ct = default);
    Task<IReadOnlyList<WorkspaceMember>> GetMembersAsync(string requesterId, string workspaceId, CancellationToken ct = default);
}

public sealed class WorkspaceAppService : IWorkspaceAppService
{
    private readonly IWorkspaceRepository _workspaces;
    private readonly IWorkspaceMemberRepository _members;
    private readonly IUserRepository _users;

    public WorkspaceAppService(
        IWorkspaceRepository workspaces,
        IWorkspaceMemberRepository members,
        IUserRepository users)
    {
        _workspaces = workspaces;
        _members = members;
        _users = users;
    }

    public async Task<object> CreateAsync(string ownerId, string name, string slug, string description, CancellationToken ct = default)
    {
        if (await _workspaces.FindBySlugAsync(slug, ct) is not null)
            throw new DomainException("Workspace slug already taken", 409);

        var ws = new Workspace
        {
            Name = name.Trim(),
            Slug = slug.Trim().ToLowerInvariant(),
            Description = description ?? "",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        await _workspaces.CreateAsync(ws, ct);
        await _members.CreateMemberAsync(ownerId, ws.Id, "admin", ct);
        return ToJson(ws);
    }

    public async Task<object> GetByIdAsync(string requesterId, string workspaceId, CancellationToken ct = default)
    {
        await EnsureMember(requesterId, workspaceId, ct, "admin", "manager", "member");
        var ws = await _workspaces.FindByIdAsync(workspaceId, ct)
            ?? throw new DomainException("Workspace not found", 404);
        return ToJson(ws);
    }

    public async Task<IReadOnlyList<object>> GetMineAsync(string userId, CancellationToken ct = default)
    {
        var memberships = await _members.FindUserWorkspacesAsync(userId, ct);
        var result = new List<object>();
        foreach (var m in memberships)
        {
            var ws = await _workspaces.FindByIdAsync(m.WorkspaceId, ct);
            if (ws is null) continue;
            result.Add(new
            {
                _id = ws.Id,
                id = ws.Id,
                name = ws.Name,
                slug = ws.Slug,
                description = ws.Description,
                ownerId = ws.OwnerId,
                role = m.Role,
                joinedAt = m.JoinedAt,
            });
        }
        return result;
    }

    public async Task<MemberContextDto?> GetMemberContextAsync(string userId, string workspaceId, CancellationToken ct = default)
    {
        var member = await _members.FindMemberAsync(userId, workspaceId, ct);
        return member is null
            ? null
            : new MemberContextDto(member.WorkspaceId, member.Role, member.JoinedAt);
    }

    public async Task<IReadOnlyList<WorkspaceMember>> GetMembersAsync(string requesterId, string workspaceId, CancellationToken ct = default)
    {
        await EnsureMember(requesterId, workspaceId, ct, "admin", "manager", "member");
        var list = await _members.FindMembersAsync(workspaceId, ct);

        var composite = new WorkspaceMemberComposite(workspaceId);
        foreach (var m in list) composite.Add(new MemberLeaf(m));

        var iterator = new MemberIterator(composite.FlattenMembers());
        var ordered = new List<WorkspaceMember>();
        while (iterator.HasNext) ordered.Add(iterator.Next());
        return ordered;
    }

    private async Task EnsureMember(string userId, string workspaceId, CancellationToken ct, params string[] roles)
    {
        var member = await _members.FindMemberAsync(userId, workspaceId, ct);
        if (member is null) throw new DomainException("You are not a member of this workspace", 403);
        if (!roles.Contains(member.Role))
            throw new DomainException("Forbidden: Insufficient workspace role", 403);
    }

    private static object ToJson(Workspace ws) => new
    {
        id = ws.Id,
        _id = ws.Id,
        name = ws.Name,
        slug = ws.Slug,
        description = ws.Description,
        ownerId = ws.OwnerId,
        logoUrl = ws.LogoUrl,
        storageQuota = ws.StorageQuota,
        storageUsed = ws.StorageUsed,
        isActive = ws.IsActive,
        createdAt = ws.CreatedAt,
        updatedAt = ws.UpdatedAt,
    };
}
