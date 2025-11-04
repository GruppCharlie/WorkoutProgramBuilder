using Umbraco.Cms.Core.Composing;
using WorkoutProgramBuilder.Business.Interface;
using WorkoutProgramBuilder.Business.Services;

namespace WorkoutProgramBuilder.Composers;

public class ServiceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddHttpClient<IExerciseDbService, ExerciseDbService>();
        builder.Services.AddScoped<ISitemapService, SitemapService>();
    }
}
