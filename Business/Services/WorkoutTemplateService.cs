using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Models.Blocks;
using WorkoutProgramBuilder.Business.Dto;

namespace WorkoutProgramBuilder.Business.Services;

public interface IWorkoutTemplateService
{
    List<SavedWorkoutDto> GetWorkoutTemplates(IPublishedContent parentPage);
}

public class WorkoutTemplateService(
    ILogger<WorkoutTemplateService> logger,
    IUmbracoPageService umbracoPageService) : IWorkoutTemplateService
{
    public List<SavedWorkoutDto> GetWorkoutTemplates(IPublishedContent parentPage)
    {
        var templates = new List<SavedWorkoutDto>();
        var children = umbracoPageService.GetChildrenByType(parentPage, "workoutTemplate");
        
        foreach (var child in children)
        {
            try
            {
                var template = MapToWorkoutDto(child);
                templates.Add(template);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error parsing workout template: {TemplateName}", child.Name);
            }
        }
        
        return templates;
    }

    private SavedWorkoutDto MapToWorkoutDto(IPublishedContent template)
    {
        var workoutId = $"template-{template.Id}";
        var name = template.Value<string>("workoutName") ?? template.Name;
        var description = template.Value<string>("workoutDescription") ?? "";
        
        // Parse muscles and equipment from checkboxlist (can be string[] or string)
        var muscles = ParseCheckboxListValue(template, "muscles");
        var equipment = ParseCheckboxListValue(template, "equipment");
        
        // Parse exercises from Block List
        var exercises = ParseExercisesFromBlockList(template);
        
        return new SavedWorkoutDto
        {
            WorkoutId = workoutId,
            Name = name,
            Description = description,
            Muscles = muscles,
            Equipment = equipment,
            Exercises = exercises,
            IsSaved = false,
            IsInMyWorkouts = false
        };
    }

    private List<string> ParseCheckboxListValue(IPublishedElement content, string propertyAlias)
    {
        try
        {
            // Try to get as string array first (Umbraco checkboxlist returns string[])
            var arrayValue = content.Value<string[]>(propertyAlias);
            if (arrayValue is { Length: > 0 })
            {
                return arrayValue.Where(item => !string.IsNullOrWhiteSpace(item)).ToList();
            }
            
            // Fallback to comma-separated string
            var stringValue = content.Value<string>(propertyAlias);
            if (!string.IsNullOrWhiteSpace(stringValue))
            {
                return stringValue.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(item => item.Trim())
                    .Where(item => !string.IsNullOrWhiteSpace(item))
                    .ToList();
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Error parsing checkboxlist value for property: {PropertyAlias}", propertyAlias);
        }
        
        return [];
    }

    private List<ExerciseResponse> ParseExercisesFromBlockList(IPublishedContent template)
    {
        var exercises = new List<ExerciseResponse>();
        
        try
        {
            var blockList = template.Value<BlockListModel>("exercises");
            
            if (blockList == null || !blockList.Any())
                return exercises;
            
            foreach (var block in blockList)
            {
                var exercise = ParseExerciseBlock(block);
                if (exercise != null)
                {
                    exercises.Add(exercise);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error parsing exercises from Block List for template: {TemplateName}", template.Name);
        }
        
        return exercises;
    }

    private ExerciseResponse? ParseExerciseBlock(BlockListItem block)
    {
        try
        {
            var content = block.Content;
            
            var name = content.Value<string>("exerciseName") ?? "";
            var description = content.Value<string>("description") ?? "";
            var instructions = content.Value<string>("instructions") ?? "";
            var sets = content.Value<int>("sets");
            var reps = content.Value<int>("reps");
            
            if (string.IsNullOrWhiteSpace(name))
                return null;
            
            // Parse muscles and equipment from checkboxlist (can be string[] or string)
            var muscles = ParseCheckboxListValue(content, "muscles");
            var equipment = ParseCheckboxListValue(content, "equipment");
            
            return new ExerciseResponse
            {
                Name = name,
                Description = description,
                Instructions = ParseInstructions(instructions),
                MuscleGroups = muscles,
                Equipment = equipment,
                Sets = sets > 0 ? sets : 3,
                Reps = reps > 0 ? reps : 10
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error parsing exercise block");
            return null;
        }
    }

    private List<string> ParseInstructions(string? instructions)
    {
        if (string.IsNullOrWhiteSpace(instructions))
            return [];
        
        // Split by newline, semicolon, or period followed by space
        var separators = new[] { '\n', '\r', ';' };
        return instructions.Split(separators, StringSplitOptions.RemoveEmptyEntries)
            .Select(item => item.Trim())
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .ToList();
    }
}
