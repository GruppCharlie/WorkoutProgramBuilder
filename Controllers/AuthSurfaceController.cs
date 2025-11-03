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

public class AuthSurfaceController(
    IUmbracoContextAccessor umbracoContextAccessor,
    IUmbracoDatabaseFactory databaseFactory,
    ServiceContext services,
    AppCaches appCaches,
    IProfilingLogger profilingLogger,
    IPublishedUrlProvider publishedUrlProvider,
    IMemberSignInManager memberSignInManager,
    IMemberManager memberManager,
    IMemberService memberService)
    : SurfaceController(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
{
    private readonly IMemberSignInManager _memberSignInManager = memberSignInManager;
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberService _memberService = memberService;

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleSignup(string emailsignup, string createPassword, string confirmPassword)
    {
        if (string.IsNullOrWhiteSpace(emailsignup) ||
            string.IsNullOrWhiteSpace(createPassword) ||
            string.IsNullOrWhiteSpace(confirmPassword))
        {
            TempData["SignupError"] = "Please fill in all fields.";
            return RedirectToCurrentUmbracoPage();
        }

        if (!string.Equals(createPassword, confirmPassword))
        {
            TempData["SignupError"] = "Passwords do not match.";
            return RedirectToCurrentUmbracoPage();
        }

        var existing = _memberService.GetByEmail(emailsignup);
        if (existing != null)
        {
            TempData["SignupError"] = "An account with that email already exists.";
            return RedirectToCurrentUmbracoPage();
        }

        const string memberTypeAlias = "member"; 
        var userName = emailsignup;  
        var name = emailsignup; 

        var identityUser = MemberIdentityUser.CreateNew(userName, emailsignup, memberTypeAlias, true, name);
        identityUser.Name = name;
        identityUser.IsApproved = true;
        identityUser.EmailConfirmed = true; 

        var createResult = await _memberManager.CreateAsync(identityUser, createPassword);
        if (!createResult.Succeeded)
        {
            var msg = string.Join(" ", createResult.Errors.Select(e => e.Description));
            TempData["SignupError"] = string.IsNullOrWhiteSpace(msg)
                ? "Could not create the account. Please try again."
                : msg;

            return RedirectToCurrentUmbracoPage();
        }

        var attempt = await _memberSignInManager.PasswordSignInAsync(identityUser.UserName, createPassword, false, true);
        if (!attempt.Succeeded)
        {
            TempData["SignupSuccess"] = "Account created. Please log in.";
            return RedirectToCurrentUmbracoPage();
        }

        return Redirect("/");
    }

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


    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleLogout()
    {
        await _memberSignInManager.SignOutAsync();
        return Redirect("/");
    }
}
