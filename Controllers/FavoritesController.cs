using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System.Text.Json;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Controllers;

[Route("favorites")]
[Route("sv/favoriter")]
public class FavoritesController(
    IMemberManager memberManager,
    IMemberService memberService,
    ILogger<FavoritesController> logger,
    ICompositeViewEngine viewEngine,
    IUmbracoContextAccessor contextAccessor) : RenderController(logger, viewEngine, contextAccessor)
{
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberService _memberService = memberService;
    private readonly IUmbracoContextAccessor _contextAccessor = contextAccessor;


    [HttpGet]
    public new async Task<IActionResult> Index()
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return RenderUmbraco404();

        var member = _memberService.GetById(int.Parse(currentMember.Id));
        if (member == null)
            return RenderUmbraco404();

        var savedJson = member.GetValue<string>("savedExercisesJson");
        var saved = string.IsNullOrWhiteSpace(savedJson)
            ? []
            : JsonSerializer.Deserialize<List<ExerciseDto>>(savedJson) ?? [];

        ViewData["Exercises"] = saved;

        return CurrentTemplate(CurrentPage);
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveFavoriteExercise([FromBody] JsonElement body)
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        var member = _memberService.GetById(int.Parse(currentMember.Id));
        if (member == null)
            return Unauthorized();

        var incoming = new ExerciseDto();
        try
        {
            if (body.TryGetProperty("ExerciseId", out var idProp) && idProp.ValueKind != JsonValueKind.Null)
                incoming.ExerciseId = idProp.GetString();

            if (body.TryGetProperty("Name", out var nameProp) && nameProp.ValueKind != JsonValueKind.Null)
                incoming.Name = nameProp.GetString();

            if (body.TryGetProperty("GifUrl", out var gifProp) && gifProp.ValueKind != JsonValueKind.Null)
                incoming.GifUrl = gifProp.GetString();

            if (body.TryGetProperty("IsSaved", out var savedProp) && savedProp.ValueKind != JsonValueKind.Null)
                incoming.IsSaved = savedProp.GetBoolean();

            incoming.BodyParts = [];
            if (body.TryGetProperty("BodyParts", out var bpProp) && bpProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var bodypart in bpProp.EnumerateArray())
                    if (bodypart.ValueKind == JsonValueKind.String)
                    {
                        var Body = bodypart.GetString();
                        if (!string.IsNullOrEmpty(Body))
                        {
                            incoming.BodyParts.Add(Body);
                        }
                    }
            }

            incoming.TargetMuscles = [];
            if (body.TryGetProperty("TargetMuscles", out var tmProp) && tmProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var target in tmProp.EnumerateArray())
                    if (target.ValueKind == JsonValueKind.String)
                    {
                        var targetMuscle = target.GetString();
                        if (!string.IsNullOrEmpty(targetMuscle))
                        {
                            incoming.TargetMuscles.Add(targetMuscle);
                        }
                    }
            }

            incoming.SecondaryMuscles = [];
            if (body.TryGetProperty("SecondaryMuscles", out var smProp) && smProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var secondary in smProp.EnumerateArray())
                    if (secondary.ValueKind == JsonValueKind.String)
                    {
                        var SecondaryMuscle = secondary.GetString();
                        if (!string.IsNullOrEmpty(SecondaryMuscle))
                        {
                            incoming.SecondaryMuscles.Add(SecondaryMuscle);
                        }
                    }
            }

            incoming.Equipments = [];
            if (body.TryGetProperty("Equipments", out var eqProp) && eqProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var equipment in eqProp.EnumerateArray())
                    if (equipment.ValueKind == JsonValueKind.String)
                    {
                        var Equipment = equipment.GetString();
                        if (!string.IsNullOrEmpty(Equipment))
                        {
                            incoming.Equipments.Add(Equipment);
                        }
                    }
            }
        }
        catch
        {
            return BadRequest("Invalid payload.");
        }

        var savedJson = member.GetValue<string>("savedExercisesJson");
        var saved = string.IsNullOrWhiteSpace(savedJson)
            ? []
            : JsonSerializer.Deserialize<List<ExerciseDto>>(savedJson) ?? [];

        var exists = saved.FirstOrDefault(s => s.ExerciseId == incoming.ExerciseId);
        if (exists != null)
        {
            saved.Remove(exists);
            exists.IsSaved = false;
        }
        else
        {
            if (string.IsNullOrWhiteSpace(incoming.ExerciseId))
            {
                return BadRequest("ExerciseId is required.");
            }
            saved.Add(incoming);
            incoming.IsSaved = true;

            var currentAmount = member.GetValue<int?>("amountOfSavedExercises") ?? 0;
            member.SetValue("amountOfSavedExercises", currentAmount + 1);
        }

        var newJson = JsonSerializer.Serialize(saved);
        member.SetValue("savedExercisesJson", newJson);
        _memberService.Save(member);

        return Ok();
    }

    [Obsolete]
    private IActionResult RenderUmbraco404()
    {
        if (!_contextAccessor.TryGetUmbracoContext(out var umbracoContext) || umbracoContext == null)
            return NotFound();

        var contentCache = umbracoContext.Content;
        var candidates = contentCache.GetAtRoot().SelectMany(r => r.DescendantsOrSelf());

        var errorPage = candidates.FirstOrDefault(c => string.Equals(c.ContentType.Alias, "errorPage", StringComparison.OrdinalIgnoreCase));

        if (errorPage == null)
            return NotFound();

        Response.StatusCode = 404;

        return View("~/Views/ErrorPage.cshtml", errorPage);
    }
}


