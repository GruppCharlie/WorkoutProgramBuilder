using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Controllers;

namespace WorkoutProgramBuilder.Controllers
{
    public class ModularPageController(
        ILogger<ModularPageController> logger,
        ICompositeViewEngine viewEngine,
        IUmbracoContextAccessor contextAccessor) : RenderController(logger, viewEngine, contextAccessor)
    {

        [HttpGet]
        public IActionResult Index()
        {
            try
            {
                return CurrentTemplate(CurrentPage);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in ModularPageController");
                return CurrentTemplate(CurrentPage);
            }
        }
    }
}
