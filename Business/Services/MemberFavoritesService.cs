using System.Text.Json;
using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Business.Services;

/// <summary>
/// Service for managing member favorites (exercises and workouts)
/// </summary>
public interface IMemberFavoritesService
{
    List<ExerciseDto> GetFavoriteExercises(int memberId);
    List<SavedWorkoutDto> GetFavoriteWorkouts(int memberId);
    bool ToggleFavoriteExercise(int memberId, ExerciseDto exercise);
    bool ToggleFavoriteWorkout(int memberId, SavedWorkoutDto workout);
}

public class MemberFavoritesService(IMemberService memberService) : IMemberFavoritesService
{
    public List<ExerciseDto> GetFavoriteExercises(int memberId)
    {
        var member = memberService.GetById(memberId);
        if (member == null) return [];

        var savedJson = member.GetValue<string>("savedExercisesJson");
        if (string.IsNullOrWhiteSpace(savedJson)) return [];

        return JsonSerializer.Deserialize<List<ExerciseDto>>(savedJson) ?? [];
    }

    public List<SavedWorkoutDto> GetFavoriteWorkouts(int memberId)
    {
        var member = memberService.GetById(memberId);
        if (member == null) return [];

        var savedJson = member.GetValue<string>("savedWorkoutsJson");
        if (string.IsNullOrWhiteSpace(savedJson)) return [];

        return JsonSerializer.Deserialize<List<SavedWorkoutDto>>(savedJson) ?? [];
    }

    public bool ToggleFavoriteExercise(int memberId, ExerciseDto exercise)
    {
        var member = memberService.GetById(memberId);
        if (member == null) return false;

        var savedJson = member.GetValue<string>("savedExercisesJson");
        var saved = string.IsNullOrWhiteSpace(savedJson)
            ? []
            : JsonSerializer.Deserialize<List<ExerciseDto>>(savedJson) ?? [];

        var exists = saved.FirstOrDefault(s => s.ExerciseId == exercise.ExerciseId);
        
        if (exists != null)
        {
            // Remove from favorites
            saved.Remove(exists);
            var currentAmount = member.GetValue<int?>("amountOfSavedExercises") ?? 0;
            member.SetValue("amountOfSavedExercises", Math.Max(0, currentAmount - 1));
        }
        else
        {
            // Add to favorites
            saved.Add(exercise);
            var currentAmount = member.GetValue<int?>("amountOfSavedExercises") ?? 0;
            member.SetValue("amountOfSavedExercises", currentAmount + 1);
        }

        var newJson = JsonSerializer.Serialize(saved);
        member.SetValue("savedExercisesJson", newJson);
        memberService.Save(member);

        return true;
    }

    public bool ToggleFavoriteWorkout(int memberId, SavedWorkoutDto workout)
    {
        var member = memberService.GetById(memberId);
        if (member == null) return false;

        var savedJson = member.GetValue<string>("savedWorkoutsJson");
        var saved = string.IsNullOrWhiteSpace(savedJson)
            ? []
            : JsonSerializer.Deserialize<List<SavedWorkoutDto>>(savedJson) ?? [];

        var exists = saved.FirstOrDefault(s => s.WorkoutId == workout.WorkoutId);
        
        if (exists != null)
        {
            // Remove from favorites
            saved.Remove(exists);
            var currentAmount = member.GetValue<int?>("amountOfSavedWorkouts") ?? 0;
            member.SetValue("amountOfSavedWorkouts", Math.Max(0, currentAmount - 1));
        }
        else
        {
            // Add to favorites
            saved.Add(workout);
            var currentAmount = member.GetValue<int?>("amountOfSavedWorkouts") ?? 0;
            member.SetValue("amountOfSavedWorkouts", currentAmount + 1);
        }

        var newJson = JsonSerializer.Serialize(saved);
        member.SetValue("savedWorkoutsJson", newJson);
        memberService.Save(member);

        return true;
    }
}
