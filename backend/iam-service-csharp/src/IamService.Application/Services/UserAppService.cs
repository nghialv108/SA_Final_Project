using IamService.Application.Abstractions;
using IamService.Application.Dtos;
using IamService.Domain;

namespace IamService.Application.Services;

public interface IUserAppService
{
    Task<UserDto> GetMeAsync(string userId, CancellationToken ct = default);
    Task<UserDto> UpdateProfileAsync(string userId, string fullName, string? avatarUrl, CancellationToken ct = default);
    Task<UserDto> GetByIdAsync(string id, CancellationToken ct = default);
    Task DeactivateAsync(string id, CancellationToken ct = default);
}

public sealed class UserAppService : IUserAppService
{
    private readonly IUserRepository _users;

    public UserAppService(IUserRepository users) => _users = users;

    public async Task<UserDto> GetMeAsync(string userId, CancellationToken ct = default)
    {
        var user = await _users.FindByIdAsync(userId, ct)
            ?? throw new DomainException("User not found", 404);
        return user.ToDto();
    }

    public async Task<UserDto> UpdateProfileAsync(string userId, string fullName, string? avatarUrl, CancellationToken ct = default)
    {
        await _users.UpdateAsync(userId, u =>
        {
            u.FullName = fullName.Trim();
            if (avatarUrl is not null) u.AvatarUrl = avatarUrl;
        }, ct);
        return await GetMeAsync(userId, ct);
    }

    public async Task<UserDto> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var user = await _users.FindByIdAsync(id, ct)
            ?? throw new DomainException("User not found", 404);
        return user.ToDto();
    }

    public async Task DeactivateAsync(string id, CancellationToken ct = default) =>
        await _users.UpdateAsync(id, u => u.IsActive = false, ct);
}
