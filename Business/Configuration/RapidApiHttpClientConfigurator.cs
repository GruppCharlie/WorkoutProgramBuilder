

namespace WorkoutProgramBuilder.Business.Configuration;

public static class RapidApiHttpClientConfigurator
{
    private static HttpClient Configure(HttpClient httpClient, IConfiguration configuration, int timeoutSeconds = 30)
    {
        var apiKey = configuration["RapidApi:ApiKey"] ?? throw new InvalidOperationException("RapidApi:ApiKey not configured");
        var apiHost = configuration["RapidApi:ApiHost"] ?? "muscle-group-image-generator.p.rapidapi.com";

        httpClient.BaseAddress = new Uri($"https://{apiHost}");
        httpClient.DefaultRequestHeaders.Add("x-rapidapi-key", apiKey);
        httpClient.DefaultRequestHeaders.Add("x-rapidapi-host", apiHost);
        httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);

        return httpClient;
    }

    public static IHttpClientBuilder AddRapidApiHttpClient<TClient, TImplementation>( this IServiceCollection services, int timeoutSeconds = 30) where TClient : class where TImplementation : class, TClient
    {
        return services.AddHttpClient<TClient, TImplementation>((sp, client) =>
        {
            Configure(client, sp.GetRequiredService<IConfiguration>(), timeoutSeconds);
        });
    }
}