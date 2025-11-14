using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/favorites")]
public class FavoritesApiController( IMemberManager memberManager, IMemberFavoritesService favoritesService, ILogger<FavoritesApiController> logger) 
    : ApiControllerBase(memberManager, logger)
{
    private readonly IMemberFavoritesService _favoritesService = favoritesService;
    
    [HttpPost("exercise")]
    public async Task<IActionResult> ToggleFavoriteExercise([FromBody] ExerciseDto exercise)
    {
        var memberResult = await GetAuthenticatedMemberAsync();
        if (memberResult.Error != null) return memberResult.Error;

        if (string.IsNullOrWhiteSpace(exercise.ExerciseId))
            return BadRequest("Invalid Request", "ExerciseId is required");

        var success = _favoritesService.ToggleFavoriteExercise(memberResult.MemberId, exercise);
        
        if (!success)
            return Problem("Toggle Failed", "Failed to toggle favorite exercise");

        return Ok();
    }

    [HttpPost("workout")]
    public async Task<IActionResult> ToggleFavoriteWorkout([FromBody] SavedWorkoutDto workout)
    {
        var memberResult = await GetAuthenticatedMemberAsync();
        if (memberResult.Error != null) return memberResult.Error;

        if (string.IsNullOrWhiteSpace(workout.WorkoutId))
            return BadRequest("Invalid Request", "WorkoutId is required");

        var success = _favoritesService.ToggleFavoriteWorkout(memberResult.MemberId, workout);
        
        if (!success)
            return Problem("Toggle Failed", "Failed to toggle favorite workout");

        return Ok();
    }
}
