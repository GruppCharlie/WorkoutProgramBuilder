using System.Globalization;
using System.Text;
using System.Xml;
using Examine;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common;

namespace WorkoutProgramBuilder.Business.Services;

public interface ISitemapService
{
    string GenerateSitemap();
    string GenerateSitemapIndex();
    string GenerateSitemapForCulture(string culture);
    IEnumerable<IPublishedContent> GetSitemapPages();
}

public class SitemapService( IUmbracoHelperAccessor umbracoHelperAccessor, IUmbracoContextFactory umbracoContextFactory, IPublishedUrlProvider publishedUrlProvider, IExamineManager examineManager, 
    ILogger<SitemapService> logger, IHttpContextAccessor httpContextAccessor) : ISitemapService
{
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor = umbracoHelperAccessor;
    private readonly IUmbracoContextFactory _umbracoContextFactory = umbracoContextFactory;
    private readonly IPublishedUrlProvider _publishedUrlProvider = publishedUrlProvider;
    private readonly IExamineManager _examineManager = examineManager;
    private readonly ILogger<SitemapService> _logger = logger;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    
    private const string DefaultChangeFrequency = "weekly";
    private const decimal DefaultPriority = 0.5m;
    private const string SitemapNamespace = "https://www.sitemaps.org/schemas/sitemap/0.9";
    private const string XhtmlNamespace = "http://www.w3.org/1999/xhtml";
    
    private static readonly XmlWriterSettings XmlSettings = new()
    {
        Indent = true,
        Encoding = Encoding.UTF8,
        NewLineOnAttributes = false,
        IndentChars = "  ",
        NewLineHandling = NewLineHandling.Replace
    };

    public string GenerateSitemap()
    {
        using var contextReference = _umbracoContextFactory.EnsureUmbracoContext();
        var umbracoContext = contextReference.UmbracoContext;
        var pages = GetSitemapPages();
        return BuildXmlSitemap(pages, umbracoContext);
    }

    public IEnumerable<IPublishedContent> GetSitemapPages()
    {
        if (!_umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper))
        {
            _logger.LogWarning("Could not get Umbraco helper");
            return [];
        }

        // Use Examine to get ALL published content
        if (!_examineManager.TryGetIndex(Constants.UmbracoIndexes.ExternalIndexName, out var index))
        {
            _logger.LogError("Could not get Examine index");
            return [];
        }

        var searcher = index.Searcher;
        var results = searcher.CreateQuery().All().Execute();

        var allPages = new List<IPublishedContent>();

        foreach (var result in results)
        {
            if (int.TryParse(result.Id, out var nodeId))
            {
                var content = umbracoHelper.Content(nodeId);
                if (content != null)
                {
                    allPages.Add(content);
                }
            }
        }
        
        var filteredPages = allPages.Where(ShouldIncludeInSitemap).ToList();
        _logger.LogInformation("Generating sitemap with {Count} pages", filteredPages.Count);
        
        return filteredPages;
    }

    private bool ShouldIncludeInSitemap(IPublishedContent page)
    {
        return !IsExcludedDocumentType(page) && !IsExcludedFromSitemap(page);
    }

    private bool IsExcludedDocumentType(IPublishedContent page)
    {
        var excludedTypes = new[] { "settings", "navbar", "footer", "folder" };
        return excludedTypes.Contains(page.ContentType.Alias);
    }

    private bool IsExcludedFromSitemap(IPublishedContent page)
    {
        return page.HasValue("excludeFromSitemap") && page.Value<bool>("excludeFromSitemap");
    }

    private string BuildXmlSitemap(IEnumerable<IPublishedContent> pages, IUmbracoContext umbracoContext)
    {
        var pagesList = pages.ToList();

        using var stringWriter = new StringWriter();
        using var writer = XmlWriter.Create(stringWriter, XmlSettings);

        writer.WriteStartDocument();
        writer.WriteStartElement("urlset", SitemapNamespace);
        writer.WriteAttributeString("xmlns", "xhtml", null, XhtmlNamespace);

        foreach (var page in pagesList)
        {
            WriteUrlEntry(writer, page, umbracoContext);
        }

        writer.WriteEndElement();
        writer.WriteEndDocument();
        writer.Flush();

        return stringWriter.ToString();
    }

    private void WriteUrlEntry(XmlWriter writer, IPublishedContent page, IUmbracoContext _)
    {
        var cultures = page.Cultures.Keys.ToList();
        
        if (cultures.Count == 0)
        {
            // No cultures, write single entry
            WriteSingleUrlEntry(writer, page, null);
            return;
        }

        // Write entry for each published culture
        foreach (var culture in cultures)
        {
            if (page.IsPublished(culture))
            {
                WriteSingleUrlEntry(writer, page, culture);
            }
        }
    }

    private void WriteSingleUrlEntry(XmlWriter writer, IPublishedContent page, string? culture)
    {
        writer.WriteStartElement("url", SitemapNamespace);

        var url = page.Url(_publishedUrlProvider, culture, mode: UrlMode.Absolute);
        writer.WriteElementString("loc", SitemapNamespace, url);
        writer.WriteElementString("lastmod", SitemapNamespace, FormatLastModified(page.UpdateDate));
        writer.WriteElementString("changefreq", SitemapNamespace, GetChangeFrequency(page));
        writer.WriteElementString("priority", SitemapNamespace, GetPriority(page).ToString("0.0", CultureInfo.InvariantCulture));

        writer.WriteEndElement();
    }

    private string FormatLastModified(DateTime date)
    {
        return date.ToString("yyyy-MM-ddTHH:mm:sszzz");
    }

    private string GetChangeFrequency(IPublishedContent page)
    {
        // Check if page has its own changefreq value
        if (page.HasValue("sitemapChangeFrequency"))
        {
            var pageValue = page.Value<string>("sitemapChangeFrequency");
            if (!string.IsNullOrWhiteSpace(pageValue))
                return pageValue;
        }

        // Fallback to settings
        if (!_umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper))
            return DefaultChangeFrequency;

        var settingsNode = umbracoHelper.ContentAtRoot()
            .FirstOrDefault(x => x.ContentType.Alias == "settings");

        return settingsNode?.Value<string>("sitemapDefaultChangeFrequency") ?? DefaultChangeFrequency;
    }

    private decimal GetPriority(IPublishedContent page)
    {
        // Check if page has its own priority value
        if (page.HasValue("sitemapPriority"))
        {
            var pageValue = page.Value<decimal?>("sitemapPriority");
            if (pageValue.HasValue)
                return pageValue.Value;
        }

        // Fallback to settings
        if (!_umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper))
            return DefaultPriority;

        var settingsNode = umbracoHelper.ContentAtRoot()
            .FirstOrDefault(x => x.ContentType.Alias == "settings");

        return settingsNode?.Value<decimal>("sitemapDefaultPriority") ?? DefaultPriority;
    }

    public string GenerateSitemapIndex()
    {
        using var contextReference = _umbracoContextFactory.EnsureUmbracoContext();
        
        // Get all available cultures from the site
        var cultures = GetAvailableCultures();
        
        return BuildSitemapIndex(cultures);
    }

    public string GenerateSitemapForCulture(string culture)
    {
        using var contextReference = _umbracoContextFactory.EnsureUmbracoContext();
        var pages = GetSitemapPages();
        
        return BuildCultureSitemap(pages, culture);
    }

    private List<string> GetAvailableCultures()
    {
        if (!_umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper))
        {
            _logger.LogWarning("Could not get Umbraco helper for cultures");
            return [];
        }

        var homePage = umbracoHelper.ContentAtRoot().FirstOrDefault();
        if (homePage == null)
            return [];

        return homePage.Cultures.Keys.ToList();
    }

    private string BuildSitemapIndex(List<string> cultures)
    {
        using var stringWriter = new StringWriter();
        using var writer = XmlWriter.Create(stringWriter, XmlSettings);

        writer.WriteStartDocument();
        writer.WriteStartElement("sitemapindex", SitemapNamespace);

        var baseUrl = GetBaseUrl();
        
        foreach (var culture in cultures)
        {
            writer.WriteStartElement("sitemap", SitemapNamespace);
            
            var cultureSlug = culture.ToLowerInvariant();
            writer.WriteElementString("loc", SitemapNamespace, $"{baseUrl}/{cultureSlug}/sitemap.xml");
            // writer.WriteElementString("lastmod", SitemapNamespace, FormatLastModified(DateTime.UtcNow));
            
            writer.WriteEndElement();
        }

        writer.WriteEndElement();
        writer.WriteEndDocument();
        writer.Flush();

        return stringWriter.ToString();
    }

    private string BuildCultureSitemap(IEnumerable<IPublishedContent> pages, string culture)
    {
        var pagesList = pages.Where(p => p.IsPublished(culture)).ToList();

        using var stringWriter = new StringWriter();
        using var writer = XmlWriter.Create(stringWriter, XmlSettings);

        writer.WriteStartDocument();
        writer.WriteStartElement("urlset", SitemapNamespace);

        foreach (var page in pagesList)
        {
            WriteCultureUrlEntry(writer, page, culture);
        }

        writer.WriteEndElement();
        writer.WriteEndDocument();
        writer.Flush();

        return stringWriter.ToString();
    }

    private void WriteCultureUrlEntry(XmlWriter writer, IPublishedContent page, string culture)
    {
        writer.WriteStartElement("url", SitemapNamespace);

        var url = page.Url(_publishedUrlProvider, culture, mode: UrlMode.Absolute);
        writer.WriteElementString("loc", SitemapNamespace, url);
        writer.WriteElementString("lastmod", SitemapNamespace, FormatLastModified(page.UpdateDate));
        writer.WriteElementString("changefreq", SitemapNamespace, GetChangeFrequency(page));
        writer.WriteElementString("priority", SitemapNamespace, GetPriority(page).ToString("0.0", CultureInfo.InvariantCulture));

        writer.WriteEndElement();
    }

    private string GetBaseUrl()
    {
        // Try to get base URL from current HTTP request
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request != null)
        {
            var scheme = request.Scheme;
            var host = request.Host.Value;
            return $"{scheme}://{host}";
        }

        // Fallback to Umbraco's absolute URL
        if (_umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper))
        {
            var homePage = umbracoHelper.ContentAtRoot().FirstOrDefault();
            if (homePage != null)
            {
                var url = homePage.Url(_publishedUrlProvider, mode: UrlMode.Absolute);
                return url.TrimEnd('/');
            }
        }

        throw new InvalidOperationException("Could not determine base URL for sitemap generation");
    }
}
