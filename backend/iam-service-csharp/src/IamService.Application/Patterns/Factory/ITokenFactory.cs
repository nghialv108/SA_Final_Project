using IamService.Domain.Entities;

namespace IamService.Application.Patterns.Factory;

/// <summary>CP — Factory Method: subclasses decide token shape.</summary>
public interface ITokenFactory
{
    string CreateAccessToken(User user);
    string CreateRefreshToken(string userId);
    (string UserId, string Email)? TryValidateAccessToken(string token);
    string? TryValidateRefreshToken(string token);
}

public sealed class TokenPair
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
}
