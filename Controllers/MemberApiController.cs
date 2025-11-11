using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Controllers;

[ApiController]
[Route("api/member")]
public class MemberApiController(IMemberManager memberManager, IMemberService memberService, ILogger<MemberApiController> logger)
    : ControllerBase
{
    private readonly IMemberManager _memberManager = memberManager;
    private readonly IMemberService _memberService = memberService;
    private readonly ILogger<MemberApiController> _logger = logger;

    [HttpPost("details")]
    public async Task<IActionResult> SaveMemberDetails([FromBody] MemberDetailsDto details)
    {
            var currentMember = await _memberManager.GetCurrentMemberAsync();
            if (currentMember == null)
                return Unauthorized();

            var member = _memberService.GetById(int.Parse(currentMember.Id));
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
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        if (currentMember == null)
            return Unauthorized();

        var member = _memberService.GetById(int.Parse(currentMember.Id));
        if (member == null)
            return NotFound();

        var details = member.GetValue<string>("memberDetails");
        return Ok(new { memberDetails = details });
    }
}
