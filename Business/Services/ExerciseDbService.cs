using System.Text.Json;
using WorkoutProgramBuilder.Business.Dto;
using WorkoutProgramBuilder.Business.Interface;

namespace WorkoutProgramBuilder.Business.Services;

public class ExerciseDbService(HttpClient httpClient, ILogger<ExerciseDbService> logger) : IExerciseDbService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<ExerciseDbService> _logger = logger;

    public async Task<ExerciseDto?> GetByIdAsync(string exerciseId)
    {
        if (string.IsNullOrWhiteSpace(exerciseId))
            return new ExerciseDto();

        try
        {
            var response = await _httpClient.GetAsync(
                $"https://www.exercisedb.dev/api/v1/exercises/{exerciseId}");

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ExerciseApiResponse>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return apiResponse?.Data ?? new ExerciseDto();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching exercise details from ExerciseDB API");
        }

        return new ExerciseDto();
    }



    public async Task<ExerciseSearchResponseDto?> SearchAsync(string query, int offset = 0, int limit = 10)
    {
        var results = new ExerciseSearchResponseDto();

        if (string.IsNullOrWhiteSpace(query))
            return results;

        try
        {
            var response = await _httpClient.GetAsync(
                $"https://www.exercisedb.dev/api/v1/exercises/search?offset={offset}&limit={limit}&q={Uri.EscapeDataString(query)}");

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