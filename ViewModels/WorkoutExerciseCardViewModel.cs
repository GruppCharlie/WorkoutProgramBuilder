using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.ViewModels;

/*
 * View model for workout exercise card
 * makes it easier to pass data to the view
 */
public class WorkoutExerciseCardViewModel
{
    public ExerciseResponse Exercise { get; set; } = null!;
    public int ExerciseNumber { get; set; }
    public string VisualizationTitle { get; set; } = null!;
    public string InstructionsLabel { get; set; } = null!;
    public string SetsRepsLabel { get; set; } = null!;
    public string SetsText { get; set; } = null!;
    public string RepsText { get; set; } = null!;
    public string MusclesLabel { get; set; } = null!;
    public string EquipmentsLabel { get; set; } = null!;
}
