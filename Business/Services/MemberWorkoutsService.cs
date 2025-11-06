using System.Text.Json;
using Umbraco.Cms.Core.Services;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Business.Services;


// Service for managing member's My Workouts
public interface IMemberWorkoutsService
{
    List<SavedWorkoutDto> GetMyWorkouts(int memberId);
    bool ToggleMyWorkout(int memberId, SavedWorkoutDto workout);
}

public class MemberWorkoutsService(IMemberService memberService) : IMemberWorkoutsService
{
    public List<SavedWorkoutDto> GetMyWorkouts(int memberId)
    {
        var member = memberService.GetById(memberId);
        if (member == null) return [];

        var myWorkoutsJson = member.GetValue<string>("myWorkoutsJson");
        if (string.IsNullOrWhiteSpace(myWorkoutsJson)) return [];

        return JsonSerializer.Deserialize<List<SavedWorkoutDto>>(myWorkoutsJson) ?? [];
    }

    public bool ToggleMyWorkout(int memberId, SavedWorkoutDto workout)
    {
        var member = memberService.GetById(memberId);
        if (member == null) return false;

        var savedJson = member.GetValue<string>("myWorkoutsJson");
        var saved = string.IsNullOrWhiteSpace(savedJson)
            ? []
            : JsonSerializer.Deserialize<List<SavedWorkoutDto>>(savedJson) ?? [];

        var existing = saved.FirstOrDefault(w => w.WorkoutId == workout.WorkoutId);

        if (existing != null)
        {
            // Remove from My Workouts
            saved.Remove(existing);
            var currentAmount = member.GetValue<int?>("amountOfMyWorkouts") ?? 0;
            member.SetValue("amountOfMyWorkouts", Math.Max(0, currentAmount - 1));
        }
        else
        {
            // Add to My Workouts
            saved.Add(workout);
            var currentAmount = member.GetValue<int?>("amountOfMyWorkouts") ?? 0;
            member.SetValue("amountOfMyWorkouts", currentAmount + 1);
        }

        var newJson = JsonSerializer.Serialize(saved);
        member.SetValue("myWorkoutsJson", newJson);
        memberService.Save(member);

        return true;
    }
}
