namespace WorkoutProgramBuilder.Controllers;

using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Cms.Web.Website.Controllers;

public class LoginSurfaceController(
    IUmbracoContextAccessor umbracoContextAccessor,
    IUmbracoDatabaseFactory databaseFactory,
    ServiceContext services,
    AppCaches appCaches,
    IProfilingLogger profilingLogger,
    IPublishedUrlProvider publishedUrlProvider,
    IMemberSignInManager memberSignInManager,
    IMemberManager memberManager,
    IMemberService memberService) : SurfaceController(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
{
    private readonly IMemberSignInManager _memberSignInManager = memberSignInManager;
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberService _memberService = memberService;

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleLogin(string emaillogin, string password)
    {
        if (string.IsNullOrWhiteSpace(emaillogin) || string.IsNullOrWhiteSpace(password))
        {
            TempData["LoginError"] = "Please enter both email and password.";
            return RedirectToCurrentUmbracoPage();
        }

        var member = _memberService.GetByEmail(emaillogin);
        if (member == null)
        {
            TempData["LoginError"] = "No member found with that email.";
            return RedirectToCurrentUmbracoPage();
        }

        var attempt = await _memberSignInManager.PasswordSignInAsync(member.Username, password, false, true);


        if (attempt.Succeeded)
        {
            return Redirect("/");
        }

        TempData["LoginError"] = "Invalid login attempt.";
        return RedirectToCurrentUmbracoPage();
    }

}
