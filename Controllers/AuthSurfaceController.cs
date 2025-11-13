namespace WorkoutProgramBuilder.Controllers;

using Microsoft.AspNetCore.Identity;
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
    public async Task<IActionResult> HandleSignup(string username, string emailSignup, string createPassword, string confirmPassword, string? returnUrl = null)
    {
        if (string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(emailSignup) ||
            string.IsNullOrWhiteSpace(createPassword) ||
            string.IsNullOrWhiteSpace(confirmPassword))
        {
            TempData["SignupErrorKey"] = "Signup.Validation.FillAllFields";
            TempData["SignupErrorDefault"] = "Please fill in all fields.";
            return RedirectToCurrentUmbracoPage();
        }

        if (!string.Equals(createPassword, confirmPassword))
        {
            TempData["SignupErrorKey"] = "Signup.Validation.PasswordMismatch";
            TempData["SignupErrorDefault"] = "Passwords do not match.";
            return RedirectToCurrentUmbracoPage();
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(username, @"^[a-zA-Z0-9_]{3,20}$"))
        {
            TempData["SignupErrorKey"] = "Signup.Validation.UsernameFormat";
            TempData["SignupErrorDefault"] = "Username must be 3–20 characters (letters, numbers, underscore).";
            return RedirectToCurrentUmbracoPage();
        }

        var usernameExists = _memberService.GetByUsername(username) != null;
        var emailExists = _memberService.GetByEmail(emailSignup) != null;

        if (usernameExists && emailExists)
        {
            TempData["SignupErrorKey"] = "Signup.Validation.UsernameAndEmailTaken";
            TempData["SignupErrorDefault"] = "Both the username and email address are already taken.";
            return RedirectToCurrentUmbracoPage();
        }

        if (usernameExists)
        {
            TempData["SignupErrorKey"] = "Signup.Validation.UsernameTaken";
            TempData["SignupErrorDefault"] = "That username is already taken.";
            return RedirectToCurrentUmbracoPage();
        }

        if (emailExists)
        {
            TempData["SignupErrorKey"] = "Signup.Validation.EmailTaken";
            TempData["SignupErrorDefault"] = "An account with that email already exists.";
            return RedirectToCurrentUmbracoPage();
        }

        const string memberTypeAlias = "member"; 
        var displayName = username;

        var identityUser = MemberIdentityUser.CreateNew(username, emailSignup, memberTypeAlias, true, displayName);
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
            if (!string.Equals(member.Name, username, StringComparison.Ordinal))
                member.Name = username;

            if (!string.Equals(member.Username, username, StringComparison.Ordinal))
                member.Username = username;

            _memberService.Save(member);
        }

        var attempt = await _memberSignInManager.PasswordSignInAsync(identityUser.UserName, createPassword, false, true);
        if (!attempt.Succeeded)
        {
            TempData["SignupSuccessKey"] = "Signup.Validation.AccountCreated";
            TempData["SignupSuccessDefault"] = "Account created. Please log in.";
            return RedirectToCurrentUmbracoPage();
        }

        // Redirect to returnUrl if provided, otherwise go to home
        if (!string.IsNullOrWhiteSpace(returnUrl))
        {
            // Decode URL in case it's encoded
            var decodedUrl = Uri.UnescapeDataString(returnUrl);
            if (Url.IsLocalUrl(decodedUrl))
            {
                return Redirect(decodedUrl);
            }
        }
        
        return Redirect(GetHomeUrlForCurrentCulture() ?? "/");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> HandleLogin(string emailLogin, string password, string? returnUrl = null)
    {
        if (string.IsNullOrWhiteSpace(emailLogin) || string.IsNullOrWhiteSpace(password))
        {
            TempData["LoginErrorKey"] = "Login.Validation.FillAllFields";
            TempData["LoginErrorDefault"] = "Please fill in all fields.";
            return RedirectToCurrentUmbracoPage();
        }

        var member = _memberService.GetByEmail(emailLogin);
        if (member == null)
        {
            TempData["LoginErrorKey"] = "Login.Validation.InvalidCredentials";
            TempData["LoginErrorDefault"] = "Invalid email or password.";
            return RedirectToCurrentUmbracoPage();
        }

        var attempt = await _memberSignInManager.PasswordSignInAsync(
            member.Username, password, isPersistent: false, lockoutOnFailure: false);

        if (attempt.Succeeded)
        {
            // Redirect to returnUrl if provided, otherwise go to home
            if (!string.IsNullOrWhiteSpace(returnUrl))
            {
                // Decode URL in case it's encoded
                var decodedUrl = Uri.UnescapeDataString(returnUrl);
                if (Url.IsLocalUrl(decodedUrl))
                {
                    return Redirect(decodedUrl);
                }
            }
            
            return Redirect(GetHomeUrlForCurrentCulture() ?? "/");
        }

        if (attempt.IsLockedOut)
        {
            TempData["LoginErrorKey"] = "Login.Validation.LockedOut";
            TempData["LoginErrorDefault"] = "Too many failed attempts. Please try again later.";
            return RedirectToCurrentUmbracoPage();
        }

        TempData["LoginErrorKey"] = "Login.Validation.InvalidCredentials";
        TempData["LoginErrorDefault"] = "Invalid email or password.";
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
