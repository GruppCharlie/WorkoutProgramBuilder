/**
 * Exercise Card Interactions
 * Handles favorite button clicks for exercise cards
 * Depends on: favoriteUtils.js, modalUtils.js
 */
document.querySelectorAll('button[data-id][data-title][data-gifurl]').forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        void toggleFavorite(event, button);
    });
});
