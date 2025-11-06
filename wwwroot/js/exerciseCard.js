
// Uses favoriteUtils.js and modalUtils.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize favorite buttons
    const favoriteButtons = document.querySelectorAll('button[data-id]');
    if (favoriteButtons.length) {
        favoriteButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                void toggleFavorite(event, this);
            });
        });
    }

    // Initialize login modal
    initializeLoginModal();
});
