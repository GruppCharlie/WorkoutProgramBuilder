using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

public class WorkoutGeneratorPageController(
    ILogger<WorkoutGeneratorPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IMemberManager memberManager,
    IMuscleGroupApiService muscleGroupService) : RenderController(logger, viewEngine, contextAccessor)
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        logger.LogInformation("WorkoutGenerator page loaded");
        
        try
        {
            var muscleGroups = await muscleGroupService.GetMuscleGroupsAsync();
            ViewData["MuscleGroups"] = muscleGroups;
            logger.LogInformation($"Loaded {muscleGroups.Count} muscle groups for WorkoutGenerator");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading muscle groups for WorkoutGenerator");
            ViewData["MuscleGroups"] = new List<string>();
        }
        
        // Override breadcrumbs - show My Workouts only if logged in
        var currentMember = await memberManager.GetCurrentMemberAsync();
        if (currentMember != null)
        {
            ViewData["CustomBreadcrumbs"] = new List<(string Name, string? Url)>
            {
                ("Home", "/"),
                ("Workouts", "/workouts"),
                ("My Workouts", "/workouts/my-workouts"),
                ("Generator", null)
            };
        }
        else
        {
            ViewData["CustomBreadcrumbs"] = new List<(string Name, string? Url)>
            {
                ("Home", "/"),
                ("Workouts", "/workouts"),
                ("Generator", null)
            };
        }
        
        return CurrentTemplate(CurrentPage);
    }
}
