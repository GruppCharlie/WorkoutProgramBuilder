using Umbraco.Cms.Web.Common.Views;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace WorkoutProgramBuilder.Views
{

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
    }
}
