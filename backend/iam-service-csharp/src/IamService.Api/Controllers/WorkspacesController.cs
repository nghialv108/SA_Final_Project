using IamService.Application.Services;
using IamService.Api.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace IamService.Api.Controllers;

[ApiController]
[Route("iam/workspaces")]
public sealed class WorkspacesController : ApiControllerBase
{
    private readonly IWorkspaceAppService _workspaces;

    public WorkspacesController(IWorkspaceAppService workspaces) => _workspaces = workspaces;

    [HttpGet("internal/member-context")]
    [ServiceFilter(typeof(InternalSecretFilter))]
    public async Task<IActionResult> MemberContext([FromQuery] string userId, [FromQuery] string workspaceId, CancellationToken ct)
    {
        var ctx = await _workspaces.GetMemberContextAsync(userId, workspaceId, ct);
        return OkEnvelope(ctx);
    }

    [HttpPost]
    [ServiceFilter(typeof(GatewayAuthFilter))]
    public async Task<IActionResult> Create([FromBody] CreateWorkspaceRequest body, CancellationToken ct)
    {
        var ownerId = HttpContext.Items["UserId"]!.ToString()!;
        var ws = await _workspaces.CreateAsync(ownerId, body.Name, body.Slug, body.Description ?? "", ct);
        return CreatedEnvelope(ws);
    }

    [HttpGet("mine")]
    [ServiceFilter(typeof(GatewayAuthFilter))]
    public async Task<IActionResult> Mine(CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        var list = await _workspaces.GetMineAsync(userId, ct);
        return OkEnvelope(list);
    }

    [HttpGet("{id}")]
    [ServiceFilter(typeof(GatewayAuthFilter))]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        var ws = await _workspaces.GetByIdAsync(userId, id, ct);
        return OkEnvelope(ws);
    }

    [HttpGet("{id}/members")]
    [ServiceFilter(typeof(GatewayAuthFilter))]
    public async Task<IActionResult> Members(string id, CancellationToken ct)
    {
        var userId = HttpContext.Items["UserId"]!.ToString()!;
        var members = await _workspaces.GetMembersAsync(userId, id, ct);
        return OkEnvelope(members);
    }

    public record CreateWorkspaceRequest(string Name, string Slug, string? Description);
}
