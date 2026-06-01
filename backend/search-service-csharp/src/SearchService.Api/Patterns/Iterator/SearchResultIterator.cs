using SearchService.Api.Models;

namespace SearchService.Api.Patterns.Iterator;

/// <summary>BP — Iterator: traverse search hits without exposing list structure.</summary>
public interface ISearchResultIterator
{
    bool HasNext { get; }
    SearchHit Next();
}

public sealed class SearchResultIterator : ISearchResultIterator
{
    private readonly IEnumerator<SearchHit> _inner;

    public SearchResultIterator(IEnumerable<SearchHit> hits) => _inner = hits.GetEnumerator();

    public bool HasNext
    {
        get
        {
            if (_inner.Current is not null) return true;
            return _inner.MoveNext();
        }
    }

    public SearchHit Next()
    {
        if (!HasNext) throw new InvalidOperationException("No more results");
        var hit = _inner.Current!;
        _inner.MoveNext();
        return hit;
    }
}
