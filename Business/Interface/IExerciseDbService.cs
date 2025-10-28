using WorkoutProgramBuilder.Business.Dto;
using System.Threading.Tasks;

namespace WorkoutProgramBuilder.Business.Interface;

public interface IExerciseDbService
{
    Task<ExerciseSearchResponseDto?> SearchAsync(string query, int offset = 0, int limit = 10);
}