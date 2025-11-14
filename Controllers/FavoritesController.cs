using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

// Controller for rendering the Favorites page
[Route("favorites")]
[Route("sv/favoriter")]
public class FavoritesController(
    IMemberManager memberManager,
    IMemberFavoritesService favoritesService,
    IMemberWorkoutsService workoutsService,
    ILogger<FavoritesController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IUmbracoPageService pageService) : RenderController(logger, viewEngine, contextAccessor)
{
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberFavoritesService _favoritesService = favoritesService;
    private readonly IMemberWorkoutsService _workoutsService = workoutsService;
    private readonly IUmbracoPageService _pageService = pageService;

    [HttpGet]
    public new async Task<IActionResult> Index()
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
        {
            var loginUrl = _pageService.GetPageUrl("loginPage", "/login");
            return Redirect(loginUrl);
        }

        var memberId = int.Parse(currentMember.Id);

        // Load data using services
        var savedExercises = _favoritesService.GetFavoriteExercises(memberId);
        var savedWorkouts = _favoritesService.GetFavoriteWorkouts(memberId);
        var myWorkouts = _workoutsService.GetMyWorkouts(memberId);

        // Mark exercises as saved
        foreach (var exercise in savedExercises)
        {
            exercise.IsSaved = true;
        }

        // Mark workouts with their status
        foreach (var workout in savedWorkouts)
        {
            workout.IsSaved = true; // Already in favorites
            workout.IsInMyWorkouts = myWorkouts.Any(w => w.WorkoutId == workout.WorkoutId);
        }

        ViewData["Exercises"] = savedExercises;
        ViewData["Workouts"] = savedWorkouts;

        return CurrentTemplate(CurrentPage);
    }
}
