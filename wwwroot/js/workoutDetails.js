/**
 * Workout Details Page - Exercise Slider with Pagination Dots
 */

/**
 * Add workout to My Workouts (for full button with text)
 */
async function addToMyWorkoutsDetails(event, button) {
    event.stopPropagation();
    
    const workoutData = extractWorkoutDataFromButton(button);
    
    try {
        const response = await saveWorkoutToMyWorkouts(workoutData);

        if (response.status === 401) {
            showLoginModal();
            return;
        }

        if (response.ok) {
            // Clear temporary workout from sessionStorage (now in DB)
            clearTemporaryWorkout();
            
            updateMyWorkoutsButtonState(button, true);
            button.onclick = (e) => removeFromMyWorkoutsDetails(e, button);
            showSuccessToast('Added to My Workouts!');
        }
    } catch (error) {
        console.error('Error saving to My Workouts:', error);
        showErrorToast('Failed to save workout. Please try again.');
    }
}

/**
 * Remove workout from My Workouts (for full button with text)
 */
async function removeFromMyWorkoutsDetails(event, button) {
    event.stopPropagation();
    
    const workoutId = button.getAttribute('data-workout-id');
    
    try {
        const response = await fetch(API_ENDPOINTS.WORKOUT_REMOVE(workoutId), {
            method: 'DELETE'
        });

        if (response.status === 401) {
            showLoginModal();
            return;
        }

        if (response.ok) {
            updateMyWorkoutsButtonState(button, false);
            button.onclick = (e) => addToMyWorkoutsDetails(e, button);
            showInfoToast('Removed from My Workouts');
        }
    } catch (error) {
        console.error('Error removing from My Workouts:', error);
        showErrorToast('Failed to remove workout. Please try again.');
    }
}

/**
 * Toggle workout favorite (for full button with text)
 */
async function toggleWorkoutFavoriteDetails(event, button) {
    event.stopPropagation();
    
    const workoutData = extractWorkoutDataFromButton(button);
    
    try {
        const response = await saveWorkoutToFavorites(workoutData);

        if (response.status === 401) {
            showLoginModal();
            return;
        }

        if (response.ok) {
            const icon = button.querySelector('i');
            
            // Toggle the red color on the icon to determine current state
            const isFavorited = icon.classList.toggle('text-red-500');
            
            updateFavoriteButtonState(button, isFavorited);
            
            if (isFavorited) {
                showSuccessToast('Added to Favorites!');
            } else {
                showInfoToast('Removed from Favorites');
            }
            
            window.dispatchEvent(new CustomEvent('workoutFavoriteToggled', {
                detail: { 
                    workoutId: workoutData.WorkoutId, 
                    isFavorited 
                }
            }));
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showErrorToast('Failed to update favorites. Please try again.');
    }
}

/**
 * Scroll to specific exercise card
 */
function scrollToExercise(index) {
    const slider = document.getElementById('exerciseSlider');
    const cards = slider.querySelectorAll('.flex-none');
    const card = cards[index];
    
    if (card) {
        const cardLeft = card.offsetLeft;
        const sliderWidth = slider.offsetWidth;
        const cardWidth = card.offsetWidth;
        const scrollPosition = cardLeft - (sliderWidth / 2) + (cardWidth / 2);
        
        slider.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Initialize pagination for exercise slider
 */
function initializePagination() {
    const slider = document.getElementById('exerciseSlider');
    const dots = document.querySelectorAll('.exercise-dot');
    
    if (!slider || !dots.length) return;
    
    /**
     * Update active dot based on most visible card
     */
    function updateActiveDot() {
        const cards = slider.querySelectorAll('.flex-none');
        const scrollLeft = slider.scrollLeft;
        const scrollRight = scrollLeft + slider.offsetWidth;
        
        let mostVisibleIndex = 0;
        let maxVisibleArea = 0;
        
        cards.forEach((card, index) => {
            const cardLeft = card.offsetLeft;
            const cardRight = cardLeft + card.offsetWidth;
            
            // Calculate visible area of this card
            const visibleLeft = Math.max(scrollLeft, cardLeft);
            const visibleRight = Math.min(scrollRight, cardRight);
            const visibleArea = Math.max(0, visibleRight - visibleLeft);
            
            if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                mostVisibleIndex = index;
            }
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            if (index === mostVisibleIndex) {
                dot.classList.remove('bg-gray-300', 'w-2');
                dot.classList.add('bg-primary', 'w-8');
            } else {
                dot.classList.remove('bg-primary', 'w-8');
                dot.classList.add('bg-gray-300', 'w-2');
            }
        });
    }
    
    slider.addEventListener('scroll', updateActiveDot);
    updateActiveDot(); // Initial update
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Load workout data for unauthenticated users
    await loadUnauthenticatedWorkout();

    // Initialize pagination for authenticated users (already rendered by Razor)
    initializePagination();
});
