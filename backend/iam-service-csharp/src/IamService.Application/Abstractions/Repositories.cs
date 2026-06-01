using IamService.Domain.Entities;

namespace IamService.Application.Abstractions;

public interface IUserRepository
{
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> FindByEmailWithPasswordAsync(string email, CancellationToken ct = default);
    Task<User?> FindByIdAsync(string id, CancellationToken ct = default);
    Task<User?> FindByIdWithPasswordAsync(string id, CancellationToken ct = default);
    Task<User?> FindByResetTokenAsync(string token, CancellationToken ct = default);
    Task<User> CreateAsync(User user, CancellationToken ct = default);
    Task UpdateAsync(string id, Action<User> update, CancellationToken ct = default);
}

public interface IWorkspaceRepository
{
    Task<Workspace?> FindByIdAsync(string id, CancellationToken ct = default);
    Task<Workspace?> FindBySlugAsync(string slug, CancellationToken ct = default);
    Task<Workspace> CreateAsync(Workspace workspace, CancellationToken ct = default);
    Task<Workspace?> UpdateAsync(string id, Action<Workspace> update, CancellationToken ct = default);
}

public interface IWorkspaceMemberRepository
{
    Task<WorkspaceMember?> FindMemberAsync(string userId, string workspaceId, CancellationToken ct = default);
    Task<IReadOnlyList<WorkspaceMember>> FindMembersAsync(string workspaceId, CancellationToken ct = default);
    Task<IReadOnlyList<WorkspaceMember>> FindUserWorkspacesAsync(string userId, CancellationToken ct = default);
    Task<WorkspaceMember> CreateMemberAsync(string userId, string workspaceId, string role, CancellationToken ct = default);
    Task DeactivateMemberAsync(string userId, string workspaceId, CancellationToken ct = default);
    Task<WorkspaceMember?> UpdateRoleAsync(string userId, string workspaceId, string role, CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string Hash(string plain);
    bool Verify(string plain, string hash);
}

public interface IEmailSender
{
    Task SendResetPasswordAsync(string email, string resetLink, CancellationToken ct = default);
}
