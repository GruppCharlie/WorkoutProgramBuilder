using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Security;

namespace WorkoutProgramBuilder.Controllers;

public abstract class ApiControllerBase(IMemberManager memberManager, ILogger logger) : ControllerBase
{
    private readonly IMemberManager _memberManager = memberManager;
    protected readonly ILogger Logger = logger;

    protected async Task<(int MemberId, IActionResult? Error)> GetAuthenticatedMemberAsync()
    {
        var currentMember = await _memberManager.GetCurrentMemberAsync();
        
        if (currentMember == null)
        {
            Logger.LogWarning("No current member found");
            return (0, Unauthorized());
        }

        return (int.Parse(currentMember.Id), null);
    }

    protected BadRequestObjectResult BadRequest(string title, string detail) =>
        BadRequest(new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = StatusCodes.Status400BadRequest
        });

    protected ObjectResult Problem(string title, string detail) =>
        Problem(title: title, detail: detail, statusCode: StatusCodes.Status500InternalServerError);
}