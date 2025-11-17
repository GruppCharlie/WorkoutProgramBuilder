using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Controllers;

public class WorkoutsPageController(
    ILogger<WorkoutsPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IMemberManager memberManager,
    IMemberFavoritesService favoritesService,
    IMemberWorkoutsService workoutsService,
    IWorkoutTemplateService workoutTemplateService) : RenderController(logger, viewEngine, contextAccessor)
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        try
        {
            if (CurrentPage == null)
            {
                logger.LogWarning("CurrentPage is null in WorkoutsPageController");
                ViewData["WorkoutTemplates"] = new List<SavedWorkoutDto>();
                return CurrentTemplate(CurrentPage);
            }
            
            var workoutTemplates = workoutTemplateService.GetWorkoutTemplates(CurrentPage);
            
            // Set IsSaved and IsInMyWorkouts flags for authenticated users
            var currentMember = await memberManager.GetCurrentMemberAsync();
            if (currentMember != null)
            {
                var memberId = int.Parse(currentMember.Id);
                var favoriteWorkouts = favoritesService.GetFavoriteWorkouts(memberId);
                var memberWorkouts = workoutsService.GetMyWorkouts(memberId);
                
                foreach (var template in workoutTemplates)
                {
                    template.IsSaved = favoriteWorkouts.Any(w => w.WorkoutId == template.WorkoutId);
                    template.IsInMyWorkouts = memberWorkouts.Any(w => w.WorkoutId == template.WorkoutId);
                }
            }
            
            ViewData["WorkoutTemplates"] = workoutTemplates;
            
            return CurrentTemplate(CurrentPage);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error loading workout templates");
            ViewData["WorkoutTemplates"] = new List<SavedWorkoutDto>();
            return CurrentTemplate(CurrentPage);
        }
    }
}
