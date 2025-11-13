// Modal utility functions

/**
 * Show login modal and update links with return URL
 */
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        // Get current URL for return after login
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        
        // Update login and signup links with returnUrl
        const loginLink = loginModal.querySelector('a[href*="login"]');
        const signupLink = loginModal.querySelector('a[href*="signup"]');
        
        if (loginLink) {
            const loginUrl = new URL(loginLink.href, window.location.origin);
            loginUrl.searchParams.set('returnUrl', returnUrl);
            loginLink.href = loginUrl.toString();
        }
        
        if (signupLink) {
            const signupUrl = new URL(signupLink.href, window.location.origin);
            signupUrl.searchParams.set('returnUrl', returnUrl);
            signupLink.href = signupUrl.toString();
        }
        
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
