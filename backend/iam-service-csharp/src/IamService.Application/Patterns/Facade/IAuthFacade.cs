using IamService.Application.Dtos;

namespace IamService.Application.Patterns.Facade;

/// <summary>SP — Facade: simplified API for auth flows.</summary>
public interface IAuthFacade
{
    Task<AuthResultDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default);
    Task<AuthResultDto> LoginAsync(LoginDto dto, CancellationToken ct = default);
    Task<TokenPairDto> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task LogoutAsync(string userId, CancellationToken ct = default);
    Task ForgotPasswordAsync(string email, CancellationToken ct = default);
    Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken ct = default);
    Task ChangePasswordAsync(string userId, ChangePasswordDto dto, CancellationToken ct = default);
}
