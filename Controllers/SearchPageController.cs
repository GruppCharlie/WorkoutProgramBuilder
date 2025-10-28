using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Interface;

namespace WorkoutProgramBuilder.Controllers;

public class SearchPageController : RenderController
{
    private readonly IExerciseDbService _exerciseDbService;

    public SearchPageController(
        ILogger<SearchPageController> logger,
        ICompositeViewEngine viewEngine,
        IUmbracoContextAccessor contextAccessor,
        IExerciseDbService exerciseDbService)
        : base(logger, viewEngine, contextAccessor) => _exerciseDbService = exerciseDbService;

 
    [HttpGet]
    public async Task<IActionResult> Index([FromQuery] string query, [FromQuery] int offset = 0, [FromQuery] int limit = 10)
    {
        var searchResponse = await _exerciseDbService.SearchAsync(query ?? "", offset, limit);

        ViewData["Query"] = query;
        ViewData["Exercises"] = searchResponse?.Data ?? [];
        ViewData["Metadata"] = searchResponse?.Metadata;

        return CurrentTemplate(CurrentPage);
    }
}