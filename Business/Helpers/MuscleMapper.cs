namespace WorkoutProgramBuilder.Business.Helpers;


// Backend mapping för server-side rendering
// Helper class for mapping muscle names to API muscle group names
public static class MuscleMapper
{
    // Map special muscle names to API names (normalized: no spaces/underscores)
    private static readonly Dictionary<string, string> MuscleMapping = new()
    {
        { "HAMSTRINGS", "hamstring" },
        { "GLUTES", "gluteus" },
        { "BACK", "latissimus" },
        { "UPPERBACK", "back_upper" },  
        { "LOWERBACK", "back_lower" },
        { "BACKUPPER", "back_upper" },
        { "BACKLOWER", "back_lower" },
        { "LATS", "latissimus" },
        { "CALVES", "calfs" },
        { "ABDOMINALS", "abs" },
        { "TRAPS", "back_upper" },
        { "TRAPEZIUS", "back_upper" },
        { "CORE", "core" },
        { "CORELOWER", "core_lower" },
        { "COREUPPER", "core_upper" },
        { "SHOULDERSBACK", "shoulders_back" },
        { "SHOULDERSFRONT", "shoulders_front" },
        { "SHOULDERBACK", "shoulders_back" },
        { "SHOULDERFRONT", "shoulders_front" }
    };

    // Special muscle groups that expand to multiple muscles
    private static readonly Dictionary<string, List<string>> SpecialGroups = new()
    {
        { "ALL", ["quadriceps", "hamstring", "gluteus", "chest", "shoulders", "triceps", "biceps", "back_upper", "back_lower", "latissimus", "calfs", "abs", "forearms"] },
        { "ALL_UPPER", ["chest", "shoulders", "triceps", "biceps", "back_upper", "latissimus", "abs", "forearms"] },
        { "ALL_LOWER", ["quadriceps", "hamstring", "gluteus", "calfs", "adductors", "abductors"] }
    };
    
    
    // Valid API muscle groups
    private static readonly HashSet<string> ValidMuscleGroups = new()
    {
        "quadriceps", "hamstring", "gluteus", "chest", "shoulders", "triceps", "biceps",
        "back_upper", "back_lower", "back", "latissimus", "calfs", "abs", "core", "core_upper", "core_lower",
        "shoulders_front", "shoulders_back", "forearms", "neck", "hands", "legs", "adductors", "abductors",
        "all", "all_upper", "all_lower"
    };

    // Map muscle names to valid API muscle group names
    public static List<string> MapToApiMuscleGroups(List<string> muscles)
    {
        var result = new List<string>();

        foreach (var muscle in muscles)
        {
            // Normalize: uppercase, trim, remove spaces and underscores
            var normalized = muscle.ToUpper().Trim().Replace(" ", "").Replace("_", "");
            
            // Check if it's a special group (ALL, ALL_UPPER, ALL_LOWER)
            if (SpecialGroups.TryGetValue(normalized, out var specialMuscles))
            {
                result.AddRange(specialMuscles);
            }
            // Check if needs mapping (HAMSTRINGS -> hamstring, etc)
            else if (MuscleMapping.TryGetValue(normalized, out var mapped))
            {
                result.Add(mapped);
            }
            else
            {
                // Try lowercase as-is (chest, biceps, etc)
                var lower = muscle.ToLower().Trim().Replace(" ", "").Replace("_", "");
                if (ValidMuscleGroups.Contains(lower))
                {
                    result.Add(lower);
                }
            }
        }

        return result.Where(m => !string.IsNullOrEmpty(m)).Distinct().ToList();
    }


    // Generate muscle visualization image URL
    public static string GenerateMuscleVisualizationUrl(List<string> muscles, string color = "131,115,218")
    {
        var mappedMuscles = MapToApiMuscleGroups(muscles);
        var muscleGroupsParam = string.Join(",", mappedMuscles);
        return $"/api/musclegroup/image?muscleGroups={Uri.EscapeDataString(muscleGroupsParam)}&color={Uri.EscapeDataString(color)}&transparentBackground=true";
    }
}
