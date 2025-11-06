/**
 * My Workouts Page
 * Manages user's personal workout collection
 */

let myWorkouts = [];
let filteredWorkouts = [];
let activeFilters = {
    muscles: [],
    equipment: [],
    sort: 'recent'
};

// Listen for favorite toggle events to update UI
window.addEventListener('workoutFavoriteToggled', (event) => {
    const { workoutId, isFavorited } = event.detail;
    
    // Update workout in array
    const workout = myWorkouts.find(w => w.workoutId === workoutId);
    if (workout) {
        workout.isSaved = isFavorited;
        // Re-render to update heart icon
        renderWorkouts();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    loadMyWorkouts();
});

/**
 * Initialize filter dropdowns and event listeners
 */
function initializeFilters() {
    const dropdownIds = ['sortDropdown', 'musclesDropdown', 'equipmentDropdown'];
    
    // Sort dropdown
    const sortBtn = document.getElementById('sortBtn');
    sortBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('sortDropdown', ['musclesDropdown', 'equipmentDropdown']);
    });

    // Muscles dropdown
    const musclesBtn = document.getElementById('musclesBtn');
    musclesBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('musclesDropdown', ['sortDropdown', 'equipmentDropdown']);
    });

    // Equipment dropdown
    const equipmentBtn = document.getElementById('equipmentBtn');
    equipmentBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('equipmentDropdown', ['sortDropdown', 'musclesDropdown']);
    });

    // Close dropdowns when clicking outside
    setupDropdownCloseOnClickOutside(dropdownIds);

    // Sort options
    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', () => {
            activeFilters.sort = option.dataset.value;
            applyFilters();
            sortDropdown?.classList.add('hidden');
        });
    });

    // Setup filter checkboxes
    setupCheckboxFilters('.muscle-filter', 'muscles');
    setupCheckboxFilters('.equipment-filter', 'equipment');
}

/**
 * Setup checkbox filters (DRY)
 */
function setupCheckboxFilters(selector, filterKey) {
    document.querySelectorAll(selector).forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                activeFilters[filterKey].push(checkbox.value);
            } else {
                activeFilters[filterKey] = activeFilters[filterKey].filter(v => v !== checkbox.value);
            }
            applyFilters();
        });
    });
}

/**
 * Load workouts from backend (My Workouts)
 */
function loadMyWorkouts() {
    // Get workouts from window variable (set by server)
    if (window.MY_WORKOUTS_DATA) {
        myWorkouts = window.MY_WORKOUTS_DATA;
        console.log('Loaded workouts:', myWorkouts);
    } else {
        console.log('No workouts data found');
        myWorkouts = [];
    }
    
    filteredWorkouts = [...myWorkouts];
    applyFilters();
}

/**
 * Apply filters and sorting
 */
function applyFilters() {
    // Filter by muscles
    if (activeFilters.muscles.length > 0) {
        filteredWorkouts = myWorkouts.filter(workout => {
            return activeFilters.muscles.some(muscle => 
                workout.muscles.some(m => m.toLowerCase().includes(muscle.toLowerCase()))
            );
        });
    } else {
        filteredWorkouts = [...myWorkouts];
    }

    // Filter by equipment
    if (activeFilters.equipment.length > 0) {
        filteredWorkouts = filteredWorkouts.filter(workout => {
            return activeFilters.equipment.some(eq => 
                workout.equipment.some(e => e.toLowerCase().includes(eq.toLowerCase()))
            );
        });
    }

    // Sort
    if (activeFilters.sort === 'a-z') {
        filteredWorkouts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeFilters.sort === 'recent') {
        filteredWorkouts.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    } else if (activeFilters.sort === 'favorites') {
        filteredWorkouts.sort((a, b) => {
            const aFavorited = isWorkoutFavorited(a.workoutId);
            const bFavorited = isWorkoutFavorited(b.workoutId);
            if (aFavorited && !bFavorited) return -1;
            if (!aFavorited && bFavorited) return 1;
            return 0;
        });
    }

    updateActiveFilterTags();
    renderWorkouts();
}

/**
 * Check if workout is favorited
 */
function isWorkoutFavorited(workoutId) {
    const workout = myWorkouts.find(w => w.workoutId === workoutId);
    return workout?.isSaved || false;
}

/**
 * Update active filter tags
 */
function updateActiveFilterTags() {
    const tagsContainer = document.getElementById('activeFilterTags');
    if (!tagsContainer) return;

    tagsContainer.innerHTML = '';

    // Muscle tags
    activeFilters.muscles.forEach(muscle => {
        const tag = createFilterTag(muscle, 'muscle');
        tagsContainer.appendChild(tag);
    });

    // Equipment tags
    activeFilters.equipment.forEach(eq => {
        const tag = createFilterTag(eq, 'equipment');
        tagsContainer.appendChild(tag);
    });
}


