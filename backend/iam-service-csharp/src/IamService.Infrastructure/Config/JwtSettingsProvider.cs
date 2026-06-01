using Microsoft.Extensions.Configuration;

namespace IamService.Infrastructure.Config;

/// <summary>CP — Singleton: one shared JWT configuration for the process.</summary>
public sealed class JwtSettingsProvider
{
    private static JwtSettingsProvider? _instance;
    private static readonly object Lock = new();

    public string Secret { get; }
    public string RefreshSecret { get; }
    public string ExpiresIn { get; }
    public string RefreshExpiresIn { get; }

    private JwtSettingsProvider(IConfiguration config)
    {
        Secret = config["JWT_SECRET"] ?? "dev_access_secret";
        RefreshSecret = config["JWT_REFRESH_SECRET"] ?? "dev_refresh_secret";
        ExpiresIn = config["JWT_EXPIRES_IN"] ?? "15m";
        RefreshExpiresIn = config["JWT_REFRESH_EXPIRES_IN"] ?? "7d";
    }

    public static JwtSettingsProvider Instance(IConfiguration config)
    {
        if (_instance is not null) return _instance;
        lock (Lock)
        {
            _instance ??= new JwtSettingsProvider(config);
        }
        return _instance;
    }
}
