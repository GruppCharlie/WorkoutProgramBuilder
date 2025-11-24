using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using WorkoutProgramBuilder.Business.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/workout")]
[Produces("application/json")]
public class WorkoutApiController( IRapidApiService rapidApiService, IMemberManager memberManager, IMemberWorkoutsService workoutsService, ILogger<WorkoutApiController> logger) : ApiControllerBase(memberManager, logger)
{
    private const int MinDescriptionLength = 4;
    private const int MaxDescriptionLength = 500;

    // Generate a personalized workout based on muscle groups and description
    // POST /api/workout/generate
    [HttpPost("generate")]
    [ProducesResponseType(typeof(WorkoutResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<WorkoutResponse>> GenerateWorkout([FromBody] GenerateWorkoutRequest request)
    {
        LogWorkoutRequest(request);
        
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var validationError = ValidateDescription(request.Description);
        if (validationError != null)
            return validationError;

        try
        {
            var workout = await rapidApiService.GenerateWorkoutAsync(request);
            
            if (workout is null)
                return Problem("Workout Generation Failed", "Failed to generate workout. Please try again.");

            workout.Id ??= Guid.NewGuid().ToString();
            return Ok(workout);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error generating workout");
            return Problem("Internal Server Error", "An unexpected error occurred while generating the workout");
        }
    }

    // Add workout to My Workouts
    // POST /api/workout/add
    [HttpPost("add")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> AddWorkout([FromBody] SavedWorkoutDto workout)
    {
        var memberResult = await GetAuthenticatedMemberAsync();
        if (memberResult.Error != null) return memberResult.Error;

        if (string.IsNullOrWhiteSpace(workout.WorkoutId))
            return BadRequest("Invalid Request", "WorkoutId is required");

        try
        {
            Logger.LogInformation("Adding workout: {WorkoutId} for member {MemberId}", workout.WorkoutId, memberResult.MemberId);

            var success = workoutsService.ToggleMyWorkout(memberResult.MemberId, workout);
            
            if (!success)
                return Problem("Add Failed", "Failed to add workout");

            Logger.LogInformation("Successfully added workout for member {MemberId}", memberResult.MemberId);
            return Ok();
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error adding workout");
            return Problem("Internal Server Error", "An unexpected error occurred while adding the workout");
        }
    }

    // Remove workout from My Workouts
    // DELETE /api/workout/remove/{workoutId}
    [HttpDelete("remove/{workoutId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RemoveWorkout(string workoutId)
    {
        var memberResult = await GetAuthenticatedMemberAsync();
        if (memberResult.Error != null) return memberResult.Error;

        if (string.IsNullOrWhiteSpace(workoutId))
            return BadRequest("Invalid Request", "WorkoutId is required");

        try
        {
            Logger.LogInformation("Removing workout: {WorkoutId} for member {MemberId}", workoutId, memberResult.MemberId);

            var success = workoutsService.RemoveMyWorkout(memberResult.MemberId, workoutId);
            
            if (!success)
                return Problem("Remove Failed", "Failed to remove workout");

            Logger.LogInformation("Successfully removed workout for member {MemberId}", memberResult.MemberId);
            return Ok();
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error removing workout");
            return Problem("Internal Server Error", "An unexpected error occurred while removing the workout");
        }
    }

    // Helper methods
    private void LogWorkoutRequest(GenerateWorkoutRequest request)
    {
        Logger.LogInformation("=== Workout Generation Request ===");
        Logger.LogInformation("MuscleGroups: {MuscleGroups}", string.Join(", ", request.MuscleGroups));
        Logger.LogInformation("Equipment: {Equipment}", string.Join(", ", request.Equipment));
        Logger.LogInformation("Description: {Description}", request.Description);
    }

    private BadRequestObjectResult? ValidateDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return BadRequest("Invalid Request", "Description is required");

        if (description.Length < MinDescriptionLength)
            return BadRequest("Invalid Request", $"Description must be at least {MinDescriptionLength} characters");

        if (description.Length > MaxDescriptionLength)
            return BadRequest("Invalid Request", $"Description must be less than {MaxDescriptionLength} characters");

        return null;
    }
}
