/**
 * Temporary Workout Details Page
 * Handles rendering of workout details for unauthenticated users
 */

/**
 * Load and display workout for unauthenticated users OR authenticated users without workout in DB
 */
async function loadUnauthenticatedWorkout() {
  // Check if container exists (only shown when workout should be loaded from sessionStorage)
  const container = document.getElementById("unauthWorkoutContainer");
  if (!container) return;

  // Check if user just signed up and has temp profile data
  await saveTempProfileIfExists();

  const workout = getTemporaryWorkout();
  if (!workout) {
    const noWorkoutMsg = document.getElementById("noWorkoutMessage");
    if (noWorkoutMsg) noWorkoutMsg.style.display = "block";
    return;
  }

  // Show container and set description
  container.style.display = "block";
  const descElement = document.getElementById("unauthWorkoutDescription");
  if (descElement) descElement.textContent = workout.Description;

  // Render exercises by cloning template (includes buttons)
  renderUnauthenticatedWorkoutExercises(workout.Exercises);
}

/**
 * Save temporary profile data to DB if user just signed up
 */
async function saveTempProfileIfExists() {
  const isAuthenticated = await isUserAuthenticated();
  if (!isAuthenticated) return;

  try {
    const tempProfile = sessionStorage.getItem("tempUserProfile");
    if (!tempProfile) return;

    const profileData = JSON.parse(tempProfile);

    // Check if user already has profile data
    const response = await fetch(API_ENDPOINTS.MEMBER_DETAILS);
    if (response.ok) {
      const data = await response.json();
      if (data.memberDetails) {
        // User already has profile data, don't override
        sessionStorage.removeItem("tempUserProfile");
        return;
      }
    }

    // Save temp profile to DB
    const saveResponse = await saveMemberDetails(profileData);
    if (saveResponse.ok) {
      console.log("Saved temporary profile data to DB");
      sessionStorage.removeItem("tempUserProfile");
    }
  } catch (error) {
    console.error("Error saving temp profile:", error);
  }
}

/**
 * Render exercises for unauthenticated users by cloning Razor template
 */
