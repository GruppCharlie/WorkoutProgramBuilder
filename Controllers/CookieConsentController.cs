using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Enums;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/cookie-consent")]
public class CookieConsentController : ControllerBase
{
    private readonly IMemberManager _memberManager;
    private readonly IMemberService _memberService;
    private readonly ILogger<CookieConsentController> _logger;

    public CookieConsentController(IMemberManager memberManager, IMemberService memberService, ILogger<CookieConsentController> logger)
    {
        _memberManager = memberManager;
        _memberService = memberService;
        _logger = logger;
    }

    public class CookieConsentSyncModel
    {
        public int Status { get; set; }
        public DateTime? Date { get; set; }
    }

    private static string MapStatusCodeToLabel(int status)
    {
        return status switch
        {
            (int)CookieConsentStatus.NotAccepted => "Not Accepted",
            (int)CookieConsentStatus.Accepted => "Accepted",
            (int)CookieConsentStatus.Retracted => "Retracted",
            _ => "Not Accepted"
        };
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncCookieConsent([FromBody] CookieConsentSyncModel model)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        var memberIdentityUser = await _memberManager.GetCurrentMemberAsync();
        if (memberIdentityUser == null)
        {
            return Unauthorized();
        }

        var member = _memberService.GetByKey(memberIdentityUser.Key);
        if (member == null)
        {
            return NotFound();
        }

        try
        {
            if (!Enum.IsDefined(typeof(CookieConsentStatus), model.Status))
            {
                _logger.LogWarning("CookieConsentController: Received invalid status {Status} for member {MemberId}", model.Status, member.Id);

                return BadRequest("Invalid cookie consent status.");
            }

            var statusLabel = MapStatusCodeToLabel(model.Status);

            member.SetValue("cookieConsentStatus", statusLabel);
            member.SetValue("cookieConsentDate", model.Date ?? DateTime.UtcNow);

            _memberService.Save(member);

            _logger.LogInformation("CookieConsentController: Updated cookie consent for member {MemberId} to status {Status}.", member.Id, statusLabel);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CookieConsentController: Error updating cookie consent for member {MemberId}.", member.Id);

            return StatusCode(500, "An error occurred while updating cookie consent.");
        }
    }
}

