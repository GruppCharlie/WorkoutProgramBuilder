/**
 * Favorites Page
 * Handles favorite-specific logic
 */

// Check if we're on the favorites page
const isFavoritesPage = document.querySelector('[data-page-type="favorites"]');

if (isFavoritesPage) {
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

    // Initialize filters if workout grid exists
    const workoutsGrid = document.getElementById('favoritesWorkoutsGrid');
    if (workoutsGrid) {
        const filterEmptyText = isFavoritesPage.dataset.filterEmptyText;
        
        initializeWorkoutFilters({
            gridId: 'favoritesWorkoutsGrid',
            emptyIcon: 'fa-heart',
            emptyMessage: 'No favorites found',
            emptySubtext: null,
            filterEmptyText: filterEmptyText
        });
    }
}

// Listen for exercise favorite toggle events
window.addEventListener('exerciseFavoriteToggled', (event) => {
    const { exerciseId, isFavorite } = event.detail;
    
    // Only remove card if we're on the favorites page
    const isFavoritesPage = document.querySelector('[data-page-type="favorites"]');
    
    if (!isFavorite && isFavoritesPage) {
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
    
    // Get localized texts and URLs from data attributes (provided by backend)
    const emptyTitle = container.dataset.emptyTitle;
    const myWorkoutsText = container.dataset.myWorkoutsText;
    const generatorText = container.dataset.generatorText;
    const descriptionText = container.dataset.descriptionText;
    const myWorkoutsUrl = container.dataset.myWorkoutsUrl;
    const generatorUrl = container.dataset.generatorUrl;
    
    // Build description with links
    const description = descriptionText
        .replace('{0}', `<a href="${myWorkoutsUrl}" class="text-primary hover:underline">${myWorkoutsText}</a>`)
        .replace('{1}', `<a href="${generatorUrl}" class="text-primary hover:underline">${generatorText}</a>`);
    
    // Create empty state element
    const emptyState = createEmptyState({
        icon: 'fa-heart',
        title: emptyTitle,
        description: description
    });
    
    // Find filter bar and insert empty state
    const heading = container.querySelector('h1');
    const filterBar = heading?.nextElementSibling;

    if (filterBar) {
        filterBar.insertAdjacentElement('afterend', emptyState);
    } else {
        console.error('Favorites: Filter bar not found');
    }
}
