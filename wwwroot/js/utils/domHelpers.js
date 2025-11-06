/**
 * DOM Helper Utilities
 * Reusable DOM manipulation functions
 */

/**
 * Create loading spinner HTML
 * {string} message - Loading message
 * returns {string} HTML string
 */
function createLoadingSpinner(message = 'Loading...') {
    return `
        <div class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-neutral-600">${message}</p>
        </div>
    `;
}

/**
 * Create error message HTML
 * {string} message - Error message
 * returns {string} HTML string
 */
function createErrorMessage(message) {
    return `
        <div class="text-center py-12">
            <p class="text-red-600">${message}</p>
        </div>
    `;
}

/**
 * Toggle element visibility
 * {HTMLElement} element - Element to toggle
 * {boolean} show - Show or hide
 */
function toggleElement(element, show) {
    if (!element) return;
    
    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

/**
 * Set button loading state
 * {HTMLButtonElement} button - Button element
 * {boolean} loading - Loading state
 */
function setButtonLoading(button, loading) {
    if (!button) return;
    
    button.disabled = loading;
    if (loading) {
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
    }
}
