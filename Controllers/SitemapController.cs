using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using WorkoutProgramBuilder.Business.Interface;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

public class SitemapController( ISitemapService sitemapService, IMemoryCache cache, ILogger<SitemapController> logger) : Controller
{
    private readonly ISitemapService _sitemapService = sitemapService;
    private readonly IMemoryCache _cache = cache;
    private readonly ILogger<SitemapController> _logger = logger;
    
    private const string CacheKeySitemap = "sitemap_xml";
    private const string CacheKeySitemapIndex = "sitemap_index";
    private const string CacheKeyCulturePrefix = "sitemap_";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    [HttpGet]
    [Route("sitemap.xml")]
    public IActionResult Index()
    {
        try
        {
            var sitemap = _cache.GetOrCreate(CacheKeySitemap, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;
                _logger.LogInformation("Generating sitemap.xml");
                return _sitemapService.GenerateSitemap();
            });

            if (string.IsNullOrEmpty(sitemap))
            {
                _logger.LogWarning("Sitemap generation returned empty result");
                return NotFound("No content available for sitemap");
            }

            return Content(sitemap, "application/xml", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating sitemap");
            return StatusCode(500);
        }
    }

    [HttpGet]
    [Route("sitemapindex.xml")]
    public IActionResult SitemapIndex()
    {
        try
        {
            var sitemapIndex = _cache.GetOrCreate(CacheKeySitemapIndex, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;
                _logger.LogInformation("Generating sitemapindex.xml");
                return _sitemapService.GenerateSitemapIndex();
            });

            if (string.IsNullOrEmpty(sitemapIndex))
            {
                _logger.LogWarning("Sitemap index generation returned empty result");
                return NotFound("No content available for sitemap index");
            }

            return Content(sitemapIndex, "application/xml", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating sitemap index");
            return StatusCode(500);
        }
    }

    [HttpGet]
    [Route("{culture}/sitemap.xml")]
    public IActionResult CultureSitemap(string culture)
    {
        try
        {
            var cacheKey = $"{CacheKeyCulturePrefix}{culture}";
            var sitemap = _cache.GetOrCreate(cacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;
                _logger.LogInformation("Generating sitemap for culture: {Culture}", culture);
                return _sitemapService.GenerateSitemapForCulture(culture);
            });

            if (string.IsNullOrEmpty(sitemap))
            {
                _logger.LogWarning("Sitemap generation for culture {Culture} returned empty result", culture);
                return NotFound($"No content available for culture {culture}");
            }

            return Content(sitemap, "application/xml", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating sitemap for culture {Culture}", culture);
            return StatusCode(500);
        }
    }

    [HttpGet]
    [Route("sitemap-clear-cache")]
    public IActionResult ClearCache()
    {
        _cache.Remove(CacheKeySitemap);
        _cache.Remove(CacheKeySitemapIndex);
        _cache.Remove($"{CacheKeyCulturePrefix}en-us");
        _cache.Remove($"{CacheKeyCulturePrefix}sv");
        _logger.LogInformation("All sitemap caches cleared");
        return Redirect("/sitemapindex.xml");
    }
}
