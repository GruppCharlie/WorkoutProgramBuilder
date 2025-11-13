/**
 * Workout Utilities
 * Workout-specific helper functions for data extraction and button state management
 */

/**
 * Set workout data attributes on a button element
 * {HTMLElement} button - Button element to set attributes on
 * {Object} workoutData - Workout data object
 */
function setWorkoutDataOnButton(button, workoutData) {
    const exercisesJson = JSON.stringify(workoutData.Exercises);
    
    button.setAttribute('data-workout-id', workoutData.WorkoutId);
    button.setAttribute('data-workout-name', workoutData.Name);
    button.setAttribute('data-workout-description', workoutData.Description);
    button.setAttribute('data-workout-muscles', workoutData.Muscles.join(','));
    button.setAttribute('data-workout-equipment', workoutData.Equipment.join(','));
    button.setAttribute('data-workout-exercises', exercisesJson);
}

/**
 * Extract workout data from button data attributes
 * {HTMLElement} button - Button element with data attributes
 * {Object} Workout data object
 */
function extractWorkoutDataFromButton(button) {
    const exercisesJson = button.getAttribute('data-workout-exercises');
    const decodedJson = exercisesJson ? exercisesJson.replace(/&quot;/g, '"') : '[]';
    const exercises = JSON.parse(decodedJson);
    
    return {
        WorkoutId: button.getAttribute('data-workout-id'),
        Name: button.getAttribute('data-workout-name'),
        Description: button.getAttribute('data-workout-description'),
        Muscles: button.getAttribute('data-workout-muscles').split(',').filter(Boolean),
        Equipment: button.getAttribute('data-workout-equipment').split(',').filter(Boolean),
        Exercises: exercises
    };
}

/**
 * Button state configurations
 */
const WORKOUT_BUTTON_STATES = {
    MY_WORKOUTS: {
        ADD: {
            icon: 'fa-plus',
            classes: 'bg-primary text-white hover:bg-primary/90',
            text: 'Add to My Workouts',
            textMobile: 'Add to My Workouts',
            title: 'Add to My Workouts'
        },
        ADDED: {
            icon: 'fa-check',
            classes: 'bg-green-600 text-white hover:bg-green-700',
            text: 'In My Workouts',
            textMobile: 'In My Workouts',
            title: 'Remove from My Workouts'
        }
    },
    FAVORITE: {
        NOT_SAVED: {
            icon: 'fa-heart',
            iconClasses: '',
            buttonClasses: 'text-gray-700 hover:text-red-500 hover:bg-gray-50 border-gray-300',
            text: 'Favorite',
            title: 'Add to Favorites'
        },
        SAVED: {
            icon: 'fa-heart',
            iconClasses: 'text-red-500',
            buttonClasses: 'text-red-500 border-red-500 hover:bg-red-50',
            text: 'Favorited',
            title: 'Remove from Favorites'
        }
    }
};

/**
 * Update My Workouts button state
 * {HTMLElement} button - Button element
 * {boolean} isAdded - Whether workout is added
 */
function updateMyWorkoutsButtonState(button, isAdded) {
    const state = isAdded ? WORKOUT_BUTTON_STATES.MY_WORKOUTS.ADDED : WORKOUT_BUTTON_STATES.MY_WORKOUTS.ADD;
    const icon = button.querySelector('i');
    const span = button.querySelector('span');
    
    if (icon) {
        icon.className = `fa-solid ${state.icon}`;
    }
    
    // Remove all possible classes and add new ones
    button.className = `add-to-my-workouts-btn flex items-center gap-2 sm:px-4 sm:py-2 px-3 py-2 rounded-lg transition-colors ${state.classes}`;
    
    if (span) {
        span.textContent = state.text;
    }
    
    button.title = state.title;
}

/**
 * Update Favorite button state
 * {HTMLElement} button - Button element
 * {boolean} isFavorited - Whether workout is favorited
 */
function updateFavoriteButtonState(button, isFavorited) {
    const state = isFavorited ? WORKOUT_BUTTON_STATES.FAVORITE.SAVED : WORKOUT_BUTTON_STATES.FAVORITE.NOT_SAVED;
    const icon = button.querySelector('i');
    const span = button.querySelector('span');
    
    if (icon) {
        icon.className = `fa-solid ${state.icon} ${state.iconClasses}`;
    }
    
    // Update button classes
    button.className = `favorite-workout-btn flex items-center gap-2 sm:px-4 sm:py-2 px-3 py-2 border rounded-lg transition-colors ${state.buttonClasses}`;
    
    if (span) {
        span.textContent = state.text;
    }
    
    button.title = state.title;
}
