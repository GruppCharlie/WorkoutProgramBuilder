
/**
 * DOM Helper Utilities
 * Reusable DOM manipulation functions
 * Toggle element visibility
 * {HTMLElement} element - Element to toggle
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
