using IamService.Domain.Entities;

namespace IamService.Application.Patterns.Composite;

/// <summary>SP — Composite: treat single member and member collections uniformly.</summary>
public interface IMemberNode
{
    string WorkspaceId { get; }
    int Count { get; }
}

public sealed class MemberLeaf : IMemberNode
{
    public WorkspaceMember Member { get; }
    public MemberLeaf(WorkspaceMember member) => Member = member;
    public string WorkspaceId => Member.WorkspaceId;
    public int Count => 1;
}

public sealed class WorkspaceMemberComposite : IMemberNode
{
    private readonly List<IMemberNode> _children = [];

    public WorkspaceMemberComposite(string workspaceId) => WorkspaceId = workspaceId;
    public string WorkspaceId { get; }
    public int Count => _children.Sum(c => c.Count);

    public void Add(IMemberNode node) => _children.Add(node);

    public IEnumerable<WorkspaceMember> FlattenMembers() =>
        _children.SelectMany(c => c switch
        {
            MemberLeaf leaf => [leaf.Member],
            WorkspaceMemberComposite group => group.FlattenMembers(),
            _ => [],
        });
}
