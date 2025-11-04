using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System.Text.Json;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Interface;

namespace WorkoutProgramBuilder.Controllers;

public class SearchPageController(
    ILogger<SearchPageController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor,
    IExerciseDbService exerciseDbService,
    IMemberManager memberManager,
    IMemberService memberService) : RenderController(logger, viewEngine, contextAccessor)
{
    private readonly IExerciseDbService _exerciseDbService = exerciseDbService;
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberService _memberService = memberService;


    [HttpGet]
    public async Task<IActionResult> Index([FromQuery] string query, [FromQuery] int offset = 0, [FromQuery] int limit = 10)
    {
        var searchResponse = await _exerciseDbService.SearchAsync(query ?? "", offset, limit);

        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        var member = _memberService.GetById(int.Parse(currentMember.Id));
        if (member == null)
            return Unauthorized();

        var savedJson = member.GetValue<string>("savedExercisesJson");
        var saved = string.IsNullOrWhiteSpace(savedJson)
            ? []
            : JsonSerializer.Deserialize<List<ExerciseDto>>(savedJson) ?? [];

        foreach (var exercise in searchResponse?.Data ?? [])
        {
            exercise.IsSaved = saved.Any(s => s.ExerciseId == exercise.ExerciseId);
        }

        ViewData["Query"] = query;
        ViewData["Exercises"] = searchResponse?.Data ?? [];
        ViewData["Metadata"] = searchResponse?.Metadata;

        return CurrentTemplate(CurrentPage);
    }
}