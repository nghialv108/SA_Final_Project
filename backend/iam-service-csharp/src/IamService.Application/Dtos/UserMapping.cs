using IamService.Application.Dtos;
using IamService.Domain.Entities;

namespace IamService.Application.Dtos;

public static class UserMapping
{
    public static UserDto ToDto(this User user) => new(
        user.Id,
        user.Email,
        user.FullName,
        user.AvatarUrl,
        user.IsVerified,
        user.IsActive,
        user.LastLoginAt,
        user.CreatedAt,
        user.UpdatedAt);
}
