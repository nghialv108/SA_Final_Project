using Microsoft.AspNetCore.Mvc;
using SearchService.Api.Middleware;
using SearchService.Api.Patterns.Facade;

namespace SearchService.Api.Controllers;

[ApiController]
[Route("search")]
public sealed class SearchController : ControllerBase
{
    private readonly ISearchFacade _search;

    public SearchController(ISearchFacade search) => _search = search;

    [HttpGet]
    public async Task<IActionResult> Find([FromQuery] string q = "", [FromQuery] string type = "all", CancellationToken ct = default)
    {
        var ctx = (GatewayContext)HttpContext.Items["GatewayContext"]!;
        var result = await _search.SearchAsync(ctx.WorkspaceId, q, type.ToLowerInvariant(), ct);
        return Ok(new { success = true, message = "Search completed", data = result });
    }
}
