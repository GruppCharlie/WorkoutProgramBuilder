using Hangfire;
using Umbraco.Cms.Core.Composing;
using WorkoutProgramBuilder.Business.Options;
using WorkoutProgramBuilder.Business.ScheduledJobs;

namespace WorkoutProgramBuilder.Composers;

public class HangfireJobsComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.Configure<InactiveMemberCleanupOptions>(
            builder.Config.GetSection("Cleanup:InactiveMembers"));
        builder.Services.AddTransient<InactiveMemberCleanupJob>();
        builder.Services.AddHostedService<HangfireJobsRegistrar>();
    }
}
