using Microsoft.Extensions.Options;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Options;

public class InactiveMemberCleanupJob
{
    private readonly ILogger<InactiveMemberCleanupJob> _logger;
    private readonly IMemberService _memberService;
    private readonly IOptionsMonitor<InactiveMemberCleanupOptions> _options;

    public InactiveMemberCleanupJob(
        ILogger<InactiveMemberCleanupJob> logger,
        IMemberService memberService,
        IOptionsMonitor<InactiveMemberCleanupOptions> options)
    {
        _logger = logger;
        _memberService = memberService;
        _options = options;
    }

    public async Task RunAsync()
    {
        var cfg = _options.CurrentValue;
        if (!cfg.Enabled)
        {
            _logger.LogInformation("Inactive member cleanup job is disabled.");
            return;
        }

        var cutoffUtc = DateTime.UtcNow.AddMonths(-Math.Abs(cfg.MonthsInactive));
        var pageSize = Math.Max(1, cfg.PageSize);

        _logger.LogInformation("InactiveMemberCleanup: starting. Cutoff (UTC) = {Cutoff}, PageSize = {PageSize}", cutoffUtc, pageSize);

        int pageIndex = 0;
        long total = 0;
        int deleted = 0, scanned = 0;

        do
        {
            var skip = pageIndex * pageSize;

            var members = _memberService.GetAll(
                skip: (int)skip,
                take: pageSize,
                totalRecords: out total,
                orderBy: "CreateDate",
                orderDirection: Direction.Ascending);

            foreach (var member in members)
            {
                scanned++;

                DateTime? lastLogin = (member.LastLoginDate.HasValue && member.LastLoginDate.Value != DateTime.MinValue)
                    ? member.LastLoginDate.Value.ToUniversalTime()
                    : (DateTime?)null;

                var activity = lastLogin ?? member.CreateDate.ToUniversalTime();

                if (activity < cutoffUtc)
                {
                    try
                    {
                        _memberService.Delete(member);
                        deleted++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error deleting member with ID {MemberId} and username {Username}", member.Id, member.Username);
                    }
                }
            }

            pageIndex++;
            await Task.Yield();

        } while (pageIndex * pageSize < total);

        _logger.LogInformation(
            "InactiveMemberCleanup: completed. Scanned {Scanned}, Deleted {Deleted}",
            scanned, deleted);
    }
}