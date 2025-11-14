/**
 * Favorites Page
 * Handles favorite-specific logic
 */

// Only run on Favorites page
if (document.getElementById('favoritesWorkoutsGrid')) {
    
    // Listen for workout favorite toggle events
    window.addEventListener('workoutFavoriteToggled', (event) => {
        const { workoutId, isFavorited } = event.detail;
        
        if (!isFavorited) {
            const card = document.querySelector(`[data-workout-id="${workoutId}"]`)?.closest('.workout-card');
            const section = document.getElementById('favoritesWorkoutsGrid')?.parentElement;
            
            removeFavoriteCard(card, section, '[data-workout-id]');
        }
    });

    // Listen for "Remove from My Workouts" to update checkmark icon only
    window.addEventListener('workoutRemovedFromMyWorkouts', (event) => {
        const { workoutId } = event.detail;
        updateCheckmarkIcon(workoutId);
    });

    // Initialize filters
    initializeWorkoutFilters({
        gridId: 'favoritesWorkoutsGrid',
        emptyIcon: 'fa-heart',
        emptyMessage: 'No favorites found',
        emptySubtext: null
    });
}

// Listen for exercise favorite toggle events
window.addEventListener('exerciseFavoriteToggled', (event) => {
    const { exerciseId, isFavorite } = event.detail;
    
    if (!isFavorite && window.location.pathname.includes('/favorites')) {
        const card = document.querySelector(`.exercise-card[data-id="${exerciseId}"]`);
        const section = card?.parentElement?.parentElement;
        
        removeFavoriteCard(card, section, '.exercise-card');
    }
});

/**
 * Remove a favorite card with fade out animation
 * {HTMLElement} card - The card element to remove
 * {HTMLElement} section - The parent section containing the card
 * {string} remainingSelector - CSS selector to check for remaining cards of same type
 */
function removeFavoriteCard(card, section, remainingSelector) {
    if (!card) return;
    
    // Fade out animation
    card.style.transition = 'opacity 300ms ease-out';
    card.style.opacity = '0';
    
    setTimeout(() => {
        card.remove();
        
        // Check if there are any cards of this type left
        const remainingCards = document.querySelectorAll(remainingSelector);
        
        if (remainingCards.length === 0 && section) {
            section.remove();
            
            // Check if ALL favorites are gone
            const hasWorkouts = document.querySelectorAll('[data-workout-id]').length > 0;
            const hasExercises = document.querySelectorAll('.exercise-card').length > 0;
            
            if (!hasWorkouts && !hasExercises) {
                showEmptyFavoritesState();
            }
        }
    }, 300);
}

/**
 * Show empty favorites state when all favorites are removed
 */
function showEmptyFavoritesState() {
    const container = document.querySelector('section.container');
    if (!container) {
        console.error('Favorites: Container not found');
        return;
    }
    
    // Remove ALL sections (workouts and exercises if they exist)
    const workoutsSection = document.getElementById('favoritesWorkoutsGrid')?.parentElement;
    const exercisesSection = document.querySelector('.exercise-card')?.closest('div')?.parentElement;
    
    if (workoutsSection) workoutsSection.remove();
    if (exercisesSection) exercisesSection.remove();
    
    // Check if empty state already exists
    const existingEmptyState = container.querySelector('.fa-heart')?.closest('.flex.flex-col');
    if (existingEmptyState) return;
    
    // Get localized texts from data attributes
    const emptyTitle = container.dataset.emptyTitle || 'No favorites yet';
    const myWorkoutsText = container.dataset.myWorkoutsText || 'My Workouts';
    const generatorText = container.dataset.generatorText || 'AI Workout Generator';
    const descriptionText = container.dataset.descriptionText || 'Add from {0} or try our {1} to create custom workouts!';
    const myWorkoutsUrl = container.dataset.myWorkoutsUrl || '/workouts/my-workouts';
    const generatorUrl = container.dataset.generatorUrl || '/workouts/generator';
    
    // Build description with links
    const description = descriptionText
        .replace('{0}', `<a href="${myWorkoutsUrl}" class="text-primary hover:underline">${myWorkoutsText}</a>`)
        .replace('{1}', `<a href="${generatorUrl}" class="text-primary hover:underline">${generatorText}</a>`);
    
    // Create empty state HTML
    const emptyStateHTML = `
        <div class="flex flex-col items-center justify-center text-center py-16">
            <div class="max-w-md mx-auto">
                <i class="fas fa-heart text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">${emptyTitle}</h3>
                <p class="text-sm text-gray-500 mt-4">${description}</p>
            </div>
        </div>
    `;
    
    // Find filter bar
    const heading = container.querySelector('h1');
    const filterBar = heading?.nextElementSibling;

    if (filterBar) {
        filterBar.insertAdjacentHTML('afterend', emptyStateHTML);
    } else {
        console.error('Favorites: Filter bar not found');
    }
}
