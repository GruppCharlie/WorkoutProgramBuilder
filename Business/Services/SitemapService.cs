using System.Text;
using System.Xml;
using Examine;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common;
using WorkoutProgramBuilder.Business.Interface;

namespace WorkoutProgramBuilder.Business.Services;

public interface ISitemapService
{
    string GenerateSitemap();
    IEnumerable<IPublishedContent> GetSitemapPages();
}

public class SitemapService( IUmbracoHelperAccessor umbracoHelperAccessor, IUmbracoContextFactory umbracoContextFactory, IPublishedUrlProvider publishedUrlProvider, IExamineManager examineManager, ILogger<SitemapService> logger) : ISitemapService
{
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor = umbracoHelperAccessor;
    private readonly IUmbracoContextFactory _umbracoContextFactory = umbracoContextFactory;
    private readonly IPublishedUrlProvider _publishedUrlProvider = publishedUrlProvider;
    private readonly IExamineManager _examineManager = examineManager;
    private readonly ILogger<SitemapService> _logger = logger;
    private const string DefaultChangeFrequency = "weekly";
    private const decimal DefaultPriority = 0.5m;

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
        
        var settings = new XmlWriterSettings
        {
            Indent = true,
            Encoding = Encoding.UTF8
        };

        using var stringWriter = new StringWriter();
        using var writer = XmlWriter.Create(stringWriter, settings);

        writer.WriteStartDocument();
        writer.WriteStartElement("urlset", "https://www.sitemaps.org/schemas/sitemap/0.9");

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
        writer.WriteStartElement("url");

        var url = page.Url(_publishedUrlProvider, mode: UrlMode.Absolute);
        writer.WriteElementString("loc", url);
        writer.WriteElementString("lastmod", FormatLastModified(page.UpdateDate));
        writer.WriteElementString("changefreq", GetChangeFrequency(page));
        writer.WriteElementString("priority", GetPriority(page).ToString("0.0"));

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
}
