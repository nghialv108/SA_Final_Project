using IamService.Application.Abstractions;
using IamService.Application.Patterns.Factory;
using IamService.Domain.Entities;

namespace IamService.Application.Patterns.Builder;

/// <summary>CP — Builder: step-by-step construction of issued tokens + persistence.</summary>
public sealed class TokenPairBuilder
{
    private readonly ITokenFactory _tokenFactory;
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private User? _user;

    public TokenPairBuilder(ITokenFactory tokenFactory, IUserRepository users, IPasswordHasher hasher)
    {
        _tokenFactory = tokenFactory;
        _users = users;
        _hasher = hasher;
    }

    public TokenPairBuilder ForUser(User user)
    {
        _user = user;
        return this;
    }

    public async Task<TokenPair> BuildAndPersistAsync(CancellationToken ct = default)
    {
        if (_user is null) throw new InvalidOperationException("User is required");

        var pair = new TokenPair
        {
            AccessToken = _tokenFactory.CreateAccessToken(_user),
            RefreshToken = _tokenFactory.CreateRefreshToken(_user.Id),
        };

        var hash = _hasher.Hash(pair.RefreshToken);
        await _users.UpdateAsync(_user.Id, u =>
        {
            u.RefreshTokenHash = hash;
            u.LastLoginAt = DateTime.UtcNow;
        }, ct);

        return pair;
    }
}
