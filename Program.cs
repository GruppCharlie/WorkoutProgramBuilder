using WorkoutProgramBuilder.Business.Services;
using WorkoutProgramBuilder.Business.Configuration;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddRapidApiHttpClient<IMuscleGroupApiService, MuscleGroupApiService>(timeoutSeconds: 10);
builder.Services.AddRapidApiHttpClient<IRapidApiService, GenerateWorkoutApiService>();

builder.Services.AddResponseCaching();
builder.Services.AddControllers();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .AddAzureBlobMediaFileSystem()
    .AddAzureBlobImageSharpCache()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();

app.UseHttpsRedirection();
app.UseResponseCaching();

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
        u.EndpointRouteBuilder.MapControllers();
    });

await app.RunAsync();
