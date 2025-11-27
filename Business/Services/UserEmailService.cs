using NPoco;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Business.Services;

public class UserEmailService(IDatabase db)
{
    private readonly IDatabase _db = db;

    public async Task<int> SaveAsync(UserEmail user)
    {
        await _db.SaveAsync(user);
        return user.Id;
    }
}

