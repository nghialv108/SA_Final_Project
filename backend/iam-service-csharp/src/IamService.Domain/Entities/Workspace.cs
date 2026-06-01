using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IamService.Domain.Entities;

public class Workspace
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Description { get; set; } = "";
    public string OwnerId { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public long StorageQuota { get; set; } = 5L * 1024 * 1024 * 1024;
    public long StorageUsed { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
