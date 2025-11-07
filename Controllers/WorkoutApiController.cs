using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using WorkoutProgramBuilder.Business.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/workout")]
[Produces("application/json")]
public class WorkoutApiController(
    IRapidApiService rapidApiService, 
    IMemberManager memberManager,
    IMemberWorkoutsService workoutsService,
    ILogger<WorkoutApiController> logger) : ControllerBase
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
        logger.LogInformation("=== Workout Generation Request Received ===");
        logger.LogInformation("MuscleGroups: {MuscleGroups}", string.Join(", ", request.MuscleGroups));
        logger.LogInformation("Equipment: {Equipment}", string.Join(", ", request.Equipment));
        logger.LogInformation("Description: {Description}", request.Description);
        logger.LogInformation("ModelState.IsValid: {IsValid}", ModelState.IsValid);
        
        if (!ModelState.IsValid)
        {
            logger.LogWarning("ModelState validation failed: {Errors}", 
                string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
            return ValidationProblem(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.Description))
            return BadRequest(new ProblemDetails 
            { 
                Title = "Invalid Request",
                Detail = "Description is required",
                Status = StatusCodes.Status400BadRequest
            });

        if (request.Description.Length < MinDescriptionLength)
        {
            logger.LogWarning("Description too short: {Length} chars (min: {Min})", 
                request.Description.Length, MinDescriptionLength);
            return BadRequest(new ProblemDetails 
            { 
                Title = "Invalid Request",
                Detail = $"Description must be at least {MinDescriptionLength} characters",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (request.Description.Length > MaxDescriptionLength)
            return BadRequest(new ProblemDetails 
            { 
                Title = "Invalid Request",
                Detail = $"Description must be less than {MaxDescriptionLength} characters",
                Status = StatusCodes.Status400BadRequest
            });

        try
        {
            logger.LogInformation("Generating workout with description: {Description}", request.Description);

            var workout = await rapidApiService.GenerateWorkoutAsync(request);

            if (workout is null)
            {
                return Problem(
                    title: "Workout Generation Failed",
                    detail: "Failed to generate workout. Please try again.",
                    statusCode: StatusCodes.Status500InternalServerError
                );
            }

            return Ok(workout);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating workout");
            return Problem(
                title: "Internal Server Error",
                detail: "An unexpected error occurred while generating the workout",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }

    // Add/remove workout to/from My Workouts
    // POST /api/workout/add
    [HttpPost("add")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> AddWorkout([FromBody] SavedWorkoutDto workout)
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
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "WorkoutId is required",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            logger.LogInformation("Adding workout: {WorkoutId} for member {MemberId}", 
                workout.WorkoutId, currentMember.Id);

            var success = workoutsService.ToggleMyWorkout(int.Parse(currentMember.Id), workout);
            
            if (!success)
            {
                logger.LogError("Failed to add workout for member {MemberId}", currentMember.Id);
                return Problem(
                    title: "Add Failed",
                    detail: "Failed to add workout",
                    statusCode: StatusCodes.Status500InternalServerError
                );
            }

            logger.LogInformation("Successfully added workout for member {MemberId}", currentMember.Id);
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error adding workout");
            return StatusCode(500, new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while adding the workout",
                Status = StatusCodes.Status500InternalServerError
            });
        }
    }
}
