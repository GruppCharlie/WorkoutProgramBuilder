using Umbraco.Cms.Core.Composing;
using WorkoutProgramBuilder.Business.Interface;

namespace WorkoutProgramBuilder.Composers;

public class ServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddHttpClient<IExerciseDbService, ExerciseDbService>();
    }
}
