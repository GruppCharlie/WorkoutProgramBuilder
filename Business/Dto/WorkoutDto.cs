namespace WorkoutProgramBuilder.Business.Dto;


// Request for generating a workout
public class GenerateWorkoutRequest
{
    public List<string> MuscleGroups { get; set; } = [];
    public List<string> Equipment { get; set; } = [];
    public string Description { get; set; } = "";
}


// Response for generated workout
public class WorkoutResponse
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public List<ExerciseResponse> Exercises { get; set; } = [];
}


// Exercise details in a workout
public class ExerciseResponse
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> Instructions { get; set; } = [];
    public List<string> MuscleGroups { get; set; } = [];
    public List<string> Equipment { get; set; } = [];
    public int Sets { get; set; }
    public int Reps { get; set; }
}


// Saved workout for favorites
public class SavedWorkoutDto
{
    public string WorkoutId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> Muscles { get; set; } = [];
    public List<string> Equipment { get; set; } = [];
    public bool IsSaved { get; set; }
    public bool IsInMyWorkouts { get; set; } 
}
