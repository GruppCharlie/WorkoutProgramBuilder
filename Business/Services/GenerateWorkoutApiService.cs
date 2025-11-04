using Newtonsoft.Json;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Business.Services;

public interface IRapidApiService
{
    Task<WorkoutResponse?> GenerateWorkoutAsync(GenerateWorkoutRequest request);
}

public class GenerateWorkoutApiService(HttpClient httpClient, ILogger<GenerateWorkoutApiService> logger) : IRapidApiService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<GenerateWorkoutApiService> _logger = logger;

    public async Task<WorkoutResponse?> GenerateWorkoutAsync(GenerateWorkoutRequest request)
    {
        try
        {
            _logger.LogInformation("Generating workout for muscle groups: {MuscleGroups}", 
                string.Join(", ", request.MuscleGroups));

            var payload = new
            {
                muscleGroups = request.MuscleGroups.Count > 0 ? request.MuscleGroups : ["any"],
                equipment = request.Equipment.Count > 0 ? request.Equipment : ["any"],
                description = request.Description
            };

            var jsonPayload = JsonConvert.SerializeObject(payload);
            using var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");
            
            using var response = await _httpClient.PostAsync("workout", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var workout = JsonConvert.DeserializeObject<WorkoutResponse>(responseBody);

            _logger.LogInformation("Successfully generated workout: {WorkoutName}", workout?.Name);
            return workout;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error generating workout: {StatusCode}", ex.StatusCode);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating workout");
            return null;
        }
    }
}
