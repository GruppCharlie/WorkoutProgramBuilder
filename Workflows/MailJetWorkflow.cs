using System.Net;
using System.Net.Mail;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Attributes;
using Umbraco.Forms.Core.Enums;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Workflows;

public class MailJetWorkflow : WorkflowType
{
    private readonly ILogger<MailJetWorkflow> _logger;
    private readonly UserEmailService _emailService;


    [Setting(
        "E-mail Subject",
        Description = "Enter your e-mail subject",
        View = "Umb.PropertyEditorUi.TextBox"
    )]
    public string MailSubject { get; set; }


    [Setting(
    "Email body",
    Description = "Enter the email body",
    View = "Umb.PropertyEditorUi.TextBox"
)]
    public string MailBody { get; set; }

    [Setting(
        "Sender Email",
        Description = "Enter the sender email address",
        View = "Umb.PropertyEditorUi.TextBox"
)]
    public string SenderEmail { get; set; }


    public MailJetWorkflow(
        ILogger<MailJetWorkflow> logger,
        UserEmailService emailService)
    {
        _logger = logger;
        _emailService = emailService;

        Id = new Guid("B9C2B6FD-AD96-457C-970F-F1A088C4C6FB");
        Name = "MailJet Workflow";
        Description = "This workflow is for using MailJet";
        Icon = "icon-chat-active";
        Group = "Services";
    }


    public override List<Exception> ValidateSettings()
    {
        var exceptions = new List<Exception>();

        if (string.IsNullOrWhiteSpace(MailSubject))
        {
            exceptions.Add(new Exception("Mail subjet is required"));
        }

        return exceptions;
    }

    public override async Task<WorkflowExecutionStatus> ExecuteAsync(WorkflowExecutionContext context)
    {
        if (context.Record.RecordFields.Values.Count > 1)
        {
            var emailField = context.Record.RecordFields.Values.ElementAt(0);

            string recipientEmail = emailField.Values.FirstOrDefault()?.ToString();

            if (!string.IsNullOrWhiteSpace(recipientEmail))
            {
                context.Record.State = FormState.Approved;

                await SendTestMail(recipientEmail);

                return WorkflowExecutionStatus.Completed;
            }
        }

        _logger.LogWarning("Recipient email not found in the expected field.");
        return WorkflowExecutionStatus.Failed;
    }

    private async Task SendTestMail(string recipientEmail)
    {
        try
        {
            var smtpClient = new SmtpClient("in-v3.mailjet.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(
                    "e20f72a1494b8a9a03c0f93e62d08b53",
                    "e6accd8d401e75bf3e287e0caa8295e6"),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(SenderEmail),
                Subject = MailSubject,
                Body = MailBody,
                IsBodyHtml = true
            };

            mail.To.Add(recipientEmail);

            smtpClient.Send(mail);

            await _emailService.SaveAsync(new UserEmail
            {
                Email = recipientEmail
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error sending email");
            throw;
        }
    }
}

