using IamService.Application.Abstractions;
using IamService.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace IamService.Infrastructure.Persistence;

public sealed class UserRepository : IUserRepository
{
    private readonly MongoContext _db;
    public UserRepository(MongoContext db) => _db = db;

    public async Task<User?> FindByEmailAsync(string email, CancellationToken ct = default) =>
        await _db.Users.Find(u => u.Email == email.ToLower()).FirstOrDefaultAsync(ct);

    public async Task<User?> FindByEmailWithPasswordAsync(string email, CancellationToken ct = default) =>
        await FindByEmailAsync(email, ct);

    public async Task<User?> FindByIdAsync(string id, CancellationToken ct = default) =>
        await _db.Users.Find(u => u.Id == id).FirstOrDefaultAsync(ct);

    public async Task<User?> FindByIdWithPasswordAsync(string id, CancellationToken ct = default) =>
        await FindByIdAsync(id, ct);

    public async Task<User?> FindByResetTokenAsync(string token, CancellationToken ct = default) =>
        await _db.Users.Find(u =>
            u.ResetPasswordToken == token &&
            u.ResetPasswordExpires > DateTime.UtcNow).FirstOrDefaultAsync(ct);

    public async Task<User> CreateAsync(User user, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(user.Id))
            user.Id = ObjectId.GenerateNewId().ToString();
        user.CreatedAt = user.UpdatedAt = DateTime.UtcNow;
        await _db.Users.InsertOneAsync(user, cancellationToken: ct);
        return user;
    }

    public async Task UpdateAsync(string id, Action<User> update, CancellationToken ct = default)
    {
        var user = await FindByIdWithPasswordAsync(id, ct)
            ?? throw new InvalidOperationException("User not found");
        update(user);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.Users.ReplaceOneAsync(u => u.Id == id, user, cancellationToken: ct);
    }
}
