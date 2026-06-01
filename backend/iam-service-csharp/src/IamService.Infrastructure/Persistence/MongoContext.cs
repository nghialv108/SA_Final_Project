using IamService.Domain.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace IamService.Infrastructure.Persistence;

public sealed class MongoContext
{
    public IMongoCollection<User> Users { get; }
    public IMongoCollection<Workspace> Workspaces { get; }
    public IMongoCollection<WorkspaceMember> WorkspaceMembers { get; }

    public MongoContext(IConfiguration config)
    {
        var uri = config["MONGO_URI"] ?? "mongodb://localhost:27017/iam_service";
        var client = new MongoClient(uri);
        var dbName = MongoUrl.Create(uri).DatabaseName ?? "iam_service";
        var db = client.GetDatabase(dbName);
        Users = db.GetCollection<User>("users");
        Workspaces = db.GetCollection<Workspace>("workspaces");
        WorkspaceMembers = db.GetCollection<WorkspaceMember>("workspacemembers");
    }
}
