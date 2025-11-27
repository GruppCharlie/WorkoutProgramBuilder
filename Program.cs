using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using NPoco;
using WorkoutProgramBuilder.Business.Configuration;
using WorkoutProgramBuilder.Business.Options;
using WorkoutProgramBuilder.Business.ScheduledJobs;
using WorkoutProgramBuilder.Business.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddRapidApiHttpClient<IMuscleGroupApiService, MuscleGroupApiService>(timeoutSeconds: 10);
builder.Services.AddRapidApiHttpClient<IRapidApiService, GenerateWorkoutApiService>();
builder.Services.Configure<InactiveMemberCleanupOptions>(builder.Configuration.GetSection("InactiveMemberCleanup"));
builder.Services.AddTransient<InactiveMemberCleanupJob>();
builder.Services.AddTransient<UserEmailService>();


builder.Services.AddResponseCaching();
builder.Services.AddControllers();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .AddAzureBlobMediaFileSystem()
    .AddAzureBlobImageSharpCache()
    .Build();

builder.Services.AddTransient<IDatabase>(sp =>
{
    var connStr = builder.Configuration.GetConnectionString("umbracoDbDSN")
                  ?? throw new InvalidOperationException("Missing DefaultConnection connection string");
    var connection = new SqlConnection(connStr);
    connection.Open();

    var db = new Database(connection, DatabaseType.SqlServer2012);
    return db;
});


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
