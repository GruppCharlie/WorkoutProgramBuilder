/**
 * Toast Notification Utility
 * Shows temporary notification messages
 */

/**
 * Show a toast notification
 * {string} message - The message to display
 * {string} type - Toast type: 'success', 'error', 'info', 'warning'
 * {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    
    // Base classes
    const baseClasses = 'fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
    
    // Type-specific classes
    const typeClasses = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-gray-900'
    };
    
    toast.className = `${baseClasses} ${typeClasses[type] || typeClasses.success}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Show success toast
 * {string} message - Success message
 */
function showSuccessToast(message) {
    showToast(message, 'success');
}

/**
 * Show error toast
 * {string} message - Error message
 */
function showErrorToast(message) {
    showToast(message, 'error');
}

/**
 * Show info toast
 * {string} message - Info message
 */
function showInfoToast(message) {
    showToast(message, 'info');
}

/**
 * Show warning toast
 * {string} message - Warning message
 */
function showWarningToast(message) {
    showToast(message, 'warning');
}
