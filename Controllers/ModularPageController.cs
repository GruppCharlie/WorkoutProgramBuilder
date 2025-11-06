using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers
{
    public class ModularPageController(
        ILogger<ModularPageController> logger,
        ICompositeViewEngine viewEngine,
        IUmbracoContextAccessor contextAccessor,
        IMemberManager memberManager,
        IMemberFavoritesService memberFavoritesService,
        IMemberWorkoutsService memberWorkoutsService) : RenderController(logger, viewEngine, contextAccessor)
    {
        private readonly IMemberManager _memberManager = memberManager;
        private readonly IMemberFavoritesService _memberFavoritesService = memberFavoritesService;
        private readonly IMemberWorkoutsService _memberWorkoutsService = memberWorkoutsService;

        [HttpGet]
        public async Task<IActionResult> Index([FromQuery] int offset = 0)
        {
            try
            {
                var templateAlias = CurrentPage?.GetTemplateAlias() ?? "";
                
                // Template-specific logic
                switch (templateAlias.ToLowerInvariant())
                {
                    case "myworkoutspage":
                        await LoadMyWorkoutsPageData();
                        break;
                    
                    case "workoutpage":
                        // Implement WorkoutPage for CMS workout templates
                        break;
                    
                    // WorkoutGeneratorPage doesn't need server-side data
                    case "workoutgeneratorpage":
                    default:
                        break;
                }
                
                // Return the template assigned to this page
                return CurrentTemplate(CurrentPage);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in ModularPageController");
                ViewData["Exercises"] = new List<ExerciseDto>();
                return CurrentTemplate(CurrentPage);
            }
        }
        
        private async Task LoadMyWorkoutsPageData()
        {
            logger.LogInformation("Loading workouts for MyWorkoutsPage");
            
            var currentMember = await _memberManager.GetCurrentMemberAsync();
            
            if (currentMember == null)
            {
                ViewData["Workouts"] = new List<SavedWorkoutDto>();
                return;
            }

            var memberId = int.Parse(currentMember.Id);

            // services instead of manual JSON parsing
            var workouts = _memberWorkoutsService.GetMyWorkouts(memberId);
            var savedWorkouts = _memberFavoritesService.GetFavoriteWorkouts(memberId);

            // Mark workouts with their status
            foreach (var workout in workouts)
            {
                workout.IsInMyWorkouts = true; 
                workout.IsSaved = savedWorkouts.Any(w => w.WorkoutId == workout.WorkoutId);
            }
            
            ViewData["Workouts"] = workouts;
            logger.LogInformation($"Loaded {workouts.Count} workouts");
        }
    }
}
