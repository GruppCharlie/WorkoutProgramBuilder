using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Enums;

namespace WorkoutProgramBuilder.Business.ScheduledJobs;

public class CookieConsentResetJob
{
    private readonly IMemberService _memberService;
    private readonly ILogger<CookieConsentResetJob> _logger;

    private const int NotAcceptedStatus = 0;
    private const int AcceptedStatus = 1;
    private const int RetractedStatus = 2;
    private const int DaysLimit = 90;

    public CookieConsentResetJob(IMemberService memberService, ILogger<CookieConsentResetJob> logger)
    {
        _memberService = memberService;
        _logger = logger;
    }

    public async Task RunAsync()
    {
        _logger.LogInformation("CookieConsentResetJob: starting run ...");

        var members = _memberService.GetAllMembers();

        foreach (var member in members)
        {
            try
            {
                var rawStatusObj = member.GetValue("cookieConsentStatus");
                var rawDateObj = member.GetValue("cookieConsentDate");

                var statusString = NormalizeStatus(rawStatusObj);
                var consentDate = NormalizeDate(rawDateObj);

                _logger.LogInformation(
                    "CookieConsentResetJob: DEBUG Member {Id} ({Key}) rawStatus='{RawStatus}', rawDate='{RawDate}', normalizedStatus='{Status}', normalizedDate='{Date}'",
                    member.Id,
                    member.Key,
                    rawStatusObj ?? "<null>",
                    rawDateObj ?? "<null>",
                    statusString ?? "<null>",
                    consentDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "<null>");

                int? statusCode = ParseStatusStringToCode(statusString);

                if (!statusCode.HasValue || !consentDate.HasValue)
                {
                    continue;
                }

                if (statusCode.Value != (int)CookieConsentStatus.Accepted)
                    continue;

                var days = (DateTime.UtcNow - consentDate.Value.ToUniversalTime()).TotalDays;

                if (days < 90)
                    continue;

                member.SetValue("cookieConsentStatus", "Not Accepted");
                member.SetValue("cookieConsentDate", null);

                _memberService.Save(member);

                _logger.LogInformation("CookieConsentResetJob: Reset cookie consent for member {Id} ({Key}). DaysSinceConsent={Days}", member.Id, member.Key, days);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CookieConsentResetJob: Error handling member {Id} ({Key})", member.Id, member.Key);
            }
        }

        _logger.LogInformation("CookieConsentResetJob: completed.");
        await Task.CompletedTask;
    }

    // --- Melp Methods ---

    private static string? NormalizeStatus(object? rawStatusObj)
    {
        if (rawStatusObj == null)
            return null;

        var s = rawStatusObj.ToString();

        if (string.IsNullOrWhiteSpace(s) || s == "<null>")
            return null;

        s = s.Trim();

        if (s.StartsWith("[") && s.EndsWith("]"))
        {
            s = s.Trim('[', ']');

            s = s.Trim().Trim('"');

            if (s.Contains('"'))
            {
                s = s
                    .Split('"')
                    .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x))
                    ?? s;
            }
        }

        return s.Trim();
    }

    private static DateTime? NormalizeDate(object? rawDateObj)
    {
        if (rawDateObj == null)
            return null;

        if (rawDateObj is DateTime dt)
            return dt;

        if (DateTime.TryParse(rawDateObj.ToString(), out var parsed))
            return parsed;

        return null;
    }

    private static int? ParseStatusStringToCode(string? statusString)
    {
        if (string.IsNullOrWhiteSpace(statusString))
            return null;

        switch (statusString.Trim())
        {
            case "Not Accepted":
                return (int)CookieConsentStatus.NotAccepted;

            case "Accepted":
                return (int)CookieConsentStatus.Accepted;

            case "Retracted":
                return (int)CookieConsentStatus.Retracted;

            default:
                return null;
        }
    }
}
