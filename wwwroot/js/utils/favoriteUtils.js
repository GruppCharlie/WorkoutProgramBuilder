// Favorite utility 

/**
 * Toggle favorite status for an exercise
 * {Event} event - Click event
 * {HTMLElement} button - Favorite button element
 * returns {Promise<boolean>} - Success status
 */
async function toggleFavorite(event, button) {
    event.preventDefault();

    const exerciseData = getExerciseDataFromButton(button);

    try {
        const response = await toggleExerciseFavorite(exerciseData);

        if (response.status === 401) {
            showLoginModal();
            return false;
        }

        if (response.ok) {
            const heartIcon = button.querySelector('i');
            if (heartIcon) {
                const isFavorite = heartIcon.classList.toggle('text-red-500');
                
                // Show toast based on action
                if (isFavorite) {
                    showSuccessToast('Added to Favorites!');
                } else {
                    showInfoToast('Removed from Favorites');
                }
                
                // Dispatch event to update the workout catalog and favorites page
                const exerciseId = button.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('exerciseFavoriteToggled', { 
                    detail: { exerciseId, isFavorite } 
                }));
            }
            return true;
        } else {
            showErrorToast("Something went wrong. Please try again.");
            return false;
        }
    } catch (error) {
        console.error("Error saving exercise:", error);
        showErrorToast("An error occurred while saving the exercise.");
        return false;
    }
}

/**
 * Extract exercise data from button attributes
 * {HTMLElement} button - Favorite button element
 * returns {Object} - Exercise data object
 */
function getExerciseDataFromButton(button) {
    return {
        ExerciseId: button.getAttribute("data-id"),
        Name: button.getAttribute("data-title"),
        BodyParts: button.getAttribute("data-bodyparts").split(",").filter(Boolean),
        TargetMuscles: button.getAttribute("data-targetmuscles").split(",").filter(Boolean),
        Equipments: button.getAttribute("data-equipments").split(",").filter(Boolean),
        SecondaryMuscles: button.getAttribute("data-secondarymuscles").split(",").filter(Boolean),
        GifUrl: button.getAttribute("data-gifurl")
    };
}
