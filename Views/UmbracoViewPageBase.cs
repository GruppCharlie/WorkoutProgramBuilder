using Umbraco.Cms.Web.Common.Views;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Models.Blocks;

namespace WorkoutProgramBuilder.Views;

// Base view class with helper methods for all Umbraco views
public abstract class UmbracoViewPageBase<T> : UmbracoViewPage<T> where T : IPublishedContent
{
    private readonly Dictionary<string, string> _urlCache = new();
        
    // Get URL for a page by content type alias with caching
    // Content type alias (e.g. "workoutGeneratorPage")
    // Fallback URL if page not found
    protected string GetPageUrl(string contentTypeAlias, string fallbackUrl = "")
    {
        // Check cache first
        if (_urlCache.TryGetValue(contentTypeAlias, out var cachedUrl))
            return cachedUrl;

        // Lookup page
        var root = Umbraco.ContentAtRoot().FirstOrDefault();
        var allPages = root?.DescendantsOrSelf() ?? [];
        var currentCulture = System.Globalization.CultureInfo.CurrentCulture.Name;
        var page = allPages.FirstOrDefault(x => x.ContentType.Alias == contentTypeAlias);
        var url = page?.Url(culture: currentCulture) ?? fallbackUrl;

        // Cache result
        _urlCache[contentTypeAlias] = url;
            
        return url;
    }


    // Gets a text value with fallback if null or whitespace
    protected string GetTextOrFallback(string? value, string fallback) 
        => string.IsNullOrWhiteSpace(value) ? fallback : value;
    

    // Get settings node from content root
    protected IPublishedContent? GetSettingsNode()
    {
        return Umbraco.ContentAtRoot().FirstOrDefault(x => x.ContentType.Alias == "settings");
    }

    // Parse language selector items from block list
    protected List<LanguageItem> ParseLanguageItems(IEnumerable<BlockListItem>? languageBlocks)
    {
        var items = (languageBlocks ?? [])
            .Select(block =>
            {
                var link = block?.Content.Value<string>("socialMediaUrl") ?? block?.Content.Value<string>("languageUrl");
                var iconUrl = block?.Content.Value<IPublishedContent>("socialMediaIcon")?.Url() ?? block?.Content.Value<IPublishedContent>("flag")?.Url();
                var culture = block?.Content.Value<string>("languageCulture") ?? block?.Content.Value<string>("culture");
                var name = block?.Content.Value<string>("socialMediaName") ?? block?.Content.Value<string>("languageName") ?? culture ?? link;
                
                return new LanguageItem
                {
                    Block = block,
                    Link = link,
                    Icon = iconUrl,
                    Culture = culture,
                    Name = name
                };
            })
            .Where(x => !string.IsNullOrEmpty(x.Link) && !string.IsNullOrEmpty(x.Icon))
            .ToList();

        return items;
    }
}

// Helper class for language items
public class LanguageItem
{
    public BlockListItem? Block { get; set; }
    public string? Link { get; set; }
    public string? Icon { get; set; }
    public string? Culture { get; set; }
    public string? Name { get; set; }
}