using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;
using System.Globalization;

namespace WorkoutProgramBuilder.Controllers;

public class WorkoutDetailsPageController(
    IMemberManager memberManager,
    IMemberWorkoutsService workoutsService,
    IMemberFavoritesService favoritesService,
    IWorkoutTemplateService workoutTemplateService,
    ILogger<WorkoutDetailsPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IUmbracoPageService pageService) : RenderController(logger, viewEngine, contextAccessor)
{
    private readonly IUmbracoPageService _pageService = pageService;

    private List<(string Name, string? Url)> GetBreadcrumbs()
    {
        var currentCulture = CultureInfo.CurrentCulture.Name;
        var allPages = _pageService.GetAllPages();
        
        var homePage = allPages.FirstOrDefault(x => x.ContentType.Alias == "modularPage");
        var myWorkoutsPage = allPages.FirstOrDefault(x => x.ContentType.Alias == "myWorkoutsPage");
        var workoutsParentPage = myWorkoutsPage?.Parent;
        
        return
        [
            (homePage?.Name ?? "Home", homePage?.Url(culture: currentCulture) ?? "/"),
            (workoutsParentPage?.Name ?? "Workouts", workoutsParentPage?.Url(culture: currentCulture)),
            (myWorkoutsPage?.Name ?? "My Workouts", myWorkoutsPage?.Url(culture: currentCulture)),
            (CurrentPage?.Name ?? "Workout Details", null)
        ];
    }
    
    [HttpGet]
    public async Task<IActionResult> Index([FromQuery] string? workoutId)
    {
        // Allow page to load without workoutId (for Umbraco routing)
        if (string.IsNullOrWhiteSpace(workoutId))
        {
            return CurrentTemplate(CurrentPage);
        }

        var currentMember = await memberManager.GetCurrentMemberAsync();
        
        // Allow unauthenticated users to view workouts (from sessionStorage)
        if (currentMember == null)
        {
            logger.LogInformation("Unauthenticated user viewing workout: {WorkoutId}", workoutId);
            ViewData["IsAuthenticated"] = false;
            ViewData["WorkoutId"] = workoutId;
            return CurrentTemplate(CurrentPage);
        }
        
        var memberId = int.Parse(currentMember.Id);
        
        logger.LogInformation("Looking for workout: {WorkoutId} for member: {MemberId}", workoutId, memberId);
        
        // Check if this is a template workout (from CMS)
        if (workoutId.StartsWith("template-"))
        {
            logger.LogInformation("Loading template workout from CMS: {WorkoutId}", workoutId);
            
            var allPages = _pageService.GetAllPages();
            var workoutsPage = allPages.FirstOrDefault(x => x.ContentType.Alias == "workoutsPage");
            
            if (workoutsPage != null)
            {
                var templates = workoutTemplateService.GetWorkoutTemplates(workoutsPage);
                var templateWorkout = templates.FirstOrDefault(w => w.WorkoutId == workoutId);
                
                if (templateWorkout != null)
                {
                    // Check if workout is favorited or in My Workouts
                    var templateFavorites = favoritesService.GetFavoriteWorkouts(memberId);
                    var templateMemberWorkouts = workoutsService.GetMyWorkouts(memberId);
                    
                    templateWorkout.IsSaved = templateFavorites.Any(w => w.WorkoutId == workoutId);
                    templateWorkout.IsInMyWorkouts = templateMemberWorkouts.Any(w => w.WorkoutId == workoutId);
                    
                    ViewData["Workout"] = templateWorkout;
                    ViewData["IsAuthenticated"] = true;
                    ViewData["CustomBreadcrumbs"] = GetBreadcrumbs();
                    
                    return CurrentTemplate(CurrentPage);
                }
            }
            
            logger.LogWarning("Template workout not found: {WorkoutId}", workoutId);
            return CurrentTemplate(CurrentPage);
        }
        
        // Load from My Workouts (AI-generated workouts)
        var myWorkout = workoutsService.GetWorkoutById(memberId, workoutId);

        if (myWorkout == null)
        {
            logger.LogInformation("Workout not found in DB: {WorkoutId} for member: {MemberId}. Will try to load from sessionStorage.", workoutId, memberId);
            
            // Workout not in DB yet - let JavaScript load it from sessionStorage
            // when user signs up/logs in after generating a workout
            ViewData["IsAuthenticated"] = true; 
            ViewData["WorkoutId"] = workoutId;
            ViewData["LoadFromSessionStorage"] = true; // Signal to load from sessionStorage
            
            // Set breadcrumbs for authenticated user viewing workout from sessionStorage
            ViewData["CustomBreadcrumbs"] = GetBreadcrumbs();
            
            return CurrentTemplate(CurrentPage);
        }
        
        var workout = myWorkout;

        // Check if workout is favorited
        var favoriteWorkouts = favoritesService.GetFavoriteWorkouts(memberId);
        workout.IsSaved = favoriteWorkouts.Any(w => w.WorkoutId == workoutId);
        workout.IsInMyWorkouts = true;

        ViewData["Workout"] = workout;
        ViewData["IsAuthenticated"] = true;
        
        // Override breadcrumbs - only shown when logged in
        ViewData["CustomBreadcrumbs"] = GetBreadcrumbs();

        return CurrentTemplate(CurrentPage);
    }
}
