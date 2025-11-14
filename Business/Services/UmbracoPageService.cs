using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;

namespace WorkoutProgramBuilder.Business.Services;

/*
 * Service for common Umbraco page operations
 * Shared between controllers and views 
 */
public interface IUmbracoPageService
{
    IEnumerable<IPublishedContent> GetAllPages();
    string GetPageUrl(string contentTypeAlias, string fallbackUrl);
}

public class UmbracoPageService(IUmbracoContextAccessor contextAccessor) : IUmbracoPageService
{
    private readonly IUmbracoContextAccessor _contextAccessor = contextAccessor;

    public IEnumerable<IPublishedContent> GetAllPages()
    {
        var context = _contextAccessor.GetRequiredUmbracoContext();
        var cache = context.Content;
        var root = cache.GetAtRoot().FirstOrDefault();
        return root?.DescendantsOrSelf() ?? [];
    }
    
    public string GetPageUrl(string contentTypeAlias, string fallbackUrl)
    {
        var currentCulture = System.Globalization.CultureInfo.CurrentCulture.Name;
        var allPages = GetAllPages();
        var page = allPages.FirstOrDefault(x => x.ContentType.Alias == contentTypeAlias);
        return page?.Url(culture: currentCulture) ?? fallbackUrl;
    }
}
