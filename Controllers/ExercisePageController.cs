using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Interface;

namespace WorkoutProgramBuilder.Controllers
{
    public class ExercisePageController(
        ILogger<ExercisePageController> logger,
        ICompositeViewEngine viewEngine,
        IUmbracoContextAccessor contextAccessor,
        IExerciseDbService exerciseDbService) : RenderController(logger, viewEngine, contextAccessor)
    {
        private readonly IExerciseDbService _exerciseDbService = exerciseDbService;

        [HttpGet]
        public async Task<IActionResult> Index([FromQuery] string exerciseId)
        {
         

            ExerciseDto? exercise = await _exerciseDbService.GetByIdAsync(exerciseId);
            if (exercise == null)
                return NotFound();

            ViewData["Exercise"] = exercise;

            return View("ExercisePage", CurrentPage);
        }

    }
}
