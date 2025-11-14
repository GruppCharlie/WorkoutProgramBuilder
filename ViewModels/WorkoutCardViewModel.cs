using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.ViewModels;

public class WorkoutCardViewModel
{
    public required List<SavedWorkoutDto> Workouts { get; set; }
    public required string ExercisesText { get; set; }
    public required string VisualizationTitle { get; set; }
    public required string MusclesLabel { get; set; }
    public required string EquipmentLabel { get; set; }
}
