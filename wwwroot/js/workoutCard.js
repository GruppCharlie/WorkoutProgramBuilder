/**
 * Workout Card Navigation
 * Handles click events on workout cards
 * For authenticated users: navigates directly (user must manually add to My Workouts)
 * For unauthenticated users: saves to sessionStorage and navigates
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
    }
    
    // For authenticated users: navigate directly without auto-adding to My Workouts
    // User must manually click the plus button to add workout
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
                showSuccessToast(workoutData.ToastAddToFavorites);
            } else {
                showInfoToast(workoutData.ToastRemoveFromFavorites);
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
            
            showSuccessToast(workoutData.ToastAddToMyWorkouts);
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
    const workoutData = extractWorkoutDataFromButton(button);
    
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
            
            showInfoToast(workoutData.ToastRemoveFromMyWorkouts);
            
            
            window.dispatchEvent(new CustomEvent('workoutRemovedFromMyWorkouts', {
                detail: { workoutId }
            }));
        }
    } catch (error) {
        console.error('Error removing workout:', error);
        showErrorToast('Failed to remove workout. Please try again.');
    }
}
