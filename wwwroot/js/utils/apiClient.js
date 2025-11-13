/**
 * API Client Utility
 * Centralized API calls with error handling
 */

/**
 * API Endpoints Configuration
 */
const API_ENDPOINTS = {
    MUSCLE_GROUPS: '/api/musclegroup/groups',
    MUSCLE_IMAGE: '/api/musclegroup/image',
    WORKOUT_GENERATE: '/api/workout/generate',
    WORKOUT_ADD: '/api/workout/add',
    WORKOUT_REMOVE: (workoutId) => `/api/workout/remove/${workoutId}`,
    FAVORITES_EXERCISE: '/api/favorites/exercise',
    FAVORITES_WORKOUT: '/api/favorites/workout',
    MEMBER_DETAILS: '/api/member/details'
};

/**
 * Page Routes Configuration
 */
const PAGE_ROUTES = {
    WORKOUT_DETAILS: (workoutId) => `/workouts/workout-details?workoutId=${workoutId}`,
    WORKOUT_GENERATOR: '/workouts/workout-generator',
    MY_WORKOUTS: '/workouts/my-workouts'
};


/**
 * Generate workout using AI
 * {Object} params - Workout generation parameters
 * {string[]} params.muscleGroups - Target muscle groups
 * {string[]} params.equipment - Required equipment
 * {string} params.description - Workout description/instructions
 * returns {Promise<Object>} Generated workout with exercises
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
    return await fetch(API_ENDPOINTS.MEMBER_DETAILS, {
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
        const res = await fetch(API_ENDPOINTS.MEMBER_DETAILS);
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

/**
 * Toggle exercise favorite status
 * {Object} exerciseData - Exercise data object
 * returns {Promise<Response>} API response
 */
async function toggleExerciseFavorite(exerciseData) {
    return await fetch(API_ENDPOINTS.FAVORITES_EXERCISE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseData)
    });
}
