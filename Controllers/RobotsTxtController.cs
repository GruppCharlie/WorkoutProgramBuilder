using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;

namespace WorkoutProgramBuilder.Controllers;

[Route("robots.txt")]
public class RobotsTxtController(IUmbracoContextAccessor umbracoContextAccessor, ILogger<RobotsTxtController> logger) : Controller
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor = umbracoContextAccessor;
    private readonly ILogger<RobotsTxtController> _logger = logger;

    [HttpGet]
    public IActionResult Index()
    {
        try
        {
            var robotsTxt = GenerateRobotsTxt();
            return Content(robotsTxt, "text/plain");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating robots.txt");
            return StatusCode(500);
        }
    }

    private string GenerateRobotsTxt()
    {
        var sitemapUrl = GetSitemapUrl();

        return $"User-agent: *\n" +
               $"Allow: /\n" +
               $"Disallow: /umbraco/\n" +
               $"Sitemap: {sitemapUrl}";
    }

    private string GetSitemapUrl()
    {
        var scheme = Request.Scheme;
        var host = Request.Host.Value;
        var baseUrl = $"{scheme}://{host}";

        if (_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
        {
            var rootNode = umbracoContext.Content.GetAtRoot().FirstOrDefault();
            if (rootNode != null)
            {
                var absoluteUrl = rootNode.Url(mode: UrlMode.Absolute);
                baseUrl = new Uri(absoluteUrl).GetLeftPart(UriPartial.Authority);
            }
        }

        return $"{baseUrl}/sitemap.xml";
    }
}
