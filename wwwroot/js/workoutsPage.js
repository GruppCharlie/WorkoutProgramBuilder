/**
 * Workouts Page (Templates)
 * Handles workout templates page logic
 */

// Check if we're on the workouts templates page
const isWorkoutsPage = document.querySelector('[data-page-type="workout-templates"]');

if (isWorkoutsPage) {
    // Initialize filters if workout grid exists
    const workoutsGrid = document.getElementById('workoutTemplatesGrid');
    if (workoutsGrid) {
        const emptyTitle = isWorkoutsPage.dataset.emptyTitle;
        const generatorText = isWorkoutsPage.dataset.generatorText;
        const descriptionText = isWorkoutsPage.dataset.descriptionText;
        const generatorUrl = isWorkoutsPage.dataset.generatorUrl;
        const filterEmptyText = isWorkoutsPage.dataset.filterEmptyText;
        
        // Build empty subtext with link
        const emptySubtext = descriptionText
            .replace('{0}', `<a href="${generatorUrl}" class="text-primary hover:underline">${generatorText}</a>`);
        
        initializeWorkoutFilters({
            gridId: 'workoutTemplatesGrid',
            emptyIcon: 'fa-dumbbell',
            emptyMessage: emptyTitle,
            emptySubtext: emptySubtext,
            filterEmptyText: filterEmptyText
        });
    }
}