function renderUnauthenticatedWorkoutExercises(exercises) {
  const container = document.getElementById("unauthExercisesContainer");
  const structureTemplate = document.getElementById("workoutStructureTemplate");
  const exerciseTemplate = document.getElementById("exerciseCardTemplate");

  if (
    !exercises ||
    !exercises.length ||
    !structureTemplate ||
    !exerciseTemplate ||
    !container
  )
    return;

  // Get CMS labels from data attributes
  const workoutContainer = document.getElementById("unauthWorkoutContainer");
  const labels = {
    instructions:
      workoutContainer?.dataset.instructionsLabel || "Instructions:",
    setsReps: workoutContainer?.dataset.setsRepsLabel || "Sets & Reps:",
    muscles: workoutContainer?.dataset.musclesLabel || "Muscles:",
    equipments: workoutContainer?.dataset.equipmentsLabel || "Equipments:",
    sets: workoutContainer?.dataset.setsText || "Sets",
    reps: workoutContainer?.dataset.repsText || "Reps",
    visualization:
      workoutContainer?.dataset.visualizationTitle ||
      "Targeted Muscles Visualization",
  };

  // Clone the entire workout structure template
  const structure = structureTemplate.content.cloneNode(true);

  // Set exercise count
  structure.querySelector(".exercise-count").textContent = exercises.length;

  // Get containers for cards and dots
  const cardsContainer = structure.querySelector("#exerciseCardsContainer");
  const dotsContainer = structure.querySelector("#paginationDotsContainer");

  // Clone and populate exercise cards
  exercises.forEach((exercise, index) => {
    const clone = exerciseTemplate.content.cloneNode(true);
    const card = clone.querySelector(".flex-none");

    // Populate data (from sessionStorage - handle both PascalCase and camelCase)
    const name = exercise.Name || exercise.name || "";
    const description = exercise.Description || exercise.description || "";
    const instructions = exercise.Instructions || exercise.instructions || [];
    const muscleGroups = exercise.MuscleGroups || exercise.muscleGroups || [];
    const equipment = exercise.Equipment || exercise.equipment || [];
    const sets = exercise.Sets || exercise.sets || "";
    const reps = exercise.Reps || exercise.reps || "";

    card.querySelector(".exercise-name").textContent = name;
    card.querySelector(".exercise-number").textContent = index + 1;

    const descEl = card.querySelector(".exercise-description");
    if (description) {
      descEl.textContent = description;
    } else {
      descEl.remove();
    }

    // Muscle visualization
    const imageContainer = card.querySelector(".exercise-image-container");
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
    const instructionsEl = card.querySelector(".exercise-instructions");
    if (instructions.length > 0) {
      instructionsEl.innerHTML = `
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">${
                  labels.instructions
                }</h4>
                <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700 max-h-44 overflow-y-auto pr-2">
                    ${instructions
                      .map(
                        (instruction) =>
                          `<li class="pl-4 pb-1">${instruction}</li>`
                      )
                      .join("")}
                </ol>
            `;
    } else {
      instructionsEl.remove();
    }

    // Sets & Reps
    card.querySelector(".exercise-sets").textContent = `${sets} ${labels.sets}`;
    card.querySelector(".exercise-reps").textContent = `${reps} ${labels.reps}`;

    // Muscles
    const musclesEl = card.querySelector(".exercise-muscles");
    if (muscleGroups.length > 0) {
      musclesEl.innerHTML = `
                <span class="text-xs font-semibold text-gray-500 block mb-2">${
                  labels.muscles
                }</span>
                <div class="flex flex-wrap gap-2">
                    ${muscleGroups
                      .map(
                        (muscle) =>
                          `<span class="px-3 py-1 bg-primary/20 text-primaryText rounded-full text-xs font-medium uppercase">${muscle}</span>`
                      )
                      .join("")}
                </div>
            `;
    } else {
      musclesEl.remove();
    }

    // Equipment
    const equipmentEl = card.querySelector(".exercise-equipment");
    if (equipment.length > 0) {
      equipmentEl.innerHTML = `
                <span class="text-xs font-semibold text-gray-500 block mb-2">${
                  labels.equipments
                }</span>
                <div class="flex flex-wrap gap-2">
                    ${equipment
                      .map(
                        (item) =>
                          `<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">${item}</span>`
                      )
                      .join("")}
                </div>
            `;
    } else {
      equipmentEl.remove();
    }

    cardsContainer.appendChild(card);
  });

  // Create pagination dots
  exercises.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.onclick = () => scrollToExercise(i);
    dot.className = `exercise-dot w-2 h-2 rounded-full transition-all duration-300 ${
      i === 0 ? "bg-primary w-8" : "bg-gray-300 hover:bg-gray-400"
    }`;
    dot.setAttribute("data-index", i);
    dot.setAttribute("aria-label", `Go to exercise ${i + 1}`);
    dotsContainer.appendChild(dot);
  });

  // Append structure to container
  container.innerHTML = "";
  container.appendChild(structure);

  // Setup button handlers for authenticated users
  setupWorkoutButtons();

  // Reset slider to start position and initialize pagination
  const slider = document.getElementById("exerciseSlider");
  requestAnimationFrame(() => {
    slider.scrollLeft = 0;
    initializePagination();
  });
}

/**
 * Setup workout buttons with proper handlers based on auth status
 */
async function setupWorkoutButtons() {
  const isAuthenticated = await isUserAuthenticated();

  // Find the buttons in the rendered structure
  const addButton = document.querySelector(
    '#unauthWorkoutContainer button[title*="Add"]'
  );
  const favoriteButton = document.querySelector(
    '#unauthWorkoutContainer button[title*="Favorite"]'
  );

  if (!addButton || !favoriteButton) return;

  if (isAuthenticated) {
    // For authenticated users: use proper workout functions
    const workout = getTemporaryWorkout();
    if (!workout) return;

    // Prepare workout data with Muscles and Equipment from sessionStorage
    const workoutData = {
      WorkoutId: workout.WorkoutId,
      Name: workout.Name,
      Description: workout.Description,
      Muscles: workout.Muscles || [],
      Equipment: workout.Equipment || [],
      Exercises: workout.Exercises,
    };

    // Set data attributes on both buttons using utility function
    setWorkoutDataOnButton(addButton, workoutData);
    setWorkoutDataOnButton(favoriteButton, workoutData);

    // Setup Add to My Workouts button - use existing function
    addButton.onclick = (e) => addToMyWorkoutsDetails(e, addButton);

    // Setup Favorite button - use existing function
    favoriteButton.onclick = (e) =>
      toggleWorkoutFavoriteDetails(e, favoriteButton);
  }
  // For unauthenticated users, buttons already have onclick="showLoginModal()"
}
