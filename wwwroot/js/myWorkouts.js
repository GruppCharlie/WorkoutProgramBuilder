/**
 * My Workouts Page
 * Handles favorite-specific logic
 */

// Only run on My Workouts page
if (document.getElementById('myWorkoutsGrid')) {
    
    // Get localized texts from data attributes
    const section = document.querySelector('section[data-empty-title]');
    const emptyTitle = section?.dataset.emptyTitle || 'No workouts found';
    const workoutsTemplatesText = section?.dataset.workoutsTemplatesText || 'Workouts templates';
    const generatorText = section?.dataset.generatorText || 'AI Workout Generator';
    const descriptionText = section?.dataset.descriptionText || 'Choose from our {0} or try our {1} to create custom workouts!';
    const workoutsUrl = section?.dataset.workoutsUrl || '/workouts';
    const generatorUrl = section?.dataset.generatorUrl || '/workouts/generator';
    
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

    // Initialize filters using shared function
    initializeWorkoutFilters({
        gridId: 'myWorkoutsGrid',
        emptyIcon: 'fa-dumbbell',
        emptyMessage: emptyTitle,
        emptySubtext: emptyDescription
    });
}
