using Microsoft.AspNetCore.Mvc;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MuscleGroupController(IMuscleGroupApiService muscleGroupService) : ControllerBase
{
    private readonly IMuscleGroupApiService _muscleGroupService = muscleGroupService;

    [HttpGet("groups")]
    public async Task<IActionResult> GetMuscleGroups()
    {
        var groups = await _muscleGroupService.GetMuscleGroupsAsync();
        return Ok(groups);
    }

    [HttpGet("image")]
    public async Task<IActionResult> GetMuscleImage(
        [FromQuery] string muscleGroups = "",
        [FromQuery] string color = "79,70,229",
        [FromQuery] bool transparentBackground = true)
    {
        var imageBytes = await _muscleGroupService.GetMuscleImageAsync(muscleGroups, color, transparentBackground);
        
        if (imageBytes.Length == 0)
            return NotFound();

        // Set cache headers for browser caching (1 hour)
        Response.Headers.CacheControl = "public, max-age=3600";
        Response.Headers.Vary = "Accept-Encoding";
        
        return File(imageBytes, "image/png");
    }
}
