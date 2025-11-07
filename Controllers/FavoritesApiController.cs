using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/favorites")]
public class FavoritesApiController(IMemberManager memberManager, IMemberFavoritesService favoritesService, ILogger<FavoritesApiController> logger) : ControllerBase
{
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberFavoritesService _favoritesService = favoritesService;
    private readonly ILogger<FavoritesApiController> _logger = logger;
    
    [HttpPost("exercise")]
    public async Task<IActionResult> ToggleFavoriteExercise([FromBody] ExerciseDto exercise)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(exercise.ExerciseId))
            return BadRequest("ExerciseId is required.");

        var success = _favoritesService.ToggleFavoriteExercise(int.Parse(currentMember.Id), exercise);
        
        if (!success)
            return Problem("Failed to toggle favorite exercise");

        return Ok();
    }

    [HttpPost("workout")]
    public async Task<IActionResult> ToggleFavoriteWorkout([FromBody] SavedWorkoutDto workout)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(workout.WorkoutId))
            return BadRequest("WorkoutId is required.");

        var success = _favoritesService.ToggleFavoriteWorkout(int.Parse(currentMember.Id), workout);
        
        if (!success)
            return Problem("Failed to toggle favorite workout");

        return Ok();
    }
}