/**
 * Remove filter
 */
function removeFilter(type, value) {
    if (type === 'muscle') {
        activeFilters.muscles = activeFilters.muscles.filter(m => m !== value);
        const checkbox = document.querySelector(`.muscle-filter[value="${value}"]`);
        if (checkbox) checkbox.checked = false;
    } else if (type === 'equipment') {
        activeFilters.equipment = activeFilters.equipment.filter(e => e !== value);
        const checkbox = document.querySelector(`.equipment-filter[value="${value}"]`);
        if (checkbox) checkbox.checked = false;
    }
    
    applyFilters();
}

/**
 * Render workouts
 */
function renderWorkouts() {
    const grid = document.getElementById('myWorkoutsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;

    if (filteredWorkouts.length === 0) {
        grid.innerHTML = '';
        toggleElement(emptyState, true);
        return;
    }

    toggleElement(emptyState, false);
    
    grid.innerHTML = filteredWorkouts.map(workout => createWorkoutCard(workout)).join('');
}

/**
 * Create workout card HTML
 */
function createWorkoutCard(workout) {
    const imageUrl = generateMuscleVisualizationUrl(workout.muscles || []);
    const isFavorited = workout.isSaved || false; // Use property from backend
    
    return `
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div class="relative p-6 bg-neutral-100">
                <div class="absolute top-4 right-4 flex gap-2 z-10">
                    <button type="button"
                            class="text-gray-400 hover:text-red-500 focus:outline-none text-2xl"
                            data-workout-id="${workout.workoutId}"
                            data-workout-name="${workout.name}"
                            data-workout-description="${workout.description}"
                            data-workout-muscles="${(workout.muscles || []).join(',')}"
                            data-workout-equipment="${(workout.equipment || []).join(',')}"
                            onclick="toggleWorkoutFavorite(event, this)"
                            title="Add to Favorites">
                        <i class="fa-solid fa-heart ${isFavorited ? 'text-red-500' : ''}"></i>
                    </button>
                    <button type="button"
                            class="text-gray-400 hover:text-red-500 focus:outline-none text-2xl"
                            onclick="removeFromMyWorkouts(event, '${workout.workoutId}')"
                            title="Remove from My Workouts">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                
                <h4 class="text-xl font-bold text-gray-900 mb-2 pr-20">${workout.name}</h4>
                <p class="text-gray-600 text-sm line-clamp-2">${workout.description}</p>
            </div>

            ${(workout.muscles || []).length > 0 ? `
            <div class="p-6 bg-white border-t border-gray-100">
                <h5 class="text-sm font-semibold text-gray-700 mb-3">Targeted Muscles</h5>
                <div class="flex justify-center">
                    <img src="${imageUrl}" 
                         alt="Targeted muscles visualization" 
                         class="w-full h-auto mx-auto"
                         style="max-width: 400px;" />
                </div>
            </div>
            ` : ''}

            <div class="p-6 space-y-4 border-t border-gray-100">
                ${(workout.muscles || []).length > 0 ? `
                <div>
                    <span class="text-xs font-semibold text-gray-500 block mb-2">Muscles:</span>
                    <div class="flex flex-wrap gap-2">
                        ${(workout.muscles || []).map(muscle => `
                            <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">${muscle}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${(workout.equipment || []).length > 0 ? `
                <div>
                    <span class="text-xs font-semibold text-gray-500 block mb-2">Equipment:</span>
                    <div class="flex flex-wrap gap-2">
                        ${(workout.equipment || []).map(eq => `
                            <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">${eq}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Remove workout from My Workouts
 */
async function removeFromMyWorkouts(event, workoutId) {
    event.stopPropagation();
    
    console.log('Removing workout:', workoutId);
    console.log('Current workouts:', myWorkouts);
    
    // Find the workout to remove
    const workout = myWorkouts.find(w => w.workoutId === workoutId);
    if (!workout) {
        console.log('Workout not found');
        return;
    }
    
    try {
        const response = await saveWorkoutToMyWorkouts({
            WorkoutId: workout.workoutId,
            Name: workout.name,
            Description: workout.description,
            Muscles: workout.muscles || [],
            Equipment: workout.equipment || []
        });

        if (response.status === 401) {
            showLoginModal();
            return;
        }

        if (response.ok) {
            // Show toast and reload
            showInfoToast('Removed from My Workouts');
            
            // Reload page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('Error removing workout:', error);
    }
}
