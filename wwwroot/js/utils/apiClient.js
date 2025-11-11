/**
 * API Client Utility
 * Centralized API calls with error handling
 */

const API_ENDPOINTS = {
    MUSCLE_GROUPS: '/api/musclegroup/groups',
    MUSCLE_IMAGE: '/api/musclegroup/image',
    WORKOUT_GENERATE: '/api/workout/generate',
    WORKOUT_ADD: '/api/workout/add',
    FAVORITES_EXERCISE: '/api/favorites/exercise',
    FAVORITES_WORKOUT: '/api/favorites/workout'
};


/**
 * Generate workout using AI
 * {Object} params - Workout generation parameters
 * {string[]} params.muscleGroups - Target muscle groups
 * {string} params.description - Workout description
 * returns {Promise<Object>} Generated workout
 */
async function generateWorkout({ muscleGroups, equipment, description }) {
    const response = await fetch(API_ENDPOINTS.WORKOUT_GENERATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            MuscleGroups: muscleGroups,
            Equipment: equipment,
            Description: description
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || errorData?.title || `API Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    return await response.json();
}

/**
 * Save workout to favorites
 * {Object} workout - Workout data
 * returns {Promise<Response>} API response
 */
async function saveWorkoutToFavorites(workout) {
    return await fetch(API_ENDPOINTS.FAVORITES_WORKOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout)
    });
}

/**
 * Add workout to My Workouts
 * {Object} workout - Workout data
 * returns {Promise<Response>} API response
 */
async function saveWorkoutToMyWorkouts(workout) {
    return await fetch(API_ENDPOINTS.WORKOUT_ADD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout)
    });
}

/**
 * Save member details
 * {Object} details - Member details (Age, Gender, Weight, Height)
 * returns {Promise<Response>} API response
 */
async function saveMemberDetails(details) {
    return await fetch('/api/member/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
    });
}

/**
 * Get member details
 * returns {Promise<Object|null>} Member details or null
 */
async function getMemberDetails() {
    try {
        const res = await fetch('/api/member/details');
        if (res.ok) {
            const data = await res.json();
            return data.memberDetails ? JSON.parse(data.memberDetails) : null;
        }
        return null;
    } catch (err) {
        console.error('Failed to fetch member details:', err);
        return null;
    }
}
