using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IamService.Domain.Entities;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public bool IsVerified { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ResetPasswordToken { get; set; }
    public DateTime? ResetPasswordExpires { get; set; }
    public string? RefreshTokenHash { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
