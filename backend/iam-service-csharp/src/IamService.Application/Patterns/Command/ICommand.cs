namespace IamService.Application.Patterns.Command;

/// <summary>BP — Command: encapsulates a single auth operation.</summary>
public interface ICommand<TResult> { }

public interface ICommandHandler<in TCommand, TResult>
    where TCommand : ICommand<TResult>
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken ct = default);
}
