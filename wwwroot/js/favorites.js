/**
 * Favorites Page
 * Handles favorite-specific logic
 */

// Only run on Favorites page
if (document.getElementById('favoritesWorkoutsGrid')) {
    
    // Listen for favorite toggle events to remove card from page
    window.addEventListener('workoutFavoriteToggled', (event) => {
        const { workoutId, isFavorited } = event.detail;
        
        // If unfavorited, remove from favorites page
        if (!isFavorited) {
            removeCardWithAnimation(
                workoutId,
                'favoritesWorkoutsGrid',
                'fa-heart',
                'No favorites found',
                'Add workouts to favorites from <a href="/workouts/my-workouts" class="text-primary hover:underline">My Workouts</a>!'
            );
        }
    });

    // Listen for "Remove from My Workouts" to update checkmark icon only
    window.addEventListener('workoutRemovedFromMyWorkouts', (event) => {
        const { workoutId } = event.detail;
        updateCheckmarkIcon(workoutId);
    });

    // Initialize filters using shared function
    initializeWorkoutFilters({
        gridId: 'favoritesWorkoutsGrid',
        emptyIcon: 'fa-heart',
        emptyMessage: 'No favorites found',
        emptySubtext: null
    });
}
