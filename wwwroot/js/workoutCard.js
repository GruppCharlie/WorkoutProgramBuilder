/**
 * Workout Card Navigation
 * Handles click events on workout cards
 * For authenticated users: saves to My Workouts then navigates
 * For unauthenticated users: saves to sessionStorage and navigates directly
 */
async function navigateToWorkoutDetail(workoutId) {
    if (!workoutId) return;
    
    // Find the workout card to get all data
    const workoutCard = document.querySelector(`[data-workout-id="${workoutId}"]`);
    if (!workoutCard) {
        console.error('Workout card not found');
        return;
    }
    
    // Check if user is authenticated
    const isAuthenticated = await isUserAuthenticated();
    
    if (!isAuthenticated) {
        // For unauthenticated users: save to sessionStorage and navigate
        const addButton = workoutCard.querySelector('.add-to-my-workouts-btn');
        if (addButton) {
            const workoutData = extractWorkoutDataFromButton(addButton);
            saveTemporaryWorkout(workoutData);
        }
        
        window.location.href = PAGE_ROUTES.WORKOUT_DETAILS(workoutId);
        return;
    }
    
    // For authenticated users: only auto-add AI-generated workouts (not CMS templates)
    const addButton = workoutCard.querySelector('.add-to-my-workouts-btn');
    const isTemplateWorkout = workoutId.startsWith('template-');
    
    if (addButton && !addButton.disabled && !isTemplateWorkout) {
        const icon = addButton.querySelector('i');
        const isNotInMyWorkouts = icon && icon.classList.contains('fa-plus');
        
        if (isNotInMyWorkouts) {
            await addToMyWorkouts(new Event('click'), addButton);
            
            setTimeout(() => {
                window.location.href = PAGE_ROUTES.WORKOUT_DETAILS(workoutId);
            }, 500);
            return;
        }
    }
    
    // Navigate directly (for templates or already saved workouts)
    window.location.href = PAGE_ROUTES.WORKOUT_DETAILS(workoutId);
}

/**
 * Toggle workout favorite status
 */
async function toggleWorkoutFavorite(event, button) {
    event.stopPropagation();
    
    const heartIcon = button.querySelector('i');
    const workoutData = extractWorkoutDataFromButton(button);
    
    try {
        const response = await saveWorkoutToFavorites(workoutData);

        if (response.status === 401) {
            showLoginModal();
            return;
        }

        if (response.ok) {
            const isFavorited = heartIcon.classList.toggle('text-red-500');
            
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
        console.error('Error saving workout:', error);
        showErrorToast('Failed to update favorites. Please try again.');
    }
}

/**
 * Add workout to My Workouts
 */
async function addToMyWorkouts(event, button) {
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
            
            const icon = button.querySelector('i');
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-check');
            button.classList.remove('text-gray-400', 'hover:text-primary');
            button.classList.add('text-green-500');
            button.title = 'Remove from My Workouts';
            button.onclick = (e) => removeFromMyWorkouts(e, button);
            
            showSuccessToast('Added to My Workouts!');
        }
    } catch (error) {
        console.error('Error saving to My Workouts:', error);
        showErrorToast('Failed to save workout. Please try again.');
    }
}

/**
 * Remove workout from My Workouts
 */
async function removeFromMyWorkouts(event, button) {
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
            const icon = button.querySelector('i');
            icon.classList.remove('fa-check');
            icon.classList.add('fa-plus');
            button.classList.remove('text-green-500');
            button.classList.add('text-gray-400', 'hover:text-primary');
            button.title = 'Add to My Workouts';
            button.onclick = (e) => addToMyWorkouts(e, button);
            
            showInfoToast('Removed from My Workouts');
            
            
            window.dispatchEvent(new CustomEvent('workoutRemovedFromMyWorkouts', {
                detail: { workoutId }
            }));
        }
    } catch (error) {
        console.error('Error removing workout:', error);
        showErrorToast('Failed to remove workout. Please try again.');
    }
}
