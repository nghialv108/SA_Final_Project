using IamService.Domain.Entities;

namespace IamService.Application.Patterns.Iterator;

/// <summary>BP — Iterator: traverse members without exposing list internals.</summary>
public interface IMemberIterator
{
    bool HasNext { get; }
    WorkspaceMember Next();
}

public sealed class MemberIterator : IMemberIterator
{
    private readonly IEnumerator<WorkspaceMember> _inner;

    public MemberIterator(IEnumerable<WorkspaceMember> source) =>
        _inner = source.GetEnumerator();

    public bool HasNext
    {
        get
        {
            if (_inner.Current is not null) return true;
            return _inner.MoveNext();
        }
    }

    public WorkspaceMember Next()
    {
        if (!HasNext) throw new InvalidOperationException("No more members");
        var current = _inner.Current!;
        _inner.MoveNext();
        return current;
    }
}
