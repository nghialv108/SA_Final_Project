using System.Security.Cryptography;
using IamService.Application.Abstractions;
using IamService.Application.Commands;
using IamService.Application.Dtos;
using IamService.Application.Patterns.Builder;
using IamService.Application.Patterns.Command;
using IamService.Application.Patterns.Factory;
using IamService.Domain;
using IamService.Domain.Entities;
using IamService.Domain.Patterns.State;

namespace IamService.Application.Patterns.Facade;

public sealed class AuthFacade : IAuthFacade
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenFactory _tokens;
    private readonly IEmailSender _email;
    private readonly ICommandHandler<LoginCommand, AuthResultDto> _loginHandler;
    private readonly string _clientUrl;

    public AuthFacade(
        IUserRepository users,
        IPasswordHasher hasher,
        ITokenFactory tokens,
        IEmailSender email,
        ICommandHandler<LoginCommand, AuthResultDto> loginHandler,
        Microsoft.Extensions.Configuration.IConfiguration config)
    {
        _users = users;
        _hasher = hasher;
        _tokens = tokens;
        _email = email;
        _loginHandler = loginHandler;
        _clientUrl = config["CLIENT_URL"] ?? "http://localhost:5173";
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default)
    {
        var existing = await _users.FindByEmailAsync(dto.Email, ct);
        if (existing is not null) throw new DomainException("Email already in use", 409);

        var user = new User
        {
            Email = dto.Email.Trim().ToLowerInvariant(),
            FullName = dto.FullName.Trim(),
            Password = _hasher.Hash(dto.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        user = await _users.CreateAsync(user, ct);

        var pair = await new TokenPairBuilder(_tokens, _users, _hasher).ForUser(user).BuildAndPersistAsync(ct);
        var clean = await _users.FindByIdAsync(user.Id, ct) ?? user;
        return new AuthResultDto(clean.ToDto(), pair.AccessToken, pair.RefreshToken);
    }

    public Task<AuthResultDto> LoginAsync(LoginDto dto, CancellationToken ct = default) =>
     _loginHandler.HandleAsync(new LoginCommand(dto), ct);
    public async Task<TokenPairDto> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var userId = _tokens.TryValidateRefreshToken(refreshToken)
            ?? throw new DomainException("Invalid or expired refresh token", 401);

        var user = await _users.FindByIdWithPasswordAsync(userId, ct);
        if (user?.RefreshTokenHash is null || !_hasher.Verify(refreshToken, user.RefreshTokenHash))
            throw new DomainException("Invalid refresh token", 401);

        var pair = await new TokenPairBuilder(_tokens, _users, _hasher).ForUser(user).BuildAndPersistAsync(ct);
        return new TokenPairDto(pair.AccessToken, pair.RefreshToken);
    }

    public async Task LogoutAsync(string userId, CancellationToken ct = default) =>
        await _users.UpdateAsync(userId, u => u.RefreshTokenHash = null, ct);

    public async Task ForgotPasswordAsync(string email, CancellationToken ct = default)
    {
        var user = await _users.FindByEmailAsync(email, ct);
        if (user is null) return;

        var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var expires = DateTime.UtcNow.AddMinutes(15);
        await _users.UpdateAsync(user.Id, u =>
        {
            u.ResetPasswordToken = resetToken;
            u.ResetPasswordExpires = expires;
        }, ct);

        var link = $"{_clientUrl}/reset-password?token={resetToken}";
        await _email.SendResetPasswordAsync(user.Email, link, ct);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default)
    {
        var user = await _users.FindByResetTokenAsync(dto.Token, ct)
            ?? throw new DomainException("Invalid or expired reset token", 400);

        await _users.UpdateAsync(user.Id, u =>
        {
            u.Password = _hasher.Hash(dto.Password);
            u.ResetPasswordToken = null;
            u.ResetPasswordExpires = null;
            u.RefreshTokenHash = null;
        }, ct);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordDto dto, CancellationToken ct = default)
    {
        var user = await _users.FindByIdWithPasswordAsync(userId, ct)
            ?? throw new DomainException("User not found", 404);

        if (!_hasher.Verify(dto.CurrentPassword, user.Password))
            throw new DomainException("Current password is incorrect", 400);

        await _users.UpdateAsync(userId, u =>
        {
            u.Password = _hasher.Hash(dto.NewPassword);
            u.RefreshTokenHash = null;
        }, ct);
    }
}

public sealed class LoginCommandHandler : ICommandHandler<LoginCommand, AuthResultDto>
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenFactory _tokens;

    public LoginCommandHandler(IUserRepository users, IPasswordHasher hasher, ITokenFactory tokens)
    {
        _users = users;
        _hasher = hasher;
        _tokens = tokens;
    }

    public async Task<AuthResultDto> HandleAsync(LoginCommand command, CancellationToken ct = default)
    {
        var user = await _users.FindByEmailWithPasswordAsync(command.Dto.Email, ct);
        if (user is null || !_hasher.Verify(command.Dto.Password, user.Password))
            throw new DomainException("Invalid email or password", 401);

        AccountStateFactory.FromUser(user).EnsureCanLogin(user);
        var pair = await new TokenPairBuilder(_tokens, _users, _hasher).ForUser(user).BuildAndPersistAsync(ct);
        var clean = await _users.FindByIdAsync(user.Id, ct) ?? user;
        return new AuthResultDto(clean.ToDto(), pair.AccessToken, pair.RefreshToken);
    }
}
