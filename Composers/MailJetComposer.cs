using Umbraco.Cms.Core.Composing;
using Umbraco.Forms.Core.Providers;
using WorkoutProgramBuilder.Workflows;

namespace WorkoutProgramBuilder.Composers;

public class MailJetComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.WithCollectionBuilder<WorkflowCollectionBuilder>().Add<MailJetWorkflow>();
    }
}
