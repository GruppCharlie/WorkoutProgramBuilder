/**
 * Exercise Card Interactions
 * Handles favorite button clicks for exercise cards
 * Depends on: favoriteUtils.js, modalUtils.js
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize favorite buttons - more specific selector
    const favoriteButtons = document.querySelectorAll('button[data-id][data-title][data-gifurl]');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            void toggleFavorite(event, button);
        });
    });
});
