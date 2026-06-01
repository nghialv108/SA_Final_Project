using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SearchService.Api.Models;

public class ProjectDoc
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string Description { get; set; } = "";
    [BsonRepresentation(BsonType.ObjectId)]
    public string WorkspaceId { get; set; } = null!;

    public bool IsArchived { get; set; }
}

public class TaskDoc
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string Title { get; set; } = null!;
    public string Description { get; set; } = "";
    [BsonRepresentation(BsonType.ObjectId)]
    public string ProjectId { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string WorkspaceId { get; set; } = null!;
    public string Status { get; set; } = "todo";
    public string Priority { get; set; } = "medium";
    public bool IsArchived { get; set; }
}

public sealed class SearchHit
{
    public required string Type { get; init; }
    public required string Id { get; init; }
    public required string Title { get; init; }
    public string? Subtitle { get; init; }
    public object? Meta { get; init; }
}
