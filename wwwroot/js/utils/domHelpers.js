/**
 * DOM Helper Utilities
 * General DOM manipulation functions
 */

/**
 * Toggle element visibility
 * {HTMLElement} element - Element to toggle
 * {boolean} show - Whether to show or hide
 */
function toggleElement(element, show) {
  if (!element) return;

  if (show) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}

/**
 * Set button loading state
 * {HTMLButtonElement} button - Button element
 * {boolean} loading - Whether button is loading
 */

function setButtonLoading(button, isLoading) {
  if (!button) return;

  const spinner = button.querySelector(".loading-spinner");
  const btnText = button.querySelector(".btn-text");

  button.disabled = isLoading;

  if (isLoading) {
    spinner.classList.remove("hidden");
    btnText.classList.add("opacity-0");
  } else {
    spinner.classList.add("hidden");
    btnText.classList.remove("opacity-0");
  }
}

/**
 * Create empty state HTML element
 * {Object} options - Configuration object
 * {string} options.icon - FontAwesome icon class (e.g., 'fa-heart')
 * {string} options.title - Main heading text
 * {string} options.description - Optional description HTML
 * {string} options.className - Optional additional CSS classes
 * returns {HTMLElement} - Empty state element
 */
function createEmptyState({ icon, title, description, className = "" }) {
  const emptyState = document.createElement("div");
  emptyState.className = `empty-state-message flex flex-col items-center justify-center text-center py-16 ${className}`;

  emptyState.innerHTML = `
        <div class="max-w-md mx-auto">
            <i class="fas ${icon} text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">${title}</h3>
            ${
              description
                ? `<p class="text-sm text-gray-500 mt-4">${description}</p>`
                : ""
            }
        </div>
    `;

  return emptyState;
}
