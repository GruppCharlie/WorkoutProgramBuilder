using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/member")]
public class MemberApiController( IMemberManager memberManager, IMemberService memberService, ILogger<MemberApiController> logger) : ApiControllerBase(memberManager, logger)
{
    private readonly IMemberService _memberService = memberService;

    [HttpPost("details")]
    public async Task<IActionResult> SaveMemberDetails([FromBody] MemberDetailsDto details)
    {
        var memberResult = await GetAuthenticatedMemberAsync();
        if (memberResult.Error != null) return memberResult.Error;

        var member = _memberService.GetById(memberResult.MemberId);
        if (member == null)
            return NotFound();

        var json = System.Text.Json.JsonSerializer.Serialize(details);
        member.SetValue("memberDetails", json);
        _memberService.Save(member);

        return Ok(new { success = true });
    }

    [HttpGet("details")]
    public async Task<IActionResult> GetMemberDetails()
    {
        var memberResult = await GetAuthenticatedMemberAsync();
        if (memberResult.Error != null) return memberResult.Error;

        var member = _memberService.GetById(memberResult.MemberId);
        if (member == null)
            return NotFound();

        var details = member.GetValue<string>("memberDetails");
        return Ok(new { memberDetails = details });
    }
}
