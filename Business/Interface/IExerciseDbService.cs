using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Business.Interface;

public interface IExerciseDbService
{
    Task<ExerciseSearchResponseDto?> SearchAsync(string query, int offset = 0, int limit = 10);
    Task<ExerciseDto?> GetByIdAsync(string exerciseId);
}