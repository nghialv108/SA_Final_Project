using IamService.Application.Abstractions;
using Microsoft.Extensions.Logging;

namespace IamService.Infrastructure.Email;

public sealed class NoOpEmailSender : IEmailSender
{
    private readonly ILogger<NoOpEmailSender> _logger;
    public NoOpEmailSender(ILogger<NoOpEmailSender> logger) => _logger = logger;

    public Task SendResetPasswordAsync(string email, string resetLink, CancellationToken ct = default)
    {
        _logger.LogInformation("Password reset for {Email}: {Link}", email, resetLink);
        return Task.CompletedTask;
    }
}
