// Modal utility functions

/**
 * Show login modal
 */
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }
}

/**
 * Hide login modal
 */
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

/**
 * Initialize login modal event listeners
 */
function initializeLoginModal() {
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginModal = document.getElementById('loginModal');

    if (closeLoginModal && loginModal) {
        closeLoginModal.addEventListener('click', hideLoginModal);
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                hideLoginModal();
            }
        });
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', initializeLoginModal);
