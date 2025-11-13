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
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

/**
 * Set button loading state
 * {HTMLButtonElement} button - Button element
 * {boolean} loading - Whether button is loading
 */
function setButtonLoading(button, loading) {
    if (!button) return;

    button.disabled = loading;
    if (loading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }
        button.textContent = 'Loading...';
    } else {
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}
