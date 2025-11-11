using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

public class MyWorkoutsPageController(
    ILogger<MyWorkoutsPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IMemberManager memberManager,
    IMemberFavoritesService memberFavoritesService,
    IMemberWorkoutsService memberWorkoutsService) : RenderController(logger, viewEngine, contextAccessor)
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        try
        {
            logger.LogInformation("Loading workouts for MyWorkoutsPage");
            
            var currentMember = await memberManager.GetCurrentMemberAsync();
            
            if (currentMember == null)
            {
                ViewData["Workouts"] = new List<SavedWorkoutDto>();
                return CurrentTemplate(CurrentPage);
            }

            var memberId = int.Parse(currentMember.Id);

            var workouts = memberWorkoutsService.GetMyWorkouts(memberId);
            var savedWorkouts = memberFavoritesService.GetFavoriteWorkouts(memberId);

            // Mark workouts with their status
            foreach (var workout in workouts)
            {
                workout.IsInMyWorkouts = true; 
                workout.IsSaved = savedWorkouts.Any(w => w.WorkoutId == workout.WorkoutId);
            }
            
            ViewData["Workouts"] = workouts;
            logger.LogInformation($"Loaded {workouts.Count} workouts");
            
            return CurrentTemplate(CurrentPage);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in MyWorkoutsPageController");
            ViewData["Workouts"] = new List<SavedWorkoutDto>();
            return CurrentTemplate(CurrentPage);
        }
    }
}
