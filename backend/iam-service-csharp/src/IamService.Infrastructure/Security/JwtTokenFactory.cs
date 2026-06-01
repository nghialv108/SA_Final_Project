using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IamService.Application.Patterns.Factory;
using IamService.Domain.Entities;
using IamService.Infrastructure.Config;
using Microsoft.IdentityModel.Tokens;

namespace IamService.Infrastructure.Security;

public sealed class JwtTokenFactory : ITokenFactory
{
    private readonly JwtSettingsProvider _settings;

    public JwtTokenFactory(JwtSettingsProvider settings) => _settings = settings;

    public string CreateAccessToken(User user) =>
        Sign(new Dictionary<string, string>
        {
            ["userId"] = user.Id,
            ["email"] = user.Email,
        }, _settings.Secret, _settings.ExpiresIn);

    public string CreateRefreshToken(string userId) =>
        Sign(new Dictionary<string, string> { ["userId"] = userId },
            _settings.RefreshSecret, _settings.RefreshExpiresIn);

    public (string UserId, string Email)? TryValidateAccessToken(string token) =>
        TryRead(token, _settings.Secret, out var claims)
            ? (claims["userId"], claims["email"])
            : null;

    public string? TryValidateRefreshToken(string token) =>
        TryRead(token, _settings.RefreshSecret, out var claims) ? claims["userId"] : null;

    private static string Sign(Dictionary<string, string> payload, string secret, string expiresIn)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = payload.Select(kv => new Claim(kv.Key, kv.Value)).ToList();
        var token = new JwtSecurityToken(
            claims: claims,
            expires: ParseExpiry(expiresIn),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static bool TryRead(string token, string secret, out Dictionary<string, string> claims)
    {
        claims = new Dictionary<string, string>();
        try
        {
            var handler = new JwtSecurityTokenHandler();
            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ClockSkew = TimeSpan.FromSeconds(30),
            }, out var validated);

            if (validated is JwtSecurityToken jwt)
            {
                foreach (var c in jwt.Claims)
                    claims[c.Type] = c.Value;
                return true;
            }
        }
        catch { /* invalid */ }
        return false;
    }

    private static DateTime ParseExpiry(string value)
    {
        if (value.EndsWith('m') && int.TryParse(value[..^1], out var mins))
            return DateTime.UtcNow.AddMinutes(mins);
        if (value.EndsWith('d') && int.TryParse(value[..^1], out var days))
            return DateTime.UtcNow.AddDays(days);
        return DateTime.UtcNow.AddHours(1);
    }
}
