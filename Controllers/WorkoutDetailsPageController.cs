using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

public class WorkoutDetailsPageController(
    IMemberManager memberManager,
    IMemberWorkoutsService workoutsService,
    IMemberFavoritesService favoritesService,
    ILogger<WorkoutDetailsPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor) : RenderController(logger, viewEngine, contextAccessor)
{
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
        
        var workout = workoutsService.GetWorkoutById(memberId, workoutId);
        
        logger.LogInformation("Looking for workout: {WorkoutId} for member: {MemberId}", workoutId, memberId);
        

        if (workout == null)
        {
            logger.LogWarning("Workout not found: {WorkoutId} for member: {MemberId}", workoutId, memberId);
            
            var allWorkouts = workoutsService.GetMyWorkouts(memberId);
            logger.LogWarning("Available workouts: {Count}", allWorkouts.Count);
            foreach (var w in allWorkouts.Take(5))
            {
                logger.LogWarning("  - WorkoutId: {Id}, Name: {Name}", w.WorkoutId, w.Name);
            }
            
            return CurrentTemplate(CurrentPage);
        }

        // Check if workout is favorited
        var favoriteWorkouts = favoritesService.GetFavoriteWorkouts(memberId);
        workout.IsSaved = favoriteWorkouts.Any(w => w.WorkoutId == workoutId);
        workout.IsInMyWorkouts = true; // Already in My Workouts

        ViewData["Workout"] = workout;
        ViewData["IsAuthenticated"] = true;
        
        // Override breadcrumbs - only shown when logged in
        ViewData["CustomBreadcrumbs"] = new List<(string Name, string? Url)>
        {
            ("Home", "/"),
            ("Workouts", "/workouts"),
            ("My Workouts", "/workouts/my-workouts"),
            ("Workout Details", null)
        };

        return CurrentTemplate(CurrentPage);
    }
}
