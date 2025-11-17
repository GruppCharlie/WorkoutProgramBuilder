namespace WorkoutProgramBuilder.Business.Services;

public interface IMuscleGroupApiService
{
    Task<List<string>> GetMuscleGroupsAsync();
    Task<byte[]> GetMuscleImageAsync(string muscleGroups, string? color = null, bool transparentBackground = true);
}

public class MuscleGroupApiService(HttpClient httpClient, ILogger<MuscleGroupApiService> logger) : IMuscleGroupApiService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<MuscleGroupApiService> _logger = logger;
    private const string DefaultMuscleColor = "22,96,121"; // RGB: Secondary Purple (#8373da)
    private List<string>? _cachedMuscleGroups;

    public async Task<List<string>> GetMuscleGroupsAsync()
    {
        if (_cachedMuscleGroups != null)
            return _cachedMuscleGroups;

        try
        {
            _logger.LogInformation("Fetching muscle groups from: {BaseAddress}getMuscleGroups", _httpClient.BaseAddress);
            var response = await _httpClient.GetAsync("getMuscleGroups");
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

    public async Task<byte[]> GetMuscleImageAsync(string muscleGroups, string? color = null, bool transparentBackground = true)
    {
        try
        {
            var muscleColor = color ?? DefaultMuscleColor;
            var transparentBg = transparentBackground ? "1" : "0";
            
            var url = string.IsNullOrWhiteSpace(muscleGroups)
                ? $"getBaseImage?transparentBackground={transparentBg}"
                : $"getImage?muscleGroups={Uri.EscapeDataString(muscleGroups)}&color={Uri.EscapeDataString(muscleColor)}&transparentBackground={transparentBg}";
            
            _logger.LogInformation("Fetching muscle image from: {BaseAddress}{Url}", _httpClient.BaseAddress, url);
            
            using var response = await _httpClient.GetAsync(url);
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
            _logger.LogError(ex, "HTTP error fetching muscle image for: {Muscles}", muscleGroups);
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
