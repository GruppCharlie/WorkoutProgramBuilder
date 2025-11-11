/**
 * My Workouts Page
 * Handles favorite-specific logic
 */

// Only run on My Workouts page
if (document.getElementById('myWorkoutsGrid')) {
    
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
            'No workouts found',
            'Add workouts from the <a href="/workouts/generator" class="text-primary hover:underline">Workout Generator</a>!'
        );
    });

    // Initialize filters using shared function
    initializeWorkoutFilters({
        gridId: 'myWorkoutsGrid',
        emptyIcon: 'fa-dumbbell',
        emptyMessage: 'No workouts found',
        emptySubtext: 'Add workouts from the <a href="/workouts/generator" class="text-primary hover:underline">Workout Generator</a>!'
    });
}
