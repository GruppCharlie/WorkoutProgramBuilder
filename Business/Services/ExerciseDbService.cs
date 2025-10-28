using System.Text.Json;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Interface;

public class ExerciseDbService : IExerciseDbService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExerciseDbService> _logger;

    public ExerciseDbService(HttpClient httpClient, ILogger<ExerciseDbService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<ExerciseSearchResponseDto?> SearchAsync(string query, int offset = 0, int limit = 10)
    {
        var results = new ExerciseSearchResponseDto();
        if (string.IsNullOrWhiteSpace(query)) return results;

        try
        {
            var response = await _httpClient.GetAsync($"https://www.exercisedb.dev/api/v1/exercises/search?offset={offset}&limit={limit}&q={Uri.EscapeDataString(query)}");

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                results = JsonSerializer.Deserialize<ExerciseSearchResponseDto>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching exercises from ExerciseDB API");
        }

        return results;
    }

}
