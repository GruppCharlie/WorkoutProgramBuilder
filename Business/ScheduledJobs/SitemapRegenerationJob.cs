using Microsoft.Extensions.Caching.Memory;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Business.ScheduledJobs;

public class SitemapRegenerationJob( ISitemapService sitemapService, IMemoryCache cache, ILogger<SitemapRegenerationJob> logger)
{
    private readonly ISitemapService _sitemapService = sitemapService;
    private readonly IMemoryCache _cache = cache;
    private readonly ILogger<SitemapRegenerationJob> _logger = logger;

    private const string CacheKey = "sitemap_xml";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    public Task RunAsync()
    {
        try
        {
            _logger.LogInformation("SitemapRegenerationJob started.");

            var sitemap = _sitemapService.GenerateSitemap();

            if (string.IsNullOrWhiteSpace(sitemap))
            {
                _logger.LogWarning("Generated sitemap is empty.");
                return Task.CompletedTask;
            }

            _cache.Set(CacheKey, sitemap, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CacheDuration
            });

            _logger.LogInformation("Sitemap successfully regenerated and cached.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during sitemap regeneration.");
        }

        return Task.CompletedTask;
    }
}
