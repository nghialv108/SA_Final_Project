using IamService.Application.Services;
using IamService.Api.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace IamService.Api.Controllers;

[ApiController]
[Route("iam/users")]
[ServiceFilter(typeof(GatewayAuthFilter))]
public sealed class UsersController : ApiControllerBase
{
    private readonly IUserAppService _users;

    public UsersController(IUserAppService users) => _users = users;

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        var user = await _users.GetMeAsync(userId, ct);
        return OkEnvelope(user);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest body, CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        var user = await _users.UpdateProfileAsync(userId, body.FullName, body.AvatarUrl, ct);
        return OkEnvelope(user);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(id, ct);
        return OkEnvelope(user);
    }

    [HttpPatch("{id}/deactivate")]
    public Task<IActionResult> Deactivate(string id, CancellationToken ct) =>
        DeactivateInternal(id, ct);

    private async Task<IActionResult> DeactivateInternal(string id, CancellationToken ct)
    {
        await _users.DeactivateAsync(id, ct);
        return OkEnvelope(null, "User deactivated");
    }

    public record UpdateProfileRequest(string FullName, string? AvatarUrl);
}
