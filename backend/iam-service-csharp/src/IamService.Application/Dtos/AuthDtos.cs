namespace IamService.Application.Dtos;

public record RegisterDto(string FullName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record ResetPasswordDto(string Token, string Password);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

public record UserDto(
    string Id,
    string Email,
    string FullName,
    string? AvatarUrl,
    bool IsVerified,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record TokenPairDto(string AccessToken, string RefreshToken);

public record AuthResultDto(UserDto User, string AccessToken, string RefreshToken);

public record MemberContextDto(string WorkspaceId, string Role, DateTime JoinedAt);
