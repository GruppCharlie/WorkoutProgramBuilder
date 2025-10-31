using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using WorkoutProgramBuilder.Business.Interface;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[Route("sitemap.xml")]
public class SitemapController( ISitemapService sitemapService, IMemoryCache cache, ILogger<SitemapController> logger) : Controller
{
    private readonly ISitemapService _sitemapService = sitemapService;
    private readonly IMemoryCache _cache = cache;
    private readonly ILogger<SitemapController> _logger = logger;
    private const string CacheKey = "sitemap_xml";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    [HttpGet]
    public IActionResult Index()
    {
        try
        {
            var sitemap = _cache.GetOrCreate(CacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;
                _logger.LogInformation("Generating sitemap.xml");
                return _sitemapService.GenerateSitemap();
            });

            if (sitemap != null) 
                return Content(sitemap, "application/xml", Encoding.UTF8);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating sitemap");
            return StatusCode(500);
        }
        
        return StatusCode(500);
    }
}
