using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;
using System.Globalization;

namespace WorkoutProgramBuilder.Controllers;

public class WorkoutGeneratorPageController(
    ILogger<WorkoutGeneratorPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IMemberManager memberManager,
    IMuscleGroupApiService muscleGroupService,
    IUmbracoPageService umbracoPageService) : RenderController(logger, viewEngine, contextAccessor)
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        await LoadMuscleGroupsAsync();
        SetBreadcrumbs(await memberManager.GetCurrentMemberAsync() != null);
        
        return CurrentTemplate(CurrentPage);
    }

    private async Task LoadMuscleGroupsAsync()
    {
        try
        {
            var muscleGroups = await muscleGroupService.GetMuscleGroupsAsync();
            ViewData["MuscleGroups"] = muscleGroups;
            logger.LogInformation("Loaded {MuscleGroupsCount} muscle groups", muscleGroups.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading muscle groups");
            ViewData["MuscleGroups"] = new List<string>(); 
        }
    }

    private void SetBreadcrumbs(bool isLoggedIn)
    {
        var currentCulture = CultureInfo.CurrentCulture.Name;
        var allPages = umbracoPageService.GetAllPages();
        
        var homePage = allPages.FirstOrDefault(x => x.ContentType.Alias == "modularPage");
        var workoutsPage = CurrentPage?.Parent; 
        var myWorkoutsPage = allPages.FirstOrDefault(x => x.ContentType.Alias == "myWorkoutsPage");
        
        var breadcrumbs = new List<(string Name, string? Url)>
        {
            (homePage?.Name(culture: currentCulture) ?? "Home", homePage?.Url(culture: currentCulture) ?? "/"),
            (workoutsPage?.Name(culture: currentCulture) ?? "Workouts", workoutsPage?.Url(culture: currentCulture))
        };
        
        if (isLoggedIn)
        {
            breadcrumbs.Add((myWorkoutsPage?.Name(culture: currentCulture) ?? "My Workouts", myWorkoutsPage?.Url(culture: currentCulture)));
        }

        breadcrumbs.Add((CurrentPage?.Name(culture: currentCulture) ?? "Generator", null));
        
        ViewData["CustomBreadcrumbs"] = breadcrumbs;
    }
}
