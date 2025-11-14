using Microsoft.AspNetCore.Mvc;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/musclegroup")]
[Produces("application/json")]
public class MuscleGroupApiController(IMuscleGroupApiService muscleGroupService, ILogger<MuscleGroupApiController> logger) : ControllerBase
{
    private readonly IMuscleGroupApiService _muscleGroupService = muscleGroupService;
    private readonly ILogger<MuscleGroupApiController> _logger = logger;

    // Get all available muscle groups
    // GET  /api/musclegroup/groups
    [HttpGet("groups")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<string>>> GetMuscleGroups()
    {
        try
        {
            _logger.LogInformation("Fetching muscle groups");
            
            var groups = await _muscleGroupService.GetMuscleGroupsAsync();
            return Ok(groups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching muscle groups");
            return Problem("Internal Server Error", "Failed to fetch muscle groups");
        }
    }

    // Get muscle visualization image
    // GET  /api/musclegroup/image
    [HttpGet("image")]
    [Produces("image/png")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, VaryByQueryKeys = ["muscleGroups", "color", "transparentBackground"])]
    public async Task<IActionResult> GetMuscleImage(
        [FromQuery] string muscleGroups = "",
        [FromQuery] string? color = null,
        [FromQuery] bool transparentBackground = true)
    {
        try
        {
            _logger.LogInformation("Fetching muscle image for: {MuscleGroups}", muscleGroups);
            
            var imageBytes = await _muscleGroupService.GetMuscleImageAsync(muscleGroups, color, transparentBackground);
            
            if (imageBytes.Length == 0)
            {
                _logger.LogWarning("No image data returned for muscles: {MuscleGroups}", muscleGroups);
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
            _logger.LogError(ex, "Error fetching muscle image for: {MuscleGroups}", muscleGroups);
            return Problem("Internal Server Error", "Failed to generate muscle image");
        }
    }

    private ObjectResult Problem(string title, string detail) =>
        Problem(title: title, detail: detail, statusCode: StatusCodes.Status500InternalServerError);
}
