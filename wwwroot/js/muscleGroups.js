// Special muscle groups that expand to multiple muscles
const SPECIAL_MUSCLE_GROUPS = {
  ALL: [
    "QUADRICEPS",
    "HAMSTRINGS",
    "GLUTES",
    "CHEST",
    "SHOULDERS",
    "TRICEPS",
    "BICEPS",
    "BACK_UPPER",
    "BACK_LOWER",
    "LATS",
    "CALVES",
    "ABDOMINALS",
    "FOREARMS",
    "CORE",
  ],
  ALL_UPPER: [
    "CHEST",
    "SHOULDERS",
    "TRICEPS",
    "BICEPS",
    "BACK_UPPER",
    "LATS",
    "ABDOMINALS",
    "FOREARMS",
    "CORE",
  ],
  ALL_LOWER: [
    "QUADRICEPS",
    "HAMSTRINGS",
    "GLUTES",
    "CALVES",
    "ADDUCTORS",
    "ABDUCTORS",
  ],
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

// Muscle Group Visualizer (Server-rendered version)
class MuscleGroupVisualizer {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.selectedMuscles = [];
    this.color = options.color || "22,96,121"; // RGB format - Secondary Purple
    void this.init();
  }

  async init() {
    if (!this.container) {
      console.error("Container not found");
      return;
    }

    // Form is already rendered by server, just attach event listeners
    this.attachEventListeners();
  }
  async updateImage() {
    const img = document.getElementById("muscleVisualizationImage");
    if (!img) return;

    const displayImageUrl = generateMuscleVisualizationUrl(
      this.selectedMuscles,
      this.color
    );

    // Preload new image before swapping
    const tempImg = new Image();
    tempImg.onload = () => {
      // Fade out current image
      img.style.opacity = "0";

      // After fade out, swap source and fade in
      setTimeout(() => {
        img.src = displayImageUrl;
        img.style.opacity = "1";
      }, 150);
    };

    tempImg.onerror = () => {
      console.error("Failed to load muscle image");
    };

    // Start preloading
    tempImg.src = displayImageUrl;
  }

  attachEventListeners() {
    const form = document.getElementById("workoutGeneratorForm");
    const muscleGroupsSelect = document.getElementById("muscleGroupsSelect");

    if (!form || !muscleGroupsSelect) {
      console.error("Form elements not found");
      return;
    }

    // Handle muscle group selection for visualization
    muscleGroupsSelect.addEventListener("change", (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (opt) => opt.value
      );
      const filtered = selectedOptions.filter((val) => val !== "any");

      // Expand special groups (ALL, ALL_UPPER, ALL_LOWER)
      this.selectedMuscles = expandMuscleGroups(filtered);
      void this.updateImage();
    });

    // Handle form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.generateWorkout();
    });
  }

  async generateWorkout() {
    const muscleGroupsSelect = document.getElementById("muscleGroupsSelect");
    const generateBtn = document.querySelector(".generate-btn");
    const loadingState = document.querySelector(".loading-state");
    const errorMessage = document.querySelector(".error-message");
    const workoutResults = document.querySelector(".workout-results");

    const selectedMuscleGroups = Array.from(muscleGroupsSelect.selectedOptions)
      .map((opt) => opt.value)
      .filter((m) => m !== "any");

    const description = await getFullDescription();

    // Show loading state
    setButtonLoading(generateBtn, true);
    toggleElement(loadingState, true);
    toggleElement(errorMessage, false);
    toggleElement(workoutResults, false);

    try {
      const workout = await generateWorkout({
        muscleGroups: selectedMuscleGroups,
        equipment: ["any"],
        description: description,
      });

      await this.displayWorkout(workout);
    } catch (error) {
      console.error("Error generating workout:", error);
        errorMessage.textContent = `Failed to generate workout: ${error.message}. Please try again.`;
        //Removed toggleElement moved loadin spinner for workout generator into button so removed generatgin workout text
        //toggleElement(errorMessage, true);

    } finally {
        setButtonLoading(generateBtn, false);
        //toggleElement(errorMessage, true);

    }
  }

  /**
   * Display generated workout
   */
  async displayWorkout(workout) {
    const workoutResults = document.querySelector(".workout-results");
    const workoutContent = document.querySelector(".workout-content");

    // Check if user is authenticated
    const isAuthenticated = await isUserAuthenticated();

    // Get localized texts from data attributes (provided by backend)
    const section = document.querySelector("section[data-exercises-text]");
    const exercisesText = section?.dataset.exercisesText;
    const visualizationTitle = section?.dataset.visualizationTitle;
    const musclesLabel = section?.dataset.musclesLabel;
    const equipmentLabel = section?.dataset.equipmentLabel;
    const toastAddToFavorites = section?.dataset.toastAddToFavorites;
    const toastRemoveFromFavorites = section?.dataset.toastRemoveFromFavorites;
    const toastAddToMyWorkouts = section?.dataset.toastAddToMyWorkouts;
    const toastRemoveFromMyWorkouts = section?.dataset.toastRemoveFromMyWorkouts;

    // Collect all unique muscles and equipment from all exercises
    const allMuscles = [
      ...new Set(workout.exercises.flatMap((ex) => ex.muscleGroups || [])),
    ];
    const allEquipment = [
      ...new Set(workout.exercises.flatMap((ex) => ex.equipment || [])),
    ];

    const muscleVisualizationHTML =
      this.generateMuscleVisualization(allMuscles);
    const exercisesJson = JSON.stringify(workout.exercises).replace(
      /"/g,
      "&quot;"
    );
    const workoutId = workout.id || Date.now().toString();

    // Save workout to sessionStorage immediately after generated workout
    const workoutData = {
      WorkoutId: workoutId,
      Name: workout.name,
      Description: workout.description,
      Muscles: allMuscles,
      Equipment: allEquipment,
      Exercises: workout.exercises,
    };
    saveTemporaryWorkout(workoutData);

    // Generate action buttons HTML only for authenticated users
    const actionButtonsHTML = isAuthenticated
      ? `
            <div class="absolute top-4 right-4 flex gap-2 z-10">
                <button type="button"
                        class="text-gray-400 hover:text-primary focus:outline-none text-2xl add-to-my-workouts-btn"
                        data-workout-id="${workoutId}"
                        data-workout-name="${workout.name}"
                        data-workout-description="${workout.description}"
                        data-workout-muscles="${allMuscles.join(",")}"
                        data-workout-equipment="${allEquipment.join(",")}"
                        data-workout-exercises="${exercisesJson}"
                        data-toast-add-to-my-workouts="${toastAddToMyWorkouts}"
                        data-toast-remove-from-my-workouts="${toastRemoveFromMyWorkouts}"
                        onclick="addToMyWorkouts(event, this)"
                        title="Add to My Workouts">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <button type="button"
                        class="text-gray-400 hover:text-red-500 focus:outline-none text-2xl"
                        data-workout-id="${workoutId}"
                        data-workout-name="${workout.name}"
                        data-workout-description="${workout.description}"
                        data-workout-muscles="${allMuscles.join(",")}"
                        data-workout-equipment="${allEquipment.join(",")}"
                        data-workout-exercises="${exercisesJson}"
                        data-toast-add-to-favorites="${toastAddToFavorites}"
                        data-toast-remove-from-favorites="${toastRemoveFromFavorites}"
                        onclick="toggleWorkoutFavorite(event, this)"
                        title="Add to Favorites">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
        `
      : "";

    // Create workout card HTML using same structure as _WorkoutCard.cshtml
    workoutContent.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-shadow duration-300 cursor-pointer hover:shadow-md workout-card w-full" 
                 data-workout-id="${workoutId}"
                 data-workout-muscles="${allMuscles.join(",")}"
                 data-workout-equipment="${allEquipment.join(",")}"
                 onclick="navigateToWorkoutDetail('${workoutId}')">
                <!-- Workout Card Header -->
                <div class="relative p-6 bg-neutral-100 h-[200px] flex flex-col">
                    ${actionButtonsHTML}
                    
                    <h4 class="text-2xl font-bold text-gray-900 mb-2 ${
                      isAuthenticated ? "pr-20" : ""
                    } line-clamp-2">${workout.name}</h4>
                    <p class="text-gray-600 text-sm flex-1 line-clamp-3">${
                      workout.description
                    }</p>
                    
                    <div class="mt-auto flex items-center gap-2 text-sm text-gray-500">
                        <i class="fa-solid fa-dumbbell"></i>
                        <span>${
                          workout.exercises.length
                        } ${exercisesText.toLowerCase()}</span>
                    </div>
                </div>

                <!-- Targeted Muscles Visualization -->
                <div class="p-6 bg-white border-t border-gray-100">
                    <h5 class="text-sm font-semibold text-gray-700 mb-3">${visualizationTitle}</h5>
                    ${muscleVisualizationHTML}
                </div>

                <!-- Muscles & Equipment Tags -->
                <div class="p-6 space-y-4 border-t border-gray-100">
                    <div>
                        <span class="text-xs font-semibold text-gray-500 block mb-2">${musclesLabel}</span>
                        <div class="flex flex-wrap gap-2">
                            ${allMuscles
                              .map(
                                (muscle) => `
                                <span class="px-3 py-1 bg-primary/20 text-primaryText rounded-full text-xs font-medium uppercase">${muscle}</span>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <div>
                        <span class="text-xs font-semibold text-gray-500 block mb-2">${equipmentLabel}</span>
                        <div class="flex flex-wrap gap-2">
                            ${allEquipment
                              .map(
                                (eq) => `
                                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">${eq}</span>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;

    workoutResults.classList.remove("hidden");
    workoutResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /**
   * Generate muscle visualization using existing API
   * Array of muscle names
   * Returns HTML string with muscle visualization
   */
  generateMuscleVisualization(muscles) {
    const imageUrl = generateMuscleVisualizationUrl(muscles);

    return `
            <div class="flex justify-center">
                <img src="${imageUrl}" 
                     alt="Targeted muscles visualization" 
                     class="w-full h-auto mx-auto"
                     style="max-width: 200px;" />
            </div>
        `;
  }
}

// toggleWorkoutFavorite, addToMyWorkouts, and removeFromMyWorkouts
// are defined in workoutCard.js and available globally

const userForm = document.querySelector("#userDetailsForm");
const userInputSection = document.querySelector("#userInputSection");
const visualizerDiv = document.querySelector("#visualizerSection");

let memberDetails = null;

// Only run on WorkoutGenerator page
if (visualizerDiv) {
  // get members data only if user is authenticated
  (async () => {
    const isAuthenticated = await isUserAuthenticated();

    if (isAuthenticated) {
      memberDetails = await getMemberDetails();

      if (!userForm && memberDetails) {
        const fullDescription = await getFullDescription();
        showVisualizer(fullDescription);
      }
    }
  })();
}

// if user is not logged in or has not filled out the form, use the text in the form
async function getFullDescription() {
  const promptTextarea = document.querySelector("#promptTextarea");
  const description = promptTextarea?.value.trim() || "";

  let storedAge = memberDetails?.Age;
  let storedGender = memberDetails?.Gender;
  let storedWeight = memberDetails?.Weight;
  let storedHeight = memberDetails?.Height;

  const ageInput = document.querySelector("#userAgeInput");
  const genderInput = document.querySelector("#userGenderInput");
  const weightInput = document.querySelector("#userWeightInput");
  const heightInput = document.querySelector("#userHeightInput");

  if (ageInput?.value) storedAge = parseInt(ageInput.value, 10);
  if (genderInput?.value) storedGender = genderInput.value;
  if (weightInput?.value) storedWeight = parseFloat(weightInput.value);
  if (heightInput?.value) storedHeight = parseFloat(heightInput.value);

  const parts = [];
  if (storedAge) parts.push(`${storedAge} years old`);
  if (storedGender) parts.push(storedGender);
  if (storedWeight) parts.push(`weighs ${storedWeight}kg`);
  if (storedHeight) parts.push(`is ${storedHeight}cm tall`);

  const prefix = parts.length ? `The user is ${parts.join(", ")}. ` : "";
  return prefix + description;
}

function showVisualizer(fullDescription) {
  // Show visualizer before initializing (element needs to be visible)
  if (visualizerDiv) visualizerDiv.style.display = "block";
  if (userInputSection) userInputSection.style.display = "none";

  // Wait for next tick to ensure DOM is ready
  setTimeout(() => {
    new MuscleGroupVisualizer("[data-muscle-visualizer]", {
      description: fullDescription,
    });
  }, 0);
}

if (userForm) {
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ageInput = document.querySelector("#userAgeInput");
    const genderInput = document.querySelector("#userGenderInput");
    const weightInput = document.querySelector("#userWeightInput");
    const heightInput = document.querySelector("#userHeightInput");

    const details = {
      Age: parseInt(ageInput.value, 10),
      Gender: genderInput.value,
      Weight: parseFloat(weightInput.value),
      Height: parseFloat(heightInput.value),
    };

    // Save to sessionStorage for unauthenticated users (will be saved to DB after signup)
    try {
      sessionStorage.setItem("tempUserProfile", JSON.stringify(details));
    } catch (err) {
      console.error("Error saving to sessionStorage:", err);
    }

    try {
      const res = await saveMemberDetails(details);
      if (res.ok) memberDetails = details;
    } catch (err) {
      console.error("Error saving member details:", err);
    }
    const fullDescription = await getFullDescription();
    showVisualizer(fullDescription);
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const visualizer = document.querySelector("[data-muscle-visualizer]");
  if (visualizer) {
    new MuscleGroupVisualizer("[data-muscle-visualizer]");
  }
});
