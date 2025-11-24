/**
 * My Workouts Page
 * Handles favorite-specific logic
 */

// Check if we're on the my workouts page
const isMyWorkoutsPage = document.querySelector('[data-page-type="my-workouts"]');

if (isMyWorkoutsPage) {
    
    // Get localized texts and URLs from data attributes (provided by backend)
    const section = isMyWorkoutsPage;
    const emptyTitle = section?.dataset.emptyTitle;
    const workoutsTemplatesText = section?.dataset.workoutsTemplatesText;
    const generatorText = section?.dataset.generatorText;
    const descriptionText = section?.dataset.descriptionText;
    const workoutsUrl = section?.dataset.workoutsUrl;
    const generatorUrl = section?.dataset.generatorUrl;
    const filterEmptyText = section?.dataset.filterEmptyText;
    
    // Build description with links
    const emptyDescription = descriptionText
        .replace('{0}', `<a href="${workoutsUrl}" class="text-primary hover:underline">${workoutsTemplatesText}</a>`)
        .replace('{1}', `<a href="${generatorUrl}" class="text-primary hover:underline">${generatorText}</a>`);
    
    // Listen for favorite toggle events to update heart icons
    window.addEventListener('workoutFavoriteToggled', (event) => {
        const { workoutId, isFavorited } = event.detail;
        
        // Update heart icon in the card
        const card = document.querySelector(`[data-workout-id="${workoutId}"]`);
        if (card) {
            const heartIcon = card.querySelector('.fa-heart');
            if (heartIcon) {
                if (isFavorited) {
                    heartIcon.classList.add('text-red-500');
                } else {
                    heartIcon.classList.remove('text-red-500');
                }
            }
        }
    });

    // Listen for workout removal events to remove card from page
    window.addEventListener('workoutRemovedFromMyWorkouts', (event) => {
        const { workoutId } = event.detail;
        
        removeCardWithAnimation(
            workoutId,
            'myWorkoutsGrid',
            'fa-dumbbell',
            emptyTitle,
            emptyDescription
        );
    });

    // Initialize filters only if grid exists and has cards
    const myWorkoutsGrid = document.getElementById('myWorkoutsGrid');
    if (myWorkoutsGrid && myWorkoutsGrid.querySelector('[data-workout-id]')) {
        initializeWorkoutFilters({
            gridId: 'myWorkoutsGrid',
            emptyIcon: 'fa-dumbbell',
            emptyMessage: emptyTitle,
            emptySubtext: emptyDescription,
            filterEmptyText: filterEmptyText
        });
    }
}
