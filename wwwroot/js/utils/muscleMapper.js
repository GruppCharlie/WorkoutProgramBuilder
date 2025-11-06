/**
 * Muscle Mapping Utility
 * Maps muscle names to API muscle group names (synced with C# MuscleMapper)
 */

// Special muscle names that need mapping
const MUSCLE_MAPPING = {
    'hamstrings': 'hamstring',
    'glutes': 'gluteus',
    'upperback': 'back_upper', 
    'lowerback': 'back_lower', 
    'lats': 'latissimus',
    'calves': 'calfs',
    'abdominals': 'abs',
    'traps': 'back_upper',
    'trapezius': 'back_upper',
    // Extra aliases for AI responses
    'quads': 'quadriceps',
    'pecs': 'chest',
    'pectorals': 'chest',
    'delts': 'shoulders',
    'deltoids': 'shoulders'
};

// Valid API muscle groups
const VALID_MUSCLE_GROUPS = new Set([
    'quadriceps', 'hamstring', 'gluteus', 'chest', 'shoulders', 'triceps', 'biceps',
    'back_upper', 'back_lower', 'latissimus', 'calfs', 'abs', 'core', 'forearms',
    'neck', 'hands', 'legs', 'adductors', 'abductors'
]);

/**
 * Map muscle names to valid API muscle groups
 * {string[]} muscles - Array of muscle names
 * returns {string[]} Array of valid API muscle group names
 */
function mapMuscleNamesToGroups(muscles) {
    const result = [];
    
    muscles.forEach(muscle => {
        // Normalize: lowercase, trim, remove spaces and underscores
        const normalized = muscle.toLowerCase().trim().replace(/[\s_]/g, '');
        
        // Check if needs mapping (hamstrings -> hamstring, etc)
        if (MUSCLE_MAPPING[normalized]) {
            result.push(MUSCLE_MAPPING[normalized]);
        }
        // Try as-is if it's valid
        else if (VALID_MUSCLE_GROUPS.has(normalized)) {
            result.push(normalized);
        }
        // Otherwise ignore (filters out "OTHER" and invalid muscles)
    });
    
    // Remove duplicates
    return [...new Set(result)];
}

/**
 * Generate muscle visualization image URL
 * {string[]} muscles - Array of muscle names
 * {string} color - RGB color string (default: primary purple)
 * returns {string} Image URL for muscle visualization
 */
function generateMuscleVisualizationUrl(muscles, color = '131,115,218') {
    const validMuscleGroups = mapMuscleNamesToGroups(muscles);
    const muscleGroups = validMuscleGroups.join(',');
    return `/umbraco/api/musclegroup/image?muscleGroups=${encodeURIComponent(muscleGroups)}&color=${encodeURIComponent(color)}&transparentBackground=true`;
}
