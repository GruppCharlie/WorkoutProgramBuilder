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
    'backupper': 'back_upper',
    'backlower': 'back_lower',
    'back': 'latissimus',
    'lats': 'latissimus',
    'calves': 'calfs',
    'abdominals': 'abs',
    'traps': 'back_upper',
    'trapezius': 'back_upper',
    'corelower': 'core_lower',
    'coreupper': 'core_upper',
    'shouldersback': 'shoulders_back',
    'shouldersfront': 'shoulders_front',
    'shoulderback': 'shoulders_back',
    'shoulderfront': 'shoulders_front',
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
    'back_upper', 'back_lower', 'back', 'latissimus', 'calfs', 'abs', 'core', 'core_upper', 'core_lower',
    'shoulders_front', 'shoulders_back', 'forearms', 'neck', 'hands', 'legs', 'adductors', 'abductors',
    'all', 'all_upper', 'all_lower'
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
    return `/api/musclegroup/image?muscleGroups=${encodeURIComponent(muscleGroups)}&color=${encodeURIComponent(color)}&transparentBackground=true`;
}
