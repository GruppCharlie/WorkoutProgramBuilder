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
            this.container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-neutral-600">Loading muscle groups...</p>
                </div>
            `;
        }
    }

    async loadMuscleGroups() {
        try {
            const response = await fetch('/umbraco/api/musclegroup/groups');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.muscleGroups = await response.json();
            console.log('=== Available Muscle Groups ===');
            console.log(this.muscleGroups);
            console.log('Total:', this.muscleGroups.length);
        } catch (error) {
            console.error('Failed to load muscle groups:', error);
            this.showError('Failed to load muscle groups. Please try again later.');
        }
    }


    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-600">${message}</p>
                </div>
            `;
        }
    }
    async updateImage() {
        const imgContainer = this.container.querySelector('.muscle-image-container');
        if (!imgContainer) return;

        // Show combined selected muscles or base image
        let displayImageUrl;
        if (this.selectedMuscles.length === 0) {
            displayImageUrl = `/umbraco/api/musclegroup/image?muscleGroups=&color=${encodeURIComponent(this.color)}&transparentBackground=true`;
        } else {
            const muscleGroups = this.selectedMuscles.join(',');
            displayImageUrl = `/umbraco/api/musclegroup/image?muscleGroups=${encodeURIComponent(muscleGroups)}&color=${encodeURIComponent(this.color)}&transparentBackground=true`;
        }
        
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
            this.selectedMuscles = selectedOptions.filter(val => val !== 'any');
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

        // Get selected values
        const selectedMuscleGroups = Array.from(muscleGroupsSelect.selectedOptions).map(opt => opt.value);
        const description = promptTextarea.value.trim();

        // Show loading state
        generateBtn.disabled = true;
        loadingState.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        workoutResults.classList.add('hidden');

        try {
            const response = await fetch('/api/workout/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    MuscleGroups: selectedMuscleGroups.filter(m => m !== 'any'),
                    Equipment: ['any'],
                    Description: description
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.detail || errorData?.title || `API Error: ${response.status}`;
                throw new Error(errorMessage);
            }

            const workout = await response.json();
            this.displayWorkout(workout);
            
        } catch (error) {
            console.error('Error generating workout:', error);
            errorMessage.textContent = `Failed to generate workout: ${error.message}. Please try again.`;
            errorMessage.classList.remove('hidden');
        } finally {
            generateBtn.disabled = false;
            loadingState.classList.add('hidden');
        }
    }

    /**
     * Display generated workout with exercises
     * Workout object from API
     * Workout name
     * Workout description
     * Array of exercise objects
     */
    displayWorkout(workout) {
        const workoutResults = this.container.querySelector('.workout-results');
        const workoutContent = this.container.querySelector('.workout-content');

        workoutContent.innerHTML = `
            <div class="bg-white rounded-lg border-2 border-neutral-200 p-6 mb-6">
                <h4 class="text-2xl font-bold text-neutral-900 mb-2">${workout.name}</h4>
                <p class="text-neutral-600">${workout.description}</p>
            </div>

            <div class="relative">
                <!-- Pagination Indicator -->
                <div class="flex items-center justify-between mb-4">
                    <h5 class="text-lg font-semibold text-neutral-900">Exercises</h5>
                    <div class="flex items-center gap-2">
                        <span class="workout-counter text-sm font-medium text-neutral-600">1 / ${workout.exercises.length}</span>
                        <div class="flex gap-1">
                            ${workout.exercises.map((_, index) => `
                                <div class="pagination-dot w-2 h-2 rounded-full bg-neutral-300 transition-colors" data-index="${index}"></div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Scrollable Exercises -->
                <div class="workout-scroll-container flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
                    ${(workout.exercises || []).map((exercise, index) => {
                        const exerciseName = (exercise && exercise.name) || 'Unnamed Exercise';
                        const exerciseDesc = (exercise && exercise.description) || '';
                        const sets = (exercise && exercise.sets) || 0;
                        const reps = (exercise && exercise.reps) || 0;
                        const instructions = (exercise && exercise.instructions) || [];
                        const muscleGroups = (exercise && exercise.muscleGroups) || [];
                        const equipment = (exercise && exercise.equipment) || [];
                        
                        return `
                        <div class="bg-white rounded-lg border-2 border-neutral-200 p-6 flex-shrink-0 w-[calc(100%-2rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] min-w-[280px] snap-start" data-exercise-index="${index}">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h5 class="text-xl font-bold text-neutral-900">${index + 1}. ${exerciseName}</h5>
                                    <p class="text-sm text-neutral-600 mt-1">${exerciseDesc}</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-semibold text-blue-600">${sets} sets × ${reps} reps</div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <h6 class="text-sm font-semibold text-neutral-700 mb-2">Instructions:</h6>
                                <ol class="list-decimal list-inside space-y-1 text-sm text-neutral-600">
                                    ${instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                                </ol>
                            </div>

                            <div class="space-y-2">
                                <div>
                                    <span class="text-xs font-semibold text-neutral-500 block mb-1">Muscles:</span>
                                    <div class="flex flex-wrap gap-2">
                                        ${muscleGroups.map(muscle => `
                                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">${muscle}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                <div>
                                    <span class="text-xs font-semibold text-neutral-500 block mb-1">Equipment:</span>
                                    <div class="flex flex-wrap gap-2">
                                        ${equipment.map(eq => `
                                            <span class="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-medium">${eq}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        this.attachScrollPagination();

        workoutResults.classList.remove('hidden');
        workoutResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    attachScrollPagination() {
        const scrollContainer = this.container.querySelector('.workout-scroll-container');
        const counter = this.container.querySelector('.workout-counter');
        const dots = this.container.querySelectorAll('.pagination-dot');

        if (!scrollContainer || !counter || !dots.length) return;

        // Update pagination on scroll
        scrollContainer.addEventListener('scroll', () => {
            const scrollLeft = scrollContainer.scrollLeft;
            const cardWidth = scrollContainer.querySelector('[data-exercise-index]')?.offsetWidth || 0;
            const gap = 24; // 6 * 4px (gap-6)
            const currentIndex = Math.round(scrollLeft / (cardWidth + gap));
            
            // Update counter
            counter.textContent = `${currentIndex + 1} / ${dots.length}`;
            
            // Update dots
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.remove('bg-neutral-300');
                    dot.classList.add('bg-blue-600');
                } else {
                    dot.classList.remove('bg-blue-600');
                    dot.classList.add('bg-neutral-300');
                }
            });
        });

        // Initialize first dot as active
        if (dots[0]) {
            dots[0].classList.remove('bg-neutral-300');
            dots[0].classList.add('bg-blue-600');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = document.querySelector('[data-muscle-visualizer]');
    if (visualizer) {
        new MuscleGroupVisualizer('[data-muscle-visualizer]');
    }
});
