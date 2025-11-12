/**
 * Temporary Workout Details Page
 * Handles rendering of workout details for unauthenticated users
 */

/**
 * Load and display workout for unauthenticated users
 */
async function loadUnauthenticatedWorkout() {
    const isAuthenticated = await isUserAuthenticated();
    if (isAuthenticated) return;
    
    const workout = getTemporaryWorkout();
    if (!workout) {
        document.getElementById('noWorkoutMessage').style.display = 'block';
        return;
    }
    
    // Show container and set description
    const container = document.getElementById('unauthWorkoutContainer');
    container.style.display = 'block';
    document.getElementById('unauthWorkoutDescription').textContent = workout.Description;
    
    // Render exercises by cloning template (includes buttons)
    renderUnauthenticatedWorkoutExercises(workout.Exercises);
}

/**
 * Render exercises for unauthenticated users by cloning Razor template
 */
function renderUnauthenticatedWorkoutExercises(exercises) {
    const container = document.getElementById('unauthExercisesContainer');
    const structureTemplate = document.getElementById('workoutStructureTemplate');
    const exerciseTemplate = document.getElementById('exerciseCardTemplate');
    
    if (!exercises || !exercises.length || !structureTemplate || !exerciseTemplate || !container) return;
    
    // Clone the entire workout structure template
    const structure = structureTemplate.content.cloneNode(true);
    
    // Set exercise count
    structure.querySelector('.exercise-count').textContent = exercises.length;
    
    // Get containers for cards and dots
    const cardsContainer = structure.querySelector('#exerciseCardsContainer');
    const dotsContainer = structure.querySelector('#paginationDotsContainer');
    
    // Clone and populate exercise cards
    exercises.forEach((exercise, index) => {
        const clone = exerciseTemplate.content.cloneNode(true);
        const card = clone.querySelector('.flex-none');
        
        // Populate data (from sessionStorage - handle both PascalCase and camelCase)
        const name = exercise.Name || exercise.name || '';
        const description = exercise.Description || exercise.description || '';
        const instructions = exercise.Instructions || exercise.instructions || [];
        const muscleGroups = exercise.MuscleGroups || exercise.muscleGroups || [];
        const equipment = exercise.Equipment || exercise.equipment || [];
        const sets = exercise.Sets || exercise.sets || '';
        const reps = exercise.Reps || exercise.reps || '';
        
        card.querySelector('.exercise-name').textContent = name;
        card.querySelector('.exercise-number').textContent = index + 1;
        
        const descEl = card.querySelector('.exercise-description');
        if (description) {
            descEl.textContent = description;
        } else {
            descEl.remove();
        }
        
        // Muscle visualization
        const imageContainer = card.querySelector('.exercise-image-container');
        if (muscleGroups.length > 0) {
            const imageUrl = generateMuscleVisualizationUrl(muscleGroups);
            imageContainer.innerHTML = `
                <div class="flex justify-center">
                    <img src="${imageUrl}" alt="${name} muscles" class="w-full h-auto" style="max-width: 200px;" />
                </div>
            `;
        } else {
            imageContainer.remove();
        }
        
        // Instructions
        const instructionsEl = card.querySelector('.exercise-instructions');
        if (instructions.length > 0) {
            instructionsEl.innerHTML = `
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Instructions:</h4>
                <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700 max-h-44 overflow-y-auto pr-2">
                    ${instructions.map(instructions => `<li class="pl-4">${instructions}</li>`).join('')}
                </ol>
            `;
        } else {
            instructionsEl.remove();
        }
        
        // Sets & Reps
        card.querySelector('.exercise-sets').textContent = `${sets} Sets`;
        card.querySelector('.exercise-reps').textContent = `${reps} Reps`;
        
        // Muscles
        const musclesEl = card.querySelector('.exercise-muscles');
        if (muscleGroups.length > 0) {
            musclesEl.innerHTML = `
                <span class="text-xs font-semibold text-gray-500 block mb-2">Muscles:</span>
                <div class="flex flex-wrap gap-2">
                    ${muscleGroups.map(muscleGroups => `<span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium uppercase">${muscleGroups}</span>`).join('')}
                </div>
            `;
        } else {
            musclesEl.remove();
        }
        
        // Equipment
        const equipmentEl = card.querySelector('.exercise-equipment');
        if (equipment.length > 0) {
            equipmentEl.innerHTML = `
                <span class="text-xs font-semibold text-gray-500 block mb-2">Equipments:</span>
                <div class="flex flex-wrap gap-2">
                    ${equipment.map(equipment => `<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">${equipment}</span>`).join('')}
                </div>
            `;
        } else {
            equipmentEl.remove();
        }
        
        cardsContainer.appendChild(card);
    });
    
    // Create pagination dots
    exercises.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.onclick = () => scrollToExercise(i);
        dot.className = `exercise-dot w-2 h-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-primary w-8' : 'bg-gray-300 hover:bg-gray-400'}`;
        dot.setAttribute('data-index', i);
        dot.setAttribute('aria-label', `Go to exercise ${i + 1}`);
        dotsContainer.appendChild(dot);
    });
    
    // Append structure to container
    container.innerHTML = '';
    container.appendChild(structure);
    
    // Reset slider to start position and initialize pagination
    const slider = document.getElementById('exerciseSlider');
    requestAnimationFrame(() => {
        slider.scrollLeft = 0;
        initializePagination();
    });
}
