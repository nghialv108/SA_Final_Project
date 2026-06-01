using IamService.Application.Abstractions;

namespace IamService.Infrastructure.Security;

/// <summary>SP — Bridge: abstraction (IPasswordHasher) decoupled from BCrypt implementation.</summary>
public interface IPasswordHashImplementation
{
    string Hash(string plain);
    bool Verify(string plain, string hash);
}

public sealed class BcryptImplementation : IPasswordHashImplementation
{
    public string Hash(string plain) => BCrypt.Net.BCrypt.HashPassword(plain);
    public bool Verify(string plain, string hash) => BCrypt.Net.BCrypt.Verify(plain, hash);
}

public sealed class BcryptPasswordHasher : IPasswordHasher
{
    private readonly IPasswordHashImplementation _impl;
    public BcryptPasswordHasher(IPasswordHashImplementation impl) => _impl = impl;
    public string Hash(string plain) => _impl.Hash(plain);
    public bool Verify(string plain, string hash) => _impl.Verify(plain, hash);
}
