using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/favorites")]
public class FavoritesApiController( IMemberManager memberManager, IMemberFavoritesService favoritesService, IMemberWorkoutsService workoutsService, ILogger<FavoritesApiController> logger) : ControllerBase
{
    [HttpPost("exercise")]
    public async Task<IActionResult> ToggleFavoriteExercise([FromBody] ExerciseDto exercise)
    {
        var currentMember = await memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(exercise.ExerciseId))
            return BadRequest("ExerciseId is required.");

        var success = favoritesService.ToggleFavoriteExercise(int.Parse(currentMember.Id), exercise);
        
        if (!success)
            return Problem("Failed to toggle favorite exercise");

        return Ok();
    }

    [HttpPost("workout")]
    public async Task<IActionResult> ToggleFavoriteWorkout([FromBody] SavedWorkoutDto workout)
    {
        var currentMember = await memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(workout.WorkoutId))
            return BadRequest("WorkoutId is required.");

        var success = favoritesService.ToggleFavoriteWorkout(int.Parse(currentMember.Id), workout);
        
        if (!success)
            return Problem("Failed to toggle favorite workout");

        return Ok();
    }

    [HttpPost("my-workout")]
    public async Task<IActionResult> ToggleMyWorkout([FromBody] SavedWorkoutDto workout)
    {
        try
        {
            var currentMember = await memberManager.GetCurrentMemberAsync();
            if (currentMember == null)
            {
                logger.LogWarning("No current member found");
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(workout.WorkoutId))
            {
                logger.LogWarning("Invalid workout payload");
                return BadRequest("Invalid payload.");
            }

            logger.LogInformation("Toggling My Workout: {WorkoutId} for member {MemberId}", 
                workout.WorkoutId, currentMember.Id);

            var success = workoutsService.ToggleMyWorkout(int.Parse(currentMember.Id), workout);
            
            if (!success)
            {
                logger.LogError("Failed to toggle My Workout for member {MemberId}", currentMember.Id);
                return Problem("Failed to toggle My Workout");
            }

            logger.LogInformation("Successfully toggled My Workout for member {MemberId}", currentMember.Id);
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error toggling My Workout");
            return StatusCode(500, "Internal server error");
        }
    }
}
