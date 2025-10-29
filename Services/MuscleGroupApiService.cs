namespace WorkoutProgramBuilder.Services;

public interface IMuscleGroupApiService
{
    Task<List<string>> GetMuscleGroupsAsync();
    Task<byte[]> GetMuscleImageAsync(string muscleGroups, string color = "79,70,229", bool transparentBackground = true);
}

public class MuscleGroupApiService : IMuscleGroupApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MuscleGroupApiService> _logger;
    private const string BaseUrl = "https://muscle-group-image-generator.p.rapidapi.com";
    private List<string>? _cachedMuscleGroups;

    public MuscleGroupApiService( HttpClient httpClient, IConfiguration configuration, ILogger<MuscleGroupApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        var apiKey = configuration["RapidApi:Key"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("RapidAPI key not configured");
            return;
        }

        _httpClient.DefaultRequestHeaders.Add("x-rapidapi-key", apiKey);
        _httpClient.DefaultRequestHeaders.Add("x-rapidapi-host", "muscle-group-image-generator.p.rapidapi.com");
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
    }

    public async Task<List<string>> GetMuscleGroupsAsync()
    {
        if (_cachedMuscleGroups != null)
            return _cachedMuscleGroups;

        try
        {
            var response = await _httpClient.GetAsync($"{BaseUrl}/getMuscleGroups");
            response.EnsureSuccessStatusCode();
            
            var muscleGroups = await response.Content.ReadFromJsonAsync<List<string>>();
            _cachedMuscleGroups = muscleGroups ?? [];
            
            _logger.LogInformation("Successfully loaded {Count} muscle groups", _cachedMuscleGroups.Count);
            return _cachedMuscleGroups;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to fetch muscle groups from API");
            return [];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching muscle groups");
            return [];
        }
    }

    public async Task<byte[]> GetMuscleImageAsync(string muscleGroups, string color = "79,70,229", bool transparentBackground = true)
    {
        try
        {
            var transparentBg = transparentBackground ? "1" : "0";
            
            // If no muscle groups selected, get base image
            if (string.IsNullOrWhiteSpace(muscleGroups))
            {
                var baseUrl = $"{BaseUrl}/getBaseImage?transparentBackground={transparentBg}";
                var baseResponse = await _httpClient.GetAsync(baseUrl);
                baseResponse.EnsureSuccessStatusCode();
                
                var baseImageBytes = await baseResponse.Content.ReadAsByteArrayAsync();
                _logger.LogDebug("Successfully fetched base image ({Size} bytes)", baseImageBytes.Length);
                return baseImageBytes;
            }
            
            var encodedMuscleGroups = Uri.EscapeDataString(muscleGroups);
            var encodedColor = Uri.EscapeDataString(color);
            var url = $"{BaseUrl}/getImage?muscleGroups={encodedMuscleGroups}&color={encodedColor}&transparentBackground={transparentBg}";
            
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            var imageBytes = await response.Content.ReadAsByteArrayAsync();
            
            if (imageBytes.Length < 100)
            {
                _logger.LogWarning("Received suspiciously small image ({Size} bytes) for muscles: {Muscles}", 
                    imageBytes.Length, muscleGroups);
                return [];
            }
            
            _logger.LogDebug("Successfully fetched muscle image ({Size} bytes) for: {Muscles}", 
                imageBytes.Length, muscleGroups);
            
            return imageBytes;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to fetch muscle image for: {Muscles}", muscleGroups);
            return [];
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Request timeout fetching muscle image for: {Muscles}", muscleGroups);
            return [];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching muscle image for: {Muscles}", muscleGroups);
            return [];
        }
    }
}
