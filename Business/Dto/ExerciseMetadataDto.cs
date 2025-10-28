namespace WorkoutProgramBuilder.Business.Dto;

public class ExerciseMetadataDto
{
    public int? TotalPages { get; set; }
    public int? TotalExercises { get; set; }
    public int? CurrentPage { get; set; }
    public string? PreviousPage { get; set; }
    public string? NextPage { get; set; }
}

