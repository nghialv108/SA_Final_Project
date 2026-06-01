using IamService.Domain.Entities;

namespace IamService.Domain.Patterns.State;

/// <summary>BP — State: behavior of login depends on account status.</summary>
public interface IAccountState
{
    void EnsureCanLogin(User user);
}

public sealed class ActiveAccountState : IAccountState
{
    public void EnsureCanLogin(User user) { }
}

public sealed class DeactivatedAccountState : IAccountState
{
    public void EnsureCanLogin(User user) =>
        throw new DomainException("Account has been deactivated", 403);
}

public static class AccountStateFactory
{
    public static IAccountState FromUser(User user) =>
        user.IsActive ? new ActiveAccountState() : new DeactivatedAccountState();
}
