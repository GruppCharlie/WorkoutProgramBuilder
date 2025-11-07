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
using Umbraco.Cms.Web.Common.UmbracoContext;
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
    IUmbracoContextAccessor contextAccessor,
    IMemberService memberService)
    : SurfaceController(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
{
    private readonly IMemberSignInManager _memberSignInManager = memberSignInManager;
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberService _memberService = memberService;
    private readonly IUmbracoContextAccessor _contextAccessor = contextAccessor;



    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleSignup(string username, string emailsignup, string createPassword, string confirmPassword)
    {
        if (string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(emailsignup) ||
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

        if (!System.Text.RegularExpressions.Regex.IsMatch(username, @"^[a-zA-Z0-9_]{3,20}$"))
        {
            TempData["SignupError"] = "Username must be 3–20 characters (letters, numbers, underscore).";
            return RedirectToCurrentUmbracoPage();
        }

        if (_memberService.GetByUsername(username) != null)
        {
            TempData["SignupError"] = "That username is already taken.";
            return RedirectToCurrentUmbracoPage();
        }

        if (_memberService.GetByEmail(emailsignup) != null)
        {
            TempData["SignupError"] = "An account with that email already exists.";
            return RedirectToCurrentUmbracoPage();
        }

        const string memberTypeAlias = "member"; 
        var displayName = username;

        var identityUser = MemberIdentityUser.CreateNew(username, emailsignup, memberTypeAlias, true, displayName);
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

        var member = _memberService.GetByKey(identityUser.Key);
        if (member != null)
        {
            // sätt både visningsnamn och username
            if (!string.Equals(member.Name, username, StringComparison.Ordinal))
                member.Name = username;

            if (!string.Equals(member.Username, username, StringComparison.Ordinal))
                member.Username = username;

            _memberService.Save(member);
        }

        var attempt = await _memberSignInManager.PasswordSignInAsync(identityUser.UserName, createPassword, false, true);
        if (!attempt.Succeeded)
        {
            TempData["SignupSuccess"] = "Account created. Please log in.";
            return RedirectToCurrentUmbracoPage();
        }

        return Redirect(GetHomeUrlForCurrentCulture() ?? "/");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleLogin(string emaillogin, string password)
    {
        var member = _memberService.GetByEmail(emaillogin);

        var attempt = await _memberSignInManager.PasswordSignInAsync(member.Username, password, isPersistent: false, lockoutOnFailure: true);

        if (attempt.Succeeded)
        {
            return Redirect(GetHomeUrlForCurrentCulture() ?? "/");
        }

        return RedirectToCurrentUmbracoPage();
    }



    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleLogout()
    {
        await _memberSignInManager.SignOutAsync();
        return Redirect(GetHomeUrlForCurrentCulture() ?? "/");
    }

    private string? GetHomeUrlForCurrentCulture()
    {
        if (!_contextAccessor.TryGetUmbracoContext(out var umbracoContext) || umbracoContext == null)
        {
            return null;
        }

        var contentCache = umbracoContext.Content;

        var homeNode = contentCache
            .GetAtRoot()
            .FirstOrDefault(x => x.ContentType.Alias == "modularPage");

        var culture = System.Globalization.CultureInfo.CurrentCulture.Name;
        var homeUrl = homeNode?.Url(culture: culture);

        return homeUrl;
    }

}
