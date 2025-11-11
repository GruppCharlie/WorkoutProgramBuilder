/**
 * Workout Card Navigation
 * Handles click events on workout cards
 * Navigate to workout detail page
 * First saves the workout to My Workouts if not already added, then navigates
 */
async function navigateToWorkoutDetail(workoutId) {
    if (!workoutId) return;
    
    // Find the workout card to get all data
    const workoutCard = document.querySelector(`[data-workout-id="${workoutId}"]`);
    if (!workoutCard) {
        console.error('Workout card not found');
        return;
    }
    
    // Get the "Add to My Workouts" button
    const addButton = workoutCard.querySelector('.add-to-my-workouts-btn');
    
    // Only add to My Workouts if not already added (not disabled)
    if (addButton && !addButton.disabled) {
        // Check if it's not already in My Workouts
        const icon = addButton.querySelector('i');
        const isNotInMyWorkouts = icon && icon.classList.contains('fa-plus');
        
        if (isNotInMyWorkouts) {
            await addToMyWorkouts(new Event('click'), addButton);
            
            setTimeout(() => {
                window.location.href = `/workouts/workout-details?workoutId=${workoutId}`;
            }, 500);
            return;
        }
    }
    
    // If already in My Workouts, navigate directly
    window.location.href = `/workouts/workout-details?workoutId=${workoutId}`;
}

/**
 * Toggle workout favorite status
 */
async function toggleWorkoutFavorite(event, button) {
    event.stopPropagation();
    
    const heartIcon = button.querySelector('i');
    
    const exercisesJson = button.getAttribute('data-workout-exercises');
    const decodedJson = exercisesJson ? exercisesJson.replace(/&quot;/g, '"') : '[]';
    const exercises = JSON.parse(decodedJson);
    
    const workoutData = {
        WorkoutId: button.getAttribute('data-workout-id'),
        Name: button.getAttribute('data-workout-name'),
        Description: button.getAttribute('data-workout-description'),
        Muscles: button.getAttribute('data-workout-muscles').split(',').filter(Boolean),
        Equipment: button.getAttribute('data-workout-equipment').split(',').filter(Boolean),
        Exercises: exercises
    };
    
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
    }
}

/**
 * Add workout to My Workouts
 */
async function addToMyWorkouts(event, button) {
    event.stopPropagation();
    
    const exercisesJson = button.getAttribute('data-workout-exercises');
    const decodedJson = exercisesJson ? exercisesJson.replace(/&quot;/g, '"') : '[]';
    const exercises = JSON.parse(decodedJson);
    
    const workoutData = {
        WorkoutId: button.getAttribute('data-workout-id'),
        Name: button.getAttribute('data-workout-name'),
        Description: button.getAttribute('data-workout-description'),
        Muscles: button.getAttribute('data-workout-muscles').split(',').filter(Boolean),
        Equipment: button.getAttribute('data-workout-equipment').split(',').filter(Boolean),
        Exercises: exercises
    };
    
    try {
        const response = await saveWorkoutToMyWorkouts(workoutData);

        if (response.status === 401) {
            showLoginModal();
            return;
        }

        if (response.ok) {
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
    }
}

/**
 * Remove workout from My Workouts
 */
async function removeFromMyWorkouts(event, button) {
    event.stopPropagation();
    
    const workoutId = button.getAttribute('data-workout-id');
    
    try {
        const response = await fetch(`/api/workout/remove/${workoutId}`, {
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
        console.error('Error removing from My Workouts:', error);
    }
}
