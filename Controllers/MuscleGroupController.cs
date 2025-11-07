using Microsoft.AspNetCore.Mvc;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/musclegroup")]
[Produces("application/json")]
public class MuscleGroupController(IMuscleGroupApiService muscleGroupService, ILogger<MuscleGroupController> logger) : ControllerBase
{
    // Get all available muscle groups
    // GET  /api/musclegroup/groups
    [HttpGet("groups")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<string>>> GetMuscleGroups()
    {
        try
        {
            logger.LogInformation("Fetching muscle groups");
            
            var groups = await muscleGroupService.GetMuscleGroupsAsync();
            return Ok(groups);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching muscle groups");
            return Problem(
                title: "Internal Server Error",
                detail: "Failed to fetch muscle groups",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }

    // Get muscle visualization image
    // GET  /api/musclegroup/image
    [HttpGet("image")]
    [Produces("image/png")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["muscleGroups", "color", "transparentBackground"
    ])]
    public async Task<IActionResult> GetMuscleImage(
        [FromQuery] string muscleGroups = "",
        [FromQuery] string? color = null,
        [FromQuery] bool transparentBackground = true)
    {
        try
        {
            logger.LogInformation("Controller: Fetching muscle image for: {MuscleGroups}", muscleGroups);
            
            var imageBytes = await muscleGroupService.GetMuscleImageAsync(muscleGroups, color, transparentBackground);
            
            if (imageBytes.Length == 0)
            {
                logger.LogWarning("No image data returned for muscles: {MuscleGroups}", muscleGroups);
                return NotFound(new ProblemDetails
                {
                    Title = "Image Not Found",
                    Detail = "Unable to generate muscle visualization image",
                    Status = StatusCodes.Status404NotFound
                });
            }

            return File(imageBytes, "image/png");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching muscle image for: {MuscleGroups}", muscleGroups);
            return Problem(
                title: "Internal Server Error",
                detail: "Failed to generate muscle image",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }
}
