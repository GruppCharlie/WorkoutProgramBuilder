using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

// Controller for rendering the Favorites page 
// API endpoints moved to FavoritesApiController
[Route("favorites")]
[Route("sv/favoriter")]
public class FavoritesController(
    IMemberManager memberManager,
    IMemberFavoritesService favoritesService,
    IMemberWorkoutsService workoutsService,
    ILogger<FavoritesController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor) : RenderController(logger, viewEngine, contextAccessor)
{
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberFavoritesService _favoritesService = favoritesService;
    private readonly IMemberWorkoutsService _workoutsService = workoutsService;
    private readonly IUmbracoContextAccessor _contextAccessor = contextAccessor;

    [HttpGet]
    public new async Task<IActionResult> Index()
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
        {
            if (!_contextAccessor.TryGetUmbracoContext(out var umbracoContext) || umbracoContext == null)
                return Redirect("/login");

            var contentCache = umbracoContext.Content;
            var loginNode = contentCache
                .GetAtRoot()
                .SelectMany(r => r.DescendantsOrSelf())
                .FirstOrDefault(x => x.ContentType.Alias == "loginPage");

            var culture = System.Globalization.CultureInfo.CurrentCulture.Name;
            var loginUrl = loginNode?.Url(culture: culture) ?? "/login";

            return Redirect(loginUrl);
        }

        var memberId = int.Parse(currentMember.Id);

        // Load data using services
        var savedExercises = _favoritesService.GetFavoriteExercises(memberId);
        var savedWorkouts = _favoritesService.GetFavoriteWorkouts(memberId);
        var myWorkouts = _workoutsService.GetMyWorkouts(memberId);

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

    // Backward compatibility endpoints - redirect to services
    [HttpPost("save")]
    [Obsolete("Use /api/favorites/exercise instead")]
    public async Task<IActionResult> SaveFavoriteExercise([FromBody] Business.Dto.ExerciseDto exercise)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        var memberId = int.Parse(currentMember.Id);
        _favoritesService.ToggleFavoriteExercise(memberId, exercise);
        return Ok();
    }

    [HttpPost("save-workout")]
    [Obsolete("Use /api/favorites/workout instead")]
    public async Task<IActionResult> SaveFavoriteWorkout([FromBody] Business.Dto.SavedWorkoutDto workout)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        var memberId = int.Parse(currentMember.Id);
        _favoritesService.ToggleFavoriteWorkout(memberId, workout);
        return Ok();
    }

    [HttpPost]
    [Route("/favorites/save-my-workout")]
    [Obsolete("Use /api/favorites/my-workout instead")]
    public async Task<IActionResult> SaveMyWorkout([FromBody] Business.Dto.SavedWorkoutDto workout)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        var memberId = int.Parse(currentMember.Id);
        _workoutsService.ToggleMyWorkout(memberId, workout);
        return Ok();
    }
}
