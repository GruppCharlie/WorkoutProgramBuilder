/**
 * Temporary Workout Storage
 * Uses sessionStorage for temporary workout viewing (cleared on tab close/refresh)
 */

const TEMPORARY_WORKOUT_KEY = 'temporaryWorkout';

/**
 * Save workout temporarily for unauthenticated users
 */
function saveTemporaryWorkout(workoutData) {
    try {
        sessionStorage.setItem(TEMPORARY_WORKOUT_KEY, JSON.stringify(workoutData));
        return true;
    } catch (error) {
        console.error('Failed to save temporary workout:', error);
        return false;
    }
}

/**
 * Get temporary workout
 */
function getTemporaryWorkout() {
    try {
        const data = sessionStorage.getItem(TEMPORARY_WORKOUT_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to get temporary workout:', error);
        return null;
    }
}

/**
 * Clear temporary workout from sessionStorage to prevent conflict with DB
 */
function clearTemporaryWorkout() {
    try {
        sessionStorage.removeItem(TEMPORARY_WORKOUT_KEY);
    } catch (error) {
        console.error('Failed to clear temporary workout:', error);
    }
}

/**
 * Check if user is authenticated
 */
async function isUserAuthenticated() {
    try {
        const response = await fetch(API_ENDPOINTS.MEMBER_DETAILS);
        // expected 401 not authenticated and not an error
        return response.ok;
    } catch (error) {
        // unexpected error
        console.error('Auth check failed:', error);
        return false;
    }
}
