using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IamService.Domain.Entities;

public class WorkspaceMember
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;
    public string WorkspaceId { get; set; } = null!;
    public string Role { get; set; } = "member";
    public DateTime JoinedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
