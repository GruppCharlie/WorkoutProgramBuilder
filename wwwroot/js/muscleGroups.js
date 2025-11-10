// Special muscle groups that expand to multiple muscles
const SPECIAL_MUSCLE_GROUPS = {
    'ALL': ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CHEST', 'SHOULDERS', 'TRICEPS', 'BICEPS', 'BACK_UPPER', 'BACK_LOWER', 'LATS', 'CALVES', 'ABDOMINALS', 'FOREARMS', 'CORE'],
    'ALL_UPPER': ['CHEST', 'SHOULDERS', 'TRICEPS', 'BICEPS', 'BACK_UPPER', 'LATS', 'ABDOMINALS', 'FOREARMS', 'CORE'],
    'ALL_LOWER': ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ADDUCTORS', 'ABDUCTORS']
};

// Expand special muscle groups
function expandMuscleGroups(muscles) {
    const result = [];
    
    for (const muscle of muscles) {
        const upperMuscle = muscle.toUpperCase();
        
        if (SPECIAL_MUSCLE_GROUPS[upperMuscle]) {
            result.push(...SPECIAL_MUSCLE_GROUPS[upperMuscle]);
        } else {
            result.push(muscle);
        }
    }
    
    return [...new Set(result)]; // Remove duplicates
}

// Muscle Group Visualizer
class MuscleGroupVisualizer {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.muscleGroups = [];
        this.selectedMuscles = [];
        this.color = options.color || '131,115,218'; // RGB format - Secondary Purple
        void this.init();
    }

    async init() {
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        
        this.showLoading();
        await this.loadMuscleGroups();
        this.render();
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = createLoadingSpinner('Loading muscle groups...');
        }
    }

    async loadMuscleGroups() {
        try {
            this.muscleGroups = await fetchMuscleGroups();
        } catch (error) {
            console.error('Failed to load muscle groups:', error);
            this.showError('Failed to load muscle groups. Please try again later.');
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = createErrorMessage(message);
        }
    }
    async updateImage() {
        const imgContainer = this.container.querySelector('.muscle-image-container');
        if (!imgContainer) return;

        const displayImageUrl = generateMuscleVisualizationUrl(this.selectedMuscles, this.color);
        
        // Find existing image element
        let img = imgContainer.querySelector('img');
        
        if (!img) {
            // First load - create image element
            imgContainer.innerHTML = `
                <div class="flex justify-center">
                    <img alt="Muscle groups visualization" 
                         class="w-full h-auto mx-auto transition-opacity duration-300"
                         style="opacity: 1; max-width: 500px;"  src="${displayImageUrl}"/>
                </div>
            `;
            img = imgContainer.querySelector('img');
        }
        
        // Preload new image before swapping
        const tempImg = new Image();
        tempImg.onload = () => {
            // Fade out current image
            img.style.opacity = '0';
            
            // After fade out, swap source and fade in
            setTimeout(() => {
                img.src = displayImageUrl;
                img.style.opacity = '1';
            }, 150);
        };
        
        tempImg.onerror = () => {
            console.error('Failed to load muscle image');
        };
        
        // Start preloading
        tempImg.src = displayImageUrl;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8">
                <!-- AI Workout Generator Form -->
                <div>
                    <h3 class="text-xl font-bold mb-4">Generate Workout with AI</h3>
                    
                    <form class="workout-generator-form space-y-4">
                        <!-- Muscle Groups Selection -->
                        <div>
                            <label class="block text-sm font-semibold text-neutral-700 mb-2">Target Muscle Groups</label>
                            <select multiple class="muscle-groups-select w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-gray-500" size="8">
                                <option value="any" selected>Any</option>
                                ${this.muscleGroups.map(muscle => `
                                    <option value="${muscle}">${muscle.replace(/_/g, ' ').toUpperCase()}</option>
                                `).join('')}
                            </select>
                            <p class="text-xs text-neutral-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>

                        <!-- Workout Description Prompt -->
                        <div>
                            <label class="block text-sm font-semibold text-neutral-700 mb-2">Describe Your Workout</label>
                            <textarea 
                                class="workout-prompt w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-gray-500 resize-none" 
                                rows="5" 
                                placeholder="E.g., A intermediate push workout, A beginner full body workout, An advanced leg day..."
                                required
                            ></textarea>
                        </div>

                        <!-- Generate Button -->
                        <button type="submit" class="generate-btn w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed">
                            Generate Workout
                        </button>

                        <!-- Loading State -->
                        <div class="loading-state hidden text-center py-4">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p class="mt-2 text-sm text-neutral-600">Generating your workout...</p>
                        </div>

                        <!-- Error Message -->
                        <div class="error-message hidden p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"></div>
                    </form>
                </div>

                <!-- Muscle Visualization -->
                <div>
                    <h3 class="text-xl font-bold mb-4">Muscle Visualization</h3>
                    <div class="muscle-image-container">
                        <div class="flex justify-center">
                            <div class="w-full h-96 bg-neutral-100 rounded-lg flex items-center justify-center">
                                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Generated Workout Display -->
            <div class="workout-results mt-8 hidden">
                <h3 class="text-2xl font-bold mb-4">Your Generated Workout</h3>
                <div class="workout-content"></div>
            </div>
        `;

        this.attachEventListeners();
        void this.updateImage(); // Load base image immediately
    }

    attachEventListeners() {
        const form = this.container.querySelector('.workout-generator-form');
        const muscleGroupsSelect = this.container.querySelector('.muscle-groups-select');
        
        // Handle muscle group selection for visualization
        muscleGroupsSelect.addEventListener('change', (e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
            const filtered = selectedOptions.filter(val => val !== 'any');
            
            // Expand special groups (ALL, ALL_UPPER, ALL_LOWER)
            this.selectedMuscles = expandMuscleGroups(filtered);
            void this.updateImage();
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.generateWorkout();
        });
    }

    async generateWorkout() {
        const muscleGroupsSelect = this.container.querySelector('.muscle-groups-select');
        const promptTextarea = this.container.querySelector('.workout-prompt');
        const generateBtn = this.container.querySelector('.generate-btn');
        const loadingState = this.container.querySelector('.loading-state');
        const errorMessage = this.container.querySelector('.error-message');
        const workoutResults = this.container.querySelector('.workout-results');

        const selectedMuscleGroups = Array.from(muscleGroupsSelect.selectedOptions)
            .map(opt => opt.value)
            .filter(m => m !== 'any');
        const description = promptTextarea.value.trim();

        // Show loading state
        setButtonLoading(generateBtn, true);
        toggleElement(loadingState, true);
        toggleElement(errorMessage, false);
        toggleElement(workoutResults, false);

        try {
            const workout = await generateWorkout({
                muscleGroups: selectedMuscleGroups,
                equipment: ['any'],
                description
            });
            
            this.displayWorkout(workout);
        } catch (error) {
            console.error('Error generating workout:', error);
            errorMessage.textContent = `Failed to generate workout: ${error.message}. Please try again.`;
            toggleElement(errorMessage, true);
        } finally {
            setButtonLoading(generateBtn, false);
            toggleElement(loadingState, false);
        }
    }

    /**
     * Display generated workout as a single card
     * Workout object from API
     * Workout name
     * Workout description
     * Array of exercise objects
     */
    displayWorkout(workout) {
        const workoutResults = this.container.querySelector('.workout-results');
        const workoutContent = this.container.querySelector('.workout-content');

        // Collect all unique muscles and equipment from all exercises
        const allMuscles = [...new Set(workout.exercises.flatMap(ex => ex.muscleGroups || []))];
        const allEquipment = [...new Set(workout.exercises.flatMap(ex => ex.equipment || []))];
        
        const muscleVisualizationHTML = this.generateMuscleVisualization(allMuscles);

        workoutContent.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-shadow duration-300 cursor-pointer" data-workout-card>
                <!-- Workout Card Header -->
                <div class="relative p-6 bg-neutral-100 min-h-[180px]">
                    <div class="absolute top-4 right-4 flex gap-2 z-10">
                        <button type="button"
                                class="text-gray-400 hover:text-primary focus:outline-none text-2xl add-to-my-workouts-btn"
                                data-workout-id="${workout.id || Date.now()}"
                                data-workout-name="${workout.name}"
                                data-workout-description="${workout.description}"
                                data-workout-muscles="${allMuscles.join(',')}"
                                data-workout-equipment="${allEquipment.join(',')}"
                                data-workout-exercises='${JSON.stringify(workout.exercises)}'
                                onclick="addToMyWorkouts(event, this)"
                                title="Add to My Workouts">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                        <button type="button"
                                class="text-gray-400 hover:text-red-500 focus:outline-none text-2xl"
                                data-workout-id="${workout.id || Date.now()}"
                                data-workout-name="${workout.name}"
                                data-workout-description="${workout.description}"
                                data-workout-muscles="${allMuscles.join(',')}"
                                data-workout-equipment="${allEquipment.join(',')}"
                                data-workout-exercises='${JSON.stringify(workout.exercises)}'
                                onclick="toggleWorkoutFavorite(event, this)"
                                title="Add to Favorites">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                    </div>
                    
                    <h4 class="text-2xl font-bold text-gray-900 mb-2 pr-20">${workout.name}</h4>
                    <p class="text-gray-600 text-sm">${workout.description}</p>
                    
                    <div class="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <i class="fa-solid fa-dumbbell"></i>
                        <span>${workout.exercises.length} exercises</span>
                    </div>
                </div>

                <!-- Muscle Visualization -->
                <div class="p-6 bg-white border-t border-gray-100">
                    <h5 class="text-sm font-semibold text-gray-700 mb-3">Targeted Muscles</h5>
                    ${muscleVisualizationHTML}
                </div>

                <!-- Muscles & Equipment Tags -->
                <div class="p-6 space-y-4 border-t border-gray-100">
                    <div>
                        <span class="text-xs font-semibold text-gray-500 block mb-2">Muscles:</span>
                        <div class="flex flex-wrap gap-2">
                            ${allMuscles.map(muscle => `
                                <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">${muscle}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <span class="text-xs font-semibold text-gray-500 block mb-2">Equipment:</span>
                        <div class="flex flex-wrap gap-2">
                            ${allEquipment.map(eq => `
                                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">${eq}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        workoutResults.classList.remove('hidden');
        workoutResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Generate muscle visualization using existing API
     * Array of muscle names
     * Returns HTML string with muscle visualization
     */
    generateMuscleVisualization(muscles) {
        const imageUrl = generateMuscleVisualizationUrl(muscles);
        const validMuscleGroups = mapMuscleNamesToGroups(muscles);
        
        return `
            <div class="flex justify-center">
                <img src="${imageUrl}" 
                     alt="Targeted muscles visualization" 
                     class="w-full h-auto mx-auto"
                     style="max-width: 400px;" />
            </div>
        `;
    }

}

// Global function to toggle workout favorite
async function toggleWorkoutFavorite(event, button) {
    event.stopPropagation();
    
    const heartIcon = button.querySelector('i');
    
    const exercisesJson = button.getAttribute('data-workout-exercises');
    const exercises = exercisesJson ? JSON.parse(exercisesJson) : [];
    
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
            
            // Show toast based on action
            if (isFavorited) {
                showSuccessToast('Added to Favorites!');
            } else {
                showInfoToast('Removed from Favorites');
            }
            
            // Dispatch event for other pages to update
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

// Global function to add workout to My Workouts
async function addToMyWorkouts(event, button) {
    event.stopPropagation();
    
    const exercisesJson = button.getAttribute('data-workout-exercises');
    const exercises = exercisesJson ? JSON.parse(exercisesJson) : [];
    
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
            // Visual feedback - keep checkmark permanently
            const icon = button.querySelector('i');
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-check');
            button.classList.remove('text-gray-400', 'hover:text-primary');
            button.classList.add('text-green-500');
            button.disabled = true;
            button.title = 'Added to My Workouts';
            
            // Show success toast
            showSuccessToast('Added to My Workouts!');
        }
    } catch (error) {
        console.error('Error saving to My Workouts:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = document.querySelector('[data-muscle-visualizer]');
    if (visualizer) {
        new MuscleGroupVisualizer('[data-muscle-visualizer]');
    }
});
