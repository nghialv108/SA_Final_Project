using IamService.Application.Abstractions;
using IamService.Application.Commands;
using IamService.Application.Dtos;
using IamService.Application.Patterns.Command;
using IamService.Application.Patterns.Facade;
using IamService.Application.Patterns.Factory;
using IamService.Application.Services;
using IamService.Infrastructure.Config;
using IamService.Infrastructure.Email;
using IamService.Infrastructure.Persistence;
using IamService.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IamService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var jwt = JwtSettingsProvider.Instance(config);
        services.AddSingleton(jwt);
        services.AddSingleton<MongoContext>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
        services.AddScoped<IWorkspaceMemberRepository, WorkspaceMemberRepository>();
        services.AddSingleton<ITokenFactory, JwtTokenFactory>();
        services.AddSingleton<IPasswordHashImplementation, BcryptImplementation>();
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<IEmailSender, NoOpEmailSender>();
        services.AddScoped<ICommandHandler<LoginCommand, AuthResultDto>, LoginCommandHandler>();
        services.AddScoped<IAuthFacade, AuthFacade>();
        services.AddScoped<IUserAppService, UserAppService>();
        services.AddScoped<IWorkspaceAppService, WorkspaceAppService>();
        return services;
    }
}
