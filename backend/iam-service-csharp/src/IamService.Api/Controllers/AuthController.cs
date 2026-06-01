using IamService.Application.Dtos;
using IamService.Application.Patterns.Facade;
using IamService.Api.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace IamService.Api.Controllers;

[ApiController]
[Route("iam/auth")]
public sealed class AuthController : ApiControllerBase
{
    private readonly IAuthFacade _auth;

    public AuthController(IAuthFacade auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken ct)
    {
        var result = await _auth.RegisterAsync(dto, ct);
        return CreatedEnvelope(result, "Registration successful");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(dto, ct);
        return OkEnvelope(result, "Login successful");
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest body, CancellationToken ct)
    {
        var tokens = await _auth.RefreshAsync(body.RefreshToken, ct);
        return OkEnvelope(tokens, "Token refreshed");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot([FromBody] ForgotRequest body, CancellationToken ct)
    {
        await _auth.ForgotPasswordAsync(body.Email, ct);
        return OkEnvelope(null, "If that email exists, a reset link has been sent");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> Reset([FromBody] ResetPasswordDto dto, CancellationToken ct)
    {
        await _auth.ResetPasswordAsync(dto, ct);
        return OkEnvelope(null, "Password reset successfully");
    }

    [HttpPost("logout")]
    [ServiceFilter(typeof(GatewayAuthFilter))]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        await _auth.LogoutAsync(userId, ct);
        return OkEnvelope(null, "Logged out successfully");
    }

    [HttpPut("change-password")]
    [ServiceFilter(typeof(GatewayAuthFilter))]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        await _auth.ChangePasswordAsync(userId, dto, ct);
        return OkEnvelope(null, "Password changed successfully");
    }

    public record RefreshRequest(string RefreshToken);
    public record ForgotRequest(string Email);
}
