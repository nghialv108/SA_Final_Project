using Microsoft.AspNetCore.Mvc;

namespace IamService.Api.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult OkEnvelope(object? data, string message = "Success") =>
        Ok(new { success = true, message, data });

    protected IActionResult CreatedEnvelope(object? data, string message = "Created") =>
        StatusCode(201, new { success = true, message, data });
}
