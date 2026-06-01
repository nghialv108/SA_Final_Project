using IamService.Application.Dtos;
using IamService.Application.Patterns.Command;

namespace IamService.Application.Commands;

public sealed record LoginCommand(LoginDto Dto) : ICommand<AuthResultDto>;
