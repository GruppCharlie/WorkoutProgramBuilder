using Microsoft.AspNetCore.Identity;
using Umbraco.Cms.Core.Composing;
using WorkoutProgramBuilder.Business.Interface;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Composers;

public class ServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddHttpClient<IExerciseDbService, ExerciseDbService>();
        builder.Services.AddScoped<ISitemapService, SitemapService>();
        builder.Services.AddScoped<IMemberFavoritesService, MemberFavoritesService>();
        builder.Services.AddScoped<IMemberWorkoutsService, MemberWorkoutsService>();
        builder.Services.Configure<IdentityOptions>(options =>
        {
            options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ ";
            options.Lockout.AllowedForNewUsers = false;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
        });
    }
}
