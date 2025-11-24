using Hangfire;

namespace WorkoutProgramBuilder.Business.ScheduledJobs;

public class HangfireJobsRegistrar : IHostedService
{
    private readonly IRecurringJobManager _recurring;

    public HangfireJobsRegistrar(IRecurringJobManager recurring)
    {
        _recurring = recurring;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _recurring.AddOrUpdate<InactiveMemberCleanupJob>(
            "inactive-member-cleanup",
            job => job.RunAsync(),
            "0 3 * * *");

        _recurring.AddOrUpdate<SitemapRegenerationJob>(
            "sitemap-regeneration",
            job => job.RunAsync(),
            "10 3 * * *");

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
