namespace WorkoutProgramBuilder.Business.Options;

public class InactiveMemberCleanupOptions
{
    public bool Enabled { get; set; }
    public int MonthsInactive { get; set; }
    public int PageSize { get; set; }
}
