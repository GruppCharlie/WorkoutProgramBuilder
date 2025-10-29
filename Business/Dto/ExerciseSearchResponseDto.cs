namespace WorkoutProgramBuilder.Business.Dto;

public class ExerciseSearchResponseDto
{
    public bool? Success { get; set; }
    public ExerciseMetadataDto? Metadata { get; set; }
    public List<ExerciseDto>? Data { get; set; }
}

